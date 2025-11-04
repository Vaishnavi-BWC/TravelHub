// components/layout/Header.js
import React from 'react';
import './Header.css';
import { useAuth } from '../../hooks/useAuth';

const Header = ({ onMenuToggle }) => {
  const { logout, loading: logoutLoading } = useAuth();
  
  // Get user data for display
  const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
  const userName = userData.userName || userData.email || 'HR';
  const userRole = userData.role || 'HR';
  const userId = userData.userId || 'HR001';
  
  const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=0D8ABC&color=fff`;

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
      <div className="userInfo">
        <button className="notificationBtn">
          <i className="fas fa-bell"></i>
          <span className="notificationBadge"></span>
        </button>
        <div className="userProfile">
          <img src={avatar} alt="User" />
          <div>
            <div>{userName}</div>
            <small>ID: {userId}</small>
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
    </div>
  );
};

export { Header };
export default Header;