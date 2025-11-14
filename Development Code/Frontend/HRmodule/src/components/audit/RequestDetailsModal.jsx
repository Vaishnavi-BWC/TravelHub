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
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = 'none';
  document.body.appendChild(iframe);

  const printContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>HR Travel Request Details - ${request.travelRequestId}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: #333;
            font-size: 14px;
            line-height: 1.4;
          }
          .header { border-bottom: 2px solid #007bff; padding-bottom: 10px; margin-bottom: 20px; }
          .section { margin-bottom: 25px; page-break-inside: avoid; }
          .section h3 { color: #007bff; margin-bottom: 15px; border-bottom: 1px solid #dee2e6; padding-bottom: 5px; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
          .info-item { margin-bottom: 10px; padding: 8px; background: #f8f9fa; border-radius: 4px; border: 1px solid #dee2e6; }
          .label { font-weight: bold; color: #555; display: block; margin-bottom: 4px; font-size: 12px; }
          .value { color: #333; }
          .comments-box { background: #f8f9fa; padding: 15px; border-radius: 5px; margin-top: 10px; border-left: 4px solid #007bff; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>HR Travel Request Details</h1>
          <p>Generated on: ${new Date().toLocaleString()}</p>
        </div>
        <div class="section">
          <h3>Basic Information</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="label">Request ID:</span>
              <span class="value">${request.travelRequestId}</span>
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
      </body>
    </html>
  `;

  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write(printContent);
  doc.close();

  iframe.onload = () => {
    iframe.contentWindow.focus();
    iframe.contentWindow.print();

    // Clean up after print
    setTimeout(() => document.body.removeChild(iframe), 1000);
  };
};


  return (
    <div className="modal-overlay" onClick={onClose}>
<<<<<<< HEAD
      <div className="modal-content1" onClick={(e) => e.stopPropagation()}>
=======
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
>>>>>>> upstream/main
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