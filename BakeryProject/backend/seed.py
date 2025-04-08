from backend.app import create_app
from backend.models import db
from backend.models.bakery import Bakery
import os

print("📍 Using DB:", os.getenv("DATABASE_URL", "sqlite:///bakery_reviews.db"))

sample_bakeries = [
    {"name": "Hart", "zip_code": "2100"},
    {"name": "Lagkagehuset", "zip_code": "2200"},
    {"name": "Andersen og Maillard", "zip_code": "2300"},
]

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
    print("✅ Done!")
