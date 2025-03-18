from flask import Blueprint

bakery_bp = Blueprint('bakery', __name__)

from . import bakeryroutes