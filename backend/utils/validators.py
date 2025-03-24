import re
from email_validator import validate_email as validate_email_address, EmailNotValidError

def validate_email(email):
    """Validate email format"""
    try:
        # Validate and normalize email
        valid_email = validate_email_address(email, check_deliverability=False)
        return True, valid_email.normalized
    except EmailNotValidError as e:
        return False, str(e)

def validate_zip_code(zip_code):
    """Validate Danish zip code format (4 digits)"""
    if not zip_code:
        return False, "Zip code is required"
    
    pattern = r'^\d{4}$'
    if not re.match(pattern, zip_code):
        return False, "Zip code must be a 4-digit number"
    
    return True, zip_code

def validate_rating(rating, min_value=1, max_value=10):
    """Validate rating value is within range"""
    try:
        rating_val = int(rating)
        if rating_val < min_value or rating_val > max_value:
            return False, f"Rating must be between {min_value} and {max_value}"
        return True, rating_val
    except (ValueError, TypeError):
        return False, "Rating must be a number"

def validate_required_fields(data, required_fields):
    """Validate that all required fields are present in the data"""
    missing_fields = []
    
    for field in required_fields:
        if field not in data or data[field] is None or data[field] == "":
            missing_fields.append(field)
    
    if missing_fields:
        return False, f"Missing required fields: {', '.join(missing_fields)}"
    
    return True, None