import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApprovals } from '../../hooks/useApprovals';
import ApprovalList from './ApprovalList';
import ApprovalDetail from './ApprovalDetail';
import LoadingSpinner from '../common/LoadingSpinner';

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
      await approveRequest(workflowId, remarks);
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
      await rejectRequest(workflowId, remarks);
      if (activeView === 'request-detail') {
        navigate('/approvals');
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert(`Failed to reject request: ${error.message}`);
    }
  };

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
            onRefresh={refetch}
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

export { ApprovalManagement };
export default ApprovalManagement;