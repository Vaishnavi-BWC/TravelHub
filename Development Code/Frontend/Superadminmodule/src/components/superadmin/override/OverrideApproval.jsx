// components/superadmin/override/OverrideApproval.js
import React, { useState, useEffect } from 'react';
import { useSuperAdmin } from "@/contexts/SuperAdminContext";
import { FaSearch, FaSync, FaCheckCircle, FaTimesCircle, FaInfoCircle, FaExclamationTriangle } from 'react-icons/fa';
import styles from '../superadmin.module.css';

const OverrideApproval = () => {
  const { state, actions } = useSuperAdmin();
  const { overrideRequests, loading } = state;
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    actions.loadOverrideRequests({
      page: currentPage,
      search: searchTerm,
      status: statusFilter
    });
  }, [currentPage, searchTerm, statusFilter]);

  const filteredRequests = overrideRequests.filter(request =>
    request.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.requester?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.ticketId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRefresh = () => {
    actions.loadOverrideRequests({
      page: currentPage,
      search: searchTerm,
      status: statusFilter
    });
  };

  const handleApprove = async (requestId) => {
    const reason = prompt('Please provide reason for approval:');
    if (reason) {
      try {
        await actions.handleOverrideRequest(requestId, 'approved', reason);
        alert(`Override request approved successfully!`);
      } catch (error) {
        alert(`Error approving request: ${error.message}`);
      }
    }
  };

  const handleReject = async (requestId) => {
    const reason = prompt('Please provide reason for rejection:');
    if (reason) {
      try {
        await actions.handleOverrideRequest(requestId, 'rejected', reason);
        alert(`Override request rejected successfully!`);
      } catch (error) {
        alert(`Error rejecting request: ${error.message}`);
      }
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'high': return styles.highUrgency;
      case 'medium': return styles.mediumUrgency;
      case 'low': return styles.lowUrgency;
      default: return styles.mediumUrgency;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className={styles.container}>
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h3>Override Approval Requests</h3>
        <div className={styles.headerActions}>
          <div className={styles.searchBox}>
            <FaSearch className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Search requests..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="all">All</option>
          </select>

          <button className={styles.secondaryBtn} onClick={handleRefresh}>
            <FaSync className={styles.btnIcon} />
            Refresh
          </button>
        </div>
      </div>

      <div className={styles.cardBody}>
       

        <div className={styles.overrideList}>
          {loading && overrideRequests.length === 0 ? (
            <div className={styles.loading}>Loading override requests...</div>
          ) : filteredRequests.length === 0 ? (
            <div className={styles.noData}>No override requests found</div>
          ) : (
            filteredRequests.map(request => (
              <div key={request.id} className={styles.overrideItem}>
                <div className={styles.overrideHeader}>
                  <h4>
                    <FaExclamationTriangle className={styles.warningIcon} />
                    Ticket {request.ticketId} - {request.title}
                  </h4>
                  <div className={styles.overrideMeta}>
                    <span className={`${styles.urgencyTag} ${getUrgencyColor(request.urgency)}`}>
                      {request.urgency} urgency
                    </span>
                    {request.estimatedCost && (
                      <span className={styles.costTag}>
                        {formatCurrency(request.estimatedCost)}
                      </span>
                    )}
                  </div>
                </div>

                <div className={styles.overrideInfo}>
                  <div className={styles.infoGrid}>
                    <div>
                      <strong>Requester:</strong> {request.requester} ({request.department})
                    </div>
                    <div>
                      <strong>Policy Violation:</strong> {request.policyViolation}
                    </div>
                    <div>
                      <strong>Submitted:</strong> {new Date(request.submittedAt).toLocaleString()}
                    </div>
                    <div>
                      <strong>Status:</strong> 
                      <span className={`${styles.statusBadge} ${
                        request.status === 'pending' ? styles.pending : 
                        request.status === 'approved' ? styles.approved : 
                        styles.rejected
                      }`}>
                        {request.status}
                      </span>
                    </div>
                  </div>

                  <div className={styles.reasonSection}>
                    <strong>Reason for Override:</strong>
                    <p>{request.reason}</p>
                  </div>

                  {request.additionalInfo && (
                    <div className={styles.additionalInfo}>
                      <strong>Additional Information:</strong>
                      <p>{request.additionalInfo}</p>
                    </div>
                  )}
                </div>

                <div className={styles.overrideActions}>
                  <button 
                    className={styles.successBtn}
                    onClick={() => handleApprove(request.id)}
                    disabled={request.status !== 'pending'}
                    title="Approve Override Request"
                  >
                    <FaCheckCircle className={styles.btnIcon} />
                    Approve
                  </button>
                  <button 
                    className={styles.dangerBtn}
                    onClick={() => handleReject(request.id)}
                    disabled={request.status !== 'pending'}
                    title="Reject Override Request"
                  >
                    <FaTimesCircle className={styles.btnIcon} />
                    Reject
                  </button>
                  <button className={styles.secondaryBtn} title="View Details">
                    <FaInfoCircle className={styles.btnIcon} />
                    Details
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        <div className={styles.pagination}>
          <button 
            className={styles.paginationBtn}
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
          >
            Previous
          </button>
          <span>Page {currentPage}</span>
          <button 
            className={styles.paginationBtn}
            onClick={() => setCurrentPage(prev => prev + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
    </div>
  );
};

export default OverrideApproval;