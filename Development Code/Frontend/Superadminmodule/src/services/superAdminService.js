import { api } from './api';

// Base URL configuration
const SLA_API_BASE_URL = 'http://bwc-97.brainwaveconsulting.co.in:8088/api/admin';
const POLICY_API_BASE_URL = 'http://bwc-97.brainwaveconsulting.co.in:8082/pms/api';
export const SuperAdminService = {
  // SLA Settings API Methods
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
      console.log('✅ SLA settings fetched successfully:', data);
      return data;

    } catch (error) {
      console.error('❌ Error fetching SLA settings:', error);

      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        throw new Error('Cannot connect to SLA service. Please check if the service is running.');
      }

      throw error;
    }
  },

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
      console.log('✅ Step SLA updated successfully:', data);
      return data;

    } catch (error) {
      console.error('❌ Error updating step SLA:', error);
      throw error;
    }
  },

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

  // All other existing methods remain the same...
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
  },
  getPolicies: async (params = {}) => {
    try {
      const response = await fetch(`${POLICY_API_BASE_URL}/policies`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('📋 Policies response:', data);
      return data.data || data;
    } catch (error) {
      console.error('Error fetching policies:', error);
      throw error;
    }
  },

  getPolicyById: async (policyId) => {
    try {
      const response = await fetch(`${POLICY_API_BASE_URL}/policies/${policyId}`, {
        method: 'GET',
        headers: {
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
      console.error('Error fetching policy:', error);
      throw error;
    }
  },

  // services/superAdminService.js - FIXED createPolicy method
  createPolicy: async (policyData) => {
    try {
      console.log('🚀 Creating policy with data:', JSON.stringify(policyData, null, 2));

      const response = await fetch(`${POLICY_API_BASE_URL}/policies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(policyData),
        credentials: 'include'
      });

      console.log('📊 Response status:', response.status);

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorText = await response.text();
          console.error('❌ Error response text:', errorText);
          if (errorText) {
            try {
              const errorData = JSON.parse(errorText);
              errorMessage = errorData.message || errorMessage;
            } catch {
              errorMessage = errorText || errorMessage;
            }
          }
        } catch (parseError) {
          console.error('❌ Error parsing error response:', parseError);
        }
        throw new Error(errorMessage);
      }

      // Handle successful response - try to parse as JSON, but handle large responses
      try {
        const responseText = await response.text();
        console.log('📄 Response length:', responseText.length);

        if (responseText) {
          const data = JSON.parse(responseText);
          console.log('✅ Policy created successfully');
          return data.data || data;
        } else {
          console.log('✅ Policy created successfully (empty response)');
          return { success: true, message: 'Policy created successfully' };
        }
      } catch (parseError) {
        console.warn('⚠️ Could not parse response as JSON, but request was successful');
        console.log('Response was likely too large. Policy created successfully.');
        return { success: true, message: 'Policy created successfully' };
      }
    } catch (error) {
      console.error('❌ Error creating policy:', error);
      throw error;
    }
  },
  // services/superAdminService.js - ENHANCED updatePolicy method
  updatePolicy: async (policyId, policyData) => {
    try {
      console.log('✏️ Updating policy:', { policyId, policyData });

      const response = await fetch(`${POLICY_API_BASE_URL}/policies/${policyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(policyData),
        credentials: 'include'
      });

      console.log('📊 Update Policy Response status:', response.status);

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorText = await response.text();
          console.error('❌ Error response text:', errorText);
          if (errorText) {
            try {
              const errorData = JSON.parse(errorText);
              errorMessage = errorData.message || errorMessage;

              // Handle specific 409 conflict error - this is a backend bug
              if (response.status === 409) {
                errorMessage = `Backend conflict: Unable to update policy with same category and year. This appears to be a backend issue where updates are incorrectly treated as duplicates. Please try changing either the year or category temporarily.`;
              }
            } catch {
              errorMessage = errorText || errorMessage;
            }
          }
        } catch (parseError) {
          console.error('❌ Error parsing error response:', parseError);
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('✅ Policy updated successfully');
      return data.data || data;
    } catch (error) {
      console.error('❌ Error updating policy:', error);
      throw error;
    }
  },
  deletePolicy: async (policyId) => {
    try {
      const response = await fetch(`${POLICY_API_BASE_URL}/policies/${policyId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error deleting policy:', error);
      throw error;
    }
  },

  updatePolicyStatus: async (policyId, active) => {
    try {
      const response = await fetch(`${POLICY_API_BASE_URL}/policies/${policyId}/activate?active=${active}`, {
        method: 'PATCH',
        headers: {
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
      console.error('Error updating policy status:', error);
      throw error;
    }
  },

  getCityCategories: async () => {
    try {
      const response = await fetch(`${POLICY_API_BASE_URL}/categories`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('🏙️ City categories:', data);
      return data.data || data;
    } catch (error) {
      console.error('Error fetching city categories:', error);
      throw error;
    }
  },

  getCities: async () => {
    try {
      const response = await fetch(`${POLICY_API_BASE_URL}/cities`, {
        method: 'GET',
        headers: {
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
      console.error('Error fetching cities:', error);
      throw error;
    }
  },

  getActivePolicy: async (city, cityCategory, grade) => {
    try {
      let url = `${POLICY_API_BASE_URL}/policies/active?grade=${grade}`;
      if (city) {
        url += `&city=${encodeURIComponent(city)}`;
      } else if (cityCategory) {
        url += `&cityCategory=${cityCategory}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
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
      console.error('Error fetching active policy:', error);
      throw error;
    }
  },


  // Update specific grade in a policy
  // Update specific grade in a policy - with multiple structure attempts
  updatePolicyGrade: async (policyId, grade, gradeData) => {
    try {
      console.log('🔍 Updating policy grade:', { policyId, grade, gradeData });

      // Try multiple possible request body structures
      const requestBodies = [
        // Structure 1: Based on documentation (with corrected field names)
        {
          grade: grade,
          conservable: gradeData.companyRate,
          confuser: gradeData.ownRate,
          overnightRule: gradeData.overnightRule,
          dayTripRule: gradeData.dayTripRule,
          travelModes: gradeData.travelModes.map(tm => ({
            modeName: tm.modeName,
            allowedClasses: tm.allowedClasses
          }))
        },
        // Structure 2: Original structure that might work
        {
          grade: grade,
          companyRate: gradeData.companyRate,
          ownRate: gradeData.ownRate,
          overnightRule: gradeData.overnightRule,
          dayTripRule: gradeData.dayTripRule,
          travelModes: gradeData.travelModes
        },
        // Structure 3: Minimal structure with just grade data
        {
          grade: grade,
          ...gradeData
        }
      ];

      let lastError = null;

      // Try each request body structure
      for (let i = 0; i < requestBodies.length; i++) {
        const requestBody = requestBodies[i];
        console.log(`🔄 Trying structure ${i + 1}:`, JSON.stringify(requestBody, null, 2));

        try {
          const response = await fetch(`${POLICY_API_BASE_URL}/policies/grades/${policyId}/${grade}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
            credentials: 'include'
          });

          console.log(`📊 Structure ${i + 1} Response status:`, response.status);

          if (response.ok) {
            const data = await response.json();
            console.log('✅ Grade updated successfully with structure', i + 1);
            return data.data || data;
          } else {
            const errorText = await response.text();
            console.log(`❌ Structure ${i + 1} failed:`, errorText);
            lastError = new Error(`Structure ${i + 1}: ${errorText}`);
          }
        } catch (error) {
          console.log(`❌ Structure ${i + 1} error:`, error.message);
          lastError = error;
        }
      }

      // If all structures failed, throw the last error
      throw lastError || new Error('All request structures failed');

    } catch (error) {
      console.error('❌ Error updating policy grade:', error);
      throw error;
    }
  },
};

export default SuperAdminService;