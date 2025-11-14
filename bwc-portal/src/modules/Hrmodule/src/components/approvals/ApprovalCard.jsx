import React from 'react';
import Badge from '../common/Badge';

const ApprovalCard = ({ request, onView, onReview }) => {
  const getRequestIcon = (type) => {
    switch (type) {
      case 'travel': return 'fas fa-plane';
      case 'leave': return 'fas fa-calendar-alt';
      case 'expense': return 'fas fa-receipt';
      default: return 'fas fa-file-alt';
    }
  };

  return (
    <div className="approval-card">
      <div className="approval-card-header">
        <div className="request-type-icon">
          <i className={getRequestIcon(request.type)}></i>
        </div>
        <div className="request-basic-info">
          <h4>{request.title}</h4>
          <p>Request ID: {request.id}</p>
          <Badge variant={request.status}>
            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
          </Badge>
        </div>
      </div>

      <div className="approval-card-details">
        <div className="detail-row">
          <span className="label">Employee:</span>
          <span className="value">{request.employee.name} ({request.employee.department})</span>
        </div>
        <div className="detail-row">
          <span className="label">Dates:</span>
          <span className="value">{request.dates}</span>
        </div>
        <div className="detail-row">
          <span className="label">Stage:</span>
          <span className="value">{request.stage}</span>
        </div>
        <div className="detail-row">
          <span className="label">Details:</span>
          <span className="value">{request.details}</span>
        </div>
      </div>

      <div className="approval-card-actions">
        <button
          className="btn btn-sm btn-primary"
          onClick={() => onView(request.id)}
          title="View Details"
        >
          <i className="fas fa-eye"></i> View
        </button>
        {request.status === "pending" && (
          <button
            className="btn btn-sm btn-accent"
            onClick={() => onReview(request.id)}
            title="Review Request"
          >
            <i className="fas fa-check-circle"></i> Review
          </button>
        )}
      </div>
    </div>
  );
};

export default ApprovalCard;