import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Dashboard } from '../components/dashboard/Dashboard';
import { EmployeeManagement } from '../components/employees/EmployeeManagement';
import { ApprovalManagement } from '../components/approvals/ApprovalManagement';
import { Profile } from '../components/profile/Profile';
import { AddEmployee } from '../components/employees/AddEmployee';
import { ExceptionsManagement } from '../components/exceptions/ExceptionsManagement';
import { ReimbursementsManagement } from '../components/reimbursements/ReimbursementsManagement';
import { Reports } from '../components/reports/Reports';
import { AuditTrail } from '../components/audit/AuditTrail';
import { HelpSupport } from '../components/help/helpSupport';
import { Logout } from '../components/logout/Logout';

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<Dashboard />} />
      
      {/* Employee Routes */}
      <Route path="/employees" element={<EmployeeManagement />} />
      <Route path="/newemployees" element={<AddEmployee />} />
      <Route path="/employees/:employeeId" element={<EmployeeManagement />} />
      <Route path="/employees/:employeeId/edit" element={<EmployeeManagement />} />
      
      {/* Approval Routes */}
      <Route path="/approvals" element={<ApprovalManagement />} />
      <Route path="/approvals/:requestId" element={<ApprovalManagement />} />
      
      {/* New Feature Routes */}
      <Route path="/exceptions" element={<ExceptionsManagement />} />
      <Route path="/exceptions/:exceptionId" element={<ExceptionsManagement />} />
      
      <Route path="/reimbursements" element={<ReimbursementsManagement />} />
      <Route path="/reimbursements/:reimbursementId" element={<ReimbursementsManagement />} />
      
      <Route path="/reports" element={<Reports />} />
      <Route path="/audit" element={<AuditTrail />} />
      
      {/* Profile & System Routes */}
      <Route path="/profile" element={<Profile />} />
      <Route path="/help" element={<HelpSupport />} />
      <Route path="/logout" element={<Logout />} />
      
      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRouter;