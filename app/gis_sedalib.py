# -*- coding: utf-8 -*-
"""
Punto exacto de un suministro desde el GIS corporativo de Sedalib
(https://land.sedalib.com.pe/gis-seda).

Hace la misma consulta que la opcion "Buscar > Bus Por Suministro" de esa
plataforma: el GIS devuelve el rectangulo del LOTE del suministro en UTM 17S
(EPSG:32717) y aqui se toma su centro.

CREDENCIALES: nunca en el codigo ni en config.py (ese archivo esta en el
repositorio publico de GitHub). Se leen, en este orden, de:
  1. variables de entorno SEDALIB_GIS_USUARIO y SEDALIB_GIS_CLAVE
  2. el archivo sedalib_gis.json en la raiz del proyecto (los *.json estan en
     .gitignore), con este contenido:
        {"usuario": "TU_USUARIO", "clave": "TU_CLAVE"}
Sin credenciales, todo esto queda apagado y el ruteo sigue como siempre.

Cuidados con el sistema de Sedalib:
  * solo se envian numeros de suministro validados (5 a 15 digitos);
  * pocas conexiones a la vez y un tope por proceso;
  * si rechaza el usuario o la clave, se deja de intentar por 15 minutos para
    no bloquear la cuenta con reintentos.
"""
import json
import logging
import os
import queue
import re
import threading
import time
from concurrent.futures import ThreadPoolExecutor

import requests

log = logging.getLogger(__name__)

BASE = "https://land.sedalib.com.pe/gis-seda"
URL_LOGIN_PAGINA = BASE + "/login/index.php"
URL_LOGIN = BASE + "/login/login.php"
URL_VISOR = BASE + "/gi-sedali/map_default.phtml"
URL_BUSCAR = BASE + "/gi-sedali/plugins/p/php/buscaSuministro2.php"

_RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ARCHIVO_CREDENCIALES = os.path.join(_RAIZ, "sedalib_gis.json")
_RE_SUMINISTRO = re.compile(r"^\d{5,15}$")
UTM_X = (600000.0, 850000.0)          # La Libertad, holgado
UTM_Y = (9000000.0, 9300000.0)
PAUSA_TRAS_RECHAZO_S = 15 * 60
PAUSA_SIN_RESPUESTA_S = 5 * 60      # si el GIS no responde, no hacer esperar cada ruteo


class ErrorGis(Exception):
    pass


class CredencialesRechazadas(ErrorGis):
    pass


# ----------------------------------------------------------------- credenciales
def credenciales():
    """(usuario, clave) o (None, None) si no estan configuradas."""
    u = (os.environ.get("SEDALIB_GIS_USUARIO") or "").strip()
    c = os.environ.get("SEDALIB_GIS_CLAVE") or ""
    if u and c:
        return u, c
    try:
        # utf-8-sig: el Bloc de notas a veces guarda con BOM y json no lo acepta
        with open(ARCHIVO_CREDENCIALES, encoding="utf-8-sig") as f:
            d = json.load(f)
        u, c = str(d.get("usuario") or "").strip(), str(d.get("clave") or "")
        if u and c:
            return u, c
    except FileNotFoundError:
        pass
    except Exception:
        log.warning("No se pudo leer %s", ARCHIVO_CREDENCIALES)
    return None, None


def disponible():
    """True si hay credenciales y no se esta en pausa (rechazo o GIS caido)."""
    u, c = credenciales()
    return (bool(u and c) and time.time() >= _estado["pausa_hasta"]
            and time.time() >= _estado["pausa_red_hasta"])


def motivo_no_disponible():
    u, c = credenciales()
    if not (u and c):
        return ("no hay credenciales del GIS de Sedalib configuradas en el servidor "
                "(variables SEDALIB_GIS_USUARIO / SEDALIB_GIS_CLAVE o sedalib_gis.json)")
    if time.time() < _estado["pausa_hasta"]:
        return "el GIS de Sedalib rechazo el usuario o la clave; se reintentara en unos minutos"
    if time.time() < _estado["pausa_red_hasta"]:
        return "el GIS de Sedalib no esta respondiendo; se reintentara en unos minutos"
    return ""


# ------------------------------------------------------------- utilidades
def _tar(texto, semilla):
    """Mismo cifrado que la funcion tar() de la pagina de login del GIS
    (cs/file1.js): desplaza cada caracter segun la suma de digitos de la
    suma de los codigos del token."""
    suma = sum(ord(ch) for ch in semilla)
    desplazamiento = sum(int(d) for d in str(suma))
    salida = []
    for ch in texto:
        v = ord(ch) + desplazamiento
        if v > 126:
            v = (v - 126) + 31
        salida.append(chr(v))
    return "".join(salida)


def _campo_oculto(html, nombre):
    """value de <input id="nombre" ...> (o name=) en la pagina de login."""
    for etiqueta in re.findall(r"<input\b[^>]*>", html or "", flags=re.I):
        if re.search(r"""\b(?:id|name)\s*=\s*["']%s["']""" % re.escape(nombre), etiqueta, re.I):
            m = re.search(r"""\bvalue\s*=\s*["']([^"']*)["']""", etiqueta, re.I)
            return m.group(1) if m else ""
    return None


def centro_de_extension(tens):
    """'x1+y1+x2+y2' (UTM 17S) -> (x, y) del centro, o None."""
    try:
        x1, y1, x2, y2 = (float(v) for v in str(tens or "").split("+"))
    except (TypeError, ValueError):
        return None
    x, y = (x1 + x2) / 2.0, (y1 + y2) / 2.0
    if not (UTM_X[0] <= x <= UTM_X[1] and UTM_Y[0] <= y <= UTM_Y[1]):
        return None
    return x, y


def interpretar_respuesta(texto):
    """
    Respuesta de buscaSuministro2.php ->
        (x, y)          el GIS tiene el lote
        None            el GIS no tiene el suministro ("0", "2" o sin extension)
    Lanza ValueError si la respuesta no es del buscador (p. ej. sesion vencida).
    """
    t = (texto or "").strip()
    if t in ("0", "2"):
        return None
    datos = json.loads(t)                      # ValueError si no es JSON
    if not isinstance(datos, list) or not datos:
        raise ValueError("respuesta sin datos")
    tens = ((datos[0] or {}).get("def") or {}).get("tens")
    return centro_de_extension(tens) if tens else None


# ------------------------------------------------------------------ cliente
class ClienteGisSedalib:
    def __init__(self, usuario, clave, timeout=8):
        self.usuario, self.clave, self.timeout = usuario, clave, timeout
        self.sesion = None

    def _entrar(self):
        s = requests.Session()
        s.headers["User-Agent"] = "techdito-rutas/1.0"
        r = s.get(URL_LOGIN_PAGINA, timeout=self.timeout)
        r.raise_for_status()
        token = _campo_oculto(r.text, "t")
        if not token:
            raise ErrorGis("la pagina de login del GIS cambio (no se encontro el token)")
        v01 = _campo_oculto(r.text, "v01") or ""
        r = s.post(URL_LOGIN, timeout=self.timeout,
                   headers={"X-Requested-With": "XMLHttpRequest", "Referer": URL_LOGIN_PAGINA},
                   data={"username": self.usuario.lower(),
                         "password": _tar(self.clave, token),
                         "var01": v01})
        r.raise_for_status()
        try:
            ok = str(json.loads(r.text.strip() or "{}").get("oki")) == "1"
        except ValueError:
            ok = False
        if not ok:
            raise CredencialesRechazadas("el GIS de Sedalib rechazo el usuario o la clave")
        # El buscador usa la sesion del visor: se abre una vez.
        s.get(URL_VISOR, params={"config": "default", "resetsession": "ALL"},
              timeout=self.timeout)
        self.sesion = s

    def ubicar(self, suministro):
        """(x, y) UTM 17S del centro del lote, o None si el GIS no lo tiene."""
        s = str(suministro or "").strip()
        if not _RE_SUMINISTRO.match(s):
            return None
        for intento in (1, 2):
            if self.sesion is None:
                self._entrar()
            r = self.sesion.post(URL_BUSCAR, data={"sum": s}, timeout=self.timeout,
                                 headers={"X-Requested-With": "XMLHttpRequest",
                                          "Referer": URL_VISOR})
            try:
                return interpretar_respuesta(r.text)
            except ValueError:
                self.sesion = None            # sesion vencida: se entra de nuevo una vez
                if intento == 2:
                    raise ErrorGis("el GIS de Sedalib respondio algo inesperado")
        return None


def cortar_por_rechazo(errores):
    return any(str(e).startswith("RECHAZO: ") for e in errores)


# Varios clientes (una sesion cada uno) para consultar en paralelo sin
# abrir una sesion nueva en cada proceso.
_estado = {"pausa_hasta": 0.0, "pausa_red_hasta": 0.0}
_pool = queue.Queue()
_pool_lock = threading.Lock()
_pool_creados = 0


def _tomar_cliente(maximo):
    global _pool_creados
    try:
        return _pool.get_nowait()
    except queue.Empty:
        pass
    with _pool_lock:
        if _pool_creados < maximo:
            _pool_creados += 1
            u, c = credenciales()
            return ClienteGisSedalib(u, c)
    return _pool.get()


def consultar(suministros, hilos=4, tope=300, presupuesto_s=15):
    """
    {suministro: (x, y) | None} para los suministros pedidos (hasta 'tope' y
    sin pasar de 'presupuesto_s' segundos: el ruteo no puede quedarse colgado
    esperando a Sedalib). Devuelve (resultados, error): 'error' explica por que
    se corto, si se corto. Los que no se alcanzaron a consultar no aparecen en
    el resultado (no se dan por "no encontrados").
    """
    pedidos = [s for s in dict.fromkeys(str(x).strip() for x in suministros)
               if _RE_SUMINISTRO.match(s)][:max(0, int(tope))]
    if not pedidos:
        return {}, ""
    if not disponible():
        return {}, motivo_no_disponible()

    resultados, errores = {}, []
    cortar = threading.Event()
    t0 = time.time()

    def uno(s):
        if cortar.is_set() or time.time() - t0 > presupuesto_s:
            return
        cli = _tomar_cliente(hilos)
        try:
            resultados[s] = cli.ubicar(s)
        except CredencialesRechazadas as e:
            _estado["pausa_hasta"] = time.time() + PAUSA_TRAS_RECHAZO_S
            cortar.set()
            errores.append("RECHAZO: " + str(e))
        except Exception as e:                   # red caida, timeout, cambio del GIS
            cli.sesion = None
            errores.append("%s: %s" % (type(e).__name__, e))
            if len(errores) >= 3:
                cortar.set()
        finally:
            _pool.put(cli)

    with ThreadPoolExecutor(max_workers=max(1, int(hilos))) as ex:
        list(ex.map(uno, pedidos))
    if errores and not resultados and not cortar_por_rechazo(errores):
        # No contesto nada: se pausa un rato para no hacer esperar cada ruteo.
        _estado["pausa_red_hasta"] = time.time() + PAUSA_SIN_RESPUESTA_S
    log.info("GIS Sedalib: %d consultados, %d ubicados, %d errores (%.1f s)",
             len(resultados), sum(1 for v in resultados.values() if v),
             len(errores), time.time() - t0)
    if errores:
        return resultados, errores[0].replace("RECHAZO: ", "")
    return resultados, ""


if __name__ == "__main__":
    # Prueba rapida desde la raiz del proyecto:
    #     python app\gis_sedalib.py 10015005313
    import sys
    logging.basicConfig(level=logging.INFO)
    if not disponible():
        print("No disponible:", motivo_no_disponible())
        sys.exit(1)
    for s in sys.argv[1:] or ["10015005313"]:
        res, err = consultar([s], hilos=1, tope=1)
        p = res.get(s)
        if p:
            print("%s -> UTM 17S  este=%.2f  norte=%.2f" % (s, p[0], p[1]))
        else:
            print("%s -> %s" % (s, err or "el GIS no tiene ese suministro"))
