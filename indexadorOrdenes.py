# indexador.py
import os
import json
import requests
from datetime import datetime, timedelta

# BASE_FOLDER = r"\\192.168.1.201\images\ordenes"
BASE_FOLDER = r"D:\DEVESOFT"

ARCHIVO_INDEX = "index_archivos_2.json"
# API_URL = "http://136.111.173.183:8000/subir-json"
API_URL = "http://192.168.10.14:5000/api/imagenes"
ERROR_LOG = "errores_api.txt"

index = []

# Fecha límite: hace 7 días
fecha_limite = datetime.now() - timedelta(days=7)

# Construir índice
for root, dirs, files in os.walk(BASE_FOLDER):
    for file in files:
        if not file.lower().endswith(".jpg"):
            continue

        ruta_completa = os.path.join(root, file)

        try:
            fecha_creacion = datetime.fromtimestamp(
                os.path.getctime(ruta_completa)
            )
            fecha_modificacion = datetime.fromtimestamp(
                os.path.getmtime(ruta_completa)
            )
        except Exception:
            continue

        # Usar la fecha más reciente
        fecha_relevante = max(fecha_creacion, fecha_modificacion)

        # Solo archivos de la última semana
        if fecha_relevante < fecha_limite:
            continue

        carpeta = os.path.basename(root)

        index.append({
            "carpeta": carpeta,
            "filename": file,
            "path": ruta_completa.replace("\\", "/"),
            "origen":"ordenes"
        })

print(f"[LOG] Indexado completo (≤ 1 semana): {len(index)} archivos registrados.")

# Guardar el JSON local
with open(ARCHIVO_INDEX, "w", encoding="utf-8") as f:
    json.dump(index, f, ensure_ascii=False, indent=2)

# -------------------------
# Subir el archivo a la API
# -------------------------
if index:

    try:
        response = requests.post(
            API_URL,
            json={"imagenes": index},
            timeout=30
        )

        if response.status_code in (200, 201):
            print("[OK] Datos enviados correctamente a la API")
            print("Respuesta:", response.json())
        else:
            raise Exception(
                f"Status {response.status_code} - {response.text}"
            )

    except Exception as e:
        error_msg = f"[{datetime.now()}] ERROR API: {str(e)}\n"
        print(error_msg)

        with open(ERROR_LOG, "a", encoding="utf-8") as f:
            f.write(error_msg)
else:
    print("[INFO] No hay archivos nuevos para enviar.")
