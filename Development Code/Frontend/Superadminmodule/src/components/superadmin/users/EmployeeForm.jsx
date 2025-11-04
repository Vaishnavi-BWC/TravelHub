import React, { useState, useEffect, useRef } from 'react';
import { useEmployees } from '../../../hooks/useEmployees';
import { useRoles } from '../../../hooks/useRoles';
import './EmployeeForm.css';

function EmployeeForm({ onSubmit, onCancel, isLoading = false }) {
  const { createEmployee, loading: hookLoading, error: hookError } = useEmployees();
  const { roles, loading: rolesLoading, error: rolesError } = useRoles();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    department: '',
    level: '',
    managerId: '',
    roleIds: [],
    projectIds: ''
  });

  const [localError, setLocalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const messageTimeoutRef = useRef(null);

  const isLoadingState = hookLoading || isLoading || rolesLoading;

  // Clear message timeout on unmount
  useEffect(() => {
    return () => {
      if (messageTimeoutRef.current) {
        clearTimeout(messageTimeoutRef.current);
      }
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const clearMessages = () => {
    setLocalError('');
    setSuccessMessage('');
    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current);
      messageTimeoutRef.current = null;
    }
  };

  const setAutoDismissMessage = (setter, message) => {
    setter(message);

    // Clear any existing timeout
    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current);
    }

    // Set new timeout to clear message after 5 seconds
    messageTimeoutRef.current = setTimeout(() => {
      setter('');
      messageTimeoutRef.current = null;
    }, 5000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Clear messages when user starts typing
    clearMessages();
  };

  const handleRoleToggle = (roleId) => {
    const currentRoleIds = [...formData.roleIds];
    const roleIndex = currentRoleIds.indexOf(roleId);

    if (roleIndex > -1) {
      currentRoleIds.splice(roleIndex, 1);
    } else {
      currentRoleIds.push(roleId);
    }

    setFormData({
      ...formData,
      roleIds: currentRoleIds
    });

    // Clear messages when user interacts with roles
    clearMessages();
  };

  const toggleDropdown = () => {
    if (!isLoadingState && !rolesLoading) {
      setDropdownOpen(!dropdownOpen);
    }
  };

  const getSelectedRoleNames = () => {
    return formData.roleIds.map(roleId => {
      const role = roles.find(r => r.roleId === roleId);
      return role ? role.roleName : '';
    }).filter(name => name).join(', ');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearMessages();

    // Basic validation
    if (!formData.fullName.trim() || !formData.email.trim() || !formData.department.trim()) {
      setAutoDismissMessage(setLocalError, 'Please fill in all required fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setAutoDismissMessage(setLocalError, 'Please enter a valid email address');
      return;
    }

    // Role validation
    if (formData.roleIds.length === 0) {
      setAutoDismissMessage(setLocalError, 'Please select at least one role');
      return;
    }

    try {
      const employeeData = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phoneNumber: formData.phoneNumber.trim() || null,
        department: formData.department.trim(),
        level: formData.level.trim() || null,
        managerId: formData.managerId.trim() || null,
        roleIds: formData.roleIds,
        projectIds: formData.projectIds
          ? formData.projectIds.split(',').map(id => id.trim()).filter(id => id !== '')
          : []
      };

      console.log('Submitting employee data:', employeeData);

      if (typeof onSubmit === 'function') {
        await onSubmit(employeeData);
        setAutoDismissMessage(setSuccessMessage, `Employee "${employeeData.fullName}" created successfully!`);
      } else {
        await createEmployee(employeeData);

        setAutoDismissMessage(setSuccessMessage, `Employee "${employeeData.fullName}" created successfully!`);

        // Reset form
        setFormData({
          fullName: '',
          email: '',
          phoneNumber: '',
          department: '',
          level: '',
          managerId: '',
          roleIds: [],
          projectIds: ''
        });
      }
    } catch (err) {
      console.error('API Error:', err);
      setAutoDismissMessage(setLocalError, err.message || 'Failed to create employee. Please check your connection and try again.');
    }
  };

  const handleCancelClick = () => {
    clearMessages(); // Clear messages when canceling

    if (typeof onCancel === 'function') {
      onCancel();
    } else {
      console.log('Form cancelled');
      if (window.history.length > 1) {
        window.history.back();
      } else {
        setFormData({
          fullName: '',
          email: '',
          phoneNumber: '',
          department: '',
          level: '',
          managerId: '',
          roleIds: [],
          projectIds: ''
        });
      }
    }
  };

  const displayError = localError || hookError || rolesError;

  return (
    <div className="form">
      <div className="formHeader">
        <h1 className="formTitle">Add New Employee</h1>
        <p className="formSubtitle">Fill in the details below to add a new employee to the system.</p>
      </div>

      {successMessage && (
        <div className="successMessage">
          <i className="fas fa-check-circle"></i> {successMessage}
        </div>
      )}

      {displayError && (
        <div className="errorMessage">
          <i className="fas fa-exclamation-circle"></i> {displayError}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="formGrid">
          {/* Row 1: Full Name & Email */}
          <div className="formRow">
            <div className="formGroup">
              <label htmlFor="fullName">Full Name <span>*</span></label>
              <input
                id="fullName"
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="formControl"
                placeholder="Enter employee's full name"
                required
                disabled={isLoadingState}
              />
            </div>
            <div className="formGroup">
              <label htmlFor="email">Email Address <span>*</span></label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="formControl"
                placeholder="employee@company.com"
                required
                disabled={isLoadingState}
              />
            </div>
          </div>

          {/* Row 2: Phone Number & Department */}
          <div className="formRow">
            <div className="formGroup">
              <label htmlFor="phoneNumber">Phone Number</label>
              <input
                id="phoneNumber"
                type="text"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="formControl"
                placeholder="+91"
                disabled={isLoadingState}
              />
            </div>
            <div className="formGroup">
              <label htmlFor="department">Department <span>*</span></label>
              <input
                id="department"
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="formControl"
                placeholder="Enter department"
                required
                disabled={isLoadingState}
              />
            </div>
          </div>

          {/* Row 3: Level & Manager ID */}
          <div className="formRow">
            <div className="formGroup">
              <label htmlFor="level">Level</label>
              <input
                id="level"
                type="text"
                name="level"
                value={formData.level}
                onChange={handleChange}
                className="formControl"
                placeholder="Enter level"
                disabled={isLoadingState}
              />
            </div>
            <div className="formGroup">
              <label htmlFor="managerId">Manager ID</label>
              <input
                id="managerId"
                type="text"
                name="managerId"
                value={formData.managerId}
                onChange={handleChange}
                className="formControl"
                placeholder="Manager UUID"
                disabled={isLoadingState}
              />
            </div>
          </div>

          {/* Row 4: Roles Dropdown & Project IDs */}
          <div className="formRow">
            <div className="formGroup">
              <label htmlFor="roles">Roles <span>*</span></label>
              <div className="dropdownContainer" ref={dropdownRef}>
                <div
                  className={`dropdownTrigger ${dropdownOpen ? 'dropdownOpen' : ''}`}
                  onClick={toggleDropdown}
                  disabled={isLoadingState || rolesLoading}
                >
                  <span className="dropdownPlaceholder">
                    {formData.roleIds.length > 0 ? getSelectedRoleNames() : 'Select roles...'}
                  </span>
                  <i className={`fas fa-chevron-${dropdownOpen ? 'up' : 'down'}`}></i>
                </div>

                {dropdownOpen && (
                  <div className="dropdownMenu">
                    {rolesLoading ? (
                      <div className="dropdownItem disabled">Loading roles...</div>
                    ) : rolesError ? (
                      <div className="dropdownItem disabled">Error loading roles</div>
                    ) : roles.length === 0 ? (
                      <div className="dropdownItem disabled">No roles available</div>
                    ) : (
                      roles.map((role) => (
                        <div
                          key={role.roleId}
                          className={`dropdownItem ${formData.roleIds.includes(role.roleId) ? 'selected' : ''}`}
                          onClick={() => handleRoleToggle(role.roleId)}
                        >
                          <div className="roleCheckbox">
                            <i className={`fas fa-${formData.roleIds.includes(role.roleId) ? 'check-square' : 'square'}`}></i>
                          </div>
                          <div className="roleInfo">
                            <div className="roleName">{role.roleName}</div>
                            <div className="roleDescription">{role.description}</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
              {formData.roleIds.length > 0 && (
                <div className="selectedRolesBadge">
                  <span className="badge">{formData.roleIds.length} role(s) selected</span>
                </div>
              )}
            </div>
            <div className="formGroup">
              <label htmlFor="projectIds">Project IDs</label>
              <input
                id="projectIds"
                type="text"
                name="projectIds"
                value={formData.projectIds}
                onChange={handleChange}
                className="formControl"
                placeholder="e.g: Himalaya"
                disabled={isLoadingState}
              />
            </div>
          </div>
        </div>

        <div className="formActions">
          <button
            type="button"
            className="btn btnSecondary"
            onClick={handleCancelClick}
            disabled={isLoadingState}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`btn btnPrimary ${isLoadingState ? 'btnLoading' : ''}`}
            disabled={isLoadingState}
          >
            {isLoadingState ? 'Adding Employee...' : 'Add Employee'}
          </button>
        </div>
      </form>
    </div>
  );
}

export { EmployeeForm };
export default EmployeeForm;