import os
import json
import calendar
import requests
from datetime import datetime, timedelta
import calendar

BASE_FOLDER = r"\\192.168.1.201\images\lecturas"
# BASE_FOLDER = r"D:\imagenes\lecturas"
ARCHIVO_INDEX = "index_archivos_1.json"
API_URL = "http://136.111.173.183:8000/add-or-update-imagenes"
ERROR_LOG = "errores_api.txt"

DIAS_RECIENTES = 3
fecha_limite = datetime.now() - timedelta(days=DIAS_RECIENTES)

index = []

print("[LOG] Iniciando indexado de LECTURAS...")
for root, dirs, files in os.walk(BASE_FOLDER):
    for file in files:
        if file.lower().endswith(".jpg"):
            ruta_completa = os.path.join(root, file)

            # Obtener fecha de creación/modificación
            fecha_creacion = datetime.fromtimestamp(os.path.getctime(ruta_completa))
            fecha_modificacion = datetime.fromtimestamp(os.path.getmtime(ruta_completa))
            fecha_mas_reciente = max(fecha_creacion, fecha_modificacion)

            # FILTRO: solo imágenes recientes
            if fecha_mas_reciente < fecha_limite:
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

            print(f"[LOG] Imagen: {file} (Carpeta: {carpeta_completa}, Leyenda: {leyenda}), F. Reciente: ({fecha_mas_reciente})")

# Guardar el índice
# with open(ARCHIVO_INDEX, "w", encoding="utf-8") as f:
#     json.dump(index, f, ensure_ascii=False)
# 
# print(f"[LOG] Indexado completo de lecturas: {len(index)} archivos.")

# Enviar a la API
if index:
    # Enviar a la API
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
        error_msg = f"[{datetime.now()}] ERROR (lecturas): {str(e)}\n"
        print(error_msg)

        with open(ERROR_LOG, "a", encoding="utf-8") as f:
            f.write(error_msg)

else:
    print("[INFO] No hay archivos nuevos para enviar.")
