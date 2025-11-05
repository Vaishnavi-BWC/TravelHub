// hooks/useManagers.js
import { useState, useEffect } from 'react';

export const useManagers = () => {
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadManagers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const response = await fetch(
        'http://bwc-97.brainwaveconsulting.co.in:8080/ems/api/v1/employees/role/Manager',
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      let managersData = [];
      if (data.data && Array.isArray(data.data)) {
        managersData = data.data;
      } else if (Array.isArray(data)) {
        managersData = data;
      }

      const formattedManagers = managersData.map(manager => ({
        managerId: manager.employeeId,
        fullName: manager.fullName,
        email: manager.email,
        department: manager.department
      }));

      setManagers(formattedManagers);
      return formattedManagers;
    } catch (err) {
      console.error('Error loading managers:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadManagers();
  }, []);

  return {
    managers,
    loading,
    error,
    loadManagers
  };
};

export default {useManagers};