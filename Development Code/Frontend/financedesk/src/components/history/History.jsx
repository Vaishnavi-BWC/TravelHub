import React from 'react';
import './History.css';

const History = () => {
  const historyRequests = [
    {
      id: 'REIM-2025-002',
      employee: 'Emily Rodriguez (E1004)',
      type: 'Reimbursement',
      amount: 6800,
      status: 'reimbursed',
      approvedDate: '2025-09-10',
      financeAction: 'Approved as per policy'
    }
  ];

  const handleViewDetails = (requestId) => {
    console.log('View details:', requestId);
  };

  const handlePrint = (requestId) => {
    console.log('Print:', requestId);
  };

  const handleExportHistory = () => {
    console.log('Exporting history...');
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'reimbursed':
        return 'status-badge reimbursed';
      case 'rejected':
        return 'status-badge rejected';
      case 'approved':
        return 'status-badge approved';
      default:
        return 'status-badge';
    }
  };

  return (
    <div className="history">
      <h2 className="section-title">Request History</h2>
      
      <div className="history-card">
        <div className="card-header">
          <h3>All Processed Requests</h3>
          <button 
            className="export-btn"
            onClick={handleExportHistory}
          >
            <i className="fas fa-download"></i>
            Export History
          </button>
        </div>
        
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Employee</th>
                <th>Type</th>
                <th>Amount (₹)</th>
                <th>Status</th>
                <th>Approved Date</th>
                <th>Finance Action</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {historyRequests.map(request => (
                <tr key={request.id}>
                  <td>{request.id}</td>
                  <td>{request.employee}</td>
                  <td>{request.type}</td>
                  <td>₹{request.amount.toLocaleString()}</td>
                  <td>
                    <span className={getStatusBadgeClass(request.status)}>
                      {request.status}
                    </span>
                  </td>
                  <td>{request.approvedDate}</td>
                  <td>{request.financeAction}</td>
                  <td className="action-buttons">
                    <button 
                      className="icon-btn"
                      onClick={() => handleViewDetails(request.id)}
                      title="View Details"
                    >
                      👁️
                    </button>
                    <button 
                      className="icon-btn"
                      onClick={() => handlePrint(request.id)}
                      title="Print"
                    >
                      🖨️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default History;