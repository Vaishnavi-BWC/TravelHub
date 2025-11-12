 const HR_API_BASE_URL = 'http://bwc-97.brainwaveconsulting.co.in:8088/api/hr';
const AUTH_API_BASE_URL = 'http://bwc-97.brainwaveconsulting.co.in:8081/api/auth';
const EMPLOYEE_API_BASE_URL = 'http://bwc-97.brainwaveconsulting.co.in:8080/ems/api/v1/employees';
const DASHBOARD_API_BASE_URL = 'http://bwc-97.brainwaveconsulting.co.in:8088/api/v1/dashboard';

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
      
      // Extract name from email (e.g., "hr.user@company.com" -> "Hr User")
      const extractNameFromEmail = (email) => {
        if (!email) return 'HR Manager';
        const namePart = email.split('@')[0];
        return namePart.split('.')
          .map(part => part.charAt(0).toUpperCase() + part.slice(1))
          .join(' ');
      };

      return {
        id: userData.userId,
        name: extractNameFromEmail(userData.email),
        role: userData.roles?.[0] || 'HR',
        email: userData.email,
        department: userData.department || 'Human Resources'
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
        name: user.userName || user.name || user.email?.split('@')[0] || 'HR Manager',
        role: user.role || 'HR',
        email: user.email || '',
        department: 'Human Resources'
      };
    }
  } catch (fallbackError) {
    console.error('Error getting fallback user info:', fallbackError);
  }
  
  return {
    id: 'unknown-user-id',
    name: 'HR Manager',
    role: 'HR',
    email: '',
    department: 'Human Resources'
  };
};

// Helper function to fetch HR profile data
const getHRProfileData = async () => {
  try {
    console.log('🔍 Fetching HR profile data...');
    
    // First get user ID from /me API
    const userInfo = await getCurrentUserInfo();
    console.log('✅ User info obtained:', userInfo);
    
    // Then fetch employee details using the user ID
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
        
        // Return HR-specific profile data
        return {
          id: data.employeeId,
          fullName: data.fullName,
          email: data.email,
          phoneNumber: data.phoneNumber,
          department: data.department || 'Human Resources',
          position: data.level || 'HR Manager',
          level: data.level,
          active: data.active,
          managerName: data.managerName,
          projectIds: data.projectIds,
          role: data.roles?.[0] || 'HR',
          // Additional fields for UI compatibility
          avatar: '/assets/images/default-avatar.png',
          location: 'Corporate Office', // Default value for HR
          dateJoined: data.dateOfJoining || data.createdDate || ''
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
    console.error('❌ Error fetching HR profile:', error);
    throw error;
  }
};

// Helper function to update HR profile
const updateHRProfileData = async (profileData) => {
  try {
    console.log('🔍 Updating HR profile data...');
    
    // First get user ID from /me API
    const userInfo = await getCurrentUserInfo();
    console.log('✅ User info obtained for update:', userInfo);
    
    // First, get the current employee data to preserve read-only fields
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

    // Prepare the update payload with editable fields only
    const updatePayload = {
      fullName: profileData.fullName,
      email: profileData.email,
      phoneNumber: profileData.phoneNumber,
      // Preserve read-only fields from current data
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
      console.log('✅ HR Profile updated successfully:', updateData);
      return updateData.data || updateData;
    } else {
      const errorText = await response.text();
      console.error('Update API error:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('❌ Error updating HR profile:', error);
    throw error;
  }
};

// Helper function to get dashboard summary
const getDashboardSummaryData = async () => {
  try {
    console.log('🔄 Fetching dashboard summary...');
    
    const response = await fetch(`${DASHBOARD_API_BASE_URL}/summary`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const summaryData = await response.json();
    console.log('✅ Dashboard summary fetched:', summaryData);
    
    return summaryData;
  } catch (error) {
    console.error('❌ Error fetching dashboard summary:', error);
    throw error;
  }
};
// Helper function to fetch role exceptions
const getRoleExceptionsData = async () => {
  try {
    //http://bwc-97.brainwaveconsulting.co.in:8088/api/v1/dashboard
    //http://bwc-97.brainwaveconsulting.co.in:8088/api/v1/dashboard/workflows/with-exceptions/pending
    console.log('🔍 Fetching role exceptions...');
    
    const response = await fetch(`${DASHBOARD_API_BASE_URL}/workflows/with-exceptions/pending`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    });

    console.log('📊 Role Exceptions API Response status:', response.status);

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
    console.log('✅ Role exceptions fetched successfully:', data.workflows);
    const data1=data.workflows;
    // console.log(data1.length)
    // Handle different response structures
    if (data1.length>0) {
      console.log("hello")
      return data1;
    } else if (Array.isArray(data)) {
      return data.workflows;
    } else if (data.content && Array.isArray(data.content)) {
      return data.content;
    } else {
      console.warn('Unexpected response structure:', data);
      return [];
    }

  } catch (error) {
    console.error('❌ Error fetching role exceptions:', error);
    
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error('Cannot connect to HR service. Please check if the service is running.');
    }
    
    throw error;
  }
};

// Helper function to approve a role exception
const approveRoleException = async (exceptionId, remarks = '') => {
  try {
    console.log('✅ Approving role exception:', exceptionId);
    
    const userInfo = await getCurrentUserInfo();
    
    const requestBody = {
      exceptionId: exceptionId,
      action: 'APPROVE',
      remarks: remarks || 'Approved by HR',
      approvedBy: userInfo.id,
      approvedByName: userInfo.name
    };

    const response = await fetch(`${DASHBOARD_API_BASE_URL}/role-exceptions/${exceptionId}/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      credentials: 'include'
    });

    console.log('📊 Approve Exception API Response status:', response.status);

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
    console.log('✅ Role exception approved successfully:', data);
    return data.data || data;

  } catch (error) {
    console.error('Error approving role exception:', error);
    throw new Error(`Failed to approve role exception: ${error.message}`);
  }
};

// Helper function to reject a role exception
const rejectRoleException = async (exceptionId, remarks = '') => {
  try {
    console.log('❌ Rejecting role exception:', exceptionId);
    
    const userInfo = await getCurrentUserInfo();
    
    const requestBody = {
      exceptionId: exceptionId,
      action: 'REJECT',
      remarks: remarks || 'Rejected by HR',
      rejectedBy: userInfo.id,
      rejectedByName: userInfo.name
    };

    const response = await fetch(`${DASHBOARD_API_BASE_URL}/role-exceptions/${exceptionId}/reject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      credentials: 'include'
    });

    console.log('📊 Reject Exception API Response status:', response.status);

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
    console.log('✅ Role exception rejected successfully:', data);
    return data.data || data;

  } catch (error) {
    console.error('Error rejecting role exception:', error);
    throw new Error(`Failed to reject role exception: ${error.message}`);
  }
};

export const hrService = {
  /**
   * Fetch HR profile data
   */
  async getHRProfile() {
    return await getHRProfileData();
  },

  /**
   * Update HR profile data
   */
  async updateHRProfile(profileData) {
    return await updateHRProfileData(profileData);
  },

  /**
   * Get current user info (exposed for debugging)
   */
  async getCurrentUser() {
    return await getCurrentUserInfo();
  },

  /**
   * Fetch dashboard summary data
   * Returns: {
   *   "pendingApprovalsCount": 0,
   *   "completedActionsCount": 0,
   *   "raisedExceptionsCount": 0,
   *   "totalWorkflowsInvolved": 0,
   *   "awaitingClarificationCount": 0,
   *   "returnedRequestsCount": 0
   * }
   */
  async getDashboardSummary() {
    return await getDashboardSummaryData();
  },
  async getRoleExceptions() {
    return await getRoleExceptionsData();
  },

  /**
   * Approve a role exception request
   */
  async approveRoleException(exceptionId, remarks = '') {
    return await approveRoleException(exceptionId, remarks);
  },

  /**
   * Reject a role exception request
   */
  async rejectRoleException(exceptionId, remarks = '') {
    return await rejectRoleException(exceptionId, remarks);
  }
};

export default hrService; 