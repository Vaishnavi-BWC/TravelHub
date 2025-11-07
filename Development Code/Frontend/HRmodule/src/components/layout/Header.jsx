// components/layout/Header.js
import React, { useState, useEffect } from 'react';
import './Header.css';
import { useAuth } from '../../hooks/useAuth';
import { hrService } from '../../services/hrService'; // Import the service

const Header = ({ onMenuToggle }) => {
  const { logout, loading: logoutLoading } = useAuth();
  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState('');
  
  // Format employee ID to "E-{last 5 characters}"
  const formatEmployeeId = (employeeId) => {
    if (!employeeId || employeeId === 'unknown') return 'HR001';
    
    // If it's already in the correct format, return as is
    if (employeeId.startsWith('E-')) return employeeId;
    
    // Extract last 5 characters and format as E-XXXXX
    const lastFive = employeeId.slice(-5);
    return `E-${lastFive}`;
  };

  // Fetch profile data on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        console.log('🔍 Fetching HR profile data for header...');
        
        const profileData = await hrService.getHRProfile();
        console.log('✅ HR Profile data received:', profileData);
        
        // Set the user name and formatted ID
        if (profileData) {
          setUserName(profileData.fullName || 'HR Manager');
          setUserId(formatEmployeeId(profileData.id));
        }
      } catch (err) {
        console.error('❌ Error fetching HR profile:', err);
        // Fallback to localStorage data
        const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
        setUserName(userData.userName || userData.email || 'HR');
        setUserId(formatEmployeeId(userData.userId) || 'HR001');
      }
    };

    fetchProfile();
  }, []);

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