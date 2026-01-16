# indexador.py
import os
import json

BASE_FOLDER = r"\\192.168.1.201\images\ordenes"
ARCHIVO_INDEX = "index_archivos_2.json"

index = []

for root, dirs, files in os.walk(BASE_FOLDER):
    for file in files:
        if file.lower().endswith(".jpg"):
            carpeta = os.path.basename(root)
            index.append({
                "carpeta": carpeta,
                "filename": file,
                "path": os.path.join(root, file).replace("\\", "/")
            })

# Guardar el índice
with open(ARCHIVO_INDEX, "w", encoding="utf-8") as f:
    json.dump(index, f, ensure_ascii=False)

print(f"[LOG] Indexado completo: {len(index)} archivos registrados.")
