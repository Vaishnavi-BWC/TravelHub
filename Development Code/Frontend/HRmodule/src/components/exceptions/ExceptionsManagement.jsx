import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import LoadingSpinner from '../common/LoadingSpinner';

const ExceptionsManagement = () => {
  const { exceptionId } = useParams();
  const navigate = useNavigate();
  const { 
    exceptionRequests = [], 
    loading, 
    error
  } = useApp();

  const handleBack = () => {
    navigate('/exceptions');
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
    return <LoadingSpinner text="Loading exceptions..." />;
  }

  return (
    <div className="content">
      <div className="detailHeader">
        <h2>Exception Requests</h2>
        <p>Manage policy exception requests from employees</p>
      </div>

      <div className="card">
        <div className="cardBody">
          {exceptionRequests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <i className="fas fa-exclamation-triangle" style={{ fontSize: '48px', color: '#ccc', marginBottom: '20px' }}></i>
              <h3>No Exception Data</h3>
              <p>Exception management API is not yet implemented.</p>
              <p>This feature will display real data when the backend API is available.</p>
            </div>
          ) : (
            <p>Exception data will be displayed here when available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export { ExceptionsManagement };
export default ExceptionsManagement;