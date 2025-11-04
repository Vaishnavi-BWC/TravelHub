// components/employees/EmployeeList.js
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Badge from '../common/Badge';
import Modal from '../common/Model';
import EmployeeEditForm from './EmployeeEditForm';
import { useEmployees } from '../../hooks/useEmployees';
import { useApp } from '../../contexts/AppContext';
// import './EmployeeList.css'; // We'll create this CSS file

const EmployeeList = () => {
  const navigate = useNavigate();
  const { 
    employees, 
    loading, 
    error,
    updateEmployee,
    deactivateEmployee,
    activateEmployee,
    pagination,
    goToNextPage,
    goToPrevPage,
    goToPage,
    changePageSize
  } = useEmployees();

  const { showNotification } = useApp();
  
  const [employeeFilter, setEmployeeFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(null);
  const [statusAnimations, setStatusAnimations] = useState({});

  // DEBUG: Log when employees change
  useEffect(() => {
    console.log('🔄 EmployeeList: employees updated', employees.map(emp => ({
      id: emp.user_id,
      name: emp.fullName,
      status: emp.status,
      active: emp._original?.active
    })));
  }, [employees]);

  const handleEditClick = useCallback((employee) => {
    setSelectedEmployee(employee);
    setEditModalOpen(true);
  }, []);

  const handleCloseEditModal = useCallback(() => {
    setEditModalOpen(false);
    setSelectedEmployee(null);
  }, []);

  const handleEmployeeUpdate = useCallback(async (employeeId, employeeData) => {
    try {
      await updateEmployee(employeeId, employeeData);
      handleCloseEditModal();
      showNotification('Employee updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating employee:', error);
      showNotification('Failed to update employee', 'error');
      throw error;
    }
  }, [updateEmployee, handleCloseEditModal, showNotification]);

  // SMOOTH Status update handler with animations
  const handleStatusUpdate = useCallback(async (employeeId, currentStatus) => {
    try {
      setStatusUpdateLoading(employeeId);
      
      // Start animation
      setStatusAnimations(prev => ({
        ...prev,
        [employeeId]: 'updating'
      }));

      console.log('🔄 Starting status update:', { employeeId, currentStatus });

      let result;
      if (currentStatus === 'active') {
        result = await deactivateEmployee(employeeId);
        showNotification('Employee deactivated successfully!', 'success');
      } else {
        result = await activateEmployee(employeeId);
        showNotification('Employee activated successfully!', 'success');
      }
      
      console.log('✅ Status update completed:', result);
      
      // Success animation
      setStatusAnimations(prev => ({
        ...prev,
        [employeeId]: 'success'
      }));

      // Clear animation after delay
      setTimeout(() => {
        setStatusAnimations(prev => {
          const newState = { ...prev };
          delete newState[employeeId];
          return newState;
        });
      }, 1500);
      
    } catch (error) {
      console.error('❌ Error updating employee status:', error);
      showNotification('Failed to update employee status: ' + error.message, 'error');
      
      // Error animation
      setStatusAnimations(prev => ({
        ...prev,
        [employeeId]: 'error'
      }));

      // Clear error animation after delay
      setTimeout(() => {
        setStatusAnimations(prev => {
          const newState = { ...prev };
          delete newState[employeeId];
          return newState;
        });
      }, 2000);
    } finally {
      setStatusUpdateLoading(null);
    }
  }, [deactivateEmployee, activateEmployee, showNotification]);

  const filteredEmployees = useMemo(() => {
    let filtered = employees;
    
    if (employeeFilter !== "All") {
      filtered = filtered.filter(e => {
        const status = e.status?.toLowerCase();
        return status === employeeFilter.toLowerCase();
      });
    }
    
    if (searchTerm) {
      filtered = filtered.filter(e => 
        e.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.employee_code?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    console.log('🔍 Filtered employees count:', filtered.length);
    return filtered;
  }, [employees, employeeFilter, searchTerm]);

  const handleViewEmployee = useCallback((employee) => {
    const employeeId = employee.user_id || employee.id;
    if (employeeId) {
      navigate(`/employees/${employeeId}`);
    } else {
      alert('Cannot view employee: No valid ID found');
    }
  }, [navigate]);

  const handlePageChange = useCallback(async (page) => {
    setIsTransitioning(true);
    setTimeout(() => {
      goToPage(page - 1);
      setTimeout(() => setIsTransitioning(false), 300);
    }, 150);
  }, [goToPage]);

  const handleNextPage = useCallback(async () => {
    if (pagination.currentPage < pagination.totalPages - 1) {
      setIsTransitioning(true);
      setTimeout(() => {
        goToNextPage();
        setTimeout(() => setIsTransitioning(false), 300);
      }, 150);
    }
  }, [pagination.currentPage, pagination.totalPages, goToNextPage]);

  const handlePrevPage = useCallback(async () => {
    if (pagination.currentPage > 0) {
      setIsTransitioning(true);
      setTimeout(() => {
        goToPrevPage();
        setTimeout(() => setIsTransitioning(false), 300);
      }, 150);
    }
  }, [pagination.currentPage, goToPrevPage]);

  const handleItemsPerPageChange = useCallback(async (value) => {
    setIsTransitioning(true);
    setTimeout(() => {
      changePageSize(Number(value));
      setTimeout(() => setIsTransitioning(false), 300);
    }, 150);
  }, [changePageSize]);

  const handleRefresh = useCallback(() => {
    setSearchTerm("");
    setEmployeeFilter("All");
    goToPage(pagination.currentPage);
  }, [goToPage, pagination.currentPage]);

  // Get animation class for status cell
  const getStatusAnimationClass = useCallback((employeeId) => {
    const animation = statusAnimations[employeeId];
    switch (animation) {
      case 'updating':
        return 'status-updating';
      case 'success':
        return 'status-success';
      case 'error':
        return 'status-error';
      default:
        return '';
    }
  }, [statusAnimations]);

  return (
    <div className="card employee-list-container">
      <div className="cardHeaderFlex">
        <div className="filterButtons">
          {["All", "active", "inactive"].map((x) => (
            <button
              key={x}
              onClick={() => setEmployeeFilter(x)}
              className={`filterBtn smooth-transition ${employeeFilter === x ? 'filterBtnActive' : ''}`}
            >
              {x[0].toUpperCase() + x.slice(1)}
            </button>
          ))}
        </div>
        
        <div className="searchAndControls">
          <div className="searchBox smooth-transition">
            <i className="fas fa-search searchIcon"></i>
            <input 
              type="text" 
              placeholder="Search employees..." 
              className="searchInput"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <button 
            onClick={handleRefresh}
            className="btn btnSecondary smooth-transition"
            disabled={loading}
          >
            <i className="fas fa-refresh"></i> Refresh
          </button>
        </div>
      </div>

      <div className={`cardBody ${isTransitioning ? 'page-transition' : ''}`}>
        {loading ? (
          <div className="loadingState smooth-fade-in">
            <i className="fas fa-spinner fa-spin"></i> Loading employees...
          </div>
        ) : error ? (
          <div className="errorState smooth-fade-in">
            <i className="fas fa-exclamation-circle"></i> Error: {error}
          </div>
        ) : (
          <>
            <div className="table-container">
              <table className="employeeTable">
                <thead>
                  <tr>
                    <th>Employee Code</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Designation</th>
                    <th>Grade</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((emp, index) => {
                    const currentStatus = emp.status;
                    const isUpdating = statusUpdateLoading === emp.user_id;
                    const animationClass = getStatusAnimationClass(emp.user_id);
                    
                    return (
                      <tr 
                        key={emp.user_id} 
                        className={`table-row smooth-fade-in row-animation-${index % 5}`}
                        style={{ animationDelay: `${(index % 10) * 0.05}s` }}
                      >
                        <td className="smooth-slide-in">
                          <span className="employee-code">{emp.employee_code || 'N/A'}</span>
                        </td>
                        <td className="smooth-slide-in">
                          <strong className="employee-name">{emp.first_name} {emp.last_name}</strong>
                        </td>
                        <td className="smooth-slide-in">
                          <span className="employee-email">{emp.email}</span>
                        </td>
                        <td className="smooth-slide-in">
                          <span className="employee-department">{emp.department || 'N/A'}</span>
                        </td>
                        <td className="smooth-slide-in">
                          <span className="employee-designation">{emp.designation || 'N/A'}</span>
                        </td>
                        <td className="smooth-slide-in">
                          <span className="employee-grade">{emp.grade || 'N/A'}</span>
                        </td>
                        <td className={`smooth-slide-in ${animationClass}`}>
                          <div className="status-cell">
                            <Badge 
                              variant={currentStatus} 
                              className={`status-badge smooth-transition ${animationClass}`}
                            >
                              {currentStatus ? currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1) : 'Unknown'}
                            </Badge>
                            <button
                              className={`btnIcon status-toggle smooth-transition ${animationClass}`}
                              onClick={() => handleStatusUpdate(emp.user_id, currentStatus)}
                              disabled={isUpdating || loading}
                              title={currentStatus === 'active' ? 'Deactivate Employee' : 'Activate Employee'}
                            >
                              {isUpdating ? (
                                <i className="fas fa-spinner fa-spin pulse-animation"></i>
                              ) : currentStatus === 'active' ? (
                                <i className="fas fa-toggle-on toggle-icon" style={{color: '#28a745', fontSize: '16px'}}></i>
                              ) : (
                                <i className="fas fa-toggle-off toggle-icon" style={{color: '#6c757d', fontSize: '16px'}}></i>
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="smooth-slide-in">
                          <div className="actionButtons">
                            <button
                              className="btnIcon smooth-scale"
                              onClick={() => handleViewEmployee(emp)}
                              title="View Details"
                              disabled={isUpdating}
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            <button
                              className="btnIcon smooth-scale"
                              onClick={() => handleEditClick(emp)}
                              title="Edit Employee"
                              disabled={isUpdating}
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {filteredEmployees.length === 0 && !isTransitioning && (
              <div className="noData smooth-fade-in">
                <i className="fas fa-users"></i>
                <p>No employees found</p>
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm("")}
                    className="btn btnSecondary smooth-transition"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {pagination.totalPages > 1 && (
        <div className="paginationControls smooth-fade-in">
          <div className="paginationInfo">
            <span>Showing {filteredEmployees.length} of {pagination.totalElements} employees</span>
          </div>
          
          <div className="paginationButtons">
            <button
              onClick={() => handlePageChange(1)}
              disabled={pagination.currentPage === 0 || loading || isTransitioning}
              className="btn btnSecondary smooth-transition"
            >
              <i className="fas fa-angle-double-left"></i>
            </button>
            <button
              onClick={handlePrevPage}
              disabled={pagination.currentPage === 0 || loading || isTransitioning}
              className="btn btnSecondary smooth-transition"
            >
              <i className="fas fa-angle-left"></i>
            </button>
            
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              let pageNum;
              if (pagination.totalPages <= 5) {
                pageNum = i;
              } else if (pagination.currentPage <= 2) {
                pageNum = i;
              } else if (pagination.currentPage >= pagination.totalPages - 3) {
                pageNum = pagination.totalPages - 5 + i;
              } else {
                pageNum = pagination.currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum + 1)}
                  className={`btn smooth-transition ${pagination.currentPage === pageNum ? 'btnPrimary' : 'btnSecondary'}`}
                  disabled={loading || isTransitioning}
                >
                  {pageNum + 1}
                </button>
              );
            })}
            
            <button
              onClick={handleNextPage}
              disabled={pagination.currentPage >= pagination.totalPages - 1 || loading || isTransitioning}
              className="btn btnSecondary smooth-transition"
            >
              <i className="fas fa-angle-right"></i>
            </button>
            <button
              onClick={() => handlePageChange(pagination.totalPages)}
              disabled={pagination.currentPage >= pagination.totalPages - 1 || loading || isTransitioning}
              className="btn btnSecondary smooth-transition"
            >
              <i className="fas fa-angle-double-right"></i>
            </button>
          </div>
        </div>
      )}

      <Modal
        isOpen={editModalOpen}
        onClose={handleCloseEditModal}
        title="Edit Employee"
        size="medium"
      >
        <EmployeeEditForm
          employee={selectedEmployee}
          onSave={handleEmployeeUpdate}
          onClose={handleCloseEditModal}
          isLoading={loading}
        />
      </Modal>
    </div>
  );
};

export { EmployeeList };
export default EmployeeList;