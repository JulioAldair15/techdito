from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from config import Config
import logging, os

logging.getLogger('sqlalchemy.engine').setLevel(logging.DEBUG)

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 20 * 1024 * 1024
app.config.from_object(Config)
# app.secret_key= os.urandom(24)
app.secret_key= Config.SECRET_KEY
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)

logging.getLogger('sqlalchemy.engine').setLevel(logging.DEBUG)

from . import routes