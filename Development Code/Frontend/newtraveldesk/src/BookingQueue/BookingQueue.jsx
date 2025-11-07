import React, { useState, useEffect } from 'react';
import { checkAuthStatus, testApiConnectivity } from '../services/api';
import BookingModal from './BookingModal';
import DocumentUploadModal from './DocumentUploadModal';
import './BookingQueue.css';

const BookingQueue = ({ onTicketClick }) => {
  const [filters, setFilters] = useState({
    status: 'all',
    travelDate: '',
    search: ''
  });
  const [bookingTickets, setBookingTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingInProgress, setBookingInProgress] = useState({});
  const [markingBooked, setMarkingBooked] = useState({});
  const [authStatus, setAuthStatus] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showMarkBookedModal, setShowMarkBookedModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [recentBooking, setRecentBooking] = useState(null);
  const [comments, setComments] = useState('');
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    initializeComponent();
  }, []);

  const initializeComponent = async () => {
    try {
      setLoading(true);
      const auth = checkAuthStatus();
      setAuthStatus(auth);
      const apiTest = await testApiConnectivity();
      setDebugInfo(apiTest);
      await fetchUserId();
      await fetchPendingApprovals();
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
      setUserId(userData.id || userData.userId);
      console.log('✅ User ID fetched:', userData.id || userData.userId);
    } catch (err) {
      console.error('Error fetching user ID:', err);
      // Continue without user ID - we'll try to get it when needed
    }
  };

  const fetchPendingApprovals = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/travel-desk-proxy/api/travel-desk/approvals/pending', {
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
      
      const travelDeskBookingTickets = data.filter(
        ticket => ticket.currentStep === 'TRAVEL_DESK_BOOKING'
      );
      
      const transformedTickets = travelDeskBookingTickets.map(ticket => ({
        id: ticket.travelRequestId,
        workflowId: ticket.workflowId,
        employee: `Employee ${ticket.travelRequestId.substring(0, 8)}`,
        employeeId: `E${ticket.travelRequestId.substring(0, 6)}`,
        department: getDepartment(ticket.travelRequestId),
        travelDates: formatTravelDates(ticket),
        destination: getDestination(ticket.travelRequestId),
        estimatedCost: ticket.estimatedCost ? `₹${ticket.estimatedCost}` : 'Not specified',
        status: 'approved',
        statusText: 'Ready for Booking',
        approvalLevel: 'travel-desk',
        priority: mapPriority(ticket.priority),
        travelType: getTravelType(ticket.travelRequestId),
        dueDate: ticket.dueDate,
        createdAt: ticket.createdAt,
        originalData: ticket
      }));

      setBookingTickets(transformedTickets);
      
    } catch (err) {
      console.error('Error fetching pending approvals:', err);
      if (err.status === 401 || err.status === 403) {
        setError(`Authentication failed (${err.status}). Please check your login status.`);
      } else {
        setError(`Failed to load booking queue: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const mapPriority = (apiPriority) => {
    switch (apiPriority) {
      case 'HIGH': return 'high';
      case 'NORMAL': return 'medium';
      case 'LOW': return 'low';
      default: return 'medium';
    }
  };

  const formatTravelDates = (ticket) => {
    if (ticket.dueDate) {
      const dueDate = new Date(ticket.dueDate);
      return dueDate.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    }
    return 'Date not available';
  };

  const getDepartment = (travelRequestId) => {
    const departments = ['Finance', 'Sales', 'Engineering', 'Marketing', 'HR', 'Operations'];
    return departments[Math.floor(Math.random() * departments.length)];
  };

  const getDestination = (travelRequestId) => {
    const destinations = ['Pune', 'Bangalore', 'Delhi', 'Mumbai', 'Chennai', 'Hyderabad'];
    return destinations[Math.floor(Math.random() * destinations.length)];
  };

  const getTravelType = (travelRequestId) => {
    return Math.random() > 0.2 ? 'Domestic' : 'International';
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) {
      const now = new Date();
      return now.toISOString().replace('T', ' ').slice(0, 19);
    }
    
    if (dateTimeString.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)) {
      return dateTimeString;
    }
    
    if (dateTimeString.includes('T')) {
      return dateTimeString.replace('T', ' ') + ':00';
    }
    
    if (dateTimeString.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/)) {
      return dateTimeString + ':00';
    }
    
    return new Date().toISOString().replace('T', ' ').slice(0, 19);
  };

  const handleOpenBookingModal = (ticket) => {
    console.log('📝 Opening booking modal for ticket:', ticket);
    setSelectedTicket(ticket);
    setShowBookingModal(true);
  };

  const handleCloseBookingModal = () => {
    console.log('📝 Closing booking modal, but keeping selectedTicket for upload');
    setShowBookingModal(false);
  };

  const handleOpenMarkBookedModal = (ticket) => {
    console.log('📋 Opening mark booked modal for ticket:', ticket);
    console.log('📋 Workflow ID:', ticket.workflowId);
    console.log('📋 Travel Request ID:', ticket.id);
    setSelectedTicket(ticket);
    setComments('');
    setShowMarkBookedModal(true);
  };

  const handleCloseMarkBookedModal = () => {
    setShowMarkBookedModal(false);
    setSelectedTicket(null);
    setComments('');
  };

  const handleOpenUploadModal = (ticket, bookingData) => {
    console.log('📤 Opening upload modal with data:', {
      ticketId: ticket?.id,
      bookingId: bookingData?.bookingId,
      fullTicket: ticket,
      fullBooking: bookingData
    });
    
    if (!ticket?.id) {
      console.error('❌ Cannot open upload modal: ticket or ticket.id is undefined');
      alert('Error: Cannot open upload modal. Missing travel request information.');
      return;
    }
    
    if (!bookingData?.bookingId) {
      console.error('❌ Cannot open upload modal: bookingData or bookingId is undefined');
      alert('Error: Cannot open upload modal. Missing booking information.');
      return;
    }
    
    setSelectedTicket(ticket);
    setRecentBooking(bookingData);
    setShowUploadModal(true);
  };

  const handleCloseUploadModal = () => {
    console.log('📤 Closing upload modal and clearing all data');
    setShowUploadModal(false);
    setSelectedTicket(null);
    setRecentBooking(null);
  };

  const handleCreateBooking = async (bookingPayload) => {
    if (!selectedTicket) {
      console.error('❌ No selected ticket for booking');
      alert('Error: No ticket selected for booking.');
      return;
    }

    try {
      setBookingInProgress(prev => ({ ...prev, [selectedTicket.id]: true }));

      const apiPayload = {
        bookingType: bookingPayload.bookingType,
        details: bookingPayload.details.trim(),
        notes: bookingPayload.notes.trim(),
        bookingReference: bookingPayload.bookingReference.trim() || `REF-${Date.now()}`,
        bookingDate: formatDateTime(bookingPayload.bookingDate),
        bookingAmount: parseFloat(bookingPayload.bookingAmount),
        currency: bookingPayload.currency,
        status: bookingPayload.status,
        travelRequestId: selectedTicket.id,
        workflowId: selectedTicket.workflowId
      };

      console.log('📤 Making POST request with payload:', apiPayload);

      const endpoint = `/travel-desk-proxy/api/travel-desk/approvals/${selectedTicket.id}/bookings`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(apiPayload)
      });

      console.log('📋 Response status:', response.status);

      if (!response.ok) {
        let errorMessage = `Booking failed with status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
          console.error('❌ Server error details:', errorData);
        } catch (e) {
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const bookingResponse = await response.json();
      console.log('✅ Booking response:', bookingResponse);
      
      // Store booking in localStorage
      const existingBookings = JSON.parse(localStorage.getItem('travelBookings') || '[]');
      existingBookings.push({
        travelRequestId: selectedTicket.id,
        bookingId: bookingResponse.bookingId,
        bookingType: bookingResponse.bookingType,
        createdAt: new Date().toISOString(),
        bookingReference: bookingResponse.bookingReference,
        details: bookingResponse.details,
        amount: bookingResponse.bookingAmount,
        currency: bookingResponse.currency,
        status: bookingResponse.status
      });
      localStorage.setItem('travelBookings', JSON.stringify(existingBookings));
      
      // Close booking modal first
      setShowBookingModal(false);
      
      // Show success message with upload option
      const userChoice = window.confirm(
        `✅ Booking created successfully!\n\n` +
        `📋 Booking ID: ${bookingResponse.bookingId}\n` +
        `✈️ Type: ${bookingResponse.bookingType}\n` +
        `📍 Details: ${bookingResponse.details}\n\n` +
        `Would you like to upload documents for this booking now?`
      );

      if (userChoice) {
        handleOpenUploadModal(selectedTicket, bookingResponse);
      } else {
        setBookingTickets(prev => prev.filter(t => t.id !== selectedTicket.id));
        setSelectedTicket(null);
        alert('Booking completed! You can upload documents later from the bookings list.');
      }
      
    } catch (err) {
      console.error('Error creating booking:', err);
      alert(`❌ Booking failed: ${err.message}\n\nPlease check the console for more details.`);
      setShowBookingModal(false);
      setSelectedTicket(null);
    } finally {
      setBookingInProgress(prev => ({ ...prev, [selectedTicket.id]: false }));
    }
  };

  const handleMarkAsBooked = async () => {
    if (!selectedTicket) {
      alert('Error: No ticket selected.');
      return;
    }

    if (!comments.trim()) {
      alert('Please enter comments before marking as booked.');
      return;
    }

    if (!selectedTicket.workflowId) {
      alert('Error: Workflow ID not found for this ticket.');
      return;
    }

    try {
      setMarkingBooked(prev => ({ ...prev, [selectedTicket.id]: true }));

      // Ensure we have user ID
      let currentUserId = userId;
      if (!currentUserId) {
        await fetchUserId();
        currentUserId = userId;
        
        if (!currentUserId) {
          throw new Error('Unable to fetch user ID. Please try again.');
        }
      }

      const payload = {
        comments: comments.trim()
      };

      console.log('📤 Marking as booked with payload:', payload);
      console.log('👤 Using User ID:', currentUserId);
      console.log('🆔 Using Workflow ID:', selectedTicket.workflowId);

      // Use workflow ID in the endpoint instead of travel request ID
      const endpoint = `/travel-desk-proxy/api/travel-desk/approvals/${selectedTicket.workflowId}/mark-booked`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-User-Id': currentUserId
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      console.log('📋 Mark booked response status:', response.status);

      if (!response.ok) {
        let errorMessage = `Mark as booked failed with status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
          console.error('❌ Server error details:', errorData);
        } catch (e) {
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('✅ Mark booked response:', result);

      // Remove ticket from queue
      setBookingTickets(prev => prev.filter(t => t.id !== selectedTicket.id));
      
      // Close modal and show success message
      handleCloseMarkBookedModal();
      alert(`✅ Successfully marked as booked!\n\nComments: ${comments}`);
      
    } catch (err) {
      console.error('Error marking as booked:', err);
      alert(`❌ Failed to mark as booked: ${err.message}`);
    } finally {
      setMarkingBooked(prev => ({ ...prev, [selectedTicket.id]: false }));
    }
  };

  const handleUploadSuccess = (uploadResponse) => {
    console.log('✅ Document upload completed:', uploadResponse);
    
    if (selectedTicket) {
      setBookingTickets(prev => prev.filter(t => t.id !== selectedTicket.id));
    }
    
    alert(
      `🎉 Booking Process Completed!\n\n` +
      `✅ Booking Created Successfully\n` +
      `✅ Document Uploaded Successfully\n\n` +
      `📋 Booking ID: ${recentBooking?.bookingId}\n` +
      `📄 Document: ${uploadResponse.fileName}\n` +
      `📝 Type: ${uploadResponse.documentType}`
    );
    
    handleCloseUploadModal();
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

  const getStatusClass = (status) => 'status-approved';
  const getStatusText = (status) => 'Ready for Booking';

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high': return { class: 'priority-high', text: 'High', icon: 'fas fa-arrow-up' };
      case 'medium': return { class: 'priority-medium', text: 'Medium', icon: 'fas fa-minus' };
      case 'low': return { class: 'priority-low', text: 'Low', icon: 'fas fa-arrow-down' };
      default: return { class: 'priority-medium', text: 'Medium', icon: 'fas fa-minus' };
    }
  };

  const refreshData = () => {
    initializeComponent();
  };

  const handleLoginRedirect = () => {
    window.location.href = '/login';
  };

  const filteredTickets = bookingTickets.filter(ticket => {
    if (filters.status !== 'all' && ticket.status !== filters.status) return false;
    if (filters.priority && filters.priority !== 'all' && ticket.priority !== filters.priority) return false;
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        ticket.id.toLowerCase().includes(searchLower) ||
        ticket.employee.toLowerCase().includes(searchLower) ||
        ticket.destination.toLowerCase().includes(searchLower) ||
        ticket.department.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  if (loading) {
    return (
      <div className="booking-queue">
        <div className="loading-state">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading booking queue...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="booking-queue">
        <div className="error-state">
          <i className="fas fa-exclamation-triangle"></i>
          <h3>Authentication Required</h3>
          <p>{error}</p>
          <div className="error-actions">
            <button className="btn btn-primary" onClick={handleLoginRedirect}>
              <i className="fas fa-sign-in-alt"></i> Go to Login
            </button>
            <button className="btn btn-outline" onClick={refreshData}>
              <i className="fas fa-sync"></i> Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-queue">
      {/* Booking Modal */}
      <BookingModal
        isOpen={showBookingModal}
        onClose={handleCloseBookingModal}
        ticket={selectedTicket}
        onBook={handleCreateBooking}
        isBookingInProgress={selectedTicket ? bookingInProgress[selectedTicket.id] : false}
      />

      {/* Document Upload Modal */}
      <DocumentUploadModal
        isOpen={showUploadModal}
        onClose={handleCloseUploadModal}
        travelRequestId={selectedTicket?.id}
        bookingId={recentBooking?.bookingId}
        onUploadSuccess={handleUploadSuccess}
      />

      {/* Mark as Booked Modal */}
      {showMarkBookedModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Mark as Booked</h3>
              <button className="close-button" onClick={handleCloseMarkBookedModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="comments">Comments *</label>
                <textarea
                  id="comments"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Enter comments about the booking completion..."
                  rows="4"
                  required
                />
              </div>
              <div className="ticket-info">
                <p><strong>Ticket ID:</strong> {selectedTicket?.id}</p>
                <p><strong>Workflow ID:</strong> {selectedTicket?.workflowId}</p>
                <p><strong>Employee:</strong> {selectedTicket?.employee}</p>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-outline" 
                onClick={handleCloseMarkBookedModal}
                disabled={markingBooked[selectedTicket?.id]}
              >
                Cancel
              </button>
              <button 
                className="btn btn-success" 
                onClick={handleMarkAsBooked}
                disabled={markingBooked[selectedTicket?.id] || !comments.trim()}
              >
                {markingBooked[selectedTicket?.id] ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Processing...
                  </>
                ) : (
                  <>
                    <i className="fas fa-check"></i> Mark as Booked
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="queue-header">
        <div className="header-content">
          <h2>Booking Queue</h2>
          <p>{filteredTickets.length} tickets ready for booking</p>
          <div className="queue-stats">
            <div className="stat-item">
              <span className="stat-number">{filteredTickets.filter(t => t.priority === 'high').length}</span>
              <span className="stat-label">High Priority</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{filteredTickets.filter(t => t.priority === 'medium').length}</span>
              <span className="stat-label">Medium Priority</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{filteredTickets.length}</span>
              <span className="stat-label">Total</span>
            </div>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn btn-outline" onClick={refreshData}>
            <i className="fas fa-sync-alt"></i> Refresh
          </button>
        </div>
      </div>

      <div className="filters">
        <div className="filter-item">
          <label htmlFor="priority-filter">Priority</label>
          <select 
            id="priority-filter"
            value={filters.priority || 'all'}
            onChange={(e) => handleFilterChange('priority', e.target.value)}
          >
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        <div className="filter-item">
          <label htmlFor="search">Search</label>
          <input 
            type="text" 
            id="search"
            placeholder="Ticket ID, Employee..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </div>
        <div className="filter-item" style={{justifyContent: 'flex-end'}}>
          <label>&nbsp;</label>
          <button className="btn btn-primary" onClick={applyFilters}>
            <i className="fas fa-filter"></i> Apply
          </button>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Ticket ID</th>
              <th>Employee</th>
              <th>Travel Dates</th>
              <th>Estimated Cost</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTickets.map(ticket => {
              const priority = getPriorityBadge(ticket.priority);
              const isBookingInProgress = bookingInProgress[ticket.id];
              const isMarkingBooked = markingBooked[ticket.id];
              
              return (
                <tr key={ticket.id} className={`priority-${ticket.priority}`}>
                  <td>
                    <div className="ticket-id">
                      <span>#{ticket.id.substring(0, 8)}...</span>
                      {ticket.priority === 'high' && (
                        <i className="fas fa-bolt urgent-indicator"></i>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="employee-info">
                      <div className="employee-name">{ticket.employee}</div>
                      <div className="employee-id">{ticket.employeeId}</div>
                    </div>
                  </td>
                  <td>
                    <div className="travel-dates">
                      <div className="date-range">{ticket.travelDates}</div>
                      <div className="days-away">
                        {ticket.dueDate && (() => {
                          const today = new Date();
                          const dueDate = new Date(ticket.dueDate);
                          const diffTime = dueDate - today;
                          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                          if (diffDays === 0) return 'Due today';
                          if (diffDays === 1) return '1 day';
                          if (diffDays > 1) return `${diffDays} days`;
                          return 'Overdue';
                        })()}
                      </div>
                    </div>
                  </td>
                  <td className="cost">{ticket.estimatedCost}</td>
                  <td>
                    <span className={`priority-badge ${priority.class}`}>
                      <i className={priority.icon}></i>
                      {priority.text}
                    </span>
                  </td>
                  <td>
                    <span className={`status ${getStatusClass(ticket.status)}`}>
                      {getStatusText(ticket.status)}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn btn-success btn-sm"
                        onClick={() => handleOpenBookingModal(ticket)}
                        disabled={isBookingInProgress || isMarkingBooked}
                      >
                        <i className="fas fa-calendar-plus"></i>
                        Book
                      </button>
                      <button 
                        className="btn btn-primary btn-sm"
                        onClick={() => handleOpenMarkBookedModal(ticket)}
                        disabled={isBookingInProgress || isMarkingBooked}
                      >
                        <i className="fas fa-check"></i>
                        Mark Booked
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredTickets.length === 0 && !loading && (
        <div className="empty-state">
          <i className="fas fa-calendar-check"></i>
          <h3>No tickets in booking queue</h3>
          <p>All tickets have been booked or no tickets are currently ready for booking.</p>
          <button className="btn btn-primary" onClick={refreshData}>
            <i className="fas fa-sync"></i> Check for New Tickets
          </button>
        </div>
      )}
    </div>
  );
};

export default BookingQueue;