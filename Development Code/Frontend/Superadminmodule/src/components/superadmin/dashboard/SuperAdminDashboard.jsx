/* eslint-disable no-unused-vars */
// components/superadmin/dashboard/SuperAdminDashboard.js
import React, { useState, useEffect } from "react";
import { useSuperAdmin } from "@/contexts/SuperAdminContext";
import { SuperAdminService } from "../../../services/superAdminService";
import DashboardStats from "./dashboardstats";
import FinancialChart from "./FinancialChart";
import ExpenseChart from "./ExpenseChart";
import QuickActions from "./QuickActions";
import styles from "../styles/SuperAdminDashboard.module.css";

const SuperAdminDashboard = () => {
  const { state } = useSuperAdmin();
  const [userName, setUserName] = useState('Admin');
  const [userNameLoading, setUserNameLoading] = useState(false);

  // Fetch super admin name on component mount (reusing the same API)
  useEffect(() => {
    const fetchSuperAdminName = async () => {
      try {
        setUserNameLoading(true);
        console.log('🔍 Fetching super admin name for dashboard...');
        
        const profileData = await SuperAdminService.getSuperAdminProfile();
        console.log('✅ Super Admin Profile data received for dashboard:', profileData);
        
        // Set the first name for welcome message
        if (profileData && profileData.firstName) {
          setUserName(profileData.firstName);
        }
      } catch (err) {
        console.error('❌ Error fetching super admin profile for dashboard:', err);
        // Fallback to localStorage data
        const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
        if (userData.userName) {
          // Extract first name from userName if available
          const firstName = userData.userName.split(' ')[0];
          setUserName(firstName);
        }
      } finally {
        setUserNameLoading(false);
      }
    };

    fetchSuperAdminName();
  }, []);

  const handleViewEmployees = (filter) => {
    console.log("View employees:", filter);
  };

  const handleViewApprovals = () => {
    console.log("View approvals");
  };

  const handleViewExceptions = () => {
    console.log("View exceptions");
  };

  const handleViewReimbursements = () => {
    console.log("View reimbursements");
  };

  return (
    <>
      <div className={styles.dashboardbody}>
        <h2>
          {userNameLoading ? 'Welcome Admin!' : `Welcome ${userName}!`}
        </h2>
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