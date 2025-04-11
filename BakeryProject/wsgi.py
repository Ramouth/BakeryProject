import sys
import os
from werkzeug.middleware.proxy_fix import ProxyFix
from backend import create_app


# Add the backend directory to sys.path
sys.path.append(os.path.abspath(os.path.dirname(__file__)))

from backend.app import create_app

app = create_app()
app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1)
