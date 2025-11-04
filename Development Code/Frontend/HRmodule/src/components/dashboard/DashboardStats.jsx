// components/dashboard/DashboardStats.js
import React, { useMemo } from 'react';
import CardKPI from '../common/CardKPI';

const DashboardStats = ({ 
  employees = [], 
  totalEmployees = 0,
  activeEmployeesCount = 0,
  approvals = [], 
  pendingApprovalsCount = 0, // Add this new prop
  onViewEmployees, 
  onViewApprovals,
  onViewExceptions,
  onViewReimbursements
}) => {
  // Use the provided pendingApprovalsCount or calculate from approvals array
  const pendingApprovals = useMemo(() => {
    if (pendingApprovalsCount > 0) {
      return pendingApprovalsCount;
    }
    return approvals.filter(req => {
      const status = req.status?.toLowerCase();
      return status === 'pending' || status === 'submitted';
    }).length;
  }, [approvals, pendingApprovalsCount]);

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
        value: pendingApprovals, // Use the calculated count
        tone: "pending",
        onClick: onViewApprovals
      },
      {
        icon: <i className="fas fa-exclamation-triangle"></i>,
        title: "Pending Exceptions",
        value: 0,
        tone: "exception",
        onClick: onViewExceptions
      },
      {
        icon: <i className="fas fa-file-invoice-dollar"></i>,
        title: "Reimbursements",
        value: 0,
        tone: "reimbursement",
        onClick: onViewReimbursements
      }
    ];
  }, [totalEmployees, activeEmployeesCount, pendingApprovals, onViewEmployees, onViewApprovals, onViewExceptions, onViewReimbursements]);

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