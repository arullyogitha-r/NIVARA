"""
Complaints API Routes for NIVARA Civic Complaint & Resolution Platform.
Provides endpoints for creating, retrieving, and updating civic complaints stored in MongoDB Atlas.
"""

import secrets
from datetime import datetime, timezone
from flask import Blueprint, request, jsonify
from bson import ObjectId
from bson.errors import InvalidId
from pymongo import ReturnDocument
from pymongo.errors import PyMongoError
from app.utils.db import get_db, sanitize_error

# Create Flask Blueprint for complaints
complaint_bp = Blueprint("complaints", __name__)

# Allowed status transitions
ALLOWED_STATUSES = [
    "Submitted",
    "Assigned",
    "In Progress",
    "Resolved",
    "Rejected"
]

# Allowed priorities
ALLOWED_PRIORITIES = [
    "Low",
    "Medium",
    "High",
    "Urgent"
]


def get_complaints_collection():
    """Returns the MongoDB complaints collection."""
    db = get_db()
    return db["complaints"]


def serialize_complaint(doc):
    """
    Serializes a MongoDB document into a JSON-compatible dictionary.
    Converts ObjectId into string and guarantees uniform structure.
    """
    if not doc:
        return None
    data = dict(doc)
    if "_id" in data:
        data["_id"] = str(data["_id"])
    return data


def generate_complaint_id(collection):
    """
    Generates a unique business complaint ID in format NVR-YYYY-XXXX.
    Ensures collision avoidance by checking against the database.
    """
    year = datetime.now(timezone.utc).year
    for _ in range(10):
        suffix = secrets.randbelow(9000) + 1000  # 1000 - 9999
        candidate_id = f"NVR-{year}-{suffix}"
        if not collection.find_one({"complaint_id": candidate_id}):
            return candidate_id
    # Fallback to high-resolution timestamp if attempts collide
    return f"NVR-{year}-{int(datetime.now(timezone.utc).timestamp()) % 100000}"


# =====================================================================
# 1. POST /api/complaints - Create a new complaint
# =====================================================================
@complaint_bp.route("", methods=["POST"])
@complaint_bp.route("/", methods=["POST"])
def create_complaint():
    """
    Creates a new civic complaint and saves it to MongoDB Atlas.
    Requires: title, category, description, location.
    Auto-generates: complaint_id, status (Submitted), created_at, updated_at.
    """
    data = request.get_json(silent=True)
    if not data or not isinstance(data, dict):
        return jsonify({
            "error": "Validation Error",
            "message": "Request body must be a valid JSON object"
        }), 400

    # Validate required fields
    required_fields = ["title", "category", "description", "location"]
    for field in required_fields:
        val = data.get(field)
        if not val or not isinstance(val, str) or not val.strip():
            return jsonify({
                "error": "Validation Error",
                "message": f"Field '{field}' is required and cannot be empty"
            }), 400

    # Normalize priority
    raw_priority = data.get("priority", "Medium")
    priority = "Medium"
    if isinstance(raw_priority, str):
        matched_priority = next(
            (p for p in ALLOWED_PRIORITIES if p.lower() == raw_priority.strip().lower()),
            None
        )
        if matched_priority:
            priority = matched_priority

    now_iso = datetime.now(timezone.utc).isoformat()

    try:
        complaints_col = get_complaints_collection()
        complaint_id = generate_complaint_id(complaints_col)

        new_doc = {
            "complaint_id": complaint_id,
            "title": data["title"].strip(),
            "category": data["category"].strip(),
            "description": data["description"].strip(),
            "location": data["location"].strip(),
            "status": "Submitted",
            "priority": priority,
            "created_at": now_iso,
            "updated_at": now_iso,
            "resolution_note": data.get("resolution_note") or None
        }

        insert_result = complaints_col.insert_one(new_doc)
        new_doc["_id"] = str(insert_result.inserted_id)

        return jsonify({
            "message": "Complaint registered successfully",
            "complaint": new_doc
        }), 201

    except PyMongoError as e:
        return jsonify({
            "error": "Database Error",
            "message": sanitize_error(e)
        }), 500


# =====================================================================
# 2. GET /api/complaints - Retrieve all complaints (newest first)
# =====================================================================
@complaint_bp.route("", methods=["GET"])
@complaint_bp.route("/", methods=["GET"])
def get_complaints():
    """
    Retrieves all complaints from MongoDB sorted with newest first.
    Supports optional filters via query params: status, category.
    """
    query = {}

    status_filter = request.args.get("status")
    if status_filter and status_filter.strip():
        query["status"] = status_filter.strip()

    category_filter = request.args.get("category")
    if category_filter and category_filter.strip():
        query["category"] = category_filter.strip()

    try:
        complaints_col = get_complaints_collection()
        # Sort by created_at descending (-1)
        cursor = complaints_col.find(query).sort("created_at", -1)
        complaints_list = [serialize_complaint(doc) for doc in cursor]

        return jsonify({
            "success": True,
            "count": len(complaints_list),
            "complaints": complaints_list
        }), 200

    except PyMongoError as e:
        return jsonify({
            "error": "Database Error",
            "message": sanitize_error(e)
        }), 500


# =====================================================================
# 3. GET /api/complaints/<id> - Retrieve single complaint
# =====================================================================
@complaint_bp.route("/<complaint_id>", methods=["GET"])
def get_complaint_by_id(complaint_id):
    """
    Retrieves a specific complaint by complaint_id (e.g. NVR-2026-8421)
    or by MongoDB _id ObjectId string.
    """
    complaint_id = complaint_id.strip()

    try:
        complaints_col = get_complaints_collection()

        # Primary lookup by business complaint_id
        doc = complaints_col.find_one({"complaint_id": complaint_id})

        # Secondary lookup by MongoDB ObjectId if not found
        if not doc and ObjectId.is_valid(complaint_id):
            try:
                doc = complaints_col.find_one({"_id": ObjectId(complaint_id)})
            except (InvalidId, TypeError):
                pass

        if not doc:
            return jsonify({
                "error": "Not Found",
                "message": f"Complaint with ID '{complaint_id}' was not found"
            }), 404

        return jsonify({
            "success": True,
            "complaint": serialize_complaint(doc)
        }), 200

    except PyMongoError as e:
        return jsonify({
            "error": "Database Error",
            "message": sanitize_error(e)
        }), 500


# =====================================================================
# 4. PATCH /api/complaints/<id>/status - Update complaint status
# =====================================================================
@complaint_bp.route("/<complaint_id>/status", methods=["PATCH"])
def update_complaint_status(complaint_id):
    """
    Updates status and optional resolution_note of a complaint.
    Allowed statuses: Submitted, Assigned, In Progress, Resolved, Rejected.
    Updates the updated_at timestamp.
    """
    complaint_id = complaint_id.strip()

    data = request.get_json(silent=True)
    if not data or not isinstance(data, dict):
        return jsonify({
            "error": "Validation Error",
            "message": "Request body must be a valid JSON object"
        }), 400

    new_status = data.get("status")
    if not new_status or not isinstance(new_status, str) or not new_status.strip():
        return jsonify({
            "error": "Validation Error",
            "message": f"Field 'status' is required. Allowed values: {', '.join(ALLOWED_STATUSES)}"
        }), 400

    # Match allowed status case-insensitively
    matched_status = next(
        (s for s in ALLOWED_STATUSES if s.lower() == new_status.strip().lower()),
        None
    )
    if not matched_status:
        return jsonify({
            "error": "Validation Error",
            "message": f"Invalid status '{new_status}'. Allowed values: {', '.join(ALLOWED_STATUSES)}"
        }), 400

    now_iso = datetime.now(timezone.utc).isoformat()
    update_fields = {
        "status": matched_status,
        "updated_at": now_iso
    }

    # Optional resolution note
    if "resolution_note" in data:
        note_val = data["resolution_note"]
        update_fields["resolution_note"] = note_val.strip() if isinstance(note_val, str) else None

    try:
        complaints_col = get_complaints_collection()

        # Build query for complaint_id or ObjectId
        query = {"complaint_id": complaint_id}
        if ObjectId.is_valid(complaint_id):
            query = {"$or": [{"complaint_id": complaint_id}, {"_id": ObjectId(complaint_id)}]}

        updated_doc = complaints_col.find_one_and_update(
            query,
            {"$set": update_fields},
            return_document=ReturnDocument.AFTER
        )

        if not updated_doc:
            return jsonify({
                "error": "Not Found",
                "message": f"Complaint with ID '{complaint_id}' was not found"
            }), 404

        return jsonify({
            "message": "Complaint status updated successfully",
            "complaint": serialize_complaint(updated_doc)
        }), 200

    except PyMongoError as e:
        return jsonify({
            "error": "Database Error",
            "message": sanitize_error(e)
        }), 500
