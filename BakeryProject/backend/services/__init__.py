# Import services to make them available when importing the services package
from  backend.models import db, Bakery, BakeryReview
from .pastry_service import PastryService
from .review_service import ReviewService
from .user_service import UserService