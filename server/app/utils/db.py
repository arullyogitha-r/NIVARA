"""
MongoDB Database Connection Utility for NIVARA.
Provides reusable connection pooling, database access, and ping verification.
"""

import os
import time
import logging
import urllib.parse
from pymongo import MongoClient
from pymongo.errors import PyMongoError, ServerSelectionTimeoutError, OperationFailure, ConfigurationError

logger = logging.getLogger("nivara.db")

# Singleton client and database instances
_mongo_client = None
_db = None


def get_mongo_uri():
    """Retrieve MongoDB URI from environment variables."""
    return os.getenv("MONGODB_URI") or os.getenv("MONGO_URI")


def get_db_name():
    """Retrieve target database name (default: 'nivara')."""
    return os.getenv("DB_NAME", "nivara")


def normalize_mongo_uri(uri):
    """
    Safely normalizes MongoDB URI by URL-encoding special characters (like '@' in password)
    that would otherwise cause PyMongo ConfigurationError.
    """
    if not uri:
        return uri

    prefix = ""
    rest = uri.strip()

    if rest.startswith("mongodb+srv://"):
        prefix = "mongodb+srv://"
        rest = rest[len(prefix):]
    elif rest.startswith("mongodb://"):
        prefix = "mongodb://"
        rest = rest[len(prefix):]
    else:
        return uri

    # Separate authority (user:pass@host) from path/options
    if "/" in rest:
        authority, remainder = rest.split("/", 1)
        remainder = "/" + remainder
    else:
        authority = rest
        remainder = ""

    # Check if credentials exist before the host
    if "@" in authority:
        last_at_index = authority.rfind("@")
        userinfo = authority[:last_at_index]
        host = authority[last_at_index + 1:]

        if ":" in userinfo:
            first_colon = userinfo.find(":")
            username = userinfo[:first_colon]
            password = userinfo[first_colon + 1:]

            # Unquote first to prevent double-encoding, then safely encode
            clean_user = urllib.parse.quote_plus(urllib.parse.unquote_plus(username))
            clean_pass = urllib.parse.quote_plus(urllib.parse.unquote_plus(password))
            authority = f"{clean_user}:{clean_pass}@{host}"

    # Fix case where options are preceded by '/' instead of '/?' or '/dbname?'
    if remainder.startswith("/retryWrites=") or remainder.startswith("/w="):
        remainder = "/?" + remainder[1:]

    return f"{prefix}{authority}{remainder}"


def get_mongo_client():
    """
    Returns the MongoClient instance, initializing it if not already connected.
    Reuses the connection pool across the application lifecycle.
    """
    global _mongo_client

    if _mongo_client is not None:
        return _mongo_client

    raw_uri = get_mongo_uri()
    if not raw_uri:
        raise ValueError(
            "MONGODB_URI is not set in environment variables. "
            "Please configure MONGODB_URI in server/.env."
        )

    uri = normalize_mongo_uri(raw_uri)

    # Initialize PyMongo client with 5 second timeout to prevent blocking
    _mongo_client = MongoClient(
        uri,
        serverSelectionTimeoutMS=5000,
        connectTimeoutMS=5000,
        socketTimeoutMS=5000,
        appname="NIVARA-Backend"
    )
    return _mongo_client


def get_db(database_name=None):
    """
    Returns the database instance (default: 'nivara').
    """
    global _db
    target_name = database_name or get_db_name()

    if _db is not None and _db.name == target_name:
        return _db

    client = get_mongo_client()
    _db = client.get_database(target_name)
    return _db


def sanitize_error(error_msg):
    """
    Sanitizes database error messages to ensure credentials are never leaked.
    """
    err_str = str(error_msg)
    if "mongodb+srv://" in err_str or "mongodb://" in err_str:
        return "Database connection error (credentials redacted)."
    if "bad auth" in err_str.lower() or "authentication failed" in err_str.lower():
        return "Authentication failed: verify MongoDB Atlas username and password in server/.env."
    if "timed out" in err_str.lower() or "serverselectiontimeouterror" in err_str.lower():
        return "Connection timed out. Check Atlas Network Access IP whitelist (allow current IP or 0.0.0.0/0)."
    return err_str.split("\n")[0]


def test_connection():
    """
    Tests MongoDB Atlas connection using the ping command.
    Returns status, latency in ms, and sanitized messages without exposing credentials.
    """
    db_name = get_db_name()
    raw_uri = get_mongo_uri()

    if not raw_uri:
        return {
            "connected": False,
            "database": db_name,
            "error": "MONGODB_URI is missing from server/.env",
            "latency_ms": None
        }

    try:
        start_time = time.time()
        client = get_mongo_client()
        # Verify connection with MongoDB ping command
        client.admin.command("ping")
        latency_ms = round((time.time() - start_time) * 1000, 2)

        return {
            "connected": True,
            "database": db_name,
            "message": "Connected to MongoDB Atlas successfully",
            "latency_ms": latency_ms
        }
    except ServerSelectionTimeoutError as e:
        logger.error("MongoDB Atlas connection timed out: %s", sanitize_error(e))
        return {
            "connected": False,
            "database": db_name,
            "error": "Connection timed out. Check Network Access IP whitelist in MongoDB Atlas.",
            "latency_ms": None
        }
    except OperationFailure as e:
        logger.error("MongoDB Atlas authentication failure: %s", sanitize_error(e))
        return {
            "connected": False,
            "database": db_name,
            "error": "Authentication failed: verify MongoDB Atlas username and password.",
            "latency_ms": None
        }
    except ConfigurationError as e:
        logger.error("MongoDB URI configuration error: %s", sanitize_error(e))
        return {
            "connected": False,
            "database": db_name,
            "error": "Invalid MongoDB connection URI format.",
            "latency_ms": None
        }
    except PyMongoError as e:
        logger.error("PyMongo error: %s", sanitize_error(e))
        return {
            "connected": False,
            "database": db_name,
            "error": sanitize_error(e),
            "latency_ms": None
        }
    except Exception as e:
        logger.error("Unexpected error connecting to MongoDB: %s", sanitize_error(e))
        return {
            "connected": False,
            "database": db_name,
            "error": sanitize_error(e),
            "latency_ms": None
        }


def close_mongo_connection():
    """Closes the active MongoClient connection cleanly."""
    global _mongo_client, _db
    if _mongo_client is not None:
        _mongo_client.close()
        _mongo_client = None
        _db = None
