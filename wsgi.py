from app import create_app
from flask.cli import FlaskGroup
from models import db

app = create_app()
cli = FlaskGroup(create_app=lambda: app)

@cli.command("db_create_all")
def db_create_all():
    """Create all tables"""
    db.create_all()

if __name__ == '__main__':
    cli()