"""
MONITOREO DE OPERARIOS (app móvil -> sistema web)
=================================================
La app TECHDITO manda, por lotes, la ubicación del celular del operario y el
estado del equipo (batería, GPS, red). Aquí se guarda y se sirve al módulo web
"Monitoreo": mapa en vivo, recorrido por fecha (con paradas) y modo robo.

Tablas (se crean solas la primera vez; también está el script SQL):
  - ubicacion_operario : un punto por fila (usuario, fecha_hora, lat, lon, ...)
  - estado_dispositivo : última situación de cada celular (para el mapa en vivo)

Rutas para la APP (sin cookie de sesión: usan un pase firmado):
  POST /api/movil/monitoreo/sesion   {user, password, modelo} -> {token}
  POST /api/movil/monitoreo/enviar   Bearer <token>  {dispositivo, puntos, ahora}
Rutas para la WEB (sesión iniciada + permiso de monitoreo):
  GET  /api/monitoreo/en_vivo
  GET  /api/monitoreo/recorrido?usuario=ID&fecha=AAAA-MM-DD
  POST /api/monitoreo/alerta         {usuario, activa}
"""
import hashlib
import logging
import math
import time
import traceback
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

from flask import jsonify, request, session

log = logging.getLogger(__name__)
LIMA = ZoneInfo("America/Lima")

CFG_MONITOREO = {
    "TOKEN_DIAS": 120,             # el pase del celular dura esto (se renueva en cada inicio de sesión)
    "MAX_PUNTOS_POR_ENVIO": 800,
    "MAX_DIAS_ATRAS": 10,          # puntos más viejos que esto (guardados sin señal) se descartan
    "RETENCION_DIAS": 180,         # los recorridos más antiguos se borran solos
    "EN_LINEA_MIN": 6,             # contacto hace menos de esto = "en línea"
    "SIN_SENAL_MIN": 20,           # sin contacto por más de esto = "sin señal"
    "BATERIA_BAJA": 15,            # %
    "INTERVALO_S": 60,             # cada cuánto registra el celular en movimiento
    "INTERVALO_ALERTA_S": 20,      # cada cuánto registra cuando está marcado como robado/perdido
    "PARADA_RADIO_M": 70,          # para detectar paradas en el recorrido
    "PARADA_MIN": 8,
    "PRECISION_MAX_M": 150,        # puntos con peor precisión no suman distancia
    # Quién ve el módulo (además de no ser operario):
    "ROLES": ("ADMIN", "SUPERV", "JEFE", "GEREN", "COORD"),   # el rol CONTIENE alguna de estas
    "USUARIOS_EXTRA": (),          # p. ej. ("julio",) para dar acceso a un usuario puntual
    "USUARIOS_PREFIJOS": ("sup_",),
}


# =============================================================================
#  FUNCIONES PURAS (sin base de datos)
# =============================================================================
def distancia_m(lat1, lon1, lat2, lon2):
    r = 6371000.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp = p2 - p1
    dl = math.radians(lon2 - lon1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * r * math.asin(min(1.0, math.sqrt(a)))


def ahora_lima():
    return datetime.now(LIMA).replace(tzinfo=None)


def ms_a_lima(ms):
    return datetime.fromtimestamp(ms / 1000.0, LIMA).replace(tzinfo=None, microsecond=0)


def _num(v, minimo=None, maximo=None):
    try:
        x = float(v)
    except (TypeError, ValueError):
        return None
    if math.isnan(x) or math.isinf(x):
        return None
    if minimo is not None and x < minimo:
        return None
    if maximo is not None and x > maximo:
        return None
    return x


def limpiar_puntos(puntos, ahora_servidor_ms, ahora_celular_ms=None, cfg=CFG_MONITOREO):
    """
    Valida los puntos que manda el celular y corrige su hora si el reloj del
    celular está desfasado (> 2 min) respecto del servidor.
    Devuelve [{fecha_hora, lat, lon, precision_m, velocidad, bateria}] sin repetidos.
    """
    desfase = 0.0
    if ahora_celular_ms:
        d = float(ahora_servidor_ms) - float(ahora_celular_ms)
        if abs(d) > 120000:
            desfase = d
    minimo = ahora_servidor_ms - cfg["MAX_DIAS_ATRAS"] * 86400000
    maximo = ahora_servidor_ms + 10 * 60000
    salida, vistos = [], set()
    for p in (puntos or [])[:cfg["MAX_PUNTOS_POR_ENVIO"]]:
        if not isinstance(p, dict):
            continue
        t = _num(p.get("t"))
        lat = _num(p.get("lat"), -90, 90)
        lon = _num(p.get("lon"), -180, 180)
        if t is None or lat is None or lon is None or (lat == 0 and lon == 0):
            continue
        t += desfase
        if t < minimo or t > maximo:
            continue
        fh = ms_a_lima(t)
        if fh in vistos:
            continue
        vistos.add(fh)
        bat = _num(p.get("bat"), 0, 100)
        salida.append({
            "fecha_hora": fh,
            "lat": round(lat, 7),
            "lon": round(lon, 7),
            "precision_m": _num(p.get("acc"), 0, 100000),
            "velocidad": _num(p.get("vel"), 0, 120),
            "bateria": int(bat) if bat is not None else None,
        })
    salida.sort(key=lambda x: x["fecha_hora"])
    return salida


def resumen_recorrido(puntos, cfg=CFG_MONITOREO):
    """
    puntos: [{fecha_hora, lat, lon, precision_m, bateria}] ordenados por hora.
    Devuelve distancia, paradas (quieto >= PARADA_MIN minutos en un radio) y
    tramos, más mínimos/máximos de batería.
    """
    if not puntos:
        return {"distancia_km": 0, "paradas": [], "puntos": 0, "inicio": None, "fin": None,
                "bateria_min": None, "bateria_max": None, "minutos_en_movimiento": 0,
                "minutos_detenido": 0}
    prec_max = cfg["PRECISION_MAX_M"]
    radio = cfg["PARADA_RADIO_M"]
    minutos_parada = cfg["PARADA_MIN"]

    # Distancia: solo entre puntos con buena precisión y sin saltos imposibles (> 45 m/s)
    dist = 0.0
    ultimo = None
    for p in puntos:
        if p.get("precision_m") is not None and p["precision_m"] > prec_max:
            continue
        if ultimo is not None:
            d = distancia_m(ultimo["lat"], ultimo["lon"], p["lat"], p["lon"])
            seg = (p["fecha_hora"] - ultimo["fecha_hora"]).total_seconds()
            if seg > 0 and d / seg <= 45 and d >= 8:      # < 8 m es ruido del GPS
                dist += d
        ultimo = p

    # Paradas: grupos seguidos de puntos dentro de un radio, que duran lo suficiente
    paradas = []
    i, n = 0, len(puntos)
    while i < n:
        a = puntos[i]
        j = i + 1
        sum_lat, sum_lon, k = a["lat"], a["lon"], 1
        while j < n:
            c_lat, c_lon = sum_lat / k, sum_lon / k
            if distancia_m(c_lat, c_lon, puntos[j]["lat"], puntos[j]["lon"]) > radio:
                break
            sum_lat += puntos[j]["lat"]
            sum_lon += puntos[j]["lon"]
            k += 1
            j += 1
        desde, hasta = a["fecha_hora"], puntos[j - 1]["fecha_hora"]
        # si el siguiente punto llegó mucho después (celular quieto manda poco), la parada dura hasta ahí
        minutos = (hasta - desde).total_seconds() / 60.0
        if minutos >= minutos_parada:
            paradas.append({
                "lat": round(sum_lat / k, 7), "lon": round(sum_lon / k, 7),
                "desde": desde.strftime("%H:%M"), "hasta": hasta.strftime("%H:%M"),
                "minutos": int(round(minutos)), "i_desde": i, "i_hasta": j - 1,
            })
            i = j
        else:
            i += 1

    inicio, fin = puntos[0]["fecha_hora"], puntos[-1]["fecha_hora"]
    total_min = (fin - inicio).total_seconds() / 60.0
    detenido = sum(p["minutos"] for p in paradas)
    bats = [p["bateria"] for p in puntos if p.get("bateria") is not None]
    return {
        "distancia_km": round(dist / 1000.0, 2),
        "paradas": paradas,
        "puntos": len(puntos),
        "inicio": inicio.strftime("%H:%M"),
        "fin": fin.strftime("%H:%M"),
        "bateria_min": min(bats) if bats else None,
        "bateria_max": max(bats) if bats else None,
        "minutos_detenido": int(round(detenido)),
        "minutos_en_movimiento": max(0, int(round(total_min - detenido))),
    }


def estado_conexion(ultimo_contacto, ahora, cfg=CFG_MONITOREO):
    if ultimo_contacto is None:
        return "sin_datos"
    minutos = (ahora - ultimo_contacto).total_seconds() / 60.0
    if minutos <= cfg["EN_LINEA_MIN"]:
        return "en_linea"
    if minutos <= cfg["SIN_SENAL_MIN"]:
        return "reciente"
    return "sin_senal"


def puede_monitorear(usuario, cfg=CFG_MONITOREO):
    """usuario: objeto Usuario (user, rol, tipousu) o None."""
    if usuario is None:
        return False
    if str(getattr(usuario, "tipousu", "") or "").strip().lower() == "operario":
        return False
    nombre = str(getattr(usuario, "user", "") or "").strip().lower()
    if nombre in {u.lower() for u in cfg["USUARIOS_EXTRA"]}:
        return True
    if nombre == "admin" or any(nombre.startswith(p) for p in cfg["USUARIOS_PREFIJOS"]):
        return True
    rol = str(getattr(usuario, "rol", "") or "").upper()
    return any(r in rol for r in cfg["ROLES"])


def huella_clave(usuario):
    return hashlib.sha1(str(getattr(usuario, "contraseña", "") or "").encode("utf-8")).hexdigest()[:12]


# =============================================================================
#  REGISTRO EN LA APP FLASK
# =============================================================================
def registrar_monitoreo(app, db, Usuario, cfg=None):
    from itsdangerous import URLSafeTimedSerializer, BadSignature
    from sqlalchemy import text
    from sqlalchemy.exc import SQLAlchemyError
    try:
        from flask_bcrypt import check_password_hash
    except ImportError:                                     # pragma: no cover
        from werkzeug.security import check_password_hash

    conf = dict(CFG_MONITOREO)
    if cfg:
        conf.update(cfg)
    firmador = URLSafeTimedSerializer(app.secret_key, salt="techdito-monitoreo")

    # ------------------------------------------------------------------ tablas
    class UbicacionOperario(db.Model):
        __tablename__ = "ubicacion_operario"
        __table_args__ = (db.UniqueConstraint("id_usuario", "fecha_hora", name="uq_ubic_usuario_fecha"),
                          db.Index("ix_ubic_fecha", "fecha_hora"))
        id = db.Column(db.BigInteger().with_variant(db.Integer, "sqlite"), primary_key=True, autoincrement=True)
        id_usuario = db.Column(db.Integer, nullable=False)
        fecha_hora = db.Column(db.DateTime, nullable=False)
        lat = db.Column(db.Float(53), nullable=False)
        lon = db.Column(db.Float(53), nullable=False)
        precision_m = db.Column(db.Float, nullable=True)
        velocidad = db.Column(db.Float, nullable=True)
        bateria = db.Column(db.SmallInteger, nullable=True)
        recibido = db.Column(db.DateTime, nullable=True)

    class EstadoDispositivo(db.Model):
        __tablename__ = "estado_dispositivo"
        id_usuario = db.Column(db.Integer, primary_key=True, autoincrement=False)
        ultimo_contacto = db.Column(db.DateTime, nullable=True)
        fecha_ubicacion = db.Column(db.DateTime, nullable=True)
        lat = db.Column(db.Float(53), nullable=True)
        lon = db.Column(db.Float(53), nullable=True)
        precision_m = db.Column(db.Float, nullable=True)
        velocidad = db.Column(db.Float, nullable=True)
        bateria = db.Column(db.SmallInteger, nullable=True)
        cargando = db.Column(db.Boolean, nullable=True)
        gps_activo = db.Column(db.Boolean, nullable=True)
        red = db.Column(db.String(20), nullable=True)
        version_app = db.Column(db.String(30), nullable=True)
        modelo = db.Column(db.String(80), nullable=True)
        alerta = db.Column(db.Boolean, nullable=False, default=False)
        alerta_desde = db.Column(db.DateTime, nullable=True)
        alerta_por = db.Column(db.String(80), nullable=True)

    estado_tablas = {"ok": False}
    limpieza = {"ultima": 0.0}

    def asegurar_tablas():
        if estado_tablas["ok"]:
            return True
        try:
            UbicacionOperario.__table__.create(bind=db.engine, checkfirst=True)
            EstadoDispositivo.__table__.create(bind=db.engine, checkfirst=True)
            estado_tablas["ok"] = True
        except Exception:
            log.exception("Monitoreo: no se pudieron crear/verificar las tablas")
        return estado_tablas["ok"]

    def insertar_puntos(id_usuario, filas, recibido):
        if not filas:
            return
        tabla = UbicacionOperario.__table__
        sentencia = tabla.insert()
        dialecto = db.engine.dialect.name
        if dialecto in ("mysql", "mariadb"):
            sentencia = sentencia.prefix_with("IGNORE")
        elif dialecto == "sqlite":
            sentencia = sentencia.prefix_with("OR IGNORE")
        datos = [dict(f, id_usuario=id_usuario, recibido=recibido) for f in filas]
        db.session.execute(sentencia, datos)

    def limpiar_antiguos():
        if time.time() - limpieza["ultima"] < 6 * 3600:
            return
        limpieza["ultima"] = time.time()
        limite = ahora_lima() - timedelta(days=int(conf["RETENCION_DIAS"]))
        try:
            if db.engine.dialect.name in ("mysql", "mariadb"):
                db.session.execute(text("DELETE FROM ubicacion_operario WHERE fecha_hora < :l LIMIT 50000"),
                                   {"l": limite})
            else:
                db.session.execute(text("DELETE FROM ubicacion_operario WHERE fecha_hora < :l"), {"l": limite})
            db.session.commit()
        except SQLAlchemyError:
            db.session.rollback()
            log.exception("Monitoreo: no se pudieron borrar los recorridos antiguos")

    def usuario_web():
        uid = session.get("user_id")
        if not uid:
            return None
        try:
            return Usuario.query.get(uid)
        except Exception:
            db.session.rollback()
            return None

    def usuario_movil():
        cab = request.headers.get("Authorization") or ""
        token = cab[7:].strip() if cab[:7].lower() == "bearer " else ""
        if not token:
            return None
        try:
            datos = firmador.loads(token, max_age=int(conf["TOKEN_DIAS"]) * 86400)
        except BadSignature:
            return None
        try:
            u = Usuario.query.get(int(datos.get("u")))
        except Exception:
            db.session.rollback()
            return None
        if u is None or datos.get("h") != huella_clave(u):
            return None
        return u

    def nombre_de(u):
        emp = getattr(u, "empleado", None)
        if emp is not None:
            n = ("%s %s" % (emp.nombres or "", emp.apellidos or "")).strip()
            if n:
                return n.title()
        return u.user or ("Usuario %s" % u.id_usuario)

    def sin_permiso():
        return jsonify({"success": False, "error": "No tienes permiso para ver el monitoreo."}), 403

    @app.context_processor
    def _contexto_monitoreo():
        try:
            return {"puede_monitoreo": puede_monitorear(usuario_web(), conf)}
        except Exception:
            return {"puede_monitoreo": False}

    # ------------------------------------------------------------------ APP
    @app.route("/api/movil/monitoreo/sesion", methods=["POST"])
    def monitoreo_movil_sesion():
        try:
            datos = request.get_json(silent=True) or {}
            nombre = str(datos.get("user") or "").strip()
            clave = str(datos.get("password") or "")
            if not nombre or not clave:
                return jsonify({"success": False, "error": "Falta el usuario o la contraseña."}), 400
            u = Usuario.query.filter_by(user=nombre).first()
            valido = False
            if u is not None and u.contraseña:
                try:
                    valido = check_password_hash(u.contraseña, clave)
                except Exception:
                    valido = False
            if not valido:
                return jsonify({"success": False, "error": "Usuario o contraseña incorrectos."}), 401
            asegurar_tablas()
            token = firmador.dumps({"u": u.id_usuario, "h": huella_clave(u)})
            log.info("[MONITOREO] pase de ubicación entregado a %s (id %s)", u.user, u.id_usuario)
            return jsonify({"success": True, "token": token, "user_id": u.id_usuario,
                            "intervalo": int(conf["INTERVALO_S"])}), 200
        except Exception:
            db.session.rollback()
            log.error("Monitoreo: error entregando el pase:\n%s", traceback.format_exc())
            return jsonify({"success": False, "error": "No se pudo activar el monitoreo."}), 500

    @app.route("/api/movil/monitoreo/enviar", methods=["POST"])
    def monitoreo_movil_enviar():
        u = usuario_movil()
        if u is None:
            return jsonify({"success": False, "sesion": False,
                            "error": "Pase vencido: inicia sesión de nuevo en la app."}), 401
        if not asegurar_tablas():
            return jsonify({"success": False, "error": "El servidor no tiene listas las tablas."}), 503
        try:
            datos = request.get_json(silent=True) or {}
            ahora = ahora_lima()
            ahora_ms = time.time() * 1000.0
            filas = limpiar_puntos(datos.get("puntos"), ahora_ms, _num(datos.get("ahora")), conf)
            insertar_puntos(u.id_usuario, filas, ahora)

            disp = datos.get("dispositivo") if isinstance(datos.get("dispositivo"), dict) else {}
            est = EstadoDispositivo.query.get(u.id_usuario)
            if est is None:
                est = EstadoDispositivo(id_usuario=u.id_usuario, alerta=False)
                db.session.add(est)
            est.ultimo_contacto = ahora
            bat = _num(disp.get("bateria"), 0, 100)
            if bat is not None:
                est.bateria = int(bat)
            if "cargando" in disp:
                est.cargando = bool(disp.get("cargando"))
            if "gps" in disp:
                est.gps_activo = bool(disp.get("gps"))
            for campo, clave, largo in (("red", "red", 20), ("version_app", "version", 30), ("modelo", "modelo", 80)):
                v = disp.get(clave)
                if v not in (None, ""):
                    setattr(est, campo, str(v)[:largo])
            if filas:
                ult = filas[-1]
                if est.fecha_ubicacion is None or ult["fecha_hora"] >= est.fecha_ubicacion:
                    est.fecha_ubicacion = ult["fecha_hora"]
                    est.lat, est.lon = ult["lat"], ult["lon"]
                    est.precision_m, est.velocidad = ult["precision_m"], ult["velocidad"]
            alerta = bool(est.alerta)
            db.session.commit()
            limpiar_antiguos()
            return jsonify({
                "success": True, "recibidos": len(filas), "alerta": alerta,
                "intervalo": int(conf["INTERVALO_ALERTA_S"] if alerta else conf["INTERVALO_S"]),
            }), 200
        except Exception:
            db.session.rollback()
            log.error("Monitoreo: error guardando ubicaciones de %s:\n%s", u.user, traceback.format_exc())
            return jsonify({"success": False, "error": "No se pudo guardar la ubicación."}), 500

    # ------------------------------------------------------------------ WEB
    @app.route("/api/monitoreo/en_vivo", methods=["GET"])
    def monitoreo_en_vivo():
        yo = usuario_web()
        if yo is None:
            return jsonify({"success": False, "error": "Sesión expirada. Inicia sesión nuevamente."}), 401
        if not puede_monitorear(yo, conf):
            return sin_permiso()
        if not asegurar_tablas():
            return jsonify({"success": False, "error": "No se pudieron preparar las tablas de monitoreo."}), 500
        try:
            ahora = ahora_lima()
            estados = EstadoDispositivo.query.all()
            ids = [e.id_usuario for e in estados]
            usuarios = {x.id_usuario: x for x in Usuario.query.filter(Usuario.id_usuario.in_(ids)).all()} if ids else {}
            salida = []
            for e in estados:
                u = usuarios.get(e.id_usuario)
                if u is None:
                    continue
                salida.append({
                    "id": e.id_usuario,
                    "nombre": nombre_de(u),
                    "usuario": u.user,
                    "lat": e.lat, "lon": e.lon,
                    "precision_m": e.precision_m,
                    "velocidad": e.velocidad,
                    "fecha_ubicacion": e.fecha_ubicacion.strftime("%Y-%m-%d %H:%M:%S") if e.fecha_ubicacion else None,
                    "hace_ubicacion_s": int((ahora - e.fecha_ubicacion).total_seconds()) if e.fecha_ubicacion else None,
                    "ultimo_contacto": e.ultimo_contacto.strftime("%Y-%m-%d %H:%M:%S") if e.ultimo_contacto else None,
                    "hace_contacto_s": int((ahora - e.ultimo_contacto).total_seconds()) if e.ultimo_contacto else None,
                    "estado": estado_conexion(e.ultimo_contacto, ahora, conf),
                    "bateria": e.bateria, "cargando": bool(e.cargando),
                    "gps": e.gps_activo, "red": e.red, "version": e.version_app, "modelo": e.modelo,
                    "alerta": bool(e.alerta),
                    "alerta_desde": e.alerta_desde.strftime("%Y-%m-%d %H:%M") if e.alerta_desde else None,
                })
            salida.sort(key=lambda x: (not x["alerta"], x["estado"] != "en_linea", x["nombre"]))
            return jsonify({"success": True, "ahora": ahora.strftime("%Y-%m-%d %H:%M:%S"),
                            "bateria_baja": int(conf["BATERIA_BAJA"]), "operarios": salida}), 200
        except Exception:
            db.session.rollback()
            log.error("Monitoreo en vivo:\n%s", traceback.format_exc())
            return jsonify({"success": False, "error": "No se pudo leer el monitoreo."}), 500

    @app.route("/api/monitoreo/recorrido", methods=["GET"])
    def monitoreo_recorrido():
        yo = usuario_web()
        if yo is None:
            return jsonify({"success": False, "error": "Sesión expirada. Inicia sesión nuevamente."}), 401
        if not puede_monitorear(yo, conf):
            return sin_permiso()
        if not asegurar_tablas():
            return jsonify({"success": False, "error": "No se pudieron preparar las tablas de monitoreo."}), 500
        try:
            uid = int(request.args.get("usuario") or 0)
            dia = datetime.strptime((request.args.get("fecha") or ahora_lima().strftime("%Y-%m-%d"))[:10], "%Y-%m-%d")
        except ValueError:
            return jsonify({"success": False, "error": "Operario o fecha no válidos."}), 400
        try:
            filas = (UbicacionOperario.query
                     .filter(UbicacionOperario.id_usuario == uid,
                             UbicacionOperario.fecha_hora >= dia,
                             UbicacionOperario.fecha_hora < dia + timedelta(days=1))
                     .order_by(UbicacionOperario.fecha_hora).all())
            puntos = [{"fecha_hora": f.fecha_hora, "lat": f.lat, "lon": f.lon,
                       "precision_m": f.precision_m, "velocidad": f.velocidad, "bateria": f.bateria}
                      for f in filas]
            resumen = resumen_recorrido(puntos, conf)
            # días con datos en el último mes (para el calendario)
            desde = dia - timedelta(days=31)
            dias = db.session.execute(
                text("SELECT DISTINCT DATE(fecha_hora) FROM ubicacion_operario "
                     "WHERE id_usuario = :u AND fecha_hora >= :d AND fecha_hora < :h"),
                {"u": uid, "d": desde, "h": dia + timedelta(days=32)}).fetchall()
            return jsonify({
                "success": True, "usuario": uid, "fecha": dia.strftime("%Y-%m-%d"),
                "puntos": [{"t": p["fecha_hora"].strftime("%H:%M:%S"), "lat": p["lat"], "lon": p["lon"],
                            "acc": p["precision_m"], "vel": p["velocidad"], "bat": p["bateria"]}
                           for p in puntos],
                "resumen": resumen,
                "dias_con_datos": sorted(str(d[0])[:10] for d in dias if d[0] is not None),
            }), 200
        except Exception:
            db.session.rollback()
            log.error("Monitoreo recorrido:\n%s", traceback.format_exc())
            return jsonify({"success": False, "error": "No se pudo leer el recorrido."}), 500

    @app.route("/api/monitoreo/alerta", methods=["POST"])
    def monitoreo_alerta():
        yo = usuario_web()
        if yo is None:
            return jsonify({"success": False, "error": "Sesión expirada. Inicia sesión nuevamente."}), 401
        if not puede_monitorear(yo, conf):
            return sin_permiso()
        try:
            datos = request.get_json(silent=True) or {}
            uid = int(datos.get("usuario") or 0)
            activa = bool(datos.get("activa"))
            est = EstadoDispositivo.query.get(uid)
            if est is None:
                return jsonify({"success": False, "error": "Ese celular todavía no ha enviado datos."}), 404
            est.alerta = activa
            est.alerta_desde = ahora_lima() if activa else None
            est.alerta_por = (yo.user or "")[:80] if activa else None
            db.session.commit()
            log.warning("[MONITOREO] %s %s el modo robo/pérdida del usuario %s",
                        yo.user, "ACTIVÓ" if activa else "quitó", uid)
            return jsonify({"success": True, "alerta": activa}), 200
        except (ValueError, TypeError):
            return jsonify({"success": False, "error": "Datos no válidos."}), 400
        except Exception:
            db.session.rollback()
            log.error("Monitoreo alerta:\n%s", traceback.format_exc())
            return jsonify({"success": False, "error": "No se pudo cambiar el modo robo."}), 500

    return UbicacionOperario, EstadoDispositivo
