const MANAGER_API_BASE_URL = 'http://bwc-97.brainwaveconsulting.co.in:8088/api/manager';
const AUTH_API_BASE_URL = 'http://bwc-97.brainwaveconsulting.co.in:8081/api/auth';
const EMPLOYEE_API_BASE_URL = 'http://bwc-97.brainwaveconsulting.co.in:8080/ems/api/v1/employees';
const TRAVEL_API_BASE_URL = 'http://bwc-97.brainwaveconsulting.co.in:8090/travel-management/api';
const WORKFLOW_API_BASE_URL = 'http://bwc-97.brainwaveconsulting.co.in:8088/api/workflows';
const Manager_api = 'http://bwc-97.brainwaveconsulting.co.in:8088/api/v1/dashboard';
const Manager_apporval_api = 'http://bwc-97.brainwaveconsulting.co.in:8088/api/v1/workflows';
<<<<<<< HEAD
// const TRAVEL_API = 'http://bwc-90.brainwaveconsulting.co.in:8090/travel-management/api';
=======
const TRAVEL_API = 'http://bwc-90.brainwaveconsulting.co.in:8090/travel-management/api';
>>>>>>> upstream/main
// Helper function to get current user info from auth API
const getCurrentUserInfo = async () => {
  try {
    console.log('🔍 Fetching current user info from auth API...');

    const response = await fetch(`${AUTH_API_BASE_URL}/me`, {
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

      const extractNameFromEmail = (email) => {
        if (!email) return 'Manager';
        const namePart = email.split('@')[0];
        return namePart.split('.')
          .map(part => part.charAt(0).toUpperCase() + part.slice(1))
          .join(' ');
      };

      return {
        id: userData.userId,
        name: extractNameFromEmail(userData.email),
        role: userData.roles?.[0] || 'MANAGER',
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

  // Fallback values
  try {
    const userData = localStorage.getItem('user_data');
    if (userData) {
      const user = JSON.parse(userData);
      console.log('🔄 Using fallback user data from localStorage:', user);
      return {
        id: user.id || user.userId || user.email || 'unknown-user-id',
        name: user.userName || user.name || user.email?.split('@')[0] || 'Manager',
        role: user.role || 'MANAGER',
        email: user.email || ''
      };
    }
  } catch (fallbackError) {
    console.error('Error getting fallback user info:', fallbackError);
  }

  return {
    id: 'unknown-user-id',
    name: 'Manager',
    role: 'MANAGER',
    email: '',
    department: ''
  };
};

// NEW: Helper function to get workflow status for a travel request
const getWorkflowStatus = async (travelRequestId) => {
  try {
    console.log(`🔍 Fetching workflow status for travel request: ${travelRequestId}`);

    const response = await fetch(`${WORKFLOW_API_BASE_URL}/travel-request/${travelRequestId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    });

    console.log(`📊 Workflow API Response status for ${travelRequestId}:`, response.status);

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.text();
        if (errorData) {
          const parsedError = JSON.parse(errorData);
          // eslint-disable-next-line no-unused-vars
          errorMessage = parsedError.message || errorMessage;
        }
      } catch {
        // Ignore parsing errors
      }

      // Don't throw error for 404 or other statuses, just return null
      console.warn(`⚠️ Workflow API returned ${response.status} for ${travelRequestId}`);
      return null;
    }

    const data = await response.json();
    console.log(`✅ Workflow status fetched for ${travelRequestId}:`, data);

    return data;

  } catch (error) {
    console.error(`❌ Error fetching workflow status for ${travelRequestId}:`, error);

    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      console.warn('⚠️ Cannot connect to workflow service');
    }

    // Return null instead of throwing to avoid breaking the UI
    return null;
  }
};

// NEW: Helper function to get all travel requests
// NEW: Helper function to get all travel requests
const getAllTravelRequests = async () => {
  try {
    console.log('🔍 Fetching all travel requests...');

    const userInfo = await getCurrentUserInfo();
    console.log('✅ Current user info obtained:', userInfo);


<<<<<<< HEAD
    const response = await fetch(`${TRAVEL_API_BASE_URL}/travel-requests/employee/${userInfo.id}`, {
=======
    const response = await fetch(`${TRAVEL_API}/travel-requests/getRequestsByEmployee/${userInfo.id}`, {
>>>>>>> upstream/main
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
    console.log('✅ Travel requests fetched successfully:', data.length);

    return Array.isArray(data) ? data : [];

  } catch (error) {
    console.error('❌ Error fetching travel requests:', error);

    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error('Cannot connect to travel service. Please check if the service is running.');
    }

    throw error;
  }
};

// NEW: Helper function to get travel requests filtered by current user's employee ID
const getTravelRequestsFilteredByEmployee = async () => {
  try {
    console.log('🔍 Starting filtered travel requests fetch...');
    const allRequests = await getAllTravelRequests();
    console.log('✅ All travel requests fetched:', allRequests);
    return allRequests;

  } catch (error) {
    console.error('❌ Error fetching filtered travel requests:', error);
    throw error;
  }
};

// NEW: Helper function to fetch manager profile data
const getManagerProfileData = async () => {
  try {
    console.log('🔍 Fetching manager profile data...');

    const userInfo = await getCurrentUserInfo();
    console.log('✅ User info obtained:', userInfo);

    const response = await fetch(`${EMPLOYEE_API_BASE_URL}/${userInfo.id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    });

    console.log('📊 Employee API Response status:', response.status);

    if (response.ok) {
      const employeeData = await response.json();
      console.log('✅ Employee details fetched successfully:', employeeData);

      if (employeeData.success && employeeData.data) {
        const data = employeeData.data;

        return {
          id: data.employeeId,
          name: data.fullName,
          email: data.email,
          phone: data.phoneNumber,
          department: data.department,
          level: data.level,
          active: data.active,
          managerName: data.managerName,
          projectIds: data.projectIds,
          role: data.roles?.[0] || 'MANAGER',
          avatar: '/assets/images/default-avatar.png',
          position: data.level,
          location: 'New York, USA'
        };
      } else {
        throw new Error(employeeData.message || 'Failed to fetch employee details');
      }
    } else {
      const errorText = await response.text();
      console.error('Employee API error:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('❌ Error fetching manager profile:', error);
    throw error;
  }
};

// NEW: Helper function to update manager profile
const updateManagerProfileData = async (profileData) => {
  try {
    console.log('🔍 Updating manager profile data...');

    const userInfo = await getCurrentUserInfo();
    console.log('✅ User info obtained for update:', userInfo);

    const currentResponse = await fetch(`${EMPLOYEE_API_BASE_URL}/${userInfo.id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    });

    if (!currentResponse.ok) {
      throw new Error('Failed to fetch current employee data');
    }

    const currentData = await currentResponse.json();
    const currentEmployee = currentData.data;

    const updatePayload = {
      fullName: profileData.name,
      email: profileData.email,
      phoneNumber: profileData.phone,
      department: currentEmployee.department,
      level: currentEmployee.level,
      managerId: currentEmployee.managerId,
      roleIds: currentEmployee.roleIds,
      projectIds: currentEmployee.projectIds
    };

    console.log('📤 Sending update payload:', updatePayload);

    const response = await fetch(`${EMPLOYEE_API_BASE_URL}/${userInfo.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatePayload),
      credentials: 'include'
    });

    console.log('📊 Update API Response status:', response.status);

    if (response.ok) {
      const updateData = await response.json();
      console.log('✅ Profile updated successfully:', updateData);
      return updateData.data || updateData;
    } else {
      const errorText = await response.text();
      console.error('Update API error:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('❌ Error updating manager profile:', error);
    throw error;
  }
};

export const managerService = {
  /**
   * Fetch team requests using cookie-based authentication
   */
  async getTeamRequests() {
    try {
      console.log('🔍 Making API call to:', `${Manager_api}/pending-approvals`);

      const response = await fetch(`${Manager_api}/pending-approvals`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      console.log('📊 Manager API Response status:', response.status);

      if (response.status === 403) {
        throw new Error('Access forbidden. Manager permissions required.');
      }

      if (response.status === 401) {
        throw new Error('Authentication failed. Please login again.');
      }

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
      console.log('✅ Manager API Response:', data);

      if (data.data) {
        return Array.isArray(data.data) ? data.data : [data.data];
      } else if (Array.isArray(data)) {
        return data;
      } else if (data.content && Array.isArray(data.content)) {
        return data.content;
      } else {
        console.warn('Unexpected response structure:', data);
        return [];
      }

    } catch (error) {
      console.error('❌ Error fetching team requests:', error);

      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        throw new Error('Cannot connect to manager service. Please check if the service is running.');
      }

      throw error;
    }
  },

  /**
   * NEW: Fetch travel requests filtered by current user's employee ID
   */
  async getTravelRequestsFilteredByEmployee() {
    return await getTravelRequestsFilteredByEmployee();
  },

  /**
   * NEW: Get all travel requests (unfiltered)
   */
  async getAllTravelRequests() {
    return await getAllTravelRequests();
  },

  /**
   * NEW: Get workflow status for a travel request
   */
  async getWorkflowStatus(travelRequestId) {
    return await getWorkflowStatus(travelRequestId);
  },

  /**
   * Fetch manager profile data
   */
  async getManagerProfile() {
    return await getManagerProfileData();
  },

  /**
   * Update manager profile data
   */
  async updateManagerProfile(profileData) {
    return await updateManagerProfileData(profileData);
  },

  /**
   * Approve team member request with workflow_id and full data
   */
  async approveTeamRequest(requestId, remarks, workflowId, requestData) {
    try {
      console.log('✅ Approving request:', {
        requestId,
        workflowId,
        remarks,
        requestData
      });

      const userInfo = await getCurrentUserInfo();
      console.log('👤 Current user info for approval:', userInfo);

      const requestBody = {
        comments: remarks || "Approved via dashboard",
      };

      console.log('📤 Sending approval request body:', requestBody);

      const response = await fetch(`${Manager_apporval_api}/${workflowId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        credentials: 'include'
      });

      console.log('📊 Approve API Response status:', response.status);

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorText = await response.text();
          console.error('🔴 Server error response:', errorText);
          if (errorText) {
            try {
              const parsedError = JSON.parse(errorText);
              errorMessage = parsedError.message || parsedError.error || errorMessage;

              if (parsedError.errors) {
                console.error('🔍 Validation errors:', parsedError.errors);
                errorMessage += ` - ${JSON.stringify(parsedError.errors)}`;
              }
            } catch {
              errorMessage = errorText || errorMessage;
            }
          }
        } catch (e) {
          console.error('Error reading error response:', e);
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('✅ Request approved successfully:', data);
      return data.data || data;

    } catch (error) {
      console.error('Error approving team request:', error);
      throw new Error(`Failed to approve team request: ${error.message}`);
    }
  },

  /**
   * Reject team member request with workflow_id and full data
   */
  async rejectTeamRequest(requestId, remarks, workflowId, requestData) {
    try {
      console.log('❌ Rejecting request:', {
        requestId,
        workflowId,
        remarks,
        requestData
      });

      const userInfo = await getCurrentUserInfo();
      console.log('👤 Current user info for rejection:', userInfo);

      const requestBody = {
        comments: remarks || "Rejected via dashboard",
      };

      console.log('📤 Sending rejection request body:', requestBody);

      const response = await fetch(`${Manager_apporval_api}/${workflowId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        credentials: 'include'
      });

      console.log('📊 Reject API Response status:', response.status);

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorText = await response.text();
          console.error('🔴 Server error response:', errorText);
          if (errorText) {
            try {
              const parsedError = JSON.parse(errorText);
              errorMessage = parsedError.message || parsedError.error || errorMessage;
            } catch {
              errorMessage = errorText || errorMessage;
            }
          }
        } catch (e) {
          console.error('Error reading error response:', e);
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('✅ Request rejected successfully:', data);
      return data.data || data;

    } catch (error) {
      console.error('Error rejecting team request:', error);
      throw new Error(`Failed to reject team request: ${error.message}`);
    }
  },

  /**
   * NEW: Request changes for team member request with workflow_id and full data
   */
  async requestChangesTeamRequest(requestId, remarks, workflowId, requestData) {
    try {
      console.log('📝 Requesting changes for request:', {
        requestId,
        workflowId,
        remarks,
        requestData
      });

      const userInfo = await getCurrentUserInfo();
      console.log('👤 Current user info for changes request:', userInfo);

      const requestBody = {
        comments: `CHANGES REQUESTED: ${remarks || "Please make the requested changes"}`,
        returnReason: " Changes requested via dashboard by vaishnavi"
      };

      console.log('📤 Sending request changes body:', requestBody);

      // Using reject endpoint with "CHANGES REQUESTED" prefix in comments
      const response = await fetch(`${Manager_apporval_api}/${workflowId}/return`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        credentials: 'include'
      });

      console.log('📊 Request Changes API Response status:', response.status);

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorText = await response.text();
          console.error('🔴 Server error response:', errorText);
          if (errorText) {
            try {
              const parsedError = JSON.parse(errorText);
              errorMessage = parsedError.message || parsedError.error || errorMessage;
            } catch {
              errorMessage = errorText || errorMessage;
            }
          }
        } catch (e) {
          console.error('Error reading error response:', e);
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('✅ Changes requested successfully:', data);
      return data.data || data;

    } catch (error) {
      console.error('Error requesting changes for team request:', error);
      throw new Error(`Failed to request changes for team request: ${error.message}`);
    }
  },

  /**
   * Get team members
   */
  async getTeamMembers() {
    try {
      const response = await fetch(`${MANAGER_API_BASE_URL}/team`, {
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
      console.error('Error fetching team members:', error);
      throw new Error(`Failed to fetch team members: ${error.message}`);
    }
  },

  /**
   * Get current user info (exposed for debugging)
   */
  async getCurrentUser() {
    return await getCurrentUserInfo();
  }
};

export default managerService;