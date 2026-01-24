import os
import json
import calendar
import requests
from datetime import datetime, timedelta
import calendar

# BASE_FOLDER = r"F:\images\lecturas"
BASE_FOLDER = r"C:\Users\HP\Desktop\aldair\images\lecturas"
ARCHIVO_INDEX = "index_archivos_1.json"
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
        error_msg = f"[{datetime.now()}] ERROR (lecturas) bloque {nro}: {str(e)}\n"
        print(error_msg)
        with open(ERROR_LOG, "a", encoding="utf-8") as f:
            f.write(error_msg)


print("[LOG] Iniciando indexado de LECTURAS...")
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
                print("Se salteara la imagen")
                continue  # saltar imagen antigua """

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
                "origen": "lecturas",
                "path": ruta_completa.replace("\\", "/")
            })

            total_imagenes += 1

            print(f"[LOG] Imagen: {file} (Carpeta: {carpeta_completa}, Leyenda: {leyenda}), F. Reciente: ({fecha_mas_reciente})")

            if len(index) >= BATCH_SIZE:
                enviar_batch(index, bloque_nro)
                bloque_nro += 1
                index.clear()


# Guardar el índice
# with open(ARCHIVO_INDEX, "w", encoding="utf-8") as f:
#     json.dump(index, f, ensure_ascii=False)
# 
# print(f"[LOG] Indexado completo de lecturas: {len(index)} archivos.")

# Enviar último bloque
if index:
    enviar_batch(index, bloque_nro)

msg = f"[{datetime.now()}] (lecturas) - Total procesadas: {total_imagenes}\n"

print(msg)

with open("envio_api.txt", "a", encoding="utf-8") as f:
    f.write(msg)
