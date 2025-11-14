// components/common/Layout/Sidebar.js
import React from 'react'
import { useNavigation } from '../../../hooks/useNavigation'
import { useApp } from '../../../contexts/AppContext'
import './Sidebar.css'

const Sidebar = ({ isOpen, onClose }) => {
  const { goto } = useNavigation()
  const { user } = useApp()

  const menuItems = [
    { path: '/dashboard', icon: 'fas fa-tachometer-alt', label: 'Dashboard' },
    { path: '/new-request', icon: 'fas fa-plus-circle', label: 'New Request' },
    { path: '/my-requests', icon: 'fas fa-list', label: 'My Requests' },
    { path: '/team-requests', icon: 'fas fa-users', label: 'Team Requests' },
    { path: '/audit-trail', icon: 'fas fa-history', label: 'Audit Trail' },
    { path: '/profile', icon: 'fas fa-user', label: 'Profile' }
  ]

  const isActive = (menuPath) => {
    const currentPath = window.location.pathname;
    return currentPath === menuPath || currentPath.startsWith(menuPath + '/');
  }

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem('token');
      localStorage.removeItem('jwtToken');
      window.location.href = '/login';
    }
  }

  return (
    <div className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
      <div className="sidebarHeader">
        <div className="brandContainer">
          <div className="logoWrapper">
            <img src='/BWCLOGO.png' alt="BWC Labs" />
          </div>
          <div className="brandText">
            <span className="companyName">BWC Labs</span>
            <span className="appName">BrainWave Travel Hub</span>
          </div>
        </div>
      </div>
      <div className="sidebar-menu">
        {menuItems.map(item => (
          <div
            key={item.path}
            className={`menu-item ${isActive(item.path) ? 'active' : ''}`}
            onClick={() => {
              goto(item.path)
              onClose()
            }}
          >
            <i className={item.icon}></i>
            <span>{item.label}</span>
          </div>
        ))}
        
        {/* Logout Menu Item */}
        <div
          className="menu-item logout-item"
          onClick={handleLogout}
        >
          <i className="fas fa-sign-out-alt"></i>
          <span>Logout</span>
        </div>
      </div>
    </div>
  )
}

export default Sidebar