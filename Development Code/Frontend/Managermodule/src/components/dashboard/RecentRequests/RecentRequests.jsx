// components/dashboard/RecentRequests/RecentRequests.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { managerService } from '../../../services/managerService';
import { travelService } from '../../../services/travelService'; 
import './RecentRequests.css';

const RecentRequests = ({ onNewRequest, onViewAll }) => {
  const navigate = useNavigate();
  const [allRequests, setAllRequests] = useState([]); // Store all requests
  const [requests, setRequests] = useState([]); // Store only recent requests
  const [workflowStatuses, setWorkflowStatuses] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingWorkflows, setLoadingWorkflows] = useState({});

  // Fetch workflow status for a single request
  const fetchWorkflowStatus = async (travelRequestId) => {
    try {
      setLoadingWorkflows(prev => ({ ...prev, [travelRequestId]: true }));
      const workflowData = await managerService.getWorkflowStatus(travelRequestId);
      
      setWorkflowStatuses(prev => ({
        ...prev,
        [travelRequestId]: workflowData
      }));
      
      return workflowData;
    } catch (err) {
      console.error(`Error fetching workflow for ${travelRequestId}:`, err);
      setWorkflowStatuses(prev => ({
        ...prev,
        [travelRequestId]: { error: 'Failed to load status' }
      }));
      return null;
    } finally {
      setLoadingWorkflows(prev => ({ ...prev, [travelRequestId]: false }));
    }
  };

  // Fetch workflow statuses for all requests
  const fetchAllWorkflowStatuses = async (requestList) => {
    const workflowPromises = requestList.map(request => 
      fetchWorkflowStatus(request.travelRequestId)
    );
    await Promise.all(workflowPromises);
  };

  // Fetch recent requests
  const fetchRecentRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const allRequestsData = await managerService.getTravelRequestsFilteredByEmployee();
      
      // Store all requests
      setAllRequests(allRequestsData);
      
      // Get only 2 most recent (based on your current logic)
      const recentRequests = allRequestsData.slice(-2);
      setRequests(recentRequests);
      
      await fetchAllWorkflowStatuses(recentRequests);
      
    } catch (err) {
      console.error('Error fetching recent requests:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Get status display text, class, and stage
  const getStatusInfo = useCallback((request, workflowData) => {
    // If it's a draft (managerPresent is false)
    if (request.managerPresent === false) {
      return { 
        text: 'Draft', 
        className: 'status-draft',
        stage: 'Not Submitted'
      };
    }
    
    // If we have workflow data, use it to determine status and stage
    if (workflowData && !workflowData.error) {
      const { status, currentStep } = workflowData;
      
      let statusText = status || 'Submitted';
      let statusClass = 'status-submitted';
      let stageText = currentStep || 'Submitted';
      
      if (status === 'PENDING') {
        statusText = 'Pending';
        statusClass = 'status-pending';
        stageText = formatStageText(currentStep);
      } else if (status === 'APPROVED') {
        statusText = 'Approved';
        statusClass = 'status-approved';
        stageText = 'Completed';
      } else if (status === 'REJECTED') {
        statusText = 'Rejected';
        statusClass = 'status-rejected';
        stageText = 'Rejected';
      } else if (status === 'COMPLETED') {
        statusText = 'Completed';
        statusClass = 'status-approved';
        stageText = 'Completed';
      }
      
      return {
        text: statusText,
        className: statusClass,
        stage: stageText
      };
    }
    
    // If workflow is still loading
    if (loadingWorkflows[request.travelRequestId]) {
      return { 
        text: 'Loading...', 
        className: 'status-loading',
        stage: 'Checking status...'
      };
    }
    
    // Default fallback
    return { 
      text: 'Submitted', 
      className: 'status-submitted',
      stage: 'Under Review'
    };
  }, [loadingWorkflows]);

  // Helper function to format stage text for better display
  const formatStageText = (stage) => {
    if (!stage) return 'Under Review';
    return stage
      .toLowerCase()
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Action handlers
  const handleViewClick = useCallback((request) => {
    navigate(`/request-detail/${request.travelRequestId}`);
  }, [navigate]);

  const handleEditClick = useCallback((request) => {
    navigate(`/edit-request/${request.travelRequestId}`);
  }, [navigate]);

  const handleDeleteClick = useCallback(async (request) => {
    if (window.confirm(`Are you sure you want to delete request ${request.travelRequestId}?`)) {
      try {
        await travelService.deleteTravelRequest(request.travelRequestId);
        await fetchRecentRequests(); // Refresh the list
        alert('Request deleted successfully!');
      } catch (error) {
        console.error('Error deleting request:', error);
        alert(`Failed to delete request: ${error.message}`);
      }
    }
  }, []);

  const handleRefresh = useCallback(() => {
    fetchRecentRequests();
  }, []);

  // Helper function to check if request is editable (draft status)
  const isRequestEditable = useCallback((request) => {
    return request.managerPresent === false;
  }, []);

  useEffect(() => {
    fetchRecentRequests();
  }, []);

  if (loading) {
    return (
      <div className="card">
        <div className="cardHeader">
          <h2>My Recent Requests</h2>
        </div>
        <div className="loadingState">
          <i className="fas fa-spinner fa-spin"></i> Loading recent requests...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="cardHeader">
          <h2>My Recent Requests</h2>
        </div>
        <div className="errorState">
          <i className="fas fa-exclamation-circle"></i> 
          <div>
            <h4>Error Loading Requests</h4>
            <p>{error}</p>
            <button onClick={handleRefresh} className="btn btnSecondary">
              <i className="fas fa-refresh"></i> Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3>My Recent Requests</h3>
        <div className="header-actions">
          <button className="btn btnPrimary" onClick={onNewRequest}>
            <i className="fas fa-plus"></i> New Request
          </button>
          {allRequests.length > 0 && (
            <button className="btn btn-primary" onClick={onViewAll}>
              <i className="fas fa-eye"></i> View All ({allRequests.length})
            </button>
          )}
        </div>
      </div>

      <div className="cardBody">
        {requests.length === 0 ? (
          <div className="noData">
            <i className="fas fa-briefcase"></i>
            <h4>No Travel Requests</h4>
            <p>You haven't created any travel requests yet.</p>
            <button onClick={onNewRequest} className="btn btnPrimary">
              Create Your First Request
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table className="requestsTable">
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Purpose</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Project ID</th>
                  <th>Status</th>
                  <th>Current Stage</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => {
                  const isEditable = isRequestEditable(request);
                  const workflowData = workflowStatuses[request.travelRequestId];
                  const statusInfo = getStatusInfo(request, workflowData);
                  
                  return (
                    <tr key={request.travelRequestId}>
                      <td>
                        <span className="request-id">
                          T-{request.travelRequestId?.slice(-6) || 'N/A'}
                        </span>
                      </td>
                      <td className="purpose-cell">
                        <div className="purpose-text" title={request.purpose}>
                          {request.purpose || 'Not specified'}
                        </div>
                      </td>
                      <td>
                        {request.startDate ? new Date(request.startDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td>
                        {request.endDate ? new Date(request.endDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td>
                        <span className="project-id">
                          {request.projectId ? `P-${request.projectId.slice(-6)}` : 'N/A'}
                        </span>
                      </td>
                      <td>
                        <span className={`status ${statusInfo.className}`}>
                          {statusInfo.text}
                          {loadingWorkflows[request.travelRequestId] && (
                            <i className="fas fa-spinner fa-spin ml-1"></i>
                          )}
                        </span>
                      </td>
                      <td>
                        <span className="stage-text">
                          {statusInfo.stage}
                        </span>
                      </td>
                      <td>
                        <div className="actionButtons">
                          {/* View Button - Navigates to detail page */}
                          <button
                            className="btnIcon btnView"
                            onClick={() => handleViewClick(request)}
                            title="View Request Details"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          
                          {/* Edit Button - Only for drafts */}
                          <button
                            className="btnIcon btnEdit"
                            onClick={() => handleEditClick(request)}
                            disabled={!isEditable}
                            title={isEditable ? "Edit Request" : "Cannot edit submitted requests"}
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          
                          {/* Delete Button - Only for drafts */}
                          <button
                            className="btnIcon btnDelete"
                            onClick={() => handleDeleteClick(request)}
                            disabled={!isEditable}
                            title={isEditable ? "Delete Request" : "Cannot delete submitted requests"}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentRequests;