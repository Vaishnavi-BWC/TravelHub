// components/dashboard/Dashboard.js
import React, { useEffect, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import DashboardStats from './DashboardStats';
import PendingApprovals from './PendingApprovals';
import RecentEmployees from './RecentEmployees';
import LoadingSpinner from '../common/LoadingSpinner';
import { approvalService } from '../../services/approvalService';
<<<<<<< HEAD
import { hrService } from '../../services/hrService';

// Cache configuration
const CACHE_KEYS = {
  DASHBOARD_SUMMARY: 'dashboard_summary',
  PENDING_APPROVALS: 'pending_approvals',
  HR_PROFILE: 'hr_profile',
  EXCEPTION_COUNT: 'exception_count' // Add cache key for exceptions
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
=======
import { hrService } from '../../services/hrService'; // Import hr service
>>>>>>> upstream/main

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
<<<<<<< HEAD
  const [exceptionCount, setExceptionCount] = useState(0); // Add exception count state
  const [dashboardSummary, setDashboardSummary] = useState({});
  const [loadingApprovals, setLoadingApprovals] = useState(true);
  const [loadingExceptions, setLoadingExceptions] = useState(true); // Add loading state for exceptions
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [userName, setUserName] = useState('HR');

  // Cache utility functions
  const getCachedData = useCallback((key) => {
    try {
      const cached = localStorage.getItem(key);
      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);
      const isExpired = Date.now() - timestamp > CACHE_DURATION;

      return isExpired ? null : data;
    } catch (error) {
      console.error('Error reading cache:', error);
      return null;
    }
  }, []);

  const setCachedData = useCallback((key, data) => {
    try {
      const cacheData = {
        data,
        timestamp: Date.now()
      };
      localStorage.setItem(key, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error setting cache:', error);
    }
  }, []);

  // Function to load exception count
  // In Dashboard.js - update the loadExceptionCount function
const loadExceptionCount = useCallback(async () => {
  try {
    setLoadingExceptions(true);
    
    // Try to get from cache first
    const cachedCount = getCachedData(CACHE_KEYS.EXCEPTION_COUNT);
    if (cachedCount !== null) {
      console.log('✅ Using cached exception count:', cachedCount);
      setExceptionCount(cachedCount);
      setLoadingExceptions(false);
      return;
    }

    console.log('🔄 Fetching exception requests for dashboard...');
    
    try {
      // Use the same service as your ExceptionsManagement component
      const exceptions = await hrService.getRoleExceptions();
      console.log('✅ Exception requests fetched:', exceptions);
      
      if (!exceptions) {
        console.warn('⚠️ No exceptions data returned from API');
        setExceptionCount(0);
        return;
      }
      
      // Count ALL exceptions (or filter for pending ones)
      const totalExceptionsCount = exceptions.length;
      
      console.log('📊 Total exceptions count:', totalExceptionsCount);
      setExceptionCount(totalExceptionsCount);
      setCachedData(CACHE_KEYS.EXCEPTION_COUNT, totalExceptionsCount);
      
    } catch (apiError) {
      console.error('❌ API Error in loadExceptionCount:', apiError);
      setExceptionCount(0);
    }
    
  } catch (err) {
    console.error('❌ General Error in loadExceptionCount:', err);
    setExceptionCount(0);
  } finally {
    setLoadingExceptions(false);
  }
}, [getCachedData, setCachedData]);
  // Load dashboard data including approvals count, dashboard summary, exceptions and user name
=======
  const [dashboardSummary, setDashboardSummary] = useState({});
  const [loadingApprovals, setLoadingApprovals] = useState(true);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [userName, setUserName] = useState('HR'); // State for user name

  // Load dashboard data including approvals count, dashboard summary and user name
>>>>>>> upstream/main
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Load employees data if needed
        if (employeesData.allEmployees.length === 0 && !employeesData.dashboardLoading) {
          await employeesData.loadAllEmployeesForDashboard();
        }

        // Load pending approvals count (for PendingApprovals component)
        await loadPendingApprovalsCount();

<<<<<<< HEAD
        // Load exception count (for DashboardStats component)
        await loadExceptionCount();

=======
>>>>>>> upstream/main
        // Load dashboard summary (for DashboardStats component)
        await loadDashboardSummary();

        // Load user name
        await loadUserName();
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      }
    };
    
    loadDashboardData();
  }, [loadExceptionCount]); // Add loadExceptionCount to dependencies

  // Function to load user name
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const loadUserName = async () => {
    try {
      // Try to get from cache first
      const cachedUserName = getCachedData(CACHE_KEYS.HR_PROFILE);
      if (cachedUserName) {
        console.log('✅ Using cached HR profile');
        setUserName(cachedUserName);
        return;
      }

      console.log('🔍 Fetching HR user name for dashboard...');
      
      const profileData = await hrService.getHRProfile();
      console.log('✅ HR Profile data received:', profileData);
      
      // Set the user name
      let nameToSet = 'HR';
      if (profileData && profileData.fullName) {
        let namearray = profileData.fullName.split(" ");
        console.log(namearray.length)
        if(namearray.length>1){
          nameToSet = namearray[0];
        } else {
          nameToSet = profileData.fullName;
        }
      }
      
      setUserName(nameToSet);
      setCachedData(CACHE_KEYS.HR_PROFILE, nameToSet);
    } catch (err) {
      console.error('❌ Error fetching HR profile:', err);
      // Fallback to localStorage data
      const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
      const fallbackName = userData.userName || userData.email || 'HR';
      setUserName(fallbackName);
      setCachedData(CACHE_KEYS.HR_PROFILE, fallbackName);
    }
  };

<<<<<<< HEAD
  // Function to load pending approvals count
  // eslint-disable-next-line react-hooks/exhaustive-deps
=======
  // Function to load user name
  const loadUserName = async () => {
    try {
      console.log('🔍 Fetching HR user name for dashboard...');
      
      const profileData = await hrService.getHRProfile();
      console.log('✅ HR Profile data received:', profileData);
      
      // Set the user name
      if (profileData && profileData.fullName) {
        let namearray = profileData.fullName.split(" ");
        console.log(namearray.length)
        if(namearray.length>1){
          setUserName(namearray[0]);
        } else {
          setUserName(profileData.fullName);
        }
      }
    } catch (err) {
      console.error('❌ Error fetching HR profile:', err);
      // Fallback to localStorage data
      const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
      setUserName(userData.userName || userData.email || 'HR');
    }
  };

  // Function to load pending approvals count (for PendingApprovals component)
>>>>>>> upstream/main
  const loadPendingApprovalsCount = async () => {
    try {
      setLoadingApprovals(true);
      
      // Try to get from cache first
      const cachedCount = getCachedData(CACHE_KEYS.PENDING_APPROVALS);
      if (cachedCount !== null) {
        console.log('✅ Using cached pending approvals count:', cachedCount);
        setPendingApprovalsCount(cachedCount);
        setLoadingApprovals(false);
        return;
      }

      console.log('🔄 Fetching pending approvals count for dashboard...');
      
      const apiData = await approvalService.getPendingApprovals();
      console.log('✅ Pending approvals count fetched:', apiData.length);
      
      // Count only pending approvals
      const pendingCount = apiData.filter(item => 
        item.status?.toLowerCase() === 'pending' || 
        item.status?.toLowerCase() === 'submitted'
      ).length;
      
      setPendingApprovalsCount(pendingCount);
      setCachedData(CACHE_KEYS.PENDING_APPROVALS, pendingCount);
    } catch (err) {
      console.error('❌ Error fetching pending approvals count:', err);
      setPendingApprovalsCount(0);
    } finally {
      setLoadingApprovals(false);
    }
  };

<<<<<<< HEAD
  // Function to load dashboard summary
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const loadDashboardSummary = async () => {
    try {
      setLoadingSummary(true);
      
      // Try to get from cache first
      const cachedSummary = getCachedData(CACHE_KEYS.DASHBOARD_SUMMARY);
      if (cachedSummary) {
        console.log('✅ Using cached dashboard summary');
        setDashboardSummary(cachedSummary);
        setLoadingSummary(false);
        return;
      }

=======
  // Function to load dashboard summary (for DashboardStats component)
  const loadDashboardSummary = async () => {
    try {
      setLoadingSummary(true);
>>>>>>> upstream/main
      console.log('🔄 Fetching dashboard summary...');
      
      const summaryData = await hrService.getDashboardSummary();
      console.log('✅ Dashboard summary fetched:', summaryData);
      
      setDashboardSummary(summaryData);
<<<<<<< HEAD
      setCachedData(CACHE_KEYS.DASHBOARD_SUMMARY, summaryData);
    } catch (err) {
      console.error('❌ Error fetching dashboard summary:', err);
      setDashboardSummary({});
=======
    } catch (err) {
      console.error('❌ Error fetching dashboard summary:', err);
      setDashboardSummary({}); // Set empty object on error
>>>>>>> upstream/main
    } finally {
      setLoadingSummary(false);
    }
  };

<<<<<<< HEAD
  // Navigation handlers
  // eslint-disable-next-line no-unused-vars
=======
>>>>>>> upstream/main
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

  // Refresh handler
  // eslint-disable-next-line no-unused-vars
  const handleRefresh = useCallback(() => {
    // Clear cache and refresh data
    Object.values(CACHE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    
    refreshAllData();
<<<<<<< HEAD
    loadPendingApprovalsCount();
    loadExceptionCount(); // Refresh exception count too
    loadDashboardSummary();
    loadUserName();
  }, [refreshAllData, loadPendingApprovalsCount, loadExceptionCount, loadDashboardSummary, loadUserName]);
=======
    loadPendingApprovalsCount(); // Refresh approvals count too
    loadDashboardSummary(); // Refresh dashboard summary
    loadUserName(); // Refresh user name too
  }, [refreshAllData, loadPendingApprovalsCount, loadDashboardSummary, loadUserName]);
>>>>>>> upstream/main

  // Show loading only if critical data is loading
  const isLoading = (employeesData.dashboardLoading && employees.length === 0 && employeesData.allEmployees.length === 0) || 
                   (loadingApprovals && pendingApprovalsCount === 0) ||
<<<<<<< HEAD
                   (loadingExceptions && exceptionCount === 0) ||
=======
>>>>>>> upstream/main
                   (loadingSummary && Object.keys(dashboardSummary).length === 0);

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
<<<<<<< HEAD
          <h2>Welcome {userName}!</h2>
=======
          <h2>Welcome {userName}!</h2> {/* Updated to show dynamic user name */}
          {/* <button 
            className="btn btnSecondary" 
            onClick={handleRefresh}
            disabled={loadingApprovals || employeesData.dashboardLoading}
            title="Refresh dashboard"
          >
            <i className={`fas fa-refresh ${loadingApprovals ? 'fa-spin' : ''}`}></i> Refresh
          </button> */}
>>>>>>> upstream/main
        </div>

        {/* Pass exceptionCount to DashboardStats */}
        <DashboardStats
          employees={employeesData.allEmployees}
          totalEmployees={totalEmployees}
          activeEmployeesCount={activeEmployeesCount}
<<<<<<< HEAD
          dashboardSummary={{
            ...dashboardSummary,
            exceptionCount: exceptionCount // Add exception count to dashboard summary
          }}
=======
          dashboardSummary={dashboardSummary} // Pass the dashboard summary data
>>>>>>> upstream/main
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
              onApprovalsUpdate={loadPendingApprovalsCount}
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
                <span>
                  View Exceptions
<<<<<<< HEAD
                  {exceptionCount > 0 && (
                    <span className="badge-count">({exceptionCount})</span>
=======
                  {dashboardSummary.raisedExceptionsCount > 0 && (
                    <span className="badge-count">({dashboardSummary.raisedExceptionsCount})</span>
>>>>>>> upstream/main
                  )}
                </span>
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