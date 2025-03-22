from . import db
from datetime import datetime
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Index
from sqlalchemy.orm import relationship

class Pastry(db.Model):
    """Pastry model representing bakery products"""
    __tablename__ = 'pastry'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(80), nullable=False)
    bakery_id = Column(Integer, ForeignKey('bakery.id'), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    bakery = relationship('Bakery', back_populates='pastries')
    pastry_reviews = relationship('PastryReview', back_populates='pastry', cascade='all, delete-orphan')
    
    # Indexes for faster queries
    __table_args__ = (
        Index('idx_pastry_name', 'name'),
        Index('idx_pastry_bakery_id', 'bakery_id'),
    )
    
    def __init__(self, name, bakery_id):
        self.name = name
        self.bakery_id = bakery_id
    
    def __repr__(self):
        return f'<Pastry {self.name}>'
    
    def to_json(self):
        """Convert to JSON serializable dictionary"""
        return {
            'id': self.id,
            'name': self.name,
            'bakeryId': self.bakery_id
        }