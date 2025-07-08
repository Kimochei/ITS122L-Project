import os

# --- .env File Content Checker ---

print("--- Reading .env file contents ---")

# Define the expected path of the .env file
env_file_path = '.env'

try:
    # Open the file and read it line by line
    with open(env_file_path, 'r') as f:
        print(f"\nSuccessfully opened the file at this location:\n{os.path.abspath(env_file_path)}\n")
        print("--- FILE CONTENT START ---")
        for line in f:
            print(line, end='') # Print each line exactly as it appears
        print("\n--- FILE CONTENT END ---")

except FileNotFoundError:
    print("\n❌ CRITICAL FAILURE: Could not find the .env file.")
    print(f"   The script looked for it at: {os.path.abspath(env_file_path)}")
    print("   Please make sure your .env file is in the same folder as this script.")
except Exception as e:
    print(f"\n❌ An unexpected error occurred: {e}")