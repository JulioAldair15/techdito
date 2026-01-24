# indexador.py
import os
import json
import requests
from datetime import datetime, timedelta

# BASE_FOLDER = r"F:\images\ordenes"
BASE_FOLDER = r"C:\Users\HP\Desktop\aldair\images\ordenes"
ARCHIVO_INDEX = "index_archivos_2.json"
# API_URL = "http://136.111.173.183:8000/add-or-update-imagenes"
API_URL = "http://127.0.0.1:5000/add-or-update-imagenes"
ERROR_LOG = "errores_api.txt"

DIAS_RECIENTES = 3
fecha_limite = datetime.now() - timedelta(days=DIAS_RECIENTES)

BATCH_SIZE = 200

index = []
bloque_nro = 1
total_imagenes = 0

def enviar_batch(batch, nro):
    try:
        response = requests.post(
            API_URL,
            json={"imagenes": batch},
            timeout=60
        )

        if response.status_code not in (200, 201):
            raise Exception(f"Status {response.status_code} - {response.text}")

        print(f"[OK] Bloque {nro} enviado ({len(batch)} registros)")

    except Exception as e:
        error_msg = f"[{datetime.now()}] ERROR (ordenes) bloque {nro}: {str(e)}\n"
        print(error_msg)
        with open(ERROR_LOG, "a", encoding="utf-8") as f:
            f.write(error_msg)


for root, dirs, files in os.walk(BASE_FOLDER):
    for file in files:
        if file.lower().endswith(".jpg"):
            ruta_completa = os.path.join(root, file)

            # Obtener fecha de creación/modificación
            fecha_creacion = datetime.fromtimestamp(os.path.getctime(ruta_completa))
            fecha_modificacion = datetime.fromtimestamp(os.path.getmtime(ruta_completa))
            fecha_mas_reciente = max(fecha_creacion, fecha_modificacion)

            # # FILTRO: solo imágenes recientes
            if fecha_mas_reciente < fecha_limite:
                continue  # saltar imagen antigua """

            carpeta = os.path.basename(root)
            index.append({
                "carpeta": carpeta,
                "filename": file,
                "path": os.path.join(root, file).replace("\\", "/"),
                "origen": "ordenes"
            })

            total_imagenes += 1

            print(f"[LOG] Imagen: {file} (Carpeta: {carpeta}, F. Reciente: ({fecha_mas_reciente})")

            if len(index) >= BATCH_SIZE:
                enviar_batch(index, bloque_nro)
                bloque_nro += 1
                index.clear()

# Guardar el índice
# with open(ARCHIVO_INDEX, "w", encoding="utf-8") as f:
#     json.dump(index, f, ensure_ascii=False)
# 
# print(f"[LOG] Indexado completo: {len(index)} archivos registrados.")

# Enviar último bloque
if index:
    enviar_batch(index, bloque_nro)

msg = f"[{datetime.now()}] (ordenes) - Total procesadas: {total_imagenes}\n"

print(msg)

with open("envio_api.txt", "a", encoding="utf-8") as f:
    f.write(msg)


