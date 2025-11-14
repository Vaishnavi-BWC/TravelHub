// services/superAdminService.js
// eslint-disable-next-line no-unused-vars
import { api } from './api';

// Base URL configuration
const SLA_API_BASE_URL = 'http://bwc-97.brainwaveconsulting.co.in:8088/api/admin';
const POLICY_API_BASE_URL = 'http://bwc-97.brainwaveconsulting.co.in:8082/pms/api';
const TRAVEL_API_BASE_URL = 'http://bwc-97.brainwaveconsulting.co.in:8088/api/v1';
// const WORKFLOW_API_BASE_URL = 'http://bwc-97.brainwaveconsulting.co.in:8088/api/v1';
const INFO_URL = "http://bwc-97.brainwaveconsulting.co.in:8081/api/auth";

export const SuperAdminService = {
  // ==================== TRAVEL REQUESTS API ====================
  getTravelRequests: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      // Add pagination parameters
      if (params.page) queryParams.append('page', params.page - 1); // Backend usually uses 0-based
      if (params.limit) queryParams.append('size', params.limit);
      
      // Add search and filter parameters
      if (params.search) queryParams.append('search', params.search);
      if (params.status) queryParams.append('status', params.status);
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);

      const url = `${TRAVEL_API_BASE_URL}/admin/dashboard/action-history/all?${queryParams.toString()}`;
      
      console.log('🔍 Fetching travel requests from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      console.log('📊 Travel Requests API Response status:', response.status);

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
      console.log('✅ Travel requests fetched successfully. Count:', data.length);
      console.log('🔍 Travel requests data structure:', {
        dataLength: data.length,
        sampleItem: data[0],
        allKeys: data.length > 0 ? Object.keys(data[0]) : 'No data'
      });
      return data;

    } catch (error) {
      console.error('❌ Error fetching travel requests:', error);

      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        throw new Error('Cannot connect to travel service. Please check if the service is running.');
      }

      throw error;
    }
  },

  // ==================== WORKFLOW DETAILS API ====================
  getWorkflowDetail: async (workflowId) => {
    try {
      if (!workflowId) {
        console.warn('⚠️ No workflow ID provided to getWorkflowDetail');
        return null;
      }

      // Fixed URL - removed /dashboard from the path
      const url = `${TRAVEL_API_BASE_URL}/admin/dashboard/workflows/${workflowId}/admin`;
  
      console.log('🔍 Fetching workflow detail from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      console.log('📊 Workflow Detail API Response status:', response.status);

      if (!response.ok) {
        // If workflow not found, return null instead of throwing error
        if (response.status === 404) {
          console.log(`⚠️ Workflow not found for ID: ${workflowId}`);
          return null;
        }
        
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
      console.log(`✅ Workflow detail fetched successfully for: ${workflowId}`);
      return data;

    } catch (error) {
      console.error(`❌ Error fetching workflow detail for ${workflowId}:`, error);
      
      // Return null instead of throwing to prevent breaking the entire logs load
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        console.error('Cannot connect to workflow service. Please check if the service is running.');
        return null;
      }
      
      return null;
    }
  },

  // ==================== SLA SETTINGS API METHODS ====================
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

  // ==================== POLICY MANAGEMENT API ====================
  // eslint-disable-next-line no-unused-vars
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
      // eslint-disable-next-line no-unused-vars
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

  // ==================== OTHER ADMIN API METHODS ====================
  getSuperAdminProfile: async () => {
    try {
      console.log('🔍 Fetching super admin profile from auth API...');

      const response = await fetch(`${INFO_URL}/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      console.log('📊 Auth API Response status:', response.status);

      if (response.ok) {
        const userData = await response.json();
        console.log('✅ User data from auth API:', userData);

        // Extract names from email (vikram.deshmukh@company.com)
        const extractNamesFromEmail = (email) => {
          if (!email) return { firstName: 'Super', fullName: 'Super Admin' };
          
          const namePart = email.split('@')[0]; // Get "vikram.deshmukh"
          const nameParts = namePart.split('.'); // Get ["vikram", "deshmukh"]
          
          // First name (capitalized)
          const firstName = nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1);
          
          // Full name without dots (capitalized)
          const fullName = nameParts
            .map(part => part.charAt(0).toUpperCase() + part.slice(1))
            .join(' ');
          
          return { firstName, fullName };
        };

        const names = extractNamesFromEmail(userData.email);

        return {
          id: userData.userId,
          firstName: names.firstName, // "Vikram"
          fullName: names.fullName,   // "Vikram Deshmukh"
          role: userData.roles?.[0] || 'SUPER_ADMIN',
          email: userData.email,
          department: userData.department || 'Administration'
        };
      } else {
        console.warn('⚠️ Failed to fetch user info from auth API, status:', response.status);
        const errorText = await response.text();
        console.error('Auth API error:', errorText);
        throw new Error(`Auth API error: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Error fetching user info from auth API:', error);
      throw error;
    }
  },
};

export default SuperAdminService;