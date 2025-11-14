// components/travel/TravelRequestForm/TravelRequestForm.js
import React, { useState, useEffect } from 'react';
import {
  FaInfoCircle,
  FaUpload,
  FaCalendarAlt,
  FaDollarSign,
  FaSave,
  FaCheckCircle,
  FaExclamationTriangle,
  FaEdit
} from "react-icons/fa";
import { travelService } from '../../../services/travelService';
import './TravelRequestForm.css';

const TravelRequestForm = ({ onSuccess, onCancel, editRequestId = null, initialData = null }) => {
  const [formData, setFormData] = useState({
    projectId: '',
    startDate: '',
    endDate: '',
    purpose: '',
    managerPresent: false,
    estimatedBudget: 0,
    origin: '',
    travelDestination: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [backendStatus, setBackendStatus] = useState('idle');
  const [isFormValid, setIsFormValid] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [authStatus, setAuthStatus] = useState('checking');
  const [isEditMode, setIsEditMode] = useState(false);

  // Check if we're in edit mode
  useEffect(() => {
    if (editRequestId || initialData) {
      setIsEditMode(true);
    }
  }, [editRequestId, initialData]);

  // Fetch user profile using the travel service
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setAuthStatus('checking');
        
        // Use the travel service to get current user info
        const userInfo = await travelService.getCurrentUser();
        
        if (userInfo && userInfo.id) {
          setUserProfile(userInfo);
          setAuthStatus('authenticated');
          console.log('✅ User profile loaded:', userInfo);
          
          // If we have initial data, populate the form after user profile is loaded
          if (initialData) {
            populateFormWithInitialData(initialData);
          }
        } else {
          throw new Error('Unable to fetch user profile');
        }
      } catch (error) {
        console.error('❌ Error fetching user profile:', error);
        setAuthStatus('failed');
      }
    };

    fetchUserProfile();
  }, []);

  // Fetch request data if in edit mode with editRequestId
  useEffect(() => {
    const fetchRequestData = async () => {
      if (editRequestId && authStatus === 'authenticated' && !initialData) {
        try {
          console.log('🔍 Fetching request data for editing:', editRequestId);
          const requestData = await travelService.getTravelRequestById(editRequestId);
          
          if (requestData) {
            populateFormWithInitialData(requestData);
            console.log('✅ Request data loaded for editing:', requestData);
          }
        } catch (error) {
          console.error('❌ Error fetching request data:', error);
          showErrorMessage(`Failed to load request data: ${error.message}`);
        }
      }
    };

    fetchRequestData();
  }, [editRequestId, authStatus, initialData]);

  // Helper function to populate form with initial data
  const populateFormWithInitialData = (requestData) => {
    // Format dates for input fields (YYYY-MM-DD)
    const formatDateForInput = (dateString) => {
      if (!dateString) return '';
      return new Date(dateString).toISOString().split('T')[0];
    };

    setFormData({
      projectId: requestData.projectId || '',
      startDate: formatDateForInput(requestData.startDate),
      endDate: formatDateForInput(requestData.endDate),
      purpose: requestData.purpose || '',
      managerPresent: requestData.managerPresent !== undefined ? requestData.managerPresent : false,
      estimatedBudget: requestData.estimatedBudget || 0,
      origin: requestData.origin || '',
      travelDestination: requestData.travelDestination || '',
    });
  };

  // Validate form whenever formData changes
  useEffect(() => {
    const validateForm = () => {
      const newErrors = {};

      if (!formData.projectId) newErrors.projectId = 'Project ID is required';
      if (!formData.startDate) newErrors.startDate = 'Start date is required';
      if (!formData.endDate) newErrors.endDate = 'End date is required';
      if (!formData.purpose) newErrors.purpose = 'Purpose is required';

      // Date validation
      if (formData.startDate && formData.endDate) {
        const start = new Date(formData.startDate);
        const end = new Date(formData.endDate);
        if (end < start) {
          newErrors.endDate = 'End date cannot be before start date';
        }

        // Check if start date is today or in future
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (start < today) {
          newErrors.startDate = 'Start date must be today or in the future';
        }
      }

      // UUID validation for projectId
      if (formData.projectId) {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(formData.projectId)) {
          newErrors.projectId = 'Project ID must be a valid UUID format';
        }
      }

      setErrors(newErrors);
      setIsFormValid(Object.keys(newErrors).length === 0);
    };

    validateForm();
  }, [formData]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked :
        type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const prepareSubmissionData = (status = 'DRAFT') => {
    if (!userProfile || !userProfile.id) {
      throw new Error('User data not available. Please ensure you are logged in.');
    }

    // Format dates to match backend expectation (YYYY-MM-DD)
    const formatDate = (dateString) => {
      if (!dateString) return null;
      return new Date(dateString).toISOString().split('T')[0];
    };

    const submissionData = {
      employeeId: userProfile.id,
      projectId: formData.projectId,
      startDate: formatDate(formData.startDate),
      endDate: formatDate(formData.endDate),
      purpose: formData.purpose,
      managerPresent: formData.managerPresent,
      estimatedBudget: formData.estimatedBudget,
      status: status,
      origin: formData.origin,
      travelDestination: formData.travelDestination
    };

    console.log('📦 Prepared submission data for backend:', submissionData);
    return submissionData;
  };

  const showSuccessMessage = (message) => {
    setShowSuccess(true);
    setShowError(false);
    setTimeout(() => {
      setShowSuccess(false);
    }, 5000);
  };

  const showErrorMessage = (message) => {
    setErrorMessage(message);
    setShowError(true);
    setShowSuccess(false);
    setTimeout(() => {
      setShowError(false);
    }, 5000);
  };

  // ORIGINAL FUNCTIONALITY - Create new request
  const handleCreateNewRequest = async (submissionData) => {
    const backendResponse = await travelService.createTravelRequestWithUser(submissionData);
    console.log('🎉 Travel request created successfully:', backendResponse);
    return backendResponse;
  };

  // NEW FUNCTIONALITY - Update existing request
  const handleUpdateRequest = async (submissionData) => {
    const requestId = editRequestId || (initialData && initialData.travelRequestId);
    if (!requestId) {
      throw new Error('Request ID not available for update');
    }
    
    const backendResponse = await travelService.updateTravelRequest(requestId, submissionData);
    console.log('✏️ Travel request updated successfully:', backendResponse);
    return backendResponse;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid) {
      showErrorMessage('Please fix the errors before submitting.');
      return;
    }

    if (authStatus !== 'authenticated') {
      showErrorMessage('Please wait while we authenticate your session...');
      return;
    }

    setIsSubmitting(true);
    setBackendStatus('loading');

    try {
      const submissionData = prepareSubmissionData('PENDING');
      
      let backendResponse;
      
      if (isEditMode) {
        // Update existing request
        backendResponse = await handleUpdateRequest(submissionData);
      } else {
        // Create new request (ORIGINAL FUNCTIONALITY)
        backendResponse = await handleCreateNewRequest(submissionData);
      }

      const successMessage = isEditMode 
        ? 'Travel request updated successfully! Your request has been sent for approval.'
        : 'Travel request submitted successfully! Your request has been sent for approval.';
      
      showSuccessMessage(successMessage);
      
      setTimeout(() => {
        if (onSuccess) {
          onSuccess(backendResponse);
        }
      }, 2000);

    } catch (error) {
      console.error('❌ Error submitting request to backend:', error);
      const errorMessage = isEditMode 
        ? `Failed to update request: ${error.message}`
        : `Failed to submit request: ${error.message}`;
      showErrorMessage(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async (e) => {
    e.preventDefault();

    if (authStatus !== 'authenticated') {
      showErrorMessage('Please wait while we authenticate your session...');
      return;
    }

    const draftData = prepareSubmissionData('DRAFT');
    setIsSubmitting(true);
    setBackendStatus('loading');

    try {
      let backendResponse;
      
      if (isEditMode) {
        // Update existing draft
        backendResponse = await handleUpdateRequest(draftData);
      } else {
        // Create new draft (ORIGINAL FUNCTIONALITY)
        backendResponse = await handleCreateNewRequest(draftData);
      }
      
      // Handle different response structures
      const requestId = backendResponse.travelRequestId || backendResponse.id || backendResponse.requestId;
      
      const successMessage = isEditMode 
        ? `Draft updated successfully! Draft ID: ${requestId}`
        : `Draft saved successfully! Draft ID: ${requestId}`;
      
      showSuccessMessage(successMessage);

      if (onSuccess) {
        onSuccess(backendResponse);
      }

    } catch (error) {
      console.error('Error saving draft to backend:', error);
      const errorMessage = isEditMode 
        ? `Failed to update draft: ${error.message}`
        : `Failed to save draft: ${error.message}`;
      showErrorMessage(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateDuration = () => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays + 1;
    }
    return 0;
  };

  // Show different loading states based on auth status
  if (authStatus === 'checking') {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Checking authentication status...</p>
      </div>
    );
  }

  if (authStatus === 'failed') {
    return (
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <h3>Authentication Required</h3>
        <p>Unable to authenticate your session. Please try refreshing the page.</p>
        <button onClick={() => window.location.reload()} className="retry-button">
          Refresh Page
        </button>
      </div>
    );
  }

  return (
    <div className="travelrequestform">
      {/* Success Message */}
      {showSuccess && (
        <div className="message-overlay success-message">
          <div className="message-content">
            <FaCheckCircle className="message-icon" />
            <div className="message-text">
              <h3>Success!</h3>
              <p>{isEditMode ? 'Request updated successfully!' : 'Travel request submitted successfully!'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {showError && (
        <div className="message-overlay error-message">
          <div className="message-content">
            <FaExclamationTriangle className="message-icon" />
            <div className="message-text">
              <h3>Error</h3>
              <p>{errorMessage}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="form">
        <div className="form-header">
          <h2>{isEditMode ? 'Edit Travel Request' : 'New Travel Request'}</h2>
          {isEditMode && (
            <div className="edit-mode-badge">
              <FaEdit />
              {editRequestId ? 'Editing Draft Request' : 'Editing Request'}
            </div>
          )}
        </div>

        <div className="form-grid">
          {/* Rest of the form remains exactly the same */}
          {/* Project ID Field */}
          <div className="form-group">
            <label htmlFor="projectId">
              Project ID <span className='important'>*</span>
            </label>
            <input
              id="projectId"
              name="projectId"
              type="text"
              className={`form-control ${errors.projectId ? 'input-error' : ''}`}
              placeholder="Enter project UUID (e.g., 3fa85f64-5717-4562-b3fc-2c963f66afa6)"
              value={formData.projectId}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* Start Date */}
          <div className="form-group">
            <label htmlFor="startDate">
              <FaCalendarAlt className="input-icon" />
              Start Date <span className='important'>*</span>
            </label>
            <input
              id="startDate"
              name="startDate"
              type="date"
              className={`form-control ${errors.startDate ? 'input-error' : ''}`}
              value={formData.startDate}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* End Date */}
          <div className="form-group">
            <label htmlFor="endDate">
              <FaCalendarAlt className="input-icon" />
              End Date <span className='important'>*</span>
              &nbsp; &nbsp; &nbsp; &nbsp;
              <label>Duration : </label>
              {calculateDuration()} day(s)
            </label>
            <input
              id="endDate"
              name="endDate"
              type="date"
              className={`form-control ${errors.endDate ? 'input-error' : ''}`}
              value={formData.endDate}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* Estimated Budget */}
          <div className="form-group">
            <label htmlFor="estimatedBudget">
              <FaDollarSign className="input-icon" />
              Estimated Budget ($)
            </label>
            <input
              id="estimatedBudget"
              name="estimatedBudget"
              type="text"
              className="form-control"
              placeholder="0.00"
              min="0"
              step="0.01"
              value={formData.estimatedBudget}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="origin">
              Origin
            </label>
            <input
              id="origin"
              name="origin"
              type="text"
              className="form-control"
              placeholder="Enter origin location"
              value={formData.origin}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="travelDestination">
              Travel Destination
            </label>
            <input
              id="travelDestination"
              name="travelDestination"
              type="text"
              className="form-control"
              placeholder="Enter destination location"
              value={formData.travelDestination}
              onChange={handleInputChange}
            />
          </div>

          {/* Purpose of Travel */}
          <div className="form-group">
            <label htmlFor="purpose">
              <FaInfoCircle className="input-icon" />
              Purpose of Travel <span className='important'>*</span>
            </label>
            <textarea
              id="purpose"
              name="purpose"
              className={`form-control ${errors.purpose ? 'input-error' : ''}`}
              rows="5"
              placeholder="Describe the purpose, objectives, and expected outcomes of your travel..."
              value={formData.purpose}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* Manager Present Checkbox */}
          <div className="form-group">
            <label className="checkbox-label">
              <input
                name="managerPresent"
                type="checkbox"
                checked={formData.managerPresent}
                onChange={handleInputChange}
                className="checkbox-input"
              />
              <span className="checkbox-text">
                Manager is Present <span className='important'>*</span>
              </span>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="form-actions">
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={isSubmitting || !formData.projectId}
            className="btn btn-draft"
          >
            <FaSave />
            {isSubmitting ? 'Saving...' : isEditMode ? 'Update Draft' : 'Save as Draft'}
          </button>

          <div className="submit-buttons">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="btn btn-secondary cancel"
            >
              Cancel
            </button>
            &nbsp;&nbsp;
            <button
              type="submit"
              disabled={isSubmitting || !isFormValid}
              className="btn btn-primary"
            >
              <FaUpload />
              {isSubmitting ? 'Submitting...' : isEditMode ? 'Submit Request' : 'Submit Travel Request'}
            </button>
          </div>
        </div>

        {/* Form Validation Status */}
        <div className="form-status">
          {!isFormValid && (
            <div className="validation-warning">
              <FaInfoCircle />
              Please fill in all required fields (marked with *) to submit the form.
            </div>
          )}
          {backendStatus === 'loading' && (
            <div className="loading-status">
              <div className="loading-spinner"></div>
              {isEditMode ? 'Updating your request...' : 'Processing your request...'}
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default TravelRequestForm;