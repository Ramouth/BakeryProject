from . import db
from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Index
from sqlalchemy.orm import relationship

class Bakery(db.Model):
    """Bakery model representing bakery businesses"""
    __tablename__ = 'bakery'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(80), nullable=False)
    zip_code = Column(String(4), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    pastries = relationship('Pastry', back_populates='bakery', cascade='all, delete-orphan')
    bakery_reviews = relationship('BakeryReview', back_populates='bakery', cascade='all, delete-orphan')
    
    # Indexes for faster queries
    __table_args__ = (
        Index('idx_bakery_name', 'name'),
        Index('idx_bakery_zip', 'zip_code'),
    )
    
    def __init__(self, name, zip_code):
        self.name = name
        self.zip_code = zip_code
    
    def __repr__(self):
        return f'<Bakery {self.name}>'
    
    def to_json(self):
        """Convert to JSON serializable dictionary"""
        return {
            'id': self.id,
            'name': self.name,
            'zipCode': self.zip_code,
        }