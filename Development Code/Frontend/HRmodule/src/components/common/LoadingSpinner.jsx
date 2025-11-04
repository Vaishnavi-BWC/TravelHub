import React from 'react';

const LoadingSpinner = ({ size = "medium", text = "Loading..." }) => {
  return (
    <div className={`loading-spinner ${size}`}>
      <div className="spinner"></div>
      <p>{text}</p>
    </div>
  );
};

// Export as named export
export { LoadingSpinner };

// Also export as default for backward compatibility
export default LoadingSpinner;