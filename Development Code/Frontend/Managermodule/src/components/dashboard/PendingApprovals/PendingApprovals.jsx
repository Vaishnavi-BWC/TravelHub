// components/dashboard/PendingApprovals/PendingApprovals.js
import React, { useState } from 'react';
import { useNavigation } from '../../../hooks/useNavigation';
import { calculateSLA } from '../../../utils/helpers/calculationHelpers';
import './PendingApprovals.css';

const PendingApprovals = ({
  requests,
  onViewAll,
  isLoading = false,
  onApprove,
  onReject
}) => {
  const { goto } = useNavigation();
  const [showRejectPopup, setShowRejectPopup] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const handleRowClick = (requestId) => {
    goto(`/approval-detail/${requestId}`);
  };

  const handleQuickApprove = async (e, request) => {
    e.stopPropagation();
    if (onApprove && window.confirm('Are you sure you want to approve this request?')) {
      await onApprove(
        request.travelRequestId || request.id,
        request.workflowId || request.workflow_id,
        request
      );
    }
  };

  const handleQuickReject = (e, request) => {
    e.stopPropagation();
    setSelectedRequest(request);
    setRejectReason('');
    setShowRejectPopup(true);
  };

  const handleRejectConfirm = async () => {
    if (!rejectReason.trim()) {
      alert('Please enter a reason for rejection.');
      return;
    }

    if (onReject && selectedRequest) {
      await onReject(
        selectedRequest.travelRequestId || selectedRequest.id,
        selectedRequest.workflowId || selectedRequest.workflow_id,
        selectedRequest,
        rejectReason
      );
      setShowRejectPopup(false);
      setSelectedRequest(null);
      setRejectReason('');
    }
  };

  const handleRejectCancel = () => {
    setShowRejectPopup(false);
    setSelectedRequest(null);
    setRejectReason('');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getSlaStatus = (createdAt) => {
    const slaStatus = calculateSLA(createdAt);
    if (slaStatus === 'Overdue') return 'sla-urgent';
    if (slaStatus === 'Due Soon') return 'sla-warning';
    return 'sla-normal';
  };

  if (isLoading) {
    return (
      <div className="card pending-approvals-card">
        <div className="card-header">
          <h3>Pending Your Approval</h3>
        </div>
        <div className="card-body">
          <div className="pending-approvals-loading">
            <div className="pending-approvals-spinner"></div>
            <p>Loading pending approvals...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card pending-approvals-card">
      {/* Reject Popup Modal */}
      {showRejectPopup && (
        <div className="reject-popup-overlay">
          <div className="reject-popup-modal">
            <div className="reject-popup-header">
              <h3>Reject Request</h3>
              <button 
                className="reject-popup-close"
                onClick={handleRejectCancel}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="reject-popup-body">
              <p>Please provide a reason for rejecting this request:</p>
              <textarea
                className="reject-reason-textarea"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter rejection reason..."
                rows="4"
              />
            </div>
            <div className="reject-popup-footer">
              <button
                className="btn btn-secondary"
                onClick={handleRejectCancel}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={handleRejectConfirm}
                disabled={!rejectReason.trim()}
              >
                Reject Request
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="card-header">
        <h3>Pending Your Approval</h3>
        {requests.length > 0 && (
          <button className="btn btn-primary" onClick={onViewAll}>
            <i className="fas fa-eye"></i> View All ({requests.length})
          </button>
        )}
      </div>
      <div className="card-body">
        <div className="pending-approvals-table-container">
          <table className="pending-approvals-table">
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Employee</th>
                <th>Purpose</th>
                <th>Dates</th>
                <th>Budget</th>
                <th>SLA Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.length > 0 ? (
                requests.slice(0, 3).map((request) => (
                  <tr
                    key={request.travelRequestId || request.id}
                    className="pending-approvals-row clickable-row"
                    onClick={() => handleRowClick(request.travelRequestId || request.id)}
                  >
                    <td className="pending-approvals-request-id">
                      {request.formattedRequestId || `T-${(request.travelRequestId || request.id)?.toString().slice(-6)}`}
                    </td>
                    <td>
                      <div className="pending-approvals-employee-info">
                        <div className="pending-approvals-employee-name">
                          {request.employeeName || request.employee?.name || 'Unknown'}
                        </div>
                        {request.department && (
                          <div className="pending-approvals-employee-dept">{request.department}</div>
                        )}
                      </div>
                    </td>
                    <td className="pending-approvals-purpose">
                      {request.purpose?.length > 50
                        ? `${request.purpose.substring(0, 50)}...`
                        : request.purpose || 'No purpose provided'
                      }
                    </td>
                    <td className="pending-approvals-dates">
                      {formatDate(request.startDate)} - {formatDate(request.endDate)}
                    </td>
                    <td className="pending-approvals-budget">
                      ${request.estimatedBudget?.toLocaleString() || '0'}
                    </td>
                    <td>
                      <span className={`pending-approvals-sla-status ${getSlaStatus(request.createdAt)}`}>
                        {calculateSLA(request.createdAt)}
                      </span>
                    </td>
                    <td>
                      <div className="pending-approvals-action-buttons">
                        <button
                          className="pending-approvals-btn-icon pending-approvals-btn-success"
                          onClick={(e) => handleQuickApprove(e, request)}
                          title="Quick Approve"
                        >
                          <i className="fas fa-check"></i>
                        </button>
                        <button
                          className="pending-approvals-btn-icon pending-approvals-btn-danger"
                          onClick={(e) => handleQuickReject(e, request)}
                          title="Quick Reject"
                        >
                          <i className="fas fa-times"></i>
                        </button>
                        <button
                          className="pending-approvals-btn-icon pending-approvals-btn-info"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRowClick(request.travelRequestId || request.id);
                          }}
                          title="Review Details"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="pending-approvals-empty-row">
                  <td colSpan="7" className="pending-approvals-empty-cell">
                    <div className="pending-approvals-empty-state">
                      <div className="pending-approvals-empty-icon">
                        <i className="fas fa-check-circle"></i>
                      </div>
                      <div className="pending-approvals-empty-content">
                        <h4>All Caught Up!</h4>
                        <p>No pending requests for approval at this time.</p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PendingApprovals;