from datetime import datetime, timedelta
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Index
from sqlalchemy.orm import relationship
from backend.extensions import db  # Fixed import statement
from flask_bcrypt import generate_password_hash, check_password_hash

class User(db.Model):
    """User model with username and password"""
    __tablename__ = 'user'  # Keep the table name for compatibility
    
    id = Column(Integer, primary_key=True)
    username = Column(String(24), nullable=False, unique=True)
    email = Column(String(50), unique=True, nullable=False)
    password_hash = Column(String(128), nullable=False)
    profile_picture = Column(Integer, default=1, nullable=True)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: (datetime.utcnow() + timedelta(hours=2)))
    updated_at = Column(DateTime, 
                    default=lambda: (datetime.utcnow() + timedelta(hours=2)),
                    onupdate=lambda: (datetime.utcnow() + timedelta(hours=2)))
    
    # Relationships - update to work with ProductReview
    bakery_reviews = relationship('BakeryReview', back_populates='user', cascade='all, delete-orphan')
    product_reviews = relationship('ProductReview', back_populates='user', cascade='all, delete-orphan')
    
    # Indexes for faster queries
    __table_args__ = (
        Index('idx_user_email', 'email', unique=True),
        Index('idx_user_username', 'username', unique=True),
    )
    
    def __init__(self, username, email, password, profile_picture=1, is_admin=False):
        self.username = username
        self.email = email
        self.set_password(password)
        self.profile_picture = profile_picture
        self.is_admin = is_admin
    
    # Password methods
    def set_password(self, password):
        """Hash and set the user password"""
        self.password_hash = generate_password_hash(password).decode('utf-8')
    
    def check_password(self, password):
        """Verify password against stored hash"""
        return check_password_hash(self.password_hash, password)
    
    def __repr__(self):
        return f'<User {self.username}>'
    
    def to_json(self):
        """Convert to JSON serializable dictionary"""
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'profilePicture': self.profile_picture,
            'isAdmin': self.is_admin,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
