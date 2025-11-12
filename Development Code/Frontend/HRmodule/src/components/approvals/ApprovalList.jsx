import React, { useState, useMemo } from 'react';
import Badge from '../common/Badge';
import { LoadingSpinner } from '../common/LoadingSpinner';
import './ApprovalList.css';

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
      await onApprove(request.travelRequestId, "Approved via quick action");
    } catch (error) {
      console.error('Error approving request:', error);
      alert(`Failed to approve request: ${error.message}`);
    } finally {
      setProcessingRequest(null);
    }
  };

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
      await onReject(request.travelRequestId, reason);
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert(`Failed to reject request: ${error.message}`);
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleRowClick = (request) => {
    if (onRequestSelect) {
      onRequestSelect(request);
    }
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
            onClick={onRefresh}
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
            <button onClick={onRefresh} className="btn btnSecondary" style={{ marginLeft: '10px' }}>
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
                      <Badge variant={request.status}>
                        {request.status?.charAt(0).toUpperCase() + request.status?.slice(1) || 'Pending'}
                      </Badge>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-sm1"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRowClick(request);
                          }}
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
                            <button
                             // onClick={() => handleRequestChange(
                               // exception.exceptionId || exception.id,
                                //exception.employeeName || exception.employee?.name
                              //)}
                              //disabled={actionLoading}
                              className="btn-sm1"
                              title="Request Changes"
                            >
                              <i className="fas fa-edit"></i>
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

export { ApprovalList };
export default ApprovalList;