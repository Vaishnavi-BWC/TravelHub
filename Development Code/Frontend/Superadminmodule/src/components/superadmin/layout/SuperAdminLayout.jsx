import React from 'react';
import { Outlet } from 'react-router-dom';
import SuperAdminSidebar from './SuperAdminSidebar';
import SuperAdminHeader from './SuperAdminHeader';
import styles from '../styles/SuperAdminLayout.module.css';
const SuperAdminLayout = () => {
  return (
    <div className={styles.container}>
      <SuperAdminSidebar />
      
      <div className={styles.mainContent}>
        <SuperAdminHeader />
        
        <div className={styles.content}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default SuperAdminLayout;