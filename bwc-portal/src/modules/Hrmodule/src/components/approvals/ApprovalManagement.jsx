import React, { useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApprovals } from '../../hooks/useApprovals';
import ApprovalList from './ApprovalList';
import ApprovalDetail from './ApprovalDetail';
import LoadingSpinner from '../common/LoadingSpinner';

// Cache configuration (matching ApprovalList)
const CACHE_KEYS = {
  APPROVALS: 'approvals_cache',
  TIMESTAMP: 'approvals_timestamp'
};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Cache utilities
const cacheUtils = {
  getCache: () => {
    try {
      const cachedData = localStorage.getItem(CACHE_KEYS.APPROVALS);
      const timestamp = localStorage.getItem(CACHE_KEYS.TIMESTAMP);
      
      if (!cachedData || !timestamp) return null;
      
      const now = Date.now();
      const cacheTime = parseInt(timestamp, 10);
      
      if (now - cacheTime > CACHE_DURATION) {
        cacheUtils.clearCache();
        return null;
      }
      
      return JSON.parse(cachedData);
    } catch (error) {
      console.error('Error reading cache:', error);
      cacheUtils.clearCache();
      return null;
    }
  },
  
  setCache: (data) => {
    try {
      localStorage.setItem(CACHE_KEYS.APPROVALS, JSON.stringify(data));
      localStorage.setItem(CACHE_KEYS.TIMESTAMP, Date.now().toString());
    } catch (error) {
      console.error('Error setting cache:', error);
    }
  },
  
  clearCache: () => {
    try {
      localStorage.removeItem(CACHE_KEYS.APPROVALS);
      localStorage.removeItem(CACHE_KEYS.TIMESTAMP);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  },
  
  isCacheValid: () => {
    try {
      const timestamp = localStorage.getItem(CACHE_KEYS.TIMESTAMP);
      if (!timestamp) return false;
      
      const now = Date.now();
      const cacheTime = parseInt(timestamp, 10);
      return now - cacheTime <= CACHE_DURATION;
    } catch (error) {
      return false;
    }
  }
};

const ApprovalManagement = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  
  const { 
    approvals, 
    loading, 
    error, 
    approveRequest, 
    rejectRequest, 
    refetch 
  } = useApprovals();

  const activeView = requestId ? 'request-detail' : 'approval-requests';
  
  // Enhanced refetch with caching
  const enhancedRefetch = useCallback(async () => {
    console.log('🔄 Enhanced refetch called');
    
    // Clear cache on manual refresh
    cacheUtils.clearCache();
    
    // Call the original refetch
    await refetch();
  }, [refetch]);

  // Enhanced approve with cache clearing
  const enhancedApproveRequest = useCallback(async (workflowId, remarks) => {
    try {
      const result = await approveRequest(workflowId, remarks);
      
      // Clear cache after successful approval to reflect changes
      cacheUtils.clearCache();
      console.log('✅ Approval successful, cache cleared');
      
      return result;
    } catch (error) {
      console.error('Error in enhanced approve:', error);
      throw error;
    }
  }, [approveRequest]);

  // Enhanced reject with cache clearing
  const enhancedRejectRequest = useCallback(async (workflowId, remarks) => {
    try {
      const result = await rejectRequest(workflowId, remarks);
      
      // Clear cache after successful rejection to reflect changes
      cacheUtils.clearCache();
      console.log('✅ Rejection successful, cache cleared');
      
      return result;
    } catch (error) {
      console.error('Error in enhanced reject:', error);
      throw error;
    }
  }, [rejectRequest]);

  // Cache the approvals data whenever it changes
  useEffect(() => {
    if (approvals && approvals.length > 0 && !loading && !error) {
      console.log('💾 Caching approvals data:', approvals.length, 'items');
      cacheUtils.setCache(approvals);
    }
  }, [approvals, loading, error]);

  // Find the selected request - use workflowId or travelRequestId for lookup
  const selectedRequest = approvals.find(req => 
    req.workflowId === requestId || req.travelRequestId === requestId || req.id === requestId
  );

  const handleRequestSelect = (request) => {
    // Navigate using workflowId for the detail view
    navigate(`/approvals/${request.workflowId || request.travelRequestId}`);
  };

  const handleBack = () => {
    navigate('/approvals');
  };

  const handleApprove = async (workflowId, remarks) => {
    try {
      await enhancedApproveRequest(workflowId, remarks);
      if (activeView === 'request-detail') {
        navigate('/approvals');
      }
    } catch (error) {
      console.error('Error approving request:', error);
      alert(`Failed to approve request: ${error.message}`);
    }
  };

  const handleReject = async (workflowId, remarks) => {
    try {
      await enhancedRejectRequest(workflowId, remarks);
      if (activeView === 'request-detail') {
        navigate('/approvals');
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert(`Failed to reject request: ${error.message}`);
    }
  };

  // Check cache on component mount and provide to useApprovals hook if needed
  useEffect(() => {
    const cachedData = cacheUtils.getCache();
    if (cachedData) {
      console.log('📦 Cache found on mount:', cachedData.length, 'items');
      // If your useApprovals hook can accept initial data, you can pass it here
      // Otherwise, the cache will be used automatically in the enhanced refetch
    }
  }, []);

  if (error) {
    return (
      <div className="content">
        <div className="error">Error: {error}</div>
        <button onClick={handleBack} className="btn btnSecondary">Back to List</button>
      </div>
    );
  }

  switch (activeView) {
    case 'approval-requests':
      return (
        <div className="content">
          <ApprovalList
            approvals={approvals}
            onRequestSelect={handleRequestSelect}
            loading={loading}
            error={error}
            onRefresh={enhancedRefetch}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        </div>
      );

    case 'request-detail':
      return (
        <ApprovalDetail
          workflowId={requestId} // Pass the workflowId from URL params
          onApprove={handleApprove}
          onReject={handleReject}
          onBack={handleBack}
          loading={loading}
        />
      );

    default:
      return null;
  }
};

export { ApprovalManagement, cacheUtils };
export default ApprovalManagement;