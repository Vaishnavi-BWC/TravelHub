import React, { useState, useMemo, useCallback } from 'react';
import Badge from '../common/Badge';
import { LoadingSpinner } from '../common/LoadingSpinner';
import './ApprovalList.css';

// Cache configuration
const CACHE_KEYS = {
  APPROVALS: 'approvals_cache',
  TIMESTAMP: 'approvals_timestamp'
};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Cache utilities
const cacheUtils = {
  getCache: () => {
    try {
      const cachedData = localStorage.getItem(CACHE_KEYS.APPROVALS);
      const timestamp = localStorage.getItem(CACHE_KEYS.TIMESTAMP);
      
      if (!cachedData || !timestamp) return null;
      
      const now = Date.now();
      const cacheTime = parseInt(timestamp, 10);
      
      if (now - cacheTime > CACHE_DURATION) {
        cacheUtils.clearCache();
        return null;
      }
      
      return JSON.parse(cachedData);
    } catch (error) {
      console.error('Error reading cache:', error);
      cacheUtils.clearCache();
      return null;
    }
  },
  
  setCache: (data) => {
    try {
      localStorage.setItem(CACHE_KEYS.APPROVALS, JSON.stringify(data));
      localStorage.setItem(CACHE_KEYS.TIMESTAMP, Date.now().toString());
    } catch (error) {
      console.error('Error setting cache:', error);
    }
  },
  
  clearCache: () => {
    try {
      localStorage.removeItem(CACHE_KEYS.APPROVALS);
      localStorage.removeItem(CACHE_KEYS.TIMESTAMP);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  },
  
  isCacheValid: () => {
    try {
      const timestamp = localStorage.getItem(CACHE_KEYS.TIMESTAMP);
      if (!timestamp) return false;
      
      const now = Date.now();
      const cacheTime = parseInt(timestamp, 10);
      return now - cacheTime <= CACHE_DURATION;
    } catch (error) {
      return false;
    }
  }
};

const ApprovalList = ({
  approvals,
  onRequestSelect,
  loading = false,
  error = null,
  onRefresh,
  onApprove,
  onReject
}) => {
  const [requestFilter, setRequestFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [processingRequest, setProcessingRequest] = useState(null);

  // Enhanced refresh handler with cache clearing
  const handleRefresh = useCallback(() => {
    // Clear cache on manual refresh to force fresh data
    cacheUtils.clearCache();
    if (onRefresh) {
      onRefresh();
    }
  }, [onRefresh]);

  // Enhanced approve handler with cache clearing
  const handleQuickApprove = async (request, e) => {
    e.stopPropagation();
    if (!onApprove) {
      console.warn('onApprove function not provided');
      return;
    }

    const formattedId = formatTravelRequestId(request.travelRequestId);
    const confirmed = window.confirm(`Are you sure you want to approve request ${formattedId}?`);
    if (!confirmed) return;

    setProcessingRequest(request.travelRequestId);
    try {
      await onApprove(request.workflowId || request.travelRequestId, "Approved via quick action");
      // Clear cache after successful approval to reflect changes
      cacheUtils.clearCache();
    } catch (error) {
      console.error('Error approving request:', error);
      alert(`Failed to approve request: ${error.message}`);
    } finally {
      setProcessingRequest(null);
    }
  };

  // Enhanced reject handler with cache clearing
  const handleQuickReject = async (request, e) => {
    e.stopPropagation();
    if (!onReject) {
      console.warn('onReject function not provided');
      return;
    }

    const formattedId = formatTravelRequestId(request.travelRequestId);
    const reason = prompt(`Please enter reason for rejecting request ${formattedId}:`);
    if (reason === null) return;

    if (!reason.trim()) {
      alert("Please provide a reason for rejection.");
      return;
    }

    setProcessingRequest(request.travelRequestId);
    try {
      await onReject(request.workflowId || request.travelRequestId, reason);
      // Clear cache after successful rejection to reflect changes
      cacheUtils.clearCache();
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert(`Failed to reject request: ${error.message}`);
    } finally {
      setProcessingRequest(null);
    }
  };

  // Function to format travel request ID
  const formatTravelRequestId = (id) => {
    if (!id) return 'N/A';
    
    // Get the last 5 characters of the ID
    const lastFiveChars = id.slice(-5);
    
    // Return formatted as T-XXXXX
    return `T-${lastFiveChars}`;
  };

  const filteredRequests = useMemo(() => {
    if (!approvals || !Array.isArray(approvals)) return [];

    let filtered = approvals;

    // Apply status filter
    if (requestFilter !== "All") {
      filtered = filtered.filter(r =>
        r.status?.toLowerCase() === requestFilter.toLowerCase()
      );
    }

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(r =>
        r.travelRequestId?.toLowerCase().includes(searchLower) ||
        r.employeeName?.toLowerCase().includes(searchLower) ||
        r.purpose?.toLowerCase().includes(searchLower) ||
        r.employeeDepartment?.toLowerCase().includes(searchLower) ||
        formatTravelRequestId(r.travelRequestId)?.toLowerCase().includes(searchLower) // Include formatted ID in search
      );
    }

    return filtered;
  }, [approvals, requestFilter, searchTerm]);

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  const handleRowClick = (request) => {
    if (onRequestSelect) {
      // Pass the complete request object which includes workflowId
      onRequestSelect(request);
    }
  };

  const handleViewDetails = (request, e) => {
    e.stopPropagation();
    if (onRequestSelect) {
      // Pass the complete request object which includes workflowId
      onRequestSelect(request);
    }
  };

  const getStatusVariant = (status) => {
    if (!status) return 'pending';
    
    const statusLower = status.toLowerCase();
    if (statusLower.includes('approved') || statusLower === 'completed') return 'success';
    if (statusLower.includes('rejected') || statusLower === 'rejected') return 'danger';
    if (statusLower.includes('pending') || statusLower === 'in_progress') return 'warning';
    return 'pending';
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="header-content">
          <h3>Pending Request</h3>
          <h6 style={{ color: 'gray', fontSize: '15px', fontWeight: '400' }}>Manage all employee requests awaiting your approval in one place.</h6>
        </div>
      </div>

      <div className="cardHeaderFlex">
        <div className="filterButtons">
          {/* {["All", "pending", "approved", "rejected"].map((filter) => (
            <button
              key={filter}
              onClick={() => setRequestFilter(filter)}
              className={`filterBtn ${requestFilter === filter ? 'filterBtnActive' : ''}`}
              disabled={loading}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
              {filter !== "All" && (
                <span className="filterCount">
                  ({approvals.filter(r => r.status === filter).length})
                </span>
              )}
            </button>
          ))} */}
        </div>

        <div className="searchAndControls">
          <div className="searchBox">
            <i className="fas fa-search searchIcon"></i>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <input
              type="text"
              placeholder=" Search by ID, type.."
              className="searchInput"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={loading}
            />
            {searchTerm && (
              <button
                className="searchClear"
                onClick={handleClearSearch}
                title="Clear search"
              >
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>

          <button
            onClick={handleRefresh}
            className="btn btnSecondary"
            disabled={loading}
            title="Refresh approvals"
          >
            <i className="fas fa-refresh"></i> Refresh
          </button>
        </div>
      </div>

      <div className="cardBody">
        {error ? (
          <div className="errorMessage">
            <i className="fas fa-exclamation-circle"></i>
            {error}
            <button onClick={handleRefresh} className="btn btnSecondary" style={{ marginLeft: '10px' }}>
              <i className="fas fa-refresh"></i> Retry
            </button>
          </div>
        ) : loading ? (
          <div className="loading">
            <i className="fas fa-spinner fa-spin"></i> Loading approval requests...
          </div>
        ) : filteredRequests.length > 0 ? (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Type</th>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Budget</th>
                  <th>Current Stage</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((request) => (
                  <tr
                    key={request.travelRequestId}
                    className="table-row clickable-row"
                    onClick={() => handleRowClick(request)}
                  >
                    <td>
                      <span className="request-id" title={`Original ID: ${request.travelRequestId}`}>
                        {formatTravelRequestId(request.travelRequestId)}
                      </span>
                    </td>
                    <td>
                      <span className={`request-type ${request.purpose?.toLowerCase() || ''} ${request.workflowType || ''}`.trim()}>
                        {request.purpose}
                      </span>
                    </td>
                    <td>
                      <div className="employee-info">
                        <strong>{request.employeeName}</strong>
                      </div>
                    </td>
                    <td>{request.employeeDepartment}</td>
                    <td>{request.estimatedBudget || '$0'}</td>
                    <td>
                      <span className="stage-badge">{request.currentStep}</span>
                    </td>
                    <td>
                      <Badge variant={getStatusVariant(request.status)}>
                        {request.status?.charAt(0).toUpperCase() + request.status?.slice(1) || 'Pending'}
                      </Badge>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-sm1"
                          onClick={(e) => handleViewDetails(request, e)}
                          title="View Details"
                          disabled={loading}
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        
                        {(request.status === "pending" || request.status === "PENDING" || request.status === "IN_PROGRESS" || request.status === undefined) && (
                          <>
                            <button
                              className="btn-sm1 btnSuccess"
                              onClick={(e) => handleQuickApprove(request, e)}
                              title="Quick Approve"
                              disabled={loading || processingRequest === request.travelRequestId}
                            >
                              {processingRequest === request.travelRequestId ? (
                                <i className="fas fa-spinner fa-spin"></i>
                              ) : (
                                <i className="fas fa-check"></i>
                              )}
                            </button>
                            <button
                              className="btn-sm1 btnDanger"
                              onClick={(e) => handleQuickReject(request, e)}
                              title="Quick Reject"
                              disabled={loading || processingRequest === request.travelRequestId}
                            >
                              {processingRequest === request.travelRequestId ? (
                                <i className="fas fa-spinner fa-spin"></i>
                              ) : (
                                <i className="fas fa-times"></i>
                              )}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <i className="fas fa-inbox"></i>
            <h3>No HR approval requests found</h3>
            <p>
              {searchTerm || requestFilter !== "All"
                ? "Try adjusting your search or filter criteria"
                : "There are no pending HR approval requests at this time"
              }
            </p>
            {(searchTerm || requestFilter !== "All") && (
              <button onClick={() => { setSearchTerm(''); setRequestFilter('All'); }} className="btn btnPrimary">
                Clear All Filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Export cache utilities for external use
export { ApprovalList, cacheUtils as approvalsCacheUtils };
export default ApprovalList;