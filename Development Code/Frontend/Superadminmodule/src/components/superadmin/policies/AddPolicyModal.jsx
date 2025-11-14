// components/superadmin/policies/AddPolicyModal.js - CORRECTED VERSION
import React, { useState, useEffect } from 'react';
import { useSuperAdmin } from "@/contexts/SuperAdminContext";
import { FaTimes, FaPlus, FaSpinner } from 'react-icons/fa';
import styles from '../superadmin.module.css';

const AddPolicyModal = ({ onClose, onSave }) => {
  const { state, actions } = useSuperAdmin();
  const { cityCategories = [] } = state;

  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    categoryId: '',
    gradePolicies: [
      {
        grade: 'L1',
        companyRate: 100.0,
        ownRate: 50.0,
        overnightRule: 'Maximum $200 per night for hotel accommodation',
        dayTripRule: 'Meal allowance: $50 per day',
        travelModes: [
          {
            modeName: 'Flight',
            allowedClasses: ['Economy']
          }
        ]
      }
    ]
  });
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setCategoriesLoading(true);
        await actions.loadCityCategories();
      } catch (error) {
        console.error('Error loading categories:', error);
      } finally {
        setCategoriesLoading(false);
      }
    };

    loadCategories();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'year' ? parseInt(value) : value
    }));
  };

  const handleGradePolicyChange = (index, field, value) => {
    const updatedGradePolicies = [...formData.gradePolicies];
    updatedGradePolicies[index] = {
      ...updatedGradePolicies[index],
      [field]: (field === 'companyRate' || field === 'ownRate') ? parseFloat(value) || 0.0 : value
    };
    setFormData(prev => ({
      ...prev,
      gradePolicies: updatedGradePolicies
    }));
  };

  const handleTravelModeChange = (gradeIndex, modeIndex, field, value) => {
    const updatedGradePolicies = [...formData.gradePolicies];
    const updatedTravelModes = [...updatedGradePolicies[gradeIndex].travelModes];
    
    if (field === 'allowedClasses') {
      updatedTravelModes[modeIndex] = {
        ...updatedTravelModes[modeIndex],
        [field]: [value]
      };
    } else {
      updatedTravelModes[modeIndex] = {
        ...updatedTravelModes[modeIndex],
        [field]: value
      };
    }
    
    updatedGradePolicies[gradeIndex] = {
      ...updatedGradePolicies[gradeIndex],
      travelModes: updatedTravelModes
    };
    
    setFormData(prev => ({
      ...prev,
      gradePolicies: updatedGradePolicies
    }));
  };

  const addGradePolicy = () => {
    const grades = ['L1', 'L2', 'L3', 'L4', 'L5'];
    const nextGrade = grades[formData.gradePolicies.length] || `L${formData.gradePolicies.length + 1}`;
    
    setFormData(prev => ({
      ...prev,
      gradePolicies: [
        ...prev.gradePolicies,
        {
          grade: nextGrade,
          companyRate: 100.0,
          ownRate: 50.0,
          overnightRule: 'Maximum $200 per night for hotel accommodation',
          dayTripRule: 'Meal allowance: $50 per day',
          travelModes: [
            {
              modeName: 'Flight',
              allowedClasses: ['Economy']
            }
          ]
        }
      ]
    }));
  };

  const removeGradePolicy = (index) => {
    if (formData.gradePolicies.length > 1) {
      const updatedGradePolicies = formData.gradePolicies.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        gradePolicies: updatedGradePolicies
      }));
    }
  };

  const addTravelMode = (gradeIndex) => {
    const updatedGradePolicies = [...formData.gradePolicies];
    updatedGradePolicies[gradeIndex].travelModes.push({
      modeName: 'Train',
      allowedClasses: ['Standard']
    });
    setFormData(prev => ({
      ...prev,
      gradePolicies: updatedGradePolicies
    }));
  };

  const removeTravelMode = (gradeIndex, modeIndex) => {
    const updatedGradePolicies = [...formData.gradePolicies];
    if (updatedGradePolicies[gradeIndex].travelModes.length > 1) {
      updatedGradePolicies[gradeIndex].travelModes = updatedGradePolicies[gradeIndex].travelModes.filter((_, i) => i !== modeIndex);
      setFormData(prev => ({
        ...prev,
        gradePolicies: updatedGradePolicies
      }));
    }
  };

  const validateForm = () => {
    // Check required fields
    if (!formData.categoryId) {
      alert('Please select a category');
      return false;
    }

    if (!formData.year || formData.year < 2020 || formData.year > 2030) {
      alert('Please enter a valid year between 2020 and 2030');
      return false;
    }

    // Validate grade policies
    for (let i = 0; i < formData.gradePolicies.length; i++) {
      const gp = formData.gradePolicies[i];
      
      if (!gp.grade || !gp.overnightRule || !gp.dayTripRule) {
        alert(`Please fill in all required fields for Grade ${gp.grade}`);
        return false;
      }

      if (gp.companyRate < 0 || gp.ownRate < 0) {
        alert(`Rates cannot be negative for Grade ${gp.grade}`);
        return false;
      }

      // Validate travel modes
      for (let j = 0; j < gp.travelModes.length; j++) {
        const tm = gp.travelModes[j];
        if (!tm.modeName || !tm.allowedClasses || tm.allowedClasses.length === 0) {
          alert(`Please fill in all travel mode fields for Grade ${gp.grade}`);
          return false;
        }
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      console.log('📤 Sending policy data to backend:', JSON.stringify(formData, null, 2));
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving policy:', error);
      alert(`Error creating policy: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal} style={{ maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div className={styles.modalHeader}>
          <h3>Create New Travel Policy</h3>
          <button 
            type="button" 
            className={styles.closeBtn} 
            onClick={onClose}
            disabled={loading}
          >
            <FaTimes />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className={styles.modalBody}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Year *</label>
                <input 
                  type="number" 
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  required
                  min="2020"
                  max="2030"
                  disabled={loading}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Category *</label>
                <select 
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  required
                  disabled={loading || categoriesLoading}
                >
                  <option value="">Select Category</option>
                  {categoriesLoading ? (
                    <option value="" disabled>Loading categories...</option>
                  ) : (
                    (cityCategories || []).map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))
                  )}
                </select>
                {categoriesLoading && (
                  <div className={styles.loadingText}>Loading categories...</div>
                )}
              </div>
            </div>

            {/* Grade Policies Section */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h4>Grade Policies</h4>
                <button 
                  type="button" 
                  className={styles.secondaryBtn}
                  onClick={addGradePolicy}
                  disabled={loading || formData.gradePolicies.length >= 5}
                >
                  <FaPlus /> Add Grade
                </button>
              </div>

              {formData.gradePolicies.map((gradePolicy, gradeIndex) => (
                <div key={gradeIndex} className={styles.gradePolicyCard}>
                  <div className={styles.cardHeader}>
                    <h5>Grade: {gradePolicy.grade}</h5>
                    {formData.gradePolicies.length > 1 && (
                      <button 
                        type="button" 
                        className={styles.dangerBtn}
                        onClick={() => removeGradePolicy(gradeIndex)}
                        disabled={loading}
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Company Rate ($) *</label>
                      <input 
                        type="number" 
                        step="0.01"
                        min="0"
                        value={gradePolicy.companyRate}
                        onChange={(e) => handleGradePolicyChange(gradeIndex, 'companyRate', e.target.value)}
                        required
                        disabled={loading}
                        placeholder="0.00"
                      />
                    </div>
                    
                    <div className={styles.formGroup}>
                      <label>Own Rate ($) *</label>
                      <input 
                        type="number" 
                        step="0.01"
                        min="0"
                        value={gradePolicy.ownRate}
                        onChange={(e) => handleGradePolicyChange(gradeIndex, 'ownRate', e.target.value)}
                        required
                        disabled={loading}
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Overnight Rule *</label>
                    <textarea 
                      value={gradePolicy.overnightRule}
                      onChange={(e) => handleGradePolicyChange(gradeIndex, 'overnightRule', e.target.value)}
                      placeholder="Rules for overnight stays (e.g., Maximum $200 per night for hotel accommodation)"
                      rows="2"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Day Trip Rule *</label>
                    <textarea 
                      value={gradePolicy.dayTripRule}
                      onChange={(e) => handleGradePolicyChange(gradeIndex, 'dayTripRule', e.target.value)}
                      placeholder="Rules for day trips (e.g., Meal allowance: $50 per day)"
                      rows="2"
                      required
                      disabled={loading}
                    />
                  </div>

                  {/* Travel Modes Section */}
                  <div className={styles.travelModesSection}>
                    <div className={styles.sectionHeader}>
                      <h6>Travel Modes</h6>
                      <button 
                        type="button" 
                        className={styles.secondaryBtn}
                        onClick={() => addTravelMode(gradeIndex)}
                        disabled={loading}
                      >
                        <FaPlus /> Add Travel Mode
                      </button>
                    </div>

                    {gradePolicy.travelModes.map((travelMode, modeIndex) => (
                      <div key={modeIndex} className={styles.travelModeCard}>
                        <div className={styles.formRow}>
                          <div className={styles.formGroup}>
                            <label>Mode Name *</label>
                            <select 
                              value={travelMode.modeName}
                              onChange={(e) => handleTravelModeChange(gradeIndex, modeIndex, 'modeName', e.target.value)}
                              required
                              disabled={loading}
                            >
                              <option value="">Select Mode</option>
                              <option value="Flight">Flight</option>
                              <option value="Train">Train</option>
                              <option value="Bus">Bus</option>
                              <option value="Taxi">Taxi</option>
                              <option value="Rental Car">Rental Car</option>
                              <option value="Hotel">Hotel</option>
                            </select>
                          </div>
                          
                          <div className={styles.formGroup}>
                            <label>Allowed Class *</label>
                            <select 
                              value={travelMode.allowedClasses[0] || ''}
                              onChange={(e) => handleTravelModeChange(gradeIndex, modeIndex, 'allowedClasses', e.target.value)}
                              required
                              disabled={loading}
                            >
                              <option value="">Select Class</option>
                              <option value="Economy">Economy</option>
                              <option value="Business">Business</option>
                              <option value="First">First</option>
                              <option value="Standard">Standard</option>
                              <option value="Premium">Premium</option>
                              <option value="Luxury">Luxury</option>
                            </select>
                          </div>
                          
                          {gradePolicy.travelModes.length > 1 && (
                            <div className={styles.formGroup}>
                              <label>&nbsp;</label>
                              <button 
                                type="button" 
                                className={styles.dangerBtn}
                                onClick={() => removeTravelMode(gradeIndex, modeIndex)}
                                disabled={loading}
                              >
                                Remove
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className={styles.modalFooter}>
            <button 
              type="button" 
              className={styles.secondaryBtn} 
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className={styles.primaryBtn} 
              disabled={loading || categoriesLoading}
            >
              {loading ? (
                <>
                  <FaSpinner className={styles.spinner} />
                  Creating Policy...
                </>
              ) : (
                <>
                  <FaPlus className={styles.btnIcon} />
                  Create Policy
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPolicyModal;