// pages/Travel/RequestDetailPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { managerService } from '../../services/managerService';
import './RequestDetailPage.css';

const RequestDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [workflowData, setWorkflowData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch request details
  const fetchRequestDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Fetching request details for:', id);
      
      // Get all requests and find the specific one
      const allRequests = await managerService.getAllTravelRequests();
      const foundRequest = allRequests.find(req => req.travelRequestId === id);
      
      if (!foundRequest) {
        throw new Error('Request not found');
      }
      
      setRequest(foundRequest);
      
      // Fetch workflow data if it's not a draft
      if (foundRequest.managerPresent !== false) {
        const workflow = await managerService.getWorkflowStatus(id);
        setWorkflowData(workflow);
      }
      
    } catch (err) {
      console.error('❌ Error fetching request details:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchRequestDetails();
    }
  }, [id]);

  const handleBack = () => {
    navigate('/my-requests');
  };

  const handleRefresh = () => {
    fetchRequestDetails();
  };

  // Format stage text
  const formatStageText = (stage) => {
    if (!stage) return 'Not Available';
    return stage
      .toLowerCase()
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Get status info
  const getStatusInfo = () => {
    if (request.managerPresent === false) {
      return { text: 'Draft', className: 'status-draft' };
    }
    
    if (workflowData) {
      const { status, currentStep } = workflowData;
      
      if (status === 'PENDING') {
        return { 
          text: 'Pending', 
          className: 'status-pending',
          stage: formatStageText(currentStep)
        };
      } else if (status === 'APPROVED') {
        return { 
          text: 'Approved', 
          className: 'status-approved',
          stage: 'Completed'
        };
      } else if (status === 'REJECTED') {
        return { 
          text: 'Rejected', 
          className: 'status-rejected',
          stage: 'Rejected'
        };
      } else if (status === 'COMPLETED') {
        return { 
          text: 'Completed', 
          className: 'status-approved',
          stage: 'Completed'
        };
      }
    }
    
    return { 
      text: 'Submitted', 
      className: 'status-submitted',
      stage: 'Under Review'
    };
  };

  if (loading) {
    return (
      <div className="request-detail-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading request details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="request-detail-page">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>Error Loading Request</h3>
          <p>{error}</p>
          <div className="action-buttons">
            <button onClick={handleBack} className="btn btn-secondary">
              <i className="fas fa-arrow-left"></i> Back to My Requests
            </button>
            <button onClick={handleRefresh} className="btn btn-primary">
              <i className="fas fa-refresh"></i> Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="request-detail-page">
        <div className="error-container">
          <div className="error-icon">❌</div>
          <h3>Request Not Found</h3>
          <p>The requested travel request could not be found.</p>
          <button onClick={handleBack} className="btn btn-primary">
            <i className="fas fa-arrow-left"></i> Back to My Requests
          </button>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo();

  return (
    <div className="request-detail-page">
      <div className="page-head">
        <div className="header-content">
          {/* <button onClick={handleBack} className="back-button">
            <i className="fas fa-arrow-left"></i> Back to My Requests
          </button> */}
          <h3 className='page-title'>Travel Request Details</h3>
          <p className='page-subtitle'>Detailed information about your travel request</p>
        </div>
      </div>

      <div className="detail-container">
        {/* Single Card with All Information */}
        <div className="card single-detail-card">
          <div className="card-headerrequestdetail">
            <h3>Request Information</h3>
            <span className={`status-badge ${statusInfo.className}`}>
              {statusInfo.text}
            </span>
          </div>
          
          <div className="card-body">
            <div className="details-grid">
              {/* Status Section */}
              <div className="detail-section">
                <h4 className="section-title">
                  <i className="fas fa-flag"></i> Status Overview
                </h4>
                <div className="detail-row">
                  <div className="detail-label">Current Stage</div>
                  <div className="detail-value">{statusInfo.stage}</div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Request ID</div>
                  <div className="detail-value">T-{request.travelRequestId?.slice(-6)}</div>
                </div>
              </div>

              {/* Basic Information Section */}
              <div className="detail-section">
                <h4 className="section-title">
                  <i className="fas fa-info-circle"></i> Basic Information
                </h4>
                <div className="detail-row">
                  <div className="detail-label">Purpose of Travel</div>
                  <div className="detail-value">{request.purpose || 'Not specified'}</div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Project ID</div>
                  <div className="detail-value">
                    {request.projectId ? `P-${request.projectId.slice(-6)}` : 'N/A'}
                  </div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Employee ID</div>
                  <div className="detail-value">
                    {request.employeeId ? `E-${request.employeeId.slice(-6)}` : 'N/A'}
                  </div>
                </div>
              </div>

              {/* Travel Dates Section */}
              <div className="detail-section">
                <h4 className="section-title">
                  <i className="fas fa-calendar-alt"></i> Travel Dates
                </h4>
                <div className="detail-row">
                  <div className="detail-label">Start Date</div>
                  <div className="detail-value">
                    {request.startDate ? new Date(request.startDate).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">End Date</div>
                  <div className="detail-value">
                    {request.endDate ? new Date(request.endDate).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Duration</div>
                  <div className="detail-value">
                    {request.startDate && request.endDate ? 
                      Math.ceil((new Date(request.endDate) - new Date(request.startDate)) / (1000 * 60 * 60 * 24)) + ' days' : 
                      'N/A'
                    }
                  </div>
                </div>
              </div>

              {/* Submission Details Section */}
              <div className="detail-section">
                <h4 className="section-title">
                  <i className="fas fa-clock"></i> Submission Details
                </h4>
                <div className="detail-row">
                  <div className="detail-label">Created At</div>
                  <div className="detail-value">
                    {request.createdAt ? new Date(request.createdAt).toLocaleString() : 'N/A'}
                  </div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Last Updated</div>
                  <div className="detail-value">
                    {request.updatedAt ? new Date(request.updatedAt).toLocaleString() : 'N/A'}
                  </div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Manager Present</div>
                  <div className="detail-value">
                    <span className={`badge ${request.managerPresent ? 'badge-success' : 'badge-warning'}`}>
                      {request.managerPresent ? 'Yes' : 'No (Draft)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Workflow Information Section */}
              {workflowData && (
                <div className="detail-section">
                  <h4 className="section-title">
                    <i className="fas fa-sitemap"></i> Approval Workflow
                  </h4>
                  <div className="detail-row">
                    <div className="detail-label">Workflow ID</div>
                    <div className="detail-value">
                      {workflowData.workflowId ? `W-${workflowData.workflowId.slice(-6)}` : 'N/A'}
                    </div>
                  </div>
                  <div className="detail-row">
                    <div className="detail-label">Workflow Type</div>
                    <div className="detail-value">{workflowData.workflowType || 'N/A'}</div>
                  </div>
                  <div className="detail-row">
                    <div className="detail-label">Current Approver Role</div>
                    <div className="detail-value">{workflowData.currentApproverRole || 'N/A'}</div>
                  </div>
                  <div className="detail-row">
                    <div className="detail-label">Priority</div>
                    <div className="detail-value">{workflowData.priority || 'N/A'}</div>
                  </div>
                  {workflowData.dueDate && (
                    <div className="detail-row">
                      <div className="detail-label">Due Date</div>
                      <div className="detail-value">
                        {new Date(workflowData.dueDate).toLocaleString()}
                      </div>
                    </div>
                  )}
                  {workflowData.comments && (
                    <div className="detail-row">
                      <div className="detail-label">Comments</div>
                      <div className="detail-value">{workflowData.comments}</div>
                    </div>
                  )}
                </div>
              )}

              {/* Validation Information Section */}
              <div className="detail-section">
                <h4 className="section-title">
                  <i className="fas fa-check-circle"></i> Validation
                </h4>
                <div className="detail-row">
                 
                </div>
                {workflowData && (
                  <>
                    <div className="detail-row">
                      <div className="detail-label">Is Overpriced</div>
                      <div className="detail-value">
                        <span className={`badge ${workflowData.isOverpriced ? 'badge-danger' : 'badge-success'}`}>
                          {workflowData.isOverpriced ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                    {workflowData.overpricedReason && (
                      <div className="detail-row">
                        <div className="detail-label">Overpriced Reason</div>
                        <div className="detail-value">{workflowData.overpricedReason}</div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button onClick={handleBack} className="btn btn-secondary">
            <i className="fas fa-arrow-left"></i> Back to My Requests
          </button>
          <button onClick={handleRefresh} className="btn btn-primary">
            <i className="fas fa-refresh"></i> Refresh Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default RequestDetailPage;