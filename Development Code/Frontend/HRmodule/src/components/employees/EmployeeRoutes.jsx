// EmployeeRoutes.js - ADD EDIT ROUTE
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import EmployeeList from './EmployeeList';
import EmployeeDetail from './EmployeeDetail';
import EmployeeForm from './EmployeeForm'; // Make sure you have this component
import EmployeeManagement from './EmployeeManagement'; // Or use your management component

export const EmployeeRoutes = () => {
  return (
    <Routes>
      <Route index element={<EmployeeList />} />
      <Route path=":employeeId" element={<EmployeeDetail />} />
      <Route path=":employeeId/edit" element={<EmployeeForm />} /> {/* ADD THIS */}
      <Route path="new" element={<EmployeeForm />} /> {/* For creating new employees */}
    </Routes>
  );
};

export default EmployeeRoutes;