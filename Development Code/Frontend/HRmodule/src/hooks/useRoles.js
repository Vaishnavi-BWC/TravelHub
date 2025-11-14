import { useState, useEffect } from 'react';
import { rolesService } from '../services/rolesService';

export const useRoles = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      setError(null);
      const rolesData = await rolesService.getAllRoles();
      setRoles(rolesData);
    } catch (err) {
      setError(err.message);
      console.error('Error in useRoles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  return {
    roles,
    loading,
    error,
    refetch: fetchRoles
  };
};