// traveldesk/src/components/Dashboard/Dashboard.jsx
import React, { useState, useMemo } from 'react';
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

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Calculate pagination values
  const totalPages = Math.ceil(pendingRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  // Get current page requests (most recent first)
  const currentRequests = useMemo(() => {
    const sortedRequests = [...pendingRequests].sort((a, b) => 
      new Date(b.dueDate) - new Date(a.dueDate)
    );
    return sortedRequests.slice(startIndex, endIndex);
  }, [pendingRequests, startIndex, endIndex]);

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

  // Pagination handlers
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handlePageClick = (page) => {
    setCurrentPage(page);
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
            {loading ? '🔄 Refreshing...' : '🔁 Refresh'}
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
            🔁 Refresh
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
          🔁 Refresh
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
        pendingRequests={currentRequests}
        totalRequests={pendingRequests.length}
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        startIndex={startIndex}
        endIndex={endIndex}
        onValidate={handleValidate}
        onReview={handleReview}
        onViewDetails={handleViewDetails}
        onNextPage={handleNextPage}
        onPrevPage={handlePrevPage}
        onPageClick={handlePageClick}
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

const RecentTickets = ({ 
  pendingRequests, 
  totalRequests,
  currentPage,
  totalPages,
  itemsPerPage,
  startIndex,
  endIndex,
  onValidate, 
  onReview, 
  onViewDetails,
  onNextPage,
  onPrevPage,
  onPageClick
}) => (
  <div className="recent-tickets">
    <div className="section-header">
      <h2>Pending Travel Desk Approvals</h2>
      <div className="header-info">
        <span className="count-badge">{totalRequests} request(s)</span>
        {totalRequests > itemsPerPage && (
          <span className="pagination-info">
            Showing {startIndex + 1}-{Math.min(endIndex, totalRequests)} of {totalRequests}
          </span>
        )}
      </div>
    </div>

    <div className="tickets-table">
      {pendingRequests.length > 0 ? (
        <>
          <table>
            <thead>
              <tr>
                <th className="col-request-id">Request ID</th>
                <th className="col-workflow-type">Workflow Type</th>
                <th className="col-current-step">Current Step</th>
                <th className="col-due-date">Due Date</th>
                <th className="col-estimated-cost">Estimated Cost</th>
                <th className="col-status">Status</th>
                <th className="col-price-exception">Price Exception</th>
                <th className="col-actions">View</th>
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
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="pagination-controls">
              <button 
                className="pagination-btn prev"
                onClick={onPrevPage}
                disabled={currentPage === 1}
              >
                ‹ Previous
              </button>
              
              <div className="pagination-numbers">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    className={`pagination-number ${page === currentPage ? 'active' : ''}`}
                    onClick={() => onPageClick(page)}
                  >
                    {page}
                  </button>
                ))}
              </div>
              
              <button 
                className="pagination-btn next"
                onClick={onNextPage}
                disabled={currentPage === totalPages}
              >
                Next ›
              </button>
            </div>
          )}
        </>
      ) : (
        <EmptyTable />
      )}
    </div>
  </div>
);

const TicketRow = ({ request, onValidate, onReview, onViewDetails }) => {
  const statusInfo = getStatusInfo(request);
  
  return (
    <tr>
      <td className="request-id">
        <div className="request-id-text">
          {request.travelRequestId?.substring(0, 8) || 'N/A'}...
        </div>
      </td>
      <td className="workflow-type">
        <span className="workflow-type-badge">
          {getWorkflowTypeText(request.workflowType)}
        </span>
      </td>
      <td className="current-step">
        <span className="step-badge">
          {getCurrentStepText(request.currentStep)}
        </span>
      </td>
      <td className="due-date">
        <div className="due-date-text">
          {formatDateTime(request.dueDate)}
        </div>
      </td>
      <td className="estimated-cost">
        <span className="cost-amount">
          {getEstimatedCost(request)}
        </span>
      </td>
      <td className="status">
        <span className={`status-badge ${statusInfo.class}`}>
          {statusInfo.text}
        </span>
      </td>
      <td className="price-exception">
        {request.isOverpriced ? (
          <span className="exception-indicator">
            ⚠️ Yes
          </span>
        ) : (
          <span className="no-exception">No</span>
        )}
      </td>
      <td className="actions">
        <div className="actions-container">
          <button 
            className="icon-btn view-btn"
            onClick={() => onViewDetails(request)}
            title="View Details"
          >
            👁️
          </button>
          {request.isOverpriced ? (
            <button 
              className="action-btn review-btn"
              onClick={() => onReview(request)}
            >
              Review
            </button>
          ) : (
            <button 
              className="action-btn validate-btn"
              onClick={() => onValidate(request)}
            >
              Validate
            </button>
          )}
        </div>
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