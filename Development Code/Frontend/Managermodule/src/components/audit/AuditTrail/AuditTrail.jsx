// components/audit/AuditTrail/AuditTrail.js
import React, { useState, useEffect } from 'react';
import { auditService } from '../../../services/auditService';
import './AuditTrail.css';

const AuditTrail = () => {
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadAuditTrail();
  }, [filter]);

  const loadAuditTrail = async () => {
    setLoading(true);
    setError(null);
    try {
      const filters = filter !== 'All' ? { action: filter } : {};
      const logs = await auditService.getAuditTrail(filters);
      setAuditLogs(logs);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = auditLogs.filter(log =>
    log.requestId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.remark?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.by && log.by.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="card">
      <div className="card-header-flex">
        <div className="filter-buttons">
          {["All", "APPROVED", "REJECTED", "CHANGES_REQUESTED", "ESCALATED"].map((action) => (
            <button
              key={action}
              onClick={() => setFilter(action)}
              className={`filter-btn ${filter === action ? 'filter-btn-active' : ''}`}
            >
              {action.replace('_', ' ')}
            </button>
          ))}
        </div>
        <div className="search-box">
          <i className="fas fa-search search-icon"></i>
          <input
            type="text"
            placeholder="Search audit trail..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="card-body">
        {loading ? (
          <div className="loading">Loading audit trail...</div>
        ) : error ? (
          <div className="error-message">
            <i className="fas fa-exclamation-circle"></i> {error}
          </div>
        ) : filteredLogs.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Action</th>
                <th>Request ID</th>
                <th>Performed By</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log, index) => (
                <tr key={index}>
                  <td>{log.timestamp ? new Date(log.timestamp).toLocaleString() : log.date}</td>
                  <td>
                    <span className={`status ${log.action?.toLowerCase().replace(' ', '-')}`}>
                      {log.action?.replace('_', ' ')}
                    </span>
                  </td>
                  <td>{log.requestId}</td>
                  <td>{log.by || "Manager"}</td>
                  <td>{log.remark}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <i className="fas fa-history empty-icon"></i>
            <h3>No Audit Records Yet</h3>
            <p>Audit trail will appear here as you take actions on travel requests.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditTrail;