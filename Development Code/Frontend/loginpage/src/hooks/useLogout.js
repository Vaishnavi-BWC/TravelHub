// hooks/useLogout.js
import { useState } from 'react';

const LOGOUT_API_URL = 'http://BWC-97.brainwaveconsulting.co.in:8081/api/auth/logout';

export const useLogout = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogout = async () => {
    setLoading(true);
    setError('');

    try {
      console.log('🚪 Starting logout process...');
      
      // Get token for the logout request
      const token = localStorage.getItem('auth_token');
      
      // Call logout API
      const response = await fetch(LOGOUT_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        credentials: 'include'
      });

      console.log('📊 Logout response status:', response.status);

      if (!response.ok) {
        console.warn('⚠️ Logout API call failed, but continuing with client-side logout');
      }

      // Always clear local storage and redirect
      this.clearAuthData();
      
      console.log('✅ Logout successful');
      return { success: true };
      
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Even if API fails, clear local data
      this.clearAuthData();
      return { success: true }; // Still return success since we cleared local data
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line no-unused-vars
  const clearAuthData = () => {
    // Clear all authentication related data
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    localStorage.removeItem('auth_transfer');
    
    // Clear session storage as well
    sessionStorage.clear();
    
    console.log('🧹 All auth data cleared from storage');
  };

  const clearError = () => setError('');

  return {
    loading,
    error,
    handleLogout,
    clearError
  };
};

export default useLogout;