import { api } from './api';

// Base URL configuration
const SLA_API_BASE_URL = 'http://bwc-97.brainwaveconsulting.co.in:8088/api/admin';

export const SuperAdminService = {
  // SLA Settings API Methods - CORRECTED
  getSlaSettings: async (workflowType = 'PRE_TRAVEL') => {
    try {
      console.log('🔍 Fetching SLA settings for workflow type:', workflowType);
      
      const response = await fetch(`${SLA_API_BASE_URL}/workflow-configs/${workflowType}/settings`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      console.log('📊 SLA API Response status:', response.status);

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
      console.log('✅ SLA settings fetched successfully');
      return data;
      
    } catch (error) {
      console.error('❌ Error fetching SLA settings:', error);
      
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        throw new Error('Cannot connect to SLA service. Please check if the service is running.');
      }
      
      throw error;
    }
  },

  // CORRECTED: Update individual step SLA - use configId (UUID) from step settings
  updateStepSLA: async (configId, slaData) => {
    try {
      console.log('🔍 Updating step SLA:', { configId, slaData });
      
    const response = await fetch(`${SLA_API_BASE_URL}/workflow-configs/${configId}/sla`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(slaData),
        credentials: 'include'
      });

      console.log('📊 Step SLA Update API Response status:', response.status);

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
      console.log('✅ Step SLA updated successfully');
      return data;
      
    } catch (error) {
      console.error('❌ Error updating step SLA:', error);
      throw error;
    }
  },

  // CORRECTED: Bulk update SLA for all steps in a workflow
  updateBulkSLA: async (workflowType, bulkData) => {
    try {
      console.log('🔍 Bulk updating SLA for workflow:', { workflowType, bulkData });
      
      const response = await fetch(`${SLA_API_BASE_URL}/workflow-configs/${workflowType}/sla/bulk`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bulkData),
        credentials: 'include'
      });

      console.log('📊 Bulk SLA Update API Response status:', response.status);

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
      console.log('✅ Bulk SLA updated successfully');
      return data;
      
    } catch (error) {
      console.error('❌ Error updating bulk SLA:', error);
      throw error;
    }
  },

  // CORRECTED: Toggle step activation - use configId (UUID) from step settings
  toggleStepActivation: async (configId, activationData) => {
    try {
      console.log('🔍 Toggling step activation:', { configId, activationData });
      
      const response = await fetch(`${SLA_API_BASE_URL}/workflow-configs/${configId}/activation`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(activationData),
        credentials: 'include'
      });

      console.log('📊 Step Activation API Response status:', response.status);

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
      console.log('✅ Step activation updated successfully');
      return data;
      
    } catch (error) {
      console.error('❌ Error toggling step activation:', error);
      throw error;
    }
  },

  // CORRECTED: Update step sequence - use configId (UUID) from step settings
  updateStepSequence: async (configId, sequenceData) => {
    try {
      console.log('🔍 Updating step sequence:', { configId, sequenceData });
      
      const response = await fetch(`${SLA_API_BASE_URL}/workflow-configs/${configId}/sequence`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sequenceData),
        credentials: 'include'
      });

      console.log('📊 Step Sequence API Response status:', response.status);

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
      console.log('✅ Step sequence updated successfully');
      return data;
      
    } catch (error) {
      console.error('❌ Error updating step sequence:', error);
      throw error;
    }
  },

  // All other existing methods remain exactly the same...
  getSuperAdminProfile: async () => {
    try {
      const response = await api.get('/super-admin/profile');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  updateSuperAdminProfile: async (profileData) => {
    try {
      const response = await api.put('/super-admin/profile', profileData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getDashboardStats: async () => {
    try {
      const response = await api.get('/super-admin/dashboard/stats');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getFinancialData: async () => {
    try {
      const response = await api.get('/super-admin/financial-data');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getUsers: async (params = {}) => {
    try {
      const response = await api.get('/super-admin/users', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  createUser: async (userData) => {
    try {
      const response = await api.post('/super-admin/users', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  updateUserStatus: async (userId, status) => {
    try {
      const response = await api.patch(`/super-admin/users/${userId}/status`, { status });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getPolicies: async (params = {}) => {
    try {
      const response = await api.get('/super-admin/policies', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  createPolicy: async (policyData) => {
    try {
      const response = await api.post('/super-admin/policies', policyData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  updatePolicyStatus: async (policyId, isActive) => {
    try {
      const response = await api.patch(`/super-admin/policies/${policyId}/status`, { isActive });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getReports: async (params = {}) => {
    try {
      const response = await api.get('/super-admin/reports', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  generateReport: async (reportData) => {
    try {
      const response = await api.post('/super-admin/reports/generate', reportData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  downloadReport: async (reportId) => {
    try {
      const response = await api.get(`/super-admin/reports/${reportId}/download`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getSystemLogs: async (params = {}) => {
    try {
      const response = await api.get('/super-admin/system-logs', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getOverrideRequests: async (params = {}) => {
    try {
      const response = await api.get('/super-admin/override-requests', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  handleOverrideRequest: async (requestId, action, reason = '') => {
    try {
      const response = await api.post(`/super-admin/override-requests/${requestId}/handle`, {
        action,
        reason
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getSystemSettings: async () => {
    try {
      const response = await api.get('/super-admin/system-settings');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  updateSystemSettings: async (settings) => {
    try {
      const response = await api.put('/super-admin/system-settings', settings);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default SuperAdminService;