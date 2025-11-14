// src/modules/Hrmodule/src/HrApp.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AppProvider, useApp } from "./contexts/AppContext";
import { Layout } from "./components/layout/Layout";
import { Dashboard } from "./components/dashboard/Dashboard";
import { EmployeeManagement } from "./components/employees/EmployeeManagement";
import { EmployeeForm } from "./components/employees/EmployeeForm";
import { ApprovalManagement } from "./components/approvals/ApprovalManagement";
import { ExceptionsManagement } from "./components/exceptions/ExceptionsManagement";
import { ReimbursementsManagement } from "./components/reiumbursement/ReimbursementsManagement";
import { AuditTrail } from "./components/audit/AuditTrail";
import { Profile } from "./components/profile/Profile";
import { HelpSupport } from "./components/help/helpSupport";
import { Logout } from "./components/logout/Logout";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import { Notification } from "./components/common/Notification";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./App.css";

// Notification component wrapper
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

// Main app content
const AppContent = () => {
  const { sidebarOpen, setSidebarOpen } = useApp();

  return (
    <Layout
      sidebarOpen={sidebarOpen}
      onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
      onCloseSidebar={() => setSidebarOpen(false)}
    >
      <NotificationWrapper />
      
      {/* FLAT ROUTE STRUCTURE - NO NESTING */}
     <Routes>
  {/* When path is /hr - show Dashboard */}
  <Route index element={<Dashboard />} />
  
  {/* All other routes relative to /hr */}
  <Route path="dashboard" element={<Dashboard />} />
  <Route path="employees" element={<EmployeeManagement />} />
  <Route path="employees/new" element={<EmployeeForm />} />
  <Route path="employees/:employeeId" element={<EmployeeManagement />} />
  <Route path="employees/:employeeId/edit" element={<EmployeeForm />} />
  <Route path="approvals" element={<ApprovalManagement />} />
  <Route path="approvals/:requestId" element={<ApprovalManagement />} />
  <Route path="exceptions" element={<ExceptionsManagement />} />
  <Route path="reimbursements" element={<ReimbursementsManagement />} />
  <Route path="audit" element={<AuditTrail />} />
  <Route path="profile" element={<Profile />} />
  <Route path="help" element={<HelpSupport />} />
  <Route path="logout" element={<Logout />} />
  
  {/* Catch all - redirect to /hr */}
  <Route path="*" element={<Navigate to="" replace />} />
</Routes>
    </Layout>
  );
};

function HrApp() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ErrorBoundary>
  );
}

export default HrApp;