from datetime import datetime
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Index
from sqlalchemy.orm import relationship
from . import db

class Product(db.Model):
    """Product model representing bakery products"""
    __tablename__ = 'product'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(80), nullable=False)
    bakery_id = Column(Integer, ForeignKey('bakery.id', ondelete='CASCADE'), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    category = Column(String(50), nullable=True)
    image_url = Column(String(255), nullable=True)
    
    # Relationships
    bakery = relationship('Bakery', back_populates='products')
    product_reviews = relationship('ProductReview', back_populates='product', cascade='all, delete-orphan')
    
    # Indexes for faster queries
    __table_args__ = (
        Index('idx_product_name', 'name'),
        Index('idx_product_bakery_id', 'bakery_id'),
    )
    
    def __init__(self, name, bakery_id, category=None, image_url=None):
        self.name = name
        self.bakery_id = bakery_id
        self.category = category
        self.image_url = image_url
    
    def __repr__(self):
        return f'<product {self.name}>'
    
    def to_json(self):
        """Convert to JSON serializable dictionary"""
        return {
            'id': self.id,
            'name': self.name,
            'bakeryId': self.bakery_id,
            'category': self.category,
            'imageUrl': self.image_url,
            'bakery': {
                'id': self.bakery.id,
                'name': self.bakery.name
            } if self.bakery else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }