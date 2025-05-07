from backend.extensions import db, Category, Subcategory
from sqlalchemy.exc import SQLAlchemyError

class CategoryService:
    """Service class for category-related business logic"""

    def get_all_categories(self):
        """Get all categories ordered by name"""
        return Category.query.order_by(Category.name).all()

    def get_category_by_id(self, category_id):
        """Get a specific category by ID"""
        return Category.query.get(category_id)

    def get_subcategories_by_category(self, category_id):
        """Get all subcategories for a specific category"""
        return Subcategory.query.filter_by(category_id=category_id).order_by(Subcategory.name).all()

    def create_category(self, name):
        """Create a new category"""
        try:
            category = Category(name=name)
            db.session.add(category)
            db.session.commit()
            return category
        except SQLAlchemyError as e:
            db.session.rollback()
            raise Exception(f"Database error: {str(e)}")

    def update_category(self, category_id, name):
        """Update an existing category"""
        try:
            category = self.get_category_by_id(category_id)
            if not category:
                raise Exception("Category not found")
                
            category.name = name
            db.session.commit()
            return category
        except SQLAlchemyError as e:
            db.session.rollback()
            raise Exception(f"Database error: {str(e)}")

    def delete_category(self, category_id):
        """Delete a category"""
        try:
            category = self.get_category_by_id(category_id)
            if not category:
                return False
                
            db.session.delete(category)
            db.session.commit()
            return True
        except SQLAlchemyError as e:
            db.session.rollback()
            raise Exception(f"Database error: {str(e)}")

class SubcategoryService:
    """Service class for subcategory-related business logic"""

    def get_all_subcategories(self):
        """Get all subcategories ordered by name"""
        return Subcategory.query.order_by(Subcategory.name).all()

    def get_subcategory_by_id(self, subcategory_id):
        """Get a specific subcategory by ID"""
        return Subcategory.query.get(subcategory_id)

    def get_subcategories_by_category(self, category_id):
        """Get all subcategories for a specific category"""
        return Subcategory.query.filter_by(category_id=category_id).order_by(Subcategory.name).all()

    def create_subcategory(self, name, category_id):
        """Create a new subcategory"""
        try:
            subcategory = Subcategory(name=name, category_id=category_id)
            db.session.add(subcategory)
            db.session.commit()
            return subcategory
        except SQLAlchemyError as e:
            db.session.rollback()
            raise Exception(f"Database error: {str(e)}")

    def update_subcategory(self, subcategory_id, name, category_id=None):
        """Update an existing subcategory"""
        try:
            subcategory = self.get_subcategory_by_id(subcategory_id)
            if not subcategory:
                raise Exception("Subcategory not found")
                
            subcategory.name = name
            if category_id:
                subcategory.category_id = category_id
                
            db.session.commit()
            return subcategory
        except SQLAlchemyError as e:
            db.session.rollback()
            raise Exception(f"Database error: {str(e)}")

    def delete_subcategory(self, subcategory_id):
        """Delete a subcategory"""
        try:
            subcategory = self.get_subcategory_by_id(subcategory_id)
            if not subcategory:
                return False
                
            db.session.delete(subcategory)
            db.session.commit()
            return True
        except SQLAlchemyError as e:
            db.session.rollback()
            raise Exception(f"Database error: {str(e)}")