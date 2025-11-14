import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import Badge from '../common/Badge';

const Sidebar = ({ sidebarOpen, onMenuSelect, onCloseSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { exceptionCount, reimbursementPendingCount } = useApp();

  // Use absolute paths starting with /hr/
  const menuItems = [
    { key: 'dashboard', icon: 'fas fa-tachometer-alt', label: 'Dashboard', path: '/hr/dashboard' },
    { key: 'new-employee', icon: 'fas fa-user-plus', label: 'Add Employee', path: '/hr/employees/new' },
    { key: 'employee-list', icon: 'fas fa-users', label: 'Employee Management', path: '/hr/employees' },
    { key: 'approval-requests', icon: 'fas fa-clipboard-check', label: 'Approval Center', path: '/hr/approvals' },
    { key: 'exceptions', icon: 'fas fa-exclamation-circle', label: 'Exception Alerts', path: '/hr/exceptions' },
    { key: 'reimbursements', icon: 'fas fa-file-invoice', label: 'Reimbursement', path: '/hr/reimbursements' },
    { key: 'audit', icon: 'fas fa-history', label: 'Activity Log', path: '/hr/audit' },
    { key: 'profile', icon: 'fas fa-user', label: 'My Profile', path: '/hr/profile' },
    { key: 'help', icon: 'fas fa-info-circle', label: 'Help & Support', path: '/hr/help' },
    { key: 'logout', icon: 'fas fa-sign-out-alt', label: 'Logout', path: '/hr/logout' }
  ];

  const handleMenuSelect = (menuKey) => {
    const item = menuItems.find(m => m.key === menuKey);
    if (item) {
      // Use replace: true to prevent history buildup
      navigate(item.path, { replace: true });
      onCloseSidebar();
    }
  };

  const isActive = (menuPath) => {
    return location.pathname === menuPath;
  };

  return (
    <div className={`sidebar ${sidebarOpen ? 'sidebarOpen' : ''}`}>
      <div className="sidebarHeader">
        <div className="brandContainer">
          <div className="logoWrapper">
            <img src='/BWCLOGO.png' alt="BWC Labs" />
          </div>
          <div className="brandText">
            <span className="companyName">BWC Labs</span>
            <span className="appName">BrainWave Travel Hub</span>
          </div>
        </div>
        <button className="sidebarToggle" onClick={onCloseSidebar}>
          <i className="fas fa-times"></i>
        </button>
      </div>
      <div className="sidebarMenu">
        {menuItems.map((item) => (
          <div
            key={item.key}
            className={`menuItem ${isActive(item.path) ? 'active' : ''}`}
            onClick={() => handleMenuSelect(item.key)}
          >
            <i className={`${item.icon} menuIcon`}></i>
            <span>{item.label}</span>
            {item.key === 'exceptions' && exceptionCount > 0 && (
              <Badge variant="pending" style={{ marginLeft: 'auto' }}>
                {exceptionCount}
              </Badge>
            )}
            {item.key === 'reimbursements' && reimbursementPendingCount > 0 && (
              <Badge variant="pending" style={{ marginLeft: 'auto' }}>
                {reimbursementPendingCount}
              </Badge>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export { Sidebar };
export default Sidebar;