import sys
import os

# Add the backend directory to sys.path
sys.path.append(os.path.abspath(os.path.dirname(__file__)))

from backend import create_app

app = create_app()