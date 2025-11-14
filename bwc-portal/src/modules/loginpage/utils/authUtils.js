// utils/authUtils.js

export const authStorage = {
  setToken: (token) => {
    if (token) {
      localStorage.setItem('auth_token', token);
    }
  },

  getToken: () => {
    return localStorage.getItem('auth_token');
  },

  setUserData: (userData) => {
    localStorage.setItem('user_data', JSON.stringify(userData));
  },

  getUserData: () => {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  },

  clearAuth: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    localStorage.removeItem('auth_transfer');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('auth_token');
  }
};

// You can remove the roleMapper export since it's now in LoginService