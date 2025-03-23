from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Index
from sqlalchemy.orm import relationship
from . import db

class Contact(db.Model):
    """User model representing users of the system"""
    __tablename__ = 'contact'
    
    id = Column(Integer, primary_key=True)
    first_name = Column(String(80), nullable=False)
    last_name = Column(String(80), nullable=False)
    email = Column(String(120), unique=True, nullable=False)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    bakery_reviews = relationship('BakeryReview', back_populates='contact', cascade='all, delete-orphan')
    pastry_reviews = relationship('PastryReview', back_populates='contact', cascade='all, delete-orphan')
    
    # Indexes for faster queries
    __table_args__ = (
        Index('idx_contact_email', 'email', unique=True),
        Index('idx_contact_name', 'first_name', 'last_name'),
    )
    
    def __init__(self, first_name, last_name, email, is_admin=False):
        self.first_name = first_name
        self.last_name = last_name
        self.email = email
        self.is_admin = is_admin
    
    def __repr__(self):
        return f'<Contact {self.first_name} {self.last_name}>'
    
    def to_json(self):
        """Convert to JSON serializable dictionary"""
        return {
            'id': self.id,
            'firstName': self.first_name,
            'lastName': self.last_name,
            'email': self.email,
            'isAdmin': self.is_admin,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }