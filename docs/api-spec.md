# API Specification — NIVARA Civic Complaint & Resolution Platform

Base URL: `http://localhost:5000/api`

---

## 1. System & Health (`/api/health`)

### `GET /api/health`
Health check endpoint reporting Flask application state and MongoDB Atlas connection status via ping.

**Response `200 OK` (Healthy):**
```json
{
  "status": "healthy",
  "service": "NIVARA Civic Complaint & Resolution Platform API",
  "message": "Backend server is running successfully",
  "database": {
    "status": "connected",
    "name": "nivara",
    "latency_ms": 42.15
  },
  "timestamp": "2026-11-20T21:15:00.000000Z"
}
```

---

## 2. Complaints API (`/api/complaints`)

### `POST /api/complaints`
Registers a new civic complaint into MongoDB Atlas.

**Request Headers:**
- `Content-Type: application/json`

**Request Body:**
```json
{
  "title": "Severe pothole causing traffic hazard",
  "category": "Roads & Infrastructure",
  "description": "Deep asphalt crater on 80ft road near Metro Pillar 42.",
  "location": "80ft Road, Indiranagar, Ward 112",
  "priority": "High"
}
```
*Note: `title`, `category`, `description`, `location` are required. `priority` defaults to `"Medium"`.*

**Response `201 Created`:**
```json
{
  "message": "Complaint registered successfully",
  "complaint": {
    "_id": "673f1a2b3c4d5e6f7a8b9c0d",
    "complaint_id": "NVR-2026-8421",
    "title": "Severe pothole causing traffic hazard",
    "category": "Roads & Infrastructure",
    "description": "Deep asphalt crater on 80ft road near Metro Pillar 42.",
    "location": "80ft Road, Indiranagar, Ward 112",
    "priority": "High",
    "status": "Submitted",
    "resolution_note": null,
    "created_at": "2026-11-20T21:15:00.000000Z",
    "updated_at": "2026-11-20T21:15:00.000000Z"
  }
}
```

---

### `GET /api/complaints`
Retrieves all civic complaints sorted newest first. Supports optional query filters.

**Query Parameters:**
- `status` (optional): Filter by status (e.g. `Submitted`, `In Progress`, `Resolved`)
- `category` (optional): Filter by category (e.g. `Roads & Infrastructure`)

**Response `200 OK`:**
```json
{
  "success": true,
  "count": 1,
  "complaints": [
    {
      "_id": "673f1a2b3c4d5e6f7a8b9c0d",
      "complaint_id": "NVR-2026-8421",
      "title": "Severe pothole causing traffic hazard",
      "category": "Roads & Infrastructure",
      "description": "Deep asphalt crater on 80ft road near Metro Pillar 42.",
      "location": "80ft Road, Indiranagar, Ward 112",
      "priority": "High",
      "status": "Submitted",
      "resolution_note": null,
      "created_at": "2026-11-20T21:15:00.000000Z",
      "updated_at": "2026-11-20T21:15:00.000000Z"
    }
  ]
}
```

---

### `GET /api/complaints/<id>`
Retrieves a specific complaint by either its business `complaint_id` (e.g. `NVR-2026-8421`) or its MongoDB `_id` (`ObjectId`).

**Response `200 OK`:**
```json
{
  "success": true,
  "complaint": {
    "_id": "673f1a2b3c4d5e6f7a8b9c0d",
    "complaint_id": "NVR-2026-8421",
    "title": "Severe pothole causing traffic hazard",
    "category": "Roads & Infrastructure",
    "description": "Deep asphalt crater on 80ft road near Metro Pillar 42.",
    "location": "80ft Road, Indiranagar, Ward 112",
    "priority": "High",
    "status": "Submitted",
    "resolution_note": null,
    "created_at": "2026-11-20T21:15:00.000000Z",
    "updated_at": "2026-11-20T21:15:00.000000Z"
  }
}
```

**Response `404 Not Found`:**
```json
{
  "error": "Not Found",
  "message": "Complaint with ID 'NVR-2026-9999' was not found"
}
```

---

### `PATCH /api/complaints/<id>/status`
Updates the status of a complaint and optionally records an administrative resolution note.

**Allowed Statuses:** `Submitted`, `Assigned`, `In Progress`, `Resolved`, `Rejected`

**Request Body:**
```json
{
  "status": "In Progress",
  "resolution_note": "Ward road crew #14 dispatched with asphalt repair kit."
}
```

**Response `200 OK`:**
```json
{
  "message": "Complaint status updated successfully",
  "complaint": {
    "_id": "673f1a2b3c4d5e6f7a8b9c0d",
    "complaint_id": "NVR-2026-8421",
    "title": "Severe pothole causing traffic hazard",
    "category": "Roads & Infrastructure",
    "description": "Deep asphalt crater on 80ft road near Metro Pillar 42.",
    "location": "80ft Road, Indiranagar, Ward 112",
    "priority": "High",
    "status": "In Progress",
    "resolution_note": "Ward road crew #14 dispatched with asphalt repair kit.",
    "created_at": "2026-11-20T21:15:00.000000Z",
    "updated_at": "2026-11-20T21:25:00.000000Z"
  }
}
```

**Response `400 Bad Request`:**
```json
{
  "error": "Validation Error",
  "message": "Invalid status 'PendingReview'. Allowed values: Submitted, Assigned, In Progress, Resolved, Rejected"
}
```
