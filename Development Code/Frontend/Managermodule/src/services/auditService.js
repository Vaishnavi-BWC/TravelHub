const API_BASE_URL = 'http://bwc-97.brainwaveconsulting.co.in:8088/api/manager/approvals';

export const auditService = {
  async getAuditTrail(filters = {}) {
    try {
      console.log('📋 Fetching audit trail with filters:', filters);

      // Build URL with query parameters
      const queryParams = new URLSearchParams();

      // Add filters as query parameters
      Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
          queryParams.append(key, filters[key]);
        }
      });

      const queryString = queryParams.toString();
      const url = `${API_BASE_URL}/history${queryString ? `?${queryString}` : ''}`;

      console.log('🔗 Making API call to:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      console.log('📊 Audit API Response status:', response.status);

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.text();
          if (errorData) {
            const parsedError = JSON.parse(errorData);
            errorMessage = parsedError.message || errorMessage;
          }
        } catch {
          // Ignore parsing errors
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('✅ Audit trail fetched successfully:', data);

      return data.data || data;

    } catch (error) {
      console.error('❌ Error fetching audit trail:', error);

      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        throw new Error('Cannot connect to audit service. Please check your connection.');
      }

      throw error;
    }
  }
};

export default auditService;