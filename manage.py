import os
from flask.cli import FlaskGroup
from backend.app import create_app
from backend.extensions import db

# Create the Flask app
app = create_app()

# Create a Flask CLI group
cli = FlaskGroup(app)

@cli.command("db_create_all")
def db_create_all():
    """Create all database tables."""
    with app.app_context():
        db.create_all()
        print("All tables created successfully.")

if __name__ == '__main__':
    cli()