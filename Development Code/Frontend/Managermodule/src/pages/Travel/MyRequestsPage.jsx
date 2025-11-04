// components/requests/MyRequests.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { managerService } from '../../services/managerService';
import { travelService } from '../../services/travelService'; 
import './MyRequestPage.css';

const MyRequests = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [workflowStatuses, setWorkflowStatuses] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingWorkflows, setLoadingWorkflows] = useState({});
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 0,
    pageSize: 5,
    totalElements: 0,
    totalPages: 0
  });

  // Fetch workflow status for a single request
  const fetchWorkflowStatus = async (travelRequestId) => {
    try {
      setLoadingWorkflows(prev => ({ ...prev, [travelRequestId]: true }));
      console.log(`🔄 Fetching workflow for: ${travelRequestId}`);
      
      const workflowData = await managerService.getWorkflowStatus(travelRequestId);
      console.log(`✅ Workflow data for ${travelRequestId}:`, workflowData);
      
      setWorkflowStatuses(prev => ({
        ...prev,
        [travelRequestId]: workflowData
      }));
      
      return workflowData;
    } catch (err) {
      console.error(`❌ Error fetching workflow for ${travelRequestId}:`, err);
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
    console.log('🔄 Fetching workflow statuses for all requests...');
    
    const workflowPromises = requestList.map(request => 
      fetchWorkflowStatus(request.travelRequestId)
    );
    
    await Promise.all(workflowPromises);
    console.log('✅ All workflow statuses fetched');
  };

  // Fetch my travel requests with pagination
  const fetchMyRequests = async (page = 0, size = 5) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Fetching my travel requests...');
      
      // Get all requests first
      const allRequests = await managerService.getTravelRequestsFilteredByEmployee();
      
      // Apply filters and search
      const filtered = applyFilters(allRequests, searchTerm, statusFilter);
      
      // Implement client-side pagination
      const startIndex = page * size;
      const endIndex = startIndex + size;
      const paginatedRequests = filtered.slice(startIndex, endIndex);
      
      console.log('✅ My travel requests fetched:', paginatedRequests.length);
      
      setRequests(allRequests);
      setFilteredRequests(paginatedRequests);
      setPagination({
        currentPage: page,
        pageSize: size,
        totalElements: filtered.length,
        totalPages: Math.ceil(filtered.length / size)
      });

      // Fetch workflow statuses for the paginated requests
      await fetchAllWorkflowStatuses(paginatedRequests);
      
    } catch (err) {
      console.error('❌ Error fetching my requests:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters and search
  const applyFilters = useCallback((requests, search, status) => {
    let filtered = requests;

    // Apply search filter
    if (search) {
      filtered = filtered.filter(request => 
        request.travelRequestId?.toLowerCase().includes(search.toLowerCase()) ||
        request.purpose?.toLowerCase().includes(search.toLowerCase()) ||
        request.projectId?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Apply status filter
    if (status !== 'all') {
      filtered = filtered.filter(request => {
        const statusInfo = getStatusInfo(request, workflowStatuses[request.travelRequestId]);
        
        if (status === 'draft') return statusInfo.text === 'Draft';
        if (status === 'pending') return statusInfo.text === 'Pending';
        if (status === 'approved') return statusInfo.text === 'Approved';
        if (status === 'rejected') return statusInfo.text === 'Rejected';
        return true;
      });
    }

    return filtered;
  }, [workflowStatuses]);

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
      
      // Determine status text and class
      let statusText = status || 'Submitted';
      let statusClass = 'status-submitted';
      let stageText = currentStep || 'Submitted';
      
      if (status === 'PENDING') {
        statusText = 'Pending';
        statusClass = 'status-pending';
        // Format the stage text for better display
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
    
    // Convert snake_case or UPPER_CASE to readable text
    return stage
      .toLowerCase()
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Handle search
  const handleSearch = useCallback((term) => {
    setSearchTerm(term);
    const filtered = applyFilters(requests, term, statusFilter);
    const paginated = filtered.slice(0, pagination.pageSize);
    
    setFilteredRequests(paginated);
    setPagination(prev => ({
      ...prev,
      currentPage: 0,
      totalElements: filtered.length,
      totalPages: Math.ceil(filtered.length / prev.pageSize)
    }));

    // Fetch workflow statuses for the new filtered results
    fetchAllWorkflowStatuses(paginated);
  }, [requests, statusFilter, pagination.pageSize, applyFilters]);

  // Handle status filter change
  const handleStatusFilterChange = useCallback((status) => {
    setStatusFilter(status);
    const filtered = applyFilters(requests, searchTerm, status);
    const paginated = filtered.slice(0, pagination.pageSize);
    
    setFilteredRequests(paginated);
    setPagination(prev => ({
      ...prev,
      currentPage: 0,
      totalElements: filtered.length,
      totalPages: Math.ceil(filtered.length / prev.pageSize)
    }));

    // Fetch workflow statuses for the new filtered results
    fetchAllWorkflowStatuses(paginated);
  }, [requests, searchTerm, pagination.pageSize, applyFilters]);

  useEffect(() => {
    fetchMyRequests(0, 5);
  }, []);

  // Pagination handlers
  const handlePageChange = useCallback((page) => {
    const filtered = applyFilters(requests, searchTerm, statusFilter);
    const startIndex = page * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    const paginatedRequests = filtered.slice(startIndex, endIndex);
    
    setFilteredRequests(paginatedRequests);
    setPagination(prev => ({
      ...prev,
      currentPage: page
    }));

    // Fetch workflow statuses for the new page
    fetchAllWorkflowStatuses(paginatedRequests);
  }, [requests, searchTerm, statusFilter, pagination.pageSize, applyFilters]);

  const handleNextPage = useCallback(() => {
    if (pagination.currentPage < pagination.totalPages - 1) {
      handlePageChange(pagination.currentPage + 1);
    }
  }, [pagination.currentPage, pagination.totalPages, handlePageChange]);

  const handlePrevPage = useCallback(() => {
    if (pagination.currentPage > 0) {
      handlePageChange(pagination.currentPage - 1);
    }
  }, [pagination.currentPage, handlePageChange]);

  const handlePageSizeChange = useCallback((newSize) => {
    const filtered = applyFilters(requests, searchTerm, statusFilter);
    const paginatedRequests = filtered.slice(0, newSize);
    
    setFilteredRequests(paginatedRequests);
    setPagination({
      currentPage: 0,
      pageSize: newSize,
      totalElements: filtered.length,
      totalPages: Math.ceil(filtered.length / newSize)
    });

    // Fetch workflow statuses for the new page size
    fetchAllWorkflowStatuses(paginatedRequests);
  }, [requests, searchTerm, statusFilter, applyFilters]);

  // Action handlers
  const handleViewClick = useCallback((request) => {
    // Navigate to request detail page
    console.log('🔍 Navigating to request detail:', request.travelRequestId);
    navigate(`/request-detail/${request.travelRequestId}`);
  }, [navigate]);

const handleEditClick = useCallback((request) => {
  // Navigate to edit request page instead of showing alert
  console.log('✏️ Navigating to edit request:', request.travelRequestId);
  navigate(`/edit-request/${request.travelRequestId}`);
}, [navigate]);

const handleDeleteClick = useCallback(async (request) => {
  if (window.confirm(`Are you sure you want to delete request ${request.travelRequestId}?`)) {
    try {
      console.log('🗑️ Deleting request:', request.travelRequestId);
      
      // Call the travelService delete method
      await travelService.deleteTravelRequest(request.travelRequestId);
      
      // Refresh the requests list after successful deletion
      await fetchMyRequests(pagination.currentPage, pagination.pageSize);
      
      alert('Request deleted successfully!');
    } catch (error) {
      console.error('Error deleting request:', error);
      alert(`Failed to delete request: ${error.message}`);
    }
  }
}, [pagination.currentPage, pagination.pageSize]);

  const handleRefresh = useCallback(() => {
    fetchMyRequests(pagination.currentPage, pagination.pageSize);
  }, [pagination.currentPage, pagination.pageSize]);

  // Helper function to check if request is editable (draft status)
  const isRequestEditable = useCallback((request) => {
    return request.managerPresent === false;
  }, []);

  // Clear all filters
  const handleClearFilters = useCallback(() => {
    setSearchTerm('');
    setStatusFilter('all');
    fetchMyRequests(0, pagination.pageSize);
  }, [pagination.pageSize]);

  if (loading) {
    return (
      <div className="loadingState">
        <i className="fas fa-spinner fa-spin"></i> Loading my requests...
      </div>
    );
  }

  if (error) {
    return (
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
    );
  }

  return (
    <div className="card">
      <div className="cardHeader">
        <h2>My Travel Requests</h2>
       <br></br>
      </div>

      {/* Search and Filter Section */}
      <div className="filters-section">
        <div className="filter-controls">
          <div className="status-filters">
            <button 
              className={`status-filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
              onClick={() => handleStatusFilterChange('all')}
            >
              All
            </button>
            <button 
              className={`status-filter-btn ${statusFilter === 'draft' ? 'active' : ''}`}
              onClick={() => handleStatusFilterChange('draft')}
            >
              DRAFT
            </button>
            <button 
              className={`status-filter-btn ${statusFilter === 'pending' ? 'active' : ''}`}
              onClick={() => handleStatusFilterChange('pending')}
            >
              PENDING
            </button>
            <button 
              className={`status-filter-btn ${statusFilter === 'approved' ? 'active' : ''}`}
              onClick={() => handleStatusFilterChange('approved')}
            >
              APPROVED
            </button>
            <button 
              className={`status-filter-btn ${statusFilter === 'rejected' ? 'active' : ''}`}
              onClick={() => handleStatusFilterChange('rejected')}
            >
              REJECTED
            </button>
          </div>
          
          {(searchTerm || statusFilter !== 'all') && (
            <button 
              onClick={handleClearFilters}
              className="btn btnSecondary clear-filters"
            >
              <i className="fas fa-times"></i> Clear Filters
            </button>
          )}
        </div>
        
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Search by Request ID, Purpose, or Project ID..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button 
              onClick={() => handleSearch('')}
              className="clear-search"
              title="Clear search"
            >
              <i className="fas fa-times"></i>
            </button>
          )}
        </div>
      </div>

      <div className="cardBody">
        {filteredRequests.length === 0 ? (
          <div className="noData">
            <i className="fas fa-briefcase"></i>
            <h4>No Travel Requests</h4>
            <p>
              {searchTerm || statusFilter !== 'all' 
                ? 'No requests match your search criteria'
                : 'You haven\'t created any travel requests yet.'
              }
            </p>
            {(searchTerm || statusFilter !== 'all') && (
              <button 
                onClick={handleClearFilters}
                className="btn btnPrimary"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="table-container">
              <table className="requestsTable">
                <thead>
                  <tr>
                    <th>Request ID</th>
                    <th>Purpose</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Project ID</th>
                    <th>Created At</th>
                    <th>Status</th>
                    <th>Current Stage</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((request) => {
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
                          {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : 'N/A'}
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

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="paginationControls">
                <div className="paginationInfo">
                
                </div>
                
                <div className="paginationButtons">
                  <button
                    onClick={() => handlePageChange(0)}
                    disabled={pagination.currentPage === 0 || loading}
                    className="btn btnSecondary"
                  >
                    <i className="fas fa-angle-double-left"></i>
                  </button>
                  <button
                    onClick={handlePrevPage}
                    disabled={pagination.currentPage === 0 || loading}
                    className="btn btnSecondary"
                  >
                    <i className="fas fa-angle-left"></i>
                  </button>
                  
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let pageNum;
                    if (pagination.totalPages <= 5) {
                      pageNum = i;
                    } else if (pagination.currentPage <= 2) {
                      pageNum = i;
                    } else if (pagination.currentPage >= pagination.totalPages - 3) {
                      pageNum = pagination.totalPages - 5 + i;
                    } else {
                      pageNum = pagination.currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`btn ${pagination.currentPage === pageNum ? 'btnPrimary' : 'btnSecondary'}`}
                        disabled={loading}
                      >
                        {pageNum + 1}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={handleNextPage}
                    disabled={pagination.currentPage >= pagination.totalPages - 1 || loading}
                    className="btn btnSecondary"
                  >
                    <i className="fas fa-angle-right"></i>
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.totalPages - 1)}
                    disabled={pagination.currentPage >= pagination.totalPages - 1 || loading}
                    className="btn btnSecondary"
                  >
                    <i className="fas fa-angle-double-right"></i>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MyRequests;