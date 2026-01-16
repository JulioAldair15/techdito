from flask.cli import FlaskGroup
from flask_migrate import Migrate, MigrateCommand
from app import app, db

# Configuración de la aplicación y la base de datos
app.config.from_object('config')
migrate = Migrate(app, db)

cli = FlaskGroup(app)
cli.add_command('db', MigrateCommand)

if __name__ == '__main__':
    cli()