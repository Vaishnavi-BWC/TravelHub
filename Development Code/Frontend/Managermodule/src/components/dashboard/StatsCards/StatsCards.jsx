// components/dashboard/StatsCards/StatsCards.js
import React from 'react'
import './StatsCards.css'

const StatsCards = ({
  personalRequestsCount,
  teamRequestsCount,
  approvedCount,
  pendingApprovalCount,
  rejectedCount,
  onPersonalRequestsClick,
  onTeamRequestsClick,
  onPendingApprovalClick
}) => {
  const stats = [
    {
      title: 'My Requests',
      count: personalRequestsCount,
      icon: 'fas fa-suitcase',
      color: 'blue',
      onClick: onPersonalRequestsClick
    },
  
    {
      title: 'Approved',
      count: approvedCount,
      icon: 'fas fa-check-circle',
      color: 'green'
    },
    {
      title: 'Team Pending Approval',
      count: pendingApprovalCount,
      icon: 'fas fa-clock',
      color: 'orange',
      onClick: onPendingApprovalClick
    },
    {
      title: 'Rejected',
      count: rejectedCount,
      icon: 'fas fa-times-circle',
      color: 'red'
    }
  ]

  return (
    <div className="stats-container">
      {stats.map((stat, index) => (
        <div
          key={index}
          className={`stat-card ${stat.onClick ? 'clickable' : ''}`}
          onClick={stat.onClick}
        >
          <div className={`stat-icon ${stat.color}`}>
            <i className={stat.icon}></i>
          </div>
          <div className="stat-info">
            <h3>{stat.count}</h3>
            <p>{stat.title}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default StatsCards