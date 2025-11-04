// components/dashboard/PendingApprovals.js
import React, { useState, useEffect } from 'react';
import { Badge } from '../common/Badge';
import { approvalService } from '../../services/approvalService'; // Import the service directly

const PendingApprovals = ({ 
  onViewAll, 
  onRequestSelect,
  onApprovalsUpdate, // Add this new prop
  limit = 3 // Make limit configurable
}) => {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingRequest, setProcessingRequest] = useState(null);

  // Fetch approvals directly when component mounts
  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  const fetchPendingApprovals = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Fetching HR approvals for dashboard...');
      
      const apiData = await approvalService.getPendingApprovals();
      console.log('✅ HR approvals fetched:', apiData);
      
      // Transform the data to match our frontend format
      const transformedData = transformApprovalData(apiData);
      setApprovals(transformedData);
      
    } catch (err) {
      console.error('❌ Error fetching HR approvals:', err);
      setError(err.message);
      setApprovals([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Transform HR API data to consistent frontend format
   */
  const transformApprovalData = (apiData) => {
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
        stage: item.currentStep || 'HR Compliance',
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
  };

  // Filter and limit pending approvals
  const pendingApprovals = approvals
    .filter(req => req.status === 'pending')
    .slice(0, limit);

  const handleQuickApprove = async (request, e) => {
    e.stopPropagation(); // Prevent row click
    
    const confirmed = window.confirm(`Are you sure you want to approve request ${request.id}?`);
    if (!confirmed) return;

    setProcessingRequest(request.id);
    try {
      console.log('✅ Approving request:', request.id);
      await approvalService.approveRequest(request.workflowId, "Approved via dashboard");
      
      // Refresh the list after successful approval
      await fetchPendingApprovals();
      
      // Notify parent to update counts
      if (onApprovalsUpdate) {
        onApprovalsUpdate();
      }
      
      // Show success message
      alert(`Request ${request.id} approved successfully!`);
      
    } catch (error) {
      console.error('Error approving request:', error);
      alert(`Failed to approve request: ${error.message}`);
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleQuickReject = async (request, e) => {
    e.stopPropagation(); // Prevent row click
    
    const reason = prompt(`Please enter reason for rejecting request ${request.id}:`);
    if (reason === null) return; // User cancelled
    
    if (!reason.trim()) {
      alert("Please provide a reason for rejection.");
      return;
    }

    setProcessingRequest(request.id);
    try {
      console.log('❌ Rejecting request:', request.id);
      await approvalService.rejectRequest(request.workflowId, reason);
      
      // Refresh the list after successful rejection
      await fetchPendingApprovals();
      
      // Notify parent to update counts
      if (onApprovalsUpdate) {
        onApprovalsUpdate();
      }
      
      // Show success message
      alert(`Request ${request.id} rejected successfully!`);
      
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert(`Failed to reject request: ${error.message}`);
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleRowClick = (request) => {
    if (onRequestSelect) {
      onRequestSelect(request);
    }
  };

  const handleRefresh = () => {
    fetchPendingApprovals();
  };

  return (
    <div className="card">
      <div className="cardHeader">
        <h3>Pending Approvals</h3>
        <div className="header-actions">
          <button 
            className="btn btnSecondary" 
            onClick={handleRefresh}
            disabled={loading}
            title="Refresh approvals"
          >
            <i className={`fas fa-refresh ${loading ? 'fa-spin' : ''}`}></i>
          </button>
          {pendingApprovals.length > 0 && (
            <button className="btn btnPrimary" onClick={onViewAll}>
              View All ({approvals.filter(req => req.status === 'pending').length})
            </button>
          )}
        </div>
      </div>
      <div className="cardBody">
        {error ? (
          <div className="error-state">
            <i className="fas fa-exclamation-triangle"></i>
            <div>
              <h4>Error Loading Approvals</h4>
              <p>{error}</p>
              <button onClick={handleRefresh} className="btn btnSecondary">
                <i className="fas fa-refresh"></i> Try Again
              </button>
            </div>
          </div>
        ) : loading ? (
          <div className="loading-state">
            <i className="fas fa-spinner fa-spin"></i>
            <span>Loading approvals...</span>
          </div>
        ) : pendingApprovals.length > 0 ? (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Type</th>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Stage</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingApprovals.map((request) => (
                  <tr 
                    key={request.id}
                    className="clickable-row"
                    onClick={() => handleRowClick(request)}
                  >
                    <td>
                      <span className="request-id">{request.id}</span>
                    </td>
                    <td>
                      <span className={`request-type ${request.type?.toLowerCase()}`}>
                        {request.type}
                      </span>
                    </td>
                    <td>
                      <div className="employee-info">
                        <strong>{request.employee?.name || 'Unknown Employee'}</strong>
                        {request.employee?.id && (
                          <small>ID: {request.employee.id}</small>
                        )}
                      </div>
                    </td>
                    <td>{request.employee?.department || 'Unknown Department'}</td>
                    <td>
                      <Badge variant={request.status}>
                        {request.status?.charAt(0).toUpperCase() + request.status?.slice(1)}
                      </Badge>
                    </td>
                    <td>
                      <span className="stage-badge">{request.stage}</span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btnIcon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRowClick(request);
                          }}
                          title="View Details"
                          disabled={loading}
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button
                          className="btnIcon btnSuccess"
                          onClick={(e) => handleQuickApprove(request, e)}
                          title="Quick Approve"
                          disabled={loading || processingRequest === request.id}
                        >
                          {processingRequest === request.id ? (
                            <i className="fas fa-spinner fa-spin"></i>
                          ) : (
                            <i className="fas fa-check-circle"></i>
                          )}
                        </button>
                        <button
                          className="btnIcon btnDanger"
                          onClick={(e) => handleQuickReject(request, e)}
                          title="Quick Reject"
                          disabled={loading || processingRequest === request.id}
                        >
                          {processingRequest === request.id ? (
                            <i className="fas fa-spinner fa-spin"></i>
                          ) : (
                            <i className="fas fa-times-circle"></i>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <i className="fas fa-check-circle"></i>
            <h4>All Caught Up!</h4>
            <p>No pending approval requests at this time.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export { PendingApprovals };
export default PendingApprovals;