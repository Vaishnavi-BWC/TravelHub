// components/superadmin/dashboard/DashboardStats.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSuperAdmin } from '../../../contexts/SuperAdminContext';
import CardKPI from '../../common/CardKPI';
import { FaUsers, FaUserCheck, FaClipboardList, FaExclamationTriangle, FaFileInvoiceDollar } from 'react-icons/fa';
import styles from '../superadmin.module.css';

const DashboardStats = () => {
  const { state, actions } = useSuperAdmin();
  const { dashboardStats, loading, error } = state;
  const [hasLoaded, setHasLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!hasLoaded) {
      actions.loadDashboardData();
      setHasLoaded(true);
    }
  }, [actions, hasLoaded]);

  const handleViewEmployees = (filter = '') => {
    navigate('/users', { 
      state: { filter: filter || 'all' } 
    });
  };

  const handleViewApprovals = () => {
    navigate('/override');
  };

  const handleViewExceptions = () => {
    navigate('/logs', { 
      state: { filter: 'exceptions' } 
    });
  };

  const handleViewReimbursements = () => {
    navigate('/reports', { 
      state: { filter: 'reimbursements' } 
    });
  };

  const stats = [
    {
      icon: <FaUsers />,
      title: "Total Users",
      value: dashboardStats?.totalUsers || 0,
      tone: "total",
      onClick: () => handleViewEmployees()
    },
    {
      icon: <FaUserCheck />,
      title: "Active Users",
      value: dashboardStats?.activeUsers || 0,
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
      title: "Pending Exceptions",
      value: dashboardStats?.pendingExceptions || 0,
      tone: "exception",
      onClick: handleViewExceptions
    },
    {
      icon: <FaFileInvoiceDollar />,
      title: "Reimbursements",
      value: dashboardStats?.pendingReimbursements || 0,
      tone: "reimbursement",
      onClick: handleViewReimbursements
    }
  ];

  return (
    <div className="statsContainer" style={{display: 'flex', gap: '20px', marginBottom: '30px'}}>
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