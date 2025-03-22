from flask_marshmallow import Marshmallow

# Create Marshmallow instance
ma = Marshmallow()

# Note: Don't import schemas here to avoid circular imports
# They will be imported by modules that need them