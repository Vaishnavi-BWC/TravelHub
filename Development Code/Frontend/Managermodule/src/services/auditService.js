// services/auditService.js
const API_BASE_URL = 'http://bwc-97.brainwaveconsulting.co.in:8090/travel-management/api';

export const auditService = {
  async getAuditTrail(filters = {}) {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('jwtToken');
      const queryParams = new URLSearchParams(filters).toString();
      const url = `${API_BASE_URL}/audit-logs${queryParams ? `?${queryParams}` : ''}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error('Error fetching audit trail:', error);
      throw error;
    }
  },

  async logAction(auditData) {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('jwtToken');
      const response = await fetch(`${API_BASE_URL}/audit-logs`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(auditData),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error('Error logging audit action:', error);
      throw error;
    }
  }
};
