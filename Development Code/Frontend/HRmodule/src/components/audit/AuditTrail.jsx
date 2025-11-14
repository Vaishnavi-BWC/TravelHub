import React, { useState, useEffect } from 'react';
import { hrAuditService } from '../../services/hrAuditService';
import RequestDetailsModal from './RequestDetailsModal';
import './AuditTrail.css';

const AuditTrail = () => {
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Cache keys
  const CACHE_KEYS = {
    AUDIT_LOGS: 'hr_audit_logs_cache',
    TIMESTAMP: 'hr_audit_logs_timestamp',
    FILTER: 'hr_audit_logs_filter'
  };

  // Cache duration - 5 minutes
  const CACHE_DURATION = 5 * 60 * 1000;

  // Check if cache is valid
  const isCacheValid = () => {
    const cachedTimestamp = localStorage.getItem(CACHE_KEYS.TIMESTAMP);
    const cachedFilter = localStorage.getItem(CACHE_KEYS.FILTER);
    
    if (!cachedTimestamp || !cachedFilter) {
      return false;
    }

    const now = Date.now();
    const cacheAge = now - parseInt(cachedTimestamp, 10);
    const isSameFilter = cachedFilter === filter;

    return cacheAge < CACHE_DURATION && isSameFilter;
  };

  // Get data from cache
  const getCachedData = () => {
    try {
      const cachedData = localStorage.getItem(CACHE_KEYS.AUDIT_LOGS);
      return cachedData ? JSON.parse(cachedData) : null;
    } catch (error) {
      console.error('Error reading cache:', error);
      return null;
    }
  };

  // Save data to cache
  const saveToCache = (data) => {
    try {
      localStorage.setItem(CACHE_KEYS.AUDIT_LOGS, JSON.stringify(data));
      localStorage.setItem(CACHE_KEYS.TIMESTAMP, Date.now().toString());
      localStorage.setItem(CACHE_KEYS.FILTER, filter);
    } catch (error) {
      console.error('Error saving to cache:', error);
    }
  };

  // Clear cache
  const clearCache = () => {
    try {
      localStorage.removeItem(CACHE_KEYS.AUDIT_LOGS);
      localStorage.removeItem(CACHE_KEYS.TIMESTAMP);
      localStorage.removeItem(CACHE_KEYS.FILTER);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  };

  useEffect(() => {
    loadAuditTrail();
  }, [filter]);

  useEffect(() => {
    // Reset to page 1 when search term changes
    setCurrentPage(1);
  }, [searchTerm]);

  const loadAuditTrail = async () => {
    // Check cache first
    if (isCacheValid()) {
      const cachedData = getCachedData();
      if (cachedData && Array.isArray(cachedData)) {
        console.log('📊 Loading HR Audit logs from cache');
        setAuditLogs(cachedData);
        return;
      }
    }

    setLoading(true);
    setError(null);
    try {
      const filters = filter !== 'All' ? { action: filter } : {};
      const logs = await hrAuditService.getAuditTrail(filters);
      console.log('📊 HR Audit logs received from API:', logs);
      
      const processedLogs = Array.isArray(logs) ? logs : [];
      setAuditLogs(processedLogs);
      
      // Save to cache
      saveToCache(processedLogs);
    } catch (err) {
      // If API fails, try to use cached data as fallback
      const cachedData = getCachedData();
      if (cachedData && Array.isArray(cachedData)) {
        console.log('📊 Using cached data as fallback');
        setAuditLogs(cachedData);
        setError('Network error: Showing cached data. ' + err.message);
      } else {
        setError(err.message);
      }
      console.error('Error loading HR audit trail:', err);
    } finally {
      setLoading(false);
    }
  };

  // Format Request ID to show "T-{last 5 characters}" for display only
  const formatRequestId = (travelRequestId) => {
    if (!travelRequestId) return 'N/A';
    return `T-${travelRequestId.slice(-5)}`;
  };

  // Format employee name with formatted ID in brackets
  const formatEmployeeName = (employeeName, travelRequestId) => {
    if (!employeeName) return 'N/A';
    const formattedId = formatRequestId(travelRequestId);
    return `${employeeName} (${formattedId})`;
  };

  // Format amount in Indian Rupees
  const formatAmount = (amount) => {
    if (amount === null || amount === undefined) return '₹0';
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  // Format date to "Nov 3, 2025" format
  const formatApprovedDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Get finance action text
  const getFinanceAction = (approverRole, action, comments) => {
    if (action === 'APPROVE') {
      return `Approved by ${approverRole} Department.`;
    }
    return comments || 'No action taken';
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setShowModal(true);
  };

  const handlePrint = (request) => {
    // Create a temporary iframe for printing
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    iframe.style.left = '-9999px';
    document.body.appendChild(iframe);

    const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Travel Request Details - ${request.travelRequestId}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
            color: #333;
            font-size: 14px;
            line-height: 1.4;
          }
          .header { 
            border-bottom: 2px solid #007bff; 
            padding-bottom: 10px; 
            margin-bottom: 20px; 
          }
          .section { 
            margin-bottom: 25px;
            page-break-inside: avoid;
          }
          .section h3 { 
            color: #007bff; 
            margin-bottom: 15px; 
            border-bottom: 1px solid #dee2e6; 
            padding-bottom: 5px; 
          }
          .info-grid { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 15px; 
          }
          .info-item { 
            margin-bottom: 10px; 
            padding: 8px; 
            background: #f8f9fa; 
            border-radius: 4px; 
            border: 1px solid #dee2e6;
          }
          .label { 
            font-weight: bold; 
            color: #555; 
            display: block; 
            margin-bottom: 4px;
            font-size: 12px;
          }
          .value { 
            color: #333;
          }
          .status-approved { 
            color: #28a745; 
            font-weight: bold; 
          }
          .status-rejected { 
            color: #dc3545; 
            font-weight: bold; 
          }
          .status-pending { 
            color: #ffc107; 
            font-weight: bold; 
          }
          .comments-box { 
            background: #f8f9fa; 
            padding: 15px; 
            border-radius: 5px; 
            margin-top: 10px; 
            border-left: 4px solid #007bff;
          }
          @media print {
            body { margin: 10mm; }
            .no-print { display: none !important; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 style="margin: 0 0 10px 0; color: #007bff;">Travel Request Details</h1>
          <p style="margin: 0; color: #666;">Generated on: ${new Date().toLocaleString()}</p>
        </div>
        
        <div class="section">
          <h3>Basic Information</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="label">Request ID:</span>
              <span class="value">${request.travelRequestId}</span>
            </div>
            <div class="info-item">
              <span class="label">Display ID:</span>
              <span class="value">${formatRequestId(request.travelRequestId)}</span>
            </div>
            <div class="info-item">
              <span class="label">Employee:</span>
              <span class="value">${request.employeeName}</span>
            </div>
            <div class="info-item">
              <span class="label">Travel Purpose:</span>
              <span class="value">${request.travelPurpose}</span>
            </div>
            <div class="info-item">
              <span class="label">Destination:</span>
              <span class="value">${request.destination || 'N/A'}</span>
            </div>
          </div>
        </div>

        <div class="section">
          <h3>Approval Details</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="label">Status:</span>
              <span class="value status-${request.status?.toLowerCase()}">${request.status}</span>
            </div>
            <div class="info-item">
              <span class="label">Approval Role:</span>
              <span class="value">${request.approverRole}</span>
            </div>
            <div class="info-item">
              <span class="label">Action:</span>
              <span class="value">${request.action}</span>
            </div>
            <div class="info-item">
              <span class="label">Step:</span>
              <span class="value">${request.step}</span>
            </div>
            <div class="info-item">
              <span class="label">Action Taken:</span>
              <span class="value">${formatDate(request.actionTakenAt)}</span>
            </div>
          </div>
        </div>

        <div class="section">
          <h3>Financial Information</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="label">Estimated Cost:</span>
              <span class="value">${formatAmount(request.estimatedCost)}</span>
            </div>
            <div class="info-item">
              <span class="label">Amount Approved:</span>
              <span class="value">${formatAmount(request.amountApproved || 0)}</span>
            </div>
          </div>
        </div>

        <div class="section">
          <h3>Comments & Notes</h3>
          <div class="comments-box">
            <p style="margin: 0;"><strong>Comments:</strong> ${request.comments || 'No comments provided'}</p>
            ${request.escalationReason ? `<p style="margin: 10px 0 0 0;"><strong>Escalation Reason:</strong> ${request.escalationReason}</p>` : ''}
          </div>
        </div>
      </body>
      </html>
    `;

    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    iframeDoc.open();
    iframeDoc.write(printContent);
    iframeDoc.close();

    // Wait for content to load and then trigger print
    iframe.onload = () => {
      setTimeout(() => {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
        
        // Clean up after printing
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      }, 500);
    };
  };

  // Filter logs based on search term
  const filteredLogs = auditLogs.filter(log =>
    (log.travelRequestId && log.travelRequestId.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (formatRequestId(log.travelRequestId) && formatRequestId(log.travelRequestId).toLowerCase().includes(searchTerm.toLowerCase())) ||
    (log.employeeName && log.employeeName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (log.travelPurpose && log.travelPurpose.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (log.comments && log.comments.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Remove duplicates based on travelRequestId to show only unique requests
  const uniqueRequests = filteredLogs.reduce((acc, current) => {
    const x = acc.find(item => item.travelRequestId === current.travelRequestId);
    if (!x) {
      return acc.concat([current]);
    } else {
      const currentDate = new Date(current.actionTakenAt);
      const existingDate = new Date(x.actionTakenAt);
      if (currentDate > existingDate) {
        return acc.filter(item => item.travelRequestId !== current.travelRequestId).concat([current]);
      }
      return acc;
    }
  }, []);

  // Pagination calculations
  const totalItems = uniqueRequests.length;
  const totalPagesCount = Math.ceil(totalItems / itemsPerPage);
  
  // Get current page items
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = uniqueRequests.slice(indexOfFirstItem, indexOfLastItem);

  // Pagination handlers
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const goToFirstPage = () => setCurrentPage(1);
  const goToLastPage = () => setCurrentPage(totalPagesCount);
  const goToPreviousPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPagesCount));

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPagesCount, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    return pageNumbers;
  };

  return (
    <>
      <div className="card">
        <div className="card-header">
          <div className="header-content">
            <h1>HR Request History</h1>
            <h2>All HR Processed Requests</h2>
          </div>
          <div className="header-actions">
            <span className="request-count">
              Showing {currentItems.length} of {totalItems} requests
            </span>
            <button className="export-btn">
              Export History
            </button>
          </div>
        </div>

        <div className="filters-section">
          <div className="search-filter">
            <i className="fas fa-search search-icon"></i>
            <input
              type="text"
              placeholder="Type here to search"
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-buttons">
            {["All", "APPROVED", "REJECTED", "CHANGES_REQUESTED", "ESCALATED"].map((action) => (
              <button
                key={action}
                onClick={() => setFilter(action)}
                className={`filter-btn ${filter === action ? 'filter-btn-active' : ''}`}
              >
                {action.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="card-body">
          {loading ? (
            <div className="loading">
              <i className="fas fa-spinner fa-spin"></i> Loading HR request history...
            </div>
          ) : error ? (
            <div className="error-message">
              <i className="fas fa-exclamation-circle"></i> {error}
            </div>
          ) : currentItems.length > 0 ? (
            <>
              <div className="table-container">
                <table className="request-history-table">
                  <thead>
                    <tr>
                      <th>Request ID</th>
                      <th>Employee</th>
                      <th>Type</th>
                      <th>Amount (₹)</th>
                      <th>Status</th>
                      <th>Approved Date</th>
                      <th>HR Action</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((log, index) => (
                      <tr key={index}>
                        <td className="request-id-cell">
                          {formatRequestId(log.travelRequestId)}
                        </td>
                        <td className="employee-cell">
                          {formatEmployeeName(log.employeeName, log.travelRequestId)}
                        </td>
                        <td className="type-cell">
                          Travel Request
                        </td>
                        <td className="amount-cell">
                          {formatAmount(log.estimatedCost)}
                        </td>
                        <td className="status-cell">
                          <span className={`status-badge status-${log.status?.toLowerCase()}`}>
                            {log.status || 'Pending'}
                          </span>
                        </td>
                        <td className="date-cell">
                          {formatApprovedDate(log.actionTakenAt)}
                        </td>
                        <td className="finance-action-cell">
                          {getFinanceAction(log.approverRole, log.action, log.comments)}
                        </td>
                        <td className="actions-cell">
                          <div className="action-buttons">
                            <button 
                              className="view-btn"
                              onClick={() => handleViewDetails(log)}
                              title="View Details"
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            <button 
                              className="print-btn"
                              onClick={() => handlePrint(log)}
                              title="Print Details"
                            >
                              <i className="fas fa-print"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              <div className="pagination-container">
                <div className="pagination-info">
                  <span>Show:</span>
                  <select 
                    value={itemsPerPage} 
                    onChange={handleItemsPerPageChange}
                    className="items-per-page-select"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                  <span>entries per page</span>
                </div>

                <div className="pagination-controls">
                  <button 
                    className="pagination-btn"
                    onClick={goToFirstPage}
                    disabled={currentPage === 1}
                  >
                    <i className="fas fa-angle-double-left"></i>
                  </button>
                  <button 
                    className="pagination-btn"
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                  >
                    <i className="fas fa-angle-left"></i>
                  </button>

                  {getPageNumbers().map(pageNumber => (
                    <button
                      key={pageNumber}
                      className={`pagination-btn ${currentPage === pageNumber ? 'pagination-btn-active' : ''}`}
                      onClick={() => handlePageChange(pageNumber)}
                    >
                      {pageNumber}
                    </button>
                  ))}

                  <button 
                    className="pagination-btn"
                    onClick={goToNextPage}
                    disabled={currentPage === totalPagesCount}
                  >
                    <i className="fas fa-angle-right"></i>
                  </button>
                  <button 
                    className="pagination-btn"
                    onClick={goToLastPage}
                    disabled={currentPage === totalPagesCount}
                  >
                    <i className="fas fa-angle-double-right"></i>
                  </button>
                </div>

                <div className="pagination-info">
                  Page {currentPage} of {totalPagesCount}
                </div>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <i className="fas fa-history empty-icon"></i>
              <h3>No HR Request History Found</h3>
              <p>No HR processed requests match your current filters.</p>
              <button onClick={loadAuditTrail} className="retry-btn">
                <i className="fas fa-redo"></i> Refresh Data
              </button>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <RequestDetailsModal
          request={selectedRequest}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
};

export default AuditTrail;