import React from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Make sure this import is correct
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
  const selectedRequest = approvals.find(req => req.id === requestId);

  const handleRequestSelect = (request) => {
    navigate(`/approvals/${request.id}`);
  };

  const handleBack = () => {
    navigate('/approvals');
  };

  const handleApprove = async (requestId, remarks) => {
    try {
      await approveRequest(requestId, remarks);
      if (activeView === 'request-detail') {
        navigate('/approvals');
      }
    } catch (error) {
      console.error('Error approving request:', error);
      alert(`Failed to approve request: ${error.message}`);
    }
  };

  const handleReject = async (requestId, remarks) => {
    try {
      await rejectRequest(requestId, remarks);
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

  // Remove the loading check that was returning LoadingSpinner here

  switch (activeView) {
    case 'approval-requests':
      return (
        <div className="content">
          <ApprovalList
            approvals={approvals}
            onRequestSelect={handleRequestSelect}
            loading={loading} // Pass loading prop to ApprovalList
            error={error}
            onRefresh={refetch}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        </div>
      );

    case 'request-detail':
      if (!selectedRequest) {
        return (
          <div className="content">
            <div className="error">Request not found</div>
            <button onClick={handleBack} className="btn btnSecondary">Back to List</button>
          </div>
        );
      }

      return (
        <ApprovalDetail
          request={selectedRequest}
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