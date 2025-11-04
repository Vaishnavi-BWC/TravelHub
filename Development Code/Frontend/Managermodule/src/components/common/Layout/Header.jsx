// components/common/Layout/Header.js
import React from 'react'
import { useApp } from '../../../contexts/AppContext'
import { useAuth } from '../../../hooks/useAuth';

import './Header.css'

const Header = ({ onMenuToggle }) => {
    const { logout, loading: logoutLoading } = useAuth();
  const { user } = useApp()
 const handleLogout = async () => {
    try {
      await logout({
        showConfirmation: true,
        redirectTo: 'http://bwc-90.brainwaveconsulting.co.in:3000/'
      });
    } catch (error) {
      console.error('Logout failed:', error);
      // Force redirect even if error
      window.location.href = 'http://bwc-90.brainwaveconsulting.co.in:3000/';
    }
  };
  return (
    <div className="header">
      <div className="headerLeft">
        <button className="mobileMenuBtn" onClick={onMenuToggle}>
          <i className="fas fa-bars"></i>
        </button>
        <h1 className="modernTitle">
          <span className="accentWord">BrainWave</span> Travel Hub
        </h1>
      </div>
      <div className="user-info">
        <button className="notification-btn">
          <i className="fas fa-bell"></i>
          <span className="notification-badge"></span>
        </button>
        <div className="user-profile">
          <img src={user?.avatar} alt="User" />
          <div>
            <div>{user?.name}</div>
            <small>Manager ID: {user?.id}</small>
          </div>
        </div>
         <div className='logoutbutton'>
            <button  className='p-3' 
              onClick={handleLogout}
              disabled={logoutLoading}
              title="Logout"
            >

              {logoutLoading ? (
                <i className="fas fa-spinner fa-spin" style={{color: "gray", fontSize: "20px"}}></i>
              ) : (
                <i className="fa-solid fa-power-off" style={{color: "red", fontSize: "20px"}}></i>
              )}
            </button> 
          </div>
      </div>
    </div>
  )
}

export default Header