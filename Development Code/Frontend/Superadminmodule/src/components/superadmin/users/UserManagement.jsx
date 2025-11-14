// components/superadmin/users/UserManagement.js
<<<<<<< HEAD
import React, { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useEmployees } from "../../../hooks/useEmployees";
import { useApp } from "../../../contexts/AppContext";
import {
  FaSearch,
  FaSync,
  FaPlus,
  FaEye,
  FaEdit,
  FaToggleOn,
  FaToggleOff,
  FaSpinner,
  FaAngleLeft,
  FaAngleRight,
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
} from "react-icons/fa";

import "../styles/UserManagement.css";
=======
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEmployees } from '../../../hooks/useEmployees';
import { useApp } from '../../../contexts/AppContext';
import {
  FaSearch, FaSync, FaPlus, FaEye, FaEdit,
  FaToggleOn, FaToggleOff, FaSpinner,
  FaAngleLeft, FaAngleRight, FaAngleDoubleLeft, FaAngleDoubleRight
} from 'react-icons/fa';

import '../styles/UserManagement.css';
>>>>>>> upstream/main

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
    changePageSize,
  } = useEmployees();

  const [searchTerm, setSearchTerm] = useState("");
  const [employeeFilter, setEmployeeFilter] = useState("All");
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(null);
  const [statusAnimations, setStatusAnimations] = useState({});
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Status update handler with animations
<<<<<<< HEAD
  const handleStatusUpdate = useCallback(
    async (employeeId, currentStatus) => {
      try {
        setStatusUpdateLoading(employeeId);
=======
  const handleStatusUpdate = useCallback(async (employeeId, currentStatus) => {
    try {
      setStatusUpdateLoading(employeeId);

      setStatusAnimations(prev => ({
        ...prev,
        [employeeId]: 'updating'
      }));
>>>>>>> upstream/main

        setStatusAnimations((prev) => ({
          ...prev,
          [employeeId]: "updating",
        }));

        let result;
        if (currentStatus === "active") {
          result = await deactivateEmployee(employeeId);
          showNotification("Employee deactivated successfully!", "success");
        } else {
          // eslint-disable-next-line no-unused-vars
          result = await activateEmployee(employeeId);
          showNotification("Employee activated successfully!", "success");
        }

        setStatusAnimations((prev) => ({
          ...prev,
          [employeeId]: "success",
        }));

        setTimeout(() => {
          setStatusAnimations((prev) => {
            const newState = { ...prev };
            delete newState[employeeId];
            return newState;
          });
        }, 1500);
      } catch (error) {
        console.error("❌ Error updating employee status:", error);
        showNotification(
          "Failed to update employee status: " + error.message,
          "error"
        );

        setStatusAnimations((prev) => ({
          ...prev,
          [employeeId]: "error",
        }));

        setTimeout(() => {
          setStatusAnimations((prev) => {
            const newState = { ...prev };
            delete newState[employeeId];
            return newState;
          });
        }, 2000);
      } finally {
        setStatusUpdateLoading(null);
      }
<<<<<<< HEAD
    },
    [deactivateEmployee, activateEmployee, showNotification]
  );
=======

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
>>>>>>> upstream/main

  const filteredEmployees = useMemo(() => {
    let filtered = employees;

    if (employeeFilter !== "All") {
      filtered = filtered.filter((e) => {
        const status = e.status?.toLowerCase();
        return status === employeeFilter.toLowerCase();
      });
    }

    if (searchTerm) {
<<<<<<< HEAD
      filtered = filtered.filter(
        (e) =>
          e.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          e.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          e.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          e.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          e.employee_code?.toLowerCase().includes(searchTerm.toLowerCase())
=======
      filtered = filtered.filter(e =>
        e.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.employee_code?.toLowerCase().includes(searchTerm.toLowerCase())
>>>>>>> upstream/main
      );
    }

    return filtered;
  }, [employees, employeeFilter, searchTerm]);

  const handleRefresh = () => {
    goToPage(0);
  };

  const handleAddUser = () => {
    navigate("/add-employee");
  };

  // const handleViewEmployee = useCallback(
  //   (employee) => {
  //     const employeeId = employee.user_id || employee.id;
  //     if (employeeId) {
  //       navigate(`/employees/${employeeId}`);
  //     } else {
  //       alert("Cannot view employee: No valid ID found");
  //     }
  //   },
  //   [navigate]
  // );

  // const handleEditEmployee = useCallback((employee) => {
  //   console.log("Edit employee:", employee);
  // }, []);

  // Pagination handlers with transitions
  const handlePageChange = useCallback(
    async (page) => {
      setIsTransitioning(true);
      setTimeout(() => {
        goToPage(page - 1);
        setTimeout(() => setIsTransitioning(false), 300);
      }, 150);
    },
    [goToPage]
  );

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

  const handleItemsPerPageChange = useCallback(
    async (value) => {
      setIsTransitioning(true);
      setTimeout(() => {
        changePageSize(Number(value));
        setTimeout(() => setIsTransitioning(false), 300);
      }, 150);
    },
    [changePageSize]
  );

  // Get animation class for status cell
  const getStatusAnimationClass = useCallback(
    (employeeId) => {
      const animation = statusAnimations[employeeId];
      switch (animation) {
        case "updating":
          return "status-updating";
        case "success":
          return "status-success";
        case "error":
          return "status-error";
        default:
          return "";
      }
    },
    [statusAnimations]
  );

  return (
    <div className="container">
      <div className="card maincard">
<<<<<<< HEAD
        <div className="card-header">
          <div className="header-content">
            <h3 style={{ fontWeight: "500", marginBottom: "10px" }}>
              Employee Management
            </h3>
            <h6 style={{ color: "gray", fontSize: "15px", fontWeight: "400" }}>
              Streamline workforce data and maintain employee records
              efficiently.
            </h6>
          </div>
        </div>
=======
         <div className="card-header">
        <div className="header-content">
          <h3 style={{fontWeight:'500',marginBottom:'10px'}}>Employee Management</h3>
          <h6 style={{ color: 'gray', fontSize: '15px', fontWeight: '400' }}>Streamline workforce data and maintain employee records efficiently.</h6>
        </div>
      </div>
>>>>>>> upstream/main
        <div className="cardheaderuser">
          <div className="filterButtons">
            {["All", "active", "inactive"].map((x) => (
              <button
                key={x}
                onClick={() => setEmployeeFilter(x)}
                className={`filterBtn smooth-transition ${
                  employeeFilter === x ? "filterBtnActive" : ""
                }`}
              >
                {x[0].toUpperCase() + x.slice(1)}
              </button>
            ))}
          </div>

          <div className="headerActions">
            <div className="searchBox">
<<<<<<< HEAD
              <FaSearch className="searchIcon" />
=======
              <FaSearch className="searchIcon"/>
>>>>>>> upstream/main
              <input
                type="text"
                placeholder="Search employees..."
                className="searchInput"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              className="primaryBtn primarybtnadd"
              onClick={handleAddUser}
            >
              <FaPlus className="btn-icon" />
              Add Employee
            </button>
            <button
              onClick={handleRefresh}
              className="secondaryBtn btnSecondary smooth-transition"
              disabled={loading}
            >
              <FaSync className="btn-icon" />
              Refresh
            </button>
          </div>
        </div>

<<<<<<< HEAD
        <div className={`cardBody ${isTransitioning ? "page-transition" : ""}`}>
=======
        <div className={`cardBody ${isTransitioning ? 'page-transition' : ''}`}>
>>>>>>> upstream/main
          {loading ? (
            <div className="loadingState smooth-fade-in">
              <FaSpinner className="spinner-icon fa-spin" />
              Loading employees...
            </div>
          ) : error ? (
            <div className="errorState smooth-fade-in">
              <span className="error-icon">⚠️</span> Error: {error}
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
                      {/* <th>Actions</th> */}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEmployees.map((emp, index) => {
                      const currentStatus = emp.status;
                      const isUpdating = statusUpdateLoading === emp.user_id;
<<<<<<< HEAD
                      const animationClass = getStatusAnimationClass(
                        emp.user_id
                      );
=======
                      const animationClass = getStatusAnimationClass(emp.user_id);
>>>>>>> upstream/main

                      return (
                        <tr
                          key={emp.user_id}
<<<<<<< HEAD
                          className={`table-row smooth-fade-in row-animation-${
                            index % 5
                          }`}
=======
                          className={`table-row smooth-fade-in row-animation-${index % 5}`}
>>>>>>> upstream/main
                          style={{ animationDelay: `${(index % 10) * 0.05}s` }}
                        >
                          <td className="smooth-slide-in">
                            <span className="employee-code">
                              {emp.employee_code || "N/A"}
                            </span>
                          </td>
                          <td className="smooth-slide-in">
                            <strong className="employee-name">
                              {emp.first_name} {emp.last_name}
                            </strong>
                          </td>
                          <td className="smooth-slide-in">
                            <span className="employee-email">{emp.email}</span>
                          </td>
                          <td className="smooth-slide-in">
                            <span className="employee-department">
                              {emp.department || "N/A"}
                            </span>
                          </td>
                          <td className="smooth-slide-in">
                            <span className="employee-designation">
                              {emp.designation || "N/A"}
                            </span>
                          </td>
                          <td className="smooth-slide-in">
                            <span className="employee-grade">
                              {emp.grade || "N/A"}
                            </span>
                          </td>
                          <td className={`smooth-slide-in ${animationClass}`}>
                            <div className="status-cell">
                              {/* UPDATED: Added active/inactive class to status text */}
<<<<<<< HEAD
                              <span
                                className={`status-text ${
                                  currentStatus === "active"
                                    ? "active"
                                    : "inactive"
                                }`}
                              >
                                {currentStatus
                                  ? currentStatus.charAt(0).toUpperCase() +
                                    currentStatus.slice(1)
                                  : "Unknown"}
                              </span>
                              <button
                                className={`action-btn status-toggle smooth-transition ${animationClass}`}
                                onClick={() =>
                                  handleStatusUpdate(emp.user_id, currentStatus)
                                }
=======
                              <span className={`status-text ${currentStatus === 'active' ? 'active' : 'inactive'}`}>
                                {currentStatus ? currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1) : 'Unknown'}
                              </span>
                              <button
                                className={`action-btn status-toggle smooth-transition ${animationClass}`}
                                onClick={() => handleStatusUpdate(emp.user_id, currentStatus)}
>>>>>>> upstream/main
                                disabled={isUpdating || loading}
                                title={
                                  currentStatus === "active"
                                    ? "Deactivate Employee"
                                    : "Activate Employee"
                                }
                              >
                                {isUpdating ? (
                                  <FaSpinner className="spinner-icon fa-spin pulse-animation" />
<<<<<<< HEAD
                                ) : currentStatus === "active" ? (
=======
                                ) : currentStatus === 'active' ? (
>>>>>>> upstream/main
                                  <FaToggleOn className="toggle-icon active" />
                                ) : (
                                  <FaToggleOff className="toggle-icon inactive" />
                                )}
                              </button>
                            </div>
                          </td>
                          {/* <td className="smooth-slide-in">
                            <div className="actionButtons">
<<<<<<< HEAD
                           
=======
                              {/* UPDATED: Added view-btn class and view-icon class */}
>>>>>>> upstream/main
                              <button
                                className="action-btn view-btn smooth-scale"
                                onClick={() => handleViewEmployee(emp)}
                                title="View Details"
                                disabled={isUpdating}
                              >
                                <FaEye className="action-icon view-icon" />
                              </button>
<<<<<<< HEAD
                     
=======
                              {/* UPDATED: Added edit-btn class and edit-icon class */}
>>>>>>> upstream/main
                              <button
                                className="action-btn edit-btn smooth-scale"
                                onClick={() => handleEditEmployee(emp)}
                                title="Edit Employee"
                                disabled={isUpdating}
                              >
                                <FaEdit className="action-icon edit-icon" />
                              </button>
                            </div>
                          </td> */}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {filteredEmployees.length === 0 && !isTransitioning && (
                <div className="noData smooth-fade-in">
                  <span className="no-data-icon">👥</span>
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
                Showing {filteredEmployees.length} of {pagination.totalElements}{" "}
                employees
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
<<<<<<< HEAD
                disabled={
                  pagination.currentPage === 0 || loading || isTransitioning
                }
=======
                disabled={pagination.currentPage === 0 || loading || isTransitioning}
>>>>>>> upstream/main
                className="pagibtn btnSecondary smooth-transition"
              >
                <FaAngleDoubleLeft />
              </button>
              <button
                onClick={handlePrevPage}
<<<<<<< HEAD
                disabled={
                  pagination.currentPage === 0 || loading || isTransitioning
                }
=======
                disabled={pagination.currentPage === 0 || loading || isTransitioning}
>>>>>>> upstream/main
                className="pagibtn btnSecondary smooth-transition"
              >
                <FaAngleLeft />
              </button>

<<<<<<< HEAD
              {Array.from(
                { length: Math.min(5, pagination.totalPages) },
                (_, i) => {
                  let pageNum;
                  if (pagination.totalPages <= 5) {
                    pageNum = i;
                  } else if (pagination.currentPage <= 2) {
                    pageNum = i;
                  } else if (
                    pagination.currentPage >=
                    pagination.totalPages - 3
                  ) {
                    pageNum = pagination.totalPages - 5 + i;
                  } else {
                    pageNum = pagination.currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum + 1)}
                      className={`pagibtn smooth-transition ${
                        pagination.currentPage === pageNum
                          ? "btnPrimary"
                          : "btnSecondary"
                      }`}
                      disabled={loading || isTransitioning}
                    >
                      {pageNum + 1}
                    </button>
                  );
                }
              )}

              <button
                onClick={handleNextPage}
                disabled={
                  pagination.currentPage >= pagination.totalPages - 1 ||
                  loading ||
                  isTransitioning
                }
=======
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
                    className={`pagibtn smooth-transition ${pagination.currentPage === pageNum ? 'btnPrimary' : 'btnSecondary'}`}
                    disabled={loading || isTransitioning}
                  >
                    {pageNum + 1}
                  </button>
                );
              })}

              <button
                onClick={handleNextPage}
                disabled={pagination.currentPage >= pagination.totalPages - 1 || loading || isTransitioning}
>>>>>>> upstream/main
                className="pagibtn btnSecondary smooth-transition"
              >
                <FaAngleRight />
              </button>
              <button
                onClick={() => handlePageChange(pagination.totalPages)}
<<<<<<< HEAD
                disabled={
                  pagination.currentPage >= pagination.totalPages - 1 ||
                  loading ||
                  isTransitioning
                }
=======
                disabled={pagination.currentPage >= pagination.totalPages - 1 || loading || isTransitioning}
>>>>>>> upstream/main
                className="pagibtn btnSecondary smooth-transition"
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
