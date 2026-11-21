"""
Automated Test Script for NIVARA Complaints API.
Tests all endpoints: Health Check, Create Complaint, List Complaints,
Get Single Complaint, Update Status, and Validation Rules.

Usage:
    python test_api.py
"""

import sys
import json
import urllib.request
import urllib.error

BASE_URL = "http://localhost:5000/api"

def make_request(method, endpoint, data=None):
    """Helper function to make HTTP requests using standard urllib."""
    url = f"{BASE_URL}{endpoint}"
    req_data = None
    headers = {"Content-Type": "application/json"} if data else {}

    if data:
        req_data = json.dumps(data).encode("utf-8")

    req = urllib.request.Request(url, data=req_data, headers=headers, method=method)

    try:
        with urllib.request.urlopen(req, timeout=5) as response:
            status_code = response.getcode()
            body = response.read().decode("utf-8")
            return status_code, json.loads(body)
    except urllib.error.HTTPError as e:
        status_code = e.code
        body = e.read().decode("utf-8")
        try:
            return status_code, json.loads(body)
        except Exception:
            return status_code, {"raw": body}
    except Exception as e:
        return None, {"error": str(e)}


def run_tests():
    print("\n=======================================================")
    print(" NIVARA Complaints API - Automated Test Suite")
    print(f" Target: {BASE_URL}")
    print("=======================================================\n")

    # 1. Test Health Check
    print("▶ 1. Testing GET /health ...")
    status, res = make_request("GET", "/health")
    if status == 200:
        db_status = res.get("database", {}).get("status", "unknown")
        print(f"   ✓ PASS - Server running! Database status: {db_status}")
    else:
        print(f"   ✗ FAIL - Status: {status}, Response: {res}")
        print("   Make sure the Flask server is running on http://localhost:5000 (python run.py)")
        sys.exit(1)

    # 2. Test Create Complaint (POST /complaints)
    print("\n▶ 2. Testing POST /complaints (Create new complaint) ...")
    sample_complaint = {
        "title": "Severe pothole causing traffic slowdown near Metro Pillar 42",
        "category": "Roads & Infrastructure",
        "description": "Deep asphalt crater on 80ft road right lane. Bikers frequently slipping.",
        "location": "80ft Road, Indiranagar, Ward 112",
        "priority": "High"
    }
    status, res = make_request("POST", "/complaints", sample_complaint)
    created_id = None
    if status == 201 and "complaint" in res:
        created_id = res["complaint"].get("complaint_id")
        print(f"   ✓ PASS - Created complaint successfully! ID: {created_id}")
        print(f"     Status: {res['complaint'].get('status')}")
        print(f"     Created at: {res['complaint'].get('created_at')}")
    else:
        print(f"   ✗ FAIL - Status: {status}, Response: {res}")

    # 3. Test List Complaints (GET /complaints)
    print("\n▶ 3. Testing GET /complaints (List complaints) ...")
    status, res = make_request("GET", "/complaints")
    if status == 200 and "complaints" in res:
        count = res.get("count", len(res["complaints"]))
        print(f"   ✓ PASS - Retrieved {count} complaint(s).")
    else:
        print(f"   ✗ FAIL - Status: {status}, Response: {res}")

    # 4. Test Get Single Complaint (GET /complaints/<id>)
    if created_id:
        print(f"\n▶ 4. Testing GET /complaints/{created_id} (Retrieve by ID) ...")
        status, res = make_request("GET", f"/complaints/{created_id}")
        if status == 200 and res.get("complaint", {}).get("complaint_id") == created_id:
            print(f"   ✓ PASS - Successfully retrieved {created_id}.")
        else:
            print(f"   ✗ FAIL - Status: {status}, Response: {res}")

    # 5. Test Update Status (PATCH /complaints/<id>/status)
    if created_id:
        print(f"\n▶ 5. Testing PATCH /complaints/{created_id}/status ...")
        patch_data = {
            "status": "In Progress",
            "resolution_note": "Ward road maintenance team dispatched with asphalt equipment."
        }
        status, res = make_request("PATCH", f"/complaints/{created_id}/status", patch_data)
        if status == 200:
            updated_status = res.get("complaint", {}).get("status")
            updated_note = res.get("complaint", {}).get("resolution_note")
            print(f"   ✓ PASS - Status updated to '{updated_status}'.")
            print(f"     Note: {updated_note}")
        else:
            print(f"   ✗ FAIL - Status: {status}, Response: {res}")

    # 6. Test Validation - Missing Required Field
    print("\n▶ 6. Testing Validation: Missing Required Field ...")
    bad_data = {
        "title": "Missing category and description"
    }
    status, res = make_request("POST", "/complaints", bad_data)
    if status == 400:
        print(f"   ✓ PASS - Rejected with 400 as expected: {res.get('message')}")
    else:
        print(f"   ✗ FAIL - Expected 400, got {status}: {res}")

    # 7. Test Validation - Invalid Status
    if created_id:
        print("\n▶ 7. Testing Validation: Invalid Status ...")
        invalid_status_data = {"status": "NonExistentStatus"}
        status, res = make_request("PATCH", f"/complaints/{created_id}/status", invalid_status_data)
        if status == 400:
            print(f"   ✓ PASS - Rejected invalid status with 400: {res.get('message')}")
        else:
            print(f"   ✗ FAIL - Expected 400, got {status}: {res}")

    # 8. Test 404 Not Found
    print("\n▶ 8. Testing 404: Non-existent ID ...")
    status, res = make_request("GET", "/complaints/NVR-0000-NONEXISTENT")
    if status == 404:
        print(f"   ✓ PASS - Returned 404 Not Found as expected: {res.get('message')}")
    else:
        print(f"   ✗ FAIL - Expected 404, got {status}: {res}")

    print("\n=======================================================")
    print(" All API Tests Completed Successfully!")
    print("=======================================================\n")


if __name__ == "__main__":
    run_tests()
