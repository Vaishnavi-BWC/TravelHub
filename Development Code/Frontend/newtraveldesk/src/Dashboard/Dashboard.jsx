// traveldesk/src/components/Dashboard/Dashboard.jsx
import React from 'react';
import { useDashboardData } from '../hooks/useDashboardData';
import {
  formatDateTime,
  getStatusInfo,
  getPriorityBadge,
  getCurrentStepText,
  getWorkflowTypeText,
  getEstimatedCost
} from '../services/dashboardService';
import './Dashboard.css';

const Dashboard = () => {
  const {
    pendingRequests,
    stats,
    loading,
    error,
    refreshData
  } = useDashboardData();

  const handleValidate = (request) => {
    console.log('Validating request:', request);
    alert(`Validate Travel Request:\n\nRequest ID: ${request.travelRequestId}\nWorkflow ID: ${request.workflowId}`);
  };

  const handleReview = (request) => {
    console.log('Reviewing request:', request);
    alert(`Review Price Exception:\n\nRequest ID: ${request.travelRequestId}\nWorkflow ID: ${request.workflowId}`);
  };

  const handleViewDetails = (request) => {
    console.log('Viewing details:', request);
    const details = `
Travel Request Details:

Request ID: ${request.travelRequestId || 'N/A'}
Workflow ID: ${request.workflowId || 'N/A'}
Workflow Type: ${getWorkflowTypeText(request.workflowType)}
Current Step: ${getCurrentStepText(request.currentStep)}
Status: ${request.status || 'N/A'}
Priority: ${request.priority || 'N/A'}
Is Overpriced: ${request.isOverpriced ? 'Yes' : 'No'}
Estimated Cost: ${getEstimatedCost(request)}
Due Date: ${formatDateTime(request.dueDate)}
    `;
    alert(details);
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="dashboard-header">
          <h1>Travel Desk Dashboard</h1>
          <button 
            onClick={refreshData} 
            className="btn-refresh"
            disabled={loading}
          >
            {loading ? '🔄 Refreshing...' : '🔄 Refresh'}
          </button>
        </div>
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading travel desk approvals...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="dashboard-header">
          <h1>Travel Desk Dashboard</h1>
          <button onClick={refreshData} className="btn-refresh">
            🔄 Refresh
          </button>
        </div>
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h3>Error Loading Dashboard</h3>
          <p className="error-message">{error}</p>
          <button onClick={refreshData} className="btn-retry">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Travel Desk Dashboard</h1>
        {/* <button onClick={refreshData} className="btn-refresh">
          🔄 Refresh
        </button> */}
      </div>

      <div className="dashboard-cards">
        <DashboardCard
          title="Pending Validation"
          value={stats.pendingValidation}
          footer="Awaiting travel desk check"
          type="pending"
          icon="clock"
        />
        
        <DashboardCard
          title="Awaiting Booking"
          value={stats.awaitingBooking}
          footer="Ready for booking"
          type="validation"
          icon="check-circle"
        />
        
        <DashboardCard
          title="Policy Exceptions"
          value={stats.policyExceptions}
          footer="Price or policy issues"
          type="exception"
          icon="exclamation-circle"
        />
        
        <DashboardCard
          title="Booked Today"
          value={stats.bookedToday}
          footer="Completed today"
          type="booking"
          icon="plane-departure"
        />
      </div>

      <RecentTickets
        pendingRequests={pendingRequests}
        onValidate={handleValidate}
        onReview={handleReview}
        onViewDetails={handleViewDetails}
      />
    </div>
  );
};

const DashboardCard = ({ title, value, footer, type, icon }) => (
  <div className="card">
    <div className="card-header">
      <div className="card-title">{title}</div>
      <div className={`card-icon ${type}`}>
        <i className={`fas fa-${icon}`}></i>
      </div>
    </div>
    <div className="card-value">{value}</div>
    <div className="card-footer">{footer}</div>
  </div>
);

const RecentTickets = ({ pendingRequests, onValidate, onReview, onViewDetails }) => (
  <div className="recent-tickets">
    <div className="section-header">
      <h2>Pending Travel Desk Approvals</h2>
      <span className="count-badge">{pendingRequests.length} request(s)</span>
    </div>

    <div className="tickets-table">
      {pendingRequests.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Request ID</th>
              <th>Workflow Type</th>
              <th>Current Step</th>
              <th>Priority</th>
              <th>Due Date</th>
              <th>Estimated Cost</th>
              <th>Status</th>
              {/* <th>Price Exception</th> */}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pendingRequests.map((request) => (
              <TicketRow
                key={request.workflowId}
                request={request}
                onValidate={onValidate}
                onReview={onReview}
                onViewDetails={onViewDetails}
              />
            ))}
          </tbody>
        </table>
      ) : (
        <EmptyTable />
      )}
    </div>
  </div>
);

const TicketRow = ({ request, onValidate, onReview, onViewDetails }) => {
  const statusInfo = getStatusInfo(request);
  const priorityInfo = getPriorityBadge(request.priority);
  
  return (
    <tr>
      <td className="request-id">
        <div className="request-id-text">
          {request.travelRequestId?.substring(0, 8) || 'N/A'}...
        </div>
        <div className="workflow-type">
          {getWorkflowTypeText(request.workflowType)}
        </div>
      </td>
      <td>
        <span className="step-badge">
          {getCurrentStepText(request.currentStep)}
        </span>
      </td>
      <td>
        <span className={`priority-badge ${priorityInfo.class}`}>
          {priorityInfo.text}
        </span>
      </td>
      <td>
        <div className="due-date">
          {formatDateTime(request.dueDate)}
        </div>
      </td>
      <td className="cost">{getEstimatedCost(request)}</td>
      <td>
        <span className={`status ${statusInfo.class}`}>
          {statusInfo.text}
        </span>
      </td>
      <td>
        {request.isOverpriced ? (
          <span className="exception-indicator">
            ⚠️ Yes
          </span>
        ) : (
          <span className="no-exception">No</span>
        )}
      </td>
      <td className="action-buttons">
        <button 
          className="icon-btn view-btn"
          onClick={() => onViewDetails(request)}
          title="View Details"
        >
          👁️
        </button>
        {request.isOverpriced ? (
          <button 
            className="action-btn review"
            onClick={() => onReview(request)}
          >
            Review
          </button>
        ) : (
          <button 
            className="action-btn validate"
            onClick={() => onValidate(request)}
          >
            Validate
          </button>
        )}
      </td>
    </tr>
  );
};

const EmptyTable = () => (
  <div className="empty-table">
    <div className="empty-icon">✅</div>
    <h3>All Caught Up!</h3>
    <p>There are no pending travel requests requiring validation.</p>
  </div>
);

export default Dashboard;