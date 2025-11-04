// services/hrAuditService.js
const HR_AUDIT_API_BASE_URL = 'http://bwc-97.brainwaveconsulting.co.in:8088/api/hr/approvals';

export const hrAuditService = {
  async getAuditTrail(filters = {}) {
    try {
      console.log('📋 Fetching HR audit trail with filters:', filters);
      
      // Build URL with query parameters
      const queryParams = new URLSearchParams();
      
      // Add filters as query parameters
      Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
          queryParams.append(key, filters[key]);
        }
      });
      
      const queryString = queryParams.toString();
      const url = `${HR_AUDIT_API_BASE_URL}/history${queryString ? `?${queryString}` : ''}`;

      console.log('🔗 Making HR API call to:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      console.log('📊 HR Audit API Response status:', response.status);

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
      console.log('✅ HR Audit trail fetched successfully:', data);
      
      return data.data || data;
      
    } catch (error) {
      console.error('❌ Error fetching HR audit trail:', error);
      
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        throw new Error('Cannot connect to HR audit service. Please check your connection.');
      }
      
      throw error;
    }
  }
};

export default hrAuditService;