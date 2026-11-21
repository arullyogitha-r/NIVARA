from flask import Blueprint, jsonify
from datetime import datetime, timezone
from app.utils.db import test_connection

# Blueprint for health check and general API status
health_bp = Blueprint("health", __name__)

@health_bp.route("/health", methods=["GET"])
def health_check():
    """
    Health check endpoint to verify backend server status and MongoDB Atlas connection.
    Accessible at: GET /api/health
    """
    db_result = test_connection()
    is_db_connected = db_result.get("connected", False)

    response_payload = {
        "status": "healthy" if is_db_connected else "degraded",
        "service": "NIVARA Civic Complaint & Resolution Platform API",
        "message": "Backend server is running successfully",
        "database": {
            "status": "connected" if is_db_connected else "disconnected",
            "name": db_result.get("database", "nivara")
        },
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

    # Include latency when connected
    if db_result.get("latency_ms") is not None:
        response_payload["database"]["latency_ms"] = db_result.get("latency_ms")

    # Include sanitized error message when disconnected (no credentials)
    if not is_db_connected:
        response_payload["database"]["details"] = db_result.get("error", "Database connection unavailable")

    return jsonify(response_payload), 200

@health_bp.route("/", methods=["GET"])
def api_root():
    """
    API base route.
    Accessible at: GET /api
    """
    return jsonify({
        "platform": "NIVARA — Civic Complaint & Resolution Platform",
        "tagline": "Your City. Your Voice. Our Action.",
        "version": "1.0.0",
        "endpoints": {
            "health": "/api/health"
        }
    }), 200
