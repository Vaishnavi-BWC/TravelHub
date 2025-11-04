// services/employeeService.js
const API_BASE_URL = 'http://bwc-97.brainwaveconsulting.co.in:8080/ems/api/v1';

export const EmployeeService = {
  async getAllEmployees(page = 0, size = 5) {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(
        `${API_BASE_URL}/employees?page=${page}&size=${size}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } 
        catch (parseError) {
          // Ignore parsing errors
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      // Return both employees and pagination info
      let employees = [];
      let paginationInfo = {
        currentPage: page,
        totalPages: 0,
        totalElements: 0
      };

      if (data.data && data.data.content) {
        employees = data.data.content;
        paginationInfo = {
          currentPage: data.data.number || page,
          totalPages: data.data.totalPages || 0,
          totalElements: data.data.totalElements || 0
        };
      } else if (data.content) {
        employees = data.content;
        paginationInfo = {
          currentPage: data.number || page,
          totalPages: data.totalPages || 0,
          totalElements: data.totalElements || 0
        };
      } else if (Array.isArray(data.data)) {
        employees = data.data;
      } else if (Array.isArray(data)) {
        employees = data;
      }
      
      return {
        employees,
        pagination: paginationInfo
      };
    } catch (error) {
      console.error('Error fetching employees:', error);
      throw error;
    }
  },

  async getEmployeeById(employeeId) {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/employees/${employeeId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        
        try {
          const errorText = await response.text();
          if (errorText) {
            try {
              const errorData = JSON.parse(errorText);
              errorMessage = errorData.message || errorData.error || errorMessage;
            } catch {
              errorMessage = errorText || errorMessage;
            }
          }
        } catch (parseError) {
          console.error('Cannot read error response body');
        }
        
        throw new Error(errorMessage);
      }

      const responseText = await response.text();
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error('Invalid JSON response from server');
      }

      // Handle different response structures
      if (data.data) {
        return data.data;
      } else if (data.employeeId || data.id) {
        return data;
      } else {
        throw new Error('Unexpected response structure from server');
      }
      
    } catch (error) {
      console.error('Error fetching employee:', error);
      throw error;
    }
  },

  async createEmployee(employee) {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/employees`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(employee),
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (parseError) {
          console.error('Cannot read error response body');
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error('Error creating employee:', error);
      throw error;
    }
  },

  async updateEmployee(employeeId, employeeData) {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/employees/${employeeId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(employeeData),
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (parseError) {
          console.error('Cannot read error response body');
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error('Error updating employee:', error);
      throw error;
    }
  },

  // FIXED: Deactivate employee
  async deactivateEmployee(employeeId) {
    try {
      const token = localStorage.getItem('token');
      console.log('🔍 [deactivateEmployee] Making API call for:', employeeId);
      
      const response = await fetch(`${API_BASE_URL}/employees/${employeeId}/deactivate`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include' // Important for cookies
      });

      console.log('📊 [deactivateEmployee] Response status:', response.status);
      
      // Handle 204 No Content responses
      if (response.status === 204) {
        console.log('✅ [deactivateEmployee] Success - No content (204)');
        return { success: true, message: 'Employee deactivated successfully' };
      }
      
      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        
        try {
          const errorText = await response.text();
          console.error('🔴 [deactivateEmployee] Error response:', errorText);
          
          if (errorText) {
            try {
              const errorData = JSON.parse(errorText);
              errorMessage = errorData.message || errorData.error || errorMessage;
            } catch {
              errorMessage = errorText || errorMessage;
            }
          }
        } catch (parseError) {
          console.error('🔴 [deactivateEmployee] Cannot read error response body');
        }
        
        throw new Error(errorMessage);
      }

      // Handle successful response
      let data;
      try {
        const responseText = await response.text();
        if (responseText) {
          data = JSON.parse(responseText);
          console.log('✅ [deactivateEmployee] Success response:', data);
        } else {
          data = { success: true, message: 'Employee deactivated successfully' };
        }
      } catch (parseError) {
        data = { success: true, message: 'Employee deactivated successfully' };
      }
      
      return data.data || data;
    } catch (error) {
      console.error('❌ [deactivateEmployee] Error:', error);
      throw error;
    }
  },

  // FIXED: Activate employee
  async activateEmployee(employeeId) {
    try {
      const token = localStorage.getItem('token');
      console.log('🔍 [activateEmployee] Making API call for:', employeeId);
      
      const response = await fetch(`${API_BASE_URL}/employees/${employeeId}/activate`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include' // Important for cookies
      });

      console.log('📊 [activateEmployee] Response status:', response.status);
      
      // Handle 204 No Content responses
      if (response.status === 204) {
        console.log('✅ [activateEmployee] Success - No content (204)');
        return { success: true, message: 'Employee activated successfully' };
      }
      
      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        
        try {
          const errorText = await response.text();
          console.error('🔴 [activateEmployee] Error response:', errorText);
          
          if (errorText) {
            try {
              const errorData = JSON.parse(errorText);
              errorMessage = errorData.message || errorData.error || errorMessage;
            } catch {
              errorMessage = errorText || errorMessage;
            }
          }
        } catch (parseError) {
          console.error('🔴 [activateEmployee] Cannot read error response body');
        }
        
        throw new Error(errorMessage);
      }

      // Handle successful response
      let data;
      try {
        const responseText = await response.text();
        if (responseText) {
          data = JSON.parse(responseText);
          console.log('✅ [activateEmployee] Success response:', data);
        } else {
          data = { success: true, message: 'Employee activated successfully' };
        }
      } catch (parseError) {
        data = { success: true, message: 'Employee activated successfully' };
      }
      
      return data.data || data;
    } catch (error) {
      console.error('❌ [activateEmployee] Error:', error);
      throw error;
    }
  },

  async searchEmployees(searchTerm, page = 0, size = 5) {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/employees/search`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          searchTerm: searchTerm,
          page: page,
          size: size
        }),
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (parseError) {
          console.error('Cannot read error response body');
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      // Handle search response structure
      if (data.data && data.data.content) {
        return data.data.content;
      } else if (Array.isArray(data.data)) {
        return data.data;
      } else if (Array.isArray(data)) {
        return data;
      } else {
        return [];
      }
    } catch (error) {
      console.error('Error searching employees:', error);
      throw error;
    }
  }
};

export default EmployeeService;