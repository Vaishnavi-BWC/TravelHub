import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { useSuperAdmin } from "@/contexts/SuperAdminContext";
import { useAuth } from '../../../hooks/useAuth';
import { SuperAdminService } from '../../../services/superAdminService';
import styles from '../styles/SuperAdminHeader.module.css';
import { FaBars, FaPowerOff, FaSpinner } from 'react-icons/fa';

const LOGOUT_REDIRECT_URL = 'http://bwc-90.brainwaveconsulting.co.in:3000/';

const SuperAdminHeader = () => {
  const { logout, loading: logoutLoading } = useAuth();
  const { actions } = useSuperAdmin();
  const [userName, setUserName] = useState('Super Admin');
  const [userFullName, setUserFullName] = useState('Super Admin');
  const [userNameLoading, setUserNameLoading] = useState(false);

  // Fetch super admin name on component mount
  useEffect(() => {
    const fetchSuperAdminName = async () => {
      try {
        setUserNameLoading(true);
        console.log('🔍 Fetching super admin name for header...');
        
        const profileData = await SuperAdminService.getSuperAdminProfile();
        console.log('✅ Super Admin Profile data received:', profileData);
        
        // Set both first name and full name
        if (profileData) {
          setUserName(profileData.firstName || 'Super Admin'); // "Vikram"
          setUserFullName(profileData.fullName || 'Super Admin'); // "Vikram Deshmukh"
        }
      } catch (err) {
        console.error('❌ Error fetching super admin profile:', err);
        // Fallback to localStorage data
        // eslint-disable-next-line no-unused-vars
        const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
        setUserName('Super Admin');
        setUserFullName('Super Admin');
      } finally {
        setUserNameLoading(false);
      }
    };

    fetchSuperAdminName();
  }, []);

  // Memoized logout handler
  const handleLogout = useCallback(async () => {
    try {
      await logout({
        showConfirmation: true,
        redirectTo: LOGOUT_REDIRECT_URL
      });
    } catch (error) {
      console.error('Logout failed:', error);
      window.location.href = LOGOUT_REDIRECT_URL;
    }
  }, [logout]);

  // Memoized user profile data with dynamic name
  const userProfile = useMemo(() => ({
    name: userName, // First name for display
    fullName: userFullName, // Full name if needed
    role: "System Administrator",
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userFullName)}&background=7d3a98&color=fff`
  }), [userName, userFullName]);

  return (
    <div className={styles.header}>
      <div className={styles.headerLeft}>
        <button
          className={styles.mobileMenuBtn}
          onClick={() => actions.setSidebarOpen(true)}
          aria-label="Open menu"
        >
          <FaBars />
        </button>
        <h1 className={styles.modernTitle}>
          <span className={styles.accentWord}>BrainWave</span> Travel Hub
        </h1>
      </div>

      <div className={styles.userInfo}>
        <div className={styles.userProfile}>
          <img 
            src={userProfile.avatar} 
            alt={userProfile.fullName}
            loading="lazy"
          />
          <div>
            <div>{userNameLoading ? 'Super Admin' : userProfile.fullName}</div>
            <small>{userProfile.role}</small>
          </div>
          <div className={styles.logoutbutton}>
            <button 
              onClick={handleLogout}
              disabled={logoutLoading}
              title="Logout"
              aria-label="Logout"
            >
              {logoutLoading ? (
                <FaSpinner 
                  style={{ color: "gray", fontSize: "20px" }}
                  aria-hidden="true"
                />
              ) : (
                <FaPowerOff 
                  style={{ color: "red", fontSize: "20px" }}
                  aria-hidden="true"
                />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(SuperAdminHeader);