import os
import sys

# Add the project root directory to the Python path if needed
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from flask.cli import FlaskGroup
from backend.app import create_app  # Should work if wsgi.py is in project root
from backend.extensions import db

# Create the Flask app
app = create_app()

# Create a Flask CLI group
cli = FlaskGroup(app)

@cli.command("create_db")
def create_db():
    """Create database tables without using migrations.
    Note: For development only. Use migrations in production."""
    with app.app_context():
        db.create_all()
        print("All tables created successfully.")

if __name__ == '__main__':
    cli()