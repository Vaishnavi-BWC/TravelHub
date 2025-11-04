// pages/Travel/ApprovalDetailPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTravel } from '../../contexts/TravelContext';
import { managerService } from '../../services/managerService';
import TravelRequestDetail from '../../components/travel/TravelRequestDetail/TravelRequestDetail';
import './ApprovalDetailPage.css';

const ApprovalDetailPage = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const { teamRequests } = useTravel();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  // Show message function
  const showPopupMessage = (message, type) => {
    setMessage(message);
    setMessageType(type);
    setShowMessage(true);
    setTimeout(() => {
      setShowMessage(false);
    }, 3000);
  };

  useEffect(() => {
    const fetchRequestDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // First try to find in local team requests
        const localRequest = teamRequests.find(req => 
          req.travelRequestId === requestId || req.id === requestId
        );

        if (localRequest) {
          setRequest(localRequest);
        } else {
          // If not found locally, try to fetch from API
          const approvals = await managerService.getTeamRequests();
          const apiRequest = approvals.find(req => 
            req.travelRequestId === requestId || req.id === requestId
          );
          
          if (apiRequest) {
            console.log('Fetched request from API:', apiRequest);
            setRequest(apiRequest);
          } else {
            throw new Error('Request not found');
          }
        }
      } catch (err) {
        console.error('Error fetching request detail:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRequestDetail();
  }, [requestId, teamRequests]);

  const handleApprovalAction = async (action, requestId, workflowId, requestData, remark = '') => {
    try {
      setActionLoading(true);
      console.log(`🔄 Processing ${action} action for request:`, requestId);

      if (action === 'approve') {
        await managerService.approveTeamRequest(
          requestId, 
          remark || 'Approved via detail page',
          workflowId,
          requestData
        );
        showPopupMessage('✅ Request approved successfully!', 'success');
      } else if (action === 'reject') {
        await managerService.rejectTeamRequest(
          requestId, 
          remark || 'Rejected via detail page',
          workflowId,
          requestData
        );
        showPopupMessage('❌ Request rejected successfully!', 'error');
      } else if (action === 'requestChanges') {
        // For now, we'll use reject with a specific message for changes
        await managerService.rejectTeamRequest(
          requestId, 
          `Changes requested: ${remark}`,
          workflowId,
          requestData
        );
        showPopupMessage('📝 Changes requested successfully!', 'info');
      }

      // Refresh the page data
      const approvals = await managerService.getTeamRequests();
      const updatedRequest = approvals.find(req => 
        req.travelRequestId === requestId || req.id === requestId
      );
      
      if (updatedRequest) {
        setRequest(updatedRequest);
      }

      // Navigate back after a short delay
      setTimeout(() => {
        navigate('/team-requests');
      }, 2000);

    } catch (error) {
      console.error(`Error performing ${action} action:`, error);
      showPopupMessage(`❌ Failed to ${action} request: ${error.message}`, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading request details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <h3>Unable to load request</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="approval-detail-page">
      {/* Popup Message */}
      {showMessage && (
        <div className={`message-popup ${messageType === 'success' ? 'message-success' : messageType === 'error' ? 'message-error' : 'message-info'}`}>
          <div className="message-content">
            <span className="message-icon">
              {messageType === 'success' ? '✅' : messageType === 'error' ? '❌' : '📝'}
            </span>
            <span className="message-text">{message}</span>
          </div>
        </div>
      )}

      <div className="page-header">
        <h3>Request Information Page :</h3>
      </div>

      <TravelRequestDetail
        request={request}
        isTeamRequest={true}
        onApprove={(requestId, workflowId, requestData, remark) => 
          handleApprovalAction('approve', requestId, workflowId, requestData, remark)
        }
        onReject={(requestId, workflowId, requestData, remark) => 
          handleApprovalAction('reject', requestId, workflowId, requestData, remark)
        }
        onRequestChanges={(requestId, workflowId, requestData, remark) => 
          handleApprovalAction('requestChanges', requestId, workflowId, requestData, remark)
        }
        isLoading={actionLoading}
      />
    </div>
  );
};

export default ApprovalDetailPage;