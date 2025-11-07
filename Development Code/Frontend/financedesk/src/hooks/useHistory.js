// hooks/useHistory.js
import { useState, useEffect } from 'react';
import { fetchApprovalHistory, transformHistoryData } from '../services/historyService.js';

export const useHistory = () => {
  const [historyRequests, setHistoryRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHistoryData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const apiData = await fetchApprovalHistory();
      console.log('📊 History data received:', apiData);
      
      const transformedData = transformHistoryData(apiData);
      setHistoryRequests(transformedData);
      
    } catch (err) {
      console.error('Error fetching history:', err);
      setError(`Failed to load history: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const refreshHistory = () => {
    fetchHistoryData();
  };

  useEffect(() => {
    fetchHistoryData();
  }, []);

  return {
    historyRequests,
    loading,
    error,
    refreshHistory,
    setHistoryRequests
  };
};