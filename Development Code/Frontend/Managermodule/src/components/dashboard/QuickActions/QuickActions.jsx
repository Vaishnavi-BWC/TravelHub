// components/dashboard/QuickActions/QuickActions.js
import React from 'react'
import './QuickActions.css'

const QuickActions = ({ onNavigate }) => {
  const actions = [
    {
      label: 'New Travel Request',
      icon: 'fas fa-plus',
      color: 'blue',
      path: '/new-request'
    },
    {
      label: 'View My Requests',
      icon: 'fas fa-list',
      color: 'green',
      path: '/my-requests'
    },
    {
      label: 'Review Team Requests',
      icon: 'fas fa-users',
      color: 'orange',
      path: '/team-requests'
    },
    {
      label: 'Audit Trail',
      icon: 'fas fa-history',
      color: 'purple',
      path: '/audit-trail'
    }
  ]

  return (
    <div className="card">
      <div className="card-header">
        <h3>Quick Actions</h3>
      </div>
      <div className="card-body">
        <div className="quick-action-grid">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={() => onNavigate(action.path)}
              className="quick-action-btn"
            >
              <div className={`quick-action-icon ${action.color}`}>
                <i className={action.icon}></i>
              </div>
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default QuickActions