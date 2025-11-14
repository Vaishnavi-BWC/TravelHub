import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import Badge from '../common/Badge';

const Sidebar = ({ sidebarOpen, onMenuSelect, onCloseSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { exceptionCount, reimbursementPendingCount } = useApp();

  const menuItems = [
    { key: 'dashboard', icon: 'fas fa-tachometer-alt', label: 'Dashboard', path: '/dashboard' },
    { key: 'new-employee', icon: 'fas fa-user-plus', label: 'Add Employee', path: '/newemployees' },
    { key: 'employee-list', icon: 'fas fa-users', label: 'Employee Management', path: '/employees' },
    { key: 'approval-requests', icon: 'fas fa-clipboard-check', label: 'Approval Center', path: '/approvals' },
    { key: 'exceptions', icon: 'fas fa-exclamation-circle', label: 'Exception Alerts', path: '/exceptions' },
    { key: 'reimbursements', icon: 'fas fa-file-invoice', label: 'Reiumbursement', path: '/reimbursements' },

    { key: 'audit', icon: 'fas fa-history', label: 'Activity Log', path: '/audit' },
    { key: 'profile', icon: 'fas fa-user', label: 'My Profile', path: '/profile' },
    { key: 'help', icon: 'fas fa-info-circle', label: 'Help & Support', path: '/help' },
    { key: 'logout', icon: 'fas fa-sign-out-alt', label: 'Logout', path: '/logout' }
  ];

  const handleMenuSelect = (menuKey) => {
    const item = menuItems.find(m => m.key === menuKey);
    if (item) {
      navigate(item.path);
      onCloseSidebar();
    }
  };

  const isActive = (menuPath) => {
    return location.pathname === menuPath || location.pathname.startsWith(menuPath + '/');
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
            {item.badge > 0 && (
              <Badge variant="pending" style={{ marginLeft: 'auto' }}>
                {item.badge}
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