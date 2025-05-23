from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Index, CheckConstraint
from sqlalchemy.orm import relationship, declared_attr
from backend.extensions import db 
from datetime import datetime, timedelta

def utc_plus_2():
    """Return current time in UTC+2 timezone"""
    return datetime.utcnow() + timedelta(hours=2)

from datetime import datetime, timedelta

def utc_plus_2():
    """Return current time in UTC+2 timezone"""
    return datetime.utcnow() + timedelta(hours=2)

class BaseReview:
    """Base class for review models with common attributes"""
    id = Column(Integer, primary_key=True)
    review = Column(Text, nullable=True)
    overall_rating = Column(Integer, nullable=False)
    
    # Use declared_attr for foreign keys in mixins, now nullable
    @declared_attr
    def user_id(cls):
        return Column(Integer, ForeignKey('user.id', ondelete='SET NULL'), nullable=True)
    
    created_at = Column(DateTime, default=utc_plus_2)
    updated_at = Column(DateTime, default=utc_plus_2, onupdate=utc_plus_2)
    
    # Define a constraint to ensure ratings are between 1 and 10
    __abstract__ = True

class BakeryReview(db.Model, BaseReview):
    """Bakery review model for storing bakery reviews"""
    __tablename__ = 'bakery_review'
    
    # Use declared_attr for foreign keys in mixins
    @declared_attr
    def bakery_id(cls):
        return Column(Integer, ForeignKey('bakery.id', ondelete='CASCADE'), nullable=False)
    
    service_rating = Column(Integer, nullable=True)
    price_rating = Column(Integer, nullable=True)
    atmosphere_rating = Column(Integer, nullable=True)
    location_rating = Column(Integer, nullable=True)
    
    # Relationships - optional user
    bakery = relationship('Bakery', back_populates='bakery_reviews')
    user = relationship('User', back_populates='bakery_reviews')
    
    # Indexes and constraints
    __table_args__ = (
        CheckConstraint('overall_rating BETWEEN 1 AND 10', name='check_bakery_overall_rating'),
        CheckConstraint('service_rating IS NULL OR service_rating BETWEEN 1 AND 10', name='check_bakery_service_rating'),
        CheckConstraint('price_rating IS NULL OR price_rating BETWEEN 1 AND 10', name='check_bakery_price_rating'),
        CheckConstraint('atmosphere_rating IS NULL OR atmosphere_rating BETWEEN 1 AND 10', name='check_bakery_atmosphere_rating'),
        CheckConstraint('location_rating IS NULL OR location_rating BETWEEN 1 AND 10', name='check_bakery_location_rating'),
        Index('idx_bakery_review_bakery_id', 'bakery_id'),
        Index('idx_bakery_review_user_id', 'user_id'),
    )
    
    def __init__(self, review, overall_rating, service_rating, price_rating, 
                 atmosphere_rating, location_rating, user_id, bakery_id):
        self.review = review
        self.overall_rating = overall_rating
        self.service_rating = service_rating
        self.price_rating = price_rating
        self.atmosphere_rating = atmosphere_rating
        self.location_rating = location_rating
        self.user_id = user_id
        self.bakery_id = bakery_id
    
    def __repr__(self):
        return f'<BakeryReview {self.id}>'
    
    def to_json(self):
        """Convert to JSON serializable dictionary"""
        return {
            'id': self.id,
            'review': self.review,
            'overallRating': self.overall_rating,
            'serviceRating': self.service_rating,
            'priceRating': self.price_rating,
            'atmosphereRating': self.atmosphere_rating,
            'locationRating': self.location_rating,
            'userId': self.user_id,
            'username': self.user.username if self.user else None,
            'bakeryId': self.bakery_id,
            'bakery_name': self.bakery.name if self.bakery else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class ProductReview(db.Model, BaseReview):
    """Product review model for storing product reviews"""
    __tablename__ = 'product_review'
    
    # Use declared_attr for foreign keys in mixins
    @declared_attr
    def product_id(cls):
        return Column(Integer, ForeignKey('product.id', ondelete='CASCADE'), nullable=False)
    
    taste_rating = Column(Integer, nullable=True)
    price_rating = Column(Integer, nullable=True)
    presentation_rating = Column(Integer, nullable=True)
    
    # Relationships - optional user
    product = relationship('Product', back_populates='product_reviews')
    user = relationship('User', back_populates='product_reviews')
    
    # Indexes and constraints
    __table_args__ = (
        CheckConstraint('overall_rating BETWEEN 1 AND 10', name='check_product_overall_rating'),
        CheckConstraint('taste_rating IS NULL OR taste_rating BETWEEN 1 AND 10', name='check_product_taste_rating'),
        CheckConstraint('price_rating IS NULL OR price_rating BETWEEN 1 AND 10', name='check_product_price_rating'),
        CheckConstraint('presentation_rating IS NULL OR presentation_rating BETWEEN 1 AND 10', name='check_product_presentation_rating'),
        Index('idx_product_review_product_id', 'product_id'),
        Index('idx_product_review_user_id', 'user_id'),
    )
    
    def __init__(self, review, overall_rating, taste_rating, price_rating, 
                 presentation_rating, user_id, product_id):
        self.review = review
        self.overall_rating = overall_rating
        self.taste_rating = taste_rating
        self.price_rating = price_rating
        self.presentation_rating = presentation_rating
        self.user_id = user_id
        self.product_id = product_id
    
    def __repr__(self):
        return f'<ProductReview {self.id}>'
    
    def to_json(self):
        """Convert to JSON serializable dictionary"""
        return {
            'id': self.id,
            'review': self.review,
            'overallRating': self.overall_rating,
            'tasteRating': self.taste_rating,
            'priceRating': self.price_rating,
            'presentationRating': self.presentation_rating,
            'userId': self.user_id,
            'username': self.user.username if self.user else None,
            'productId': self.product_id,
            'product_name': self.product.name if self.product else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }