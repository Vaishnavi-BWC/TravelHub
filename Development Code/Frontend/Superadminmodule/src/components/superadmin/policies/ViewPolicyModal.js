// components/superadmin/policies/ViewPolicyModal.js
import React, { useState } from 'react';
import { FaTimes, FaChevronDown, FaChevronUp, FaPrint, FaDownload } from 'react-icons/fa';

const ViewPolicyModal = ({ policy, onClose }) => {
  const [selectedGrade, setSelectedGrade] = useState('');
  const [expandedSections, setExpandedSections] = useState({});

  // Get available grades from the policy
  const availableGrades = policy?.gradePolicies?.map(gp => gp.grade) || [];

  // Auto-select first grade if available
  React.useEffect(() => {
    if (availableGrades.length > 0 && !selectedGrade) {
      setSelectedGrade(availableGrades[0]);
    }
  }, [availableGrades, selectedGrade]);

  // Get selected grade policy
  const selectedGradePolicy = policy?.gradePolicies?.find(gp => gp.grade === selectedGrade);

  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Print policy details
  const handlePrint = () => {
    window.print();
  };

  // Download as PDF (placeholder - you can implement actual PDF generation)
  const handleDownload = () => {
    const policyDetails = `
Policy: ${policy.category?.name} - ${policy.year}
Grade: ${selectedGrade}
Status: ${policy.active ? 'Active' : 'Inactive'}

Company Rate: $${selectedGradePolicy?.companyRate}
Own Rate: $${selectedGradePolicy?.ownRate}

Overnight Rule: ${selectedGradePolicy?.overnightRule}
Day Trip Rule: ${selectedGradePolicy?.dayTripRule}

Travel Modes:
${selectedGradePolicy?.travelModes?.map(tm => `- ${tm.modeName}: ${tm.allowedClasses?.join(', ')}`).join('\n')}
    `;
    
    const blob = new Blob([policyDetails], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `policy-${policy.category?.name}-${policy.year}-${selectedGrade}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!policy) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal} style={{ maxWidth: '900px', maxHeight: '90vh' }}>
        <div className={styles.modalHeader}>
          <div className={styles.modalTitle}>
            <h3>Policy Details</h3>
            <div className={styles.policyInfo}>
              <span className={styles.policyCategory}>{policy.category?.name}</span>
              <span className={styles.policyYear}>{policy.year}</span>
              <span className={`${styles.statusBadge} ${policy.active ? styles.active : styles.inactive}`}>
                {policy.active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
          <div className={styles.modalActions}>
            <button 
              className={styles.iconBtn}
              onClick={handlePrint}
              title="Print Policy"
            >
              <FaPrint />
            </button>
            <button 
              className={styles.iconBtn}
              onClick={handleDownload}
              title="Download Policy"
            >
              <FaDownload />
            </button>
            <button 
              className={styles.closeBtn}
              onClick={onClose}
            >
              <FaTimes />
            </button>
          </div>
        </div>

        <div className={styles.modalBody}>
          {/* Grade Selection */}
          <div className={styles.gradeSelector}>
            <label>Select Grade to View:</label>
            <div className={styles.gradeButtons}>
              {availableGrades.map(grade => (
                <button
                  key={grade}
                  className={`${styles.gradeBtn} ${selectedGrade === grade ? styles.active : ''}`}
                  onClick={() => setSelectedGrade(grade)}
                >
                  Grade {grade}
                </button>
              ))}
            </div>
          </div>

          {selectedGradePolicy && (
            <div className={styles.policyDetails}>
              {/* Basic Information */}
              <div className={styles.detailSection}>
                <div 
                  className={styles.sectionHeader}
                  onClick={() => toggleSection('basic')}
                >
                  <h4>Basic Information - Grade {selectedGrade}</h4>
                  {expandedSections.basic ? <FaChevronUp /> : <FaChevronDown />}
                </div>
                {expandedSections.basic !== false && (
                  <div className={styles.sectionContent}>
                    <div className={styles.detailGrid}>
                      <div className={styles.detailItem}>
                        <label>Company Rate:</label>
                        <span className={styles.rateValue}>${selectedGradePolicy.companyRate}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <label>Own Rate:</label>
                        <span className={styles.rateValue}>${selectedGradePolicy.ownRate}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <label>Total Coverage:</label>
                        <span className={styles.rateValue}>
                          ${(selectedGradePolicy.companyRate + selectedGradePolicy.ownRate).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Rules */}
              <div className={styles.detailSection}>
                <div 
                  className={styles.sectionHeader}
                  onClick={() => toggleSection('rules')}
                >
                  <h4>Rules & Guidelines</h4>
                  {expandedSections.rules ? <FaChevronUp /> : <FaChevronDown />}
                </div>
                {expandedSections.rules !== false && (
                  <div className={styles.sectionContent}>
                    <div className={styles.ruleItem}>
                      <label>Overnight Stay Rules:</label>
                      <div className={styles.ruleText}>{selectedGradePolicy.overnightRule}</div>
                    </div>
                    <div className={styles.ruleItem}>
                      <label>Day Trip Rules:</label>
                      <div className={styles.ruleText}>{selectedGradePolicy.dayTripRule}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Travel Modes */}
              <div className={styles.detailSection}>
                <div 
                  className={styles.sectionHeader}
                  onClick={() => toggleSection('travel')}
                >
                  <h4>Allowed Travel Modes</h4>
                  {expandedSections.travel ? <FaChevronUp /> : <FaChevronDown />}
                </div>
                {expandedSections.travel !== false && (
                  <div className={styles.sectionContent}>
                    <div className={styles.travelModes}>
                      {selectedGradePolicy.travelModes?.map((travelMode, index) => (
                        <div key={index} className={styles.travelModeCard}>
                          <div className={styles.travelModeHeader}>
                            <span className={styles.modeName}>{travelMode.modeName}</span>
                          </div>
                          <div className={styles.allowedClasses}>
                            <label>Allowed Classes:</label>
                            <div className={styles.classTags}>
                              {travelMode.allowedClasses?.map((className, idx) => (
                                <span key={idx} className={styles.classTag}>
                                  {className}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Policy Metadata */}
              <div className={styles.detailSection}>
                <div 
                  className={styles.sectionHeader}
                  onClick={() => toggleSection('metadata')}
                >
                  <h4>Policy Information</h4>
                  {expandedSections.metadata ? <FaChevronUp /> : <FaChevronDown />}
                </div>
                {expandedSections.metadata !== false && (
                  <div className={styles.sectionContent}>
                    <div className={styles.metadataGrid}>
                      <div className={styles.metadataItem}>
                        <label>Policy ID:</label>
                        <span className={styles.policyId}>{policy.id}</span>
                      </div>
                      <div className={styles.metadataItem}>
                        <label>Category:</label>
                        <span>{policy.category?.name}</span>
                      </div>
                      <div className={styles.metadataItem}>
                        <label>Description:</label>
                        <span>{policy.category?.description || 'No description available'}</span>
                      </div>
                      <div className={styles.metadataItem}>
                        <label>Year:</label>
                        <span>{policy.year}</span>
                      </div>
                      <div className={styles.metadataItem}>
                        <label>Status:</label>
                        <span className={`${styles.statusBadge} ${policy.active ? styles.active : styles.inactive}`}>
                          {policy.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className={styles.modalFooter}>
          <button 
            className={styles.primaryBtn}
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewPolicyModal;