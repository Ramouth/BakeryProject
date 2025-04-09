from backend.app import create_app
from backend.models import db
from backend.models.bakery import Bakery
from backend.models.pastry import Pastry
import os

print("📍 Using DB:", os.getenv("DATABASE_URL", "sqlite:///bakery_reviews.db"))

# Sample bakery data
sample_bakeries = [
    {"name": "Hart", "zip_code": "2100"},
    {"name": "Lagkagehuset", "zip_code": "2200"},
    {"name": "Andersen og Maillard", "zip_code": "2300"},
]

# Sample pastries by bakery name
sample_pastries = {
    "Hart": ["Croissant", "Almond Danish"],
    "Lagkagehuset": ["Cinnamon Swirl", "Vanilla Slice"],
    "Andersen og Maillard": ["Lemon Tart", "Pain au Chocolat"],
}

app = create_app()

with app.app_context():
    print("🌱 Seeding bakeries...")
    bakery_objs = {}

    for data in sample_bakeries:
        # Avoid duplicates
        bakery = Bakery.query.filter_by(name=data["name"], zip_code=data["zip_code"]).first()
        if not bakery:
            bakery = Bakery(name=data["name"], zip_code=data["zip_code"])
            db.session.add(bakery)
            print(f"✅ Added bakery: {bakery.name}")
        else:
            print(f"ℹ️ Bakery already exists: {bakery.name}")
        bakery_objs[data["name"]] = bakery

    db.session.commit()

    print("🌱 Seeding pastries...")
    for bakery_name, pastry_list in sample_pastries.items():
        bakery = bakery_objs.get(bakery_name)
        if not bakery:
            print(f"❌ Skipping pastries for unknown bakery: {bakery_name}")
            continue

        for pastry_name in pastry_list:
            exists = Pastry.query.filter_by(name=pastry_name, bakery_id=bakery.id).first()
            if not exists:
                pastry = Pastry(name=pastry_name, bakery_id=bakery.id)
                db.session.add(pastry)
                print(f"✅ Added pastry '{pastry_name}' for bakery '{bakery_name}'")
            else:
                print(f"ℹ️ Pastry already exists: {pastry_name} at {bakery_name}")

    db.session.commit()
    print("✅ Seeding complete!")
