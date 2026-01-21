# indexador.py
import os
import json
import requests
from datetime import datetime

# BASE_FOLDER = r"\\192.168.1.201\images\ordenes"
BASE_FOLDER = r"D:\DEVESOFT"
ARCHIVO_INDEX = "index_archivos_2.json"
API_URL = "http://127.0.0.1:5000/subir-json"
ERROR_LOG = "errores_api.txt"

index = []

# Construir índice
for root, dirs, files in os.walk(BASE_FOLDER):
    for file in files:
        if file.lower().endswith(".jpg"):
            carpeta = os.path.basename(root)
            index.append({
                "carpeta": carpeta,
                "filename": file,
                "path": os.path.join(root, file).replace("\\", "/")
            })

# Guardar el JSON local
with open(ARCHIVO_INDEX, "w", encoding="utf-8") as f:
    json.dump(index, f, ensure_ascii=False)

print(f"[LOG] Indexado completo: {len(index)} archivos registrados.")

# -------------------------
# Subir el archivo a la API
# -------------------------
try:
    with open(ARCHIVO_INDEX, "rb") as f:
        files = {
            "archivo": (ARCHIVO_INDEX, f, "application/json")
        }
        data = {
            "tipo": "ordenes"   # o "lecturas"
        }

        response = requests.post(API_URL, files=files, data=data, timeout=60)

    # Si la API devuelve error
    if response.status_code != 200:
        error_msg = response.json().get("message", "Error desconocido")

        raise Exception(error_msg)

    print("[LOG] Archivo subido correctamente a la API")

except Exception as e:
    # Guardar error en TXT
    with open(ERROR_LOG, "a", encoding="utf-8") as log:
        log.write(
            f"{datetime.now().isoformat()} - ERROR API ORDENES: {str(e)}\n"
        )

    print("[ERROR] No se pudo subir el archivo. Ver errores_api.txt")
