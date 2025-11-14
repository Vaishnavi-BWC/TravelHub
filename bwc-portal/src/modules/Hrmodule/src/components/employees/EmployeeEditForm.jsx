// components/employees/EmployeeEditForm.js - UPDATED VERSION
import React, { useState, useEffect } from 'react';
import { LoadingSpinner } from '../common/LoadingSpinner';

const EmployeeEditForm = ({ employee, onSave, onClose, isLoading = false }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    department: '',
    level: '',
    managerId: '',
    projectIds: ['']
  });

  const [errors, setErrors] = useState({});

  // Initialize form with employee data
  useEffect(() => {
    if (employee) {
      const originalData = employee._original || {};
      setFormData({
        fullName: originalData.fullName || `${employee.first_name || ''} ${employee.last_name || ''}`.trim(),
        email: originalData.email || employee.email || '',
        phoneNumber: originalData.phoneNumber || employee.phone_number || '',
        department: originalData.department || employee.department || '',
        level: originalData.level || employee.grade || '',
        managerId: originalData.managerId || '',
        projectIds: originalData.projectIds && originalData.projectIds.length > 0 
          ? [...originalData.projectIds] 
          : ['']
      });
    }
  }, [employee]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleProjectIdChange = (index, value) => {
    const newProjectIds = [...formData.projectIds];
    newProjectIds[index] = value;
    setFormData(prev => ({
      ...prev,
      projectIds: newProjectIds
    }));
  };

  const addProjectField = () => {
    setFormData(prev => ({
      ...prev,
      projectIds: [...prev.projectIds, '']
    }));
  };

  const removeProjectField = (index) => {
    if (formData.projectIds.length > 1) {
      const newProjectIds = formData.projectIds.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        projectIds: newProjectIds
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName?.trim()) {
      newErrors.fullName = 'Full Name is required';
    }

    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.department?.trim()) {
      newErrors.department = 'Department is required';
    }

    if (!formData.level?.trim()) {
      newErrors.level = 'Level is required';
    }

    // Validate project IDs format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    formData.projectIds.forEach((projectId, index) => {
      if (projectId && !uuidRegex.test(projectId)) {
        newErrors[`projectId_${index}`] = 'Project ID must be a valid UUID format';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Filter out empty project IDs and prepare data for API
      const submitData = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        department: formData.department.trim(),
        level: formData.level.trim(),
        managerId: formData.managerId.trim() || null,
        projectIds: formData.projectIds.filter(id => id.trim() !== '')
      };
      
      onSave(employee.user_id, submitData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="employee-form">
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="fullName">Full Name *</label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            className={errors.fullName ? 'error' : ''}
            placeholder="Enter full name"
            disabled={isLoading}
          />
          {errors.fullName && <span className="error-text">{errors.fullName}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="email">Email *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={errors.email ? 'error' : ''}
            placeholder="Enter email address"
            disabled={isLoading}
          />
          {errors.email && <span className="error-text">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="phoneNumber">Phone Number</label>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            placeholder="Enter phone number"
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="department">Department *</label>
          <input
            type="text"
            id="department"
            name="department"
            value={formData.department}
            onChange={handleChange}
            className={errors.department ? 'error' : ''}
            placeholder="Enter department"
            disabled={isLoading}
          />
          {errors.department && <span className="error-text">{errors.department}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="level">Level *</label>
          <input
            type="text"
            id="level"
            name="level"
            value={formData.level}
            onChange={handleChange}
            className={errors.level ? 'error' : ''}
            placeholder="Enter level (e.g., L1, L2, L3)"
            disabled={isLoading}
          />
          {errors.level && <span className="error-text">{errors.level}</span>}
        </div>

        {/* NEW: Manager ID Field */}
        <div className="form-group">
          <label htmlFor="managerId">Manager ID</label>
          <input
            type="text"
            id="managerId"
            name="managerId"
            value={formData.managerId}
            onChange={handleChange}
            placeholder="Enter manager UUID"
            disabled={isLoading}
          />
          <small className="help-text">
            Manager UUID (e.g., ff78684e-ed8d-4696-bccf-582ecf1ab900)
          </small>
        </div>

        {/* NEW: Project IDs Field */}
        <div className="form-group full-width">
          <label>Project IDs</label>
          {formData.projectIds.map((projectId, index) => (
            <div key={index} className="project-id-field">
              <input
                type="text"
                value={projectId}
                onChange={(e) => handleProjectIdChange(index, e.target.value)}
                placeholder={`Project UUID ${index + 1}`}
                disabled={isLoading}
                className={errors[`projectId_${index}`] ? 'error' : ''}
              />
              {formData.projectIds.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeProjectField(index)}
                  className="btn btn-danger btn-sm"
                  disabled={isLoading}
                >
                  <i className="fas fa-times"></i>
                </button>
              )}
              {errors[`projectId_${index}`] && (
                <span className="error-text">{errors[`projectId_${index}`]}</span>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addProjectField}
            className="btn btn-secondary btn-sm"
            disabled={isLoading}
          >
            <i className="fas fa-plus"></i> Add Project ID
          </button>
          <small className="help-text">
            Add project UUIDs (e.g., 3fa85f64-5717-4562-b3fc-2c963f66afa6)
          </small>
        </div>
      </div>

      <div className="form-actions">
        <button 
          type="button" 
          onClick={onClose} 
          className="btn btn-secondary"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={isLoading}
        >
          {isLoading ? <LoadingSpinner size="small" /> : 'Update Employee'}
        </button>
      </div>
    </form>
  );
};

export { EmployeeEditForm };
export default EmployeeEditForm;