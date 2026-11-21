import os
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from app.config import Config

# Load environment variables from .env
load_dotenv()

def create_app(config_class=Config):
    """
    Application Factory for NIVARA Flask backend.
    Initializes Flask app, CORS policies, blueprints, and global error handlers.
    """
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Register blueprints first so routes exist in app.url_map before CORS initialization
    from app.routes.health_routes import health_bp
    from app.routes.complaint_routes import complaint_bp

    app.register_blueprint(health_bp, url_prefix="/api")
    app.register_blueprint(complaint_bp, url_prefix="/api/complaints")

    # Allowed origins for frontend clients (supporting both port 5173 and 5174)
    configured_origins = [
        origin.strip()
        for origin in app.config.get("FRONTEND_URL", "").split(",")
        if origin.strip()
    ]
    allowed_origins = list(dict.fromkeys([
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        *configured_origins
    ]))

    # Enable Flask-CORS for all /api/.* routes with explicit methods and headers
    CORS(
        app,
        resources={
            r"/api/.*": {
                "origins": allowed_origins,
                "methods": ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
                "allow_headers": ["Content-Type", "Authorization", "Accept", "Origin", "X-Requested-With"],
                "supports_credentials": True
            }
        },
        supports_credentials=True
    )

    # Global 404 handler
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            "error": "Not Found",
            "message": "The requested API endpoint was not found on this server"
        }), 404

    # Global 500 handler
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({
            "error": "Internal Server Error",
            "message": "An internal server error occurred"
        }), 500

    return app
