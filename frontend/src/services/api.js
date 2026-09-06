/**
 * API Client Service for National Medicine Supply Chain Portal
 * Interacts with FastAPI backend endpoints:
 * - POST /api/v1/documents/upload
 * - POST /api/v1/documents/verify
 * - GET  /api/v1/audit/facility/{facility_id}
 * - GET  /api/v1/audit/facility/{facility_id}/medicine/{medicine}
 */

const API_BASE = '';

/**
 * Upload stock register image file for Gemini OCR processing
 * @param {File} file - Image file object (.jpg, .png, etc)
 * @returns {Promise<{message: string, filename: string, extracted_data: object}>}
 */
export async function uploadDocument(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE}/api/v1/documents/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Upload failed (${response.status}): ${errorText}`);
  }

  return response.json();
}

/**
 * Submit HITL-verified document to commit events to ledger
 * @param {object} documentData - ExtractedDocument object structure
 * @returns {Promise<{message: string, details: {status: string, events_created: number}}>}
 */
export async function verifyDocument(documentData) {
  const response = await fetch(`${API_BASE}/api/v1/documents/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(documentData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Verification commit failed (${response.status}): ${errorText}`);
  }

  return response.json();
}

/**
 * Fetch operational audit history for a health facility
 * @param {string} facilityId - Facility code e.g. "PHC-042"
 * @returns {Promise<{facility_id: string, total_events: number, events: Array}>}
 */
export async function getFacilityAudit(facilityId) {
  const response = await fetch(`${API_BASE}/api/v1/audit/facility/${encodeURIComponent(facilityId)}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch facility audit (${response.status}): ${errorText}`);
  }

  return response.json();
}

/**
 * Fetch traceability events for a specific medicine at a facility
 * @param {string} facilityId - Facility code e.g. "PHC-042"
 * @param {string} medicine - Medicine name e.g. "Paracetamol 500mg"
 * @returns {Promise<{facility_id: string, medicine: string, events: Array}>}
 */
export async function getMedicineAudit(facilityId, medicine) {
  const response = await fetch(
    `${API_BASE}/api/v1/audit/facility/${encodeURIComponent(facilityId)}/medicine/${encodeURIComponent(medicine)}`,
    {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch medicine audit (${response.status}): ${errorText}`);
  }

  return response.json();
}

/**
 * Simple ping check for backend API availability
 * @returns {Promise<boolean>}
 */
export async function checkApiHealth() {
  try {
    const res = await fetch(`${API_BASE}/api/v1/audit/facility/PING_CHECK`, { method: 'GET' });
    // Any HTTP response (even 200 with empty events) means backend is online
    return res.status < 500;
  } catch (e) {
    return false;
  }
}
