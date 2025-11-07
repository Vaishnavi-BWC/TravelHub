import React, { useState, useEffect, useCallback } from 'react';
import {
  FaInfoCircle,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaProjectDiagram,
  FaDollarSign,
  FaExclamationTriangle,
  FaSave,
  FaUpload,
  FaUser,
  FaBuilding,
  FaIdCard,
  FaPlane,
  FaTrain,
  FaCar,
  FaHotel,
  FaUtensils,
  FaPaperclip
} from "react-icons/fa";
import { useAuth } from '../../../hooks/useAuth';
import { useTravelRequest } from '../../../hooks/useTravelRequest';
import styles from "./NewRequests.module.css";

const NewRequest = ({ onBack }) => {
  const { user, authStatus } = useAuth();
  const { loading: submitting, error: submitError, success: submitSuccess, saveAsDraft, submitRequest } = useTravelRequest();

  const [formData, setFormData] = useState({
    isPostTravel: false, // Checkbox for post-travel
    travelDestination: '',
    origin: '',
    startDate: '',
    endDate: '',
    purpose: '',
    projectId: '',
    estimatedBudget: '',
    managerPresent: true,
    travelModes: {},
    attachments: [] // For post-travel attachments
  });

  const [errors, setErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [employeeData, setEmployeeData] = useState(null);
  const [projectOptions, setProjectOptions] = useState([]);
  const [policyData, setPolicyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [policyLoading, setPolicyLoading] = useState(false);
  const [showPolicy, setShowPolicy] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [attachmentFiles, setAttachmentFiles] = useState([]);

  // Fetch employee data directly when component mounts
  useEffect(() => {
    const fetchEmployeeData = async () => {
      if (!user?.userId) {
        console.log('❌ No user ID available');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setApiError(null);
        console.log('👤 Fetching employee data for user:', user.userId);

        const employeeResponse = await fetch(`/ems/api/v1/employees/${user.userId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`
          },
          credentials: 'include'
        });

        console.log('👤 Employee response status:', employeeResponse.status);

        if (!employeeResponse.ok) {
          const errorText = await employeeResponse.text();
          throw new Error(`Failed to fetch employee data: ${employeeResponse.status} - ${errorText}`);
        }

        const employeeResult = await employeeResponse.json();
        console.log('✅ Employee data received:', employeeResult);

        const employeeData = employeeResult.data || employeeResult;
        setEmployeeData(employeeData);

        // Extract projects from employee data
        console.log('📋 Employee projects:', employeeData.projects);
        
        if (employeeData.projects && employeeData.projects.length > 0) {
          const projects = employeeData.projects.map(project => ({
            id: project.projectId,
            label: project.projectName,
            uuid: project.projectId
          }));
          setProjectOptions(projects);
          console.log('✅ Projects loaded successfully:', projects);
        } else {
          console.log('ℹ️ No projects found for employee');
          setProjectOptions([]);
        }

      } catch (error) {
        console.error('❌ Error fetching employee data:', error);
        setApiError(`Failed to load employee data: ${error.message}`);
        
        // Fallback data
        const fallbackProjects = [
          { id: "3554a10c-1332-4793-848b-7fa0bcf8a331", label: "BWC Internal Project", uuid: "3554a10c-1332-4793-848b-7fa0bcf8a331" },
          { id: "8aa8b2c7-cd77-4bb0-bdd1-9b88a9ed0540", label: "ABC Project", uuid: "8aa8b2c7-cd77-4bb0-bdd1-9b88a9ed0540" }
        ];
        setProjectOptions(fallbackProjects);
        
        setEmployeeData({
          employeeId: user?.userId || 'Unknown',
          fullName: user?.email?.split('@')[0] || 'User',
          email: user?.email || '',
          department: 'Engineering',
          level: 'L3',
          managerName: 'Manager',
          active: true,
          projects: fallbackProjects.map(p => ({ projectId: p.id, projectName: p.label }))
        });
        
        console.log('🔄 Using fallback data due to API error');
      } finally {
        setLoading(false);
      }
    };

    if (authStatus === 'authenticated' && user?.userId) {
      console.log('🚀 Starting employee data fetch...');
      fetchEmployeeData();
    } else if (authStatus === 'authenticated') {
      console.log('ℹ️ User authenticated but no user ID');
      setLoading(false);
    }
  }, [user, authStatus]);

  // Auto-fetch travel policy when destination and employee level are available
  const fetchTravelPolicy = useCallback(async (destination, grade) => {
    if (!destination || !grade) {
      setPolicyData(null);
      setShowPolicy(false);
      return;
    }

    try {
      setPolicyLoading(true);
      setShowPolicy(true);
      setApiError(null);
      
      console.log(`🏙️ Auto-fetching travel policy for city: ${destination}, grade: ${grade}`);

      const policyResponse = await fetch(
        `/pms/api/policies/active?city=${encodeURIComponent(destination)}&grade=${encodeURIComponent(grade)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`
          },
          credentials: 'include'
        }
      );

      console.log(`📥 Policy response status:`, policyResponse.status);

      if (!policyResponse.ok) {
        if (policyResponse.status === 404) {
          setPolicyData({ notFound: true });
        } else {
          const errorText = await policyResponse.text();
          throw new Error(`HTTP ${policyResponse.status}: ${errorText}`);
        }
      } else {
        const policyResult = await policyResponse.json();
        console.log('📋 Travel policy fetched:', policyResult);
        setPolicyData(policyResult.data || policyResult);
      }
    } catch (error) {
      console.error('❌ Error fetching travel policy:', error);
      setApiError(`Failed to load travel policy: ${error.message}`);
      setPolicyData({ error: error.message });
    } finally {
      setPolicyLoading(false);
    }
  }, [user]);

  // Auto-fetch policy when destination changes
  useEffect(() => {
    if (formData.travelDestination && employeeData?.level) {
      const delayDebounceFn = setTimeout(() => {
        fetchTravelPolicy(formData.travelDestination, employeeData.level);
      }, 1000); // 1 second delay after typing stops

      return () => clearTimeout(delayDebounceFn);
    }
  }, [formData.travelDestination, employeeData?.level, fetchTravelPolicy]);

  // Validate form whenever formData changes
  useEffect(() => {
    const validateForm = () => {
      const newErrors = {};

      if (!formData.travelDestination) newErrors.travelDestination = 'Destination is required';
      if (!formData.origin) newErrors.origin = 'Departure location is required';
      if (!formData.startDate) newErrors.startDate = 'Start date is required';
      if (!formData.endDate) newErrors.endDate = 'End date is required';
      if (!formData.purpose) newErrors.purpose = 'Purpose is required';
      if (!formData.projectId) newErrors.projectId = 'Project selection is required';
      
      // For post-travel, validate attachments
      if (formData.isPostTravel && attachmentFiles.length === 0) {
        newErrors.attachments = 'At least one attachment is required for post-travel requests';
      }
      
      // Date validation
      if (formData.startDate && formData.endDate) {
        const start = new Date(formData.startDate);
        const end = new Date(formData.endDate);
        if (end < start) {
          newErrors.endDate = 'End date cannot be before start date';
        }
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (start < today) {
          newErrors.startDate = 'Start date must be today or in the future';
        }
      }

      setErrors(newErrors);
      setIsFormValid(Object.keys(newErrors).length === 0);
    };

    validateForm();
  }, [formData, attachmentFiles]);

  const prepareSubmissionData = () => {
    if (!user || !user.userId) {
      throw new Error('User data not available. Please ensure you are logged in.');
    }

    const selectedProject = projectOptions.find(project => project.id === formData.projectId);
    
    if (!selectedProject) {
      throw new Error('Please select a valid project');
    }

    const formatDate = (dateString) => {
      if (!dateString) return null;
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    };

    const submissionData = {
      employeeId: user.userId,
      projectId: selectedProject.uuid,
      origin: formData.origin,
      travelDestination: formData.travelDestination,
      startDate: formatDate(formData.startDate),
      endDate: formatDate(formData.endDate),
      purpose: formData.purpose,
      managerPresent: formData.managerPresent,
      estimatedBudget: formData.estimatedBudget ? parseFloat(formData.estimatedBudget) : 0,
      isPostTravel: formData.isPostTravel,
      attachments: formData.attachments
    };

    console.log('📦 Prepared submission data:', submissionData);
    return submissionData;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleTravelModeChange = (modeName, classId) => {
    setFormData(prev => ({
      ...prev,
      travelModes: {
        ...prev.travelModes,
        [modeName]: classId
      }
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setAttachmentFiles(prev => [...prev, ...files]);
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files.map(file => ({
        name: file.name,
        type: file.type,
        size: file.size,
        file: file
      }))]
    }));
  };

  const removeAttachment = (index) => {
    setAttachmentFiles(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const getModeIcon = (modeName) => {
    switch (modeName.toLowerCase()) {
      case 'flight': return <FaPlane />;
      case 'train': return <FaTrain />;
      case 'cab': return <FaCar />;
      default: return <FaCar />;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isFormValid) {
      alert('Please fix the errors before submitting.');
      return;
    }

    try {
      const submissionData = prepareSubmissionData();
      await submitRequest(submissionData);
      
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        if (onBack) onBack();
      }, 3000);
      
    } catch (error) {
      console.error('❌ Error submitting request:', error);
      alert(`Failed to submit request: ${error.message}`);
    }
  };

  const handleSaveDraft = async (e) => {
    e.preventDefault();
    
    try {
      const draftData = prepareSubmissionData();
      await saveAsDraft(draftData);
      alert('Draft saved successfully!');
      if (onBack) onBack();
    } catch (error) {
      console.error('Error saving draft:', error);
      alert(`Failed to save draft: ${error.message}`);
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
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Checking authentication status...</p>
      </div>
    );
  }

  if (authStatus === 'failed') {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorIcon}>⚠️</div>
        <h3>Authentication Required</h3>
        <p>Unable to authenticate your session. Please try the following:</p>
        <ul className={styles.solutionsList}>
          <li>Refresh the page</li>
          <li>Check if you're logged in</li>
          <li>Contact support if the issue persists</li>
        </ul>
        <button onClick={() => window.location.reload()} className={styles.retryButton}>
          Refresh Page
        </button>
      </div>
    );
  }

  return (
    <div className={styles.newRequest}>
      {/* Success Message */}
      {showSuccess && (
        <div className={styles.successOverlay}>
          <div className={styles.successMessage}>
            <div className={styles.successIcon}>✓</div>
            <h3>Travel Request Submitted Successfully!</h3>
            <p>Your request has been sent for approval.</p>
          </div>
        </div>
      )}

      <div className="detailHeader">
        <div className={styles.headerContent}>
          <h2>New Travel Request</h2>
          {user && (
            <div className={styles.userInfo}>
              <span><strong>Requested by:</strong> {user.email}</span>
              {employeeData && (
                <>
                  <span className={styles.department}>• {employeeData.department}</span>
                  <span className={styles.role}>• Level: {employeeData.level}</span>
                  {employeeData.managerName && (
                    <span className={styles.manager}>• Manager: {employeeData.managerName}</span>
                  )}
                </>
              )}
              <span className={styles.userId}>• User ID: {user.userId}</span>
            </div>
          )}
        </div>

        {/* Policy Status Indicator */}
        <div className={styles.headerActions}>
          <div className={styles.policyStatus}>
            {policyLoading ? (
              <div className={styles.policyLoading}>
                <div className={styles.spinnerSmall}></div>
                <span>Loading Policy...</span>
              </div>
            ) : policyData ? (
              <div className={styles.policyFound}>
                <FaInfoCircle />
                <span>Policy Loaded for {formData.travelDestination}</span>
              </div>
            ) : formData.travelDestination ? (
              <div className={styles.policyPending}>
                <FaInfoCircle />
                <span>Enter destination to load policy</span>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* API Error Banner */}
      {apiError && (
        <div className={styles.apiErrorBanner}>
          <FaExclamationTriangle />
          <span>{apiError}</span>
          <button onClick={() => setApiError(null)} className={styles.closeError}>×</button>
        </div>
      )}

      <div className={styles.requestContainer}>
        <form onSubmit={handleSubmit} className={styles.requestForm}>
          {/* Employee Information Card */}
          {employeeData && (
            <div className={styles.formCard}>
              <div className={styles.cardHeader}>
                <FaUser className={styles.cardIcon} />
                <h3>Employee Information</h3>
                {apiError && <span className={styles.fallbackBadge}>Fallback Data</span>}
                {loading && <span className={styles.loadingBadge}>Loading...</span>}
              </div>
              <div className={styles.cardContent}>
                <div className={styles.employeeDetails}>
                  <div className={styles.employeeField}>
                    <FaIdCard className={styles.inputIcon} />
                    <strong>Employee ID:</strong> {employeeData.employeeId || user.userId}
                  </div>
                  <div className={styles.employeeField}>
                    <FaUser className={styles.inputIcon} />
                    <strong>Name:</strong> {employeeData.fullName || user.email}
                  </div>
                  <div className={styles.employeeField}>
                    <FaUser className={styles.inputIcon} />
                    <strong>Email:</strong> {employeeData.email || user.email}
                  </div>
                  <div className={styles.employeeField}>
                    <FaBuilding className={styles.inputIcon} />
                    <strong>Department:</strong> {employeeData.department || 'Not specified'}
                  </div>
                  <div className={styles.employeeField}>
                    <FaUser className={styles.inputIcon} />
                    <strong>Grade:</strong> {employeeData.level || 'Not specified'}
                  </div>
                  {employeeData.managerName && (
                    <div className={styles.employeeField}>
                      <FaUser className={styles.inputIcon} />
                      <strong>Manager:</strong> {employeeData.managerName}
                    </div>
                  )}
                  <div className={styles.employeeField}>
                    <FaBuilding className={styles.inputIcon} />
                    <strong>Status:</strong> {employeeData.active ? 'Active' : 'Inactive'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Travel Policy Information - Auto-loaded */}
          {showPolicy && (
            <div className={styles.formCard}>
              <div className={styles.cardHeader}>
                <FaInfoCircle className={styles.cardIcon} />
                <h3>Travel Policy Information</h3>
                {policyLoading && <span className={styles.loadingBadge}>Loading...</span>}
                {policyData && !policyData.notFound && !policyData.error && (
                  <span className={styles.successBadge}>Auto-loaded</span>
                )}
              </div>
              <div className={styles.cardContent}>
                {policyLoading ? (
                  <div className={styles.loadingPolicy}>
                    <div className={styles.spinner}></div>
                    <p>Fetching travel policy for {formData.travelDestination} (Grade: {employeeData.level})...</p>
                  </div>
                ) : policyData?.notFound ? (
                  <div className={styles.policyNotFound}>
                    <FaExclamationTriangle className={styles.warningIcon} />
                    <p>No travel policy found for <strong>{formData.travelDestination}</strong> at grade <strong>{employeeData.level}</strong>.</p>
                    <p className={styles.policySubtext}>Please contact HR for travel policy details.</p>
                  </div>
                ) : policyData?.error ? (
                  <div className={styles.policyError}>
                    <FaExclamationTriangle className={styles.errorIcon} />
                    <p>Error loading travel policy: {policyData.error}</p>
                  </div>
                ) : policyData ? (
                  <div className={styles.policyDetails}>
                    <h4>Policy for {formData.travelDestination} - Grade {employeeData.level}</h4>
                    
                    {/* Lodging Allowance */}
                    {policyData.lodgingAllowance && (
                      <div className={styles.policySection}>
                        <h5><FaHotel className={styles.sectionIcon} /> Lodging Allowance</h5>
                        <div className={styles.allowanceGrid}>
                          <div className={styles.allowanceItem}>
                            <strong>Company Rate:</strong> {policyData.lodgingAllowance.companyRate * 100}%
                          </div>
                          <div className={styles.allowanceItem}>
                            <strong>Own Rate:</strong> {policyData.lodgingAllowance.ownRate * 100}%
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Per Diem Allowance */}
                    {policyData.perDiemAllowance && (
                      <div className={styles.policySection}>
                        <h5><FaUtensils className={styles.sectionIcon} /> Per Diem Allowance</h5>
                        <div className={styles.allowanceGrid}>
                          {policyData.perDiemAllowance.overnightRule && (
                            <div className={styles.allowanceItem}>
                              <strong>Overnight Stay:</strong> {policyData.perDiemAllowance.overnightRule}
                            </div>
                          )}
                          {policyData.perDiemAllowance.dayTripRule && (
                            <div className={styles.allowanceItem}>
                              <strong>Day Trip:</strong> {policyData.perDiemAllowance.dayTripRule}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Travel Modes */}
                    {policyData.travelModes && policyData.travelModes.length > 0 && (
                      <div className={styles.policySection}>
                        <h5><FaPlane className={styles.sectionIcon} /> Allowed Travel Modes</h5>
                        {policyData.travelModes.map((mode) => (
                          <div key={mode.id} className={styles.travelMode}>
                            <div className={styles.modeHeader}>
                              {getModeIcon(mode.modeName)}
                              <strong>{mode.modeName}</strong>
                            </div>
                            {mode.allowedClasses && mode.allowedClasses.length > 0 && (
                              <div className={styles.classesSection}>
                                <label>Select Class:</label>
                                <select
                                  value={formData.travelModes[mode.modeName] || ''}
                                  onChange={(e) => handleTravelModeChange(mode.modeName, e.target.value)}
                                  className={styles.classSelect}
                                >
                                  <option value="">Select {mode.modeName} class</option>
                                  {mode.allowedClasses.map((classItem) => (
                                    <option key={classItem.id} value={classItem.id}>
                                      {classItem.className} ({classItem.id.substring(0, 8)}...)
                                    </option>
                                  ))}
                                </select>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          )}

          {/* Travel Details Card */}
          <div className={styles.formCard}>
            <div className={styles.cardHeader}>
              <FaMapMarkerAlt className={styles.cardIcon} />
              <h3>Travel Details</h3>
            </div>
            <div className={styles.cardContent}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="travelDestination">
                    <FaMapMarkerAlt className={styles.inputIcon} />
                    Travel Destination *
                  </label>
                  <input
                    type="text"
                    id="travelDestination"
                    name="travelDestination"
                    value={formData.travelDestination}
                    onChange={handleInputChange}
                    placeholder="Enter destination city"
                    className={errors.travelDestination ? styles.inputError : ''}
                  />
                  {errors.travelDestination && (
                    <span className={styles.errorText}>{errors.travelDestination}</span>
                  )}
                  <div className={styles.autoPolicyNote}>
                    Policy will auto-load when destination is entered
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="origin">
                    <FaMapMarkerAlt className={styles.inputIcon} />
                    Departure Location *
                  </label>
                  <input
                    type="text"
                    id="origin"
                    name="origin"
                    value={formData.origin}
                    onChange={handleInputChange}
                    placeholder="Enter departure location"
                    className={errors.origin ? styles.inputError : ''}
                  />
                  {errors.origin && (
                    <span className={styles.errorText}>{errors.origin}</span>
                  )}
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="startDate">
                    <FaCalendarAlt className={styles.inputIcon} />
                    Start Date *
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className={errors.startDate ? styles.inputError : ''}
                  />
                  {errors.startDate && (
                    <span className={styles.errorText}>{errors.startDate}</span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="endDate">
                    <FaCalendarAlt className={styles.inputIcon} />
                    End Date *
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className={errors.endDate ? styles.inputError : ''}
                  />
                  {errors.endDate && (
                    <span className={styles.errorText}>{errors.endDate}</span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label>Duration</label>
                  <div className={styles.durationDisplay}>
                    {calculateDuration()} day(s)
                  </div>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="purpose">
                  <FaInfoCircle className={styles.inputIcon} />
                  Purpose of Travel *
                </label>
                <textarea
                  id="purpose"
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleInputChange}
                  placeholder="Describe the purpose and objectives of this travel"
                  rows="3"
                  className={errors.purpose ? styles.inputError : ''}
                />
                {errors.purpose && (
                  <span className={styles.errorText}>{errors.purpose}</span>
                )}
              </div>
            </div>
          </div>

          {/* Project & Budget Card */}
          <div className={styles.formCard}>
            <div className={styles.cardHeader}>
              <FaProjectDiagram className={styles.cardIcon} />
              <h3>Project & Budget Information</h3>
            </div>
            <div className={styles.cardContent}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="projectId">
                    <FaProjectDiagram className={styles.inputIcon} />
                    Project *
                  </label>
                  <select
                    id="projectId"
                    name="projectId"
                    value={formData.projectId}
                    onChange={handleInputChange}
                    className={errors.projectId ? styles.inputError : ''}
                    disabled={projectOptions.length === 0 || loading}
                  >
                    <option value="">{loading ? 'Loading projects...' : 'Select a project'}</option>
                    {projectOptions.map(project => (
                      <option key={project.id} value={project.id}>
                        {project.label}
                      </option>
                    ))}
                  </select>
                  {errors.projectId && (
                    <span className={styles.errorText}>{errors.projectId}</span>
                  )}
                  {projectOptions.length === 0 && !loading && (
                    <span className={styles.warningText}>No projects assigned to your account</span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="estimatedBudget">
                    <FaDollarSign className={styles.inputIcon} />
                    Estimated Budget
                  </label>
                  <input
                    type="number"
                    id="estimatedBudget"
                    name="estimatedBudget"
                    value={formData.estimatedBudget}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="managerPresent"
                    checked={formData.managerPresent}
                    onChange={handleInputChange}
                  />
                  <span className={styles.checkboxText}>Manager is present and aware of this travel</span>
                </label>
              </div>
            </div>
          </div>

          {/* Post-Travel Checkbox */}
          <div className={styles.formCard}>
            <div className={styles.cardHeader}>
              <FaPaperclip className={styles.cardIcon} />
              <h3>Request Type</h3>
            </div>
            <div className={styles.cardContent}>
              <div className={styles.formGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="isPostTravel"
                    checked={formData.isPostTravel}
                    onChange={handleInputChange}
                  />
                  <span className={styles.checkboxText}>
                    This is a Post-Travel Request (for expense reimbursement after travel)
                  </span>
                </label>
                <div className={styles.checkboxHelpText}>
                  Check this box if you are submitting expenses after completing your travel. 
                  You will need to upload receipts and supporting documents.
                </div>
              </div>
            </div>
          </div>

          {/* Attachments Section - Only for Post-Travel */}
          {formData.isPostTravel && (
            <div className={styles.formCard}>
              <div className={styles.cardHeader}>
                <FaPaperclip className={styles.cardIcon} />
                <h3>Expense Attachments</h3>
              </div>
              <div className={styles.cardContent}>
                <div className={styles.formGroup}>
                  <label htmlFor="attachments">
                    <FaPaperclip className={styles.inputIcon} />
                    Upload Receipts and Documents *
                  </label>
                  <input
                    type="file"
                    id="attachments"
                    multiple
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    className={styles.fileInput}
                  />
                  <div className={styles.fileHelpText}>
                    Supported formats: PDF, JPG, PNG, DOC, DOCX. Maximum file size: 10MB per file.
                  </div>
                  
                  {errors.attachments && (
                    <span className={styles.errorText}>{errors.attachments}</span>
                  )}
                  
                  {/* Display uploaded files */}
                  {attachmentFiles.length > 0 && (
                    <div className={styles.attachmentsList}>
                      <h4>Uploaded Files:</h4>
                      {attachmentFiles.map((file, index) => (
                        <div key={index} className={styles.attachmentItem}>
                          <FaPaperclip className={styles.attachmentIcon} />
                          <span className={styles.attachmentName}>{file.name}</span>
                          <span className={styles.attachmentSize}>
                            ({(file.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                          <button
                            type="button"
                            onClick={() => removeAttachment(index)}
                            className={styles.removeAttachment}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className={styles.actionButtons}>
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={submitting || !formData.travelDestination || projectOptions.length === 0}
              className={styles.draftButton}
            >
              <FaSave className={styles.btnIcon} />
              {submitting ? 'Saving...' : 'Save as Draft'}
            </button>
            
            <div className={styles.submitButtons}>
              <button
                type="button"
                onClick={onBack}
                disabled={submitting}
                className={styles.cancelButton}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !isFormValid || projectOptions.length === 0}
                className={styles.submitButton}
              >
                <FaUpload className={styles.btnIcon} />
                {submitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </div>

          {/* Form Validation Status */}
          <div className={styles.formStatus}>
            {!isFormValid && (
              <div className={styles.validationWarning}>
                <FaInfoCircle />
                Please fill in all required fields (marked with *) to submit the form.
              </div>
            )}
            {projectOptions.length === 0 && !loading && (
              <div className={styles.validationWarning}>
                <FaExclamationTriangle />
                No projects are assigned to your account. Please contact your manager.
              </div>
            )}
            {submitting && (
              <div className={styles.loadingStatus}>
                <div className={styles.loadingSpinner}></div>
                Processing your request...
              </div>
            )}
            {submitError && (
              <div className={styles.errorStatus}>
                <FaExclamationTriangle />
                {submitError}
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewRequest;