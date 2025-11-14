// components/dashboard/DashboardStats.js
import React, { useMemo } from 'react';
import CardKPI from '../common/CardKPI';

const DashboardStats = ({ 
  totalEmployees = 0,
  activeEmployeesCount = 0,
  dashboardSummary = {},
  onViewEmployees, 
  onViewApprovals,
  onViewExceptions,
  onViewReimbursements
}) => {
  
  // Add debug logging
  console.log('📊 DashboardStats - dashboardSummary:', dashboardSummary);
  console.log('📊 DashboardStats - exceptionCount:', dashboardSummary.exceptionCount);
  console.log('📊 DashboardStats - raisedExceptionsCount:', dashboardSummary.raisedExceptionsCount);

  const statsData = useMemo(() => {
    return [
      {
        icon: <i className="fas fa-users statIconSvg"></i>,
        title: "Total Employees",
        value: totalEmployees,
        tone: "total",
        onClick: onViewEmployees
      },
      {
        icon: <i className="fas fa-user-check statIconSvg"></i>,
        title: "Active Employees",
        value: activeEmployeesCount,
        tone: "approved",
        onClick: () => onViewEmployees('active')
      },
      {
        icon: <i className="fas fa-clipboard-list statIconSvg"></i>,
        title: "Pending Approvals",
        value: dashboardSummary.pendingApprovalsCount || 0,
        tone: "pending",
        onClick: onViewApprovals
      },
      {
        icon: <i className="fas fa-exclamation-triangle"></i>,
        title: "Pending Exceptions",
        // Try both field names to see which one works
        value: dashboardSummary.exceptionCount || dashboardSummary.raisedExceptionsCount || 0,
        tone: "exception",
        onClick: onViewExceptions
      },
      {
        icon: <i className="fas fa-file-invoice-dollar"></i>,
        title: "Reimbursements",
        value: 0,
        tone: "reimbursement",
        onClick: onViewReimbursements
      },
    ];
  }, [
    totalEmployees, 
    activeEmployeesCount, 
    dashboardSummary, 
    onViewEmployees, 
    onViewApprovals, 
    onViewExceptions, 
    onViewReimbursements
  ]);

  return (
    <div className="statsContainer">
      {statsData.map((stat, index) => (
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

export { DashboardStats };
export default DashboardStats;