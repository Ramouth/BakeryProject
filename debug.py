import os
import sqlite3
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Print current working directory and relevant environment variables
print(f"Current directory: {os.getcwd()}")
print(f"FLASK_APP: {os.environ.get('FLASK_APP')}")
print(f"FLASK_ENV: {os.environ.get('FLASK_ENV')}")
print(f"DATABASE_URL: {os.environ.get('DATABASE_URL')}")

# Define database path
db_path = os.path.join("instance", "new_bakery_reviews.db")
abs_path = os.path.abspath(db_path)
print(f"Relative path: {db_path}")
print(f"Absolute path: {abs_path}")

# Test direct SQLite connection
try:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    # Create a test table
    cursor.execute("CREATE TABLE IF NOT EXISTS test (id INTEGER PRIMARY KEY, name TEXT)")
    cursor.execute("INSERT INTO test (name) VALUES ('test')")
    conn.commit()
    print("Database connection and write successful!")
    conn.close()
except Exception as e:
    print(f"Database connection error: {e}")