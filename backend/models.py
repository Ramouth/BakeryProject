from config import db

class Contact(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(80), unique=False, nullable=False)
    last_name = db.Column(db.String(80), unique=False, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)

    def to_json(self):
        return {
            "id": self.id,
            "firstName": self.first_name,
            "lastName": self.last_name,
            "email": self.email,
        }
    

class Bakery(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), unique=False, nullable=False)
    zip_code = db.Column(db.String(4), unique=False, nullable=False)
    
    def to_json(self):
        return {
            "id": self.id,
            "name": self.name,
            "zipCode": self.zip_code,
        }
    
class Pastry(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    bakery_id = db.Column(db.Integer, db.ForeignKey('bakery.id'), nullable=False)
    name = db.Column(db.String(80), unique=False, nullable=False)
    
    def to_json(self):
        return {
            "id": self.id,
            "bakeryId": self.bakery_id,
            "name": self.name,
        }

class BakeryReview(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    review = db.Column(db.String(500), nullable=False)
    overallRating = db.Column(db.Integer, nullable=False)  # 1-5 rating scale
    serviceRating = db.Column(db.Integer, nullable=False)  # 1-5 rating scale
    priceRating = db.Column(db.Integer, nullable=False)  # 1-5 rating scale
    atmosphereRating = db.Column(db.Integer, nullable=False)  # 1-5 rating scale
    locationRating = db.Column(db.Integer, nullable=False)  # 1-5 rating scale
    contact_id = db.Column(db.Integer, db.ForeignKey('contact.id'), nullable=False)  # Foreign key
    contact = db.relationship('Contact', backref='bakeryreviews')  # Relationship

    bakery_id = db.Column(db.Integer, db.ForeignKey('bakery.id'), nullable=False)  # Foreign key
    bakery = db.relationship('Bakery', backref='bakeryreviews')  # Relationship

    def to_json(self):
        return {
            "id": self.id,
            "review": self.review,
            "overallRating": self.overallRating,
            "serviceRating": self.serviceRating,
            "priceRating": self.priceRating,
            "atmosphereRating": self.atmosphereRating,
            "locationRating": self.locationRating,
            "contact_id": self.contact_id,
            "contact_name": f"{self.contact.first_name} {self.contact.last_name}",
            "bakery_id": self.bakery.id,
            "bakery_name": self.bakery.name,
        }
    
class PastryReview(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    review = db.Column(db.String(500), nullable=False)
    overallRating = db.Column(db.Integer, nullable=False)  # 1-5 rating scale
    tasteRating = db.Column(db.Integer, nullable=False)  # 1-5 rating scale
    priceRating = db.Column(db.Integer, nullable=False)  # 1-5 rating scale
    presentationRating = db.Column(db.Integer, nullable=False)  # 1-5 rating scale
    contact_id = db.Column(db.Integer, db.ForeignKey('contact.id'), nullable=False)  # Foreign key
    contact = db.relationship('Contact', backref='pastryreviews')  # Relationship

    pastry_id = db.Column(db.Integer, db.ForeignKey('pastry.id'), nullable=False)  # Foreign key
    pastry = db.relationship('Pastry', backref='pastryreviews')  # Relationship

    def to_json(self):
        return {
            "id": self.id,
            "review": self.review,
            "overallRating": self.overallRating,
            "tasteRating": self.tasteRating,
            "priceRating": self.priceRating,
            "presentationRating": self.presentationRating,
            "contact_id": self.contact_id,
            "contact_name": f"{self.contact.first_name} {self.contact.last_name}",
            "pastry_id": self.pastry.id,
            "pastry_name": self.pastry.name,
        }
