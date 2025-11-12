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
  // COMPREHENSIVE DEBUGGING - This will tell us exactly what's wrong
  console.log('🚨 [TRAVEL REQUEST DETAIL DEBUG]', {
    // Request Analysis
    requestExists: !!request,
    requestId: request?.travelRequestId || request?.id,
    requestStatus: request?.status,
    requestStatusType: typeof request?.status,
    
    // Props Analysis
    isTeamRequest: isTeamRequest,
    isTeamRequestType: typeof isTeamRequest,
    hasOnApprove: !!onApprove,
    hasOnReject: !!onReject,
    hasOnRequestChanges: !!onRequestChanges,
    
    // Condition Analysis
    statusIsPENDING: request?.status === 'PENDING',
    statusIsPendingLower: request?.status?.toLowerCase() === 'pending',
    statusIncludesPending: request?.status?.toUpperCase().includes('PENDING'),
    
    // Final Decision Factors
    meetsTeamCondition: isTeamRequest,
    meetsStatusCondition: request?.status === 'PENDING' || request?.status?.toLowerCase() === 'pending',
    meetsAllConditions: isTeamRequest && (request?.status === 'PENDING' || request?.status?.toLowerCase() === 'pending'),
    
    // Full Data for Investigation
    fullRequest: request,
    fullProps: { isTeamRequest, onApprove, onReject, onRequestChanges, isLoading }
  });

  if (!request) {
    return (
      <div className="error-state">
        <h2>Request Not Found</h2>
        <p>The requested travel request could not be loaded.</p>
      </div>
    );
  }

  // ENHANCED CONDITION - More flexible and robust
  const shouldShowApprovalActions = () => {
    if (!isTeamRequest) {
      console.log('❌ Cannot show actions: isTeamRequest is false');
      return false;
    }
    
    if (!request.status) {
      console.log('❌ Cannot show actions: request.status is undefined');
      return false;
    }
    
    const status = request.status.toString().toUpperCase();
    const isPending = status.includes('PENDING');
    
    console.log('🔍 Status Check:', {
      originalStatus: request.status,
      normalizedStatus: status,
      isPending: isPending
    });
    
    return isPending;
  };

  const showActions = shouldShowApprovalActions();
  console.log('🎯 FINAL DECISION - Show Approval Actions:', showActions);

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
      {/* VISUAL DEBUG PANEL - Remove after fixing */}
      {/* <div className="debug-panel" style={{
        background: '#fff3cd',
        border: '2px solid #ffc107',
        padding: '15px',
        margin: '15px 0',
        borderRadius: '8px',
        fontSize: '14px',
        fontFamily: 'monospace'
      }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#856404' }}>🔧 DEBUG PANEL</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div><strong>isTeamRequest:</strong> {isTeamRequest ? '✅ TRUE' : '❌ FALSE'}</div>
          <div><strong>Status:</strong> {request.status || 'NULL'}</div>
          <div><strong>Show Actions:</strong> {showActions ? '✅ YES' : '❌ NO'}</div>
          <div><strong>Has onApprove:</strong> {onApprove ? '✅ YES' : '❌ NO'}</div>
          <div><strong>Has onReject:</strong> {onReject ? '✅ YES' : '❌ NO'}</div>
          <div><strong>Request ID:</strong> {request.travelRequestId || request.id}</div>
        </div>
      </div> */}

      <div className="card">
        <div className="card-header-flex">
          <div>
            <h3>Travel Request ID - {request.travelRequestId}</h3>
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

      {/* ENHANCED APPROVAL ACTIONS CONDITION */}
      {showActions ? (
        <ApprovalActions
          request={request}
          onApprove={onApprove}
          onReject={onReject}
          onRequestChanges={onRequestChanges}
          isLoading={isLoading}
        />
      ) : (
        <div className="card" style={{ background: '#f8f9fa' }}>
          <div className="card-body">
            <p style={{ textAlign: 'center', color: '#6c757d', margin: 0 }}>
              <i className="fas fa-info-circle"></i> Approval actions are not available for this request.
              {!isTeamRequest && " (Not a team request)"}
              {isTeamRequest && request.status && !request.status.toString().toUpperCase().includes('PENDING') && ` (Status: ${request.status})`}
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default TravelRequestDetail;