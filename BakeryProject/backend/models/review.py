from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Index, CheckConstraint
from sqlalchemy.orm import relationship, declared_attr
from . import db

class BaseReview:
    """Base class for review models with common attributes"""
    id = Column(Integer, primary_key=True)
    review = Column(Text, nullable=False)
    overall_rating = Column(Integer, nullable=False)
    
    # Use declared_attr for foreign keys in mixins, now nullable
    @declared_attr
    def contact_id(cls):
        return Column(Integer, ForeignKey('contact.id', ondelete='SET NULL'), nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Define a constraint to ensure ratings are between 1 and 5
    __abstract__ = True

class BakeryReview(db.Model, BaseReview):
    """Bakery review model for storing bakery reviews"""
    __tablename__ = 'bakery_review'
    
    # Use declared_attr for foreign keys in mixins
    @declared_attr
    def bakery_id(cls):
        return Column(Integer, ForeignKey('bakery.id', ondelete='CASCADE'), nullable=False)
    
    service_rating = Column(Integer, nullable=False)
    price_rating = Column(Integer, nullable=False)
    atmosphere_rating = Column(Integer, nullable=False)
    location_rating = Column(Integer, nullable=False)
    
    # Relationships - optional contact
    bakery = relationship('Bakery', back_populates='bakery_reviews')
    contact = relationship('Contact', back_populates='bakery_reviews')
    
    # Indexes and constraints
    __table_args__ = (
        CheckConstraint('overall_rating BETWEEN 1 AND 10', name='check_bakery_overall_rating'),
        CheckConstraint('service_rating BETWEEN 1 AND 10', name='check_bakery_service_rating'),
        CheckConstraint('price_rating BETWEEN 1 AND 10', name='check_bakery_price_rating'),
        CheckConstraint('atmosphere_rating BETWEEN 1 AND 10', name='check_bakery_atmosphere_rating'),
        CheckConstraint('location_rating BETWEEN 1 AND 10', name='check_bakery_location_rating'),
        Index('idx_bakery_review_bakery_id', 'bakery_id'),
        Index('idx_bakery_review_contact_id', 'contact_id'),
    )
    
    def __init__(self, review, overall_rating, service_rating, price_rating, 
                 atmosphere_rating, location_rating, contact_id, bakery_id):
        self.review = review
        self.overall_rating = overall_rating
        self.service_rating = service_rating
        self.price_rating = price_rating
        self.atmosphere_rating = atmosphere_rating
        self.location_rating = location_rating
        self.contact_id = contact_id
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
            'contactId': self.contact_id,
            'contact_name': f"{self.contact.first_name} {self.contact.last_name}" if self.contact else None,
            'bakeryId': self.bakery_id,
            'bakery_name': self.bakery.name if self.bakery else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class PastryReview(db.Model, BaseReview):
    """Pastry review model for storing pastry reviews"""
    __tablename__ = 'pastry_review'
    
    # Use declared_attr for foreign keys in mixins
    @declared_attr
    def pastry_id(cls):
        return Column(Integer, ForeignKey('pastry.id', ondelete='CASCADE'), nullable=False)
    
    taste_rating = Column(Integer, nullable=False)
    price_rating = Column(Integer, nullable=False)
    presentation_rating = Column(Integer, nullable=False)
    
    # Relationships - optional contact
    pastry = relationship('Pastry', back_populates='pastry_reviews')
    contact = relationship('Contact', back_populates='pastry_reviews')
    
    # Indexes and constraints
    __table_args__ = (
        CheckConstraint('overall_rating BETWEEN 1 AND 10', name='check_pastry_overall_rating'),
        CheckConstraint('taste_rating BETWEEN 1 AND 10', name='check_pastry_taste_rating'),
        CheckConstraint('price_rating BETWEEN 1 AND 10', name='check_pastry_price_rating'),
        CheckConstraint('presentation_rating BETWEEN 1 AND 10', name='check_pastry_presentation_rating'),
        Index('idx_pastry_review_pastry_id', 'pastry_id'),
        Index('idx_pastry_review_contact_id', 'contact_id'),
    )
    
    def __init__(self, review, overall_rating, taste_rating, price_rating, 
                 presentation_rating, contact_id, pastry_id):
        self.review = review
        self.overall_rating = overall_rating
        self.taste_rating = taste_rating
        self.price_rating = price_rating
        self.presentation_rating = presentation_rating
        self.contact_id = contact_id
        self.pastry_id = pastry_id
    
    def __repr__(self):
        return f'<PastryReview {self.id}>'
    
    def to_json(self):
        """Convert to JSON serializable dictionary"""
        return {
            'id': self.id,
            'review': self.review,
            'overallRating': self.overall_rating,
            'tasteRating': self.taste_rating,
            'priceRating': self.price_rating,
            'presentationRating': self.presentation_rating,
            'contactId': self.contact_id,
            'contact_name': f"{self.contact.first_name} {self.contact.last_name}" if self.contact else None,
            'pastryId': self.pastry_id,
            'pastry_name': self.pastry.name if self.pastry else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }