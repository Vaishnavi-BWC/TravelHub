import { useState, useEffect } from 'react';
import { dashboardService } from '../services/dashboardService';

export const useDashboard = () => {
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const stats = await dashboardService.getDashboardStats();
      setDashboardStats(stats);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardStats();
  }, []);

  return {
    dashboardStats,
    loading,
    error,
    refetch: loadDashboardStats
  };
};