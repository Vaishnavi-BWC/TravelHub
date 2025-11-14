// components/dashboard/DashboardStats.js
import React, { useMemo } from 'react';
import CardKPI from '../common/CardKPI';

const DashboardStats = ({ 
  totalEmployees = 0,
  activeEmployeesCount = 0,
<<<<<<< HEAD
  dashboardSummary = {},
=======
  dashboardSummary = {}, // New prop for dashboard summary data
>>>>>>> upstream/main
  onViewEmployees, 
  onViewApprovals,
  onViewExceptions,
  onViewReimbursements
}) => {
<<<<<<< HEAD
  
  // Add debug logging
  console.log('📊 DashboardStats - dashboardSummary:', dashboardSummary);
  console.log('📊 DashboardStats - exceptionCount:', dashboardSummary.exceptionCount);
  console.log('📊 DashboardStats - raisedExceptionsCount:', dashboardSummary.raisedExceptionsCount);

=======
>>>>>>> upstream/main
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
<<<<<<< HEAD
        // Try both field names to see which one works
        value: dashboardSummary.exceptionCount || dashboardSummary.raisedExceptionsCount || 0,
=======
        value: dashboardSummary.raisedExceptionsCount || 0,
>>>>>>> upstream/main
        tone: "exception",
        onClick: onViewExceptions
      },
      {
        icon: <i className="fas fa-file-invoice-dollar"></i>,
        title: "Reimbursements",
        value: 0, // This can be added to the API later
        tone: "reimbursement",
        onClick: onViewReimbursements
      },
<<<<<<< HEAD
=======
      // {
      //   icon: <i className="fas fa-clock"></i>,
      //   title: "Awaiting Clarification",
      //   value: dashboardSummary.awaitingClarificationCount || 0,
      //   tone: "warning",
      //   onClick: onViewApprovals
      // }
>>>>>>> upstream/main
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