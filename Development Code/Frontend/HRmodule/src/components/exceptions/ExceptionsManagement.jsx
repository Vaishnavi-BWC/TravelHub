/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { useApp } from '../../contexts/AppContext';
import LoadingSpinner from '../common/LoadingSpinner';
import { hrService } from '../../services/hrService';
import { approvalService } from '../../services/approvalService';
import './ExceptionManagement.css';

// Cache configuration
const CACHE_KEYS = {
  EXCEPTIONS: 'exceptions_cache',
  TIMESTAMP: 'exceptions_timestamp'
};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Cache utilities
const cacheUtils = {
  getCache: () => {
    try {
      const cachedData = localStorage.getItem(CACHE_KEYS.EXCEPTIONS);
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
      localStorage.setItem(CACHE_KEYS.EXCEPTIONS, JSON.stringify(data));
      localStorage.setItem(CACHE_KEYS.TIMESTAMP, Date.now().toString());
    } catch (error) {
      console.error('Error setting cache:', error);
    }
  },
  
  clearCache: () => {
    try {
      localStorage.removeItem(CACHE_KEYS.EXCEPTIONS);
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

const ExceptionsManagement = () => {
  const { exceptionId } = useParams();
  const navigate = useNavigate();
  const [exceptionRequests, setExceptionRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedException, setSelectedException] = useState(null);
  const [messageModal, setMessageModal] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    fetchExceptionRequests();
  }, []);

  // Enhanced fetch data with caching
  const fetchExceptionRequests = async (useCache = true) => {
    try {
      setLoading(true);
      setError(null);
      
      // Check cache first if allowed
      if (useCache) {
        const cachedData = cacheUtils.getCache();
        if (cachedData) {
          console.log('📦 Using cached exceptions data:', cachedData.length, 'items');
          setExceptionRequests(cachedData);
          setTotalItems(cachedData.length);
          setLoading(false);
          return cachedData;
        }
      }

      console.log('🔍 Fetching exception requests from API...');
      
      const exceptions = await hrService.getRoleExceptions();
      console.log('✅ Exception requests fetched:', exceptions);
      
      const exceptionsArray = exceptions || [];
      setExceptionRequests(exceptionsArray);
      setTotalItems(exceptionsArray.length);
      
      // Cache the data
      cacheUtils.setCache(exceptionsArray);
      console.log('💾 Exceptions data cached successfully');
      
      return exceptionsArray;
    } catch (err) {
      console.error('❌ Error fetching exception requests:', err);
      setError(err.message);
      setExceptionRequests([]);
      setTotalItems(0);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Enhanced refetch that bypasses cache
  const refetchExceptions = async () => {
    console.log('🔄 Manual refetch - bypassing cache');
    cacheUtils.clearCache();
    return await fetchExceptionRequests(false);
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

  // Enhanced action handlers with cache clearing
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

  // Enhanced approve action with cache clearing
  const performApproveAction = async (workflowId, employeeName) => {
    try {
      setActionLoading(true);
      
      // USE approvalService ONLY - NOT hrService
      await approvalService.approveRequest(
        workflowId, 
        `Approved via Quick Action for the exception request ${employeeName}`
      );
      
      // Clear cache after successful approval
      cacheUtils.clearCache();
      console.log('🗑️ Cache cleared after approval');
      
      showMessage(`Exception approved successfully for ${employeeName}!`, 'success');
      
      // Refetch fresh data
      await fetchExceptionRequests(false);
      
    } catch (err) {
      console.error('Error approving exception:', err);
      // Clear cache on error too
      cacheUtils.clearCache();
      showMessage(`Failed to approve exception: ${err.message}`, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Enhanced reject action with cache clearing
  const performRejectAction = async (workflowId, employeeName) => {
    try {
      setActionLoading(true);
      
      // USE approvalService ONLY - NOT hrService
      await approvalService.rejectRequest(
        workflowId, 
        `Rejected via Quick Action for the exception request ${employeeName}`
      );
      
      // Clear cache after successful rejection
      cacheUtils.clearCache();
      console.log('🗑️ Cache cleared after rejection');
      
      showMessage(`Exception rejected successfully for ${employeeName}!`, 'success');
      
      // Refetch fresh data
      await fetchExceptionRequests(false);
      
    } catch (err) {
      console.error('Error rejecting exception:', err);
      // Clear cache on error too
      cacheUtils.clearCache();
      showMessage(`Failed to reject exception: ${err.message}`, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // eslint-disable-next-line no-unused-vars
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
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

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

  if (error) {
    return (
      <div className="content">
        <div className="error-state">
          <i className="fas fa-exclamation-triangle error-icon"></i>
          <h3>Unable to Load Exceptions</h3>
          <p>{error}</p>
          <button onClick={refetchExceptions} className="btn btn-primary" disabled={loading}>
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
      {/* Message Popup */}
      {messageModal && (
        <MessagePopup
          modalData={messageModal}
          onClose={closeMessage}
        />
      )}

      <div className="card">
        <div className="card-header">
          <div className="cardbody">
            <h3>Pending Exceptions</h3>
            <p>Manage all employee requests awaiting your approval in one place</p>
          </div>
          <div className="header-actions">
            <button
              onClick={refetchExceptions}
              className="btn btn-secondary"
              disabled={loading}
              title="Refresh exceptions"
            >
              <i className="fas fa-refresh"></i> Refresh
            </button>
          </div>
        </div>

        <div className="card-body">
          {exceptionRequests.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-check-circle empty-icon"></i>
              <h3>No Pending Exceptions</h3>
              <p>All role exception requests have been processed.</p>
              <button onClick={refetchExceptions} className="btn btn-primary">
                <i className="fas fa-refresh"></i> Refresh
              </button>
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
                      <tr key={getWorkflowId(exception)}>
                        <td>
                          <div className="employee-info">
                            <div className="employee-name">
                              {getEmployeeName(exception)}
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
                            ? `${exception.exceptionReasonse.substring(0, 50)}...`
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
                              disabled={actionLoading}
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            <button
                              onClick={() => handleApprove(
                                getWorkflowId(exception),
                                getEmployeeName(exception)
                              )}
                              disabled={actionLoading}
                              className="btn-sm1 btn-approve"
                              title="Approve Exception"
                            >
                              <i className="fas fa-check"></i>
                            </button>
                            <button
                              onClick={() => handleReject(
                                getWorkflowId(exception),
                                getEmployeeName(exception)
                              )}
                              disabled={actionLoading}
                              className="btn-sm1 btn-reject"
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
                    <span>
                      Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} entries
                    </span>
                    <select 
                      value={itemsPerPage} 
                      onChange={handleItemsPerPageChange}
                      className="pageSizeSelect"
                    >
                      <option value="5">5 per page</option>
                      <option value="10">10 per page</option>
                      <option value="20">20 per page</option>
                      <option value="50">50 per page</option>
                    </select>
                  </div>
                  
                  <div className="paginationButtons">
                    <button
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                      className="btn btn-secondary"
                      title="Previous Page"
                    >
                      <i className="fas fa-chevron-left"></i>
                    </button>
                    
                    {getPageNumbers().map(page => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`btn ${currentPage === page ? 'btn-primary' : 'btn-secondary'}`}
                      >
                        {page}
                      </button>
                    ))}
                    
                    <button
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className="btn btn-secondary"
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

export { ExceptionsManagement, cacheUtils as exceptionsCacheUtils };
export default ExceptionsManagement;