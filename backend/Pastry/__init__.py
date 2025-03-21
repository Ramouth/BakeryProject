from flask import Blueprint

pastry_bp = Blueprint('pastry', __name__)

from . import pastryroutes