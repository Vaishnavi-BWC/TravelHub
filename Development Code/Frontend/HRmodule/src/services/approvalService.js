// services/approvalService.js
const HR_API_BASE_URL = 'http://bwc-97.brainwaveconsulting.co.in:8088/api/v1/workflows';
const AUTH_API_BASE_URL = 'http://bwc-97.brainwaveconsulting.co.in:8081/api/auth';
const HR_API_URL='http://bwc-97.brainwaveconsulting.co.in:8088/api/v1/dashboard'

// Helper function to get current HR user info
const getCurrentHRUserInfo = async () => {
  try {
    console.log('🔍 Fetching current HR user info from auth API...');
    
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
      console.log('✅ HR User data from auth API:', userData);
      
      // Extract name from email (e.g., "bob.smith@company.com" -> "Bob Smith")
      const extractNameFromEmail = (email) => {
        if (!email) return 'HR User';
        const namePart = email.split('@')[0];
        return namePart.split('.')
          .map(part => part.charAt(0).toUpperCase() + part.slice(1))
          .join(' ');
      };

      return {
        userId: userData.userId,
        name: extractNameFromEmail(userData.email),
        role: userData.roles?.[0] || 'HR',
        email: userData.email,
        department: userData.department
      };
    } else {
      console.warn('⚠️ Failed to fetch HR user info from auth API');
      throw new Error('Could not fetch HR user information');
    }
  } catch (error) {
    console.error('❌ Error fetching HR user info:', error);
    throw error;
  }
};

export const approvalService = {
  /**
   * Fetch all pending approval requests for HR
   */
  getPendingApprovals: async () => {
    try {
      console.log('🔍 Making HR API call to:', `${HR_API_URL}/pending-approvals`);
      
      const response = await fetch(`${HR_API_URL}/pending-approvals`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      console.log('📊 HR Approval API Response status:', response.status);
      
      if (response.status === 403) {
        throw new Error('Access forbidden. HR permissions required.');
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
      console.log('✅ HR Approval API Response:', data);
      
      // Handle different response structures
      if (data.data) {
        return Array.isArray(data.data) ? data.data : [data.data];
      } else if (Array.isArray(data)) {
        return data;
      } else if (data.content && Array.isArray(data.content)) {
        return data.content;
      } else {
        console.warn('Unexpected HR response structure:', data);
        return [];
      }
      
    } catch (error) {
      console.error('❌ Error fetching HR pending approvals:', error);
      throw error;
    }
  },

  /**
   * Fetch returned requests for changes
   */
  // getReturnedRequests: async () => {
  //   try {
  //     console.log('🔍 Making HR API call to:', `${HR_API_URL}/returned-requests`);
      
  //     const response = await fetch(`${HR_API_URL}/returned-requests`, {
  //       method: 'GET',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       credentials: 'include',
  //     });

  //     console.log('📊 Returned Requests API Response status:', response.status);
      
  //     if (response.status === 403) {
  //       throw new Error('Access forbidden. HR permissions required.');
  //     }
      
  //     if (response.status === 401) {
  //       throw new Error('Authentication failed. Please login again.');
  //     }
      
  //     if (!response.ok) {
  //       let errorMessage = `HTTP error! status: ${response.status}`;
  //       try {
  //         const errorData = await response.text();
  //         if (errorData) {
  //           const parsedError = JSON.parse(errorData);
  //           errorMessage = parsedError.message || errorMessage;
  //         }
  //       } catch {
  //         // Ignore parsing errors
  //       }
  //       throw new Error(errorMessage);
  //     }

  //     const data = await response.json();
  //     console.log('✅ Returned Requests API Response:', data);
      
  //     // Handle different response structures
  //     if (data.data) {
  //       return Array.isArray(data.data) ? data.data : [data.data];
  //     } else if (Array.isArray(data)) {
  //       return data;
  //     } else if (data.content && Array.isArray(data.content)) {
  //       return data.content;
  //     } else {
  //       console.warn('Unexpected returned requests response structure:', data);
  //       return [];
  //     }
      
  //   } catch (error) {
  //     console.error('❌ Error fetching returned requests:', error);
  //     throw error;
  //   }
  // },

  /**
   * Approve a HR request using workflowId with correct request body
   */
  approveRequest: async (workflowId, remarks) => {
    try {
      console.log('✅ HR Approving workflow:', workflowId);
      
      // Get current HR user info
      const userInfo = await getCurrentHRUserInfo();
      console.log('👤 Current HR user info:', userInfo);

      // Prepare the exact request body as required
      const requestBody = {
        workflowId: workflowId,
        actionType: "APPROVE",
        approverId: userInfo.userId,
        approverName: userInfo.name,
        comments: remarks || "Approved by HR",
      };

      console.log('📤 Sending HR approval request body:', requestBody);

      // Use workflowId as path variable in the URL
      const response = await fetch(`${HR_API_BASE_URL}/${workflowId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        credentials: 'include'
      });

      console.log('📊 HR Approve API Response status:', response.status);

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorText = await response.text();
          console.error('🔴 HR Server error response:', errorText);
          if (errorText) {
            try {
              const parsedError = JSON.parse(errorText);
              errorMessage = parsedError.message || parsedError.error || errorMessage;
            } catch {
              errorMessage = errorText || errorMessage;
            }
          }
        } catch (e) {
          console.error('Error reading HR error response:', e);
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('✅ HR Request approved successfully:', data);
      return data.data || data;
      
    } catch (error) {
      console.error('Error approving HR request:', error);
      throw new Error(`Failed to approve HR request: ${error.message}`);
    }
  },

  /**
   * Reject a HR request using workflowId with correct request body
   */
  rejectRequest: async (workflowId, remarks) => {
    try {
      console.log('❌ HR Rejecting workflow:', workflowId);
      
      // Get current HR user info
      const userInfo = await getCurrentHRUserInfo();
      console.log('👤 Current HR user info:', userInfo);

      // Prepare the exact request body as required
      const requestBody = {
        workflowId: workflowId,
        actionType: "REJECT",
        approverId: userInfo.userId,
        approverName: userInfo.name,
        comments: remarks || "Rejected by HR",
      };

      console.log('📤 Sending HR rejection request body:', requestBody);

      // Use workflowId as path variable in the URL
      const response = await fetch(`${HR_API_BASE_URL}/${workflowId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        credentials: 'include'
      });

      console.log('📊 HR Reject API Response status:', response.status);

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorText = await response.text();
          console.error('🔴 HR Server error response:', errorText);
          if (errorText) {
            try {
              const parsedError = JSON.parse(errorText);
              errorMessage = parsedError.message || parsedError.error || errorMessage;
            } catch {
              errorMessage = errorText || errorMessage;
            }
          }
        } catch (e) {
          console.error('Error reading HR error response:', e);
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('✅ HR Request rejected successfully:', data);
      return data.data || data;
      
    } catch (error) {
      console.error('Error rejecting HR request:', error);
      throw new Error(`Failed to reject HR request: ${error.message}`);
    }
  },

  /**
   * Return a request for changes using workflowId
   */
  // returnForChanges: async (workflowId, remarks) => {
  //   try {
  //     console.log('📝 HR Returning workflow for changes:', workflowId);
      
  //     // Get current HR user info
  //     const userInfo = await getCurrentHRUserInfo();
  //     console.log('👤 Current HR user info:', userInfo);

  //     // Prepare the exact request body as required
  //     const requestBody = {
  //       // workflowId: workflowId,
  //       // actionType: "RETURN",
  //       // approverId: userInfo.userId,
  //       // approverName: userInfo.name,
  //       // comments: remarks || "Returned for changes by HR",
  //      returnReason: remarks || "return for chnages from hr"
  //     };

  //     console.log('📤 Sending HR return for changes request body:', requestBody);

  //     // Use workflowId as path variable in the URL
  //     const response = await fetch(`${HR_API_BASE_URL}/${workflowId}/return`, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify(requestBody),
  //       credentials: 'include'
  //     });

  //     console.log('📊 HR Return API Response status:', response.status);

  //     if (!response.ok) {
  //       let errorMessage = `HTTP error! status: ${response.status}`;
  //       try {
  //         const errorText = await response.text();
  //         console.error('🔴 HR Server error response:', errorText);
  //         if (errorText) {
  //           try {
  //             const parsedError = JSON.parse(errorText);
  //             errorMessage = parsedError.message || parsedError.error || errorMessage;
  //           } catch {
  //             errorMessage = errorText || errorMessage;
  //           }
  //         }
  //       } catch (e) {
  //         console.error('Error reading HR error response:', e);
  //       }
  //       throw new Error(errorMessage);
  //     }

  //     const data = await response.json();
  //     console.log('✅ HR Request returned for changes successfully:', data);
  //     return data.data || data;
      
  //   } catch (error) {
  //     console.error('Error returning request for changes:', error);
  //     throw new Error(`Failed to return request for changes: ${error.message}`);
  //   }
  // }


  getWorkflowDetail: async (workflowId) => {
  try {
    console.log('🔍 Fetching workflow details for:', workflowId);
    
    const response = await fetch(`http://bwc-97.brainwaveconsulting.co.in:8088/api/v1/dashboard/workflows/${workflowId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include' // ADD THIS LINE - same as your other functions
    });

    console.log('📊 Workflow Detail API Response status:', response.status);
    
    if (response.status === 403) {
      throw new Error('Access forbidden. HR permissions required.');
    }
    
    if (response.status === 401) {
      throw new Error('Authentication failed. Please login again.');
    }
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Workflow Detail API Response:', data);
    
    return data;
    
  } catch (error) {
    console.error('❌ Error fetching workflow details:', error);
    throw error;
  }
}
};

export default approvalService;