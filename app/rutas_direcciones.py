# -*- coding: utf-8 -*-
"""
Puente entre routes.py y validador_direcciones.py.

routes.py solo llama a tres cosas:
    validar_df(...)        dentro de _preparar_datos, despues de geocodificar
    campos_direccion(it)   al armar cada registro de una carga
    ETIQUETAS_EXPORT       en el Excel de coordenadas para catastro
"""
import logging
import math
import time

import numpy as np

log = logging.getLogger(__name__)

# Funciona dentro del paquete 'app' (import relativo) y suelto (pruebas).
try:
    from . import validador_direcciones as vd
except ImportError:
    import validador_direcciones as vd

COLUMNAS = ("__dir_estado__", "__dir_nota__", "__dir_calle__", "__lon_orig__",
            "__lat_orig__", "__origen_orig__", "__lon_prop__", "__lat_prop__")

# estado del validador -> estado en la lista de coordenadas observadas
ESTADO_OBSERVADA = {
    "corregida": "corregida_direccion",
    "ubicada": "ubicada_direccion",
    "revisar": "revisar_direccion",
}

ETIQUETAS_EXPORT = {
    "corregida_direccion": "CORREGIDA: NO CORRESPONDIA A SU DIRECCION",
    "ubicada_direccion": "UBICADA POR SU DIRECCION (NO TENIA COORDENADA)",
    "revisar_direccion": "NO CUADRA CON SU DIRECCION: REVISAR",
    "corregida_supervisor": "CORREGIDA POR EL SUPERVISOR",
    "mantenida_supervisor": "EL SUPERVISOR MANTUVO LA ORIGINAL",
    "corregida_gis": "UBICADA EN SU LOTE EXACTO (PLANO DE LOTES)",
}
ESTADOS_VERDES = {"corregida_direccion", "ubicada_direccion", "corregida_supervisor",
                  "corregida_gis"}
ESTADOS_ROJOS = {"revisar_direccion"}
ORIGEN_MANUAL = "manual"
# Origenes que el validador no toca: (estado que se muestra, nota)
ORIGENES_FIJOS = {
    "manual": ("manual", "Ubicacion fijada a mano por el supervisor."),
    "gis_sedalib": ("gis", "Ubicado en el centro de su lote (plano de lotes)."),
}
# estado del validador -> clave del resumen
_RESUMEN_DE = {"verificada": "verificadas", "aproximada": "aproximadas",
               "corregida": "corregidas", "revisar": "revisar", "ubicada": "ubicadas",
               "sin_verificar": "sin_verificar", "sin_ubicar": "sin_ubicar"}


def _txt(v):
    s = "" if v is None else str(v).strip()
    return "" if s.lower() in ("nan", "none", "null", "nat") else s


def _num(v):
    try:
        f = float(v)
    except (TypeError, ValueError):
        return None
    return round(f, 7) if math.isfinite(f) else None


# =============================================================================
#  REFERENCIA INTERNA: catastro (lote / manzana) e historial de visitas
# =============================================================================
# El diagnostico de un ciclo de El Porvenir dio: 87% de los suministros tienen
# lote en data_catastro y el centro de su manzana es confiable; 48% tienen 2 o
# mas visitas GPS en produccion y el 93% de esas coinciden entre si. Eso sabe
# donde esta el PREDIO; el mapa de calles solo sabe donde esta la calle (y hay
# decenas de 'Calle 4'). Por eso esto va primero.
#
# Cuidado con los datos 'de relleno': una misma coordenada copiada en muchos
# lotes (o en lotes de manzanas distintas) no es la ubicacion de ninguno.
# Usarla mandaria a todos esos suministros a un mismo punto.
UTM_X = (600000.0, 850000.0)
UTM_Y = (9000000.0, 9300000.0)
MZ_MIN_PUNTOS = 3         # coordenadas DISTINTAS para confiar en el centro de una manzana
MZ_MAX_DISP = 150.0       # los lotes de una manzana deben estar juntos (mediana, m)
LOTE_MAX_M = 150.0        # el lote propio vale si cae dentro de su manzana
LOTE_REPETIDO = 4         # una coordenada en 4+ lotes distintos no es de ningun lote
HIST_MIN = 2              # visitas para confiar en el historial
HIST_MAX_DISP = 100.0     # y que coincidan entre si
HIST_APILADO = 6          # 6+ suministros con su historial en el mismo punto: oficina / relleno
HIST_RADIO_M = 10.0
_CACHE_SEC = {}           # sector -> (instante, [(manzana, lote, x, y), ...])
_CACHE_SEC_TTL = 6 * 3600  # el catastro casi no cambia: se relee cada 6 h


def _clave(v):
    return str(v).strip().upper() if v is not None else ""


def _f(v):
    if v is None:
        return None
    try:
        f = float(str(v).replace(",", ".").strip())
    except (TypeError, ValueError):
        return None
    return f if math.isfinite(f) else None


def _utm_ok(x, y):
    return (x is not None and y is not None and
            UTM_X[0] <= x <= UTM_X[1] and UTM_Y[0] <= y <= UTM_Y[1])


def _centro(puntos):
    a = np.asarray(puntos, dtype="float64")
    m = np.median(a, axis=0)
    return (float(m[0]), float(m[1])), float(np.median(np.hypot(a[:, 0] - m[0],
                                                                 a[:, 1] - m[1])))


def _lotes(seq, n):
    seq = list(seq)
    for i in range(0, len(seq), n):
        yield seq[i:i + n]


def _a_utm(xs, ys, a_grados):
    """Lista de (x, y) mezclados (grados o UTM) -> lista de (x, y) UTM o None."""
    if not xs:
        return []
    x = np.array([np.nan if v is None else v for v in xs], dtype="float64")
    y = np.array([np.nan if v is None else v for v in ys], dtype="float64")
    ux, uy, _, _ = a_grados(x, y)
    return [(float(a), float(b)) if _utm_ok(float(a), float(b)) else None
            for a, b in zip(ux, uy)]


def _ckey(p):
    return (int(round(p[0])), int(round(p[1])))


def _sumar(stats, clave, n=1):
    stats[clave] = stats.get(clave, 0) + n


def fuentes_por_defecto():
    """(db, DataCatastroV2, Produccion, RegistroTrabajo) del propio paquete,
    para no depender de que routes.py los pase. None si no se pueden importar."""
    try:
        try:
            from . import db
            from . import models as M
        except ImportError:
            from app import db
            from app import models as M
    except Exception as e:                                   # pragma: no cover
        log.info("Referencia interna sin base de datos: %s", e)
        return None
    if getattr(M, "DataCatastroV2", None) is None:
        return None
    return (db, M.DataCatastroV2, getattr(M, "Produccion", None),
            getattr(M, "RegistroTrabajo", None))


def _filas_sector(db, DataCatastroV2, sectores, a_grados):
    """Todos los lotes con coordenada de esos sectores (con cache)."""
    ahora = time.time()
    faltan = [sc for sc in sectores
              if sc not in _CACHE_SEC or ahora - _CACHE_SEC[sc][0] > _CACHE_SEC_TTL]
    if faltan:
        nuevos = {sc: [] for sc in faltan}
        for grupo in _lotes(faltan, 500):
            filas = db.session.query(DataCatastroV2.sector, DataCatastroV2.manzana,
                                     DataCatastroV2.lote, DataCatastroV2.este,
                                     DataCatastroV2.norte).filter(
                DataCatastroV2.sector.in_(grupo)).all()
            pts = _a_utm([_f(f[3]) for f in filas], [_f(f[4]) for f in filas], a_grados)
            for f, p in zip(filas, pts):
                if p and f[1]:
                    nuevos.setdefault(_clave(f[0]), []).append(
                        (_clave(f[1]), _clave(f[2]), p[0], p[1]))
        for sc, lista in nuevos.items():
            _CACHE_SEC[sc] = (ahora, lista)
    out = []
    for sc in sectores:
        for mz, lt, x, y in (_CACHE_SEC.get(sc) or (0, []))[1]:
            out.append((sc, mz, lt, x, y))
    return out


def referencias_internas(suministros, db, DataCatastroV2, Produccion=None,
                         RegistroTrabajo=None, a_grados=None, lote=600, stats=None):
    """
    {suministro: {"lon", "lat", "fuente", "detalle", "predio", "auto", ...}} con
    la mejor ubicacion conocida por el propio sistema:
      1. 'lote catastral'      su este/norte de data_catastro, si cae en su manzana
                               y no es una coordenada repetida en otros lotes
      2. 'manzana catastral'   el centro de su manzana (mediana de sus lotes)
      3. 'historial de visitas' mediana de 2+ visitas GPS que coinciden
    'auto': False cuando el catastro se contradice (se propone, no se mueve).
    stats: dict opcional donde se cuentan los casos descartados.
    Si alguna tabla falla, se sigue con las demas: nunca rompe el ruteo.
    """
    from sqlalchemy import or_
    stats = stats if stats is not None else {}
    sums = [s for s in dict.fromkeys(_clave(x) for x in suministros) if s]
    pend = set(sums)
    refs = {}

    # --- 1) fila(s) de data_catastro de cada suministro -------------------
    cand = {}                  # sum -> {(sector, manzana, lote): punto o None}
    try:
        crudos = []
        for grupo in _lotes(sums, lote):
            for ag, sp, cc, sec, mz, lt, x, y in db.session.query(
                    DataCatastroV2.agrupado, DataCatastroV2.suministro_p,
                    DataCatastroV2.codigo_cliente, DataCatastroV2.sector,
                    DataCatastroV2.manzana, DataCatastroV2.lote,
                    DataCatastroV2.este, DataCatastroV2.norte).filter(or_(
                        DataCatastroV2.agrupado.in_(grupo),
                        DataCatastroV2.suministro_p.in_(grupo),
                        DataCatastroV2.codigo_cliente.in_(grupo))).all():
                fila = (_clave(sec), _clave(mz), _clave(lt))
                for k in {_clave(ag), _clave(sp), _clave(cc)}:
                    if k in pend:
                        crudos.append((k, fila, _f(x), _f(y)))
        pts = _a_utm([c[2] for c in crudos], [c[3] for c in crudos], a_grados)
        for (k, fila, _x, _y), p in zip(crudos, pts):
            filas = cand.setdefault(k, {})
            if filas.get(fila) is None:
                filas[fila] = p
    except Exception as e:
        log.warning("Referencia catastral no disponible (data_catastro): %s", e)
        cand = {}

    cat = {}                   # sum -> (sector, manzana, lote, punto o None)
    for k, filas in cand.items():
        manzanas = {(f[0], f[1]) for f in filas if f[0] and f[1]}
        if len(manzanas) != 1:
            # aparece en manzanas distintas (o sin manzana): no se sabe cual es
            _sumar(stats, "catastro_ambiguo" if manzanas else "catastro_sin_manzana")
            continue
        sec, mz = manzanas.pop()
        lotes = sorted({f[2] for f in filas})
        if len(lotes) == 1:
            p = next((v for f, v in filas.items() if v), None)
            cat[k] = (sec, mz, lotes[0], p)
        else:
            cat[k] = (sec, mz, "/".join(lotes)[:30], None)   # varios lotes: solo la manzana

    # --- 2) centro confiable de cada manzana, sin datos de relleno -------
    centros, repetidas = {}, set()
    sectores = sorted({v[0] for v in cat.values()})
    if sectores:
        try:
            todas = _filas_sector(db, DataCatastroV2, sectores, a_grados)
            por_coord = {}
            for sec, mz, lt, x, y in todas:
                por_coord.setdefault(_ckey((x, y)), set()).add((sec, mz, lt))
            for key, lotes_c in por_coord.items():
                if len(lotes_c) >= LOTE_REPETIDO or len({l[:2] for l in lotes_c}) > 1:
                    repetidas.add(key)
            pts_mz = {}
            for sec, mz, lt, x, y in todas:
                key = _ckey((x, y))
                if key in repetidas and len({l[:2] for l in por_coord[key]}) > 1:
                    continue           # copiada en varias manzanas: no es de ninguna
                pts_mz.setdefault((sec, mz), {})[key] = (x, y)   # coordenadas distintas
            for clave_mz, d in pts_mz.items():
                if len(d) >= MZ_MIN_PUNTOS:
                    c, disp = _centro(list(d.values()))
                    if disp <= MZ_MAX_DISP:
                        centros[clave_mz] = (c[0], c[1], disp, len(d))
            stats["coordenadas_repetidas_catastro"] = len(repetidas)
        except Exception as e:
            log.warning("Centros de manzana no disponibles: %s", e)

    utm_refs = {}
    for k, (sec, mz, lt, p) in cat.items():
        centro = centros.get((sec, mz))
        if not centro:
            _sumar(stats, "manzana_no_confiable")
            continue
        det = "sector %s mz %s lt %s" % (sec, mz, lt)
        base = {"predio": (sec, mz, lt), "detalle": det}
        if p is not None and _ckey(p) in repetidas:
            _sumar(stats, "lote_con_coordenada_repetida")
            p = None                                     # relleno: vale solo la manzana
        tol_mz = max(250.0, 2.5 * centro[2])
        if p is not None:
            d = math.hypot(p[0] - centro[0], p[1] - centro[1])
            if d <= LOTE_MAX_M:
                utm_refs[k] = dict(base, xy=p, fuente="lote catastral")
            else:
                # su lote no cae en su manzana: el catastro se contradice
                _sumar(stats, "lote_fuera_de_su_manzana")
                utm_refs[k] = dict(base, xy=(centro[0], centro[1]), fuente="manzana catastral",
                                   auto=False, tol=tol_mz, alt=[p],
                                   nota="su lote en el catastro esta a %d m de su manzana: "
                                        "el catastro no es concluyente" % int(d))
        else:
            utm_refs[k] = dict(base, xy=(centro[0], centro[1]), fuente="manzana catastral",
                               tol=tol_mz)

    # --- 3) historial de visitas para los que no tienen catastro --------
    sin_ref = [s for s in sums if s not in utm_refs]
    visitas = {}
    for modelo in (Produccion, RegistroTrabajo):
        if modelo is None or not sin_ref:
            continue
        try:
            crudos = []
            for grupo in _lotes(sin_ref, lote * 2):
                for s, lat, lon, x, y in db.session.query(
                        modelo.suministro, modelo.latitud, modelo.longitud,
                        modelo.este, modelo.norte).filter(modelo.suministro.in_(grupo)).all():
                    if _f(lat) is not None and _f(lon) is not None:
                        crudos.append((_clave(s), _f(lon), _f(lat)))
                    else:
                        crudos.append((_clave(s), _f(x), _f(y)))
            pts = _a_utm([c[1] for c in crudos], [c[2] for c in crudos], a_grados)
            for (k, _x, _y), p in zip(crudos, pts):
                if p:
                    visitas.setdefault(k, []).append(p)
        except Exception as e:
            log.warning("Historial de visitas no disponible (%s): %s",
                        getattr(modelo, "__tablename__", modelo), e)
    hist = {}
    for k, lista in visitas.items():
        if len(lista) >= HIST_MIN:
            c, disp = _centro(lista)
            if disp <= HIST_MAX_DISP:
                hist[k] = (c, len(lista))
    # Muchos suministros distintos con su 'historial' en el mismo punto: el
    # operario los cerro desde un solo sitio. Eso no ubica a ninguno.
    if len(hist) >= HIST_APILADO:
        celdas = {}
        for k, (c, _n) in hist.items():
            celdas.setdefault((int(c[0] // HIST_RADIO_M), int(c[1] // HIST_RADIO_M)), []).append(k)
        descartar = set()
        for k, (c, _n) in hist.items():
            cx, cy = int(c[0] // HIST_RADIO_M), int(c[1] // HIST_RADIO_M)
            cerca = [j for dx in (-1, 0, 1) for dy in (-1, 0, 1)
                     for j in celdas.get((cx + dx, cy + dy), ())
                     if math.hypot(hist[j][0][0] - c[0], hist[j][0][1] - c[1]) <= HIST_RADIO_M]
            if len(cerca) >= HIST_APILADO:
                descartar.update(cerca)
        if descartar:
            _sumar(stats, "historial_en_un_mismo_punto", len(descartar))
        for k in descartar:
            hist.pop(k, None)
    for k, (c, n) in hist.items():
        utm_refs[k] = {"xy": c, "fuente": "historial de visitas", "predio": ("hist", k),
                       "detalle": "%d visitas que coinciden" % n}

    # --- a grados --------------------------------------------------------
    if utm_refs:
        claves = list(utm_refs)
        pts = [utm_refs[k]["xy"] for k in claves]
        alts = [(k, j, a) for k in claves for j, a in enumerate(utm_refs[k].get("alt") or [])]
        todos = pts + [a for _, _, a in alts]
        x = np.array([p[0] for p in todos], dtype="float64")
        y = np.array([p[1] for p in todos], dtype="float64")
        _, _, lon, lat = a_grados(x, y)
        for n_, k in enumerate(claves):
            lo, la = float(lon[n_]), float(lat[n_])
            if not (math.isfinite(lo) and math.isfinite(la)):
                continue
            r = {kk: v for kk, v in utm_refs[k].items() if kk not in ("xy", "alt")}
            r["lon"], r["lat"] = round(lo, 7), round(la, 7)
            refs[k] = r
        for m_, (k, _j, _a) in enumerate(alts):
            lo, la = float(lon[len(pts) + m_]), float(lat[len(pts) + m_])
            if k in refs and math.isfinite(lo) and math.isfinite(la):
                refs[k].setdefault("alt", []).append((round(lo, 7), round(la, 7)))
    for f in ("lote catastral", "manzana catastral", "historial de visitas"):
        stats[f] = sum(1 for r in refs.values() if r["fuente"] == f)
    return refs


def registros_para_validar(df, cols_dir, col_urb, col_via, col_num, lon, lat):
    """Arma la entrada del validador desde la columna (o columnas) que el
    usuario eligio como direccion. Si no eligio ninguna, usa urbanizacion +
    via + numero del mapeo."""
    regs = []
    for k, (_, fila) in enumerate(df.iterrows()):
        r = {"lon": lon[k], "lat": lat[k], "localidad": _txt(fila.get("__loc__"))}
        if cols_dir:
            r["texto"] = " ".join(x for x in (_txt(fila.get(c)) for c in cols_dir) if x)
        else:
            r["hab"] = _txt(fila.get(col_urb)) if col_urb else ""
            r["via"] = _txt(fila.get(col_via)) if col_via else ""
            r["numero"] = _txt(fila.get(col_num)) if col_num else ""
        regs.append(r)
    return regs


def validar_df(df, conf, col_sum, columnas, a_grados, geocodificar_lote=None, detalle=None,
               fuentes=None, areas=None):
    """
    Valida cada coordenada contra su direccion y aplica la politica:
      corregida / ubicada -> se reemplaza cx, cy (se guarda la original)
      revisar             -> se deja como esta y se guarda la propuesta
    df: el DataFrame de _preparar_datos (cx, cy en grados o UTM, origen, __loc__).
    columnas: (cols_dir, col_urb, col_via, col_num).
    a_grados: _a_metros_y_grados de routes.py.
    detalle: lista de coordenadas observadas (se le agregan los casos).
    fuentes: (db, DataCatastroV2, Produccion, RegistroTrabajo) para la
        referencia interna (catastro / historial). Si no se pasa, se toman del
        propio paquete (app.db y app.models): routes.py no necesita cambiar.
    Devuelve el resumen para la respuesta JSON.
    """
    cols_dir, col_urb, col_via, col_num = columnas
    for c in COLUMNAS:
        df[c] = None
    indice = vd.cargar_indice(conf.get("CALLES_OSM_ARCHIVO"))

    tiene = (df["cx"].notna() & df["cy"].notna()).to_numpy()
    lon = np.full(len(df), np.nan)
    lat = np.full(len(df), np.nan)
    if tiene.any():
        _, _, lo, la = a_grados(df.loc[tiene, "cx"].to_numpy(dtype="float64"),
                                df.loc[tiene, "cy"].to_numpy(dtype="float64"))
        lon[tiene], lat[tiene] = lo, la

    regs = registros_para_validar(df, cols_dir, col_urb, col_via, col_num, lon, lat)
    refs, stats = {}, {}
    if conf.get("DIR_USAR_CATASTRO", True):
        fuentes = fuentes or fuentes_por_defecto()
    if fuentes and conf.get("DIR_USAR_CATASTRO", True):
        db, m_cat, m_prod, m_reg = (list(fuentes) + [None] * 4)[:4]
        t0 = time.time()
        try:
            refs = referencias_internas(df[col_sum].tolist(), db, m_cat, m_prod, m_reg,
                                        a_grados, stats=stats)
        except Exception as e:                              # nunca rompe el ruteo
            log.warning("Referencia interna no disponible: %s", e)
            refs = {}
        log.info("Referencia interna: %d de %d suministros (%.1f s) %s",
                 len(refs), len(df), time.time() - t0, stats)
        for r, s in zip(regs, df[col_sum].tolist()):
            ref = refs.get(_clave(s))
            if ref:
                r["ref"] = ref
    geo = geocodificar_lote if conf.get("DIR_USAR_GEOCODER", True) else None
    res, resumen = vd.validar_direcciones(regs, indice, conf, geocodificar=geo)
    resumen["activa"] = True
    resumen["con_referencia_interna"] = len(refs)
    resumen["referencia_interna"] = stats
    if indice is None:
        resumen["mapa"]["error"] = vd.error_indice()

    filas = df.index.to_numpy()
    origenes = df["origen"].astype(str).to_numpy() if "origen" in df.columns \
        else np.array([""] * len(df))

    # --- Zona de la localidad: una propuesta fuera de ella NO se aplica ----
    # Los nombres de calle se repiten entre distritos (hay 'CALLE SANTA MARIA'
    # en varios): si la direccion manda el punto fuera de su localidad, no se
    # mueve; queda 'revisar' para que lo decida el supervisor en el mapa.
    fuera = 0
    for k, r in enumerate(res if areas else []):
        if (r["estado"] not in ("corregida", "ubicada") or r["lon_propuesta"] is None
                or origenes[k] in ORIGENES_FIJOS):
            continue
        loc = _txt(df.at[filas[k], "__loc__"]) if "__loc__" in df.columns else ""
        area = areas.get(loc)
        if not area:
            continue
        ux, uy, _a, _b = a_grados(np.array([float(r["lon_propuesta"])]),
                                  np.array([float(r["lat_propuesta"])]))
        dist = math.hypot(float(ux[0]) - area["ux"], float(uy[0]) - area["uy"])
        if dist <= area["radio"]:
            continue
        clave_res = _RESUMEN_DE[r["estado"]]
        resumen[clave_res] = max(0, resumen.get(clave_res, 0) - 1)
        resumen["revisar"] = resumen.get("revisar", 0) + 1
        r["estado"] = "revisar"
        r["motivo"] = ("La direccion apunta fuera de %s (a %.1f km de su zona): "
                       "no se movio el punto. %s" % (loc, dist / 1000.0, r["motivo"] or ""))
        fuera += 1
    resumen["fuera_de_localidad"] = fuera

    manuales = gis = 0
    for k, r in enumerate(res):
        j = filas[k]
        est = r["estado"]
        if origenes[k] in ORIGENES_FIJOS:
            # Ubicada a mano por el supervisor o con el GIS de Sedalib: no se toca.
            clave_res = _RESUMEN_DE.get(est)
            if clave_res:
                resumen[clave_res] = max(0, resumen.get(clave_res, 0) - 1)
            estado_fijo, nota_fija = ORIGENES_FIJOS[origenes[k]]
            if estado_fijo == "manual":
                manuales += 1
            else:
                gis += 1
            df.at[j, "__dir_estado__"] = estado_fijo
            df.at[j, "__dir_nota__"] = nota_fija
            continue
        df.at[j, "__dir_estado__"] = est
        df.at[j, "__dir_nota__"] = r["motivo"]
        df.at[j, "__dir_calle__"] = r["calle"]
        if est in ("corregida", "ubicada"):
            if est == "corregida":
                df.at[j, "__lon_orig__"], df.at[j, "__lat_orig__"] = lon[k], lat[k]
                df.at[j, "__origen_orig__"] = df.at[j, "origen"]
            df.at[j, "cx"], df.at[j, "cy"] = r["lon_propuesta"], r["lat_propuesta"]
            df.at[j, "origen"] = ("corregida por direccion" if est == "corregida"
                                  else "ubicada por direccion")
        elif est == "revisar" and r["lon_propuesta"] is not None:
            df.at[j, "__lon_prop__"], df.at[j, "__lat_prop__"] = \
                r["lon_propuesta"], r["lat_propuesta"]

        if detalle is not None and est in ESTADO_OBSERVADA:
            texto = regs[k].get("texto") or " ".join(
                x for x in (regs[k].get("hab"), regs[k].get("via"), regs[k].get("numero")) if x)
            detalle.append({
                "suministro": str(df.at[j, col_sum]),
                "localidad": _txt(df.at[j, "__loc__"]) if "__loc__" in df.columns else "",
                "estado": ESTADO_OBSERVADA[est],
                "lon_registrada": _num(lon[k]), "lat_registrada": _num(lat[k]),
                "lon_corregida": r["lon_propuesta"], "lat_corregida": r["lat_propuesta"],
                "direccion": texto,
                "motivo": r["motivo"],
            })
    resumen["fijadas_supervisor"] = manuales
    resumen["gis_sedalib"] = gis
    return resumen


def alertas_direccion(registros):
    """Alertas de carga segun el estado de direccion de sus registros."""
    corr = sum(1 for r in registros if r.get("estado_direccion") in ("corregida", "ubicada"))
    rev = sum(1 for r in registros if r.get("estado_direccion") == "revisar")
    out = []
    if rev:
        out.append("%d predio%s no cuadra%s con su direccion: revisar"
                   % (rev, "s" if rev > 1 else "", "n" if rev > 1 else ""))
    if corr:
        out.append("%d coordenada%s corregida%s por la direccion"
                   % (corr, "s" if corr > 1 else "", "s" if corr > 1 else ""))
    return out


def campos_direccion(it):
    """Campos extra de cada registro de carga para el front."""
    est = it.get("__dir_estado__")
    if not isinstance(est, str) or not est:
        return {}
    return {
        "estado_direccion": est,
        "nota_direccion": _txt(it.get("__dir_nota__")),
        "calle_mapa": _txt(it.get("__dir_calle__")),
        "lon_original": _num(it.get("__lon_orig__")),
        "lat_original": _num(it.get("__lat_orig__")),
        "origen_original": _txt(it.get("__origen_orig__")),
        "lon_propuesta": _num(it.get("__lon_prop__")),
        "lat_propuesta": _num(it.get("__lat_prop__")),
    }
