from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from config import Config
import logging, os

# ⚡ ANTES: setLevel(logging.DEBUG) -> SQLAlchemy registraba CADA consulta y CADA FILA devuelta
#    (el kardex trae miles de filas x 28 columnas) y volvía lento el servidor.
logging.getLogger('sqlalchemy.engine').setLevel(logging.WARNING)

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 20 * 1024 * 1024
app.config.from_object(Config)
# app.secret_key= os.urandom(24)
app.secret_key= Config.SECRET_KEY
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
