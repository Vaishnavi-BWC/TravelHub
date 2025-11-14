import React from 'react';

const HelpSupport = () => {
  return (
    <div className="content">
      <div className="detailHeader">
        <h2>Help & Support</h2>
        <p>Get assistance with using the HR Management System</p>
      </div>

      <div className="card">
        <div className="cardHeader">
          <h3>Support Resources</h3>
        </div>
        <div className="cardBody">
          <div className="helpGrid">
            <div className="helpSection">
              <h4><i className="fas fa-book"></i> Documentation</h4>
              <p>Access user guides and system documentation</p>
              <button className="btn btnPrimary">View Documentation</button>
            </div>
            
            <div className="helpSection">
              <h4><i className="fas fa-phone"></i> Contact Support</h4>
              <p>Get help from our support team</p>
              <p><strong>Email:</strong> support@company.com</p>
              <p><strong>Phone:</strong> +1 (555) 123-HELP</p>
            </div>
            
          
          </div>
        </div>
      </div>
    </div>
  );
};

export { HelpSupport };
export default HelpSupport;
