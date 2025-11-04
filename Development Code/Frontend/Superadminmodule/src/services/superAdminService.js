import { api } from './api';

export const SuperAdminService = {
  getSuperAdminProfile: async () => {
    try {
      const response = await api.get('/super-admin/profile');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  updateSuperAdminProfile: async (profileData) => {
    try {
      const response = await api.put('/super-admin/profile', profileData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default SuperAdminService;