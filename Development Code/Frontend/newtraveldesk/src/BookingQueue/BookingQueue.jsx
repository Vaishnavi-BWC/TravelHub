import React, { useState, useEffect } from 'react';
import { travelDeskApi, travelManagementApi, checkAuthStatus, testApiConnectivity } from '../services/api';
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
  const [authStatus, setAuthStatus] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);

  // Check authentication and fetch data on component mount
  useEffect(() => {
    initializeComponent();
  }, []);

  const initializeComponent = async () => {
    try {
      setLoading(true);
      
      // Check auth status
      const auth = checkAuthStatus();
      setAuthStatus(auth);
      
      // Test API connectivity
      const apiTest = await testApiConnectivity();
      setDebugInfo(apiTest);
      
      console.log('🔧 Debug Info:', {
        authStatus: auth,
        apiTest: apiTest,
        currentDomain: window.location.hostname,
        cookieDomain: document.cookie ? 'cookies present' : 'no cookies'
      });

      if (!auth.hasToken) {
        // Even without token, try to fetch data (might work with session cookies)
        console.log('⚠️ No token found, but trying API call with session cookies...');
        await fetchPendingApprovals();
      } else {
        await fetchPendingApprovals();
      }
      
    } catch (err) {
      console.error('❌ Initialization error:', err);
      setError(`Initialization failed: ${err.message}`);
      setLoading(false);
    }
  };

  // Fetch pending approvals from API
  const fetchPendingApprovals = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🚀 Fetching pending approvals...');
      const data = await travelDeskApi.get('/approvals/pending');
      
      console.log('✅ API Response received:', data);
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format: expected array');
      }
      
      // Filter only tickets with TRAVEL_DESK_BOOKING currentStep
      const travelDeskBookingTickets = data.filter(
        ticket => ticket.currentStep === 'TRAVEL_DESK_BOOKING'
      );
      
      console.log('🎫 Tickets ready for booking:', travelDeskBookingTickets);
      
      if (travelDeskBookingTickets.length === 0) {
        console.log('ℹ️ No tickets with TRAVEL_DESK_BOOKING status found');
      }
      
      // Transform API data to match component structure
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
      console.error('❌ Error fetching pending approvals:', err);
      
      if (err.status === 401 || err.status === 403) {
        setError(`Authentication failed (${err.status}). Please check your login status.`);
      } else {
        setError(`Failed to load booking queue: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper function to map API priority to component priority
  const mapPriority = (apiPriority) => {
    switch (apiPriority) {
      case 'HIGH':
        return 'high';
      case 'NORMAL':
        return 'medium';
      case 'LOW':
        return 'low';
      default:
        return 'medium';
    }
  };

  // Helper function to format travel dates
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

  // Placeholder functions for demo data
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

  // Handle booking process
  const handleBookTicket = async (ticket) => {
    try {
      setBookingInProgress(prev => ({ ...prev, [ticket.id]: true }));
      
      const bookingPayload = {
        bookingType: "FLIGHT",
        details: "Travel booking created from travel desk",
        notes: `Booking for travel request ${ticket.id}`,
        createdAt: new Date().toISOString()
      };

      console.log('📤 Creating booking for ticket:', ticket.id);
      
      const bookingResponse = await travelManagementApi.post(`/travel-bookings/${ticket.id}`, bookingPayload);
      
      console.log('✅ Booking created successfully:', bookingResponse);
      
      // Store booking ID
      const existingBookings = JSON.parse(localStorage.getItem('travelBookings') || '[]');
      existingBookings.push({
        travelRequestId: ticket.id,
        bookingId: bookingResponse.bookingId,
        bookingType: bookingResponse.bookingType,
        createdAt: new Date().toISOString()
      });
      localStorage.setItem('travelBookings', JSON.stringify(existingBookings));
      
      // Remove the booked ticket from the queue
      setBookingTickets(prev => prev.filter(t => t.id !== ticket.id));
      
      alert(`✅ Booking created successfully!\nBooking ID: ${bookingResponse.bookingId}`);
      
    } catch (err) {
      console.error('❌ Error creating booking:', err);
      alert(`❌ Booking failed: ${err.message}`);
    } finally {
      setBookingInProgress(prev => ({ ...prev, [ticket.id]: false }));
    }
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

  const getStatusClass = (status) => {
    return 'status-approved'; // All tickets are ready for booking
  };

  const getStatusText = (status) => {
    return 'Ready for Booking';
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high': return { class: 'priority-high', text: 'High', icon: 'fas fa-arrow-up' };
      case 'medium': return { class: 'priority-medium', text: 'Medium', icon: 'fas fa-minus' };
      case 'low': return { class: 'priority-low', text: 'Low', icon: 'fas fa-arrow-down' };
      default: return { class: 'priority-medium', text: 'Medium', icon: 'fas fa-minus' };
    }
  };

  const getTravelTypeBadge = (travelType) => {
    switch (travelType) {
      case 'International': return { class: 'travel-type-international', text: 'International' };
      case 'Domestic': return { class: 'travel-type-domestic', text: 'Domestic' };
      default: return { class: 'travel-type-domestic', text: 'Domestic' };
    }
  };

  const refreshData = () => {
    initializeComponent();
  };

  const handleLoginRedirect = () => {
    window.location.href = '/login';
  };

  const handleDebugLogin = () => {
    // For testing: Try to set a mock token in localStorage
    const mockToken = 'mock_jwt_token_for_testing_' + Date.now();
    localStorage.setItem('auth_token', mockToken);
    console.log('🔧 Mock token set in localStorage for testing');
    refreshData();
  };

  // Filter tickets based on current filters
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
          {debugInfo && (
            <div className="debug-info">
              <p>API Test: {debugInfo.success ? '✅ Connected' : '❌ Failed'}</p>
            </div>
          )}
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
          
          {authStatus && (
            <div className="auth-debug-info">
              <h4>Authentication Status:</h4>
              <p><strong>Token Found:</strong> {authStatus.hasToken ? '✅ Yes' : '❌ No'}</p>
              <p><strong>Source:</strong> {authStatus.source}</p>
              <p><strong>Token Preview:</strong> {authStatus.tokenPreview}</p>
              <p><strong>Domain:</strong> {authStatus.domain}</p>
              <p><strong>Cookies Found:</strong> {authStatus.cookieCount}</p>
              <p><strong>All Cookies:</strong> {authStatus.allCookies.join(', ') || 'None'}</p>
            </div>
          )}
          
          {debugInfo && (
            <div className="api-debug-info">
              <h4>API Connection Test:</h4>
              <p><strong>Status:</strong> {debugInfo.success ? '✅ Success' : '❌ Failed'}</p>
              {debugInfo.status && <p><strong>HTTP Status:</strong> {debugInfo.status}</p>}
              {debugInfo.error && <p><strong>Error:</strong> {debugInfo.error}</p>}
            </div>
          )}
          
          <div className="error-actions">
            <button className="btn btn-primary" onClick={handleLoginRedirect}>
              <i className="fas fa-sign-in-alt"></i> Go to Login
            </button>
            <button className="btn btn-outline" onClick={refreshData}>
              <i className="fas fa-sync"></i> Retry
            </button>
            <button className="btn btn-warning" onClick={handleDebugLogin}>
              <i className="fas fa-bug"></i> Debug: Mock Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-queue">
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
          <button className="btn btn-primary" onClick={() => console.log('Export clicked')}>
            <i className="fas fa-download"></i> Export
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
            placeholder="Ticket ID, Employee, Destination..."
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
              <th>Department</th>
              <th>Travel Dates</th>
              <th>Destination</th>
              <th>Type</th>
              <th>Estimated Cost</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTickets.map(ticket => {
              const priority = getPriorityBadge(ticket.priority);
              const travelType = getTravelTypeBadge(ticket.travelType);
              const isBookingInProgress = bookingInProgress[ticket.id];
              
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
                  <td>{ticket.department}</td>
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
                  <td>
                    <div className="destination">
                      <i className="fas fa-map-marker-alt"></i>
                      {ticket.destination}
                    </div>
                  </td>
                  <td>
                    <span className={`travel-type-badge ${travelType.class}`}>
                      {travelType.text}
                    </span>
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
                        onClick={() => handleBookTicket(ticket)}
                        disabled={isBookingInProgress}
                      >
                        {isBookingInProgress ? (
                          <i className="fas fa-spinner fa-spin"></i>
                        ) : (
                          <i className="fas fa-calendar-check"></i>
                        )}
                        {isBookingInProgress ? 'Booking...' : 'Book'}
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