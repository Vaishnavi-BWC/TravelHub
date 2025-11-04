import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../../contexts/AppContext';
import EmployeeForm from './EmployeeForm';

const AddEmployee = () => {
  const navigate = useNavigate();
  const { createEmployee, loading } = useApp();

  const handleSubmit = async (employeeData) => {
    try {
      await createEmployee(employeeData);
      navigate('/employees');
    } catch (error) {
      console.error('Error creating employee:', error);
    }
  };

  const handleCancel = () => {
    navigate('/employees');
  };

  return (
    <div className="content">

      <EmployeeForm
        mode="create"
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        submitting={loading}
      />
    </div>
  );
};

export { AddEmployee };
export default AddEmployee;