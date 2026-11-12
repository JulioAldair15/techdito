from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from config import Config
import logging, os

# ANTES: DEBUG (registraba cada consulta y cada fila). AHORA: WARNING.
logging.getLogger('sqlalchemy.engine').setLevel(logging.WARNING)

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 20 * 1024 * 1024
app.config.from_object(Config)
# app.secret_key= os.urandom(24)
app.secret_key= Config.SECRET_KEY
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)

from . import routes

# Ruteo que ya viene armado en el Excel (solo genera cargas y planos)
from .rutas_excel import registrar as _registrar_rutas_excel
_registrar_rutas_excel(app)
