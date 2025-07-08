import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./database/sKonnectDB.db")

SECRET_KEY = os.getenv("SECRET_KEY", "a_very_secret_key_that_should_be_changed")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
