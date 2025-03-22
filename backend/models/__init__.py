from flask_sqlalchemy import SQLAlchemy

# Create database instance
db = SQLAlchemy()

# Import models to make them available when importing the models package
from .bakery import Bakery
from .pastry import Pastry
from .review import BakeryReview, PastryReview
from .user import Contact