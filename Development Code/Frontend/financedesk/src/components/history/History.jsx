// components/History.js
import React, { useState, useMemo } from 'react';
import { useHistory } from '../../hooks/useHistory.js';
import { 
  formatDateTime, 
  getStatusBadgeClass, 
  getStatusText,
  exportHistoryData,
  printRequestDetails 
} from '../../services/historyService.js';
import './History.css';

const History = () => {
  const { historyRequests, loading, error, refreshHistory } = useHistory();
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Calculate pagination values
  const totalPages = Math.ceil(historyRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  // Get current page requests
  const currentRequests = useMemo(() => {
    return historyRequests.slice(startIndex, endIndex);
  }, [historyRequests, startIndex, endIndex]);

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setShowDetailsModal(true);
  };

  const handleCloseDetails = () => {
    setShowDetailsModal(false);
    setSelectedRequest(null);
  };

  const handlePrint = (requestId) => {
    printRequestDetails(requestId);
  };

  const handleExportHistory = async () => {
    await exportHistoryData(historyRequests);
  };

  // Pagination handlers
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

  const handlePageClick = (page) => {
    setCurrentPage(page);
  };

  // Loading State
  if (loading) {
    return (
      <div className="history">
        <div className="loading-state">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading history...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="history">
        <div className="error-state">
          <i className="fas fa-exclamation-triangle"></i>
          <h3>Error Loading History</h3>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={refreshHistory}>
            <i className="fas fa-sync"></i> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="history">
      <h2 className="section-title">Request History</h2>
      
      <HistoryTable 
        historyRequests={currentRequests}
        totalRequests={historyRequests.length}
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        startIndex={startIndex}
        endIndex={endIndex}
        onViewDetails={handleViewDetails}
        onPrint={handlePrint}
        onExport={handleExportHistory}
        onNextPage={handleNextPage}
        onPrevPage={handlePrevPage}
        onPageClick={handlePageClick}
      />

      <DetailsModal 
        show={showDetailsModal}
        request={selectedRequest}
        onClose={handleCloseDetails}
        onPrint={handlePrint}
      />
    </div>
  );
};

// Sub-component for History Table
const HistoryTable = ({ 
  historyRequests, 
  totalRequests,
  currentPage,
  totalPages,
  itemsPerPage,
  startIndex,
  endIndex,
  onViewDetails, 
  onPrint, 
  onExport,
  onNextPage,
  onPrevPage,
  onPageClick 
}) => (
  <div className="history-card">
    <div className="card-header">
      <h3>All Processed Requests</h3>
      <div className="header-actions">
        <div className="header-info">
          <span className="total-count">{totalRequests} requests found</span>
          {totalRequests > itemsPerPage && (
            <span className="pagination-info">
              Showing {startIndex + 1}-{Math.min(endIndex, totalRequests)} of {totalRequests}
            </span>
          )}
        </div>
        <button className="export-btn" onClick={onExport}>
          <i className="fas fa-download"></i>
          Export History
        </button>
      </div>
    </div>
    
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th className="col-request-id">Request ID</th>
            <th className="col-employee">Employee</th>
            <th className="col-type">Type</th>
            <th className="col-amount">Amount (₹)</th>
            <th className="col-status">Status</th>
            <th className="col-approved-date">Approved Date</th>
            <th className="col-finance-action">Finance Action</th>
            <th className="col-actions">Actions</th>
          </tr>
        </thead>
        <tbody>
          {historyRequests.map(request => (
            <HistoryTableRow 
              key={request.actionId}
              request={request}
              onViewDetails={onViewDetails}
              onPrint={onPrint}
            />
          ))}
        </tbody>
      </table>
    </div>

    {/* Pagination Controls */}
    {totalPages > 1 && (
      <div className="pagination-controls">
        <button 
          className="pagination-btn prev"
          onClick={onPrevPage}
          disabled={currentPage === 1}
        >
          <i className="fas fa-chevron-left"></i> Previous
        </button>
        
        <div className="pagination-numbers">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              className={`pagination-number ${page === currentPage ? 'active' : ''}`}
              onClick={() => onPageClick(page)}
            >
              {page}
            </button>
          ))}
        </div>
        
        <button 
          className="pagination-btn next"
          onClick={onNextPage}
          disabled={currentPage === totalPages}
        >
          Next <i className="fas fa-chevron-right"></i>
        </button>
      </div>
    )}

    {historyRequests.length === 0 && (
      <div className="empty-state">
        <i className="fas fa-history"></i>
        <h3>No History Found</h3>
        <p>No processed requests found in the history.</p>
      </div>
    )}
  </div>
);

// Sub-component for Table Row
const HistoryTableRow = ({ request, onViewDetails, onPrint }) => (
  <tr>
    <td className="request-id">
      <div className="request-id-text">
        {request.id?.substring(0, 8) || 'N/A'}...
      </div>
    </td>
    <td className="employee-name">{request.employee || 'N/A'}</td>
    <td className="request-type">{request.type || 'N/A'}</td>
    <td className="amount">₹{request.amount ? request.amount.toLocaleString() : '0'}</td>
    <td className="status">
      <span className={`status-badge ${getStatusBadgeClass(request.status)}`}>
        {getStatusText(request.status)}
      </span>
    </td>
    <td className="approved-date">{request.approvedDate || 'N/A'}</td>
    <td className="finance-comments">
      {request.financeAction ? (
        request.financeAction.length > 50 
          ? `${request.financeAction.substring(0, 50)}...` 
          : request.financeAction
      ) : 'No comments'}
    </td>
    <td className="action-buttons">
      <button 
        className="icon-btn view-btn"
        onClick={() => onViewDetails(request)}
        title="View Details"
      >
        <i className="fas fa-eye"></i>
      </button>
      <button 
        className="icon-btn print-btn"
        onClick={() => onPrint(request.id)}
        title="Print"
      >
        <i className="fas fa-print"></i>
      </button>
    </td>
  </tr>
);

// Sub-component for Details Modal
const DetailsModal = ({ show, request, onClose, onPrint }) => {
  if (!show || !request) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content details-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-section">
            <h3>Request Details</h3>
            <span className="request-id-badge">{request.id}</span>
          </div>
          <button className="modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="modal-body">
          <DetailsGrid request={request} />
        </div>
        
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>
            <i className="fas fa-times"></i> Close
          </button>
          <button 
            className="btn btn-primary" 
            onClick={() => onPrint(request.id)}
          >
            <i className="fas fa-print"></i> Print Details
          </button>
        </div>
      </div>
    </div>
  );
};

// Sub-component for Details Grid
const DetailsGrid = ({ request }) => (
  <div className="details-grid">
    <DetailSection title="Basic Information" icon="fas fa-info-circle">
      <DetailRow label="Request ID:" value={request.id} />
      <DetailRow label="Action ID:" value={request.actionId} />
      <DetailRow label="Workflow ID:" value={request.workflowId} />
      <DetailRow label="Employee:" value={request.employee} />
      <DetailRow label="Travel Purpose:" value={request.travelPurpose} />
    </DetailSection>

    <DetailSection title="Financial Information" icon="fas fa-money-bill-wave">
      <DetailRow 
        label="Estimated Cost:" 
        value={`₹${request.amount ? request.amount.toLocaleString() : '0'}`} 
      />
      <DetailRow 
        label="Amount Approved:" 
        value={
          request.amountApproved 
            ? `₹${request.amountApproved.toLocaleString()}` 
            : 'Not specified'
        } 
      />
      <DetailRow label="Destination:" value={request.destination} />
    </DetailSection>

    <DetailSection title="Approval Details" icon="fas fa-clipboard-check">
      <DetailRow 
        label="Status:" 
        value={
          <span className={`status-badge ${getStatusBadgeClass(request.status)}`}>
            {getStatusText(request.status)}
          </span>
        } 
      />
      <DetailRow label="Approver Role:" value={request.approverRole} />
      <DetailRow label="Action:" value={request.action} />
      <DetailRow label="Step:" value={request.step} />
      <DetailRow 
        label="Action Taken:" 
        value={formatDateTime(request.originalData?.actionTakenAt) || 'N/A'} 
      />
    </DetailSection>

    <DetailSection title="Comments & Notes" icon="fas fa-comments" fullWidth>
      <DetailRow 
        label="Finance Comments:" 
        value={
          <span className="comments-text">
            {request.financeAction || 'No comments provided'}
          </span>
        } 
      />
      {request.escalationReason && (
        <DetailRow 
          label="Escalation Reason:" 
          value={
            <span className="escalation-text">
              {request.escalationReason}
            </span>
          } 
        />
      )}
    </DetailSection>
  </div>
);

// Sub-component for Detail Section
const DetailSection = ({ title, children, fullWidth = false, icon }) => (
  <div className={`detail-section ${fullWidth ? 'full-width' : ''}`}>
    <h4 className="detail-section-title">
      {icon && <i className={icon}></i>}
      {title}
    </h4>
    <div className="detail-section-content">
      {children}
    </div>
  </div>
);

// Sub-component for Detail Row
const DetailRow = ({ label, value }) => (
  <div className="detail-row">
    <label className="detail-label">{label}</label>
    <span className="detail-value">{value}</span>
  </div>
);

export default History;