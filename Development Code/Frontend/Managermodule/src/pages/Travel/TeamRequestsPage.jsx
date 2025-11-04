// pages/Travel/TeamRequestsPage.js
import React, { useState, useMemo, useEffect } from 'react';
import { useTravel } from '../../contexts/TravelContext';
import { useNavigation } from '../../hooks/useNavigation';
import TravelRequestList from '../../components/travel/TravelRequestList/TravelRequestList';
import { managerService } from '../../services/managerService';
import { calculateSLA } from '../../utils/helpers/calculationHelpers';
import './TeamRequestsPage.css';

const TeamRequestsPage = () => {
  const { teamRequests, loading } = useTravel();
  const { goto } = useNavigation();
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [managerApprovals, setManagerApprovals] = useState([]);
  const [managerLoading, setManagerLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'

  // Format request ID to T-lastPart
  const formatRequestId = (requestId) => {
    if (!requestId) return 'T-0000';
    
    if (typeof requestId === 'string' && requestId.startsWith('T-')) {
      return requestId;
    }
    
    const idString = requestId.toString();
    const lastPart = idString.slice(-6);
    return `T-${lastPart}`;
  };

  // Show message function
  const showPopupMessage = (message, type) => {
    setMessage(message);
    setMessageType(type);
    setShowMessage(true);
    setTimeout(() => {
      setShowMessage(false);
    }, 3000); // Auto hide after 3 seconds
  };

  // Fetch manager approvals
  useEffect(() => {
    const fetchManagerApprovals = async () => {
      try {
        setManagerLoading(true);
        setError(null);
        const approvals = await managerService.getTeamRequests();
        setManagerApprovals(approvals || []);
      } catch (err) {
        console.error('Error fetching manager approvals:', err);
        setError(err.message);
        setManagerApprovals([]);
      } finally {
        setManagerLoading(false);
      }
    };

    fetchManagerApprovals();
  }, []);

  const filteredRequests = useMemo(() => {
    let filtered = managerApprovals;

    if (filter !== 'All') {
      filtered = filtered.filter(req => 
        req.status === filter || req.status === filter.toLowerCase()
      );
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(req => {
        const formattedId = formatRequestId(req.travelRequestId || req.id);
        return (
          formattedId.toLowerCase().includes(term) ||
          req.destination?.toLowerCase().includes(term) ||
          req.employeeName?.toLowerCase().includes(term) ||
          req.employee?.name?.toLowerCase().includes(term) ||
          req.department?.toLowerCase().includes(term) ||
          req.purpose?.toLowerCase().includes(term)
        );
      });
    }

    return filtered;
  }, [managerApprovals, filter, searchTerm]);

  const handleRequestClick = (requestId) => {
    goto(`/approval-detail/${requestId}`);
  };

  // New function to handle approval actions
  const handleApprovalAction = async (action, requestId, workflowId, requestData, rejectReason = '') => {
    try {
      console.log(`🔄 Processing ${action} action for request:`, requestId);

      if (action === 'approve') {
        await managerService.approveTeamRequest(
          requestId, 
          'Approved via team requests page',
          workflowId,
          requestData
        );
        showPopupMessage('✅ Request approved successfully!', 'success');
      } else if (action === 'reject') {
        await managerService.rejectTeamRequest(
          requestId, 
          rejectReason || 'Rejected via team requests page',
          workflowId,
          requestData
        );
        showPopupMessage('❌ Request rejected successfully!', 'error');
      }

      // Refresh the data after successful action
      const updatedApprovals = await managerService.getTeamRequests();
      setManagerApprovals(updatedApprovals || []);

    } catch (error) {
      console.error(`Error performing ${action} action:`, error);
      showPopupMessage(`❌ Failed to ${action} request: ${error.message}`, 'error');
    }
  };

  const enhancedRequests = useMemo(() => {
    return filteredRequests.map(request => ({
      ...request,
      travelRequestId: request.travelRequestId || request.id,
      formattedRequestId: formatRequestId(request.travelRequestId || request.id),
      employeeName: request.employeeName || request.employee?.name,
      department: request.department || request.employee?.department,
      destination: request.destination || 'Not specified',
      currentStage: request.currentStage || 'Manager Review',
      slaStatus: calculateSLA(request.createdAt || request.submittedDate)
    }));
  }, [filteredRequests]);

  if (managerLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading team requests for approval...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <h3>Unable to load team requests</h3>
        <p>{error}</p>
        <button 
          className="btn btn-primary"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="team-requests-page">
      {/* Popup Message */}
      {showMessage && (
        <div className={`message-popup ${messageType === 'success' ? 'message-success' : 'message-error'}`}>
          <div className="message-content">
            <span className="message-icon">
              {messageType === 'success' ? '✅' : '❌'}
            </span>
            <span className="message-text">{message}</span>
          </div>
        </div>
      )}

      <div className="page-header">
        <br></br>
      </div>
      <TravelRequestList
        requests={enhancedRequests}
        filter={filter}
        onFilterChange={setFilter}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onRequestClick={handleRequestClick}
        showEmployee={true}
        showSLA={true}
        filterOptions={['All', 'PENDING', 'APPROVED', 'REJECTED']}
        searchPlaceholder="Search by employee, destination, or purpose..."
        columns={['ID', 'Employee', 'Destination', 'Dates', 'Current Stage', 'Status', 'SLA Status', 'Actions']}
        onApprove={(requestId, workflowId, requestData) => 
          handleApprovalAction('approve', requestId, workflowId, requestData)
        }
        onReject={(requestId, workflowId, requestData, rejectReason) => 
          handleApprovalAction('reject', requestId, workflowId, requestData, rejectReason)
        }
        showActions={true}
      />
    </div>
  );
};

export default TeamRequestsPage;