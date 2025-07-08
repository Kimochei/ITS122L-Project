import os
import psycopg2
import sys

# --- Standalone Pooler Connection Test ---

print("--- Testing Session Pooler Connection ---")

# Ensure the script can find the dotenv library
try:
    from dotenv import load_dotenv
except ImportError:
    print("\n❌ CRITICAL FAILURE: The 'python-dotenv' library is not installed.")
    print("   Please run: pip install python-dotenv")
    sys.exit()

# Load environment variables from your .env file
load_dotenv()
db_url = os.getenv("DATABASE_URL")

if not db_url:
    print("\n❌ FAILURE: Could not find DATABASE_URL in your .env file.")
    print("   Please ensure the .env file is in the same directory.")
else:
    print(f"\nFound DATABASE_URL. Attempting to connect...")
    # Print the URL but hide the password for security
    # This helps verify you are using the POOLER url
    # It should start with "postgresql://postgres.nhneeuabudgopsykujyd..."
    print(f"URL Host: {db_url.split('@')[-1]}")

    try:
        # Try to establish a connection
        conn = psycopg2.connect(db_url)
        print("\n✅✅✅ SUCCESS! ✅✅✅")
        print("Database connection via the pooler was successful.")
        conn.close()
    except Exception as e:
        print("\n❌ FAILURE: Could not connect to the database using the pooler URL.")
        print("\n--- ERROR DETAILS ---")
        print(f"Error Type: {type(e).__name__}")
        print(f"Error Message: {e}")
        print("-----------------------")
        print("\nNext Steps: Please double-check every part of your DATABASE_URL in the .env file, especially the password.")