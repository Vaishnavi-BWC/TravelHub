// pages/Dashboard/DashboardPage.js
import React, { useState, useEffect } from 'react';
import { useTravel } from '../../contexts/TravelContext';
import { useNavigation } from '../../hooks/useNavigation';
import StatsCards from '../../components/dashboard/StatsCards/StatsCards';
import QuickActions from '../../components/dashboard/QuickActions/QuickActions';
import PendingApprovals from '../../components/dashboard/PendingApprovals/PendingApprovals';
import RecentRequests from '../../components/dashboard/RecentRequests/RecentRequests';
import { managerService } from '../../services/managerService';
import './DashboardPage.css';

const DashboardPage = () => {
  const { personalRequests, teamRequests, loading, refreshData } = useTravel();
  const { goto } = useNavigation();
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [approvalsLoading, setApprovalsLoading] = useState(true);
  const [approvalsError, setApprovalsError] = useState(null);
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [totalMyRequestsCount, setTotalMyRequestsCount] = useState(0);

  // Fetch total my requests count
  useEffect(() => {
    const fetchTotalMyRequestsCount = async () => {
      try {
        const allRequests = await managerService.getTravelRequestsFilteredByEmployee();
        setTotalMyRequestsCount(allRequests.length);
      } catch (error) {
        console.error('Error fetching total requests count:', error);
        // Fallback to current personalRequests length if API call fails
        setTotalMyRequestsCount(personalRequests.length);
      }
    };

    if (!loading) {
      fetchTotalMyRequestsCount();
    }
  }, [loading, personalRequests.length]);

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
    }, 3000);
  };

  // Fetch pending approvals specifically for manager
  useEffect(() => {
    const fetchPendingApprovals = async () => {
      try {
        setApprovalsLoading(true);
        setApprovalsError(null);
        const approvals = await managerService.getTeamRequests();
        setPendingApprovals(approvals || []);
      } catch (error) {
        console.error('Error fetching pending approvals:', error);
        setApprovalsError(error.message);
        setPendingApprovals([]);
      } finally {
        setApprovalsLoading(false);
      }
    };

    fetchPendingApprovals();
  }, []);

  // Refresh pending approvals function
  const refreshPendingApprovals = async () => {
    try {
      const approvals = await managerService.getTeamRequests();
      setPendingApprovals(approvals || []);
    } catch (error) {
      console.error('Error refreshing pending approvals:', error);
    }
  };

  // Format the pending approvals with formatted request IDs
  const formattedPendingApprovals = pendingApprovals.map(request => ({
    ...request,
    formattedRequestId: formatRequestId(request.travelRequestId || request.id)
  }));

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  const pendingTeamRequests = teamRequests.filter(req =>
    req.status === 'PENDING' || req.status === 'pending'
  );

  const approvedCount = personalRequests.filter(req =>
    req.status === 'APPROVED' || req.status === 'approved'
  ).length + teamRequests.filter(req =>
    req.status === 'APPROVED' || req.status === 'approved'
  ).length;

  const rejectedCount = personalRequests.filter(req =>
    req.status === 'REJECTED' || req.status === 'rejected'
  ).length + teamRequests.filter(req =>
    req.status === 'REJECTED' || req.status === 'rejected'
  ).length;

  const handleQuickAction = (action) => {
    switch (action) {
      case 'new-request':
        goto('/new-request');
        break;
      case 'my-requests':
        goto('/my-requests');
        break;
      case 'team-requests':
        goto('/team-requests');
        break;
      case 'reports':
        goto('/reports');
        break;
      default:
        break;
    }
  };

  const handleApprovalAction = async (action, requestId, workflowId, requestData, rejectReason = '') => {
    try {
      console.log(`🔄 Processing ${action} action for request:`, requestId);

      if (action === 'approve') {
        await managerService.approveTeamRequest(
          requestId, 
          'Approved via dashboard',
          workflowId,
          requestData
        );
        showPopupMessage('✅ Request approved successfully!', 'success');
      } else if (action === 'reject') {
        await managerService.rejectTeamRequest(
          requestId, 
          rejectReason || 'Rejected via dashboard',
          workflowId,
          requestData
        );
        showPopupMessage('❌ Request rejected successfully!', 'error');
      }

      // Refresh data after successful action
      try {
        if (refreshData && typeof refreshData === 'function') {
          await refreshData();
        } else {
          console.log('⚠️ refreshData not available, refreshing pending approvals only');
        }
      } catch (refreshError) {
        console.warn('Could not refresh main data:', refreshError);
      }

      // Always refresh pending approvals
      await refreshPendingApprovals();

    } catch (error) {
      console.error(`Error performing ${action} action:`, error);
      showPopupMessage(`❌ Failed to ${action} request: ${error.message}`, 'error');
    }
  };

  return (
    <div className="dashboard-page">
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
        <h1>Welcome Back!</h1>
      </div>

      {/* Stats Overview */}
      <StatsCards
        personalRequestsCount={totalMyRequestsCount} // Use the total count from API
        teamRequestsCount={teamRequests.length}
        approvedCount={approvedCount}
        pendingApprovalCount={pendingApprovals.length}
        rejectedCount={rejectedCount}
        onPersonalRequestsClick={() => goto('/my-requests')}
        onTeamRequestsClick={() => goto('/team-requests')}
        onPendingApprovalClick={() => goto('/team-requests?filter=pending')}
      />

      <div className="dashboard-grid">
        {/* Left Column - Manager Focus */}
        <div className="dashboard-column main-column">
          <PendingApprovals
            requests={formattedPendingApprovals}
            onViewAll={() => goto('/team-requests?filter=pending')}
            isLoading={approvalsLoading}
            onApprove={(requestId, workflowId, requestData) => 
              handleApprovalAction('approve', requestId, workflowId, requestData)
            }
            onReject={(requestId, workflowId, requestData, rejectReason) => 
              handleApprovalAction('reject', requestId, workflowId, requestData, rejectReason)
            }
          />
        </div>

        {/* Right Column - Personal & Quick Actions */}
        <div className="dashboard-column side-column">
          <RecentRequests
            requests={personalRequests.slice(0, 5)}
            onNewRequest={() => goto('/new-request')}
            onViewAll={() => goto('/my-requests')}
          />

          <QuickActions
            onNavigate={goto}
            onAction={handleQuickAction}
            userRole="manager"
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;