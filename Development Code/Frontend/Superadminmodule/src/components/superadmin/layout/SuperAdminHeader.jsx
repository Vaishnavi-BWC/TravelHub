import React, { useCallback, useMemo } from 'react';
import { useSuperAdmin } from "@/contexts/SuperAdminContext";
import { useAuth } from '../../../hooks/useAuth';
import styles from '../styles/SuperAdminHeader.module.css';
import { FaBars, FaPowerOff, FaSpinner } from 'react-icons/fa';

// Move constants outside component to prevent recreation
const LOGOUT_REDIRECT_URL = 'http://bwc-90.brainwaveconsulting.co.in:3000/';
const AVATAR_URL = "https://ui-avatars.com/api/?name=Super+Admin&background=7d3a98&color=fff";

const SuperAdminHeader = () => {
  const { logout, loading: logoutLoading } = useAuth();
  const { actions } = useSuperAdmin();

  // Memoized logout handler
  const handleLogout = useCallback(async () => {
    try {
      await logout({
        showConfirmation: true,
        redirectTo: LOGOUT_REDIRECT_URL
      });
    } catch (error) {
      console.error('Logout failed:', error);
      // Fallback redirect
      window.location.href = LOGOUT_REDIRECT_URL;
    }
  }, [logout]);

  // Memoized user profile data
  const userProfile = useMemo(() => ({
    name: "Super Admin",
    role: "System Administrator",
    avatar: AVATAR_URL
  }), []);

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
            alt={userProfile.name}
            loading="lazy"
          />
          <div>
            <div>{userProfile.name}</div>
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