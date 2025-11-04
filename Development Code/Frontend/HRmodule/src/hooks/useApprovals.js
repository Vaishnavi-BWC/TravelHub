// hooks/useApprovals.js
import { useState, useEffect, useCallback } from 'react';
import { approvalService } from '../services/approvalService';

export const useApprovals = () => {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Transform HR API data to consistent frontend format
   */
  const transformApprovalData = useCallback((apiData) => {
    if (!Array.isArray(apiData)) {
      console.warn('Expected array but got:', apiData);
      return [];
    }
    
    return apiData.map(item => {
      // Format request ID as T-last 5 characters
      const originalRequestId = item.travelRequestId || item.id || 'unknown';
      const formattedRequestId = `T-${originalRequestId.slice(-5)}`;
      
      // Format dates from createdAt
      const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
          return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          });
        } catch {
          return 'Invalid Date';
        }
      };

      const createdDate = formatDate(item.createdAt);
      const dueDate = formatDate(item.dueDate);
      const dates = dueDate !== 'N/A' ? `${createdDate} - ${dueDate}` : createdDate;

      return {
        id: formattedRequestId,
        travelRequestId: item.travelRequestId,
        workflowId: item.workflowId,
        type: 'travel',
        title: 'Travel Request Approval',
        employee: {
          name: 'Unknown Employee',
          id: 'N/A',
          department: 'Unknown Department'
        },
        dates: dates,
        details: 'Travel request pending HR compliance check',
        status: (item.status?.toLowerCase() || 'pending'),
        stage: item.currentStep || 'HR_COMPLIENCE',
        approverRemark: item.comments || '',
        createdAt: item.createdAt,
        priority: (item.priority?.toLowerCase() || 'medium'),
        workflowType: item.workflowType,
        currentStep: item.currentStep,
        currentApproverRole: item.currentApproverRole,
        nextStep: item.nextStep,
        previousStep: item.previousStep,
        estimatedCost: item.estimatedCost,
        actualCost: item.actualCost,
        isOverpriced: item.isOverpriced,
        overpricedReason: item.overpricedReason,
        dueDate: item.dueDate,
        completedAt: item.completedAt,
        _original: item
      };
    });
  }, []);

  /**
   * Load HR pending approvals with enhanced error handling
   */
  const loadApprovals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Fetching HR pending approvals...');
      const apiData = await approvalService.getPendingApprovals();
      console.log('✅ HR Pending approvals raw response:', apiData);
      
      const transformedData = transformApprovalData(apiData);
      console.log('✅ Transformed HR approvals:', transformedData);
      setApprovals(transformedData);
      
      return transformedData;
      
    } catch (err) {
      console.error('❌ Error loading HR approvals:', err);
      
      let errorMessage = err.message;
      
      if (err.message.includes('403')) {
        errorMessage = 'Access denied. HR permissions required to view approval requests.';
      } else if (err.message.includes('401')) {
        errorMessage = 'Session expired. Please login again.';
      } else if (err.message.includes('Failed to fetch')) {
        errorMessage = 'Unable to connect to HR approval service. Please try again later.';
      } else if (err.message.includes('CORS')) {
        errorMessage = 'Cannot access HR approval service due to security restrictions. Please contact administrator.';
      }
      
      setError(errorMessage);
      setApprovals([]);
      
      return [];
    } finally {
      setLoading(false);
    }
  }, [transformApprovalData]);

  /**
   * Approve a HR request with workflow ID
   */
  const approveRequest = useCallback(async (requestId, remarks) => {
    try {
      setLoading(true);
      
      // Find the original request to get workflowId
      const originalRequest = approvals.find(req => req.id === requestId);
      if (!originalRequest) {
        throw new Error('Request not found');
      }

      // Optimistic update
      setApprovals(prev => prev.map(req => 
        req.id === requestId 
          ? { ...req, status: 'approved', approverRemark: remarks }
          : req
      ));

      const result = await approvalService.approveRequest(
        originalRequest.workflowId,
        remarks
      );
      console.log('✅ HR Request approved:', result);
      
      await loadApprovals();
      
      return result;
      
    } catch (err) {
      await loadApprovals();
      throw err;
    } finally {
      setLoading(false);
    }
  }, [approvals, loadApprovals]);

  /**
   * Reject a HR request with workflow ID
   */
  const rejectRequest = useCallback(async (requestId, remarks) => {
    try {
      setLoading(true);
      
      // Find the original request to get workflowId
      const originalRequest = approvals.find(req => req.id === requestId);
      if (!originalRequest) {
        throw new Error('Request not found');
      }

      // Optimistic update
      setApprovals(prev => prev.map(req => 
        req.id === requestId 
          ? { ...req, status: 'rejected', approverRemark: remarks }
          : req
      ));

      const result = await approvalService.rejectRequest(
        originalRequest.workflowId,
        remarks
      );
      console.log('✅ HR Request rejected:', result);
      
      await loadApprovals();
      
      return result;
      
    } catch (err) {
      await loadApprovals();
      throw err;
    } finally {
      setLoading(false);
    }
  }, [approvals, loadApprovals]);

  // Load approvals on mount
  useEffect(() => {
    loadApprovals();
  }, [loadApprovals]);

  return {
    // State
    approvals,
    loading,
    error,
    
    // Actions
    approveRequest,
    rejectRequest,
    refetch: loadApprovals,
    
    // Utilities
    clearError: () => setError(null)
  };
};

export default useApprovals;