import React, { useState, useEffect } from 'react';
import './BookingHistory.css';

const BookingHistory = ({ onTicketClick }) => {
  const [filters, setFilters] = useState({
    status: 'all',
    search: ''
  });
  const [travelRequests, setTravelRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [bookingSummary, setBookingSummary] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [showDocumentsModal, setShowDocumentsModal] = useState(false);

  // Fetch user ID and travel requests on component mount
  useEffect(() => {
    initializeComponent();
  }, []);

  // Fetch travel requests when userId changes
  useEffect(() => {
    if (userId) {
      fetchTravelRequests();
    }
  }, [userId]);

  const initializeComponent = async () => {
    try {
      setLoading(true);
      await fetchUserId();
      // fetchTravelRequests will be called automatically when userId is set
    } catch (err) {
      console.error('Initialization error:', err);
      setError(`Initialization failed: ${err.message}`);
      setLoading(false);
    }
  };

  const fetchUserId = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch user ID: ${response.status}`);
      }
      
      const userData = await response.json();
      const fetchedUserId = userData.id || userData.userId;
      setUserId(fetchedUserId);
      console.log('✅ User ID fetched:', fetchedUserId);
      return fetchedUserId;
    } catch (err) {
      console.error('Error fetching user ID:', err);
      setError('Failed to fetch user ID. Please check your authentication.');
      setLoading(false);
      throw err;
    }
  };

  const fetchTravelRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!userId) {
        console.log('🔄 User ID not available yet, waiting...');
        return;
      }

      console.log('🔄 Fetching travel requests with User ID:', userId);

      const response = await fetch('/travel-desk-proxy/api/travel-desk/history/my-actions', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-User-Id': userId
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Filter only COMPLETE_BOOKING actions
      const completeBookingRequests = data.filter(
        request => request.action === 'COMPLETE_BOOKING'
      );
      
      console.log('✅ COMPLETE_BOOKING requests:', completeBookingRequests);
      setTravelRequests(completeBookingRequests);
      
    } catch (err) {
      console.error('❌ Error fetching travel requests:', err);
      setError('Failed to load travel requests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch booking summary when a request is selected
  const fetchBookingSummary = async (travelRequest) => {
    try {
      setDetailsLoading(true);
      setError(null);
      setSelectedRequest(travelRequest);
      setBookingSummary(null);
      
      console.log('📊 Fetching booking summary for:', travelRequest.travelRequestId);

      const response = await fetch(`/travel-management/api/bookings/summary/${travelRequest.travelRequestId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Booking summary:', data);
      setBookingSummary(data);
      
    } catch (err) {
      console.error('❌ Error fetching booking summary:', err);
      setError(`Failed to load booking details: ${err.message}`);
    } finally {
      setDetailsLoading(false);
    }
  };

  // Fetch documents for a booking
  const fetchDocuments = async (travelRequestId) => {
    try {
      setDocumentsLoading(true);
      setError(null);

      console.log('📄 Fetching documents for travel request:', travelRequestId);

      const response = await fetch(`/travel-management/api/bookings/request/${travelRequestId}/documents`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          setDocuments([]);
          console.log('📄 No documents found for this booking');
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setDocuments(data);
      console.log('✅ Documents fetched:', data);
      setShowDocumentsModal(true);
      
    } catch (err) {
      console.error('❌ Error fetching documents:', err);
      if (err.message.includes('404')) {
        setDocuments([]);
        alert('No documents found for this booking.');
      } else {
        alert(`Failed to load documents: ${err.message}`);
      }
    } finally {
      setDocumentsLoading(false);
    }
  };

  // View document
  const handleViewDocument = (document) => {
    console.log('👁️ Viewing document:', document);
    
    // Construct the view URL using the document ID
    const viewUrl = `/travel-management/api/bookings/documents/${document.documentId}/view`;
    
    console.log('🔗 Opening document URL:', viewUrl);
    window.open(viewUrl, '_blank');
  };

  // Download document
  const handleDownloadDocument = (document) => {
    console.log('📥 Downloading document:', document);
    
    // Construct the download URL using the document ID
    const downloadUrl = `/travel-management/api/bookings/documents/${document.documentId}/download`;
    
    console.log('🔗 Downloading document URL:', downloadUrl);
    window.open(downloadUrl, '_blank');
  };

  // Helper functions for data transformation
  const formatBookedDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getBookingTypeBadge = (bookingType) => {
    const typeMap = {
      'FLIGHT': { class: 'booking-type-flight', icon: 'fas fa-plane' },
      'HOTEL': { class: 'booking-type-hotel', icon: 'fas fa-hotel' },
      'CAR_RENTAL': { class: 'booking-type-car', icon: 'fas fa-car' },
      'OTHER': { class: 'booking-type-other', icon: 'fas fa-receipt' }
    };
    
    return typeMap[bookingType] || { class: 'booking-type-other', icon: 'fas fa-receipt' };
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'CONFIRMED': { class: 'status-confirmed', text: 'Confirmed' },
      'PENDING': { class: 'status-pending', text: 'Pending' },
      'CANCELLED': { class: 'status-cancelled', text: 'Cancelled' },
      'COMPLETED': { class: 'status-completed', text: 'Completed' }
    };
    
    return statusMap[status] || { class: 'status-pending', text: status };
  };

  const getDocumentTypeBadge = (documentType) => {
    const typeMap = {
      'FLIGHT_TICKET': { class: 'doc-type-flight', icon: 'fas fa-ticket-alt' },
      'HOTEL_VOUCHER': { class: 'doc-type-hotel', icon: 'fas fa-hotel' },
      'INVOICE': { class: 'doc-type-invoice', icon: 'fas fa-file-invoice' },
      'RECEIPT': { class: 'doc-type-receipt', icon: 'fas fa-receipt' },
      'OTHER': { class: 'doc-type-other', icon: 'fas fa-file' }
    };
    
    return typeMap[documentType] || { class: 'doc-type-other', icon: 'fas fa-file' };
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const applyFilters = () => {
    console.log('Filters applied:', filters);
  };

  const getActionBadge = (action) => {
    switch (action) {
      case 'COMPLETE_BOOKING': 
        return { class: 'action-complete', text: 'Booking Completed', icon: 'fas fa-check-circle' };
      case 'APPROVE':
        return { class: 'action-approve', text: 'Approved', icon: 'fas fa-thumbs-up' };
      default:
        return { class: 'action-default', text: action, icon: 'fas fa-info-circle' };
    }
  };

  const handleViewDocuments = async (travelRequest) => {
    console.log('📄 Viewing documents for:', travelRequest);
    await fetchDocuments(travelRequest.travelRequestId);
  };

  const handleViewDetails = (travelRequest) => {
    console.log('👁️ Viewing details for:', travelRequest);
    fetchBookingSummary(travelRequest);
  };

  const clearSelection = () => {
    setSelectedRequest(null);
    setBookingSummary(null);
    setDocuments([]);
    setShowDocumentsModal(false);
  };

  const closeDocumentsModal = () => {
    setShowDocumentsModal(false);
    setDocuments([]);
  };

  // Filter travel requests based on current filters
  const filteredRequests = travelRequests.filter(request => {
    if (filters.status !== 'all' && request.action !== filters.status) return false;
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        request.employeeName.toLowerCase().includes(searchLower) ||
        request.travelPurpose.toLowerCase().includes(searchLower) ||
        request.travelRequestId.toLowerCase().includes(searchLower) ||
        (request.comments && request.comments.toLowerCase().includes(searchLower))
      );
    }
    return true;
  });

  if (loading) {
    return (
      <div className="booking-history">
        <div className="loading-state">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading booking history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-history">
      {/* Documents Modal */}
      {showDocumentsModal && (
        <div className="modal-overlay">
          <div className="modal-content documents-modal">
            <div className="modal-header">
              <h3>Booking Documents</h3>
              <button className="close-button" onClick={closeDocumentsModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              {documentsLoading ? (
                <div className="loading-state">
                  <i className="fas fa-spinner fa-spin"></i>
                  <p>Loading documents...</p>
                </div>
              ) : documents.length > 0 ? (
                <div className="documents-list">
                  {documents.map((doc, index) => {
                    const docTypeBadge = getDocumentTypeBadge(doc.documentType);
                    return (
                      <div key={doc.documentId} className="document-item">
                        <div className="document-icon">
                          <i className={docTypeBadge.icon}></i>
                        </div>
                        <div className="document-info">
                          <div className="document-name">{doc.originalFileName}</div>
                          <div className="document-meta">
                            <span className="document-type">
                              <i className={docTypeBadge.icon}></i>
                              {doc.documentType}
                            </span>
                            <span className="document-size">{formatFileSize(doc.fileSize)}</span>
                          </div>
                          {doc.description && (
                            <div className="document-description">{doc.description}</div>
                          )}
                          <div className="document-date">
                            Uploaded: {formatBookedDate(doc.uploadedAt)}
                          </div>
                          {/* Display Document ID and Booking ID */}
                          <div className="document-ids">
                            <div className="id-item">
                              <strong>Document ID:</strong> 
                              <span className="id-value">{doc.documentId}</span>
                            </div>
                            <div className="id-item">
                              <strong>Booking ID:</strong> 
                              <span className="id-value">{doc.travelBookingId}</span>
                            </div>
                            <div className="id-item">
                              <strong>Travel Request ID:</strong> 
                              <span className="id-value">{doc.travelRequestId}</span>
                            </div>
                          </div>
                        </div>
                        <div className="document-actions">
                          <button 
                            className="btn btn-primary btn-sm"
                            onClick={() => handleViewDocument(doc)}
                            title="View Document"
                          >
                            <i className="fas fa-eye"></i> View
                          </button>
                          <button 
                            className="btn btn-outline btn-sm"
                            onClick={() => handleDownloadDocument(doc)}
                            title="Download Document"
                          >
                            <i className="fas fa-download"></i> Download
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="empty-state">
                  <i className="fas fa-file-alt"></i>
                  <h3>No Documents Found</h3>
                  <p>No documents available for this booking.</p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={closeDocumentsModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="history-header">
        <div className="header-content">
          <h2>Booking History</h2>
          <p>
            {selectedRequest 
              ? `Booking details for ${selectedRequest.employeeName}`
              : 'Completed travel bookings history'
            }
          </p>
          
          {selectedRequest && bookingSummary && (
            <div className="history-stats">
              <div className="stat-card total">
                <div className="stat-icon">
                  <i className="fas fa-calendar-check"></i>
                </div>
                <div className="stat-info">
                  <div className="stat-number">{bookingSummary.totalBookings}</div>
                  <div className="stat-label">Total Bookings</div>
                </div>
              </div>
              <div className="stat-card amount">
                <div className="stat-icon">
                  <i className="fas fa-rupee-sign"></i>
                </div>
                <div className="stat-info">
                  <div className="stat-number">{formatCurrency(bookingSummary.totalBookingAmount)}</div>
                  <div className="stat-label">Total Amount</div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="header-actions">
          {selectedRequest ? (
            <button className="btn btn-outline" onClick={clearSelection}>
              <i className="fas fa-arrow-left"></i> Back to List
            </button>
          ) : (
            <button className="btn btn-outline" onClick={fetchTravelRequests}>
              <i className="fas fa-sync-alt"></i> Refresh
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          <span>{error}</span>
          <button className="btn btn-sm btn-outline" onClick={() => setError(null)}>
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}

      {/* Travel Requests List - Show when no request is selected */}
      {!selectedRequest && (
        <>
          <div className="filters">
            <div className="filter-item">
              <label htmlFor="search">Search</label>
              <input 
                type="text" 
                id="search"
                placeholder="Employee, Purpose, Request ID..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
            <div className="filter-item" style={{justifyContent: 'flex-end'}}>
              <label>&nbsp;</label>
              <button className="btn btn-primary" onClick={applyFilters}>
                <i className="fas fa-filter"></i> Apply Filters
              </button>
            </div>
          </div>

          <div className="requests-list">
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Request ID</th>
                    <th>Employee</th>
                    <th>Travel Purpose</th>
                    <th>Estimated Cost</th>
                    <th>Approver</th>
                    <th>Completed On</th>
                    <th>Comments</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map(request => {
                    const actionBadge = getActionBadge(request.action);
                    
                    return (
                      <tr key={request.actionId} className="request-row">
                        <td>
                          <div className="request-id">
                            <code>{request.travelRequestId.substring(0, 8)}...</code>
                          </div>
                        </td>
                        <td>
                          <div className="employee-info">
                            <div className="employee-name">{request.employeeName}</div>
                          </div>
                        </td>
                        <td>
                          <div className="travel-purpose">
                            {request.travelPurpose}
                          </div>
                        </td>
                        <td>
                          <div className="estimated-cost">
                            {request.estimatedCost ? `₹${request.estimatedCost}` : 'N/A'}
                          </div>
                        </td>
                        <td>
                          <div className="approver">
                            {request.approverName || 'N/A'}
                          </div>
                        </td>
                        <td>
                          <div className="action-date">
                            {formatBookedDate(request.actionTakenAt)}
                          </div>
                        </td>
                        <td>
                          <div className="comments">
                            {request.comments || 'No comments'}
                          </div>
                        </td>
                        <td>
                          <span className={`action-badge ${actionBadge.class}`}>
                            <i className={actionBadge.icon}></i>
                            {actionBadge.text}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              className="btn btn-primary btn-sm"
                              onClick={() => handleViewDetails(request)}
                              disabled={detailsLoading}
                              title="View Details"
                            >
                              <i className="fas fa-eye"></i>
                              Details
                            </button>
                            <button 
                              className="btn btn-info btn-sm"
                              onClick={() => handleViewDocuments(request)}
                              disabled={documentsLoading}
                              title="View Documents"
                            >
                              {documentsLoading ? (
                                <i className="fas fa-spinner fa-spin"></i>
                              ) : (
                                <i className="fas fa-file-alt"></i>
                              )}
                              Documents
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredRequests.length === 0 && !loading && (
              <div className="empty-state">
                <i className="fas fa-search"></i>
                <h3>No Completed Bookings Found</h3>
                <p>No completed travel bookings match your search criteria.</p>
                <button className="btn btn-primary" onClick={() => setFilters({ status: 'all', search: '' })}>
                  <i className="fas fa-times"></i> Clear Filters
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Booking Details - Show when a request is selected */}
      {selectedRequest && (
        <>
          {detailsLoading ? (
            <div className="loading-state">
              <i className="fas fa-spinner fa-spin"></i>
              <p>Loading booking details...</p>
            </div>
          ) : bookingSummary ? (
            <div className="booking-details-section">
              {/* Request Information */}
              <div className="detail-card">
                <h4>Travel Request Information</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Request ID:</label>
                    <span>{selectedRequest.travelRequestId}</span>
                  </div>
                  <div className="detail-item">
                    <label>Employee:</label>
                    <span>{selectedRequest.employeeName}</span>
                  </div>
                  <div className="detail-item">
                    <label>Travel Purpose:</label>
                    <span>{selectedRequest.travelPurpose}</span>
                  </div>
                  <div className="detail-item">
                    <label>Estimated Cost:</label>
                    <span>{selectedRequest.estimatedCost ? `₹${selectedRequest.estimatedCost}` : 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Approver:</label>
                    <span>{selectedRequest.approverName || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Completed On:</label>
                    <span>{formatBookedDate(selectedRequest.actionTakenAt)}</span>
                  </div>
                  <div className="detail-item full-width">
                    <label>Comments:</label>
                    <span>{selectedRequest.comments || 'No comments'}</span>
                  </div>
                </div>
              </div>

              {/* Booking Summary */}
              <div className="detail-card">
                <h4>Booking Summary</h4>
                <div className="booking-summary">
                  <div className="summary-stats">
                    <div className="summary-stat">
                      <span className="stat-label">Total Bookings</span>
                      <span className="stat-value">{bookingSummary.totalBookings}</span>
                    </div>
                    <div className="summary-stat">
                      <span className="stat-label">Total Amount</span>
                      <span className="stat-value">{formatCurrency(bookingSummary.totalBookingAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bookings List */}
              <div className="detail-card">
                <h4>Bookings</h4>
                <div className="bookings-list">
                  {bookingSummary.bookings.map((booking, index) => {
                    const typeBadge = getBookingTypeBadge(booking.bookingType);
                    const statusBadge = getStatusBadge(booking.status);
                    
                    return (
                      <div key={booking.bookingId} className="booking-item">
                        <div className="booking-header">
                          <div className="booking-type">
                            <span className={`booking-type-badge ${typeBadge.class}`}>
                              <i className={typeBadge.icon}></i>
                              {booking.bookingType}
                            </span>
                          </div>
                          <div className="booking-status">
                            <span className={`status-badge ${statusBadge.class}`}>
                              {statusBadge.text}
                            </span>
                          </div>
                        </div>
                        <div className="booking-details">
                          <div className="booking-info">
                            <div className="booking-reference">
                              <strong>Reference:</strong> {booking.bookingReference}
                            </div>
                            <div className="booking-amount">
                              <strong>Amount:</strong> {formatCurrency(booking.bookingAmount)}
                            </div>
                            <div className="booking-date">
                              <strong>Booked:</strong> {formatBookedDate(booking.bookingDate)}
                            </div>
                          </div>
                          <div className="booking-notes">
                            <strong>Details:</strong> {booking.details}
                          </div>
                          {booking.notes && (
                            <div className="booking-notes">
                              <strong>Notes:</strong> {booking.notes}
                            </div>
                          )}
                          <div className="booking-id">
                            <small>Booking ID: {booking.bookingId}</small>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <i className="fas fa-history"></i>
              <h3>No Booking Details</h3>
              <p>No detailed booking information found for this request.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BookingHistory;