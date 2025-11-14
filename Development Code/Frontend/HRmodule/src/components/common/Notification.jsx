
import React, { useEffect } from 'react';

export const Notification = ({ message, type = 'info', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success': return 'fas fa-check-circle';
      case 'error': return 'fas fa-exclamation-circle';
      case 'warning': return 'fas fa-exclamation-triangle';
      default: return 'fas fa-info-circle';
    }
  };

  return (
    <div className={`notification notification-${type}`}>
      <div className="notification-content">
        <i className={`${getIcon()} notification-icon`}></i>
        <span className="notification-message">{message}</span>
        <button 
          className="notification-close"
          onClick={onClose}
          aria-label="Close notification"
        >
          <i className="fas fa-times"></i>
        </button>
      </div>
    </div>
  );
};

export default Notification;
