import React, { useState, useEffect } from 'react';
import { fetchTravelRequestsWithBookings, fetchBookingsByRequestId } from '../services/bookingService';
import './BookingHistory.css';

const BookingHistory = ({ onTicketClick }) => {
  const [filters, setFilters] = useState({
    status: 'all',
    department: 'all',
    search: ''
  });
  const [travelRequests, setTravelRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [bookingDetails, setBookingDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all travel requests with bookings on component mount
  useEffect(() => {
    fetchTravelRequests();
  }, []);

  const fetchTravelRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchTravelRequestsWithBookings();
      setTravelRequests(data);
    } catch (err) {
      console.error('❌ Error fetching travel requests:', err);
      setError('Failed to load travel requests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch booking details when a request is selected
  const fetchBookingDetails = async (travelRequest) => {
    try {
      setDetailsLoading(true);
      setError(null);
      setSelectedRequest(travelRequest);
      
      const data = await fetchBookingsByRequestId(travelRequest.travelRequestId);
      
      // Transform API data to match component structure
      const transformedBookings = Array.isArray(data) ? data.map((booking, index) => ({
        id: `BK-${booking.bookingId.substring(0, 8).toUpperCase()}`,
        bookingId: booking.bookingId,
        employee: travelRequest.employeeName,
        employeeId: travelRequest.employeeId,
        department: travelRequest.department,
        travelDates: travelRequest.travelDates,
        destination: travelRequest.destination,
        bookedOn: formatBookedDate(booking.createdAt),
        status: getStatusFromBooking(booking),
        statusText: getStatusTextFromBooking(booking),
        travelType: getTravelTypeFromRequest(travelRequest),
        bookingCost: getBookingCost(booking),
        bookingAgent: 'Travel Desk',
        bookingReference: booking.bookingId,
        bookingType: booking.bookingType,
        details: booking.details,
        notes: booking.notes,
        flightDetails: getFlightDetails(booking),
        hotelDetails: getHotelDetails(booking),
        rating: getRandomRating(),
        feedback: getFeedback(booking),
        originalData: booking
      })) : [];

      setBookingDetails(transformedBookings);
    } catch (err) {
      console.error('❌ Error fetching booking details:', err);
      setError(`Failed to load booking details: ${err.message}`);
      setBookingDetails([]);
    } finally {
      setDetailsLoading(false);
    }
  };

  // Helper functions for data transformation
  const formatBookedDate = (createdAt) => {
    const date = new Date(createdAt);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusFromBooking = (booking) => {
    const statuses = ['completed', 'upcoming', 'in-progress'];
    return statuses[Math.floor(Math.random() * statuses.length)];
  };

  const getStatusTextFromBooking = (booking) => {
    const status = getStatusFromBooking(booking);
    const statusMap = {
      'completed': 'Completed',
      'upcoming': 'Upcoming',
      'in-progress': 'In Progress'
    };
    return statusMap[status];
  };

  const getTravelTypeFromRequest = (request) => {
    return request.destination === 'International' ? 'International' : 'Domestic';
  };

  const getBookingCost = (booking) => {
    const costs = ['₹8,900', '₹11,800', '₹14,500', '₹16,200', '₹45,700'];
    return costs[Math.floor(Math.random() * costs.length)];
  };

  const getFlightDetails = (booking) => {
    const flights = ['AI-601 • 10:30 AM - 12:00 PM', '6E-234 • 1:30 PM - 3:15 PM', 'UK-945 • 4:00 PM - 6:15 PM'];
    return flights[Math.floor(Math.random() * flights.length)];
  };

  const getHotelDetails = (booking) => {
    const hotels = ['Grand Hotel • 2 nights', 'Tech Park Inn • 2 nights', 'Capital Suites • 3 nights'];
    return hotels[Math.floor(Math.random() * hotels.length)];
  };

  const getRandomRating = () => {
    return Math.random() > 0.3 ? Math.floor(Math.random() * 5) + 1 : null;
  };

  const getFeedback = (booking) => {
    const feedbacks = [
      'Smooth booking process',
      'Good service, timely updates',
      'Excellent service, will recommend',
      'Flight was delayed, otherwise good'
    ];
    return booking.rating ? feedbacks[Math.floor(Math.random() * feedbacks.length)] : null;
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
    switch (status) {
      case 'completed': return 'status-completed';
      case 'upcoming': return 'status-upcoming';
      case 'in-progress': return 'status-in-progress';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-completed';
    }
  };

  const getTravelTypeClass = (travelType) => {
    switch (travelType) {
      case 'International': return 'travel-type-international';
      case 'Domestic': return 'travel-type-domestic';
      default: return 'travel-type-domestic';
    }
  };

  const getDaysAway = (travelDate) => {
    const days = Math.floor(Math.random() * 30) + 1;
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    return `${days} days`;
  };

  const renderRating = (rating) => {
    if (!rating) return null;
    
    return (
      <div className="rating">
        {[...Array(5)].map((_, i) => (
          <i 
            key={i} 
            className={`fas fa-star ${i < rating ? 'filled' : ''}`}
          ></i>
        ))}
      </div>
    );
  };

  // Filter travel requests based on current filters
  const filteredRequests = travelRequests.filter(request => {
    if (filters.status !== 'all' && request.status !== filters.status) return false;
    if (filters.department !== 'all' && request.department !== filters.department) return false;
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        request.employeeName.toLowerCase().includes(searchLower) ||
        request.destination.toLowerCase().includes(searchLower) ||
        request.travelRequestId.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const bookingStats = {
    total: bookingDetails.length,
    completed: bookingDetails.filter(b => b.status === 'completed').length,
    upcoming: bookingDetails.filter(b => b.status === 'upcoming').length,
    inProgress: bookingDetails.filter(b => b.status === 'in-progress').length
  };

  const totalSavings = bookingDetails
    .filter(b => b.status === 'completed')
    .reduce((sum, booking) => {
      const cost = parseInt(booking.bookingCost.replace(/[^0-9]/g, ''));
      return sum + cost;
    }, 0);

  const clearSelection = () => {
    setSelectedRequest(null);
    setBookingDetails([]);
  };

  if (loading) {
    return (
      <div className="booking-history">
        <div className="loading-state">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading travel requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-history">
      <div className="history-header">
        <div className="header-content">
          <h2>Booking History</h2>
          <p>
            {selectedRequest 
              ? `Booking details for ${selectedRequest.employeeName} - ${selectedRequest.destination}`
              : 'Select a travel request to view booking history'
            }
          </p>
          
          {selectedRequest && (
            <div className="history-stats">
              <div className="stat-card total">
                <div className="stat-icon">
                  <i className="fas fa-calendar-check"></i>
                </div>
                <div className="stat-info">
                  <div className="stat-number">{bookingStats.total}</div>
                  <div className="stat-label">Total Bookings</div>
                </div>
              </div>
              <div className="stat-card completed">
                <div className="stat-icon">
                  <i className="fas fa-check-circle"></i>
                </div>
                <div className="stat-info">
                  <div className="stat-number">{bookingStats.completed}</div>
                  <div className="stat-label">Completed</div>
                </div>
              </div>
              <div className="stat-card upcoming">
                <div className="stat-icon">
                  <i className="fas fa-plane"></i>
                </div>
                <div className="stat-info">
                  <div className="stat-number">{bookingStats.upcoming}</div>
                  <div className="stat-label">Upcoming</div>
                </div>
              </div>
              <div className="stat-card savings">
                <div className="stat-icon">
                  <i className="fas fa-rupee-sign"></i>
                </div>
                <div className="stat-info">
                  <div className="stat-number">₹{(totalSavings / 1000).toFixed(0)}K</div>
                  <div className="stat-label">Total Value</div>
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
              <label htmlFor="status-filter">Request Status</label>
              <select 
                id="status-filter"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="APPROVED">Approved</option>
                <option value="PENDING">Pending</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
            <div className="filter-item">
              <label htmlFor="department-filter">Department</label>
              <select 
                id="department-filter"
                value={filters.department}
                onChange={(e) => handleFilterChange('department', e.target.value)}
              >
                <option value="all">All Departments</option>
                <option value="Engineering">Engineering</option>
                <option value="Sales">Sales</option>
                <option value="Marketing">Marketing</option>
                <option value="HR">HR</option>
                <option value="Finance">Finance</option>
              </select>
            </div>
            <div className="filter-item">
              <label htmlFor="search">Search</label>
              <input 
                type="text" 
                id="search"
                placeholder="Employee, Destination, Request ID..."
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
                    <th>Department</th>
                    <th>Destination</th>
                    <th>Travel Dates</th>
                    <th>Purpose</th>
                    <th>Bookings</th>
                    <th>Last Booking</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map(request => (
                    <tr key={request.travelRequestId} className="request-row">
                      <td>
                        <div className="request-id">
                          <code>{request.travelRequestId.substring(0, 8)}...</code>
                        </div>
                      </td>
                      <td>
                        <div className="employee-info">
                          <div className="employee-name">{request.employeeName}</div>
                          <div className="employee-id">{request.employeeId}</div>
                        </div>
                      </td>
                      <td>{request.department}</td>
                      <td>
                        <div className="destination">
                          <i className="fas fa-map-marker-alt"></i>
                          {request.destination}
                        </div>
                      </td>
                      <td>{request.travelDates}</td>
                      <td>{request.purpose}</td>
                      <td>
                        <span className="booking-count">
                          <i className="fas fa-calendar-check"></i>
                          {request.bookingCount} booking(s)
                        </span>
                      </td>
                      <td>{request.lastBookingDate}</td>
                      <td>
                        <span className={`status status-${request.status.toLowerCase()}`}>
                          {request.status}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="btn btn-primary btn-sm"
                            onClick={() => fetchBookingDetails(request)}
                            disabled={detailsLoading}
                          >
                            {detailsLoading && request.travelRequestId === selectedRequest?.travelRequestId ? (
                              <i className="fas fa-spinner fa-spin"></i>
                            ) : (
                              <i className="fas fa-eye"></i>
                            )}
                            View Bookings
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredRequests.length === 0 && (
              <div className="empty-state">
                <i className="fas fa-search"></i>
                <h3>No Travel Requests Found</h3>
                <p>No travel requests with bookings match your search criteria.</p>
                <button className="btn btn-primary" onClick={() => setFilters({ status: 'all', department: 'all', search: '' })}>
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
          ) : (
            <>
              <div className="filters">
                <div className="filter-item">
                  <label htmlFor="booking-status-filter">Booking Status</label>
                  <select id="booking-status-filter">
                    <option value="all">All Statuses</option>
                    <option value="completed">Completed</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="in-progress">In Progress</option>
                  </select>
                </div>
                <div className="filter-item" style={{justifyContent: 'flex-end'}}>
                  <label>&nbsp;</label>
                  <button className="btn btn-primary">
                    <i className="fas fa-filter"></i> Apply Filters
                  </button>
                </div>
              </div>

              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Booking ID</th>
                      <th>Booking Type</th>
                      <th>Booked On</th>
                      <th>Details</th>
                      <th>Notes</th>
                      <th>Cost</th>
                      <th>Status</th>
                      <th>Rating</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookingDetails.map(booking => (
                      <tr key={booking.bookingId} className={`booking-row ${booking.status}`}>
                        <td>
                          <div className="booking-id">
                            <code>{booking.id}</code>
                          </div>
                        </td>
                        <td>
                          <span className="booking-type">
                            {booking.bookingType}
                          </span>
                        </td>
                        <td>
                          <div className="booked-date">
                            {booking.bookedOn}
                          </div>
                        </td>
                        <td>
                          <div className="booking-details">
                            {booking.details}
                          </div>
                        </td>
                        <td>
                          <div className="booking-notes">
                            {booking.notes}
                          </div>
                        </td>
                        <td>
                          <div className="booking-cost">
                            <span className="cost-amount">{booking.bookingCost}</span>
                          </div>
                        </td>
                        <td>
                          <span className={`status ${getStatusClass(booking.status)}`}>
                            {booking.statusText}
                          </span>
                        </td>
                        <td>
                          <div className="booking-rating">
                            {renderRating(booking.rating)}
                          </div>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              className="btn btn-primary btn-sm"  
                              onClick={() => onTicketClick(booking)}
                            >
                              <i className="fas fa-eye"></i>
                              Details
                            </button>
                            <button className="btn btn-outline btn-sm">
                              <i className="fas fa-print"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {bookingDetails.length === 0 && (
                <div className="empty-state">
                  <i className="fas fa-history"></i>
                  <h3>No Booking History</h3>
                  <p>No booking history found for this travel request.</p>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default BookingHistory;