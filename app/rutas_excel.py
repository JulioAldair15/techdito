# -*- coding: utf-8 -*-
"""
RUTEO QUE YA VIENE EN EL EXCEL
==============================
Segunda forma de generar las cargas: el supervisor ya armo su ruteo en el
Excel (una columna dice a que carga u operario va cada suministro y, si
quiere, otra dice el orden de visita). El sistema NO reparte ni reordena:
  - arma una carga por cada valor de la columna de carga (y por fecha, si el
    Excel trae fecha);
  - respeta el orden de la columna de orden; si no se eligio, ordena solo
    DENTRO de cada carga (vecino mas cercano + 2-opt), sin mover a nadie de carga;
  - calcula horas estimadas, km y alertas (franjas horarias, tramos largos,
    orden repetido, cuanto se ahorraria con otro orden);
  - deja a los suministros sin coordenada en su carga y en su orden.
Todo lo demas es lo mismo que el ruteo del sistema: lectura del Excel,
catastro, validacion de direcciones, mapa, Excel de ruta y planos.

Endpoints (se registran desde app/__init__.py):
    POST /api/rutas_desde_excel         genera las cargas
    POST /api/recalcular_cargas_excel   recalcula sin cambiar el orden
"""
import io
import logging
import math
import re
import traceback

import numpy as np
import pandas as pd
from flask import jsonify, request

try:
    from .rutas_direcciones import alertas_direccion, campos_direccion
except ImportError:                                          # pruebas sueltas
    from rutas_direcciones import alertas_direccion, campos_direccion

log = logging.getLogger(__name__)

TRAMO_LARGO_KM = 3.0        # un salto mayor entre dos visitas seguidas se avisa
AHORRO_MIN_PCT = 25.0       # se avisa si otro orden recorre esto menos...
AHORRO_MIN_KM = 1.5         # ...y ademas ahorra al menos estos km


def _R():
    """routes.py ya esta cargado cuando llega una peticion: se importa aqui
    para no crear un import circular al arrancar."""
    from . import routes as R
    return R


# ----------------------------------------------------------------- utilidades
def _txt(v):
    s = "" if v is None else str(v).strip()
    return "" if s.lower() in ("nan", "none", "null", "nat") else s


def _clave_carga(v):
    """'3', '3.0' y ' 3 ' son la misma carga; un nombre se deja tal cual."""
    s = _txt(v)
    if not s:
        return ""
    try:
        f = float(s.replace(",", "."))
        if math.isfinite(f) and f == int(f):
            return str(int(f))
    except ValueError:
        pass
    return re.sub(r"\s+", " ", s).upper()


def _orden_num(v):
    s = _txt(v).replace(",", ".")
    if not s:
        return None
    m = re.search(r"-?\d+(?:\.\d+)?", s)
    if not m:
        return None
    try:
        return float(m.group(0))
    except ValueError:
        return None


def _natural(s):
    return [(0, int(t), "") if t.isdigit() else (1, 0, t)
            for t in re.split(r"(\d+)", str(s)) if t != ""]


def _num(v):
    try:
        f = float(v)
    except (TypeError, ValueError):
        return None
    return f if math.isfinite(f) else None


def _proyectar(registros, R):
    """Agrega __x__, __y__ (metros) a cada registro con lat/lon valida."""
    idx = [i for i, r in enumerate(registros)
           if not r.get("sin_ubicacion") and _num(r.get("lat")) is not None
           and _num(r.get("lon")) is not None]
    if not idx:
        return
    lon = np.array([float(registros[i]["lon"]) for i in idx])
    lat = np.array([float(registros[i]["lat"]) for i in idx])
    ux, uy, _a, _b = R._a_metros_y_grados(lon, lat)
    for k, i in enumerate(idx):
        registros[i]["__x__"], registros[i]["__y__"] = float(ux[k]), float(uy[k])


def _d(a, b):
    return math.hypot(a["__x__"] - b["__x__"], a["__y__"] - b["__y__"])


def _orden_sistema(pts):
    """Vecino mas cercano desde el extremo norte + 2-opt (igual que el motor)."""
    if len(pts) < 3:
        return list(pts)
    pend, seq, pos = list(pts), [], None
    while pend:
        if pos is None:
            i = max(range(len(pend)), key=lambda k: pend[k]["__y__"])
        else:
            i = min(range(len(pend)), key=lambda k: _d(pos, pend[k]))
        pos = pend.pop(i)
        seq.append(pos)
    # 2-opt sobre camino abierto (delta de las dos aristas)
    n = len(seq)
    for _ in range(30):
        mejoro = False
        for i in range(1, n - 1):
            for j in range(i + 1, n):
                a, b = seq[i - 1], seq[j + 1] if j + 1 < n else None
                delta = _d(a, seq[j]) - _d(a, seq[i])
                if b is not None:
                    delta += _d(seq[i], b) - _d(seq[j], b)
                if delta < -1e-6:
                    seq[i:j + 1] = seq[i:j + 1][::-1]
                    mejoro = True
        if not mejoro:
            break
    return seq


def _km_camino(pts, factor):
    return sum(_d(a, b) for a, b in zip(pts, pts[1:])) / 1000.0 * factor


# ------------------------------------------------------------ armado de carga
def armar_carga(registros, meta, cfg, min_reg, usar_franjas, R):
    """
    Calcula reloj, km y alertas de una carga RESPETANDO el orden de
    'registros' (lista de dicts con lat/lon; sin_ubicacion=True si no tiene).
    meta: id, nombre, fecha, fecha_iso, localidad. Devuelve el objeto carga con
    el mismo formato que el ruteo del sistema.
    """
    regs = [dict(r) for r in registros]
    _proyectar(regs, R)
    ini = float(cfg["JORNADA_INICIO"])
    tol = float(cfg.get("TOLERANCIA_FRANJA_MIN", 10))
    factor = float(cfg["FACTOR_RUTA"])

    reloj, prev, km, primero = ini, None, 0.0, None
    fuera_franja, saltos, localidades = [], [], []
    salida = []
    for i, r in enumerate(regs, start=1):
        r["orden"] = i
        loc = r.get("localidad") or ""
        if loc and loc not in localidades:
            localidades.append(loc)
        franja = R._parse_franja(r.get("franja_horaria"), cfg) if usar_franjas else None
        if "__x__" not in r:                      # sin coordenada: va en su lugar, sin hora
            r.update(sin_ubicacion=True, hora_estimada="", minuto_estimado=None,
                     km_desde_anterior=0.0)
            r.pop("fuera_de_franja", None)
            salida.append(r)
            continue
        d = _d(prev, r) if prev is not None else 0.0
        llegada = reloj + (R._min_traslado(d, cfg) if prev is not None else 0.0)
        if franja:
            llegada = max(llegada, float(franja[0]))     # espera a que abra la franja
        if primero is None:
            primero = llegada
        tramo = d / 1000.0 * factor
        km += tramo
        if tramo > TRAMO_LARGO_KM and prev is not None:
            saltos.append((prev["orden"], i, tramo))
        r.update(hora_estimada=R._hhmm(llegada), minuto_estimado=int(round(llegada)),
                 km_desde_anterior=round(tramo, 2), sin_ubicacion=False)
        fin_visita = llegada + min_reg
        if franja and fin_visita > float(franja[1]) + tol:
            r["fuera_de_franja"] = True
            fuera_franja.append(i)
        else:
            r.pop("fuera_de_franja", None)
        reloj, prev = fin_visita, r
        salida.append(r)

    ubicados = [r for r in salida if "__x__" in r]
    if primero is not None:
        ini = primero                         # la jornada arranca con la primera visita
    dur = (reloj - ini) if ubicados else 0.0
    fin = ini + dur

    # Cuanto recorreria el sistema con los mismos predios (solo informativo)
    km_opt = None
    if len(ubicados) >= 4:
        km_opt = _km_camino(_orden_sistema(ubicados), factor)

    alertas = []
    if fuera_franja:
        alertas.append("%d predio%s llegaria%s fuera de su franja horaria (orden %s)" % (
            len(fuera_franja), "s" if len(fuera_franja) > 1 else "",
            "n" if len(fuera_franja) > 1 else "",
            ", ".join(str(x) for x in fuera_franja[:8]) + ("..." if len(fuera_franja) > 8 else "")))
    for a, b, t in saltos[:3]:
        alertas.append("Salto de %.1f km entre el orden %d y el %d" % (t, a, b))
    if len(saltos) > 3:
        alertas.append("y %d saltos largos mas" % (len(saltos) - 3))
    if km_opt is not None and km > km_opt + AHORRO_MIN_KM and \
            km > km_opt * (1 + AHORRO_MIN_PCT / 100.0):
        alertas.append("Con otro orden se recorreria %.1f km en vez de %.1f km"
                       % (km_opt, km))
    if dur > cfg["JORNADA_MASIVA_MAX_H"] * 60:
        alertas.append("Jornada larga: %.1f h para %d registros" % (dur / 60.0, len(salida)))
    if fin > cfg["JORNADA_FIN"]:
        alertas.append("Cierra %s, pasa el fin de jornada" % R._hhmm(fin))
    if len(localidades) > 1:
        alertas.append("Conurbacion: %s" % " + ".join(localidades))
    sin_ub = sum(1 for r in salida if r.get("sin_ubicacion"))
    if sin_ub:
        alertas.append("Incluye %d predio%s sin coordenada (ubicar por direccion)"
                       % (sin_ub, "s" if sin_ub > 1 else ""))
    alertas.extend(meta.get("alertas_extra") or [])
    alertas.extend(alertas_direccion(salida))

    for r in salida:
        r.pop("__x__", None)
        r.pop("__y__", None)
    return {
        "id": meta.get("id", 0),
        "nombre": meta.get("nombre", ""),
        "ruteo": "excel",
        "fecha": meta.get("fecha", ""),
        "fecha_iso": meta.get("fecha_iso", "9999-12-31"),
        "localidad": meta.get("localidad") or (localidades[0] if localidades else ""),
        "zona": " + ".join(localidades[:2]) + ("..." if len(localidades) > 2 else ""),
        "hora": "%s - %s" % (R._hhmm(ini), R._hhmm(fin)) if ubicados else "Sin ubicacion",
        "hora_inicio": R._hhmm(ini) if ubicados else "",
        "hora_fin": R._hhmm(fin) if ubicados else "",
        "minuto_inicio": int(round(ini)),
        "duracion_min": int(round(dur)),
        "duracion_h": round(dur / 60.0, 2),
        "km_total": round(float(km), 2),
        "km_optimo": round(float(km_opt), 2) if km_opt is not None else None,
        "cantidad": len(salida),
        "franjas": [],
        "alertas": alertas,
        "registros": salida,
        "excede_personal": False,
    }


def _registro_de_fila(fila, cols, usar_franjas, col_hor):
    """Fila del DataFrame de _preparar_datos -> registro de carga."""
    col_sum, col_dis, col_urb, col_via, col_num, _h = cols
    tiene = _num(fila.get("lat")) is not None and _num(fila.get("lon")) is not None \
        and not fila.get("__sin__")
    via = _txt(fila.get(col_via)) if col_via else ""
    num = _txt(fila.get(col_num)) if col_num else ""
    num = "" if num.lower() == "s/n" else num
    franja = ""
    if usar_franjas and col_hor:
        franja = _txt(fila.get(col_hor))
    reg = {
        "orden": 0,
        "suministro": _txt(fila.get(col_sum)),
        "distrito": _txt(fila.get(col_dis)) if col_dis else "",
        "urbanizacion": _txt(fila.get(col_urb)) if col_urb else "",
        "via": _R()._via_mostrada(fila, via),
        "numero": _R()._numero_mostrado(fila, num, _R()._via_mostrada(fila, via)),
        "localidad": _txt(fila.get("__loc__")),
        "lat": round(float(fila["lat"]), 7) if tiene else None,
        "lon": round(float(fila["lon"]), 7) if tiene else None,
        "coord_x": _num(fila.get("coord_x")) if tiene else None,
        "coord_y": _num(fila.get("coord_y")) if tiene else None,
        "origen_coord": _txt(fila.get("__origen__")) or ("desconocido" if tiene
                                                          else "sin coordenada"),
        "tipo_servicio": _txt(fila.get("__tipo__")),
        "franja_horaria": franja,
        "carga_excel": _txt(fila.get("__carga_txt__")),
        "orden_excel": _txt(fila.get("__orden_txt__")),
        "sin_ubicacion": not tiene,
    }
    if tiene:
        reg.update(campos_direccion(fila))
    return reg


# ------------------------------------------------------------------ endpoints
def registrar(app):
    """Registra los endpoints del ruteo que ya viene en el Excel."""

    @app.route("/api/rutas_desde_excel", methods=["POST"])
    def rutas_desde_excel():
        R = _R()
        conf = dict(R.CFG)
        try:
            if "archivo" not in request.files:
                return jsonify({"error": "No se encontro ningun archivo excel."}), 400
            actividad = _txt(request.form.get("actividad")).upper()
            if not actividad:
                return jsonify({"error": "Debes seleccionar la actividad."}), 400
            col_carga = _txt(request.form.get("col_carga"))
            col_orden = _txt(request.form.get("col_orden")) or None
            if not col_carga:
                return jsonify({"error": "Elige la columna que dice a que carga u operario "
                                         "va cada suministro."}), 400
            if col_orden and col_orden == col_carga:
                return jsonify({"error": "La columna de orden no puede ser la misma que la "
                                         "de carga."}), 400

            contenido = request.files["archivo"].read()
            cabecera = [str(c) for c in pd.read_excel(io.BytesIO(contenido), dtype=str,
                                                      nrows=0).columns]
            for c, que in ((col_carga, "carga"), (col_orden, "orden")):
                if c and c not in cabecera:
                    return jsonify({"error": "La columna de %s '%s' no existe en el Excel."
                                             % (que, c)}), 400

            masiva = actividad in R.PERFILES_MASIVOS
            usar_franjas = not masiva
            min_reg = float(R._perfil_masivo(actividad)["min_registro"] if masiva
                            else conf["MIN_INSPECCION"])
            col_cruce = _txt(request.form.get("col_cruce")) or None
            es_persuasivas = actividad == "ACCIONES PERSUASIVAS"

            datos = R._preparar_datos(contenido, request.form, conf, R.db,
                                      R.CoordenadasCatastro, R.DataCatastroV2,
                                      usar_franjas=usar_franjas,
                                      col_clave=col_cruce if es_persuasivas else None)
            cols = datos["cols"]
            col_sum, col_hor = cols[0], cols[5]

            # --- Cruce agua / desague (persuasivas), igual que en el sistema
            claves_desague, cruce_info = set(), None
            arch2 = request.files.get("archivo_secundario")
            if es_persuasivas and arch2 and arch2.filename:
                if not col_cruce:
                    return jsonify({"error": "Selecciona la columna de cruce entre los "
                                             "dos archivos."}), 400
                df2 = pd.read_excel(io.BytesIO(arch2.read()), dtype=str)
                if col_cruce not in df2.columns:
                    return jsonify({"error": "El archivo secundario no tiene la columna "
                                             "'%s'." % col_cruce}), 400
                claves_desague = {str(v).strip() for v in df2[col_cruce].dropna()
                                  if str(v).strip()}
                cruce_info = {"columna": col_cruce, "filas_secundario": int(len(df2)),
                              "claves_secundario": len(claves_desague)}

            # --- Todas las filas (con y sin coordenada), en el orden del Excel
            partes = []
            for df, sin in ((datos["df_val"], False), (datos["sin_coords"], True)):
                if df is not None and len(df):
                    t = df.copy()
                    t["__sin__"] = sin
                    t["__fila__"] = t.index
                    partes.append(t)
            todo = pd.concat(partes, ignore_index=True, sort=False)
            todo["__carga__"] = [_clave_carga(v) for v in todo[col_carga]]
            todo["__carga_txt__"] = [_txt(v) for v in todo[col_carga]]
            if col_orden:
                todo["__orden_n__"] = [_orden_num(v) for v in todo[col_orden]]
                todo["__orden_txt__"] = [_txt(v) for v in todo[col_orden]]
            else:
                todo["__orden_n__"] = None
                todo["__orden_txt__"] = ""
            if es_persuasivas:
                todo["__tipo__"] = ["AGUA Y DESAGUE" if _txt(v) in claves_desague else "AGUA"
                                    for v in todo[col_sum]]
                if cruce_info:
                    cruce_info["coincidencias"] = int((todo["__tipo__"] ==
                                                       "AGUA Y DESAGUE").sum())

            # --- Sin carga en el Excel: no se inventa una, se informa
            no_programados = []
            sin_carga = todo[todo["__carga__"] == ""]
            for _, f in sin_carga.iterrows():
                no_programados.append({
                    "suministro": _txt(f.get(col_sum)), "fecha": _txt(f.get("__fecha_txt__")),
                    "localidad": _txt(f.get("__loc__")),
                    "direccion": _txt(f.get("__dir_txt__")),
                    "motivo": "no tiene carga en la columna '%s' del Excel" % col_carga})
            todo = todo[todo["__carga__"] != ""]
            if todo.empty:
                return jsonify({"error": "Ninguna fila tiene valor en la columna de carga "
                                         "'%s'." % col_carga}), 400

            # --- Una carga por (fecha, valor de la columna de carga)
            grupos = []
            for (f_iso, f_txt, clave), g in todo.groupby(
                    ["__fecha_iso__", "__fecha_txt__", "__carga__"], sort=False):
                grupos.append((str(f_iso), str(f_txt), clave, g))
            grupos.sort(key=lambda t: (t[0], _natural(t[2])))

            cargas, resumen_bloques = [], {}
            sin_orden_total = 0
            for k, (f_iso, f_txt, clave, g) in enumerate(grupos, start=1):
                extra = []
                if col_orden:
                    ords = [_num(v) for v in g["__orden_n__"]]
                    g = g.assign(__o1__=[1 if v is None else 0 for v in ords],
                                 __o2__=[0.0 if v is None else v for v in ords])
                    g = g.sort_values(["__o1__", "__o2__", "__fila__"], kind="stable")
                    sin_orden = int((g["__o1__"] == 1).sum())
                    sin_orden_total += sin_orden
                    if sin_orden:
                        extra.append("%d sin numero de orden en el Excel: van al final"
                                     % sin_orden)
                    rep = g.loc[g["__o1__"] == 0, "__o2__"].value_counts()
                    rep = rep[rep > 1]
                    if len(rep):
                        extra.append("Orden repetido en el Excel: %s" % ", ".join(
                            "%g (x%d)" % (v, n) for v, n in list(rep.items())[:5]))
                    regs = [_registro_de_fila(f, cols, usar_franjas, col_hor)
                            for _, f in g.iterrows()]
                else:
                    g = g.sort_values("__fila__", kind="stable")
                    regs = [_registro_de_fila(f, cols, usar_franjas, col_hor)
                            for _, f in g.iterrows()]
                    con = [r for r in regs if not r["sin_ubicacion"]]
                    sin = [r for r in regs if r["sin_ubicacion"]]
                    _proyectar(con, R)
                    regs = _orden_sistema(con) + sin
                    for r in regs:
                        r.pop("__x__", None)
                        r.pop("__y__", None)
                bloque = g["__bloque__"].mode().iloc[0] if "__bloque__" in g and \
                    g["__bloque__"].notna().any() else ""
                nombre = clave if clave.isdigit() else \
                    (re.sub(r"\s+", " ", _txt(g["__carga_txt__"].iloc[0])) or clave)
                carga = armar_carga(regs, {"id": k, "nombre": nombre, "fecha": f_txt,
                                           "fecha_iso": f_iso, "localidad": bloque,
                                           "alertas_extra": extra},
                                    conf, min_reg, usar_franjas, R)
                cargas.append(carga)
                resumen_bloques[bloque] = resumen_bloques.get(bloque, 0) + 1

            por_dia = {}
            for c in cargas:
                por_dia[c["fecha_iso"]] = por_dia.get(c["fecha_iso"], 0) + 1
            extra_cfg = {
                "actividad": actividad,
                "modo": "masiva",               # el front no ofrece mover franjas
                "ruteo": "excel",
                "col_carga": col_carga,
                "col_orden": col_orden or "",
                "min_por_registro": min_reg,
                "velocidad_kmh": conf["VELOCIDAD_KMH"],
                "cargas_por_dia": max(por_dia.values()) if por_dia else 0,
                "columna_clave": col_sum,
            }
            resp = R._respuesta(datos, cargas, no_programados, {}, resumen_bloques, extra_cfg)
            resp["cruce"] = cruce_info
            resp["resumen"]["programados"] = sum(c["cantidad"] for c in cargas)
            resp["resumen"]["sin_carga_en_excel"] = len(no_programados)
            resp["resumen"]["sin_orden_en_excel"] = sin_orden_total
            resp["resumen"]["total_cargas_generadas"] = len(cargas)
            resp["asignacion"] = {r["suministro"]: {"carga": c["id"], "orden": r["orden"],
                                                    "tipo": r.get("tipo_servicio", "")}
                                  for c in cargas for r in c["registros"]}
            return jsonify(resp), 200

        except R._ErrorEntrada as e:
            return jsonify({"error": e.mensaje}), e.codigo
        except Exception:
            try:
                R.db.session.rollback()
            except Exception:
                pass
            log.error("Error generando cargas desde el Excel:\n%s", traceback.format_exc())
            return jsonify({"error": "No se pudo procesar el archivo. "
                                     "Revisa el log del servidor."}), 500

    @app.route("/api/recalcular_cargas_excel", methods=["POST"])
    def recalcular_cargas_excel():
        """Recalcula horas, km y alertas SIN cambiar el orden ni la carga de nadie
        (por ejemplo, despues de aplicar una ubicacion propuesta)."""
        R = _R()
        conf = dict(R.CFG)
        try:
            datos = request.get_json(silent=True) or {}
            entrada = datos.get("cargas")
            if not isinstance(entrada, list) or not entrada:
                return jsonify({"error": "No se recibieron cargas que recalcular."}), 400
            actividad = _txt(datos.get("actividad")).upper()
            masiva = actividad in R.PERFILES_MASIVOS
            min_reg = float(R._perfil_masivo(actividad)["min_registro"] if masiva
                            else conf["MIN_INSPECCION"])
            salida = []
            for c in entrada:
                regs = c.get("registros") or []
                if not regs:
                    continue
                salida.append(armar_carga(
                    regs, {"id": c.get("id", 0), "nombre": c.get("nombre", ""),
                           "fecha": c.get("fecha", ""),
                           "fecha_iso": c.get("fecha_iso", "9999-12-31"),
                           "localidad": c.get("localidad", "")},
                    conf, min_reg, not masiva, R))
            if not salida:
                return jsonify({"error": "Todas las cargas quedaron vacias."}), 400
            return jsonify({"status": "success", "rutas": salida, "plan_personal": {},
                            "resumen": {"total_cargas_generadas": len(salida),
                                        "programados": sum(x["cantidad"] for x in salida)}}), 200
        except Exception:
            log.error("Error recalculando cargas del Excel:\n%s", traceback.format_exc())
            return jsonify({"error": "No se pudo recalcular."}), 500
