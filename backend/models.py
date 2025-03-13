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
