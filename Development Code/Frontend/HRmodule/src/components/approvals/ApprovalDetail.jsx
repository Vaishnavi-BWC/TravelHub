import React, { useState, useEffect } from 'react';
import Badge from '../common/Badge';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { approvalService } from '../../services/approvalService';
import './ApprovalDetail.css'

const ApprovalDetail = ({ workflowId, onApprove, onReject, onBack, loading = false }) => {
  const [remark, setRemark] = useState("");
  const [workflow, setWorkflow] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (workflowId) fetchDetails();
  }, [workflowId]);

  const fetchDetails = async () => {
    try {
      setLoadingDetail(true);
      setError(null);
      const data = await approvalService.getWorkflowDetail(workflowId);
      setWorkflow(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Function to format travel request ID as T-last5letters
  const formatTravelRequestId = (id) => {
    if (!id) return 'N/A';
    const lastFiveChars = id.slice(-5);
    return `T-${lastFiveChars}`;
  };

  const handleApprove = () => {
    if (!remark.trim()) return alert("Please add remarks");
    onApprove(workflowId, remark);
    setRemark("");
  };

  const handleReject = () => {
    if (!remark.trim()) return alert("Please add remarks");
    onReject(workflowId, remark);
    setRemark("");
  };

  if (loadingDetail) return <LoadingSpinner text="Loading details..." />;

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          {error}
        </div>
        <div className="action-buttons">
          <button onClick={onBack} className="btn btn-outline">Back</button>
          <button onClick={fetchDetails} className="btn btn-primary">Retry</button>
        </div>
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="error-container">
        <div className="error-message">No data found</div>
        <button onClick={onBack} className="btn btn-outline">Back to List</button>
      </div>
    );
  }

  const canTakeAction = workflow.status === 'PENDING' || workflow.status === 'IN_PROGRESS';

  // Filter steps to show only up to HR approval
  const hrStepIndex = workflow.steps?.findIndex(step => 
    step.approverRole === 'HR' || step.stepName === 'HR_APPROVAL'
  );
  
  const stepsToShow = workflow.steps?.slice(0, (hrStepIndex !== -1 ? hrStepIndex + 1 : workflow.steps.length)) || [];

  return (
    <div className="approval-detail">
      {/* <div className="detail-header">
        <button onClick={onBack} className="btn btn-back">
          <i className="fas fa-arrow-left"></i> Back
        </button>
        <h1>Request Details</h1>
      </div> */}

      <div className="detail-card">
        <h2>Basic Information</h2>
        <div className="info-grid">
          <InfoItem label="Request ID" value={formatTravelRequestId(workflow.travelRequestId)} />
          <InfoItem label="Employee" value={workflow.employeeName} />
          <InfoItem label="Department" value={workflow.employeeDepartment} />
          <InfoItem label="Type" value={workflow.workflowType} />
          <InfoItem label="Status" value={<Badge variant={workflow.status?.toLowerCase()}>{workflow.status}</Badge>} />
          <InfoItem label="Current Stage" value={workflow.currentStep} />
        </div>
      </div>

      <div className="detail-card">
        <h2>Approval Progress</h2>
        <div className="steps-timeline">
          {stepsToShow.map((step, index) => {
            const stepActions = workflow.actions?.filter(action => 
              action.stepName === step.stepName
            ) || [];
            
            return (
              <StepTimelineItem 
                key={step.stepName} 
                step={step} 
                actions={stepActions}
                index={index}
                isLast={index === stepsToShow.length - 1}
              />
            );
          })}
        </div>
      </div>

      {canTakeAction && (
        <div className="detail-card">
          <h2>Take Action</h2>
          <textarea
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            placeholder="Enter your approval remarks or reason for rejection..."
            rows="3"
            disabled={loading}
          />
          <div className="action-buttons1">
            <button onClick={handleReject} className="btn1 btn-danger" disabled={loading || !remark.trim()}>
              Reject
            </button>
            <button onClick={handleApprove} className="btn1 btn-success" disabled={loading || !remark.trim()}>
              Approve
            </button>
             <button onClick={onBack} className="btn1 btn-back">
          Back
        </button>
          </div>
        </div>
      )}

      {!canTakeAction && (
        <div className="detail-card status-card">
          <div className="status-icon">
            <i className={`fas fa-${workflow.status?.includes('APPROVED') ? 'check' : 'times'}-circle`}></i>
          </div>
          <div className="status-content">
            <h3>Request {workflow.status}</h3>
            <p>This request has been processed.</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper Components
const InfoItem = ({ label, value }) => (
  <div className="info-item">
    <span className="label">{label}:</span>
    <span className="value">{value}</span>
  </div>
);

const StepTimelineItem = ({ step, actions, index, isLast }) => {
  const getStepIcon = (status) => {
    switch (status) {
      case 'COMPLETED': return 'fas fa-check-circle';
      case 'REJECTED': return 'fas fa-times-circle';
      case 'PENDING': return 'fas fa-clock';
      default: return 'fas fa-circle';
    }
  };

  const getStepColor = (status) => {
    switch (status) {
      case 'COMPLETED': return '#28a745';
      case 'REJECTED': return '#dc3545';
      case 'PENDING': return '#6c757d';
      default: return '#3498db';
    }
  };

  return (
    <div className="step-timeline-item">
      <div className="step-marker">
        <div 
          className="step-icon"
          style={{ backgroundColor: getStepColor(step.status) }}
        >
          <i className={getStepIcon(step.status)}></i>
        </div>
        {!isLast && <div className="step-connector"></div>}
      </div>
      
      <div className="step-content">
        <div className="step-main">
          <div className="step-info">
            <h4>{step.stepName.replace(/_/g, ' ')}</h4>
            <span className="step-role">{step.approverRole}</span>
          </div>
          <div className="step-meta">
            <Badge variant={step.status?.toLowerCase()}>{step.status}</Badge>
            {step.completedAt && (
              <span className="step-date">
                {new Date(step.completedAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        {actions.length > 0 && (
          <div className="step-actions">
            {actions.map((action, actionIndex) => (
              <StepAction key={actionIndex} action={action} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const StepAction = ({ action }) => (
  <div className="step-action">
    <div className="action-main">
      <div className="action-left">
        <div className="action-decision">
          <Badge variant={action.decision?.toLowerCase()}>{action.decision}</Badge>
        </div>
        <div className="action-details">
          <span className="action-actor">{action.actorRole}</span>
          <span className="action-date">
            {new Date(action.actionTakenAt).toLocaleDateString()}
          </span>
        </div>
      </div>
      {action.comments && (
        <div className="action-comment">
          <i className="fas fa-comment"></i>
          {action.comments}
        </div>
      )}
    </div>
  </div>
);

export { ApprovalDetail };
export default ApprovalDetail;