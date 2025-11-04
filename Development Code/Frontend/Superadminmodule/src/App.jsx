import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import { SuperAdminProvider } from './contexts/SuperAdminContext';
import SuperAdminLayout from './components/superadmin/layout/SuperAdminLayout';
import SuperAdminDashboard from './components/superadmin/dashboard/SuperAdminDashboard';
import UserManagement from './components/superadmin/users/UserManagement';
import PolicyManagement from './components/superadmin/policies/PolicyManagement';
import SLASettings from './components/superadmin/sla/SLASettings';
import ReportsManagement from './components/superadmin/reports/ReportsManagement';
import SystemLogs from './components/superadmin/logs/SystemLogs';
import OverrideApproval from './components/superadmin/override/OverrideApproval';
import AddUserModal from './components/superadmin/users/AddUserModal';
import ProfilePage from './components/Profile/Profilepage';
import './App.css';

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="App">
          <SuperAdminProvider>
            <Routes>
              {/* Layout route with nested routes */}
              <Route path="/" element={<SuperAdminLayout />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<SuperAdminDashboard />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="add-employee" element={<AddUserModal />} />
                <Route path="policies" element={<PolicyManagement />} />
                <Route path="sla" element={<SLASettings />} />
                <Route path="reports" element={<ReportsManagement />} />
                <Route path="logs" element={<SystemLogs />} />
                <Route path="override" element={<OverrideApproval />} />
                <Route path="profile" element={<ProfilePage />} />
                {/* Catch all route - redirect to dashboard */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Route>
            </Routes>
          </SuperAdminProvider>
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;