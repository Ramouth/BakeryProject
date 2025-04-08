from backend.app import create_app
from backend.models import db
from backend.models.bakery import Bakery
from backend.models.pastry import Pastry
import os

print("📍 Using DB:", os.getenv("DATABASE_URL", "sqlite:///instance/bakery_reviews.db"))

# Sample data
sample_bakeries = [
    {"name": "Hart", "zip_code": "2100"},
    {"name": "Lagkagehuset", "zip_code": "2200"},
    {"name": "Andersen og Maillard", "zip_code": "2300"},
]

sample_pastries = [
    {"name": "Croissant", "bakery_name": "Hart"},
    {"name": "Kanelsnegl", "bakery_name": "Hart"},
    {"name": "Bolle", "bakery_name": "Lagkagehuset"},
    {"name": "Rugbrød", "bakery_name": "Lagkagehuset"},
    {"name": "Linse", "bakery_name": "Lagkagehuset"},
    {"name": "Jordbærtærte", "bakery_name": "Andersen og Maillard"},
    {"name": "Hindbærsnitte", "bakery_name": "Andersen og Maillard"},
]

# Create and configure app
app = create_app()

with app.app_context():
    print("🔄 Dropping & recreating all tables...")
    db.drop_all()
    db.create_all()

    print("🌱 Seeding sample bakeries...")
    for data in sample_bakeries:
        bakery = Bakery(name=data["name"], zip_code=data["zip_code"])
        db.session.add(bakery)
    db.session.commit()

    print("🌱 Seeding sample pastries...")
    bakeries = {b.name: b for b in Bakery.query.all()}

    for data in sample_pastries:
        bakery = bakeries.get(data["bakery_name"])
        if bakery:
            pastry = Pastry(name=data["name"], bakery_id=bakery.id)
            db.session.add(pastry)
        else:
            print(f"⚠️  Bakery '{data['bakery_name']}' not found. Skipping pastry '{data['name']}'.")

    db.session.commit()
    print("✅ Database seeding complete!")
