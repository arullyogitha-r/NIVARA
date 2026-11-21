import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    """Application configuration loaded from environment variables."""
    SECRET_KEY = os.getenv("SECRET_KEY", "nivara-dev-secret-key-2024")
    FLASK_ENV = os.getenv("FLASK_ENV", "development")
    DEBUG = os.getenv("FLASK_DEBUG", "True").lower() in ("true", "1", "t")
    PORT = int(os.getenv("PORT", 5000))
    FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

    # MongoDB Atlas Database Configuration
    MONGODB_URI = os.getenv("MONGODB_URI") or os.getenv("MONGO_URI")
    DB_NAME = os.getenv("DB_NAME", "nivara")
