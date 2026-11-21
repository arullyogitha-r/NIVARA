import { API_BASE_URL } from '../config/apiConfig';

/**
 * Safely extracts YYYY-MM-DD date string from various date formats or returns fallback.
 */
function safeDate(val) {
  if (!val) return new Date().toISOString().split('T')[0];
  const str = String(val);
  return str.includes('T') ? str.split('T')[0] : str.slice(0, 10);
}

/**
 * Safely formats date-time string without crashing on null/undefined.
 */
function safeDateTime(val, fallback) {
  if (!val) return fallback || new Date().toISOString().replace('T', ' ').slice(0, 16);
  const str = String(val);
  return str.replace('T', ' ').slice(0, 16);
}

/**
 * Normalizes backend complaint documents to ensure seamless compatibility
 * with all React UI components. Handles missing fields safely.
 */
export function normalizeComplaint(doc) {
  if (!doc || typeof doc !== 'object') return null;
  const id = doc.complaint_id || doc.id || (doc._id ? String(doc._id) : 'NVR-UNKNOWN');
  const date = safeDate(doc.created_at || doc.date);

  // Construct realistic timeline from creation and update metadata
  const timeline = Array.isArray(doc.timeline) && doc.timeline.length > 0
    ? doc.timeline
    : [
        {
          status: "Submitted",
          date: safeDateTime(doc.created_at, date),
          note: "Complaint lodged into NIVARA system"
        }
      ];

  if ((!doc.timeline || doc.timeline.length <= 1) && doc.status && doc.status !== "Submitted") {
    timeline.push({
      status: doc.status,
      date: safeDateTime(doc.updated_at, date),
      note: doc.resolution_note || `Status transitioned to ${doc.status} by municipal ward authority`
    });
  }

  return {
    ...doc,
    id,
    complaint_id: id,
    title: doc.title || 'Untitled Complaint',
    category: doc.category || 'General',
    status: doc.status || 'Submitted',
    priority: doc.priority || 'Medium',
    location: doc.location || 'Unspecified Location',
    description: doc.description || '',
    date,
    votes: typeof doc.votes === 'number' ? doc.votes : 0,
    reportedBy: doc.reportedBy || 'Citizen',
    timeline
  };
}

export const api = {
  /**
   * Fetch all complaints from the Flask backend.
   * GET /api/complaints
   */
  async getComplaints(params = {}) {
    const query = new URLSearchParams();
    if (params.status && params.status !== 'ALL') query.append('status', params.status);
    if (params.category && params.category !== 'ALL') query.append('category', params.category);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    const url = `${API_BASE_URL}/complaints${queryString}`;

    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || `Failed to fetch complaints (HTTP ${res.status})`);
      }

      const data = await res.json();
      let rawList = [];
      if (Array.isArray(data.complaints)) {
        rawList = data.complaints;
      } else if (Array.isArray(data)) {
        rawList = data;
      } else if (data && data.complaint) {
        rawList = [data.complaint];
      }

      return rawList.map(normalizeComplaint).filter(Boolean);
    } catch (err) {
      console.error(`[NIVARA API] GET ${url} error:`, err);
      throw err;
    }
  },

  /**
   * Fetch a single complaint by complaint_id or ObjectId.
   * GET /api/complaints/<id>
   */
  async getComplaintById(complaintId) {
    const url = `${API_BASE_URL}/complaints/${encodeURIComponent(complaintId)}`;
    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || `Failed to fetch complaint details (HTTP ${res.status})`);
      }

      const data = await res.json();
      return normalizeComplaint(data.complaint || data);
    } catch (err) {
      console.error(`[NIVARA API] GET ${url} error:`, err);
      throw err;
    }
  },

  /**
   * Create a new complaint.
   * POST /api/complaints
   */
  async createComplaint(payload) {
    const url = `${API_BASE_URL}/complaints`;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || `Failed to register complaint (HTTP ${res.status})`);
      }

      const data = await res.json();
      return normalizeComplaint(data.complaint || data);
    } catch (err) {
      console.error(`[NIVARA API] POST ${url} error:`, err);
      throw err;
    }
  },

  /**
   * Update the status of a complaint.
   * PATCH /api/complaints/<id>/status
   */
  async updateComplaintStatus(complaintId, status, resolutionNote = '') {
    const url = `${API_BASE_URL}/complaints/${encodeURIComponent(complaintId)}/status`;
    try {
      const res = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          status,
          resolution_note: resolutionNote
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || `Failed to update status (HTTP ${res.status})`);
      }

      const data = await res.json();
      return normalizeComplaint(data.complaint || data);
    } catch (err) {
      console.error(`[NIVARA API] PATCH ${url} error:`, err);
      throw err;
    }
  },

  /**
   * Health check endpoint to verify backend status.
   * GET /api/health
   */
  async checkHealth() {
    const url = `${API_BASE_URL}/health`;
    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      return res.json();
    } catch (err) {
      console.error(`[NIVARA API] GET ${url} error:`, err);
      throw err;
    }
  }
};
