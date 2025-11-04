// components/logout/Logout.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
// import './Logout.css';

const Logout = () => {
  const navigate = useNavigate();
  const { logout, loading: logoutLoading } = useAuth();

  const handleLogout = async () => {
    try {
      await logout({
        showConfirmation: false, // Already showing confirmation UI
        redirectTo: 'http://bwc-90.brainwaveconsulting.co.in:3000/',
        forceRedirect: true
      });
    } catch (error) {
      console.error('Logout failed:', error);
      // Force redirect even if error
      window.location.href = 'http://bwc-90.brainwaveconsulting.co.in:3000/';
    }
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

  return (
    <div className="content">
      <div className="card">
        <div className="cardBody">
          <div style={{ textAlign: 'center', padding: '5px 0' }}>
            <h3>
              <i 
                className="fas fa-sign-out-alt" 
                style={{ fontSize: '24px', color: '#666', marginBottom: '20px' }}
              ></i>
              Confirm Logout
            </h3>
            <p>Thank you for using the HR Management System.</p>
            <p style={{fontWeight:'900'}}>Are you sure you want to logout?</p>
            
            <div className="formActions" style={{ marginTop: '30px' }}>
              <button 
                onClick={handleCancel} 
                className="btn btnSecondary btnsec"
                disabled={logoutLoading}
              >
                <i className="fas fa-arrow-left"></i> Cancel
              </button>
              <button 
                onClick={handleLogout} 
                className="btn btnPrimary btnLogout"
                disabled={logoutLoading}
              >
                {logoutLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Logging out...
                  </>
                ) : (
                  <>
                    <i className="fas fa-sign-out-alt"></i> Confirm Logout
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { Logout };
export default Logout;