const TRAVEL_API_BASE_URL = 'http://bwc-97.brainwaveconsulting.co.in:8090/travel-management/api/travel-requests';
const AUTH_API_BASE_URL = 'http://bwc-97.brainwaveconsulting.co.in:8081/api/auth';

// Helper function to get current user info from auth API (reused from your managerService)
const getCurrentUserInfo = async () => {
  try {
    console.log('🔍 Fetching current user info from auth API...');
    
    const response = await fetch(`${AUTH_API_BASE_URL}/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include' // This sends the auth_token cookie
    });

    console.log('📊 Auth API Response status:', response.status);

    if (response.ok) {
      const userData = await response.json();
      console.log('✅ User data from auth API:', userData);
      
      // Extract name from email (e.g., "karen.hall@company.com" -> "Karen Hall")
      const extractNameFromEmail = (email) => {
        if (!email) return 'User';
        const namePart = email.split('@')[0];
        return namePart.split('.')
          .map(part => part.charAt(0).toUpperCase() + part.slice(1))
          .join(' ');
      };

      return {
        id: userData.userId,
        name: extractNameFromEmail(userData.email),
        role: userData.roles?.[0] || 'EMPLOYEE',
        email: userData.email,
        department: userData.department
      };
    } else {
      console.warn('⚠️ Failed to fetch user info from auth API, status:', response.status);
      const errorText = await response.text();
      console.error('Auth API error:', errorText);
    }
  } catch (error) {
    console.error('❌ Error fetching user info from auth API:', error);
  }
  
  // Fallback values - try localStorage as backup
  try {
    const userData = localStorage.getItem('user_data');
    if (userData) {
      const user = JSON.parse(userData);
      console.log('🔄 Using fallback user data from localStorage:', user);
      return {
        id: user.id || user.userId || user.email || 'unknown-user-id',
        name: user.userName || user.name || user.email?.split('@')[0] || 'User',
        role: user.role || 'EMPLOYEE',
        email: user.email || ''
      };
    }
  } catch (fallbackError) {
    console.error('Error getting fallback user info:', fallbackError);
  }
  
  // Final fallback values
  return {
    id: 'unknown-user-id',
    name: 'User',
    role: 'EMPLOYEE',
    email: '',
    department: ''
  };
};

export const travelService = {
  /**
   * Create travel request using cookie-based authentication with user ID from auth service
   */
  async createTravelRequest(requestData) {
    try {
      console.log('✈️ Making travel request API call to:', TRAVEL_API_BASE_URL);
      
      // Get current user info to ensure we have the correct employeeId
      const userInfo = await getCurrentUserInfo();
      console.log('👤 Current user info:', userInfo);
      
      // Enhance request data with user information
      const enhancedRequestData = {
        ...requestData,
        employeeId: userInfo.id, // Ensure employeeId is set from auth service
        requesterName: userInfo.name,
        requesterEmail: userInfo.email
      };

      console.log('📦 Enhanced request data:', enhancedRequestData);
      
      const response = await fetch(TRAVEL_API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(enhancedRequestData),
        credentials: 'include' // Use cookies for authentication
      });

      console.log('📊 Travel API Response status:', response.status);
      
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
      console.log('✅ Travel request created successfully:', data);
      
      return data.data || data;
      
    } catch (error) {
      console.error('❌ Error creating travel request:', error);
      
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        throw new Error('Cannot connect to travel service. Please check your connection.');
      }
      
      throw error;
    }
  },

  /**
   * Create travel request with automatic user ID fetching
   */
  async createTravelRequestWithUser(requestData) {
    try {
      console.log('🚀 Creating travel request with automatic user ID...');
      
      // Get user info first
      const userInfo = await getCurrentUserInfo();
      
      if (!userInfo.id || userInfo.id === 'unknown-user-id') {
        throw new Error('Unable to authenticate user. Please login again.');
      }

      // Prepare the complete request payload
      const completeRequestData = {
        employeeId: userInfo.id,
        projectId: requestData.projectId,
        startDate: requestData.startDate,
        endDate: requestData.endDate,
        purpose: requestData.purpose,
        managerPresent: requestData.managerPresent !== undefined ? requestData.managerPresent : true,
        estimatedBudget: requestData.estimatedBudget || 0,
        travelDestination: requestData.travelDestination || '',
        origin: requestData.origin || '',
        clientName: requestData.clientName || '',
        urgency: requestData.urgency || 'medium',
        status: requestData.status || 'PENDING',
        requesterName: userInfo.name,
        requesterEmail: userInfo.email,
        department: userInfo.department
      };

      console.log('📦 Complete request payload:', completeRequestData);

      // Call the main create method
      return await this.createTravelRequest(completeRequestData);
      
    } catch (error) {
      console.error('❌ Error in createTravelRequestWithUser:', error);
      throw error;
    }
  },

  /**
   * Get user's travel requests with automatic authentication
   */
  async getMyTravelRequests() {
    try {
      // Get user info first to ensure we're authenticated
      const userInfo = await getCurrentUserInfo();
      console.log('👤 Fetching travel requests for user:', userInfo.id);
      
      const response = await fetch(`${TRAVEL_API_BASE_URL}/my-requests`, {
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
      console.error('Error fetching travel requests:', error);
      throw new Error(`Failed to fetch travel requests: ${error.message}`);
    }
  },

  /**
   * Get travel request by ID
   */
  async getTravelRequestById(requestId) {
    try {
      const response = await fetch(`${TRAVEL_API_BASE_URL}/${requestId}`, {
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
      console.error('Error fetching travel request:', error);
      throw new Error(`Failed to fetch travel request: ${error.message}`);
    }
  },

  /**
   * Update travel request
   */
  /**
 * Update travel request
 */
async updateTravelRequest(requestId, updateData) {
  try {
    console.log('✏️ Updating travel request:', requestId);
    
    // Ensure travelRequestId is included in the update data
    const updatePayload = {
      ...updateData,
      travelRequestId: requestId // Add this to match API expectation
    };

    console.log('📦 Update payload:', updatePayload);
    
    const response = await fetch(`${TRAVEL_API_BASE_URL}/${requestId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatePayload),
      credentials: 'include'
    });

    console.log('📊 Update API Response status:', response.status);
    
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
    console.log('✅ Travel request updated successfully:', data);
    
    return data.data || data;
    
  } catch (error) {
    console.error('❌ Error updating travel request:', error);
    throw new Error(`Failed to update travel request: ${error.message}`);
  }
},

  /**
   * Delete travel request
   */
 /**
 * Delete travel request
 */
async deleteTravelRequest(requestId) {
  try {
    console.log('🗑️ Deleting travel request:', requestId);
    
    const response = await fetch(`${TRAVEL_API_BASE_URL}/${requestId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    });

    console.log('📊 Delete API Response status:', response.status);
    
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.text();
        if (errorData) {
          const parsedError = JSON.parse(errorData);
          errorMessage = parsedError.message || errorMessage;
        }
      } catch {
        // Ignore parsing errors for error response
      }
      throw new Error(errorMessage);
    }

    // Check if response has content before trying to parse JSON
    const contentLength = response.headers.get('content-length');
    const contentType = response.headers.get('content-type');
    
    if (contentLength && parseInt(contentLength) > 0 && contentType && contentType.includes('application/json')) {
      const data = await response.json();
      console.log('✅ Travel request deleted successfully with response:', data);
      return data.data || data;
    } else {
      // Empty response or non-JSON response - common for DELETE operations
      console.log('✅ Travel request deleted successfully (empty response)');
      return { success: true, message: 'Request deleted successfully' };
    }
    
  } catch (error) {
    console.error('❌ Error deleting travel request:', error);
    throw new Error(`Failed to delete travel request: ${error.message}`);
  }
},

  /**
   * Get current user info (exposed for components that need it)
   */
  async getCurrentUser() {
    return await getCurrentUserInfo();
  }
};

export default travelService;