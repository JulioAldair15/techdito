import os
import json
import calendar
import requests
from datetime import datetime

# BASE_FOLDER = r"\\192.168.1.201\images\lecturas"
BASE_FOLDER = r"D:\Fotos\Camera"
ARCHIVO_INDEX = "index_archivos_1.json"
API_URL = "http://127.0.0.1:5000/subir-json"
ERROR_LOG = "errores_api.txt"

index = []

print("[LOG] Iniciando indexado de LECTURAS...")
for root, dirs, files in os.walk(BASE_FOLDER):
    for file in files:
        if file.lower().endswith(".jpg"):
            # Ruta relativa desde BASE_FOLDER, estilo UNIX
            relative_path = os.path.relpath(root, BASE_FOLDER)
            carpeta_completa = relative_path.replace("\\", "/")  # ej: "202501/18"

            # Extraer la parte de año y mes
            carpeta_fecha = carpeta_completa.split("/")[0]

            if len(carpeta_fecha) == 6 and carpeta_fecha.isdigit():
                anio = carpeta_fecha[:4]
                mes = carpeta_fecha[4:6]
                try:
                    mes_nombre = calendar.month_name[int(mes)].capitalize()
                    leyenda = f"{mes_nombre} - {anio}"
                except:
                    leyenda = "LECTURAS"
            else:
                leyenda = "LECTURAS"

            index.append({
                "carpeta": carpeta_completa,
                "filename": file,
                "leyenda": leyenda,
                "origen": "lecturas"
            })

            print(f"[LOG] Imagen: {file} (Carpeta: {carpeta_completa}, Leyenda: {leyenda})")

# Guardar el índice
with open(ARCHIVO_INDEX, "w", encoding="utf-8") as f:
    json.dump(index, f, ensure_ascii=False)

print(f"[LOG] Indexado completo de lecturas: {len(index)} archivos.")


# -------------------------
# Subir el archivo a la API
# -------------------------
try:
    with open(ARCHIVO_INDEX, "rb") as f:
        files = {
            "archivo": (ARCHIVO_INDEX, f, "application/json")
        }
        data = {
            "tipo": "lecturas"   # o "lecturas"
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
            f"{datetime.now().isoformat()} - ERROR API LECTURAS: {str(e)}\n"
        )

    print("[ERROR] No se pudo subir el archivo. Ver errores_api.txt")