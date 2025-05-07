from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Index
from sqlalchemy.orm import relationship
from backend.extensions import db 

class Bakery(db.Model):
    """Bakery model representing bakery businesses"""
    __tablename__ = 'bakery'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(80), nullable=False)
    zip_code = Column(String(4), nullable=False)
    street_name = Column(String(80), nullable=False)
    street_number = Column(String(10), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    image_url = Column(String(255), nullable=True)
    website_url = Column(String(255), nullable=True)
    
    # Relationships with cascade deletes
    products = relationship('Product', back_populates='bakery', cascade='all, delete-orphan')
    bakery_reviews = relationship('BakeryReview', back_populates='bakery', cascade='all, delete-orphan')
    
    # Indexes for faster queries
    __table_args__ = (
        Index('idx_bakery_name', 'name'),
        Index('idx_bakery_zip', 'zip_code'),
        Index('idx_bakery_street', 'street_name', 'street_number'),
    )
    
    def __init__(self, name, zip_code, street_name, street_number, image_url=None, website_url=None):
        self.name = name
        self.zip_code = zip_code
        self.street_name = street_name
        self.street_number = street_number
        self.image_url = image_url
        self.website_url = website_url

    
    def __repr__(self):
        return f'<Bakery {self.name}>'
    
    def to_json(self):
        """Convert to JSON serializable dictionary"""
        return {
            'id': self.id,
            'name': self.name,
            'zipCode': self.zip_code,
            'streetName': self.street_name,
            'streetNumber': self.street_number,
            'imageUrl': self.image_url,
            'websiteUrl': self.website_url,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    