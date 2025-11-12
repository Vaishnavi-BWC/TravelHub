import React from 'react';
import {
  FaSearch,
  FaEye,
  FaEdit,
  FaPlus,
  FaFilter,
  FaFilePdf,
  FaFileExcel
} from "react-icons/fa";
import { useAuth } from '../../../hooks/useAuth';
import { useTravelRequests } from '../../../hooks/useTravelRequests';
import { useRequestFilters } from '../../../hooks/useRequestFilters';
import { useRequestUtils } from '../../../hooks/useRequestUtils';
import { useNavigate } from 'react-router-dom';
import './MyRequests.css';

const MyRequests = ({
  onViewRequest,
  onNewRequest,
  onEditRequest,
  onExport
}) => {
  const { user } = useAuth();
  const { requests, loading, error } = useTravelRequests();
  const navigate = useNavigate();

  const {
    filter,
    setFilter,
    searchTerm,
    setSearchTerm,
    sortConfig,
    handleSort,
    filteredRequests,
    clearFilters,
    filterOptions
  } = useRequestFilters(requests);

  const {
    formatDate,
    calculateDuration,
    getStatusDisplay,
    getStatusColor,
    exportRequests
  } = useRequestUtils();

  // Handle view request details
  const handleViewRequest = (requestId, requestData) => {
    console.log('🔍 [MyRequests] Request data structure:', {
      originalRequestId: requestId,
      travelRequestId: requestData.travelRequestId,
      id: requestData.id,
      allKeys: Object.keys(requestData)
    });

    // Determine the correct ID to use
    const correctRequestId =
      requestData.travelRequestId ||
      requestData.id ||
      requestId;

    console.log('🔍 [MyRequests] Using request ID:', correctRequestId);

    if (!correctRequestId || correctRequestId === 'undefined' || correctRequestId === 'null') {
      console.error('❌ [MyRequests] Invalid request ID:', correctRequestId);
      alert('Error: Invalid request ID');
      return;
    }

    console.log('🔄 [MyRequests] Navigating to request detail page...');

    // Navigate to request detail page
    navigate(`/request-detail/${correctRequestId}`, {
      state: { request: requestData }
    });

    console.log('✅ [MyRequests] Navigation triggered');
  };
  const handleExport = (format) => {
    if (onExport) {
      onExport(filteredRequests, format);
    } else {
      exportRequests(filteredRequests, format, filter);
    }
  };

  if (loading) {
    return (
      <div className="content">
        <div className="detailHeader">
          <div>
            <h2>My Travel Requests</h2>
            <p>Loading your travel requests...</p>
          </div>
        </div>
        <div className="card">
          <div className="cardBody" style={{ textAlign: 'center', padding: '40px' }}>
            <div className="loading-spinner"></div>
            <p>Loading travel requests...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="content">
        <div className="detailHeader">
          <div>
            <h2>My Travel Requests</h2>
            <p>Error loading requests</p>
          </div>
        </div>
        <div className="card">
          <div className="cardBody" style={{ textAlign: 'center', padding: '40px', color: '#dc3545' }}>
            <div style={{ fontSize: '3em', marginBottom: '15px' }}>❌</div>
            <h3>Error Loading Requests</h3>
            <p style={{ marginBottom: '20px' }}>{error}</p>
            <button
              className="btnPrimary"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="content">
      {/* Header */}
      <div className="detailHeader">
        <div>
          <h2>My Travel Requests</h2>
          <p>Manage and track your travel requests</p>
          {user && (
            <p style={{ fontSize: '0.9em', color: '#6c757d', marginTop: '5px' }}>
              Showing requests for: {user.email} (User ID: {user.userId})
            </p>
          )}
        </div>
        <div className="headerActions" style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <button
            className="btnSecondary"
            onClick={() => handleExport('excel')}
            disabled={filteredRequests.length === 0}
          >
            <FaFileExcel className="btnIcon" /> Export Excel
          </button>
          <button
            className="btnSecondary"
            onClick={() => handleExport('pdf')}
            disabled={filteredRequests.length === 0}
          >
            <FaFilePdf className="btnIcon" /> Export PDF
          </button>
          <button
            className="btnPrimary"
            onClick={onNewRequest}
          >
            <FaPlus className="btnIcon" /> New Request
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card">
        <div className="cardHeader">
          <h3>Filters & Search</h3>
        </div>
        <div className="cardBody">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Filter Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '600' }}>
                <FaFilter />
                Filter by:
              </div>
              <div className="filterButtons">
                {filterOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => setFilter(option.value)}
                    className={`filterBtn ${filter === option.value ? 'filterBtnActive' : ''}`}
                  >
                    {option.label}
                    <span style={{ marginLeft: '5px', fontSize: '0.8em', opacity: '0.8' }}>({option.count})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Search Box */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
              <div className="searchBox">
                <FaSearch className="searchIcon" />
                <input
                  type="text"
                  placeholder="Search requests by ID, purpose, or project..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="searchInput"
                />
                {searchTerm && (
                  <button
                    style={{
                      position: 'absolute',
                      right: '10px',
                      background: 'none',
                      border: 'none',
                      fontSize: '1.2em',
                      cursor: 'pointer',
                      color: '#6c757d'
                    }}
                    onClick={() => setSearchTerm("")}
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            {/* Results Summary */}
            <div style={{ padding: '10px 0', color: '#6c757d', fontSize: '0.9em' }}>
              Showing {filteredRequests.length} of {requests.length} requests
              {searchTerm && (
                <span style={{ fontStyle: 'italic' }}> for "{searchTerm}"</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="card">
        <div className="cardHeader">
          <h3>Travel Requests</h3>
        </div>
        <div className="cardBody">
          {filteredRequests.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th
                      style={{ cursor: 'pointer', userSelect: 'none' }}
                      onClick={() => handleSort('travelRequestId')}
                    >
                      Request ID
                      {sortConfig.key === 'travelRequestId' && (
                        <span style={{ marginLeft: '5px' }}>
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </th>
                    <th
                      style={{ cursor: 'pointer', userSelect: 'none' }}
                      onClick={() => handleSort('purpose')}
                    >
                      Purpose
                      {sortConfig.key === 'purpose' && (
                        <span style={{ marginLeft: '5px' }}>
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </th>
                    <th
                      style={{ cursor: 'pointer', userSelect: 'none' }}
                      onClick={() => handleSort('projectId')}
                    >
                      Project ID
                      {sortConfig.key === 'projectId' && (
                        <span style={{ marginLeft: '5px' }}>
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </th>
                    <th
                      style={{ cursor: 'pointer', userSelect: 'none' }}
                      onClick={() => handleSort('startDate')}
                    >
                      Start Date
                      {sortConfig.key === 'startDate' && (
                        <span style={{ marginLeft: '5px' }}>
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </th>
                    <th
                      style={{ cursor: 'pointer', userSelect: 'none' }}
                      onClick={() => handleSort('endDate')}
                    >
                      End Date
                      {sortConfig.key === 'endDate' && (
                        <span style={{ marginLeft: '5px' }}>
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </th>
                    <th>Duration</th>
                    <th
                      style={{ cursor: 'pointer', userSelect: 'none' }}
                      onClick={() => handleSort('createdAt')}
                    >
                      Created Date
                      {sortConfig.key === 'createdAt' && (
                        <span style={{ marginLeft: '5px' }}>
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </th>
                    <th>Status</th>
                    <th>View</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((request) => (
                    <tr key={request.travelRequestId} className="clickableRow"  onClick={() => console.log('📋 Row clicked for:', request.travelRequestId)}>
                      <td>{request.travelRequestId}</td>
                      <td>{request.purpose}</td>
                      <td>{request.projectId}</td>
                      <td>{formatDate(request.startDate)}</td>
                      <td>{formatDate(request.endDate)}</td>
                      <td>{calculateDuration(request.startDate, request.endDate)} days</td>
                      <td>{formatDate(request.createdAt)}</td>
                      <td>
                        <span className={getStatusColor()}>
                          {getStatusDisplay()}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button
                            className="btnIcon"
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent event bubbling
                              console.log('👁️ Eye button clicked for request:', request.travelRequestId);
                              handleViewRequest(request.travelRequestId, request);
                            }}
                            title="View Details"
                          >
                            <FaEye />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: '#6c757d'
            }}>
              <div style={{ fontSize: '3em', marginBottom: '15px' }}>📋</div>
              <h3>No requests found</h3>
              <p style={{ marginBottom: '20px' }}>
                {requests.length === 0
                  ? "You haven't created any travel requests yet."
                  : "No requests match your current filters."
                }
              </p>
              {requests.length === 0 && (
                <button
                  className="btnPrimary"
                  onClick={onNewRequest}
                >
                  <FaPlus className="btnIcon" /> Create Your First Request
                </button>
              )}
              {requests.length > 0 && filteredRequests.length === 0 && (
                <button
                  className="btnSecondary"
                  onClick={clearFilters}
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats - Fixed this section */}
      <div className="statsContainer">
        <div className="statCard">
          <div className="statIcon total">
            <span style={{ fontSize: '1.8em' }}>📊</span>
          </div>
          <div className="statInfo">
            <h3>{requests.length}</h3>
            <p>Total Requests</p>
          </div>
        </div>
        <div className="statCard">
          <div className="statIcon approved">
            <span style={{ fontSize: '1.8em' }}>✅</span>
          </div>
          <div className="statInfo">
            <h3>{requests.filter(req => req.status === 'APPROVED').length}</h3>
            <p>Approved</p>
          </div>
        </div>
        <div className="statCard">
          <div className="statIcon pending">
            <span style={{ fontSize: '1.8em' }}>⏳</span>
          </div>
          <div className="statInfo">
            <h3>{requests.filter(req => req.status === 'PENDING').length}</h3>
            <p>Pending</p>
          </div>
        </div>
        <div className="statCard">
          <div className="statIcon rejected">
            <span style={{ fontSize: '1.8em' }}>❌</span>
          </div>
          <div className="statInfo">
            <h3>{requests.filter(req => req.status === 'REJECTED').length}</h3>
            <p>Rejected</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyRequests;