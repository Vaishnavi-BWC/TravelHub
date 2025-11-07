import React, { useState, useEffect } from "react";
import "./Reports.css";

const Reports = () => {
  const [reportType, setReportType] = useState("Travel Summary");
  const [period, setPeriod] = useState("Last Month");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/travel-desk-proxy/api/travel-desk/history/stats', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Stats data:', data);
      setStats(data);
      
    } catch (err) {
      console.error('❌ Error fetching stats:', err);
      setError('Failed to load reports data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate additional metrics from the API data
  const calculateMetrics = (statsData) => {
    if (!statsData) return null;

    const approvalRate = statsData.totalActions > 0 
      ? ((statsData.approvals / statsData.totalActions) * 100).toFixed(1)
      : 0;

    const bookingCompletionRate = statsData.totalActions > 0
      ? ((statsData.bookingsCompleted / statsData.totalActions) * 100).toFixed(1)
      : 0;

    const overpricedRate = statsData.totalActions > 0
      ? ((statsData.overpricedMarkings / statsData.totalActions) * 100).toFixed(1)
      : 0;

    return {
      approvalRate: `${approvalRate}%`,
      bookingCompletionRate: `${bookingCompletionRate}%`,
      overpricedRate: `${overpricedRate}%`,
      firstActionDate: statsData.firstAction ? new Date(statsData.firstAction).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }) : 'N/A',
      lastActionDate: statsData.lastAction ? new Date(statsData.lastAction).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }) : 'N/A'
    };
  };

  if (loading) {
    return (
      <div className="reports">
        <div className="loading-state">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading reports data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="reports">
        <div className="error-state">
          <i className="fas fa-exclamation-triangle"></i>
          <h3>Error Loading Reports</h3>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={fetchStats}>
            <i className="fas fa-sync"></i> Retry
          </button>
        </div>
      </div>
    );
  }

  const metrics = calculateMetrics(stats);

  return (
    <div className="reports">
      {/* Header */}
      <div className="reports-header">
        <h2>Travel Desk Performance Report</h2>
        <p>Overview of your travel desk activities and performance metrics</p>
      </div>

      {/* Filters */}
      <div className="filters">
        <div className="filter-item">
          <label>Report Type</label>
          <select value={reportType} onChange={(e) => setReportType(e.target.value)}>
            <option>Travel Summary</option>
            <option>Performance Analytics</option>
            <option>Booking Statistics</option>
          </select>
        </div>
        <div className="filter-item">
          <label>Period</label>
          <select value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option>Last Month</option>
            <option>Last Quarter</option>
            <option>Last Year</option>
            <option>All Time</option>
          </select>
        </div>
        <button className="btn btn-primary" onClick={fetchStats}>
          <i className="fas fa-sync"></i> Refresh Data
        </button>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="card">
          <div className="card-icon">
            <i className="fas fa-tasks"></i>
          </div>
          <div className="card-content">
            <h3>{stats?.totalActions || 0}</h3>
            <p>Total Actions<br />Processed</p>
          </div>
        </div>
        
        <div className="card highlight">
          <div className="card-icon">
            <i className="fas fa-check-circle"></i>
          </div>
          <div className="card-content">
            <h3>{stats?.approvals || 0}</h3>
            <p>Approvals<br />Given</p>
          </div>
        </div>
        
        <div className="card">
          <div className="card-icon">
            <i className="fas fa-calendar-check"></i>
          </div>
          <div className="card-content">
            <h3>{stats?.bookingsCompleted || 0}</h3>
            <p>Bookings<br />Completed</p>
          </div>
        </div>
        
        <div className="card">
          <div className="card-icon">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <div className="card-content">
            <h3>{stats?.overpricedMarkings || 0}</h3>
            <p>Overpriced<br />Markings</p>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="metrics-section">
        <h4>Performance Metrics</h4>
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-value">{metrics?.approvalRate || '0%'}</div>
            <div className="metric-label">Approval Rate</div>
            <div className="metric-description">Percentage of approved requests</div>
          </div>
          
          <div className="metric-card">
            <div className="metric-value">{metrics?.bookingCompletionRate || '0%'}</div>
            <div className="metric-label">Booking Completion Rate</div>
            <div className="metric-description">Percentage of completed bookings</div>
          </div>
          
          <div className="metric-card">
            <div className="metric-value">{metrics?.overpricedRate || '0%'}</div>
            <div className="metric-label">Overpriced Detection Rate</div>
            <div className="metric-description">Percentage of overpriced requests detected</div>
          </div>
          
          <div className="metric-card">
            <div className="metric-value">{stats?.rejections || 0}</div>
            <div className="metric-label">Total Rejections</div>
            <div className="metric-description">Requests that were rejected</div>
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="timeline-section">
        <h4>Activity Timeline</h4>
        <div className="timeline-cards">
          <div className="timeline-card">
            <div className="timeline-icon">
              <i className="fas fa-play-circle"></i>
            </div>
            <div className="timeline-content">
              <h5>First Action</h5>
              <p>{metrics?.firstActionDate}</p>
              <small>Initial activity recorded</small>
            </div>
          </div>
          
          <div className="timeline-card">
            <div className="timeline-icon">
              <i className="fas fa-flag-checkered"></i>
            </div>
            <div className="timeline-content">
              <h5>Last Action</h5>
              <p>{metrics?.lastActionDate}</p>
              <small>Most recent activity</small>
            </div>
          </div>
          
          <div className="timeline-card">
            <div className="timeline-icon">
              <i className="fas fa-chart-line"></i>
            </div>
            <div className="timeline-content">
              <h5>Activity Period</h5>
              <p>{metrics?.firstActionDate === metrics?.lastActionDate ? 'Single Day' : 'Multiple Days'}</p>
              <small>Duration of recorded activities</small>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Statistics Table */}
      <div className="table-section">
        <h4>Detailed Statistics</h4>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Metric</th>
                <th>Count</th>
                <th>Percentage</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Total Actions</td>
                <td>{stats?.totalActions || 0}</td>
                <td>100%</td>
                <td>All actions performed in the system</td>
              </tr>
              <tr>
                <td>Approvals</td>
                <td>{stats?.approvals || 0}</td>
                <td>{metrics?.approvalRate || '0%'}</td>
                <td>Travel requests that were approved</td>
              </tr>
              <tr>
                <td>Rejections</td>
                <td>{stats?.rejections || 0}</td>
                <td>{stats?.totalActions ? ((stats.rejections / stats.totalActions) * 100).toFixed(1) + '%' : '0%'}</td>
                <td>Travel requests that were rejected</td>
              </tr>
              <tr>
                <td>Bookings Completed</td>
                <td>{stats?.bookingsCompleted || 0}</td>
                <td>{metrics?.bookingCompletionRate || '0%'}</td>
                <td>Successful travel bookings completed</td>
              </tr>
              <tr>
                <td>Overpriced Markings</td>
                <td>{stats?.overpricedMarkings || 0}</td>
                <td>{metrics?.overpricedRate || '0%'}</td>
                <td>Requests marked as overpriced for review</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Export Buttons */}
      <div className="export-section">
        <h4>Export Report</h4>
        <div className="export-buttons">
          <button className="btn pdf">
            <i className="fas fa-file-pdf"></i> Export as PDF
          </button>
          <button className="btn excel">
            <i className="fas fa-file-excel"></i> Export as Excel
          </button>
          <button className="btn btn-outline">
            <i className="fas fa-print"></i> Print Report
          </button>
        </div>
      </div>

      {/* Additional Info */}
      <div className="additional-info">
        <div className="info-card">
          <i className="fas fa-info-circle"></i>
          <div>
            <h5>Report Information</h5>
            <p>This report shows your travel desk performance metrics based on all recorded activities in the system.</p>
            <small>Data last updated: {new Date().toLocaleString()}</small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;