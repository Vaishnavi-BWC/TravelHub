import React, { useState } from 'react';
import './BookingModal.css';

const BookingModal = ({ 
  isOpen, 
  onClose, 
  ticket, 
  onBook, 
  isBookingInProgress 
}) => {
  const [bookingForm, setBookingForm] = useState({
    bookingType: 'FLIGHT',
    details: '',
    notes: '',
    bookingReference: '',
    bookingDate: '',
    bookingAmount: '',
    currency: 'INR',
    status: 'CONFIRMED'
  });

  React.useEffect(() => {
    if (ticket && isOpen) {
      const defaultDetails = `${ticket.destination} Travel - ${ticket.travelType}`;
      const defaultNotes = `Booking for travel request ${ticket.id}`;
      const defaultAmount = ticket.estimatedCost?.replace('₹', '') || '0';
      
      setBookingForm({
        bookingType: 'FLIGHT',
        details: defaultDetails,
        notes: defaultNotes,
        bookingReference: '',
        bookingDate: getCurrentDateTime(),
        bookingAmount: defaultAmount,
        currency: 'INR',
        status: 'CONFIRMED'
      });
    }
  }, [ticket, isOpen]);

  const getCurrentDateTime = () => {
    const now = new Date();
    return now.toISOString().slice(0, 16);
  };

  const handleFormChange = (field, value) => {
    setBookingForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!bookingForm.details.trim() || !bookingForm.bookingAmount || !bookingForm.bookingDate) {
      alert('Please fill in all required fields');
      return;
    }

    const bookingPayload = {
      bookingType: bookingForm.bookingType,
      details: bookingForm.details.trim(),
      notes: bookingForm.notes.trim(),
      bookingReference: bookingForm.bookingReference.trim(),
      bookingDate: bookingForm.bookingDate.replace('T', ' ').slice(0, 19),
      bookingAmount: parseFloat(bookingForm.bookingAmount),
      currency: bookingForm.currency,
      status: bookingForm.status,
      travelRequestId: ticket.id,
      workflowId: ticket.workflowId
    };

    onBook(bookingPayload);
  };

  const handleClose = () => {
    if (!isBookingInProgress) {
      onClose();
    }
  };

  if (!isOpen || !ticket) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Create Booking</h3>
          <button 
            className="modal-close" 
            onClick={handleClose}
            disabled={isBookingInProgress}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="ticket-info">
              <h4>Ticket Information</h4>
              <div className="info-grid">
                <div className="info-item">
                  <label>Travel Request ID:</label>
                  <span>{ticket.id}</span>
                </div>
                <div className="info-item">
                  <label>Employee:</label>
                  <span>{ticket.employee}</span>
                </div>
                <div className="info-item">
                  <label>Destination:</label>
                  <span>{ticket.destination}</span>
                </div>
                <div className="info-item">
                  <label>Travel Dates:</label>
                  <span>{ticket.travelDates}</span>
                </div>
                <div className="info-item">
                  <label>Department:</label>
                  <span>{ticket.department}</span>
                </div>
                <div className="info-item">
                  <label>Priority:</label>
                  <span className={`priority-text ${ticket.priority}`}>
                    {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            <div className="booking-form">
              <h4>Booking Details</h4>
              
              <div className="form-group">
                <label htmlFor="bookingType" className="required">Booking Type</label>
                <select 
                  id="bookingType"
                  value={bookingForm.bookingType}
                  onChange={(e) => handleFormChange('bookingType', e.target.value)}
                  required
                  disabled={isBookingInProgress}
                >
                  <option value="FLIGHT">Flight</option>
                  <option value="HOTEL">Hotel</option>
                  <option value="TRAIN">Train</option>
                  <option value="CAR_RENTAL">Car Rental</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="details" className="required">Details</label>
                <input 
                  type="text" 
                  id="details"
                  value={bookingForm.details}
                  onChange={(e) => handleFormChange('details', e.target.value)}
                  placeholder="e.g., Flight from Pune to Delhi, Hotel booking at Taj"
                  required
                  disabled={isBookingInProgress}
                />
              </div>

              <div className="form-group">
                <label htmlFor="notes">Notes</label>
                <textarea 
                  id="notes"
                  value={bookingForm.notes}
                  onChange={(e) => handleFormChange('notes', e.target.value)}
                  placeholder="Additional notes about the booking"
                  rows="3"
                  disabled={isBookingInProgress}
                />
              </div>

              <div className="form-group">
                <label htmlFor="bookingReference">Booking Reference</label>
                <input 
                  type="text" 
                  id="bookingReference"
                  value={bookingForm.bookingReference}
                  onChange={(e) => handleFormChange('bookingReference', e.target.value)}
                  placeholder="e.g., AI-567, MMT12345"
                  disabled={isBookingInProgress}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="bookingDate" className="required">Booking Date & Time</label>
                  <input 
                    type="datetime-local" 
                    id="bookingDate"
                    value={bookingForm.bookingDate}
                    onChange={(e) => handleFormChange('bookingDate', e.target.value)}
                    required
                    disabled={isBookingInProgress}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="bookingAmount" className="required">Amount</label>
                  <input 
                    type="number" 
                    id="bookingAmount"
                    value={bookingForm.bookingAmount}
                    onChange={(e) => handleFormChange('bookingAmount', e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    required
                    disabled={isBookingInProgress}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="currency" className="required">Currency</label>
                  <select 
                    id="currency"
                    value={bookingForm.currency}
                    onChange={(e) => handleFormChange('currency', e.target.value)}
                    required
                    disabled={isBookingInProgress}
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="status" className="required">Status</label>
                  <select 
                    id="status"
                    value={bookingForm.status}
                    onChange={(e) => handleFormChange('status', e.target.value)}
                    required
                    disabled={isBookingInProgress}
                  >
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="PENDING">Pending</option>
                    <option value="CANCELLED">Cancelled</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button 
              type="button"
              className="btn btn-outline" 
              onClick={handleClose}
              disabled={isBookingInProgress}
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="btn btn-success" 
              disabled={isBookingInProgress || !bookingForm.details || !bookingForm.bookingAmount || !bookingForm.bookingDate}
            >
              {isBookingInProgress ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Creating Booking...
                </>
              ) : (
                <>
                  <i className="fas fa-calendar-check"></i> Create Booking
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;