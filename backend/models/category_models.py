from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Index
from sqlalchemy.orm import relationship
from backend.extensions import db 

class Category(db.Model):
    """Category model for product categories"""
    __tablename__ = 'category'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(50), nullable=False, unique=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    subcategories = relationship('Subcategory', back_populates='category', cascade='all, delete-orphan')
    products = relationship('Product', back_populates='category')
    
    # Indexes
    __table_args__ = (
        Index('idx_category_name', 'name', unique=True),
    )
    
    def __init__(self, name):
        self.name = name
    
    def __repr__(self):
        return f'<Category {self.name}>'
    
    def to_json(self):
        """Convert to JSON serializable dictionary"""
        return {
            'id': self.id,
            'name': self.name,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


class Subcategory(db.Model):
    """Subcategory model for product subcategories"""
    __tablename__ = 'subcategory'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(50), nullable=False)
    category_id = Column(Integer, db.ForeignKey('category.id', ondelete='CASCADE'), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    category = relationship('Category', back_populates='subcategories')
    products = relationship('Product', back_populates='subcategory')
    
    # Indexes
    __table_args__ = (
        Index('idx_subcategory_name', 'name'),
        Index('idx_subcategory_category_id', 'category_id'),
        Index('idx_unique_category_subcategory', 'category_id', 'name', unique=True),
    )
    
    def __init__(self, name, category_id):
        self.name = name
        self.category_id = category_id
    
    def __repr__(self):
        return f'<Subcategory {self.name}>'
    
    def to_json(self):
        """Convert to JSON serializable dictionary"""
        return {
            'id': self.id,
            'name': self.name,
            'categoryId': self.category_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }