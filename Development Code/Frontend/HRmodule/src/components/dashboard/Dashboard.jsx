// components/dashboard/Dashboard.js
import React, { useEffect, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import DashboardStats from './DashboardStats';
import PendingApprovals from './PendingApprovals';
import RecentEmployees from './RecentEmployees';
import LoadingSpinner from '../common/LoadingSpinner';
import { approvalService } from '../../services/approvalService'; // Import approval service

const Dashboard = () => {
  const navigate = useNavigate();
  const {
    employees = [],
    totalEmployees = 0,
    activeEmployeesCount = 0,
    employeesData,
    refreshAllData
  } = useApp();

  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0);
  const [loadingApprovals, setLoadingApprovals] = useState(true);

  // Load dashboard data including approvals count
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Load employees data if needed
        if (employeesData.allEmployees.length === 0 && !employeesData.dashboardLoading) {
          await employeesData.loadAllEmployeesForDashboard();
        }

        // Load pending approvals count
        await loadPendingApprovalsCount();
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      }
    };
    
    loadDashboardData();
  }, []);

  // Function to load pending approvals count
  const loadPendingApprovalsCount = async () => {
    try {
      setLoadingApprovals(true);
      console.log('🔄 Fetching pending approvals count for dashboard...');
      
      const apiData = await approvalService.getPendingApprovals();
      console.log('✅ Pending approvals count fetched:', apiData.length);
      
      // Count only pending approvals
      const pendingCount = apiData.filter(item => 
        item.status?.toLowerCase() === 'pending' || 
        item.status?.toLowerCase() === 'submitted'
      ).length;
      
      setPendingApprovalsCount(pendingCount);
    } catch (err) {
      console.error('❌ Error fetching pending approvals count:', err);
      setPendingApprovalsCount(0); // Set to 0 on error
    } finally {
      setLoadingApprovals(false);
    }
  };

  const handleViewEmployees = useCallback((filter) => {
    navigate('/employees');
  }, [navigate]);

  const handleViewApprovals = useCallback(() => {
    navigate('/approvals');
  }, [navigate]);

  const handleViewExceptions = useCallback(() => {
    navigate('/exceptions');
  }, [navigate]);

  const handleViewReimbursements = useCallback(() => {
    navigate('/reimbursements');
  }, [navigate]);

  const handleAddEmployee = useCallback(() => {
    navigate('/employees/new');
  }, [navigate]);

  const handleEmployeeSelect = useCallback((employeeId) => {
    navigate(`/employees/${employeeId}`);
  }, [navigate]);

  const handleRequestSelect = useCallback((request) => {
    navigate(`/approvals/${request.id}`);
  }, [navigate]);

  const handleRefresh = useCallback(() => {
    refreshAllData();
    loadPendingApprovalsCount(); // Refresh approvals count too
  }, [refreshAllData, loadPendingApprovalsCount]);

  // Show loading only if both employees and approvals are loading
  const isLoading = (employeesData.dashboardLoading && employees.length === 0 && employeesData.allEmployees.length === 0) || 
                   (loadingApprovals && pendingApprovalsCount === 0);

  if (isLoading) {
    return (
      <div className="content">
        <LoadingSpinner text="Loading dashboard data..." />
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="content">
        <div className="detailHeader">
          <h2>Welcome HR!</h2>
          {/* <button 
            className="btn btnSecondary" 
            onClick={handleRefresh}
            disabled={loadingApprovals || employeesData.dashboardLoading}
            title="Refresh dashboard"
          >
            <i className={`fas fa-refresh ${loadingApprovals ? 'fa-spin' : ''}`}></i> Refresh
          </button> */}
        </div>

        <DashboardStats
          employees={employeesData.allEmployees}
          totalEmployees={totalEmployees}
          activeEmployeesCount={activeEmployeesCount}
          pendingApprovalsCount={pendingApprovalsCount} // Pass the count directly
          onViewEmployees={handleViewEmployees}
          onViewApprovals={handleViewApprovals}
          onViewExceptions={handleViewExceptions}
          onViewReimbursements={handleViewReimbursements}
        />

        <div className="dashboardGrid">
          <div className="dashboardColumn">
            <PendingApprovals
              onViewAll={handleViewApprovals}
              onRequestSelect={handleRequestSelect}
              limit={3}
              onApprovalsUpdate={loadPendingApprovalsCount} // Pass callback to update count
            />
          </div>
          <div className="dashboardColumn">
            <RecentEmployees
              employees={employees}
              onViewAll={handleViewEmployees}
              onAddEmployee={handleAddEmployee}
              onEmployeeSelect={handleEmployeeSelect}
            />
          </div>
        </div>

        <div className="card">
          <h3 className="cardHeader">Quick Actions</h3>
          <div className="cardBody quickActions">
            <div className="quickActionGrid">
              <button onClick={handleAddEmployee} className="quickActionBtn">
                <div className="quickActionIcon blue">
                  <i className="fas fa-user-plus quickActionSvg"></i>
                </div>
                <span>Add New Employee</span>
              </button>
              <button onClick={handleViewEmployees} className="quickActionBtn">
                <div className="quickActionIcon green">
                  <i className="fas fa-users quickActionSvg"></i>
                </div>
                <span>View Employees</span>
              </button>
              <button onClick={handleViewApprovals} className="quickActionBtn">
                <div className="quickActionIcon purple">
                  <i className="fas fa-clipboard-check quickActionSvg"></i>
                </div>
                <span>
                  Review Approvals 
                  {pendingApprovalsCount > 0 && (
                    <span className="badge-count">({pendingApprovalsCount})</span>
                  )}
                </span>
              </button>
              <button onClick={handleViewExceptions} className="quickActionBtn">
                <div className="quickActionIcon orange">
                  <i className="fas fa-exclamation-triangle"></i>
                </div>
                <span>View Exceptions</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { Dashboard };
export default Dashboard;