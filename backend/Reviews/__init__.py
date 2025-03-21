from flask import Blueprint

bakeryreview_bp = Blueprint('bakeryreview', __name__)
pastryreview_bp = Blueprint('pastryreview', __name__)

from . import bakeryreviewroutes
from . import pastryreviewroutes