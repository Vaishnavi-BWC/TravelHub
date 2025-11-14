import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const location = useLocation();
  const [authChecked, setAuthChecked] = useState(false);
  
  // Get user data from localStorage
  const user = JSON.parse(localStorage.getItem('user'));
  const isAuthenticated = !!localStorage.getItem('user');

  // Simulate authentication check
  useEffect(() => {
    const timer = setTimeout(() => {
      setAuthChecked(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  // Show loading while checking authentication
  if (!authChecked) {
    return <LoadingSpinner text="Checking authentication..." />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has required role
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <div className="unauthorized-container">
        <div className="unauthorized-content">
          <div className="unauthorized-icon">🚫</div>
          <h2>Access Denied</h2>
          <p>You don't have permission to access this page.</p>
          <p>Your role: <strong>{user.role?.toUpperCase()}</strong></p>
          <p>Required roles: {allowedRoles.map(role => role.toUpperCase()).join(', ')}</p>
          <button 
            onClick={() => window.location.href = '/dashboard'}
            className="btn btn-primary"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;