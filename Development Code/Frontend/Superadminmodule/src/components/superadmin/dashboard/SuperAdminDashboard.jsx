// components/superadmin/dashboard/SuperAdminDashboard.js
import React from 'react';
import { useSuperAdmin } from "@/contexts/SuperAdminContext";
import DashboardStats from './dashboardstats';
import FinancialChart from './FinancialChart';
import ExpenseChart from './ExpenseChart';
import QuickActions from './QuickActions';
import styles from '../styles/SuperAdminDashboard.module.css';

const SuperAdminDashboard = () => {
  const { state } = useSuperAdmin();
  const { users, policies, reports } = state;

  const handleViewEmployees = (filter) => {
    // Navigation logic - you can implement actual navigation here
    console.log('View employees:', filter);
  };

  const handleViewApprovals = () => {
    console.log('View approvals');
  };

  const handleViewExceptions = () => {
    console.log('View exceptions');
  };

  const handleViewReimbursements = () => {
    console.log('View reimbursements');
  };

  return (
    <>
    <div className={styles.dashboardbody}>
      <h2>Welcome Admin !</h2>
      {/* <p>Welcome to the Travel Ticket Management System Admin Panel</p> */}

      <DashboardStats 
        onViewEmployees={handleViewEmployees}
        onViewApprovals={handleViewApprovals}
        onViewExceptions={handleViewExceptions}
        onViewReimbursements={handleViewReimbursements}
      />

      <div className={styles.chartsGrid}>
        <FinancialChart />
        <ExpenseChart />
      </div>

      <QuickActions />
          </div>
    </>
  );
};

export default SuperAdminDashboard;