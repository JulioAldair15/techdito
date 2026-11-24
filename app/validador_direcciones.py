# -*- coding: utf-8 -*-
"""
=============================================================================
 VALIDADOR DIRECCION <-> COORDENADA
=============================================================================
Las coordenadas de la base no siempre son del predio: muchas las marco un
operario al ejecutar otra orden, a varias cuadras o en otra urbanizacion. Este
modulo lee la direccion (la columna que el usuario elige en el modal) y
comprueba si la coordenada cae donde la direccion dice.

Capas, de la mas barata a la mas cara:

  1. CALLE EN EL MAPA. Con las calles de OpenStreetMap descargadas al servidor
     (descargar_calles_osm.py) se mide la distancia del punto al tramo mas
     cercano de la calle que nombra la direccion. No hay una consulta a
     internet por registro: con miles de registros tarda segundos.
  2. URBANIZACION. Hay muchas "CALLE UNION" en Trujillo. Si el punto esta
     junto a una CALLE UNION pero lejos de su urbanizacion, esta en la
     equivocada.
  3. CONSENSO. Los predios de la misma calle y urbanizacion deberian quedar
     juntos; el que se aleja del grupo es sospechoso. Cubre las calles que
     OSM todavia no tiene.
  4. GEOCODIFICADOR, solo como segunda opinion: su resultado se acepta
     unicamente si cae sobre la calle correcta segun OSM.

Politica: una coordenada se REEMPLAZA solo si la nueva ubicacion tiene certeza
alta, es decir, cuando dos senales independientes coinciden (la calle del
mapa + su urbanizacion, la calle + otros predios ya verificados, o la calle +
el geocodificador). Si no, la coordenada se deja como esta, se marca "revisar"
y se adjunta la ubicacion propuesta para que el supervisor decida.

Estados que devuelve por registro:
  verificada    la coordenada esta sobre su calle (o junto a sus vecinos)
  aproximada    cerca de su calle, dentro de lo tolerable
  corregida     no correspondia; se reemplazo con certeza alta
  revisar       no corresponde, o es dudosa; se propone otra ubicacion
  ubicada       no tenia coordenada y la direccion la ubico con certeza alta
  sin_verificar no hay con que comparar (calle desconocida, sin vecinos...)
  sin_ubicar    no tenia coordenada y tampoco se pudo ubicar

Solo depende de numpy. Los nombres de OSM se usan bajo licencia ODbL
((c) colaboradores de OpenStreetMap).
"""
import json
import logging
import math
import os
import re
import threading
import unicodedata
from difflib import SequenceMatcher
from functools import lru_cache

import numpy as np

log = logging.getLogger(__name__)

# =============================================================================
#  CONFIGURACION (se puede pisar desde el CFG de routes.py con las mismas claves)
# =============================================================================
CFG_DEFECTO = {
    "DIR_TOL_OK_M": 150,            # hasta aqui de su calle: coordenada correcta
    "DIR_TOL_MAL_M": 400,           # mas alla de esto: no corresponde a su calle
    "DIR_ANCLA_MAX_M": 800,         # la calle correcta debe pasar a esto de su urbanizacion
    "DIR_HAB_MAX_M": 1500,          # un predio a mas de esto de su urbanizacion esta en otra
    "DIR_HAB_LEJOS_M": 2500,        # sin calle: a mas de esto de su urbanizacion -> revisar
    "DIR_SCORE_MIN": 0.75,          # parecido minimo de nombre para considerar una calle
    "DIR_SCORE_FUERTE": 0.90,       # parecido para afirmar "es esta calle"
    "DIR_CONSENSO_MIN": 3,          # predios de la misma calle para opinar por consenso
    "DIR_CONSENSO_TOL_M": 300,      # dispersion normal dentro de un grupo
    "DIR_CONSENSO_COMPACTO_M": 150, # grupo compacto = referencia confiable
    "DIR_MAX_GEOCODE": 150,         # segundas opiniones del geocodificador por proceso
    "DIR_TOL_REF_M": 250,           # a esto de su lote/manzana de catastro: correcta
    "DIR_APILADO_MIN": 4,           # predios DISTINTOS en un mismo punto = punto de zona, no de casa
    "DIR_ZONA_LEJOS_M": 2000,       # a un punto de zona solo se mueve si estaba a mas de esto
}

# Fuentes que ubican la CASA (un punto por predio). Si varios predios distintos
# caen exactamente en el mismo punto de una de estas, el dato esta repetido.
FUENTES_PREDIO = ("lote catastral", "historial de visitas", "numeracion")
# Fuente que ubica la MANZANA: varios predios de la misma manzana en su centro
# es normal (estan ahi), no un error.
FUENTES_MANZANA = ("manzana catastral",)
_DESC_ZONA = {
    "consenso": "el centro de los otros predios de la calle",
    "urbanizacion": "el tramo de la calle que pasa por su sector",
    "geocodificador": "el geocodificador no distingue la casa",
    "calle": "un punto de la calle",
}

# =============================================================================
#  NORMALIZACION
# =============================================================================
_PRE = [
    (re.compile(r"\bN\s*[°º]"), " NRO "),
    (re.compile(r"\bS\s*/\s*N\b"), " SINNUM "),
    (re.compile(r"\bA\s*\.?\s*A\s*\.?\s*H\s*\.?\s*H\b\.?"), " AAHH "),
    (re.compile(r"\bP\s*\.?\s*P\s*\.?\s*J\s*\.?\s*J\b\.?"), " PPJJ "),
    (re.compile(r"\bA\s*\.\s*H\b\.?"), " AAHH "),
    (re.compile(r"\bC\s*\.\s*P\b\.?"), " CP "),
]


def norm(v):
    """Mayusculas, sin tildes, sin signos; conserva el guion de 'B-8'."""
    if v is None:
        return ""
    t = str(v)
    if t.strip().lower() in ("nan", "none", "null", "-"):
        return ""
    t = t.upper()
    for rx, rep in _PRE:
        t = rx.sub(rep, t)
    t = unicodedata.normalize("NFKD", t).encode("ascii", "ignore").decode("ascii")
    t = re.sub(r"[`'\"]", "", t)                 # K'-17 -> K-17
    t = re.sub(r"[^A-Z0-9\- ]", " ", t)
    t = _RX_MZLT_SUELTO.sub(_unir_mzlt, t)
    t = re.sub(r"(?<![A-Z0-9])-|-(?![A-Z0-9])", " ", t)
    return " ".join(t.split())


# 'SINCHI ROCA G - 18': la G no es parte del nombre, es manzana G lote 18.
# (No se toca 'PASAJE A - 12', donde la A si es el nombre.)
_RX_MZLT_SUELTO = re.compile(r"\b([A-Z]{3,})\s+([A-Z])\s*-\s*(\d{1,3}[A-Z]?)\b")


def _unir_mzlt(m):
    if m.group(1) in _MARCADORES:
        return m.group(0)
    return "%s %s-%s" % (m.group(1), m.group(2), m.group(3))


_ABREV = {
    "STO": "SANTO", "STA": "SANTA", "STGO": "SANTIAGO", "GRAL": "GENERAL",
    "GNRAL": "GENERAL", "CNEL": "CORONEL", "CRNEL": "CORONEL", "TTE": "TENIENTE",
    "TNTE": "TENIENTE", "MCAL": "MARISCAL", "PDTE": "PRESIDENTE", "PRES": "PRESIDENTE",
    "DR": "DOCTOR", "ING": "INGENIERO", "PROF": "PROFESOR", "CAP": "CAPITAN",
    "CAPT": "CAPITAN", "SGTO": "SARGENTO", "ALM": "ALMIRANTE", "ALMTE": "ALMIRANTE",
    "MONS": "MONSENOR", "FCO": "FRANCISCO", "NTRA": "NUESTRA", "NSTRA": "NUESTRA",
    "SRA": "SENORA", "SR": "SENOR", "STMA": "SANTISIMA", "PBRO": "PRESBITERO",
    "HNOS": "HERMANOS", "JJ": "JUAN JOSE",
}
_STOP = {"DE", "DEL", "LA", "LAS", "LOS", "EL", "Y", "E", "LO"}
_MESES = {"ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO", "JULIO", "AGOSTO",
          "SETIEMBRE", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"}

# Tipo de via -> nombre canonico
_VIA = {
    "AV": "AVENIDA", "AVE": "AVENIDA", "AVDA": "AVENIDA", "AVENIDA": "AVENIDA",
    "CA": "CALLE", "CAL": "CALLE", "CALL": "CALLE", "CALLE": "CALLE", "CL": "CALLE",
    "JR": "JIRON", "JIR": "JIRON", "JIRON": "JIRON",
    "PS": "PASAJE", "PSJ": "PASAJE", "PSJE": "PASAJE", "PJE": "PASAJE", "PASAJE": "PASAJE",
    "PROL": "PROLONGACION", "PROLONG": "PROLONGACION", "PROLONGACION": "PROLONGACION",
    "PR": "PROLONGACION",
    "ML": "MALECON", "MLC": "MALECON", "MALECON": "MALECON",
    "AL": "ALAMEDA", "ALAM": "ALAMEDA", "ALAMEDA": "ALAMEDA",
    "OV": "OVALO", "OVALO": "OVALO", "PQ": "PARQUE", "PARQUE": "PARQUE",
    "PZ": "PLAZA", "PLZ": "PLAZA", "PLAZA": "PLAZA",
    "CARR": "CARRETERA", "CARRET": "CARRETERA", "CARRETERA": "CARRETERA",
    "CAM": "CAMINO", "CAMINO": "CAMINO", "BLV": "BOULEVARD", "BOULEVARD": "BOULEVARD",
    "BULEVAR": "BOULEVARD", "TROCHA": "TROCHA", "VIA": "VIA",
}
# Tipo de habilitacion urbana -> nombre canonico
_HAB = {
    "URB": "URBANIZACION", "URBA": "URBANIZACION", "URBANIZ": "URBANIZACION",
    "URBANIZACION": "URBANIZACION",
    "AAHH": "ASENTAMIENTO HUMANO", "AH": "ASENTAMIENTO HUMANO",
    "ASENT": "ASENTAMIENTO HUMANO", "ASENTAMIENTO": "ASENTAMIENTO HUMANO",
    "PPJJ": "PUEBLO JOVEN", "COOP": "COOPERATIVA", "COOPERATIVA": "COOPERATIVA",
    "RES": "RESIDENCIAL", "RESID": "RESIDENCIAL", "RESIDENCIAL": "RESIDENCIAL",
    "CONJ": "CONJUNTO HABITACIONAL", "CH": "CONJUNTO HABITACIONAL",
    "CONJUNTO": "CONJUNTO HABITACIONAL",
    "SECTOR": "SECTOR", "SECT": "SECTOR", "SEC": "SECTOR",
    "ASOC": "ASOCIACION", "ASOCIACION": "ASOCIACION",
    "BARRIO": "BARRIO", "BARR": "BARRIO", "CASERIO": "CASERIO", "CAS": "CASERIO",
    "CP": "CENTRO POBLADO", "CPM": "CENTRO POBLADO", "ANEXO": "ANEXO",
    "LOTIZ": "LOTIZACION", "LOTIZACION": "LOTIZACION",
    "HAB": "HABILITACION", "HABILITACION": "HABILITACION", "ZONA": "ZONA",
}
_MZ = {"MZ", "MZA", "MANZ", "MANZANA"}
_LT = {"LT", "LTE", "LOTE"}
_NUM_MARK = {"NRO", "NUM", "NO", "NUMERO", "N"}
_EXTRA = {"INT", "INTERIOR", "DPTO", "DPT", "DEP", "DEPA", "DEPARTAMENTO", "PISO",
          "OF", "OFICINA", "BLOCK", "BLQ", "TDA", "TIENDA", "STAND", "PUESTO", "KM",
          "CDRA", "CUADRA", "REF", "REFERENCIA", "ALT", "ALTURA"}
_MARCADORES = set(_VIA) | set(_HAB) | _MZ | _LT | _NUM_MARK | _EXTRA | {"PJ"}
# Palabras de tipo que se quitan al inicio de un nombre para compararlo
_PALABRAS_TIPO = (set(_VIA) | set(_HAB) | {"PJ"} | set(_VIA.values()) |
                  {w for v in _HAB.values() for w in v.split()})
# Numeros escritos de otra forma: todo se lleva a digitos para comparar.
# 'BARRIO II A' = 'BARRIO 2A', 'CA 07 DE JULIO' = 'Calle 7 de Julio',
# 'SIETE DE JULIO' = '7 DE JULIO', 'PRIMERO DE MAYO' = '1 DE MAYO'.
_ROMANOS = {"I": "1", "II": "2", "III": "3", "IV": "4", "V": "5", "VI": "6", "VII": "7",
            "VIII": "8", "IX": "9", "X": "10", "XI": "11", "XII": "12", "XIII": "13",
            "XIV": "14", "XV": "15", "XX": "20"}
_NUM_PALABRA = {
    "UNO": "1", "PRIMERO": "1", "DOS": "2", "TRES": "3", "CUATRO": "4", "CINCO": "5",
    "SEIS": "6", "SIETE": "7", "OCHO": "8", "NUEVE": "9", "DIEZ": "10", "ONCE": "11",
    "DOCE": "12", "TRECE": "13", "CATORCE": "14", "QUINCE": "15", "DIECISEIS": "16",
    "DIECISIETE": "17", "DIECIOCHO": "18", "DIECINUEVE": "19", "VEINTE": "20",
    "VEINTIUNO": "21", "VEINTIDOS": "22", "VEINTITRES": "23", "VEINTICUATRO": "24",
    "VEINTICINCO": "25", "VEINTISEIS": "26", "VEINTISIETE": "27", "VEINTIOCHO": "28",
    "VEINTINUEVE": "29", "TREINTA": "30",
}
# En urbanizaciones, 'II ETAPA' o 'SEGUNDA ETAPA' no distingue el lugar: se quita
# la palabra ETAPA y el numero pegado a ella (y solo ese numero).
_ORDINALES_ETAPA = {"PRIMERA": "1", "SEGUNDA": "2", "TERCERA": "3", "CUARTA": "4",
                    "QUINTA": "5", "SEXTA": "6"}
_RX_ALNUM = re.compile(r"^(\d+)([A-Z])$")

# Distritos, provincias y region: si aparecen sueltos al final de la direccion
# son la referencia geografica, no la urbanizacion.
_NO_HAB = {
    "TRUJILLO", "VICTOR LARCO", "VICTOR LARCO HERRERA", "EL PORVENIR", "PORVENIR",
    "LA ESPERANZA", "FLORENCIA DE MORA", "HUANCHACO", "MOCHE", "SALAVERRY", "LAREDO",
    "CHEPEN", "PACANGUILLA", "PAIJAN", "CHOCOPE", "PUERTO MALABRIGO", "RAZURI",
    "PACASMAYO", "ASCOPE", "LA LIBERTAD", "PERU", "TRUJILLO LA LIBERTAD",
}

_RX_NUM = re.compile(r"^\d{1,5}[A-Z]?$|^\d{1,5}-[A-Z0-9]{1,3}$")
_RX_COD = re.compile(r"^[A-Z]{1,2}-\d{1,3}[A-Z]?$|^[A-Z]\d{1,3}$|^[A-Z]{1,2}\d{1,2}-\d{1,3}[A-Z]?$")


def _es_numero(tk):
    return bool(_RX_NUM.match(tk))


def _es_codigo(tk):
    return bool(_RX_COD.match(tk))


def _es_debil(t):
    """Un numero o una letra suelta: no alcanza para nombrar un lugar solo."""
    return t.isdigit() or len(t) == 1


def tokens_nombre(texto, lugar=False):
    """Tokens comparables de un nombre de calle o de urbanizacion: sin el tipo
    al inicio (AV, CALLE, URB...), con abreviaturas expandidas, numeros en
    digitos y sin articulos.

    El tipo se conserva cuando lo que queda es solo un numero o una letra:
    'CALLE 2', 'PASAJE A', 'BARRIO 2 A', 'SECTOR 3'. Sin el, 'BARRIO II A' y
    'BARRIO I A' quedarian los dos como 'A' y se confundirian."""
    toks = []
    for t in norm(texto).split():
        for u in _ABREV.get(t, t).split():
            for w in u.split("-"):
                if not w:
                    continue
                m = _RX_ALNUM.match(w)                  # 2A -> 2 A
                toks.extend([m.group(1), m.group(2)] if m else [w])
    salida = []
    for t in toks:
        if t.isdigit():
            t = str(int(t))                             # 07 -> 7
        elif t in _ROMANOS:
            t = _ROMANOS[t]
        elif t in _NUM_PALABRA:
            t = _NUM_PALABRA[t]
        salida.append(t)
    toks = salida

    quitados = []
    while len(toks) > 1 and toks[0] in _PALABRAS_TIPO:
        quitados.append(toks.pop(0))
    toks = [t for t in toks if t not in _STOP]
    if quitados and (not toks or all(_es_debil(t) for t in toks)):
        tipo = quitados[-1]
        tipo = _VIA.get(tipo) or _HAB.get(tipo) or tipo
        toks = [tipo.split()[0]] + toks
    if lugar and "ETAPA" in toks:
        k = toks.index("ETAPA")
        quitar = {k}
        for j in (k - 1, k + 1):
            if 0 <= j < len(toks) and (toks[j].isdigit() or toks[j] in _ORDINALES_ETAPA):
                quitar.add(j)
        resto = [t for j, t in enumerate(toks) if j not in quitar]
        toks = resto or toks
    return toks


def clave_nombre(texto):
    return " ".join(tokens_nombre(texto))


def clave_lugar(texto):
    return " ".join(tokens_nombre(texto, lugar=True))


@lru_cache(maxsize=300000)
def _ratio(a, b):
    """Parecido entre dos palabras (0 si es menor a 0.8). Cacheado: las mismas
    palabras se comparan miles de veces."""
    la, lb = len(a), len(b)
    if 2.0 * min(la, lb) / (la + lb) < 0.8:          # longitudes muy distintas
        return 0.0
    sm = SequenceMatcher(None, a, b)
    if sm.real_quick_ratio() < 0.8 or sm.quick_ratio() < 0.8:
        return 0.0
    r = sm.ratio()
    return r if r >= 0.8 else 0.0


def _sim_token(a, b, iniciales):
    if a == b:
        return 1.0
    if iniciales and (len(a) == 1 or len(b) == 1):
        return 0.9 if a[0] == b[0] else 0.0
    if len(a) == 1 or len(b) == 1 or a.isdigit() or b.isdigit():
        return 0.0
    return _ratio(a, b) if a < b else _ratio(b, a)


def similitud(ta, tb):
    """Parecido entre dos nombres ya tokenizados, de 0 a 1.
    Tolera iniciales ('H HERNANDEZ' ~ 'HERMILIO HERNANDEZ'), errores de tipeo
    ('COCOTERO' ~ 'COCOTEROS') y apellidos de mas ('RICARDO PALMA' ~
    'RICARDO PALMA SORIANO'). Si los numeros no coinciden es 0: 'CALLE 2' no
    es 'CALLE 3' ni '28 DE JULIO' es '9 DE OCTUBRE'."""
    if not ta or not tb:
        return 0.0
    if sorted(t for t in ta if t.isdigit()) != sorted(t for t in tb if t.isdigit()):
        return 0.0
    corto, largo = (ta, tb) if len(ta) <= len(tb) else (tb, ta)
    iniciales = len(corto) >= 2 and len(largo) >= 2
    usados, total = set(), 0.0
    for t in corto:
        mejor, jm = 0.0, None
        for j, u in enumerate(largo):
            if j in usados:
                continue
            s = _sim_token(t, u, iniciales)
            if s > mejor:
                mejor, jm = s, j
        if jm is not None:
            usados.add(jm)
        total += mejor
    precision = total / len(corto)
    cobertura = len(corto) / float(len(largo))
    return 0.75 * precision + 0.25 * cobertura


# =============================================================================
#  LECTOR DE DIRECCIONES
# =============================================================================
def _tipo_de(tk, es_primero):
    if tk == "PJ":                       # al inicio es Pueblo Joven, despues Pasaje
        return ("hab", "PUEBLO JOVEN") if es_primero else ("via", "PASAJE")
    if tk in _VIA:
        return ("via", _VIA[tk])
    if tk in _HAB:
        return ("hab", _HAB[tk])
    return None


def _vacio():
    return {"texto": "", "hab_tipo": "", "hab": "", "via_tipo": "", "via": "",
            "numero": "", "mz": "", "lt": ""}


_RX_PREFIJO = re.compile(r"^\s*([^-]{2,40}?)\s+-\s+(.+)$", re.S)


def _quitar_localidad(texto, localidad=None):
    """'EL PORVENIR - SECT BARRIO I A D-8' -> 'SECT BARRIO I A D-8'.
    El distrito o la localidad al inicio no es la calle ni el sector (antes se
    leia 'EL PORVENIR' como si fuera la Avenida El Porvenir)."""
    loc = norm(localidad)
    nombres = set(_NO_HAB)
    if loc and not loc.startswith(("OTRA", "SIN ")):
        nombres.add(loc)
    m = _RX_PREFIJO.match(str(texto))
    if m:
        pre, resto = norm(m.group(1)), norm(m.group(2))
        pri_pre = pre.split()[0] if pre else ""
        pri_resto = resto.split()[0] if resto else ""
        if (pre and resto and pri_pre not in _MARCADORES and pri_resto in _MARCADORES and
                (pre in nombres or pri_resto in _HAB or pri_resto == "PJ")):
            return resto
    t = norm(texto)
    for nom in sorted(nombres, key=len, reverse=True):
        if t.startswith(nom + " "):
            sig = t[len(nom) + 1:].split()
            if sig and sig[0] in _MARCADORES:
                return t[len(nom) + 1:]
    return t


def parsear_direccion(texto, localidad=None):
    """
    'URBA PALERMO CA UNION 192 INT 7'
        -> hab_tipo URBANIZACION, hab PALERMO, via_tipo CALLE, via UNION, numero 192
    'URBA STO DOMINGUITO AV RICARDO PALMA 760'
        -> hab STO DOMINGUITO, via RICARDO PALMA, numero 760
    'AAHH ALTO TRUJILLO MZ A LT 5' -> hab ALTO TRUJILLO, mz A, lt 5 (sin via)
    'AV 28 DE JULIO 450'           -> via 28 DE JULIO, numero 450
    """
    out = _vacio()
    t = _quitar_localidad(texto, localidad)
    out["texto"] = t
    if not t:
        return out
    toks = t.split()
    n = len(toks)
    segs = []
    estado = {"seg": None}

    def cerrar():
        s = estado["seg"]
        if s is not None and s["nombre"]:
            segs.append(s)
        estado["seg"] = None

    i = 0
    while i < n:
        tk = toks[i]
        sig = toks[i + 1] if i + 1 < n else ""
        seg = estado["seg"]
        if tk in ("PR", "PROL", "PROLONG", "PROLONGACION") and sig in _VIA:
            i += 1                              # 'PR CA SINCHI ROCA': prolongacion de esa calle
            continue
        if tk in _MZ or tk in _LT:
            cerrar()
            campo = "mz" if tk in _MZ else "lt"
            if sig and sig not in _MARCADORES:
                out[campo] = out[campo] or sig
                i += 2
            else:
                i += 1
            continue
        if tk in _NUM_MARK and sig and (_es_numero(sig) or sig in ("SN", "SINNUM")):
            cerrar()
            out["numero"] = out["numero"] or ("SN" if sig in ("SN", "SINNUM") else sig)
            i += 2
            continue
        if tk in _EXTRA:
            cerrar()
            i += 2 if (sig and sig not in _MARCADORES) else 1
            continue
        if tk == "SINNUM" or (tk == "SN" and seg is not None and seg["clase"] == "via"
                              and seg["nombre"]):
            cerrar()
            out["numero"] = out["numero"] or "SN"
            i += 1
            continue
        tipo = _tipo_de(tk, i == 0)
        if tipo and (seg is None or seg["nombre"]):
            cerrar()
            estado["seg"] = {"clase": tipo[0], "tipo": tipo[1], "nombre": []}
            i += 1
            continue
        if _es_numero(tk):
            en_nombre = (i + 2 < n and toks[i + 1] == "DE" and toks[i + 2] in _MESES)
            if seg is not None and (not seg["nombre"] or en_nombre):
                seg["nombre"].append(tk)        # CALLE 2, AV 28 DE JULIO, SECTOR 3
                i += 1
                continue
            cerrar()
            out["numero"] = out["numero"] or tk
            i += 1
            continue
        if _es_codigo(tk) and not (seg is not None and not seg["nombre"]):
            cerrar()
            out["mz"] = out["mz"] or tk         # B-8, K-17: manzana-lote
            i += 1
            continue
        if seg is None:
            hay_via = any(s["clase"] == "via" for s in segs)
            hay_hab = any(s["clase"] == "hab" for s in segs)
            if out["numero"] or out["mz"] or hay_via:
                clase = "hab" if not hay_hab else None   # 'AV ESPANA 123 EL BOSQUE'
            else:
                clase = "via"
            if clase is None:
                i += 1
                continue
            estado["seg"] = seg = {"clase": clase, "tipo": "", "nombre": []}
        seg["nombre"].append(tk)
        i += 1
    cerrar()

    # Un texto que arranca sin marcador ('PALERMO CA UNION 192') era la
    # urbanizacion, no la via: si despues aparece una via explicita, se corrige.
    implicitas = [s for s in segs if s["clase"] == "via" and not s["tipo"]]
    explicitas = [s for s in segs if s["clase"] == "via" and s["tipo"]]
    if implicitas and explicitas and not any(s["clase"] == "hab" for s in segs):
        implicitas[0]["clase"] = "hab"

    # Un distrito o la region al final ('JR PIZARRO 345 - TRUJILLO') no es una
    # urbanizacion: se descarta si llego sin marcador.
    segs = [s for s in segs if not (s["clase"] == "hab" and not s["tipo"] and
                                    " ".join(s["nombre"]) in _NO_HAB)]
    hab = next((s for s in segs if s["clase"] == "hab"), None)
    via = next((s for s in segs if s["clase"] == "via" and s["tipo"]), None) or \
        next((s for s in segs if s["clase"] == "via"), None)
    if hab:
        out["hab_tipo"], out["hab"] = hab["tipo"], " ".join(hab["nombre"])
    if via:
        out["via_tipo"], out["via"] = via["tipo"], " ".join(via["nombre"])
    return out


def parsear_partes(hab="", via="", numero=""):
    """Para Excels con la direccion partida en columnas."""
    hab, via, numero = norm(hab), norm(via), norm(numero)
    out = parsear_direccion(" ".join(x for x in (via, numero) if x)) if via else _vacio()
    if hab:
        primero = hab.split()[0]
        ph = parsear_direccion(hab if (primero in _HAB or primero == "PJ") else "URB " + hab)
        if ph["hab"]:
            out["hab_tipo"], out["hab"] = ph["hab_tipo"], ph["hab"]
        for k in ("mz", "lt"):
            out[k] = out[k] or ph[k]
    if numero and not out["numero"] and _es_numero(numero):
        out["numero"] = numero
    out["texto"] = " ".join(x for x in (hab, via, numero) if x)
    return out


# =============================================================================
#  GEOMETRIA
# =============================================================================
class Proyeccion:
    """Proyeccion plana local en metros. Para distancias de cientos de metros
    a decenas de km el error es despreciable y no hace falta pyproj."""

    def __init__(self, lat0, lon0):
        self.lat0, self.lon0 = float(lat0), float(lon0)
        self.kx = 111320.0 * math.cos(math.radians(self.lat0))
        self.ky = 110574.0

    def xy(self, lon, lat):
        return ((lon - self.lon0) * self.kx, (lat - self.lat0) * self.ky)

    def xy_arr(self, lonlat):
        a = np.asarray(lonlat, dtype="float64")
        return np.column_stack(((a[:, 0] - self.lon0) * self.kx,
                                (a[:, 1] - self.lat0) * self.ky))

    def lonlat(self, x, y):
        return (self.lon0 + x / self.kx, self.lat0 + y / self.ky)


class Instancia:
    """Un tramo continuo de una calle con nombre (varias 'ways' de OSM unidas).
    Dos calles homonimas en urbanizaciones distintas son instancias distintas."""
    __slots__ = ("nombre", "A", "B", "centro")

    def __init__(self, nombre, polilineas):
        self.nombre = nombre
        A = np.vstack([p[:-1] for p in polilineas])
        B = np.vstack([p[1:] for p in polilineas])
        self.A, self.B = A, B
        pts = np.vstack(polilineas)
        self.centro = pts.mean(axis=0)

    def distancia(self, p):
        """(distancia_m, x, y) del punto mas cercano de la calle a p."""
        AB = self.B - self.A
        L2 = (AB ** 2).sum(axis=1)
        L2[L2 == 0] = 1e-9
        t = np.clip(((p[0] - self.A[:, 0]) * AB[:, 0] +
                     (p[1] - self.A[:, 1]) * AB[:, 1]) / L2, 0.0, 1.0)
        qx = self.A[:, 0] + AB[:, 0] * t
        qy = self.A[:, 1] + AB[:, 1] * t
        d = np.hypot(qx - p[0], qy - p[1])
        k = int(np.argmin(d))
        return float(d[k]), float(qx[k]), float(qy[k])


# =============================================================================
#  INDICE DE CALLES (OpenStreetMap)
# =============================================================================
class IndiceCalles:
    """Calles con nombre, urbanizaciones y numeracion de OSM, en metros."""

    UNION_M = 150.0   # extremos de 'ways' homonimas a menos de esto = misma calle

    def __init__(self, datos):
        bbox = datos.get("bbox") or [-8.30, -79.60, -7.10, -78.85]
        self.proy = Proyeccion((bbox[0] + bbox[2]) / 2.0, (bbox[1] + bbox[3]) / 2.0)
        self.generado = datos.get("generado", "")
        self.bbox = bbox
        # Trozos que de verdad se descargaron. Si Overpass fallo en alguno, esa
        # zona no se usa para juzgar coordenadas (no hay calles con que comparar).
        cob = datos.get("cobertura")
        self.cobertura = [tuple(b) for b in cob] if cob else [tuple(bbox)]
        self.faltan = list(datos.get("faltan") or [])
        self._calles = {}
        for c in datos.get("calles") or []:
            g = c.get("g") or []
            if len(g) < 2:
                continue
            xy = self.proy.xy_arr(g)
            nombres = [c.get("n")] + list(c.get("a") or [])
            vistos = set()
            for nom in nombres:
                k = clave_nombre(nom)
                if not k or k in vistos:
                    continue
                vistos.add(k)
                e = self._calles.setdefault(k, {"nombre": c.get("n") or nom,
                                                "tokens": k.split(), "ways": []})
                e["ways"].append(xy)
        self._pref = {}
        for k, e in self._calles.items():
            e["prefijos"] = {t[:4] for t in e["tokens"]}
            e["iniciales"] = {t[0] for t in e["tokens"]}
            for t in e["tokens"]:
                if len(t) >= 2 or len(e["tokens"]) == 1:
                    self._pref.setdefault(t[:4], set()).add(k)

        self._lugares = {}
        for l in datos.get("lugares") or []:
            k = clave_lugar(l.get("n"))
            cc = l.get("c")
            if not k or not cc:
                continue
            x, y = self.proy.xy(cc[0], cc[1])
            e = self._lugares.setdefault(k, {"nombre": l.get("n"), "tokens": k.split(),
                                             "pts": []})
            e["pts"].append((x, y))
        self._pref_lug = {}
        for k, e in self._lugares.items():
            for t in e["tokens"]:
                self._pref_lug.setdefault(t[:4], set()).add(k)

        self._numeros = {}
        for h in datos.get("numeros") or []:
            ks, num, cc = clave_nombre(h.get("s")), norm(h.get("h")).replace(" ", ""), h.get("c")
            if ks and num and cc:
                self._numeros.setdefault((ks, num), []).append(self.proy.xy(cc[0], cc[1]))

        self._inst = {}
        self._cache_calle = {}
        self._cache_lugar = {}
        self._lock = threading.Lock()

    @property
    def n_calles(self):
        return len(self._calles)

    def cubre(self, lon, lat, margen=0.004):
        """True si el punto y sus alrededores (~440 m) estan dentro de trozos
        descargados: cerca del borde de una zona que no llego, la calle
        correcta podria estar justo del otro lado."""
        for dlon, dlat in ((0, 0), (margen, 0), (-margen, 0), (0, margen), (0, -margen)):
            x, y = lon + dlon, lat + dlat
            if not any(s <= y <= n and w <= x <= e for s, w, n, e in self.cobertura):
                return False
        return True

    def _candidatos(self, toks, pref):
        cand = set()
        for t in toks:
            if len(t) >= 2 or len(toks) == 1:
                cand |= pref.get(t[:4], set())
        return cand

    def buscar_calle(self, nombre, score_min=0.75):
        """[(score, clave), ...] de mayor a menor parecido."""
        toks = tokens_nombre(nombre)
        llave = (" ".join(toks), score_min)
        if llave in self._cache_calle:
            return self._cache_calle[llave]
        res = []
        for k in self._candidatos(toks, self._pref):
            e = self._calles[k]
            # Cota rapida antes de comparar letra por letra: cuantas palabras de
            # la consulta tienen siquiera el mismo comienzo en este nombre.
            aciertos = sum(1 for t in toks if t[:4] in e["prefijos"] or
                           (len(t) == 1 and t in e["iniciales"]))
            corto = min(len(toks), len(e["tokens"]))
            cota = (0.75 * min(aciertos, corto) / corto +
                    0.25 * corto / max(len(toks), len(e["tokens"])))
            if cota < score_min:
                continue
            s = similitud(toks, e["tokens"])
            if s >= score_min:
                res.append((round(s, 3), k))
        res.sort(key=lambda x: -x[0])
        res = res[:12]
        self._cache_calle[llave] = res
        return res

    def nombre_calle(self, clave):
        return self._calles[clave]["nombre"]

    def instancias(self, clave):
        with self._lock:
            if clave in self._inst:
                return self._inst[clave]
            e = self._calles[clave]
            ways = e["ways"]
            padre = list(range(len(ways)))

            def raiz(a):
                while padre[a] != a:
                    padre[a] = padre[padre[a]]
                    a = padre[a]
                return a

            if len(ways) > 1:
                ext = np.array([[w[0][0], w[0][1], w[-1][0], w[-1][1]] for w in ways])
                for a in range(len(ways)):
                    pa = ext[a].reshape(2, 2)
                    for b in range(a + 1, len(ways)):
                        pb = ext[b].reshape(2, 2)
                        d = np.hypot(pa[:, None, 0] - pb[None, :, 0],
                                     pa[:, None, 1] - pb[None, :, 1]).min()
                        if d <= self.UNION_M:
                            padre[raiz(a)] = raiz(b)
            grupos = {}
            for w in range(len(ways)):
                grupos.setdefault(raiz(w), []).append(ways[w])
            inst = [Instancia(e["nombre"], g) for g in grupos.values()]
            self._inst[clave] = inst
            return inst

    def buscar_lugar(self, nombre, score_min=0.85):
        """Puntos (x, y) de las urbanizaciones/sectores que se llaman asi."""
        toks = tokens_nombre(nombre, lugar=True)
        llave = " ".join(toks)
        if llave in self._cache_lugar:
            return self._cache_lugar[llave]
        pts, mejor = [], 0.0
        for k in self._candidatos(toks, self._pref_lug):
            s = similitud(toks, self._lugares[k]["tokens"])
            if s >= score_min:
                if s > mejor + 0.05:          # nos quedamos con los nombres mas parecidos
                    pts, mejor = list(self._lugares[k]["pts"]), s
                elif s >= mejor - 0.05:
                    pts.extend(self._lugares[k]["pts"])
                    mejor = max(mejor, s)
        self._cache_lugar[llave] = pts
        return pts

    def numero(self, clave, numero):
        return list(self._numeros.get((clave, numero.replace(" ", "")), []))


_INDICE = {"ruta": None, "mtime": None, "obj": None, "error": ""}
_LOCK_INDICE = threading.Lock()


def cargar_indice(ruta):
    """Carga (y cachea mientras el archivo no cambie) el mapa de calles.
    Devuelve None si el archivo no existe o no se puede leer."""
    if not ruta or not os.path.exists(ruta):
        _INDICE["error"] = "no existe el archivo %s" % ruta
        return None
    mt = os.path.getmtime(ruta)
    with _LOCK_INDICE:
        if (_INDICE["obj"] is not None and _INDICE["ruta"] == ruta and
                _INDICE["mtime"] == mt):
            return _INDICE["obj"]
        try:
            with open(ruta, encoding="utf-8") as f:
                obj = IndiceCalles(json.load(f))
        except Exception as e:                      # pragma: no cover
            log.error("No se pudo leer el mapa de calles %s: %s", ruta, e)
            _INDICE["error"] = "no se pudo leer %s (%s)" % (ruta, type(e).__name__)
            return None
        _INDICE.update(ruta=ruta, mtime=mt, obj=obj, error="")
        log.info("Mapa de calles cargado: %d nombres de calle (%s)", obj.n_calles, ruta)
        return obj


def error_indice():
    return _INDICE.get("error", "")


# =============================================================================
#  VALIDADOR
# =============================================================================
def _f(v):
    try:
        f = float(v)
    except (TypeError, ValueError):
        return None
    return f if math.isfinite(f) else None


def _centro_robusto(pts, tol):
    """Mediana, mascara de puntos que la acompanan y su dispersion (mediana de
    distancias). Aguanta que casi la mitad del grupo este mal."""
    m = np.median(pts, axis=0)
    d = np.hypot(pts[:, 0] - m[0], pts[:, 1] - m[1])
    mad = float(np.median(np.abs(d - np.median(d)))) * 1.4826
    lim = max(tol, 3.0 * mad)
    inl = d <= lim
    if inl.any():
        m = np.median(pts[inl], axis=0)
    d2 = np.hypot(pts[:, 0] - m[0], pts[:, 1] - m[1])
    disp = float(np.median(d2[inl])) if inl.any() else float("inf")
    return m, inl, disp, lim


_TIPO_CORTO = {"URBANIZACION": "Urb.", "ASENTAMIENTO HUMANO": "AA.HH.",
               "PUEBLO JOVEN": "P.J.", "CONJUNTO HABITACIONAL": "Conj. Hab.",
               "CENTRO POBLADO": "C.P.", "COOPERATIVA": "Coop.", "": ""}


def _bonito(txt):
    """'STO DOMINGUITO' -> 'Santo Dominguito', 'LOS JAZMINES' -> 'los Jazmines'."""
    out = []
    for k, t in enumerate(" ".join(_ABREV.get(w, w) for w in str(txt).split()).split()):
        out.append(t.lower() if (k and t in _STOP) else t.capitalize())
    return " ".join(out)


def _via_completa(p):
    """'CALLE' + '2' -> 'CALLE 2': el tipo cuenta cuando el nombre es un numero."""
    return ("%s %s" % (p.get("via_tipo") or "", p.get("via") or "")).strip()


def _km(m):
    return "%.1f km" % (m / 1000.0) if m >= 1000 else "%d m" % int(round(m))


def _clave_predio(i, registros, partes, k_via, k_hab, k_loc):
    """Identifica el predio: su lote de catastro, o calle + numero (o mz-lt).
    Sin numero no se puede saber si dos filas son la misma casa: cuenta aparte."""
    ref = registros[i].get("ref") or {}
    if ref.get("predio"):
        return ("ref",) + tuple(ref["predio"])
    p = partes[i]
    num = (p.get("numero") or "").strip()
    if num == "SN":
        num = ""
    mzlt = ("%s %s" % (p.get("mz") or "", p.get("lt") or "")).strip()
    if num or mzlt:
        return ("dir", k_via[i], k_hab[i], k_loc[i], num, mzlt)
    return ("fila", i)


def _anti_apilado(res, registros, partes, k_via, k_hab, k_loc, P0, tiene0, proy,
                  minimo=4, lejos=2000.0, radio=3.0):
    """Revisa los destinos que comparten varios predios distintos (ver capa 5).
    Devuelve cuantos registros dejo de mover."""
    idx = [i for i, r in enumerate(res)
           if r["estado"] in ("corregida", "ubicada") and r["lon_propuesta"] is not None]
    if len(idx) < minimo:
        return 0
    xy = {i: proy.xy(float(res[i]["lon_propuesta"]), float(res[i]["lat_propuesta"]))
          for i in idx}
    # Agrupa destinos a menos de 'radio' metros (rejilla + vecinos: sin scipy)
    celdas = {}
    for i in idx:
        x, y = xy[i]
        celdas.setdefault((int(math.floor(x / radio)), int(math.floor(y / radio))), []).append(i)
    padre = {i: i for i in idx}

    def raiz(a):
        while padre[a] != a:
            padre[a] = padre[padre[a]]
            a = padre[a]
        return a
    for (cx, cy), lista in celdas.items():
        for dx in (-1, 0, 1):
            for dy in (-1, 0, 1):
                for j in celdas.get((cx + dx, cy + dy), ()):
                    for i in lista:
                        if i < j and math.hypot(xy[i][0] - xy[j][0], xy[i][1] - xy[j][1]) <= radio:
                            padre[raiz(j)] = raiz(i)
    pilas = {}
    for i in idx:
        pilas.setdefault(raiz(i), []).append(i)

    frenadas = 0
    for miembros in pilas.values():
        distintos = {_clave_predio(i, registros, partes, k_via, k_hab, k_loc) for i in miembros}
        n = len(distintos)
        if n < minimo:
            continue                     # misma casa (varios suministros) o pocos
        fuentes = {res[i]["fuente"] for i in miembros}
        if fuentes <= set(FUENTES_MANZANA):
            for i in miembros:
                res[i]["motivo"] += " (centro de su manzana, junto con otros %d predios de ella)" % (n - 1)
            continue
        for i in miembros:
            r = res[i]
            f = r["fuente"]
            if f in FUENTES_PREDIO:
                # 'la casa' de muchos predios distintos en el mismo punto: dato repetido
                if r["estado"] == "corregida":
                    r.update(estado="revisar", certeza="",
                             motivo="%s; NO se movio: esa misma ubicacion la tienen otros %d "
                                    "predios distintos (dato repetido en %s)"
                                    % (r["motivo"].split("; se ")[0], n - 1, f))
                else:
                    r.update(estado="sin_ubicar", certeza="",
                             motivo="sin coordenada; la ubicacion de su %s la comparten otros "
                                    "%d predios distintos (dato repetido)" % (f, n - 1))
                r["lon_propuesta"] = r["lat_propuesta"] = None
                frenadas += 1
                continue
            nota = "punto aproximado: lo comparten %d predios distintos" % n
            if r["estado"] == "ubicada":
                r["certeza"] = "media"
                r["motivo"] += " (%s)" % nota
                continue
            d = (math.hypot(P0[i][0] - xy[i][0], P0[i][1] - xy[i][1])
                 if tiene0[i] else float("inf"))
            if d > lejos:
                r["certeza"] = "media"     # estaba tan lejos que el punto aproximado es mejor
                r["motivo"] += " (%s)" % nota
            else:
                r.update(estado="revisar", certeza="media",
                         motivo="%s; NO se movio sola: ese punto es aproximado (%s) y lo "
                                "comparten %d predios distintos; moverlos a todos los encimaba"
                                % (r["motivo"].split("; se ")[0], _DESC_ZONA.get(f, f), n))
                frenadas += 1
    return frenadas


def validar_direcciones(registros, indice=None, cfg=None, geocodificar=None):
    """
    registros: lista de dicts con
        "texto"  direccion completa (la columna que eligio el usuario), o bien
        "hab", "via", "numero" si el Excel la trae partida;
        "lon", "lat" coordenada actual en grados (None si no tiene).
    indice: IndiceCalles (o None si no hay mapa descargado).
    geocodificar: funcion opcional lista_de_textos -> {texto: (lon, lat) | None}.
        Se usa solo como segunda opinion sobre los registros dudosos.

    Devuelve (resultados, resumen). resultados va en el mismo orden que
    registros; cada uno trae estado, motivo, certeza, fuente, calle,
    distancia_m, lon_propuesta, lat_propuesta.
    """
    c = dict(CFG_DEFECTO)
    for k, v in (cfg or {}).items():
        if k in CFG_DEFECTO:
            c[k] = v
    n = len(registros)
    TOL_OK, TOL_MAL = float(c["DIR_TOL_OK_M"]), float(c["DIR_TOL_MAL_M"])
    ANCLA, HAB_MAX = float(c["DIR_ANCLA_MAX_M"]), float(c["DIR_HAB_MAX_M"])
    HAB_LEJOS = float(c["DIR_HAB_LEJOS_M"])
    S_MIN, S_FUERTE = float(c["DIR_SCORE_MIN"]), float(c["DIR_SCORE_FUERTE"])
    C_MIN, C_TOL = int(c["DIR_CONSENSO_MIN"]), float(c["DIR_CONSENSO_TOL_M"])
    C_COMP = float(c["DIR_CONSENSO_COMPACTO_M"])

    if indice is not None:
        proy = indice.proy
    else:
        lons = [_f(r.get("lon")) for r in registros]
        lats = [_f(r.get("lat")) for r in registros]
        ok = [(a, b) for a, b in zip(lons, lats) if a is not None and b is not None]
        proy = Proyeccion(*(np.median([b for _, b in ok]), np.median([a for a, _ in ok]))
                          if ok else (-8.11, -79.03))

    res = [{"estado": "sin_verificar", "motivo": "", "certeza": "", "fuente": "",
            "calle": "", "distancia_m": None, "lon_propuesta": None,
            "lat_propuesta": None} for _ in range(n)]
    P = np.full((n, 2), np.nan)
    partes, lonlat = [], []
    for i, r in enumerate(registros):
        if r.get("texto") not in (None, ""):
            p = parsear_direccion(r.get("texto"), r.get("localidad"))
        else:
            p = parsear_partes(r.get("hab"), r.get("via"), r.get("numero"))
        partes.append(p)
        lon, lat = _f(r.get("lon")), _f(r.get("lat"))
        lonlat.append((lon, lat))
        if lon is not None and lat is not None:
            P[i] = proy.xy(lon, lat)
    tiene = np.isfinite(P[:, 0])
    P0, tiene0 = P.copy(), tiene.copy()      # coordenadas tal como llegaron
    k_via = [clave_nombre(_via_completa(p)) if p["via"] else "" for p in partes]
    # La localidad separa grupos homonimos de distritos distintos (la misma
    # 'CALLE UNION' en Trujillo y en El Porvenir no son vecinas).
    k_loc = []
    for r in registros:
        l = norm(r.get("localidad"))
        k_loc.append("" if (not l or l.startswith("OTRA") or l.startswith("SIN ")) else l)
    k_hab = [clave_lugar(p["hab"]) if p["hab"] else "" for p in partes]

    # Calles con nombre de puro numero o letra ('CALLE 4', 'PASAJE A'): en El
    # Porvenir o La Esperanza hay decenas con el mismo nombre, asi que el mapa
    # solo no basta para afirmar nada.
    generica = [bool(k) and all(_es_debil(t) or t in _PALABRAS_TIPO for t in k.split())
                for k in k_via]

    # --------------------------- capa 0: referencia interna (catastro / visitas)
    # El lote o la manzana del catastro (o varias visitas que coinciden) dicen
    # donde esta el PREDIO, no solo la calle. Cuando existe, manda sobre el mapa.
    TOL_REF = float(c["DIR_TOL_REF_M"])
    prelim = [""] * n
    for i, r in enumerate(registros):
        ref = r.get("ref") or None
        if not ref:
            continue
        rl, rt = _f(ref.get("lon")), _f(ref.get("lat"))
        if rl is None or rt is None:
            continue
        rx, ry = proy.xy(rl, rt)
        fuente = ref.get("fuente") or "catastro"
        det = ref.get("detalle") or ""
        det = (" (%s)" % det) if det else ""
        tol = float(ref.get("tol") or TOL_REF)
        if tiene[i]:
            d = math.hypot(P[i][0] - rx, P[i][1] - ry)
            res[i]["distancia_m"] = int(round(d))
            # si el catastro da dos ubicaciones (lote y manzana no cuadran), la
            # coordenada vale si coincide con cualquiera de las dos
            d_alt = min([math.hypot(P[i][0] - ax, P[i][1] - ay) for ax, ay in
                         (proy.xy(float(a[0]), float(a[1])) for a in (ref.get("alt") or []))]
                        or [float("inf")])
            if d_alt <= TOL_REF and d_alt < d:
                res[i].update(estado="verificada", fuente="lote catastral",
                              distancia_m=int(round(d_alt)),
                              motivo="a %s de su lote catastral%s" % (_km(d_alt), det))
                prelim[i] = "ref"            # su coordenada se queda: ya cuadra con su lote
                continue
            elif d <= tol:
                res[i].update(estado="verificada", fuente=fuente,
                              motivo="a %s de su %s%s" % (_km(d), fuente, det))
            elif ref.get("auto", True):
                res[i].update(estado="corregida", certeza="alta", fuente=fuente,
                              motivo="estaba a %s de su %s%s; se ubico ahi"
                                     % (_km(d), fuente, det))
                res[i]["lon_propuesta"], res[i]["lat_propuesta"] = rl, rt
            else:
                # el catastro se contradice (su lote no cae en su manzana):
                # se muestra la propuesta, pero no se mueve sola
                res[i].update(estado="revisar", certeza="media", fuente=fuente,
                              motivo="esta a %s de su %s%s; %s"
                                     % (_km(d), fuente, det,
                                        ref.get("nota") or "el catastro no es concluyente"))
                res[i]["lon_propuesta"], res[i]["lat_propuesta"] = rl, rt
        else:
            res[i].update(estado="ubicada", certeza="alta" if ref.get("auto", True) else "media",
                          fuente=fuente,
                          motivo="sin coordenada; ubicada en su %s%s" % (fuente, det))
            res[i]["lon_propuesta"], res[i]["lat_propuesta"] = rl, rt
        if not ref.get("auto", True) and res[i]["estado"] != "verificada":
            prelim[i] = "ref_revisar"    # resuelto, pero su posicion no sirve de vecino
            continue
        P[i] = (rx, ry)                  # su posicion buena sirve de vecino a los demas
        tiene[i] = True
        prelim[i] = "ref"

    # ------------------------------------------------ capa 1: calle del mapa
    fuertes = [[] for _ in range(n)]     # claves de calle seguras para cada registro
    for i, p in enumerate(partes):
        if prelim[i].startswith("ref"):
            continue
        if not p["via"]:
            prelim[i] = "sin_via"
            continue
        if indice is None:
            prelim[i] = "sin_mapa"
            continue
        if tiene[i] and not indice.cubre(*lonlat[i]):
            prelim[i] = "fuera_mapa"     # zona que no se pudo descargar
            continue
        cands = indice.buscar_calle(_via_completa(p), S_MIN)
        if not cands:
            prelim[i] = "calle_no_en_mapa"
            continue
        fuertes[i] = [k for s, k in cands if s >= S_FUERTE]
        usar = fuertes[i] or [k for _, k in cands]
        if not tiene[i]:
            prelim[i] = "sin_coord"
            continue
        mejor = None
        for k in usar:
            for inst in indice.instancias(k):
                d, _x, _y = inst.distancia(P[i])
                if mejor is None or d < mejor[0]:
                    mejor = (d, inst)
        d, inst = mejor
        res[i]["distancia_m"] = int(round(d))
        res[i]["calle"] = inst.nombre
        if d <= TOL_OK:
            prelim[i] = "ok" if (fuertes[i] and not generica[i]) else "aprox"
        elif d <= TOL_MAL:
            prelim[i] = "aprox"
        elif fuertes[i]:
            prelim[i] = "lejos"
        else:
            prelim[i] = "incierta"

    # ------------------------------------------- grupos (misma calle + urb)
    grupos = {}
    for i in range(n):
        if k_via[i] and tiene[i]:
            grupos.setdefault((k_via[i], k_hab[i], k_loc[i]), []).append(i)
    grupos_hab = {}
    for i in range(n):
        if not k_via[i] and k_hab[i] and tiene[i]:
            grupos_hab.setdefault((k_hab[i], k_loc[i]), []).append(i)

    def lejanos(otros, m, lim, i=None):
        """De 'otros', los que quedan lejos del centro m; y si el registro i
        (o cualquiera de ellos, si i es None) tiene al lado a C_MIN-1 de esos
        lejanos: entonces no es un error suelto, es otro tramo u otra calle
        con el mismo nombre."""
        Q = P[otros]
        fuera = np.hypot(Q[:, 0] - m[0], Q[:, 1] - m[1]) > lim
        F = Q[fuera]
        if i is not None:
            if not len(F):
                return int(fuera.sum()), 0
            return int(fuera.sum()), int((np.hypot(F[:, 0] - P[i][0],
                                                   F[:, 1] - P[i][1]) <= C_TOL).sum())
        mayor = 0
        for a_ in range(len(F)):
            mayor = max(mayor, int((np.hypot(F[:, 0] - F[a_, 0],
                                             F[:, 1] - F[a_, 1]) <= C_TOL).sum()) - 1)
        return int(fuera.sum()), mayor

    def ancla_consenso(i):
        """Centro de los OTROS predios de la misma calle y urbanizacion que ya
        quedaron verificados contra el mapa."""
        g = grupos.get((k_via[i], k_hab[i], k_loc[i])) or []
        validos = ("ref",) if generica[i] else ("ok", "aprox", "ref")
        otros = [j for j in g if j != i and prelim[j] in validos]
        if len(otros) < 2:
            return None
        m, inl, disp, _ = _centro_robusto(P[otros], C_TOL)
        if int(inl.sum()) < 2 or disp > C_TOL:
            return None
        return (float(m[0]), float(m[1])), int(inl.sum())

    def ancla_lugar(i):
        if indice is None or not partes[i]["hab"]:
            return None
        pts = indice.buscar_lugar(partes[i]["hab"])
        if not pts:
            return None
        arr = np.asarray(pts)
        m = np.median(arr, axis=0)
        if np.hypot(arr[:, 0] - m[0], arr[:, 1] - m[1]).max() > HAB_MAX:
            return None                      # mismo nombre en sitios distintos
        return (float(m[0]), float(m[1]))

    def ancla(i):
        """Donde deberia estar el predio segun su urbanizacion. Manda el
        consenso de vecinos verificados; si no hay, el punto de OSM."""
        ac = ancla_consenso(i)
        if ac:
            return ac[0], "consenso", ac[1]
        al = ancla_lugar(i)
        if al:
            return al, "urbanizacion", 0
        return None

    def mejor_instancia(claves, punto):
        mejor = None
        for k in claves:
            for inst in indice.instancias(k):
                d, x, y = inst.distancia(punto)
                if mejor is None or d < mejor[0]:
                    mejor = (d, x, y, inst)
        return mejor

    def nombre_hab(i):
        p = partes[i]
        return ("%s %s" % (_TIPO_CORTO.get(p["hab_tipo"], p["hab_tipo"].title()),
                           _bonito(p["hab"]))).strip()

    def nombre_via(i):
        p = partes[i]
        return ("%s %s" % (p["via_tipo"].title(), _bonito(p["via"]))).strip()

    # ------------------------------- capa 2: la calle correcta, otra urbanizacion
    for i in range(n):
        if prelim[i] not in ("ok", "aprox") or not k_hab[i] or not fuertes[i]:
            continue
        a = ancla(i)
        if not a:
            continue
        pa = a[0]
        if math.hypot(P[i][0] - pa[0], P[i][1] - pa[1]) <= HAB_MAX:
            continue
        mi = mejor_instancia(fuertes[i], pa)
        if mi and mi[0] <= ANCLA and math.hypot(P[i][0] - mi[1], P[i][1] - mi[2]) > TOL_MAL:
            prelim[i] = "otra_urb"

    # ---------------------------------------------------------- propuestas
    def proponer(i):
        """(x, y, certeza, fuente, detalle) o None."""
        p = partes[i]
        a = ancla(i)
        # a) numeracion exacta en OSM
        if p["numero"] and p["numero"] != "SN":
            pts = []
            for k in fuertes[i]:
                pts.extend(indice.numero(k, p["numero"]))
            if pts:
                if a:
                    pts.sort(key=lambda q: math.hypot(q[0] - a[0][0], q[1] - a[0][1]))
                    if math.hypot(pts[0][0] - a[0][0], pts[0][1] - a[0][1]) <= HAB_MAX:
                        return pts[0][0], pts[0][1], "alta", "numeracion", \
                            "numero %s de la calle en el mapa" % p["numero"]
                elif len(pts) == 1:
                    return pts[0][0], pts[0][1], "alta", "numeracion", \
                        "numero %s de la calle en el mapa" % p["numero"]
        # b) la calle, en el tramo que pasa por su urbanizacion
        if a:
            mi = mejor_instancia(fuertes[i], a[0])
            if mi and mi[0] <= ANCLA:
                if a[1] == "consenso":
                    det = "%s, junto a otros %d predios de la misma calle ya verificados" \
                          % (mi[3].nombre, a[2])
                else:
                    det = "%s, en el tramo que pasa por %s" % (mi[3].nombre, nombre_hab(i))
                return mi[1], mi[2], "alta", a[1], det
        return None

    propuestas = [None] * n
    for i in range(n):
        if prelim[i] in ("lejos", "otra_urb") or (prelim[i] == "sin_coord" and fuertes[i]):
            propuestas[i] = proponer(i)

    # ------------------------------ capa 4: geocodificador como segunda opinion
    usados_geo = 0
    if geocodificar is not None:
        pend = [i for i in range(n) if prelim[i] in ("lejos", "otra_urb")
                and not generica[i]
                and (propuestas[i] is None or propuestas[i][2] != "alta")]
        pend = pend[:int(c["DIR_MAX_GEOCODE"])]
        if pend:
            textos = {}
            for i in pend:
                p = partes[i]
                t = " ".join(x for x in (p["via_tipo"], p["via"], p["numero"]
                                         if p["numero"] != "SN" else "") if x)
                if p["hab"]:
                    t += ", " + " ".join(x for x in (p["hab_tipo"], p["hab"]) if x)
                textos[i] = t
            try:
                resp = geocodificar(sorted(set(textos.values()))) or {}
            except Exception as e:                      # pragma: no cover
                log.warning("Geocodificador no disponible para la validacion: %s", e)
                resp = {}
            usados_geo = len(set(textos.values()))
            for i in pend:
                g = resp.get(textos[i])
                if not g:
                    continue
                gx, gy = proy.xy(float(g[0]), float(g[1]))
                mi = mejor_instancia(fuertes[i], (gx, gy))
                if not mi or mi[0] > TOL_OK:
                    continue                 # el geocodificador no cayo en la calle: no vale
                a = ancla(i)
                if a and math.hypot(gx - a[0][0], gy - a[0][1]) > HAB_MAX:
                    continue                 # cayo en la calle, pero en otra urbanizacion
                propuestas[i] = (mi[1], mi[2], "alta", "geocodificador",
                                 "%s, confirmada por el geocodificador" % mi[3].nombre)

    # ----------------------------------------------------------- resolucion
    for i in range(n):
        r, p, pr = res[i], partes[i], prelim[i]
        if pr.startswith("ref"):
            continue                     # ya resuelto por catastro / historial
        if pr == "ok":
            r.update(estado="verificada", fuente="calle",
                     motivo="a %s de %s" % (_km(r["distancia_m"]), r["calle"]))
            continue
        if pr == "aprox":
            extra = "" if fuertes[i] else " (nombre parecido, no identico)"
            r.update(estado="aproximada", fuente="calle",
                     motivo="a %s de %s%s" % (_km(r["distancia_m"]), r["calle"], extra))
            continue

        if pr in ("lejos", "otra_urb"):
            prop = propuestas[i]
            if pr == "otra_urb":
                causa = ("esta junto a una %s, pero no la de %s"
                         % (r["calle"], nombre_hab(i) or "su urbanizacion"))
            else:
                causa = "la coordenada esta a %s de %s" % (_km(r["distancia_m"]), r["calle"])
            if prop and prop[2] == "alta":
                r.update(estado="corregida", certeza="alta", fuente=prop[3],
                         motivo="%s; se reubico en %s" % (causa, prop[4]))
            else:
                # Sin una segunda senal no se sabe en que cuadra va: proponer el
                # medio de la calle solo confunde. Se marca y se explica.
                n_inst = sum(len(indice.instancias(k)) for k in fuertes[i])
                porque = ("hay %d calles con ese nombre y no se sabe cual es" % n_inst
                          if n_inst > 1 else
                          "no se sabe en que cuadra va: su urbanizacion no esta en el mapa "
                          "y no hay otros predios de esa calle ya verificados")
                r.update(estado="revisar", certeza="", fuente="calle",
                         motivo="%s; %s" % (causa, porque))
            if prop and prop[2] == "alta":
                r["lon_propuesta"], r["lat_propuesta"] = proy.lonlat(prop[0], prop[1])
            continue

        if pr == "sin_coord":
            prop = propuestas[i]
            if prop and prop[2] == "alta":
                r.update(estado="ubicada", certeza="alta", fuente=prop[3],
                         motivo="sin coordenada; ubicada en %s" % prop[4])
                r["lon_propuesta"], r["lat_propuesta"] = proy.lonlat(prop[0], prop[1])
                continue
            # sin calle segura: se intenta con el consenso de su grupo
            pr = "sin_coord_consenso"

        if pr in ("calle_no_en_mapa", "sin_mapa", "fuera_mapa", "incierta",
                  "sin_coord_consenso"):
            clave_g = (k_via[i], k_hab[i], k_loc[i])
            g = grupos.get(clave_g) or []
            otros = [j for j in g if j != i]
            if len(otros) >= C_MIN - 1:
                m, inl, disp, lim = _centro_robusto(P[otros], C_TOL)
                n_in = int(inl.sum())
                nom = nombre_via(i).strip()
                # 'Calle 4' sin sector: en un distrito hay varias, compararlas
                # entre si no dice nada.
                sin_sector = generica[i] and not k_hab[i]
                if not tiene[i]:
                    if sin_sector:
                        r.update(estado="sin_ubicar",
                                 motivo="sin coordenada; hay varias %s y la direccion no "
                                        "dice el sector" % nom)
                    elif (n_in >= C_MIN and disp <= C_COMP and
                          lejanos(otros, m, lim)[1] < C_MIN - 1):
                        r.update(estado="ubicada", certeza="media", fuente="consenso",
                                 motivo="sin coordenada; ubicada junto a otros %d predios de %s "
                                        "(punto aproximado de la calle, no de la casa)"
                                        % (n_in, nom))
                        r["lon_propuesta"], r["lat_propuesta"] = proy.lonlat(m[0], m[1])
                    else:
                        r.update(estado="sin_ubicar",
                                 motivo="sin coordenada y sin referencia suficiente para ubicarla")
                    continue
                d = math.hypot(P[i][0] - m[0], P[i][1] - m[1])
                r["distancia_m"] = int(round(d))
                if d <= lim:
                    if n_in >= 2:
                        if sin_sector:
                            r.update(estado="aproximada", fuente="consenso",
                                     motivo="cerca de otros %d predios de %s (sin sector: "
                                            "puede haber varias)" % (n_in, nom))
                        else:
                            r.update(estado="verificada", fuente="consenso",
                                     motivo="coincide con otros %d predios de %s" % (n_in, nom))
                        continue
                elif n_in >= 2:
                    causa = "esta a %s de los otros %d predios de %s" % (_km(d), n_in, nom)
                    if sin_sector:
                        r.update(estado="sin_verificar",
                                 motivo=causa + "; pero hay varias %s y la direccion no dice el "
                                                "sector: puede ser otra" % nom)
                        continue
                    _, al_lado = lejanos(otros, m, lim, i)
                    if al_lado >= C_MIN - 1:
                        # No esta solo: hay otros predios de la misma calle junto a el.
                        # Es otro tramo de la calle (o otra calle con el mismo nombre),
                        # no un error. Mandarlos 'junto a los demas' los apilaba.
                        r.update(estado="sin_verificar",
                                 motivo=causa + "; pero esta junto a otros %d predios de esa "
                                                "calle: es otro tramo o otra calle con el "
                                                "mismo nombre" % al_lado)
                        continue
                    r["lon_propuesta"], r["lat_propuesta"] = proy.lonlat(m[0], m[1])
                    # Solo es un error claro si esta mucho mas lejos de lo que se
                    # extiende la calle: el final de una calle larga no es un error.
                    Q = P[otros]
                    ext = float(np.percentile(np.hypot(Q[:, 0] - m[0], Q[:, 1] - m[1]), 90))
                    claro = d > 2.0 * max(lim, ext)
                    if n_in >= C_MIN and disp <= C_COMP and claro:
                        r.update(estado="corregida", certeza="alta", fuente="consenso",
                                 motivo=causa + "; se reubico junto a ellos")
                    else:
                        r.update(estado="revisar", certeza="media", fuente="consenso",
                                 motivo=causa + ("; el grupo es chico o disperso para corregir "
                                                 "solo" if claro else
                                                 "; la calle se extiende %s, puede ser su "
                                                 "otro extremo" % _km(ext)))
                    continue
            if not tiene[i]:
                r.update(estado="sin_ubicar", motivo="sin coordenada y la calle no esta en el mapa")
                continue
            if pr == "sin_mapa":
                r["motivo"] = "no hay mapa de calles descargado y pocos predios de la misma calle"
            elif pr == "fuera_mapa":
                r["motivo"] = ("esta zona todavia no esta en el mapa de calles (la descarga "
                               "no llego completa) y hay pocos predios de la misma calle")
            elif pr == "incierta":
                r["motivo"] = ("el nombre de la calle se parece a %s, pero no lo suficiente "
                               "para afirmar que es esa" % r["calle"])
            else:
                r["motivo"] = ("%s no esta en el mapa y hay pocos predios de esa "
                               "calle para comparar" % nombre_via(i))
            continue

        if pr == "sin_via":
            if not p["hab"]:
                r["motivo"] = "no se reconocio ni la calle ni la urbanizacion en la direccion"
                if not tiene[i]:
                    r["estado"] = "sin_ubicar"
                continue
            if not tiene[i]:
                r.update(estado="sin_ubicar",
                         motivo="sin coordenada y la direccion no trae calle (solo %s)"
                                % nombre_hab(i))
                continue
            al = ancla_lugar(i)
            if al:
                d = math.hypot(P[i][0] - al[0], P[i][1] - al[1])
                r["distancia_m"] = int(round(d))
                if d <= HAB_MAX:
                    r.update(estado="aproximada", fuente="urbanizacion",
                             motivo="a %s del centro de %s (la direccion no trae calle)"
                                    % (_km(d), nombre_hab(i)))
                elif d > HAB_LEJOS:
                    r.update(estado="revisar", certeza="media", fuente="urbanizacion",
                             motivo="esta a %s de %s" % (_km(d), nombre_hab(i)))
                    r["lon_propuesta"], r["lat_propuesta"] = proy.lonlat(al[0], al[1])
                else:
                    r["motivo"] = "a %s de %s: no concluyente" % (_km(d), nombre_hab(i))
                continue
            g = [j for j in grupos_hab.get((k_hab[i], k_loc[i]), []) if j != i]
            if len(g) >= C_MIN - 1:
                m, inl, disp, lim = _centro_robusto(P[g], HAB_MAX)
                d = math.hypot(P[i][0] - m[0], P[i][1] - m[1])
                r["distancia_m"] = int(round(d))
                if d <= lim:
                    r.update(estado="aproximada", fuente="consenso",
                             motivo="junto a otros %d predios de %s" % (int(inl.sum()), nombre_hab(i)))
                elif int(inl.sum()) >= 2:
                    r.update(estado="revisar", certeza="media", fuente="consenso",
                             motivo="esta a %s de los otros predios de %s" % (_km(d), nombre_hab(i)))
                    r["lon_propuesta"], r["lat_propuesta"] = proy.lonlat(m[0], m[1])
                continue
            r["motivo"] = ("la direccion no trae calle y %s no esta en el mapa"
                           % (nombre_hab(i) or "la urbanizacion"))

    # -------------------------------- capa 5: nunca apilar predios distintos
    # Si muchos predios DISTINTOS terminan en exactamente el mismo punto, ese
    # punto no es la casa de ninguno: es el centro de su calle, de su barrio o
    # de un grupo (o un dato repetido en la base). Moverlos a todos ahi los deja
    # encimados y desordena la ruta. Se revisa cada pila:
    #   - fuente de casa (lote, historial, numeracion): dato repetido -> no se mueve
    #   - centro de manzana del catastro: es normal (estan en esa manzana) -> se deja
    #   - centro de calle / barrio / grupo: solo se mueve si la coordenada estaba
    #     muy lejos (DIR_ZONA_LEJOS_M); si no, queda para revisar con la propuesta.
    apiladas = _anti_apilado(res, registros, partes, k_via, k_hab, k_loc, P0, tiene0,
                             proy, int(c["DIR_APILADO_MIN"]), float(c["DIR_ZONA_LEJOS_M"]))

    for r in res:
        for k in ("lon_propuesta", "lat_propuesta"):
            if r[k] is not None:
                r[k] = round(float(r[k]), 7)

    conteo = {}
    for r in res:
        conteo[r["estado"]] = conteo.get(r["estado"], 0) + 1
    resumen = {
        "registros": n,
        "verificadas": conteo.get("verificada", 0),
        "aproximadas": conteo.get("aproximada", 0),
        "corregidas": conteo.get("corregida", 0),
        "revisar": conteo.get("revisar", 0),
        "ubicadas": conteo.get("ubicada", 0),
        "sin_verificar": conteo.get("sin_verificar", 0),
        "sin_ubicar": conteo.get("sin_ubicar", 0),
        "consultas_geocodificador": usados_geo,
        "por_referencia_interna": sum(1 for x in prelim if x.startswith("ref")),
        "apiladas_evitadas": apiladas,
        "mapa": {"disponible": indice is not None,
                 "generado": getattr(indice, "generado", "") if indice is not None else "",
                 "calles": indice.n_calles if indice is not None else 0,
                 "completo": not getattr(indice, "faltan", None) if indice is not None else False,
                 "trozos_faltantes": len(getattr(indice, "faltan", None) or [])},
    }
    return res, resumen
