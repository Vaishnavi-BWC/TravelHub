// components/travel/TravelRequestList/TravelRequestList.js
import React, { useState, useEffect } from 'react'
import './TravelRequestList.css'

const TravelRequestList = ({
  requests,
  filter,
  onFilterChange,
  searchTerm,
  onSearchChange,
  onRequestClick,
  showEmployee,
  showSLA,
  filterOptions,
  searchPlaceholder,
  columns,
  onApprove,
  onReject,
  showActions = true
}) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const [showRejectPopup, setShowRejectPopup] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [rejectReason, setRejectReason] = useState('')

  // Calculate pagination
  const totalItems = requests.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentItems = requests.slice(startIndex, endIndex)

  // Reset to first page when filter or search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [filter, searchTerm])

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusVariant = (status) => {
    if (!status) return 'pending';
    return status.toLowerCase();
  };

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value))
    setCurrentPage(1)
  }

  const handleApproveClick = async (e, request) => {
    e.stopPropagation()
    if (onApprove && window.confirm('Are you sure you want to approve this request?')) {
      await onApprove(
        request.travelRequestId || request.id,
        request.workflowId || request.workflow_id,
        request
      );
    }
  }

  const handleRejectClick = (e, request) => {
    e.stopPropagation()
    setSelectedRequest(request)
    setRejectReason('')
    setShowRejectPopup(true)
  }

  const handleRejectConfirm = async () => {
    if (!rejectReason.trim()) {
      alert('Please enter a reason for rejection.')
      return
    }

    if (onReject && selectedRequest) {
      await onReject(
        selectedRequest.travelRequestId || selectedRequest.id,
        selectedRequest.workflowId || selectedRequest.workflow_id,
        selectedRequest,
        rejectReason
      );
      setShowRejectPopup(false)
      setSelectedRequest(null)
      setRejectReason('')
    }
  }

  const handleRejectCancel = () => {
    setShowRejectPopup(false)
    setSelectedRequest(null)
    setRejectReason('')
  }

  const renderPaginationButtons = () => {
    const buttons = []
    const maxVisiblePages = 5

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    // First page
    if (startPage > 1) {
      buttons.push(
        <button
          key={1}
          onClick={() => handlePageChange(1)}
          className="travel-request-list-pagination-btn"
        >
          1
        </button>
      )
      if (startPage > 2) {
        buttons.push(
          <span key="ellipsis1" className="travel-request-list-pagination-ellipsis">
            ...
          </span>
        )
      }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`travel-request-list-pagination-btn ${currentPage === i ? 'travel-request-list-pagination-btn-active' : ''}`}
        >
          {i}
        </button>
      )
    }

    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(
          <span key="ellipsis2" className="travel-request-list-pagination-ellipsis">
            ...
          </span>
        )
      }
      buttons.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className="travel-request-list-pagination-btn"
        >
          {totalPages}
        </button>
      )
    }

    return buttons
  }

  // Check if request is pending and actions should be shown
  const shouldShowActions = (request) => {
    return showActions && (request.status === 'PENDING' || request.status === 'pending')
  }

  return (
    <div className="card travel-request-list-card">
      {/* Reject Popup Modal */}
      {showRejectPopup && (
        <div className="reject-popup-overlay">
          <div className="reject-popup-modal">
            <div className="reject-popup-header">
              <h3>Reject Request</h3>
              <button 
                className="reject-popup-close"
                onClick={handleRejectCancel}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="reject-popup-body">
              <p>Please provide a reason for rejecting this request:</p>
              <textarea
                className="reject-reason-textarea"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter rejection reason..."
                rows="4"
              />
            </div>
            <div className="reject-popup-footer">
              <button
                className="btn btn-secondary"
                onClick={handleRejectCancel}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={handleRejectConfirm}
                disabled={!rejectReason.trim()}
              >
                Reject Request
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="card-header-flex travel-request-list-header">
        <div className="travel-request-list-filter-buttons">
          {filterOptions.map((option) => (
            <button
              key={option}
              onClick={() => onFilterChange(option)}
              className={`travel-request-list-filter-btn ${filter === option ? 'travel-request-list-filter-btn-active' : ''}`}
            >
              {option[0].toUpperCase() + option.slice(1)}
            </button>
          ))}
        </div>
        <div className="travel-request-list-search-box">
          <i className="fas fa-search travel-request-list-search-icon"></i>
          <input
            type="text"
            placeholder={searchPlaceholder}
            className="travel-request-list-search-input"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      <div className="card-body">
        <div className="travel-request-list-table-container">
          <table className="travel-request-list-table">
            <thead>
              <tr>
                {columns.map(column => (
                  <th key={column}>{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((request) => (
                  <tr
                    key={request.travelRequestId || request.id}
                    className="travel-request-list-row clickable-row"
                    onClick={() => onRequestClick(request.travelRequestId || request.id)}
                  >
                    <td className="travel-request-list-request-id">
                      {request.formattedRequestId || `T-${(request.travelRequestId || request.id)?.toString().slice(-6)}`}
                    </td>
                    {showEmployee && (
                      <td>
                        <div className="travel-request-list-employee-info">
                          <div className="travel-request-list-employee-name">
                            {request.employeeName || request.employee?.name || 'Unknown'}
                          </div>
                          {request.department && (
                            <div className="travel-request-list-employee-dept">
                              {request.department}
                            </div>
                          )}
                        </div>
                      </td>
                    )}
                    <td className="travel-request-list-destination">
                      {request.destination || 'Not specified'}
                    </td>
                    <td className="travel-request-list-dates">
                      {formatDate(request.startDate)} to {formatDate(request.endDate)}
                    </td>
                    <td className="travel-request-list-stage">
                      {request.currentStage || 'Initial'}
                    </td>
                    <td>
                      <span className={`travel-request-list-status status-${getStatusVariant(request.status)}`}>
                        {request.status ?
                          request.status.charAt(0).toUpperCase() + request.status.slice(1).toLowerCase()
                          : 'Pending'
                        }
                      </span>
                    </td>
                    {showSLA && (
                      <td className="travel-request-list-sla">
                        {request.slaStatus || 'On Track'}
                      </td>
                    )}
                    <td>
                      <div className="travel-request-list-action-buttons">
                        <button
                          className="travel-request-list-btn-icon travel-request-list-btn-view"
                          onClick={(e) => {
                            e.stopPropagation()
                            onRequestClick(request.travelRequestId || request.id)
                          }}
                          title="View Details"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        
                        {shouldShowActions(request) && (
                          <>
                            <button
                              className="travel-request-list-btn-icon travel-request-list-btn-approve"
                              onClick={(e) => handleApproveClick(e, request)}
                              title="Approve Request"
                            >
                              <i className="fas fa-check"></i>
                            </button>
                            <button
                              className="travel-request-list-btn-icon travel-request-list-btn-reject"
                              onClick={(e) => handleRejectClick(e, request)}
                              title="Reject Request"
                            >
                              <i className="fas fa-times"></i>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="travel-request-list-empty-row">
                  <td colSpan={columns.length} className="travel-request-list-empty-cell">
                    <div className="travel-request-list-empty-state">
                      <div className="travel-request-list-empty-icon">
                        <i className="fas fa-inbox"></i>
                      </div>
                      <div className="travel-request-list-empty-content">
                        <h3>No requests found</h3>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalItems > 0 && (
          <div className="travel-request-list-pagination">
            <div className="travel-request-list-pagination-info">
              Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} entries
            </div>
            
            <div className="travel-request-list-pagination-controls">
              <div className="travel-request-list-pagination-items-per-page">
                <label htmlFor="itemsPerPage">Show:</label>
                <select
                  id="itemsPerPage"
                  value={itemsPerPage}
                  onChange={handleItemsPerPageChange}
                  className="travel-request-list-pagination-select"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>

              <div className="travel-request-list-pagination-buttons">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="travel-request-list-pagination-btn travel-request-list-pagination-prev"
                >
                  <i className="fas fa-chevron-left"></i>
                </button>

                {renderPaginationButtons()}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="travel-request-list-pagination-btn travel-request-list-pagination-next"
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TravelRequestList