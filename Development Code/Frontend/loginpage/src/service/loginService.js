// services/loginService.js

const API_BASE_URL = 'http://BWC-97.brainwaveconsulting.co.in:8081/api/auth/login';
const HR_APP_URL = 'http://bwc-90.brainwaveconsulting.co.in:3001/dashboard';
const Manager_App_URL = 'http://bwc-90.brainwaveconsulting.co.in:3002/';
const SUPER_ADMIN_URL = 'http://bwc-90.brainwaveconsulting.co.in:3003/';
const TRAVEL_DESK_URL = 'http://bwc-72.brainwaveconsulting.co.in:9002/';
const EMPLOYEE_URL = 'http://bwc-72.brainwaveconsulting.co.in:9000/';
const FINANCE_URL = 'http://bwc-72.brainwaveconsulting.co.in:9003/';

// Enhanced role mapping function
const mapRole = (role) => {
  const roleMap = {
    'admin': 'admin',
    'hr': 'hr',
    'manager': 'manager',
    'employee': 'employee',
    'travel_desk': 'travel_desk',
    'traveldesk': 'travel_desk',
    'finance_desk': 'finance_desk',
    'finance': 'finance_desk'
  };
  
  return roleMap[role?.toLowerCase()] || 'employee';
};

export class LoginService {
  static validateCredentials(credentials) {
    const errors = {};

    if (!credentials.email?.trim()) {
      errors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(credentials.email)) {
        errors.email = 'Please enter a valid email address';
      }
    }

    if (!credentials.password) {
      errors.password = 'Password is required';
    } else if (credentials.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors 
    };
  }

  static async performLogin(credentials) {
    try {
      console.log('🔐 Attempting login for:', credentials.email);
      
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(credentials)
      });

      console.log('📊 Login response status:', response.status);

      if (!response.ok) {
        let errorMessage = `Login failed with status: ${response.status}`;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
          console.error('🔴 Login error details:', errorData);
        // eslint-disable-next-line no-unused-vars
        } catch (parseError) {
          console.error('🔴 Cannot parse error response');
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('✅ Login successful:', result);
      return { success: true, data: result };
      
    } catch (error) {
      console.error('💥 Login error:', error);
      return { 
        success: false, 
        error: this.handleLoginError(error) 
      };
    }
  }

  static handleLoginError(error) {
    const errorMessage = error.message || 'Login failed';
    
    if (errorMessage.includes('500') || errorMessage.includes('Server error')) {
      return 'Server error. Please contact administrator or try again later.';
    } else if (errorMessage.includes('401') || errorMessage.includes('Invalid')) {
      return 'Invalid email or password. Please check your credentials.';
    } else if (errorMessage.includes('Failed to fetch') || errorMessage.includes('Network')) {
      return 'Cannot connect to server. Please check your network connection.';
    } else if (errorMessage.includes('404')) {
      return 'Service not found. Please contact administrator.';
    } else {
      return errorMessage;
    }
  }

  static storeUserData(token, userData, credentials) {
    if (token) {
      localStorage.setItem('auth_token', token);
      console.log('✅ Token stored in localStorage');
    }

    const userRole = mapRole(userData.role);
    
    const completeUserData = {
      email: credentials.email,
      role: userRole,
      roles: userData.roles || [userRole],
      loginTime: Date.now(),
      userName: userData.userName || credentials.email.split('@')[0],
      originalRole: userData.role // Keep original role for debugging
    };
    
    localStorage.setItem('user_data', JSON.stringify(completeUserData));
    console.log('✅ User data stored:', completeUserData);
    
    return completeUserData;
  }

  static prepareRedirectData(userRole, token, userData) {
    const transferData = {
      token: token,
      user: userData,
      timestamp: Date.now(),
      source: 'travel-hub-login'
    };
    
    localStorage.setItem('auth_transfer', JSON.stringify(transferData));
    
    return transferData;
  }

  static getRedirectUrl(role, token, userData) {
    const roleConfig = {
      'admin': {
        url: SUPER_ADMIN_URL,
        type: 'external',
        name: 'Super Admin'
      },
      'hr': {
        url: HR_APP_URL,
        type: 'external',
        name: 'HR'
      },
      'manager': {
        url: Manager_App_URL,
        type: 'external',
        name: 'Manager'
      },
      'employee': {
        url: EMPLOYEE_URL,
        type: 'external',
        name: 'Employee'
      },
      'travel_desk': {
        url: TRAVEL_DESK_URL,
        type: 'external',
        name: 'Travel Desk'
      },
      'finance_desk': {
        url: FINANCE_URL,
        type: 'external',
        name: 'Finance Desk'
      }
    };

    const mappedRole = mapRole(role);
    const config = roleConfig[mappedRole] || roleConfig.employee;
    
    console.log('🎯 Redirect configuration:', {
      originalRole: role,
      mappedRole: mappedRole,
      config: config
    });

    if (config.type === 'external') {
      const url = new URL(config.url);
      if (token) {
        url.searchParams.set('token', token);
      }
      url.searchParams.set('auth_source', 'travel-hub');
      url.searchParams.set('timestamp', Date.now().toString());
      url.searchParams.set('user_role', mappedRole);
      url.searchParams.set('user_email', userData.email);
      
      const finalUrl = url.toString();
      console.log('🔗 Final redirect URL:', finalUrl);
      return finalUrl;
    }
    
    return config.url;
  }

  static redirectUser(role, token, userData) {
    const redirectUrl = this.getRedirectUrl(role, token, userData);
    
    console.log('🔄 Starting redirect in 150ms...');
    
    setTimeout(() => {
      console.log('🚀 Redirecting to:', redirectUrl);
      window.location.href = redirectUrl;
    }, 150);
  }

  // Export mapRole as static method if needed elsewhere
  static mapRole = mapRole;
}

export default LoginService;