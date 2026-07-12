import os

class Config:
    SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://root:@localhost:3306/radian_asistencias'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = "REVWRVNPRlRfTE"


    # Configuración para Google Cloud Storage
    # IVARGAS - 11/07/2026
    # ========================================

    # SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://u308659888_radian_asis:Wu#8|j0FoY@srv2021.hstgr.io:3306/u308659888_radian_asis'
    # SQLALCHEMY_TRACK_MODIFICATIONS = False
    # SECRET_KEY = "REVWRVNPRlRfTE"

    GCS_BUCKET_NAME = "techdito-storage"
    GCS_CREDENTIALS_FILE = "cuenta_techdito_gcs.json" #os.environ.get('GCS_CREDENTIALS_FILE', '')
    GCS_SIGNED_URL_EXPIRATION = int(os.environ.get('GCS_SIGNED_URL_EXPIRATION', '15'))
    # ========================================