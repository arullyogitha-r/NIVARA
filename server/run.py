"""
NIVARA — Civic Complaint & Resolution Platform
Backend Server Entry Point
"""

import os
from app import create_app
from app.utils.db import test_connection

# Create Flask application instance via the Application Factory
app = create_app()

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    debug = os.getenv("FLASK_DEBUG", "True").lower() in ("true", "1", "t")
    db_name = os.getenv("DB_NAME", "nivara")

    print("\n=======================================================")
    print(f" NIVARA Backend Server starting on port {port}")
    print(f" Health check: http://localhost:{port}/api/health")
    print(" Allowed CORS origins: http://localhost:5173, http://localhost:5174")
    print(f" Target Database: {db_name}")

    # Test MongoDB Atlas connection on startup
    print(" Verifying MongoDB Atlas connection via ping...")
    db_test = test_connection()
    if db_test.get("connected"):
        print(f" ✓ MongoDB Atlas connected ({db_test.get('latency_ms')} ms)")
    else:
        print(f" ⚠ MongoDB Atlas status: {db_test.get('error')}")
    print("=======================================================\n")

    app.run(host="0.0.0.0", port=port, debug=debug)
