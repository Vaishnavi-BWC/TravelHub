// components/superadmin/users/UserManagement.js
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEmployees } from '../../../hooks/useEmployees';
import { useApp } from '../../../contexts/AppContext';
import { 
  FaSearch, FaSync, FaPlus, FaEye, FaEdit, 
  FaToggleOn, FaToggleOff, FaSpinner,
  FaAngleLeft, FaAngleRight, FaAngleDoubleLeft, FaAngleDoubleRight
} from 'react-icons/fa';
import styles from '../superadmin.module.css';
import '../styles/UserManagement.css';

const UserManagement = () => {
  const navigate = useNavigate();
  const { showNotification } = useApp();
  
  const { 
    employees, 
    loading, 
    error,
    deactivateEmployee,
    activateEmployee,
    pagination,
    goToNextPage,
    goToPrevPage,
    goToPage,
    changePageSize
  } = useEmployees();

  const [searchTerm, setSearchTerm] = useState('');
  const [employeeFilter, setEmployeeFilter] = useState("All");
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(null);
  const [statusAnimations, setStatusAnimations] = useState({});
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Status update handler with animations
  const handleStatusUpdate = useCallback(async (employeeId, currentStatus) => {
    try {
      setStatusUpdateLoading(employeeId);
      
      setStatusAnimations(prev => ({
        ...prev,
        [employeeId]: 'updating'
      }));

      let result;
      if (currentStatus === 'active') {
        result = await deactivateEmployee(employeeId);
        showNotification('Employee deactivated successfully!', 'success');
      } else {
        result = await activateEmployee(employeeId);
        showNotification('Employee activated successfully!', 'success');
      }
      
      setStatusAnimations(prev => ({
        ...prev,
        [employeeId]: 'success'
      }));

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
      
      setStatusAnimations(prev => ({
        ...prev,
        [employeeId]: 'error'
      }));

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
    
    return filtered;
  }, [employees, employeeFilter, searchTerm]);

  const handleRefresh = () => {
    goToPage(0);
  };

  const handleAddUser = () => {
    navigate('/add-employee');
  };

  const handleViewEmployee = useCallback((employee) => {
    const employeeId = employee.user_id || employee.id;
    if (employeeId) {
      navigate(`/employees/${employeeId}`);
    } else {
      alert('Cannot view employee: No valid ID found');
    }
  }, [navigate]);

  const handleEditEmployee = useCallback((employee) => {
    console.log('Edit employee:', employee);
  }, []);

  // Pagination handlers with transitions
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
    <div className={styles.container}>
      <h2> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Employee Management</h2>
      <button
        className={`${styles.primaryBtn} primarybtnadd`}
        onClick={handleAddUser}
      >
        <FaPlus className={styles.btnIcon} />
        Add Employee
      </button>
      
      <div className={`${styles.card} maincard`}>
        <div className="cardheaderuser">
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
          
          <div className="headerActions">
            <div className={styles.searchBox}>
              <FaSearch className={styles.searchIcon} />
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
              className={`${styles.secondaryBtn} btnSecondary smooth-transition`}
              disabled={loading}
            >
              <FaSync className={styles.btnIcon} />
              Refresh
            </button>
          </div>
        </div>

        <div className={`${styles.cardBody} ${isTransitioning ? 'page-transition' : ''}`}>
          {loading ? (
            <div className="loadingState smooth-fade-in">
              <FaSpinner className="fas fa-spinner fa-spin" />
              Loading employees...
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
                              <span className="status-text">
                                {currentStatus ? currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1) : 'Unknown'}
                              </span>   <button
                                className={`btnIcon status-toggle smooth-transition ${animationClass}`}
                                onClick={() => handleStatusUpdate(emp.user_id, currentStatus)}
                                disabled={isUpdating || loading}
                                title={currentStatus === 'active' ? 'Deactivate Employee' : 'Activate Employee'}
                              >
                                {isUpdating ? (
                                  <FaSpinner className="fas fa-spinner fa-spin pulse-animation" />
                                ) : currentStatus === 'active' ? (
                                  <FaToggleOn className="toggle-icon" style={{color: '#28a745', fontSize: '16px'}} />
                                ) : (
                                  <FaToggleOff className="toggle-icon" style={{color: '#6c757d', fontSize: '16px'}} />
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
                                <FaEye className="fas fa-eye" />
                              </button>
                              <button
                                className="btnIcon smooth-scale"
                                onClick={() => handleEditEmployee(emp)}
                                title="Edit Employee"
                                disabled={isUpdating}
                              >
                                <FaEdit className="fas fa-edit" />
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

        {/* Pagination Controls */}
        {pagination && pagination.totalPages > 1 && (
          <div className="paginationControls smooth-fade-in">
            <div className="paginationInfo">
              <span>
                Showing {filteredEmployees.length} of {pagination.totalElements} employees
                {pagination.pageSize && (
                  <select 
                    value={pagination.pageSize} 
                    onChange={(e) => handleItemsPerPageChange(e.target.value)}
                    className="pageSizeSelect"
                    disabled={loading || isTransitioning}
                  >
                    <option value="5">5 per page</option>
                    <option value="10">10 per page</option>
                    <option value="20">20 per page</option>
                    <option value="50">50 per page</option>
                  </select>
                )}
              </span>
            </div>
            
            <div className="paginationButtons">
              <button
                onClick={() => handlePageChange(1)}
                disabled={pagination.currentPage === 0 || loading || isTransitioning}
                className="btn btnSecondary smooth-transition"
              >
                <FaAngleDoubleLeft />
              </button>
              <button
                onClick={handlePrevPage}
                disabled={pagination.currentPage === 0 || loading || isTransitioning}
                className="btn btnSecondary smooth-transition"
              >
                <FaAngleLeft />
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
                <FaAngleRight />
              </button>
              <button
                onClick={() => handlePageChange(pagination.totalPages)}
                disabled={pagination.currentPage >= pagination.totalPages - 1 || loading || isTransitioning}
                className="btn btnSecondary smooth-transition"
              >
                <FaAngleDoubleRight />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;