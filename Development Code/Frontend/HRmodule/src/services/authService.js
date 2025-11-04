// services/authService.js
const API_BASE_URL = 'http://bwc-97.brainwaveconsulting.co.in:8080/ems/api/v1';
// services/authService.js
// services/authService.js
const AUTH_API_BASE_URL = 'http://bwc-97.brainwaveconsulting.co.in:8081/api/auth';
const LOGIN_PAGE_URL = 'http://bwc-90.brainwaveconsulting.co.in:3000/';

export const authService = {
  // Proper logout that clears cookies
  async logout() {
    try {
      console.log('🚪 Starting logout with cookie clearing...');
      
      // Call logout API to clear server-side session AND cookies
      const response = await fetch(`${AUTH_API_BASE_URL}/logout`, {
        method: 'POST',
        credentials: 'include', // This is crucial for cookies
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('📊 Logout API response:', response.status);
      
      // Clear client-side storage regardless of API response
      this.clearAuthStorage();
      
      // Clear cookies by setting expired cookies
      this.clearAllCookies();
      
      console.log('✅ Logout completed with cookie clearing');
      return true;
      
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Still clear everything even if API fails
      this.clearAuthStorage();
      this.clearAllCookies();
      return true;
    }
  },

  // Clear all authentication cookies
  clearAllCookies() {
    try {
      console.log('🍪 Clearing all authentication cookies...');
      
      const cookieNames = [
        'token', 'auth-token', 'refresh-token', 'session',
        'JSESSIONID', 'auth_session', 'user_session'
      ];
      
      // Clear by setting expired dates
      cookieNames.forEach(cookieName => {
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.brainwaveconsulting.co.in;`;
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      });
      
      console.log('✅ Cookies cleared');
    } catch (error) {
      console.error('❌ Error clearing cookies:', error);
    }
  },

  // Fast storage clearing
  clearAuthStorage() {
    const authKeys = [
      'auth_token', 'token', 'user_data', 'auth_transfer',
      'userData', 'refreshToken', 'userRole', 'userId'
    ];
    
    authKeys.forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
    
    console.log('🧹 Auth storage cleared');
  },

  isAuthenticated() {
    return !!localStorage.getItem('auth_token');
  },

  getCurrentUser() {
    try {
      const userData = localStorage.getItem('user_data');
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  }
};

export default authService;