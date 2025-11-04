// hooks/useAuth.js
import { useState, useCallback, useMemo } from 'react';
import { authService } from '../services/authService';

// Constants for better maintainability
const AUTH_CONSTANTS = {
  LOGIN_PAGE_URL: 'http://bwc-90.brainwaveconsulting.co.in:3000/',
  LOGOUT_TIMEOUT: 100,
  DEFAULT_OPTIONS: {
    showConfirmation: true,
    redirectTo: 'http://bwc-90.brainwaveconsulting.co.in:3000/',
    forceRedirect: true
  }
};

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const logout = useCallback(async (options = {}) => {
    const config = { ...AUTH_CONSTANTS.DEFAULT_OPTIONS, ...options };

    try {
      if (config.showConfirmation && !window.confirm('Are you sure you want to logout?')) {
        return;
      }

      setLoading(true);
      setError(null);

      console.log('🔜 Starting enhanced logout process...');
      
      await authService.logout();
      
      console.log('🔄 Performing hard redirect to clear everything...');
      
      if (config.forceRedirect) {
        window.location.href = config.redirectTo;
        
        // Fallback redirect
        setTimeout(() => {
          window.location.replace(config.redirectTo);
        }, AUTH_CONSTANTS.LOGOUT_TIMEOUT);
      }
      
    } catch (err) {
      console.error('❌ Logout error:', err);
      setError(err.message);
      
      // Emergency cleanup and redirect
      authService.clearAuthStorage();
      authService.clearAllCookies();
      window.location.href = config.redirectTo;
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

  // Memoize the returned object to prevent unnecessary re-renders
  return useMemo(() => ({
    loading,
    error,
    logout,
    clearError,
    isAuthenticated,
    getCurrentUser
  }), [loading, error, logout, clearError, isAuthenticated, getCurrentUser]);
};

export default useAuth;