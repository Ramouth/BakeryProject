import os
import sys

# Add the project root directory to the Python path if needed
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from backend.app import create_app

# Create the Flask app for WSGI servers
app = create_app()

# You can optionally define a FlaskGroup here if you want to run
# CLI commands through your WSGI entry point, but it's generally
# cleaner to keep management commands in manage.py.
#
# from flask.cli import FlaskGroup
# cli = FlaskGroup(app)
#
# @cli.command("some_other_task")
# def some_other_task():
# # Your other task here
# pass
#
# if __name__ == '__main__':
# cli()

# The 'app' variable is what WSGI servers will look for.