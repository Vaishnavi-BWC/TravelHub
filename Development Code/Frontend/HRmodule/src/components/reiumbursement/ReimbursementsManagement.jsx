import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import LoadingSpinner from '../common/LoadingSpinner';

const ReimbursementsManagement = () => {
  const { reimbursementId } = useParams();
  const navigate = useNavigate();
  const { 
    reimbursements = [], 
    loading, 
    error
  } = useApp();

  const handleBack = () => {
    navigate('/reimbursements');
  };

  if (error) {
    return (
      <div className="content">
        <div className="error">Error: {error}</div>
        <button onClick={handleBack} className="btn btnSecondary">Back</button>
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner text="Loading reimbursements..." />;
  }

  return (
    <div className="content">
      <div className="detailHeader">
        <h2>Reimbursement Claims</h2>
        <p>Manage employee expense reimbursement claims</p>
      </div>

      <div className="card">
        <div className="cardBody">
          {reimbursements.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <i className="fas fa-file-invoice-dollar" style={{ fontSize: '48px', color: '#ccc', marginBottom: '20px' }}></i>
              <h3>No Reimbursement Data</h3>
              <p>Reimbursement management API is not yet implemented.</p>
              <p>This feature will display real data when the backend API is available.</p>
            </div>
          ) : (
            <p>Reimbursement data will be displayed here when available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export { ReimbursementsManagement };
export default ReimbursementsManagement;