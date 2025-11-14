// components/superadmin/dashboard/DashboardStats.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSuperAdmin } from '../../../contexts/SuperAdminContext';
import { EmployeeService } from '../../../services/EmployeeService';
import CardKPI from '../../common/CardKPI';
import { FaUsers, FaUserCheck, FaClipboardList, FaExclamationTriangle } from 'react-icons/fa';

const DashboardStats = () => {
  const { state, actions } = useSuperAdmin();
  const { dashboardStats, policies } = state;
  
  const [userCounts, setUserCounts] = useState({
    total: 0,
    active: 0,
    loading: true
  });
  
  const [hasLoaded, setHasLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        console.log('🔄 Loading employee counts for dashboard...');
        
        // Use getAllEmployees with a very large page size to get ALL employees
        console.log('📦 Calling getAllEmployees with large page size...');
        const response = await EmployeeService.getAllEmployees(0, 1000); // Large page size to get all
        
        console.log('✅ Employee API response:', response);
        
        let allEmployees = [];
        
        // Extract employees from the response based on your API structure
        if (response.employees && Array.isArray(response.employees)) {
          allEmployees = response.employees;
        } else if (response.data && response.data.content && Array.isArray(response.data.content)) {
          allEmployees = response.data.content;
        } else if (response.content && Array.isArray(response.content)) {
          allEmployees = response.content;
        } else if (Array.isArray(response.data)) {
          allEmployees = response.data;
        } else if (Array.isArray(response)) {
          allEmployees = response;
        }
        
        console.log('📊 Extracted employees:', allEmployees);
        console.log('👥 Employee array length:', allEmployees.length);
        
        // Calculate counts
        const totalUsers = allEmployees.length;
        const activeUsers = allEmployees.filter(emp => 
          emp.status === 'active' || emp.isActive === true || emp.active === true
        ).length;
        
        console.log('🎯 Final counts - Total:', totalUsers, 'Active:', activeUsers);
        
        setUserCounts({
          total: totalUsers,
          active: activeUsers,
          loading: false
        });

        // Load other dashboard data
        await actions.loadDashboardData();
        
        // Load policies if not already loaded
        if (!policies || policies.length === 0) {
          await actions.loadPolicies({ page: 1 });
        }
        
        setHasLoaded(true);
        
      } catch (error) {
        console.error('❌ Error loading dashboard data:', error);
        setUserCounts({
          total: 0,
          active: 0,
          loading: false
        });
      }
    };

    if (!hasLoaded) {
      loadDashboardData();
    }
  }, [actions, hasLoaded, policies]);

  const policyCount = policies?.length || 0;

  // Navigation handlers
  const handleViewEmployees = (filter = '') => {
    navigate('/users', {
      state: { filter: filter || 'all' }
    });
  };

  const handleViewApprovals = () => {
    navigate('/override');
  };

  const handleViewPolicies = () => {
    navigate('/policies');
  };

  const stats = [
    {
      icon: <FaUsers />,
      title: "Total Users",
      value: userCounts.loading ? '...' : userCounts.total,
      tone: "total",
      onClick: () => handleViewEmployees()
    },
    {
      icon: <FaUserCheck />,
      title: "Active Users",
      value: userCounts.loading ? '...' : userCounts.active,
      tone: "approved",
      onClick: () => handleViewEmployees('active')
    },
    {
      icon: <FaClipboardList />,
      title: "Pending Approvals",
      value: dashboardStats?.pendingApprovals || 0,
      tone: "pending",
      onClick: handleViewApprovals
    },
    {
      icon: <FaExclamationTriangle />,
      title: "Total Policy",
      value: policyCount,
      tone: "exception",
      onClick: handleViewPolicies
    },
  ];

  return (
    <div className="statsContainer" style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
      {stats.map((stat, index) => (
        <CardKPI
          key={index}
          icon={stat.icon}
          title={stat.title}
          value={stat.value}
          tone={stat.tone}
          onClick={stat.onClick}
        />
      ))}
    </div>
  );
};

export default DashboardStats;