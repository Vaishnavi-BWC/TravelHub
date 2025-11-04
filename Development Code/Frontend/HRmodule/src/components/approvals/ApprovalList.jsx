import React, { useState, useMemo } from 'react';
import Badge from '../common/Badge';
import { LoadingSpinner } from '../common/LoadingSpinner';

const ApprovalList = ({
  approvals,
  onRequestSelect,
  loading = false,
  error = null,
  onRefresh,
  onApprove, // Add this prop for direct approval
  onReject   // Add this prop for direct rejection
}) => {
  const [requestFilter, setRequestFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [processingRequest, setProcessingRequest] = useState(null);

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
        r.id?.toLowerCase().includes(searchLower) ||
        r.employee?.name?.toLowerCase().includes(searchLower) ||
        r.type?.toLowerCase().includes(searchLower) ||
        r.employee?.department?.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [approvals, requestFilter, searchTerm]);

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  const handleQuickApprove = async (request, e) => {
    e.stopPropagation(); // Prevent row click
    if (!onApprove) {
      console.warn('onApprove function not provided');
      return;
    }

    const confirmed = window.confirm(`Are you sure you want to approve request ${request.id}?`);
    if (!confirmed) return;

    setProcessingRequest(request.id);
    try {
      await onApprove(request.id, "Approved via quick action");
      // Success handled by parent component
    } catch (error) {
      console.error('Error approving request:', error);
      alert(`Failed to approve request: ${error.message}`);
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleQuickReject = async (request, e) => {
    e.stopPropagation(); // Prevent row click
    if (!onReject) {
      console.warn('onReject function not provided');
      return;
    }

    const reason = prompt(`Please enter reason for rejecting request ${request.id}:`);
    if (reason === null) return; // User cancelled
    
    if (!reason.trim()) {
      alert("Please provide a reason for rejection.");
      return;
    }

    setProcessingRequest(request.id);
    try {
      await onReject(request.id, reason);
      // Success handled by parent component
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

  if (loading) {
    return (
      <div className="card">
        <div className="cardBody">
          <LoadingSpinner text="Loading HR approval requests..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="cardBody">
          <div className="errorMessage">
            <i className="fas fa-exclamation-circle"></i>
            {error}
            <button onClick={onRefresh} className="btn btnSecondary" style={{ marginLeft: '10px' }}>
              <i className="fas fa-refresh"></i> Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="cardHeaderFlex">
        <div className="filterButtons">
          {["All", "pending", "approved", "rejected"].map((filter) => (
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
          ))}
        </div>
        
        <div className="searchAndControls">
          <div className="searchBox">
            <i className="fas fa-search searchIcon"></i>
            <input
              type="text"
              placeholder="Search by ID, employee, type, or department..."
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
        {filteredRequests.length > 0 ? (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Type</th>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Dates</th>
                  <th>Current Stage</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((request) => (
                  <tr 
                    key={request.id} 
                    className="table-row clickable-row"
                    onClick={() => handleRowClick(request)}
                  >
                    <td>
                      <span className="request-id">{request.id}</span>
                    </td>
                    <td>
                      <span className={`request-type ${request.type?.toLowerCase()}`}>
                        {request.type}
                      </span>
                    </td>
                    <td>
                      <div className="employee-info">
                        <strong>{request.employee.name}</strong>
                        <small>ID: {request.employee.id}</small>
                      </div>
                    </td>
                    <td>{request.employee.department}</td>
                    <td>{request.dates}</td>
                    <td>
                      <span className="stage-badge">{request.stage}</span>
                    </td>
                    <td>
                      <Badge variant={request.status}>
                        {request.status?.charAt(0).toUpperCase() + request.status?.slice(1)}
                      </Badge>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btnIcon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRowClick(request);
                          }}
                          title="View Details"
                          disabled={loading}
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        {request.status === "pending" && (
                          <>
                            <button
                              className="btnIcon btnSuccess"
                              onClick={(e) => handleQuickApprove(request, e)}
                              title="Quick Approve"
                              disabled={loading || processingRequest === request.id}
                            >
                              {processingRequest === request.id ? (
                                <i className="fas fa-spinner fa-spin"></i>
                              ) : (
                                <i className="fas fa-check-circle"></i>
                              )}
                            </button>
                            <button
                              className="btnIcon btnDanger"
                              onClick={(e) => handleQuickReject(request, e)}
                              title="Quick Reject"
                              disabled={loading || processingRequest === request.id}
                            >
                              {processingRequest === request.id ? (
                                <i className="fas fa-spinner fa-spin"></i>
                              ) : (
                                <i className="fas fa-times-circle"></i>
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

export { ApprovalList };
export default ApprovalList;