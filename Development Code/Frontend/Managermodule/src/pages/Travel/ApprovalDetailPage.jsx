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

  // ENHANCED: Function to normalize and fix request data
  const normalizeRequestData = (requestData) => {
    if (!requestData) return null;

    console.log('🔄 Normalizing request data:', requestData);

    return {
      // Preserve original data
      ...requestData,

      // Ensure critical fields have values
      travelRequestId: requestData.travelRequestId || requestData.id || requestId,
      id: requestData.id || requestData.travelRequestId || requestId,

      // Fix status - if null/undefined, assume it's pending for team requests
      status: requestData.status || 'PENDING',

      // Ensure workflowId exists
      workflowId: requestData.workflowId || requestData.workflow_id,

      // Fix empty fields with defaults
      projectId: requestData.projectId || 'Not specified',
      purpose: requestData.purpose || 'Travel Request',
      destination: requestData.destination || 'Not specified',
      estimatedBudget: requestData.estimatedBudget || 0,
      managerPresent: requestData.managerPresent || false,

      // Fix dates
      startDate: requestData.startDate || new Date().toISOString().split('T')[0],
      endDate: requestData.endDate || new Date().toISOString().split('T')[0],
      createdAt: requestData.createdAt || new Date().toISOString(),
      updatedAt: requestData.updatedAt || new Date().toISOString(),

      // Employee info
      employeeName: requestData.employeeName || requestData.employee?.name || 'Unknown Employee',
      department: requestData.department || requestData.employee?.department || 'Unknown Department',

      // Ensure workflow fields
      workflow_id: requestData.workflow_id || requestData.workflowId
    };
  };

  useEffect(() => {
    const fetchRequestDetail = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('🔍 [ApprovalDetailPage] Starting fetch for request:', requestId);

        let foundRequest = null;

        // First try to find in local team requests
        if (teamRequests && teamRequests.length > 0) {
          foundRequest = teamRequests.find(req =>
            req.travelRequestId === requestId ||
            req.id === requestId ||
            (req.travelRequestId && req.travelRequestId.toString() === requestId) ||
            (req.id && req.id.toString() === requestId)
          );
          console.log('🔍 Local search result:', foundRequest);
        }

        // If not found locally, try to fetch from API
        if (!foundRequest) {
          console.log('🔍 Not found locally, fetching from API...');
          try {
            const approvals = await managerService.getTeamRequests();
            foundRequest = approvals.find(req =>
              req.travelRequestId === requestId ||
              req.id === requestId ||
              (req.travelRequestId && req.travelRequestId.toString() === requestId) ||
              (req.id && req.id.toString() === requestId)
            );
            console.log('🔍 API search result:', foundRequest);
          } catch (apiError) {
            console.error('❌ API fetch failed:', apiError);
          }
        }

        // LAST RESORT: Try to get from all travel requests
        if (!foundRequest) {
          console.log('🔍 Trying fallback: getAllTravelRequests...');
          try {
            const allRequests = await managerService.getAllTravelRequests();
            foundRequest = allRequests.find(req =>
              req.travelRequestId === requestId ||
              req.id === requestId
            );
            console.log('🔍 Fallback search result:', foundRequest);
          } catch (fallbackError) {
            console.error('❌ Fallback fetch failed:', fallbackError);
          }
        }

        if (foundRequest) {
          // NORMALIZE the data to fix missing fields
          const normalizedRequest = normalizeRequestData(foundRequest);
          console.log('✅ Normalized request:', normalizedRequest);
          setRequest(normalizedRequest);
        } else {
          // Create a minimal request object to prevent crashes
          const minimalRequest = normalizeRequestData({
            travelRequestId: requestId,
            id: requestId,
            status: 'PENDING', // Force status to PENDING
            purpose: 'Travel Request',
            projectId: 'Unknown',
            employeeName: 'Unknown Employee',
            department: 'Unknown Department'
          });
          console.log('⚠️ Using minimal request:', minimalRequest);
          setRequest(minimalRequest);
        }
      } catch (err) {
        console.error('❌ Error fetching request detail:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (requestId) {
      fetchRequestDetail();
    } else {
      setError('No request ID provided');
      setLoading(false);
    }
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
        setRequest(normalizeRequestData(updatedRequest));
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
        <button
          className="btn btn-primary"
          onClick={() => navigate('/team-requests')}
        >
          Back to Team Requests
        </button>
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
        {/* <button
          className="btn btn-secondary"
          onClick={() => navigate('/team-requests')}
          style={{ marginBottom: '15px' }}
        >
          <i className="fas fa-arrow-left"></i> Back to Team Requests
        </button> */}
        <h3>Request Information Page</h3>
      </div>

      {/* Pass the normalized request data */}
      <TravelRequestDetail
        request={request}
        isTeamRequest={true}
        onApprove={(requestId, workflowId, requestData, remark) => {
          return handleApprovalAction('approve', requestId, workflowId, requestData, remark);
        }}
        onReject={(requestId, workflowId, requestData, remark) => {
          return handleApprovalAction('reject', requestId, workflowId, requestData, remark);
        }}
        onRequestChanges={(requestId, workflowId, requestData, remark) => {
          return handleApprovalAction('requestChanges', requestId, workflowId, requestData, remark);
        }}
        isLoading={actionLoading}
      />
    </div>
  );
};

export default ApprovalDetailPage;