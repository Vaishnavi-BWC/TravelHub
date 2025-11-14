// components/travel/ApprovalActions/ApprovalActions.js
import React, { useState } from 'react';
import './ApprovalActions.css';

const ApprovalActions = ({ 
  request, 
  onApprove, 
  onReject, 
  onRequestChanges,
  isLoading = false 
}) => {
  const [approvalRemark, setApprovalRemark] = useState('');

  const handleApprove = async () => {
    if (!approvalRemark.trim()) {
      alert('Please add a remark before approving.');
      return;
    }

    if (onApprove) {
      await onApprove(
        request.travelRequestId || request.id,
        request.workflowId || request.workflow_id,
        request,
        approvalRemark
      );
      setApprovalRemark('');
    }
  };

  const handleReject = async () => {
    if (!approvalRemark.trim()) {
      alert('Please provide a reason for rejection.');
      return;
    }

    if (onReject) {
      await onReject(
        request.travelRequestId || request.id,
        request.workflowId || request.workflow_id,
        request,
        approvalRemark
      );
      setApprovalRemark('');
    }
  };

  const handleRequestChanges = async () => {
    if (!approvalRemark.trim()) {
      alert('Please specify the changes needed.');
      return;
    }

    if (onRequestChanges) {
      await onRequestChanges(
        request.travelRequestId || request.id,
        request.workflowId || request.workflow_id,
        request,
        approvalRemark
      );
      setApprovalRemark('');
    }
  };

  return (
    <div className="card approval-actions-card">
      <div className="card-header">
        <h3>Manager Approval</h3>
        <p>Approve, reject, or request changes for this travel request</p>
      </div>
      <div className="card-body">
        <div className="form-group-fullremark">
          <label>Remark *</label>
          <textarea 
            value={approvalRemark} 
            onChange={(e) => setApprovalRemark(e.target.value)}
            className="form-control" 
            rows="3" 
            placeholder="Enter your approval remark, reason for rejection, or requested changes" 
            disabled={isLoading}
            required
          />
        </div>
        <div className="approval-actions-buttons">
          <button 
            onClick={handleReject}
            disabled={isLoading || !approvalRemark.trim()}
            className="btn btn-reject"
          >
            <i className="fas fa-ban"></i> Reject
          </button>
          <button 
            onClick={handleRequestChanges}
            disabled={isLoading || !approvalRemark.trim()}
            className="btn btn-warning"
          >
            <i className="fas fa-edit"></i> Request Changes
          </button>
          <button 
            onClick={handleApprove}
            disabled={isLoading || !approvalRemark.trim()}
            className="btn btn-success"
          >
            <i className="fas fa-check"></i> Approve
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApprovalActions;