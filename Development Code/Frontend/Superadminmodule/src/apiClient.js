// src/utils/apiClient.js
const BASE_URL = "http://192.168.1.203:8081";
 
/**
* Centralized fetch wrapper for all API calls.
* Automatically includes cookies and handles errors globally.
*/
export async function apiRequest(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    credentials: "include", // ✅ sends cookie with each request
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
 
  if (response.status === 401) {
    console.warn("⚠️ Unauthorized. Redirecting to login...");
    window.location.href = "bwc-90.brainwaveconsulting.co.in/login";
    return;
  }
 
  if (response.status === 204) return null;
 
  const data = await response.json().catch(() => ({}));
 
  if (!response.ok) {
    throw new Error(data.message || `HTTP ${response.status}`);
  }
 
  return data;
}