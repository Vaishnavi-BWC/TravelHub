// hooks/useLogin.js

import { useState } from 'react';
import LoginService from '../service/loginService';

export const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (credentials) => {
    setLoading(true);
    setError('');

    // Validate credentials
    const validation = LoginService.validateCredentials(credentials);
    if (!validation.isValid) {
      setError(Object.values(validation.errors)[0]);
      setLoading(false);
      return { success: false };
    }

    // Perform login
    const result = await LoginService.performLogin(credentials);
    
    if (!result.success) {
      setError(result.error);
      setLoading(false);
      return { success: false };
    }

    // Process successful login
    const loginData = result.data;
    const token = loginData.token || loginData.accessToken;

    // Store user data - this now handles role mapping internally
    const userData = LoginService.storeUserData(token, loginData, credentials);
    
    // Prepare redirect and redirect user
    LoginService.redirectUser(userData.role, token, userData);

    setLoading(false);
    return { success: true, userData };
  };

  const clearError = () => setError('');

  return {
    loading,
    error,
    handleLogin,
    clearError
  };
};