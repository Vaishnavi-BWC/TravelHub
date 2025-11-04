import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
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
      <div className="detailHeader">
        <h2>Add New Employee</h2>
        <button onClick={handleCancel} className="btn btnSecondary">
          <span className="btnIconSvg">←</span> Back to Employees
        </button>
      </div>

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