from datetime import datetime
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Index
from sqlalchemy.orm import relationship
from backend.extensions import db  # Fixed import statement

class Product(db.Model):
    """Product model representing bakery products."""
    __tablename__ = 'product'

    id = Column(Integer, primary_key=True)
    name = Column(String(80), nullable=False)
    bakery_id = Column(Integer, ForeignKey('bakery.id', ondelete='CASCADE'), nullable=False)
    category_id = Column(Integer, ForeignKey('category.id', ondelete='SET NULL'), nullable=True)
    subcategory_id = Column(Integer, ForeignKey('subcategory.id', ondelete='SET NULL'), nullable=True)
    image_url = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    bakery = relationship('Bakery', back_populates='products')
    category = relationship('Category', back_populates='products')
    subcategory = relationship('Subcategory', back_populates='products')
    product_reviews = relationship('ProductReview', back_populates='product', cascade='all, delete-orphan')

    # Indexes
    __table_args__ = (
        Index('idx_product_name', 'name'),
        Index('idx_product_bakery_id', 'bakery_id'),
        Index('idx_product_category_id', 'category_id'),
        Index('idx_product_subcategory_id', 'subcategory_id'),
    )

    def __init__(self, name, bakery_id, category_id=None, subcategory_id=None, image_url=None):
        self.name = name
        self.bakery_id = bakery_id
        self.category_id = category_id
        self.subcategory_id = subcategory_id
        self.image_url = image_url

    def __repr__(self):
        return f'<Product {self.name}>'

    def to_json(self):
        """Serialize product instance to JSON-compatible dict."""
        return {
            'id': self.id,
            'name': self.name,
            'bakeryId': self.bakery_id,
            'categoryId': self.category_id,
            'subcategoryId': self.subcategory_id,
            'imageUrl': self.image_url,
            'bakery': {
                'id': self.bakery.id,
                'name': self.bakery.name
            } if self.bakery else None,
            'category': {
                'id': self.category.id,
                'name': self.category.name
            } if self.category else None,
            'subcategory': {
                'id': self.subcategory.id,
                'name': self.subcategory.name
            } if self.subcategory else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }