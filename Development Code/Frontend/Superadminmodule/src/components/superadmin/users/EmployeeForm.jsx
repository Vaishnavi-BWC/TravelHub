import React, { useState, useEffect, useRef } from 'react';
import { useEmployees } from '../../../hooks/useEmployees';
import { useRoles } from '../../../hooks/useRoles';
import './EmployeeForm.css';
import { useManagers } from '../../../hooks/useManagers';
import { useProjects } from '../../../hooks/useProjects';


function EmployeeForm({ onSubmit, onCancel, isLoading = false }) {
  const { createEmployee, loading: hookLoading, error: hookError } = useEmployees();
  const { roles, loading: rolesLoading, error: rolesError } = useRoles();
  const { managers, loading: managersLoading, error: managersError } = useManagers();
  const {
    managerProjects,
    loading: projectsLoading,
    loadManagerProjects,
    error: projectsError
  } = useProjects();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    department: '',
    level: '',
    managerId: '',
    roleIds: [],
    projectIds: []
  });

  const [selectedManager, setSelectedManager] = useState(null);
  const [localError, setLocalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState({
    roles: false,
    projects: false
  });

  const [lastManagerId, setLastManagerId] = useState('');

  const rolesDropdownRef = useRef(null);
  const projectsDropdownRef = useRef(null);
  const messageTimeoutRef = useRef(null);

  // Only show loading when actually submitting
  const isLoadingState = hookLoading || isLoading;

  // Clear message timeout on unmount
  useEffect(() => {
    return () => {
      if (messageTimeoutRef.current) {
        clearTimeout(messageTimeoutRef.current);
      }
    };
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (rolesDropdownRef.current && !rolesDropdownRef.current.contains(event.target)) {
        setDropdownOpen(prev => ({ ...prev, roles: false }));
      }
      if (projectsDropdownRef.current && !projectsDropdownRef.current.contains(event.target)) {
        setDropdownOpen(prev => ({ ...prev, projects: false }));
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Load manager projects ONLY when manager is selected and changed
  useEffect(() => {
    const loadProjectsForManager = async () => {
      if (formData.managerId && formData.managerId !== lastManagerId) {
        console.log('🔄 Loading projects for NEW manager:', formData.managerId);

        // Find the selected manager
        const manager = managers.find(m => m.managerId === formData.managerId);
        setSelectedManager(manager);
        setLastManagerId(formData.managerId);

        // Load projects for this manager
        try {
          await loadManagerProjects(formData.managerId);
        } catch (error) {
          console.error('❌ Failed to load projects:', error);
        }
      } else if (!formData.managerId) {
        setSelectedManager(null);
        setLastManagerId('');
      }
    };

    loadProjectsForManager();
  }, [formData.managerId, managers, loadManagerProjects, lastManagerId]);

  const clearMessages = () => {
    setLocalError('');
    setSuccessMessage('');
    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current);
    }
  };

  const setAutoDismissMessage = (setter, message) => {
    setter(message);
    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current);
    }
    messageTimeoutRef.current = setTimeout(() => {
      setter('');
      messageTimeoutRef.current = null;
    }, 5000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'managerId') {
      // Clear selected projects when manager changes
      setFormData({
        ...formData,
        [name]: value,
        projectIds: []
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }

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
  };

  const handleProjectToggle = (projectId) => {
    const currentProjectIds = [...formData.projectIds];
    const projectIndex = currentProjectIds.indexOf(projectId);

    if (projectIndex > -1) {
      currentProjectIds.splice(projectIndex, 1);
    } else {
      currentProjectIds.push(projectId);
    }

    setFormData({
      ...formData,
      projectIds: currentProjectIds
    });

    console.log('✅ Selected Projects:', currentProjectIds);
    console.log('✅ Available Projects:', managerProjects);
  };

  const toggleDropdown = (type) => {
    if (!isLoadingState) {
      setDropdownOpen(prev => ({
        ...prev,
        [type]: !prev[type]
      }));
    }
  };

  const getSelectedRoleNames = () => {
    const selectedNames = formData.roleIds.map(roleId => {
      const role = roles.find(r => r.roleId === roleId);
      return role ? role.roleName : '';
    }).filter(name => name);

    return selectedNames.join(', ');
  };

  const getSelectedProjectNames = () => {
    const selectedNames = formData.projectIds.map(projectId => {
      const project = managerProjects.find(p => p.projectId === projectId);
      return project ? project.projectName : '';
    }).filter(name => name);

    console.log('🎯 Selected Projects Display:', selectedNames);
    console.log('🎯 Form Data Project IDs:', formData.projectIds);
    console.log('🎯 Available Manager Projects:', managerProjects);

    return selectedNames.join(', ');
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
        managerId: formData.managerId || null,
        roleIds: formData.roleIds,
        projectIds: formData.projectIds
      };

      console.log('📤 Submitting employee data:', employeeData);

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
          projectIds: []
        });
        setSelectedManager(null);
        setLastManagerId('');
      }
    } catch (err) {
      console.error('API Error:', err);
      setAutoDismissMessage(setLocalError, err.message || 'Failed to create employee. Please check your connection and try again.');
    }
  };

  const handleCancelClick = () => {
    clearMessages();
    if (typeof onCancel === 'function') {
      onCancel();
    } else {
      window.history.back();
    }
  };

  const displayError = localError || hookError || rolesError || managersError || projectsError;

  return (
    <div className="form">
      <div className="formHeader">
       <h1 className="formTitle">Create Employee Profile</h1>
        <p className="formSubtitle">Onboard new talent seamlessly into the BrainWave family.</p>
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

          {/* Row 3: Level & Manager Dropdown */}
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
              <label htmlFor="managerId">Manager Name</label>
              <select
                id="managerId"
                name="managerId"
                value={formData.managerId}
                onChange={handleChange}
                className="formControl"
                disabled={isLoadingState || managersLoading}
              >
                <option value="">Select Manager</option>
                {managers.map(manager => (
                  <option key={manager.managerId} value={manager.managerId}>
                    {manager.fullName} - {manager.department}
                  </option>
                ))}
              </select>
              {managersLoading && (
                <div className="dropdownLoading">Loading managers...</div>
              )}
            </div>
          </div>

          {/* Row 4: Roles & Projects Dropdowns - SIDE BY SIDE */}
          <div className="formRow">
            {/* Roles Dropdown */}
            <div className="formGroup">
              <label htmlFor="roles">Roles <span>*</span></label>
              <div className="dropdownContainer" ref={rolesDropdownRef}>
                <div
                  className={`dropdownTrigger ${dropdownOpen.roles ? 'dropdownOpen' : ''}`}
                  onClick={() => toggleDropdown('roles')}
                  disabled={isLoadingState || rolesLoading}
                >
                  <span className="dropdownPlaceholder">
                    {formData.roleIds.length > 0 ? getSelectedRoleNames() : 'Select roles...'}
                  </span>
                  <i className={`fas fa-chevron-${dropdownOpen.roles ? 'up' : 'down'}`}></i>
                </div>

                {dropdownOpen.roles && (
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

            {/* Projects Dropdown - Only show if manager is selected */}
            {formData.managerId && selectedManager && (
              <div className="formGroup">
                <label htmlFor="projects">Project Name</label>
                <div className="dropdownContainer" ref={projectsDropdownRef}>
                  <div
                    className={`dropdownTrigger ${dropdownOpen.projects ? 'dropdownOpen' : ''}`}
                    onClick={() => toggleDropdown('projects')}
                    disabled={isLoadingState || projectsLoading}
                  >
                    <span className="dropdownPlaceholder">
                      {projectsLoading ? `Loading projects...` :
                        formData.projectIds.length > 0 ? getSelectedProjectNames() : 'Select projects...'}
                    </span>
                    <i className={`fas fa-chevron-${dropdownOpen.projects ? 'up' : 'down'}`}></i>
                  </div>

                  {dropdownOpen.projects && (
                    <div className="dropdownMenu">
                      {projectsLoading ? (
                        <div className="dropdownItem disabled">Loading projects...</div>
                      ) : projectsError ? (
                        <div className="dropdownItem disabled">Error loading projects</div>
                      ) : managerProjects.length === 0 ? (
                        <div className="dropdownItem disabled">No projects found</div>
                      ) : (
                        managerProjects.map((project) => (
                          <div
                            key={project.projectId}
                            className={`dropdownItem ${formData.projectIds.includes(project.projectId) ? 'selected' : ''}`}
                            onClick={() => handleProjectToggle(project.projectId)}
                          >
                            <div className="roleCheckbox">
                              <i className={`fas fa-${formData.projectIds.includes(project.projectId) ? 'check-square' : 'square'}`}></i>
                            </div>
                            <div className="roleInfo">
                              <div className="roleName">{project.projectName}</div>
                              <div className="roleDescription">{project.description}</div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
                {formData.projectIds.length > 0 && (
                  <div className="selectedRolesBadge">
                    <span className="badge">{formData.projectIds.length} project(s) selected</span>
                  </div>
                )}
              </div>
            )}

            {/* Empty space when projects are not shown to maintain layout */}
            {!formData.managerId && (
              <div className="formGroup">
                <label htmlFor="projects">Project Name</label>
                <div className="dropdownContainer">
                  <div className="dropdownTrigger" style={{ opacity: 0.6 }}>
                    <span className="dropdownPlaceholder">Select a manager first</span>
                    <i className="fas fa-chevron-down"></i>
                  </div>
                </div>
              </div>
            )}
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