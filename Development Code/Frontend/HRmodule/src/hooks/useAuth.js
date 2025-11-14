// hooks/useAuth.js
import { useState, useCallback } from 'react';
import { authService } from '../services/authService';

const LOGIN_PAGE_URL = 'http://bwc-90.brainwaveconsulting.co.in:3000/';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const logout = useCallback(async (options = {}) => {
    const {
      showConfirmation = true,
      redirectTo = LOGIN_PAGE_URL,
      forceRedirect = true
    } = options;

    try {
      if (showConfirmation && !window.confirm('Are you sure you want to logout?')) {
        return;
      }

      setLoading(true);
      setError(null);

      console.log('🔜 Starting enhanced logout process...');
      
      // Perform logout (this clears cookies and storage)
      await authService.logout();
      
      console.log('🔄 Performing hard redirect to clear everything...');
      
      // Force hard redirect to ensure complete logout
      if (forceRedirect) {
        // Method 1: Simple redirect (usually works)
        window.location.href = redirectTo;
        
        // Method 2: Fallback - force reload after a delay
        setTimeout(() => {
          window.location.replace(redirectTo);
        }, 100);
      }
      
    } catch (err) {
      console.error('❌ Logout error:', err);
      setError(err.message);
      
      // Nuclear option - clear everything and force redirect
      authService.clearAuthStorage();
      authService.clearAllCookies();
      window.location.href = redirectTo;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const isAuthenticated = useCallback(() => {
    return authService.isAuthenticated();
  }, []);

  const getCurrentUser = useCallback(() => {
    return authService.getCurrentUser();
  }, []);

  return {
    loading,
    error,
    logout,
    clearError,
    isAuthenticated,
    getCurrentUser
  };
};

export default useAuth;