<<<<<<< HEAD
/* eslint-disable no-unused-vars */
=======
>>>>>>> upstream/main
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { useApp } from '../../contexts/AppContext';
import LoadingSpinner from '../common/LoadingSpinner';
import { hrService } from '../../services/hrService';
<<<<<<< HEAD
import { approvalService } from '../../services/approvalService';
=======
>>>>>>> upstream/main
import './ExceptionManagement.css';

const ExceptionsManagement = () => {
  const { exceptionId } = useParams();
  const navigate = useNavigate();
  const [exceptionRequests, setExceptionRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedException, setSelectedException] = useState(null);
<<<<<<< HEAD
  const [messageModal, setMessageModal] = useState(null);
=======
>>>>>>> upstream/main
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [totalItems, setTotalItems] = useState(0);
<<<<<<< HEAD
=======

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
>>>>>>> upstream/main

  useEffect(() => {
    fetchExceptionRequests();
  }, []);

  // Fetch data using hrService
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

  // Helper functions to get consistent IDs and names
  const getWorkflowId = (exception) => {
    return exception.workflowId || exception.exceptionId || exception.id;
  };

  const getEmployeeName = (exception) => {
    return exception.employeeName || exception.employee?.name || 'Unknown';
  };

  // Show message modal
  const showMessage = (message, type = 'success') => {
    setMessageModal({ message, type });
  };

  // Close message modal
  const closeMessage = () => {
    setMessageModal(null);
  };

  // Handle view details - redirect to detail page
  const handleViewDetails = (exception) => {
    const workflowId = getWorkflowId(exception);
    console.log('🔍 Navigating to detail page with workflowId:', workflowId);
     navigate(`/approvals/${workflowId}`)
  };

  // Handle back from detail view
  const handleBack = () => {
    navigate('/exceptions');
  };

<<<<<<< HEAD
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
    setCurrentPage(1);
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

  // Action handlers using window.confirm for approve/reject
  const handleApprove = (workflowId, employeeName) => {
    const isConfirmed = window.confirm(`Are you sure you want to approve the role exception for ${employeeName}?`);
    
    if (isConfirmed) {
      performApproveAction(workflowId, employeeName);
    }
  };

  const handleReject = (workflowId, employeeName) => {
    const isConfirmed = window.confirm(`Are you sure you want to reject the role exception for ${employeeName}?`);
    
    if (isConfirmed) {
      performRejectAction(workflowId, employeeName);
    }
  };

  // Separate functions for actual approve/reject actions
  const performApproveAction = async (workflowId, employeeName) => {
    try {
      setActionLoading(true);
      
      // USE approvalService ONLY - NOT hrService
      await approvalService.approveRequest(
        workflowId, 
        `Approved via Quick Action for the exception request ${employeeName}`
      );
      showMessage(`Exception approved successfully for ${employeeName}!`, 'success');
      
      await fetchExceptionRequests();
      
    } catch (err) {
      console.error('Error approving exception:', err);
      showMessage(`Failed to approve exception: ${err.message}`, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const performRejectAction = async (workflowId, employeeName) => {
    try {
      setActionLoading(true);
      
      // USE approvalService ONLY - NOT hrService
      await approvalService.rejectRequest(
        workflowId, 
        `Rejected via Quick Action for the exception request ${employeeName}`
      );
      showMessage(`Exception rejected successfully for ${employeeName}!`, 'success');
      
      await fetchExceptionRequests();
      
    } catch (err) {
      console.error('Error rejecting exception:', err);
      showMessage(`Failed to reject exception: ${err.message}`, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // eslint-disable-next-line no-unused-vars
=======
>>>>>>> upstream/main
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
    
<<<<<<< HEAD
=======
    // Adjust start page if we're near the end
>>>>>>> upstream/main
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

<<<<<<< HEAD
  // Message Popup Component
  const MessagePopup = ({ modalData, onClose }) => {
    if (!modalData) return null;

    return (
      <div className="modal-overlay">
        <div className="modal-content message-modal">
          <div className="modal-header">
            <h3>{modalData.type === 'error' ? 'Error' : 'Success'}</h3>
            <button onClick={onClose} className="btn btn-close">
              <i className="fas fa-times"></i>
            </button>
          </div>
          <div className="modal-body">
            <div className="message-content">
              <div className={`message-icon ${modalData.type}`}>
                <i className={`fas fa-${modalData.type === 'error' ? 'exclamation-triangle' : 'check-circle'}`}></i>
              </div>
              <p>{modalData.message}</p>
            </div>
          </div>
          <div className="modal-footer">
            <button onClick={onClose} className="btn btn-primary">
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

=======
>>>>>>> upstream/main
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
<<<<<<< HEAD
      {/* Message Popup */}
      {messageModal && (
        <MessagePopup
          modalData={messageModal}
          onClose={closeMessage}
        />
=======
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
>>>>>>> upstream/main
      )}

      <div className="card">
        <div className="card-header">
          <div className="cardbody">
<<<<<<< HEAD
            {/* {exception.length} */}
            <h3>Pending Exceptions</h3>
=======
            <h3>Pending Exceptions ({totalItems})</h3>
>>>>>>> upstream/main
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
<<<<<<< HEAD
                      <tr key={getWorkflowId(exception)}>
                        <td>
                          <div className="employee-info">
                            <div className="employee-name">
                              {getEmployeeName(exception)}
=======
                      <tr key={exception.exceptionId || exception.id}>
                        <td>
                          <div className="employee-info">
                            <div className="employee-name">
                              {exception.employeeName || exception.employee?.name || 'Unknown'}
>>>>>>> upstream/main
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
<<<<<<< HEAD
                            ? `${exception.exceptionReasonse.substring(0, 50)}...`
=======
                            ? exception.exceptionReasonse
>>>>>>> upstream/main
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
<<<<<<< HEAD
                              disabled={actionLoading}
=======
>>>>>>> upstream/main
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            <button
<<<<<<< HEAD
                              onClick={() => handleApprove(
                                getWorkflowId(exception),
                                getEmployeeName(exception)
                              )}
                              disabled={actionLoading}
                              className="btn-sm1 btn-approve"
=======
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
>>>>>>> upstream/main
                              title="Approve Exception"
                            >
                              <i className="fas fa-check"></i>
                            </button>
                            <button
                              onClick={() => handleReject(
<<<<<<< HEAD
                                getWorkflowId(exception),
                                getEmployeeName(exception)
                              )}
                              disabled={actionLoading}
                              className="btn-sm1 btn-reject"
=======
                                exception.exceptionId || exception.id,
                                exception.employeeName || exception.employee?.name
                              )}
                              disabled={actionLoading}
                              className="btn-sm1"
>>>>>>> upstream/main
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
<<<<<<< HEAD
                    <span>
                      Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} entries
                    </span>
                    <select 
=======
                    {/* <span>
                      Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} entries
                    </span> */}
                    {/* <select 
>>>>>>> upstream/main
                      value={itemsPerPage} 
                      onChange={handleItemsPerPageChange}
                      className="pageSizeSelect"
                    >
                      <option value="5">5 per page</option>
                      <option value="10">10 per page</option>
                      <option value="20">20 per page</option>
                      <option value="50">50 per page</option>
<<<<<<< HEAD
                    </select>
=======
                    </select> */}
>>>>>>> upstream/main
                  </div>
                  
                  <div className="paginationButtons">
                    <button
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
<<<<<<< HEAD
                      className="btn btn-secondary"
=======
                      className="btn"
>>>>>>> upstream/main
                      title="Previous Page"
                    >
                      <i className="fas fa-chevron-left"></i>
                    </button>
                    
                    {getPageNumbers().map(page => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
<<<<<<< HEAD
                        className={`btn ${currentPage === page ? 'btn-primary' : 'btn-secondary'}`}
=======
                        className={`btn ${currentPage === page ? 'btnPrimary' : ''}`}
>>>>>>> upstream/main
                      >
                        {page}
                      </button>
                    ))}
                    
                    <button
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
<<<<<<< HEAD
                      className="btn btn-secondary"
=======
                      className="btn"
>>>>>>> upstream/main
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