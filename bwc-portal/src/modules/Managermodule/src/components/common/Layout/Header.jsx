// components/common/Layout/Header.js
import React, { useState, useEffect } from 'react'
import { useApp } from '../../../contexts/AppContext'
import { useAuth } from '../../../hooks/useAuth';
import { managerService } from '../../../services/managerService';

import './Header.css'

const Header = ({ onMenuToggle }) => {
    const { logout, loading: logoutLoading } = useAuth();
    const { user } = useApp();
    const [userData, setUserData] = useState({ name: '', id: '' });
  
    // Format employee ID to "E-{last 5 characters}"
    const formatEmployeeId = (employeeId) => {
        if (!employeeId || employeeId === 'unknown') return 'M001';
        if (employeeId.startsWith('E-')) return employeeId;
        return `E-${employeeId.slice(-5)}`;
    };

    // Get fallback user data
    const getFallbackUserData = () => {
        const localStorageData = JSON.parse(localStorage.getItem('user_data') || '{}');
        return {
            name: user?.name || localStorageData.userName || 'Manager',
            id: formatEmployeeId(user?.id || localStorageData.userId) || 'M001'
        };
    };

    // Fetch manager profile data
    const fetchManagerProfile = async () => {
        try {
            console.log('🔍 Fetching manager profile data for header...');
            const profileData = await managerService.getManagerProfile();
            
            if (profileData) {
                setUserData({
                    name: profileData.name,
                    id: formatEmployeeId(profileData.id)
                });
            } else {
                setUserData(getFallbackUserData());
            }
        } catch (err) {
            console.error('❌ Error fetching manager profile:', err);
            setUserData(getFallbackUserData());
        }
    };

    useEffect(() => {
        fetchManagerProfile();
    }, []); // Empty dependency array since we don't depend on `user`

    const handleLogout = async () => {
        try {
            await logout({
                showConfirmation: true,
                redirectTo: 'http://bwc-90.brainwaveconsulting.co.in:3000/'
            });
        } catch (error) {
            console.error('Logout failed:', error);
            window.location.href = 'http://bwc-90.brainwaveconsulting.co.in:3000/';
        }
    };

    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=0D8ABC&color=fff`;

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
                    <img src={avatarUrl} alt="User" />
                    <div>
                        <div>{userData.name}</div>
                        <small>Manager ID: {userData.id}</small>
                    </div>
                </div>
                <div className='logoutbutton'>
                    <button 
                        className='p-3' 
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