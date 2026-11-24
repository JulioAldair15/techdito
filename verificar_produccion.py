"""
Revision ANTES de reiniciar el servidor de produccion (no cambia nada).

Uso, en el servidor, desde la carpeta del proyecto y con el mismo usuario
con el que corre el sistema (www-data):

    cd /var/www/html/techdito
    sudo -u www-data venv/bin/python verificar_produccion.py          # revision local
    sudo -u www-data venv/bin/python verificar_produccion.py --red    # + ArcGIS y GIS Sedalib

Si al final dice "NO REINICIES", corrige lo marcado con [X] y vuelve a correrlo.
Mientras no reinicies, el sistema sigue funcionando con el codigo anterior.
"""
import importlib
import os
import re
import sys
import traceback

RAIZ = os.path.dirname(os.path.abspath(__file__))
os.chdir(RAIZ)                      # igual que WorkingDirectory del servicio
sys.path.insert(0, RAIZ)

errores, avisos = [], []


def ok(txt):
    print("  [OK] " + txt)


def aviso(txt):
    avisos.append(txt)
    print("  [!]  " + txt)


def error(txt):
    errores.append(txt)
    print("  [X]  " + txt)


def titulo(txt):
    print("\n== " + txt)


# ---------------------------------------------------------------- 1) Python
titulo("Python")
v = sys.version_info
if v < (3, 10):
    error("Python %d.%d: numpy 2.2 y pandas 2.2 piden 3.10 o mas" % (v.major, v.minor))
else:
    ok("Python %d.%d.%d (%s)" % (v.major, v.minor, v.micro, sys.executable))

# ------------------------------------------------------------- 2) librerias
titulo("Librerias")
OBLIGATORIAS = [
    ("flask", "Flask"), ("flask_sqlalchemy", "Flask-SQLAlchemy"), ("flask_bcrypt", "Flask-Bcrypt"),
    ("sqlalchemy", "SQLAlchemy"), ("pymysql", "PyMySQL"), ("pandas", "pandas"), ("numpy", "numpy"),
    ("openpyxl", "openpyxl"), ("sklearn", "scikit-learn"), ("geopy", "geopy"),
    ("thefuzz", "thefuzz"), ("requests", "requests"), ("requests_ntlm", "requests_ntlm"),
    ("xhtml2pdf", "xhtml2pdf"), ("PyPDF2", "PyPDF2"), ("reportlab", "reportlab"), ("fpdf", "fpdf"),
    ("cv2", "opencv-python"), ("zxingcpp", "zxing-cpp"), ("dbf", "dbf"), ("barcode", "python-barcode"),
    ("pdf2image", "pdf2image"), ("PIL", "pillow"), ("dateutil", "python-dateutil"),
    ("pytesseract", "pytesseract"), ("pyzbar", "pyzbar"), ("pymupdf", "PyMuPDF"),
]
OPCIONALES = [
    ("scipy", "scipy", "sin scipy la busqueda de vecinos del ruteo es mas lenta"),
    ("pyproj", "pyproj", "sin pyproj se usan las formulas UTM propias (mismo resultado)"),
]
faltan = []
for mod, pip in OBLIGATORIAS:
    try:
        importlib.import_module(mod)
    except Exception as e:
        faltan.append(pip)
        error("falta %s (%s: %s)" % (mod, type(e).__name__, e))
if not faltan:
    ok("las %d librerias que usa el sistema estan instaladas" % len(OBLIGATORIAS))
else:
    print("       Instalalas una por una, NO con requirements.txt (trae paquetes de Windows):")
    print("       venv/bin/pip install " + " ".join(faltan))
for mod, pip, nota in OPCIONALES:
    try:
        importlib.import_module(mod)
        ok("%s instalado" % pip)
    except Exception:
        aviso("%s no esta instalado: %s" % (pip, nota))
try:
    import fitz
    if not hasattr(fitz, "open"):
        aviso("'fitz' no es PyMuPDF (se instalo el paquete 'fitz' equivocado): "
              "venv/bin/pip uninstall -y fitz && venv/bin/pip install --force-reinstall PyMuPDF")
except Exception:
    pass

# --------------------------------------------------------------- 3) archivos
titulo("Archivos")
for rel, que in [("config.py", "configuracion (BD, SECRET_KEY)"),
                 ("app/rutas_direcciones.py", "modulo de RUTAS"),
                 ("app/rutas_excel.py", "modulo de RUTAS"),
                 ("app/validador_direcciones.py", "modulo de RUTAS"),
                 ("app/gis_sedalib.py", "modulo GIS Sedalib"),
                 ("app/static/js/rutas_excel.js", "JS de RUTAS")]:
    if os.path.isfile(rel):
        ok(rel)
    else:
        error("falta %s (%s)" % (rel, que))
if os.path.isfile("app/data/calles_osm.json"):
    ok("app/data/calles_osm.json (mapa de calles)")
else:
    aviso("falta app/data/calles_osm.json: el ruteo funciona, pero sin validar direcciones "
          "contra las calles (copialo desde tu PC; *.json no se sube a GitHub)")
if os.path.isfile("sedalib_gis.json"):
    if os.access("sedalib_gis.json", os.R_OK):
        ok("sedalib_gis.json existe y este usuario puede leerlo")
    else:
        error("sedalib_gis.json existe pero este usuario no puede leerlo: "
              "sudo chown www-data:www-data sedalib_gis.json && sudo chmod 600 sedalib_gis.json")
elif os.environ.get("SEDALIB_GIS_USUARIO"):
    ok("credenciales del GIS por variables de entorno")
else:
    aviso("no hay sedalib_gis.json: el ruteo funciona, pero sin el GIS de Sedalib")

# ---------------------------------------------------- 4) carpetas escribibles
titulo("Permisos de escritura (usuario actual: %s)"
       % (os.environ.get("USER") or os.environ.get("USERNAME") or "?"))
for rel in ["uploads", "uploads/documentos_empleados", "archivos_generados", "temp_dbf_output",
            "app/static/temp_pdfs", "app/static/pdfs", "app/static/uploads/cartas"]:
    if not os.path.exists(rel):
        continue
    if os.access(rel, os.W_OK):
        ok(rel)
    else:
        error("no se puede escribir en %s: sudo chown -R www-data:www-data %s" % (rel, rel))

# ------------------------------------------------- 5) el sistema arranca?
titulo("Arranque del sistema (lo mismo que hace gunicorn)")
app = db = None
try:
    from app import app, db
    rutas = {r.rule for r in app.url_map.iter_rules()}
    ok("el sistema carga sin errores (%d rutas)" % len(rutas))
    for r in ["/api/generar_rutas", "/api/rutas/gis_sedalib", "/api/rutas/coordenada_manual",
              "/api/rutas_desde_excel"]:
        if r not in rutas:
            error("no esta registrada la ruta %s (codigo incompleto)" % r)
except Exception:
    error("EL SISTEMA NO ARRANCA. Este es el error que veria gunicorn:")
    print("       " + traceback.format_exc().replace("\n", "\n       "))

# ------------------------------------------------------- 6) base de datos
titulo("Base de datos")
if app is not None:
    try:
        from sqlalchemy import inspect, text
        with app.app_context():
            db.session.execute(text("SELECT 1"))
            ok("conexion a la base de datos")
            tablas = set(inspect(db.engine).get_table_names())
            for tabla, sql, sola in [
                    ("coordenada_manual", "2026_11_23_CREATE_TABLE_coordenada_manual.sql", True),
                    ("coordenada_gis_sedalib", "2026_11_23_CREATE_TABLE_coordenada_gis_sedalib.sql",
                     True)]:
                if tabla in tablas:
                    ok("tabla %s" % tabla)
                elif sola:
                    aviso("falta la tabla %s (el sistema intenta crearla solo; mejor corre %s)"
                          % (tabla, sql))
                else:
                    error("falta la tabla %s: corre %s en MySQL antes de reiniciar" % (tabla, sql))
    except Exception as e:
        error("no se pudo revisar la base de datos: %s: %s" % (type(e).__name__, e))
else:
    aviso("no se reviso la base de datos porque el sistema no arranco")

# ---------------------------------------------------- 7) gunicorn y nginx
titulo("Configuracion del servidor")


def leer(ruta):
    try:
        with open(ruta, encoding="utf-8", errors="replace") as f:
            return f.read()
    except Exception:
        return None


svc = leer("/etc/systemd/system/techdito.service")
if svc is None:
    aviso("no se pudo leer /etc/systemd/system/techdito.service (revisalo a mano)")
else:
    m = re.search(r"--timeout[ =](\d+)", svc)
    if not m or int(m.group(1)) < 120:
        aviso("gunicorn con timeout de %s: un ruteo grande se corta con error 502. "
              "Agrega --timeout 300" % (m.group(1) + " s" if m else "30 s (el de por defecto)"))
    else:
        ok("gunicorn --timeout %s" % m.group(1))
    if "gthread" not in svc:
        aviso("gunicorn sin hilos: mientras alguien procesa un ruteo, ese worker no atiende "
              "a nadie mas. Agrega --worker-class gthread --threads 4")
    else:
        ok("gunicorn con hilos (gthread)")
ngx = None
for ruta in ["/etc/nginx/sites-enabled/techdito", "/etc/nginx/sites-available/techdito"]:
    ngx = leer(ruta)
    if ngx is not None:
        break
if ngx is None:
    aviso("no se pudo leer la configuracion de nginx (revisala a mano)")
else:
    if "client_max_body_size" not in ngx:
        aviso("nginx sin client_max_body_size: archivos de mas de 1 MB dan error 413. "
              "Agrega client_max_body_size 20M;")
    else:
        ok("nginx client_max_body_size")
    if "proxy_read_timeout" not in ngx:
        aviso("nginx espera 60 s por defecto: agrega proxy_read_timeout 300s;")
    else:
        ok("nginx proxy_read_timeout")

# ---------------------------------------------------------------- 8) recursos
titulo("Recursos del servidor")
try:
    nucleos = os.cpu_count() or 1
    mem = {}
    for linea in open("/proc/meminfo"):
        k, val = linea.split(":", 1)
        mem[k] = int(val.split()[0]) // 1024
    total, libre = mem.get("MemTotal", 0), mem.get("MemAvailable", 0)
    ok("%d nucleo(s), %d MB de RAM, %d MB libres ahora" % (nucleos, total, libre))
    if total and total < 1800:
        aviso("con menos de 2 GB de RAM, 3 workers con pandas pueden quedarse sin memoria; "
              "usa --workers 2 o agrega swap")
except Exception:
    aviso("no se pudo leer CPU/RAM")

# ---------------------------------------------------------- 9) internet (opcional)
if "--red" in sys.argv:
    titulo("Servicios externos")
    try:
        from geopy.geocoders import ArcGIS
        r = ArcGIS(timeout=10).geocode("Plaza de Armas, Trujillo, La Libertad, Peru")
        if r:
            ok("ArcGIS responde (%.5f, %.5f)" % (r.latitude, r.longitude))
        else:
            aviso("ArcGIS respondio sin resultado")
    except Exception as e:
        aviso("ArcGIS no responde desde este servidor: %s" % e)
    try:
        sys.path.insert(0, os.path.join(RAIZ, "app"))
        import gis_sedalib as g
        if not g.disponible():
            aviso("GIS Sedalib: %s" % g.motivo_no_disponible())
        else:
            res, err = g.consultar(["10015005313"], hilos=1, tope=1)
            if res.get("10015005313"):
                ok("GIS Sedalib responde y acepta las credenciales desde este servidor")
            else:
                aviso("GIS Sedalib: %s" % (err or "respondio, pero sin el suministro de prueba"))
    except Exception as e:
        aviso("GIS Sedalib: %s" % e)

# ----------------------------------------------------------------- resultado
print()
if errores:
    print("NO REINICIES: hay %d problema(s) [X]. El sistema sigue con el codigo anterior "
          "mientras no reinicies." % len(errores))
    sys.exit(1)
print("LISTO PARA REINICIAR (%d aviso(s) [!] que no impiden arrancar)." % len(avisos))
print("    sudo systemctl restart techdito && sudo systemctl status techdito --no-pager")
