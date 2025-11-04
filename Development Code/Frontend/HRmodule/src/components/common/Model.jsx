// components/common/Modal.js - FIXED VERSION
import React, { useEffect } from 'react';
import '../../styles/Model.css';

const Modal = ({ isOpen, onClose, title, children, size = 'medium' }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // COMPLETELY DISABLE backdrop clicks
  const handleBackdropClick = (e) => {
    // Do nothing - modal stays open
  };

  const handleModalClick = (e) => {
    e.stopPropagation(); // Isolate modal from backdrop
  };

  if (!isOpen) return null;

  return (
    <div 
      className="modal-backdrop" 
      onClick={handleBackdropClick}
    >
      <div 
        className={`modal-container modal-${size}`}
        onClick={handleModalClick}
        style={{
          // Force fixed dimensions
          width: size === 'medium' ? '600px' : size === 'small' ? '400px' : '800px',
          minHeight: size === 'medium' ? '500px' : size === 'small' ? '400px' : '600px'
        }}
      >
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button 
            className="modal-close" 
            onClick={onClose}
            type="button"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="modal-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export { Modal };
export default Modal;