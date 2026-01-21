# indexador.py
import os
import json
import requests
from datetime import datetime, timedelta
import calendar

BASE_FOLDER = r"\\192.168.1.201\images\ordenes"
ARCHIVO_INDEX = "index_archivos_1.json"
API_URL = "http://136.111.173.183:8000/api/imagenes"
ERROR_LOG = "errores_api.txt"

# BASE_FOLDER = r"D:\\DEVESOFT"
# API_URL = "http://192.168.10.14:5000/api/imagenes"

index = []

# Fecha límite: hace 7 días
fecha_limite = datetime.now() - timedelta(days=7)

# Construir índice
for root, dirs, files in os.walk(BASE_FOLDER):
    for file in files:
        if file.lower().endswith(".jpg"):


            #VALIDACION DE LA FECHA
            ###############################################

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

            # ✅ Usar la fecha más reciente (creación o modificación)
            fecha_relevante = max(fecha_creacion, fecha_modificacion)

            print(str(fecha_relevante))

            # Solo archivos de la última semana
            if fecha_relevante < fecha_limite:
                continue

            ###############################################



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
                "path": os.path.join(root, file).replace("\\", "/"),
                "leyenda": leyenda,
                "origen": "lecturas"
            })

print(f"[LOG] Indexado completo: {len(index)} archivos registrados.")

# Guardar el JSON local (backup)
with open(ARCHIVO_INDEX, "w", encoding="utf-8") as f:
    json.dump({"imagenes": index}, f, ensure_ascii=False, indent=2)

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
        error_msg = f"[{datetime.now()}] ERROR API: {str(e)}\n"
        print(error_msg)

        with open(ERROR_LOG, "a", encoding="utf-8") as f:
            f.write(error_msg)

else:
    print("[INFO] No hay archivos nuevos para enviar.")
