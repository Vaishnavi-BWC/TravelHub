// components/superadmin/policies/EditPolicyModal.js
import React, { useState, useEffect } from 'react';
import { useSuperAdmin } from "@/contexts/SuperAdminContext";
import { FaTimes, FaSave, FaSpinner, FaPlus, FaChevronDown } from 'react-icons/fa';
import styles from '../superadmin.module.css';

const EditPolicyModal = ({ policy, onClose, onUpdate }) => {
  const { state, actions } = useSuperAdmin();
  
  const [selectedGrade, setSelectedGrade] = useState('');
  const [formData, setFormData] = useState({
    companyRate: 0,
    ownRate: 0,
    overnightRule: '',
    dayTripRule: '',
    travelModes: []
  });
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Get available grades from the policy
  const availableGrades = policy?.gradePolicies?.map(gp => gp.grade) || [];

  // When grade is selected or policy changes, populate form data
  useEffect(() => {
    if (selectedGrade && policy) {
      const gradePolicy = policy.gradePolicies.find(gp => gp.grade === selectedGrade);
      if (gradePolicy) {
        setFormData({
          companyRate: gradePolicy.companyRate || 0,
          ownRate: gradePolicy.ownRate || 0,
          overnightRule: gradePolicy.overnightRule || '',
          dayTripRule: gradePolicy.dayTripRule || '',
          travelModes: gradePolicy.travelModes || []
        });
      }
    }
  }, [selectedGrade, policy]);

  // Auto-select first grade if available
  useEffect(() => {
    if (availableGrades.length > 0 && !selectedGrade) {
      setSelectedGrade(availableGrades[0]);
    }
  }, [availableGrades, selectedGrade]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('Rate') ? parseFloat(value) || 0 : value
    }));
  };

  const handleTravelModeChange = (modeIndex, field, value) => {
    const updatedTravelModes = [...formData.travelModes];
    
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
    
    setFormData(prev => ({
      ...prev,
      travelModes: updatedTravelModes
    }));
  };

  const addTravelMode = () => {
    setFormData(prev => ({
      ...prev,
      travelModes: [
        ...prev.travelModes,
        {
          modeName: 'Flight',
          allowedClasses: ['Economy']
        }
      ]
    }));
  };

  const removeTravelMode = (modeIndex) => {
    if (formData.travelModes.length > 1) {
      const updatedTravelModes = formData.travelModes.filter((_, i) => i !== modeIndex);
      setFormData(prev => ({
        ...prev,
        travelModes: updatedTravelModes
      }));
    }
  };

  const validateForm = () => {
    if (!formData.companyRate && formData.companyRate !== 0) {
      alert('Please enter company rate');
      return false;
    }

    if (!formData.ownRate && formData.ownRate !== 0) {
      alert('Please enter own rate');
      return false;
    }

    if (!formData.overnightRule.trim()) {
      alert('Please enter overnight rule');
      return false;
    }

    if (!formData.dayTripRule.trim()) {
      alert('Please enter day trip rule');
      return false;
    }

    // Validate travel modes
    for (let i = 0; i < formData.travelModes.length; i++) {
      const tm = formData.travelModes[i];
      if (!tm.modeName || !tm.allowedClasses || tm.allowedClasses.length === 0) {
        alert(`Please fill in all travel mode fields`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!selectedGrade) {
      alert('Please select a grade');
      return;
    }

    setSaving(true);
    
    try {
      console.log('✏️ Updating grade policy:', { 
        policyId: policy.id, 
        grade: selectedGrade, 
        formData 
      });
      
      // Use the new grade-specific update method
      await actions.updatePolicyGrade(policy.id, selectedGrade, formData);
      
      onClose();
      alert(`Grade ${selectedGrade} updated successfully!`);
      
    } catch (error) {
      console.error('Error updating grade policy:', error);
      alert(`Error updating grade policy: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (!policy) {
    return null;
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal} style={{ maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div className={styles.modalHeader}>
          <h3>Edit Policy Grade - {policy.category?.name} ({policy.year})</h3>
          <button 
            type="button" 
            className={styles.closeBtn} 
            onClick={onClose}
            disabled={saving}
          >
            <FaTimes />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className={styles.modalBody}>
            {/* Grade Selection */}
            <div className={styles.formGroup}>
              <label>Select Grade *</label>
              <select 
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                required
                disabled={saving}
                className={styles.selectInput}
              >
                <option value="">Select Grade</option>
                {availableGrades.map(grade => (
                  <option key={grade} value={grade}>
                    Grade {grade}
                  </option>
                ))}
              </select>
            </div>

            {selectedGrade && (
              <>
                {/* Basic Information */}
                <div className={styles.section}>
                  <h4>Grade {selectedGrade} Settings</h4>
                  
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Company Rate ($) *</label>
                      <input 
                        type="number" 
                        name="companyRate"
                        step="0.01"
                        min="0"
                        value={formData.companyRate}
                        onChange={handleInputChange}
                        required
                        disabled={saving}
                        placeholder="0.00"
                      />
                    </div>
                    
                    <div className={styles.formGroup}>
                      <label>Own Rate ($) *</label>
                      <input 
                        type="number" 
                        name="ownRate"
                        step="0.01"
                        min="0"
                        value={formData.ownRate}
                        onChange={handleInputChange}
                        required
                        disabled={saving}
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Overnight Rule *</label>
                    <textarea 
                      name="overnightRule"
                      value={formData.overnightRule}
                      onChange={handleInputChange}
                      placeholder="Rules for overnight stays"
                      rows="3"
                      required
                      disabled={saving}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Day Trip Rule *</label>
                    <textarea 
                      name="dayTripRule"
                      value={formData.dayTripRule}
                      onChange={handleInputChange}
                      placeholder="Rules for day trips"
                      rows="3"
                      required
                      disabled={saving}
                    />
                  </div>
                </div>

                {/* Travel Modes Section */}
                <div className={styles.section}>
                  <div className={styles.sectionHeader}>
                    <h4>Travel Modes</h4>
                    <button 
                      type="button" 
                      className={styles.secondaryBtn}
                      onClick={addTravelMode}
                      disabled={saving}
                    >
                      <FaPlus /> Add Travel Mode
                    </button>
                  </div>

                  {formData.travelModes.map((travelMode, modeIndex) => (
                    <div key={modeIndex} className={styles.travelModeCard}>
                      <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                          <label>Mode Name *</label>
                          <select 
                            value={travelMode.modeName}
                            onChange={(e) => handleTravelModeChange(modeIndex, 'modeName', e.target.value)}
                            required
                            disabled={saving}
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
                            onChange={(e) => handleTravelModeChange(modeIndex, 'allowedClasses', e.target.value)}
                            required
                            disabled={saving}
                          >
                            <option value="">Select Class</option>
                            <option value="Economy">Economy</option>
                            <option value="Business">Business</option>
                            <option value="First">First</option>
                            <option value="Standard">Standard</option>
                            <option value="Premium">Premium</option>
                            <option value="Luxury">Luxury</option>
                            <option value="AC 1 TIER">AC 1 Tier</option>
                            <option value="AC 2 TIER">AC 2 Tier</option>
                            <option value="AC 3 TIER">AC 3 Tier</option>
                            <option value="SLEEPER">Sleeper</option>
                          </select>
                        </div>
                        
                        {formData.travelModes.length > 1 && (
                          <div className={styles.formGroup}>
                            <label>&nbsp;</label>
                            <button 
                              type="button" 
                              className={styles.dangerBtn}
                              onClick={() => removeTravelMode(modeIndex)}
                              disabled={saving}
                            >
                              Remove
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
          
          <div className={styles.modalFooter}>
            <button 
              type="button" 
              className={styles.secondaryBtn} 
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className={styles.primaryBtn} 
              disabled={saving || !selectedGrade}
            >
              {saving ? (
                <>
                  <FaSpinner className={styles.spinner} />
                  Updating Grade...
                </>
              ) : (
                <>
                  <FaSave className={styles.btnIcon} />
                  Update Grade {selectedGrade}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPolicyModal;