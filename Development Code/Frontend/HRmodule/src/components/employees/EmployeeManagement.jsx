// EmployeeManagement.js - UPDATED VERSION
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import EmployeeList from './EmployeeList';
import EmployeeDetail from './EmployeeDetail';
import EmployeeForm from './EmployeeForm';
import Modal from '../common/Model';
import EmployeeEditForm from './EmployeeEditForm';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { useEmployees } from '../../hooks/useEmployees';

const EmployeeManagement = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const {
    loading,
    error,
    createEmployee,
    updateEmployee,
    deactivateEmployee,
    refetch,
    getEmployeeById // Add this to refetch single employee
  } = useEmployees();

  // Modal states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Add refresh trigger

  // Determine active view based on route
  const getActiveView = () => {
    const path = window.location.pathname;
    console.log('🔍 Current path:', path);

    if (path.includes('/edit')) return 'edit-employee';
    if (path.includes('/new')) return 'new-employee';
    if (employeeId) return 'employee-detail';
    return 'employee-list';
  };

  const activeView = getActiveView();
  console.log('🔍 Active view:', activeView);

  // Open edit modal - This is called from both EmployeeList and EmployeeDetail
  const handleEditClick = (employee) => {
    console.log('🔄 Opening edit modal for:', employee);
    setSelectedEmployee(employee);
    setEditModalOpen(true);
  };

  // Close edit modal
  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setSelectedEmployee(null);
  };

  // Handle successful update from modal
  const handleEmployeeUpdate = async (employeeId, employeeData) => {
    try {
      console.log('🔄 Updating employee:', employeeId, employeeData);

      await updateEmployee(employeeId, employeeData);
      
      // Refresh both list and detail data
      await refetch();
      
      // Trigger refresh for EmployeeDetail component
      setRefreshTrigger(prev => prev + 1);
      
      handleCloseEditModal();

      console.log('✅ Employee updated successfully, refresh triggered');

    } catch (error) {
      console.error('❌ Error updating employee:', error);
      throw error;
    }
  };

  const handleBack = () => {
    navigate('/employees');
  };

  const handleAddEmployee = () => {
    navigate('/employees/new');
  };

  const handleEmployeeSubmit = async (employeeData) => {
    try {
      console.log('🔄 Submitting employee data:', employeeData);

      if (employeeData.user_id) {
        await updateEmployee(employeeData.user_id, employeeData);
      } else {
        await createEmployee(employeeData);
      }

      await refetch();
      navigate('/employees');
    } catch (err) {
      console.error('❌ Error saving employee:', err);
      throw err;
    }
  };

  if (error && activeView === 'employee-list') {
    return (
      <div className="content">
        <div className="errorMessage">
          <i className="fas fa-exclamation-circle"></i>
          Error: {error}
        </div>
        <button onClick={handleBack} className="btn btnSecondary">Back</button>
      </div>
    );
  }

  if (loading && activeView === 'employee-list') {
    return (
      <div className="content">
        <LoadingSpinner text="Loading employees..." />
      </div>
    );
  }

  return (
    <div className="content">
      {/* Edit Modal - Rendered at top level */}
      <Modal
        isOpen={editModalOpen}
        onClose={handleCloseEditModal}
        title="Edit Employee"
        size="medium"
      >
        {selectedEmployee && (
          <EmployeeEditForm
            employee={selectedEmployee}
            onSave={handleEmployeeUpdate}
            onClose={handleCloseEditModal}
            isLoading={loading}
          />
        )}
      </Modal>

      {/* Main Content */}
      {activeView === 'employee-list' && (
        <>
          <div className="detailHeader">
            <h2>Employee Management</h2>
            <button onClick={handleAddEmployee} className="btn btnPrimary addempbtn">
              <i className="fas fa-plus"></i> Add Employee
            </button>
          </div>
          <EmployeeList
            onEditEmployee={handleEditClick}
          />
        </>
      )}

      {activeView === 'employee-detail' && (
        <EmployeeDetail
          onEdit={handleEditClick}
          onBack={handleBack}
          key={refreshTrigger} // Add key to force re-render
        />
      )}

      {activeView === 'edit-employee' && (
        <EmployeeForm
          onSubmit={handleEmployeeSubmit}
          onCancel={handleBack}
          isLoading={loading}
          isEdit={true}
        />
      )}

      {activeView === 'new-employee' && (
        <EmployeeForm
          onSubmit={handleEmployeeSubmit}
          onCancel={handleBack}
          isLoading={loading}
          isEdit={false}
        />
      )}
    </div>
  );
};

export { EmployeeManagement };
export default EmployeeManagement;