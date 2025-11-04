import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './components/dashboard/Dashboard';
import { EmployeeManagement } from './components/employees/EmployeeManagement';
import { ApprovalManagement } from './components/approvals/ApprovalManagement';
import { Profile } from './components/profile/Profile';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { Notification } from './components/common/Notification';
import { EmployeeForm } from './components/employees/EmployeeForm';
import { ExceptionsManagement } from './components/exceptions/ExceptionsManagement';
import { ReimbursementsManagement } from './components/reiumbursement/ReimbursementsManagement';
import { AuditTrail } from './components/audit/AuditTrail';
import { HelpSupport } from './components/help/helpSupport';
import { Logout } from './components/logout/Logout';
import { useApp } from './contexts/AppContext';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './App.css';

// Notification wrapper component
const NotificationWrapper = () => {
  const { notification, clearNotification } = useApp();
  
  if (!notification) return null;
  
  return (
    <Notification
      message={notification.message}
      type={notification.type}
      onClose={clearNotification}
    />
  );
};

// Main app content with router
const AppContent = () => {
  const { sidebarOpen, setSidebarOpen, notification, clearNotification } = useApp();

  return (
    <Layout
      sidebarOpen={sidebarOpen}
      onMenuToggle={() => setSidebarOpen(true)}
      onCloseSidebar={() => setSidebarOpen(false)}
    >
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={clearNotification}
        />
      )}
      
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* Employee Routes */}
        <Route path="/employees" element={<EmployeeManagement />} />
        <Route path="/newemployees" element={<EmployeeForm />} />
        <Route path="/employees/:employeeId" element={<EmployeeManagement />} />
        <Route path="/employees/:employeeId/edit" element={<EmployeeManagement />} />
        
        {/* Approval Routes */}
        <Route path="/approvals" element={<ApprovalManagement />} />
        <Route path="/approvals/:requestId" element={<ApprovalManagement />} />
        
        {/* Feature Routes */}
        <Route path="/exceptions" element={<ExceptionsManagement />} />
        <Route path="/reimbursements" element={<ReimbursementsManagement />} />
        
        <Route path="/audit" element={<AuditTrail />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/help" element={<HelpSupport />} />
        <Route path="/logout" element={<Logout />} />
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;