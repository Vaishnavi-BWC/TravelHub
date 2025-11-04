import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaCog, FaFileAlt, FaUserShield } from 'react-icons/fa';
import styles from '../superadmin.module.css';

const QuickActions = () => {
  const navigate = useNavigate();

  const quickActions = [
    {
      icon: FaUsers,
      label: 'Manage Users',
      path: '/users', // Absolute path
      color: 'blue'
    },
    {
      icon: FaCog,
      label: 'Configure Policies',
      path: '/policies', // Absolute path
      color: 'green'
    },
    {
      icon: FaFileAlt,
      label: 'Generate Reports',
      path: '/reports', // Absolute path
      color: 'purple'
    },
    {
      icon: FaUserShield,
      label: 'Override Approvals',
      path: '/override', // Absolute path
      color: 'red'
    }
  ];

  const handleActionClick = (path) => {
    console.log('Navigating to:', path);
    navigate(path);
  };

  return (
      <div className={`${styles.card} maincard`}>
      <div className={styles.cardHeader}>
        <h3>Quick Actions</h3>
      </div>
      <div className={`${styles.cardBody} ${styles.quickActions}`}>
        <div className={styles.quickActionGrid}>
          {quickActions.map((action, index) => {
            const IconComponent = action.icon;
            return (
              <button 
                key={index}
                onClick={() => handleActionClick(action.path)}
                className={styles.quickActionBtn}
              >
                <div className={`${styles.quickActionIcon} ${styles[action.color]}`}>
                  <IconComponent className={styles.quickActionSvg} />
                </div>
                <span>{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default QuickActions;