import React from 'react';
import { useApp } from '../../contexts/AppContext';
import LoadingSpinner from '../common/LoadingSpinner';

const AuditTrail = () => {
  const { auditTrail = [], loading } = useApp();

  if (loading) {
    return <LoadingSpinner text="Loading audit trail..." />;
  }

  return (
    <div className="content">
      <div className="detailHeader">
        <h2>Audit Trail</h2>
        <p>System activity and user actions log</p>
      </div>

      <div className="card">
        <div className="cardBody">
          {auditTrail.length === 0 ? (
            <p>No audit entries found.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Action</th>
                  <th>User</th>
                  <th>Time</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {auditTrail.slice().reverse().map((entry, index) => (
                  <tr key={entry.id || index}>
                    <td>{auditTrail.length - index}</td>
                    <td>{entry.action}</td>
                    <td>{entry.user}</td>
                    <td>{entry.time}</td>
                    <td>{entry.remark}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export { AuditTrail };
export default AuditTrail;