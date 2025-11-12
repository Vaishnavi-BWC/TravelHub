import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import LoadingSpinner from '../common/LoadingSpinner';
import { hrService } from '../../services/hrService';
import './ExceptionManagement.css';

const ExceptionsManagement = () => {
  const { exceptionId } = useParams();
  const navigate = useNavigate();
  const [exceptionRequests, setExceptionRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedException, setSelectedException] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    fetchExceptionRequests();
  }, []);

  const fetchExceptionRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔍 Fetching exception requests...');
      
      const exceptions = await hrService.getRoleExceptions();
      console.log('✅ Exception requests fetched:', exceptions);
      
      setExceptionRequests(exceptions || []);
      setTotalItems(exceptions?.length || 0);
    } catch (err) {
      console.error('❌ Error fetching exception requests:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Pagination calculations
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentExceptions = exceptionRequests.slice(startIndex, endIndex);

  // Pagination handlers
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(parseInt(e.target.value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleApprove = async (exceptionId, employeeName) => {
    if (!window.confirm(`Are you sure you want to approve the role exception for ${employeeName}?`)) {
      return;
    }

    try {
      setActionLoading(true);
      const remarks = prompt('Enter approval remarks (optional):');
      
      await hrService.approveRoleException(exceptionId, remarks);
      alert('✅ Exception approved successfully!');
      
      // Refresh the list
      await fetchExceptionRequests();
    } catch (err) {
      console.error('Error approving exception:', err);
      alert(`❌ Failed to approve exception: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (exceptionId, employeeName) => {
    if (!window.confirm(`Are you sure you want to reject the role exception for ${employeeName}?`)) {
      return;
    }

    try {
      setActionLoading(true);
      const remarks = prompt('Enter rejection reason (required):');
      
      if (!remarks?.trim()) {
        alert('Please provide a rejection reason.');
        return;
      }
      
      await hrService.rejectRoleException(exceptionId, remarks);
      alert('✅ Exception rejected successfully!');
      
      // Refresh the list
      await fetchExceptionRequests();
    } catch (err) {
      console.error('Error rejecting exception:', err);
      alert(`❌ Failed to reject exception: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestChange = async (exceptionId, employeeName) => {
    const changeRequest = prompt(`What changes would you like to request for ${employeeName}'s exception?`);
    
    if (!changeRequest?.trim()) {
      alert('Please provide change request details.');
      return;
    }

    try {
      setActionLoading(true);
      // Assuming you have a service method for requesting changes
      await hrService.requestExceptionChange(exceptionId, changeRequest);
      alert('✅ Change request submitted successfully!');
      
      // Refresh the list
      await fetchExceptionRequests();
    } catch (err) {
      console.error('Error requesting change:', err);
      alert(`❌ Failed to submit change request: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewDetails = (exception) => {
    setSelectedException(exception);
  };

  const handleCloseDetails = () => {
    setSelectedException(null);
  };

  const handleBack = () => {
    navigate('/exceptions');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusVariant = (status) => {
    if (!status) return 'pending';
    return status.toLowerCase();
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  if (error) {
    return (
      <div className="content">
        <div className="error-state">
          <i className="fas fa-exclamation-triangle error-icon"></i>
          <h3>Unable to Load Exceptions</h3>
          <p>{error}</p>
          <button onClick={fetchExceptionRequests} className="btn btn-primary" disabled={loading}>
            {loading ? 'Retrying...' : 'Retry'}
          </button>
          <button onClick={handleBack} className="btn btn-secondary">Back to Dashboard</button>
        </div>
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner text="Loading exception requests..." />;
  }

  return (
    <div className="content">
      {/* Exception Details Modal */}
      {selectedException && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Exception Details</h3>
              <button onClick={handleCloseDetails} className="btn btn-close">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Employee Name:</label>
                  <span>{selectedException.employeeName || selectedException.employee?.name || 'Unknown'}</span>
                </div>
                <div className="detail-item">
                  <label>Department:</label>
                  <span>{selectedException.employeeDepartment || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <label>Current Stage:</label>
                  <span>{selectedException.currentApproverRole || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <label>Status:</label>
                  <span className={`status status-${getStatusVariant(selectedException.status)}`}>
                    {selectedException.status || 'PENDING'}
                  </span>
                </div>
                <div className="detail-item full-width">
                  <label>Reason:</label>
                  <p>{selectedException.exceptionReasonse || 'No reason provided'}</p>
                </div>
                {selectedException.submittedDate && (
                  <div className="detail-item">
                    <label>Submitted Date:</label>
                    <span>{formatDate(selectedException.submittedDate)}</span>
                  </div>
                )}
                {selectedException.remarks && (
                  <div className="detail-item full-width">
                    <label>Remarks:</label>
                    <p>{selectedException.remarks}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={handleCloseDetails} className="btn btn-primary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <div className="cardbody">
            <h3>Pending Exceptions ({totalItems})</h3>
            <p>Manage all employee requests awaiting your approval in one place</p>
          </div>
        </div>

        <div className="card-body">
          {exceptionRequests.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-check-circle empty-icon"></i>
              <h3>No Pending Exceptions</h3>
              <p>All role exception requests have been processed.</p>
            </div>
          ) : (
            <>
              <div className="exceptions-table-container">
                <table className="exceptions-table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Department</th>
                      <th>Current Stage</th>
                      <th>Reason</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentExceptions.map((exception) => (
                      <tr key={exception.exceptionId || exception.id}>
                        <td>
                          <div className="employee-info">
                            <div className="employee-name">
                              {exception.employeeName || exception.employee?.name || 'Unknown'}
                            </div>
                          </div>
                        </td>
                        <td className="employee-dept">
                          {exception.employeeDepartment || 'N/A'}
                        </td>
                        <td className="requested-role">
                          {exception.currentApproverRole || 'N/A'}
                        </td>
                        <td className="exception-reason">
                          {exception.exceptionReasonse?.length > 50 
                            ? exception.exceptionReasonse
                            : exception.exceptionReasonse || 'No reason provided'
                          }
                        </td>
                        <td>
                          <span className={`status status-${getStatusVariant(exception.status)}`}>
                            {exception.status || 'PENDING'}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              onClick={() => handleViewDetails(exception)}
                              className="btn-sm1"
                              title="View Details"
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            <button
                              onClick={() => handleRequestChange(
                                exception.exceptionId || exception.id,
                                exception.employeeName || exception.employee?.name
                              )}
                              disabled={actionLoading}
                              className="btn-sm1"
                              title="Request Changes"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button
                              onClick={() => handleApprove(
                                exception.exceptionId || exception.id,
                                exception.employeeName || exception.employee?.name
                              )}
                              disabled={actionLoading}
                              className="btn-sm1"
                              title="Approve Exception"
                            >
                              <i className="fas fa-check"></i>
                            </button>
                            <button
                              onClick={() => handleReject(
                                exception.exceptionId || exception.id,
                                exception.employeeName || exception.employee?.name
                              )}
                              disabled={actionLoading}
                              className="btn-sm1"
                              title="Reject Exception"
                            >
                              <i className="fas fa-times"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="paginationControls">
                  <div className="paginationInfo">
                    {/* <span>
                      Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} entries
                    </span> */}
                    {/* <select 
                      value={itemsPerPage} 
                      onChange={handleItemsPerPageChange}
                      className="pageSizeSelect"
                    >
                      <option value="5">5 per page</option>
                      <option value="10">10 per page</option>
                      <option value="20">20 per page</option>
                      <option value="50">50 per page</option>
                    </select> */}
                  </div>
                  
                  <div className="paginationButtons">
                    <button
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                      className="btn"
                      title="Previous Page"
                    >
                      <i className="fas fa-chevron-left"></i>
                    </button>
                    
                    {getPageNumbers().map(page => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`btn ${currentPage === page ? 'btnPrimary' : ''}`}
                      >
                        {page}
                      </button>
                    ))}
                    
                    <button
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className="btn"
                      title="Next Page"
                    >
                      <i className="fas fa-chevron-right"></i>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export { ExceptionsManagement };
export default ExceptionsManagement;