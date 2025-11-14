// components/dashboard/PendingApprovals.js
import React, { useState, useEffect } from 'react';
import { Badge } from '../common/Badge';
import { approvalService } from '../../services/approvalService';

const PendingApprovals = ({ 
  onViewAll, 
  onRequestSelect,
  onApprovalsUpdate,
  limit = 3
}) => {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingRequest, setProcessingRequest] = useState(null);

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
      
      // Use API data directly
      setApprovals(apiData || []);
      
    } catch (err) {
      console.error('❌ Error fetching HR approvals:', err);
      setError(err.message);
      setApprovals([]);
    } finally {
      setLoading(false);
    }
  };

  // Format request ID as T-last 5 characters
  const formatRequestId = (travelRequestId) => {
    if (!travelRequestId) return 'N/A';
    return `T-${travelRequestId.slice(-5)}`;
  };

  // Format budget display
  const formatBudget = (budget) => {
    if (!budget) return '$0';
    return `$${budget}`;
  };

  // Filter and limit pending approvals
  const pendingApprovals = (approvals || [])
    .filter(req => !req.status || req.status.toLowerCase() === 'pending')
    .slice(0, limit);

  const handleQuickApprove = async (request, e) => {
    e.stopPropagation();
    
    const formattedId = formatRequestId(request.travelRequestId);
    const confirmed = window.confirm(`Are you sure you want to approve request ${formattedId}?`);
    if (!confirmed) return;

    setProcessingRequest(request.travelRequestId);
    try {
      console.log('✅ Approving request:', request.travelRequestId);
      await approvalService.approveRequest(request.workflowId, "Approved via dashboard");
      
      await fetchPendingApprovals();
      
      if (onApprovalsUpdate) {
        onApprovalsUpdate();
      }
      
      alert(`Request ${formattedId} approved successfully!`);
      
    } catch (error) {
      console.error('Error approving request:', error);
      alert(`Failed to approve request: ${error.message}`);
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleQuickReject = async (request, e) => {
    e.stopPropagation();
    
    const formattedId = formatRequestId(request.travelRequestId);
    const reason = prompt(`Please enter reason for rejecting request ${formattedId}:`);
    if (reason === null) return;
    
    if (!reason.trim()) {
      alert("Please provide a reason for rejection.");
      return;
    }

    setProcessingRequest(request.travelRequestId);
    try {
      console.log('❌ Rejecting request:', request.travelRequestId);
      await approvalService.rejectRequest(request.workflowId, reason);
      
      await fetchPendingApprovals();
      
      if (onApprovalsUpdate) {
        onApprovalsUpdate();
      }
      
      alert(`Request ${formattedId} rejected successfully!`);
      
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
              View All ({approvals.filter(req => !req.status || req.status.toLowerCase() === 'pending').length})
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
                  <th>Purpose</th>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Budget</th>
                  <th>Destination</th>
                  <th>Stage</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingApprovals.map((request) => (
                  <tr 
                    key={request.travelRequestId}
                    className="clickable-row"
                    onClick={() => handleRowClick(request)}
                  >
                    <td>
                      <span className="request-id">
                        {formatRequestId(request.travelRequestId)}
                      </span>
                    </td>
                    <td>
                      <span className={`request-type ${request.purpose?.toLowerCase()}`}>
                        {request.purpose}
                      </span>
                    </td>
                    <td>
                      <div className="employee-info">
                        <strong>{request.employeeName}</strong>
                      </div>
                    </td>
                    <td>{request.employeeDepartment}</td>
                    <td>{formatBudget(request.estimatedBudget)}</td>
                    <td>{request.travelDestination || 'N/A'}</td>
                    <td>
                      <span className="stage-badge">{request.currentStep}</span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-sm1"
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
                          className="btn-sm1 btnSuccess"
                          onClick={(e) => handleQuickApprove(request, e)}
                          title="Quick Approve"
                          disabled={loading || processingRequest === request.travelRequestId}
                        >
                          {processingRequest === request.travelRequestId ? (
                            <i className="fas fa-spinner fa-spin"></i>
                          ) : (
                            <i className="fas fa-check"></i>
                          )}
                        </button>
                         {/* <button
                             // onClick={() => handleRequestChange(
                               // exception.exceptionId || exception.id,
                                //exception.employeeName || exception.employee?.name
                              //)}
                              //disabled={actionLoading}
                              className="btn-sm1"
                              title="Request Changes"
                            >
                              <i className="fas fa-edit"></i>
                            </button> */}
                        <button
                          className="btn-sm1 btnDanger"
                          onClick={(e) => handleQuickReject(request, e)}
                          title="Quick Reject"
                          disabled={loading || processingRequest === request.travelRequestId}
                        >
                          {processingRequest === request.travelRequestId ? (
                            <i className="fas fa-spinner fa-spin"></i>
                          ) : (
                            <i className="fas fa-times"></i>
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