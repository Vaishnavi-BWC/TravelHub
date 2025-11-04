import React, { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSuperAdmin } from "@/contexts/SuperAdminContext";
import {
  FaChartBar, FaUsers, FaCog, FaFileAlt, FaEye,
  FaUserShield, FaSignOutAlt, FaCogs, FaTimes
} from 'react-icons/fa';
import styles from '../styles/SuperAdminSidebar.module.css';
import BWCLOGO from '../../../assets/bwclogo.png';
import { useAuth } from '../../../hooks/useAuth';

// Move constants outside component to prevent recreation
const LOGOUT_REDIRECT_URL = 'http://bwc-90.brainwaveconsulting.co.in:3000/';

const SuperAdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state, actions } = useSuperAdmin();
  const { sidebarOpen } = state;
  const { logout, loading: logoutLoading } = useAuth();

  const menuItems = [
    { key: 'dashboard', path: 'dashboard', icon: FaChartBar, label: 'Dashboard' },
    { key: 'user-management', path: 'users', icon: FaUsers, label: 'Employee Management' },
    {key:'Add Employee', path:'add-employee', icon:FaUsers, label:'Add Employee'},
    { key: 'policy-management', path: 'policies', icon: FaCog, label: 'Policy Management' },
    { key: 'sla-settings', path: 'sla', icon: FaCogs, label: 'SLA Settings' },
    { key: 'reports', path: 'reports', icon: FaFileAlt, label: 'Reports & Analytics' },
    { key: 'system-logs', path: 'logs', icon: FaEye, label: 'System Logs' },
    { key: 'override-approval', path: 'override', icon: FaUserShield, label: 'Override Approval' },
    // {key:'Profile',path:'profile', icon:FaUsers, label:'Profile'},
  ];

  const handleMenuSelect = (path) => {
    navigate(path);
    actions.setSidebarOpen(false);
  };

const isActive = (menuPath) => {
  return location.pathname === `/${menuPath}`;
};

  // Memoized logout handler
  const handleLogout = useCallback(async () => {
    try {
      await logout({
        showConfirmation: true,
        redirectTo: LOGOUT_REDIRECT_URL
      });
    } catch (error) {
      console.error('Logout failed:', error);
      // Fallback redirect
      window.location.href = LOGOUT_REDIRECT_URL;
    }
  }, [logout]);

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className={styles.sidebarOverlay}
          onClick={() => actions.setSidebarOpen(false)}
        />
      )}
      
      <div className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.brandContainer}>
            <div className={styles.logoWrapper}>
              <img src={BWCLOGO} alt="BWC Labs Logo" className={styles.logo} />
            </div>
            <div className={styles.brandText}>
              <span className={styles.companyName}>BWC Labs</span>
              <span className={styles.appName}>BrainWave Travel Hub</span>
            </div>
          </div>
          <button 
            className={styles.sidebarToggle}
            onClick={() => actions.setSidebarOpen(false)}
          >
            <FaTimes />
          </button>
        </div>
        
        <div className={styles.sidebarMenu}>
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <div
                key={item.key}
                className={`${styles.menuItem} ${isActive(item.path) ? styles.active : ''}`}
                onClick={() => handleMenuSelect(item.path)}
              >
                <IconComponent className={styles.menuIcon} />
                <span>{item.label}</span>
              </div>
            );
          })}
          
          {/* Logout Menu Item */}
          <div 
            className={styles.menuItem} 
            onClick={handleLogout}
            title="Logout"
            aria-label="Logout"
          >
            <FaSignOutAlt className={styles.menuIcon} />
            <span>
              {logoutLoading ? 'Logging out...' : 'Logout'}
            </span>
            {logoutLoading && (
              <div className={styles.logoutSpinner}>
                <FaCog className={styles.spinning} />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SuperAdminSidebar;