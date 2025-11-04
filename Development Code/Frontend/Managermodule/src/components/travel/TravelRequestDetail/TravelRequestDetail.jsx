// components/travel/TravelRequestDetail/TravelRequestDetail.js
import React from 'react';
import ApprovalActions from '../ApprovalActions/ApprovalActions';
import './TravelRequestDetail.css';

const TravelRequestDetail = ({ 
  request, 
  isTeamRequest, 
  onApprove, 
  onReject, 
  onRequestChanges,
  isLoading = false 
}) => {
  if (!request) {
    return (
      <div className="error-state">
        <h2>Request Not Found</h2>
        <p>The requested travel request could not be loaded.</p>
      </div>
    );
  }

  const renderApprovalProcess = () => {
    if (request.status === 'DRAFT') {
      return (
        <div className="draft-notice">
          <i className="fas fa-info-circle draft-notice-icon"></i>
          <p>This is a draft request. Submit it to start the approval process.</p>
        </div>
      );
    }

    const milestones = getMilestones(request.status);
    
    return (
      <div className="approval-process">
        {milestones.map((milestone, index) => (
          <div key={index} className="milestone">
            <div className={`milestone-bubble ${milestone.status}`}></div>
            <h4>{milestone.title}</h4>
            <p className="milestone-subtitle">{milestone.subtitle}</p>
            <p className="milestone-desc">{milestone.description}</p>
            <div className="milestone-line" />
          </div>
        ))}
      </div>
    );
  };

  const getMilestones = (status) => {
    const baseMilestones = [
      {
        title: 'Request Submitted',
        subtitle: new Date(request.createdAt).toLocaleDateString(),
        description: 'Employee submitted the travel request for approval',
        status: 'completed'
      }
    ];

    switch (status) {
      case 'APPROVED':
        return [
          ...baseMilestones,
          {
            title: 'Manager Approval',
            subtitle: new Date(request.updatedAt).toLocaleDateString(),
            description: 'Request has been approved',
            status: 'completed'
          }
        ];
      
      case 'REJECTED':
        return [
          ...baseMilestones,
          {
            title: 'Manager Approval',
            subtitle: new Date(request.updatedAt).toLocaleDateString(),
            description: 'Request was rejected',
            status: 'completed'
          }
        ];
      
      default:
        return [
          ...baseMilestones,
          {
            title: 'Manager Approval',
            subtitle: 'Pending',
            description: 'Awaiting approval',
            status: 'active'
          }
        ];
    }
  };

  return (
    <>
      <div className="card">
        <div className="card-header-flex">
          <div>
            <h3>Travel Request ID - {request.travelRequestId}</h3>
            {/* <p>Request ID: {request.travelRequestId}</p> */}
            {/* {isTeamRequest && (
              <p>Employee: {request.employeeName} ({request.department})</p>
            )} */}
          </div>
          <div>
            <span className={`status ${request.status?.toLowerCase()}`}>
              {request.status === "PENDING"
                ? "Pending Approval"
                : request.status === "APPROVED"
                ? "Approved"
                : request.status === "REJECTED"
                ? "Rejected"
                : request.status === "DRAFT"
                ? "Draft"
                : request.status}
            </span>
          </div>
        </div>

        <div className="card-body-grid">
          <div>
            <h4>Trip Details</h4>
            <div className="detail-list">
              <div className="detail-item"><span>Project ID:</span><span>{request.projectId}</span></div>
              <div className="detail-item"><span>Start Date:</span><span>{request.startDate}</span></div>
              <div className="detail-item"><span>End Date:</span><span>{request.endDate}</span></div>
              <div className="detail-item"><span>Purpose:</span><span>{request.purpose}</span></div>
            </div>
          </div>
          <div>
            <h4>Additional Information</h4>
            <div className="detail-list">
              <div className="detail-item"><span>Manager Present:</span><span>{request.managerPresent ? 'Yes' : 'No'}</span></div>
              <div className="detail-item"><span>Estimated Budget:</span><span>${request.estimatedBudget || '0'}</span></div>
              <div className="detail-item"><span>Created:</span><span>{new Date(request.createdAt).toLocaleDateString()}</span></div>
              <div className="detail-item"><span>Last Updated:</span><span>{new Date(request.updatedAt).toLocaleDateString()}</span></div>
            </div>
          </div>
        </div>
      </div>

      {isTeamRequest && request.approverRemark && (
        <div className="card">
          <div className="card-header">
            <h3>Approval Details</h3>
          </div>
          <div className="card-body">
            <div className="detail-item">
              <span>Manager Remark:</span>
              <span>{request.approverRemark}</span>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h3>Approval Process</h3>
          <p>Track the progress of this request through the approval workflow</p>
        </div>
        <div className="card-body">
          {renderApprovalProcess()}
        </div>
      </div>

      {/* Show approval actions only for team requests that are pending */}
      {isTeamRequest && (request.status === 'PENDING' || request.status === 'pending') && (
        <ApprovalActions
          request={request}
          onApprove={onApprove}
          onReject={onReject}
          onRequestChanges={onRequestChanges}
          isLoading={isLoading}
        />
      )}
    </>
  );
};

export default TravelRequestDetail;