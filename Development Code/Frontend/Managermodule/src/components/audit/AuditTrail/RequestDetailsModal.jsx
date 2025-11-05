import React from 'react';
import './RequestDetailsModal.css';

const RequestDetailsModal1 = ({ request, onClose }) => {
  if (!request) {
    return null;
  }

  const formatAmount = (amount) => {
    if (amount === null || amount === undefined) return '₹0';
    return `₹${amount.toLocaleString('en-IN')}`;
  };

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

  const handlePrint = () => {
  const originalContent = document.body.innerHTML;
  const printContent = document.querySelector('.modal-content').cloneNode(true);
  
  // Remove action buttons from print content
  const buttons = printContent.querySelector('.modal-footer');
  if (buttons) {
    buttons.remove();
  }
  
  // Replace body content with print content
  document.body.innerHTML = printContent.outerHTML;
  
  // Trigger print
  window.print();
  
  // Restore original content
  document.body.innerHTML = originalContent;
};

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Request Details</h2>
          <button className="close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="modal-body">
          <div className="details-section">
            <h3>Basic Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Request ID:</label>
                <span className="value">{request.travelRequestId}</span>
              </div>
              <div className="info-item">
                <label>Employee:</label>
                <span className="value">{request.employeeName}</span>
              </div>
              <div className="info-item">
                <label>Travel Purpose:</label>
                <span className="value">{request.travelPurpose}</span>
              </div>
              <div className="info-item">
                <label>Destination:</label>
                <span className="value">{request.destination || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div className="details-section">
            <h3>Approval Details</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Status:</label>
                <span className={`value status status-${request.status ? request.status.toLowerCase() : ''}`}>
                  {request.status}
                </span>
              </div>
              <div className="info-item">
                <label>Approval Role:</label>
                <span className="value">{request.approverRole}</span>
              </div>
              <div className="info-item">
                <label>Action:</label>
                <span className="value">{request.action}</span>
              </div>
              <div className="info-item">
                <label>Step:</label>
                <span className="value">{request.step}</span>
              </div>
              <div className="info-item">
                <label>Action Taken:</label>
                <span className="value">{formatDate(request.actionTakenAt)}</span>
              </div>
            </div>
          </div>

          <div className="details-section">
            <h3>Financial Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Estimated Cost:</label>
                <span className="value amount">{formatAmount(request.estimatedCost)}</span>
              </div>
              <div className="info-item">
                <label>Amount Approved:</label>
                <span className="value amount">{formatAmount(request.amountApproved || 0)}</span>
              </div>
            </div>
          </div>

          <div className="details-section">
            <h3>Comments & Notes</h3>
            <div className="comments-box">
              <div className="comment-item">
                <strong>Comments:</strong>
                <p>{request.comments || 'No comments provided'}</p>
              </div>
              {request.escalationReason && (
                <div className="comment-item">
                  <strong>Escalation Reason:</strong>
                  <p>{request.escalationReason}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="print-modal-btn" onClick={handlePrint}>
            <i className="fas fa-print"></i> Print Details
          </button>
          <button className="close-modal-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default RequestDetailsModal1;