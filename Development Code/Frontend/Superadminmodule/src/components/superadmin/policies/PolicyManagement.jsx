// components/superadmin/policies/PolicyManagement.js
import React, { useState, useEffect } from "react";
import { useSuperAdmin } from "@/contexts/SuperAdminContext";
<<<<<<< HEAD
import PolicyTable from "./PolicyTable";
import AddPolicyModal from "./AddPolicyModal";
import EditPolicyModal from "./EditPolicyModal";
import {
  FaPlus,
  FaSearch,
  FaSync,
  FaFilter,
  FaDownload,
  FaTimes,
  FaChevronDown,
  FaChevronUp,
  FaPrint,
  FaEye,
} from "react-icons/fa";
import styles from "./policy.module.css";

// ViewPolicyModal Component
const ViewPolicyModal = ({ policy, onClose }) => {
  const [selectedGrade, setSelectedGrade] = useState("");
=======
import PolicyTable from './PolicyTable';
import AddPolicyModal from './AddPolicyModal';
import EditPolicyModal from './EditPolicyModal';
import { FaPlus, FaSearch, FaSync, FaFilter, FaDownload, FaTimes, FaChevronDown, FaChevronUp, FaPrint, FaEye } from 'react-icons/fa';
import styles from './policy.module.css';

// ViewPolicyModal Component
const ViewPolicyModal = ({ policy, onClose }) => {
  const [selectedGrade, setSelectedGrade] = useState('');
>>>>>>> upstream/main
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    rules: true,
    travel: true,
<<<<<<< HEAD
    metadata: true,
  });

  // Get available grades from the policy
  const availableGrades = policy?.gradePolicies?.map((gp) => gp.grade) || [];
=======
    metadata: true
  });

  // Get available grades from the policy
  const availableGrades = policy?.gradePolicies?.map(gp => gp.grade) || [];
>>>>>>> upstream/main

  // Auto-select first grade if available
  React.useEffect(() => {
    if (availableGrades.length > 0 && !selectedGrade) {
      setSelectedGrade(availableGrades[0]);
    }
  }, [availableGrades, selectedGrade]);

  // Get selected grade policy
<<<<<<< HEAD
  const selectedGradePolicy = policy?.gradePolicies?.find(
    (gp) => gp.grade === selectedGrade
  );

  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
=======
  const selectedGradePolicy = policy?.gradePolicies?.find(gp => gp.grade === selectedGrade);

  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
>>>>>>> upstream/main
    }));
  };

  // Print policy details
  const handlePrint = () => {
    window.print();
  };

  // Download as text file
  const handleDownload = () => {
    const policyDetails = `
Policy: ${policy.category?.name} - ${policy.year}
Grade: ${selectedGrade}
<<<<<<< HEAD
Status: ${policy.active ? "Active" : "Inactive"}
=======
Status: ${policy.active ? 'Active' : 'Inactive'}
>>>>>>> upstream/main

Company Rate: $${selectedGradePolicy?.companyRate}
Own Rate: $${selectedGradePolicy?.ownRate}

Overnight Rule: ${selectedGradePolicy?.overnightRule}
Day Trip Rule: ${selectedGradePolicy?.dayTripRule}

Travel Modes:
<<<<<<< HEAD
${selectedGradePolicy?.travelModes
  ?.map((tm) => `- ${tm.modeName}: ${tm.allowedClasses?.join(", ")}`)
  .join("\n")}
    `;

    const blob = new Blob([policyDetails], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
=======
${selectedGradePolicy?.travelModes?.map(tm => `- ${tm.modeName}: ${tm.allowedClasses?.join(', ')}`).join('\n')}
    `;
    
    const blob = new Blob([policyDetails], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
>>>>>>> upstream/main
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
<<<<<<< HEAD
      <div
        className={styles.modal}
        style={{ maxWidth: "900px", maxHeight: "90vh" }}
      >
=======
      <div className={styles.modal} style={{ maxWidth: '900px', maxHeight: '90vh' }}>
>>>>>>> upstream/main
        <div className={styles.modalHeader}>
          <div className={styles.modalTitle}>
            <h3>Policy Details</h3>
            <div className={styles.policyInfo}>
<<<<<<< HEAD
              <span className={styles.policyCategory}>
                {policy.category?.name}
              </span>
              <span className={styles.policyYear}>{policy.year}</span>
              <span
                className={`${styles.statusBadge} ${
                  policy.active ? styles.active : styles.inactive
                }`}
              >
                {policy.active ? "Active" : "Inactive"}
=======
              <span className={styles.policyCategory}>{policy.category?.name}</span>
              <span className={styles.policyYear}>{policy.year}</span>
              <span className={`${styles.statusBadge} ${policy.active ? styles.active : styles.inactive}`}>
                {policy.active ? 'Active' : 'Inactive'}
>>>>>>> upstream/main
              </span>
            </div>
          </div>
          <div className={styles.modalActions}>
<<<<<<< HEAD
            <button
=======
            <button 
>>>>>>> upstream/main
              className={styles.iconBtn}
              onClick={handlePrint}
              title="Print Policy"
            >
              <FaPrint />
            </button>
<<<<<<< HEAD
            <button
=======
            <button 
>>>>>>> upstream/main
              className={styles.iconBtn}
              onClick={handleDownload}
              title="Download Policy"
            >
              <FaDownload />
            </button>
<<<<<<< HEAD
            <button className={styles.closeBtn} onClick={onClose}>
=======
            <button 
              className={styles.closeBtn}
              onClick={onClose}
            >
>>>>>>> upstream/main
              <FaTimes />
            </button>
          </div>
        </div>

        <div className={styles.modalBody}>
          {/* Grade Selection */}
          <div className={styles.gradeSelector}>
            <label>Select Grade to View:</label>
            <div className={styles.gradeButtons}>
<<<<<<< HEAD
              {availableGrades.map((grade) => (
                <button
                  key={grade}
                  className={`${styles.gradeBtn} ${
                    selectedGrade === grade ? styles.active : ""
                  }`}
=======
              {availableGrades.map(grade => (
                <button
                  key={grade}
                  className={`${styles.gradeBtn} ${selectedGrade === grade ? styles.active : ''}`}
>>>>>>> upstream/main
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
<<<<<<< HEAD
                <div
                  className={styles.sectionHeader}
                  onClick={() => toggleSection("basic")}
=======
                <div 
                  className={styles.sectionHeader}
                  onClick={() => toggleSection('basic')}
>>>>>>> upstream/main
                >
                  <h4>Basic Information - Grade {selectedGrade}</h4>
                  {expandedSections.basic ? <FaChevronUp /> : <FaChevronDown />}
                </div>
                {expandedSections.basic && (
                  <div className={styles.sectionContent}>
                    <div className={styles.detailGrid}>
                      <div className={styles.detailItem}>
                        <label>Company Rate:</label>
<<<<<<< HEAD
                        <span className={styles.rateValue}>
                          ${selectedGradePolicy.companyRate}
                        </span>
                      </div>
                      <div className={styles.detailItem}>
                        <label>Own Rate:</label>
                        <span className={styles.rateValue}>
                          ${selectedGradePolicy.ownRate}
                        </span>
=======
                        <span className={styles.rateValue}>${selectedGradePolicy.companyRate}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <label>Own Rate:</label>
                        <span className={styles.rateValue}>${selectedGradePolicy.ownRate}</span>
>>>>>>> upstream/main
                      </div>
                      <div className={styles.detailItem}>
                        <label>Total Coverage:</label>
                        <span className={styles.rateValue}>
<<<<<<< HEAD
                          $
                          {(
                            selectedGradePolicy.companyRate +
                            selectedGradePolicy.ownRate
                          ).toFixed(2)}
=======
                          ${(selectedGradePolicy.companyRate + selectedGradePolicy.ownRate).toFixed(2)}
>>>>>>> upstream/main
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Rules */}
              <div className={styles.detailSection}>
<<<<<<< HEAD
                <div
                  className={styles.sectionHeader}
                  onClick={() => toggleSection("rules")}
=======
                <div 
                  className={styles.sectionHeader}
                  onClick={() => toggleSection('rules')}
>>>>>>> upstream/main
                >
                  <h4>Rules & Guidelines</h4>
                  {expandedSections.rules ? <FaChevronUp /> : <FaChevronDown />}
                </div>
                {expandedSections.rules && (
                  <div className={styles.sectionContent}>
                    <div className={styles.ruleItem}>
                      <label>Overnight Stay Rules:</label>
<<<<<<< HEAD
                      <div className={styles.ruleText}>
                        {selectedGradePolicy.overnightRule}
                      </div>
                    </div>
                    <div className={styles.ruleItem}>
                      <label>Day Trip Rules:</label>
                      <div className={styles.ruleText}>
                        {selectedGradePolicy.dayTripRule}
                      </div>
=======
                      <div className={styles.ruleText}>{selectedGradePolicy.overnightRule}</div>
                    </div>
                    <div className={styles.ruleItem}>
                      <label>Day Trip Rules:</label>
                      <div className={styles.ruleText}>{selectedGradePolicy.dayTripRule}</div>
>>>>>>> upstream/main
                    </div>
                  </div>
                )}
              </div>

              {/* Travel Modes */}
              <div className={styles.detailSection}>
<<<<<<< HEAD
                <div
                  className={styles.sectionHeader}
                  onClick={() => toggleSection("travel")}
                >
                  <h4>Allowed Travel Modes</h4>
                  {expandedSections.travel ? (
                    <FaChevronUp />
                  ) : (
                    <FaChevronDown />
                  )}
=======
                <div 
                  className={styles.sectionHeader}
                  onClick={() => toggleSection('travel')}
                >
                  <h4>Allowed Travel Modes</h4>
                  {expandedSections.travel ? <FaChevronUp /> : <FaChevronDown />}
>>>>>>> upstream/main
                </div>
                {expandedSections.travel && (
                  <div className={styles.sectionContent}>
                    <div className={styles.travelModes}>
<<<<<<< HEAD
                      {selectedGradePolicy.travelModes?.map(
                        (travelMode, index) => (
                          <div key={index} className={styles.travelModeCard}>
                            <div className={styles.travelModeHeader}>
                              <span className={styles.modeName}>
                                {travelMode.modeName}
                              </span>
                            </div>
                            <div className={styles.allowedClasses}>
                              <label>Allowed Classes:</label>
                              <div className={styles.classTags}>
                                {travelMode.allowedClasses?.map(
                                  (className, idx) => (
                                    <span key={idx} className={styles.classTag}>
                                      {className}
                                    </span>
                                  )
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      )}
=======
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
>>>>>>> upstream/main
                    </div>
                  </div>
                )}
              </div>

              {/* Policy Metadata */}
              <div className={styles.detailSection}>
<<<<<<< HEAD
                <div
                  className={styles.sectionHeader}
                  onClick={() => toggleSection("metadata")}
                >
                  <h4>Policy Information</h4>
                  {expandedSections.metadata ? (
                    <FaChevronUp />
                  ) : (
                    <FaChevronDown />
                  )}
=======
                <div 
                  className={styles.sectionHeader}
                  onClick={() => toggleSection('metadata')}
                >
                  <h4>Policy Information</h4>
                  {expandedSections.metadata ? <FaChevronUp /> : <FaChevronDown />}
>>>>>>> upstream/main
                </div>
                {expandedSections.metadata && (
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
<<<<<<< HEAD
                        <span>
                          {policy.category?.description ||
                            "No description available"}
                        </span>
=======
                        <span>{policy.category?.description || 'No description available'}</span>
>>>>>>> upstream/main
                      </div>
                      <div className={styles.metadataItem}>
                        <label>Year:</label>
                        <span>{policy.year}</span>
                      </div>
                      <div className={styles.metadataItem}>
                        <label>Status:</label>
<<<<<<< HEAD
                        <span
                          className={`${styles.statusBadge} ${
                            policy.active ? styles.active : styles.inactive
                          }`}
                        >
                          {policy.active ? "Active" : "Inactive"}
=======
                        <span className={`${styles.statusBadge} ${policy.active ? styles.active : styles.inactive}`}>
                          {policy.active ? 'Active' : 'Inactive'}
>>>>>>> upstream/main
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
<<<<<<< HEAD
          <button className={styles.primaryBtn} onClick={onClose}>
=======
          <button 
            className={styles.primaryBtn}
            onClick={onClose}
          >
>>>>>>> upstream/main
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Main PolicyManagement Component
const PolicyManagement = () => {
  const { state, actions } = useSuperAdmin();
  const { policies, loading } = state;
<<<<<<< HEAD

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
=======
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
>>>>>>> upstream/main
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [viewingPolicy, setViewingPolicy] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  // eslint-disable-next-line no-unused-vars
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    loadPolicies();
  }, [currentPage, statusFilter]);

  const loadPolicies = async () => {
    try {
      await actions.loadPolicies({
        page: currentPage,
<<<<<<< HEAD
        status: statusFilter !== "all" ? statusFilter : undefined,
      });
    } catch (error) {
      console.error("Error loading policies:", error);
    }
  };

  const filteredPolicies = policies.filter((policy) => {
    if (statusFilter !== "all") {
      const shouldBeActive = statusFilter === "true";
=======
        status: statusFilter !== 'all' ? statusFilter : undefined
      });
    } catch (error) {
      console.error('Error loading policies:', error);
    }
  };

  const filteredPolicies = policies.filter(policy => {
    if (statusFilter !== 'all') {
      const shouldBeActive = statusFilter === 'true';
>>>>>>> upstream/main
      if (policy.active !== shouldBeActive) {
        return false;
      }
    }
<<<<<<< HEAD

    return (
      policy.category?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      policy.year?.toString().includes(searchTerm) ||
      (policy.gradePolicies || []).some((gp) =>
=======
    
    return (
      policy.category?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      policy.year?.toString().includes(searchTerm) ||
      (policy.gradePolicies || []).some(gp => 
>>>>>>> upstream/main
        gp.grade?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  });

  const handleRefresh = () => {
<<<<<<< HEAD
    console.log("🔄 Manually refreshing policies...");
=======
    console.log('🔄 Manually refreshing policies...');
>>>>>>> upstream/main
    setCurrentPage(1);
    loadPolicies();
  };

  const handleAddPolicy = async (policyData) => {
    try {
      await actions.createPolicy(policyData);
      setShowAddModal(false);
<<<<<<< HEAD
      alert("Policy created successfully!");
=======
      alert('Policy created successfully!');
>>>>>>> upstream/main
    } catch (error) {
      alert(`Error creating policy: ${error.message}`);
      throw error;
    }
  };

  const handleEditPolicy = (policy) => {
<<<<<<< HEAD
    console.log("✏️ Editing policy:", policy);
=======
    console.log('✏️ Editing policy:', policy);
>>>>>>> upstream/main
    setEditingPolicy(policy);
    setShowEditModal(true);
  };

  const handleViewPolicy = (policy) => {
<<<<<<< HEAD
    console.log("👁️ Viewing policy:", policy);
=======
    console.log('👁️ Viewing policy:', policy);
>>>>>>> upstream/main
    setViewingPolicy(policy);
    setShowViewModal(true);
  };

  const handleUpdatePolicy = async (policyData, policyId) => {
    try {
      await actions.updatePolicy(policyId, policyData);
      setShowEditModal(false);
      setEditingPolicy(null);
      await loadPolicies();
<<<<<<< HEAD
      alert("Policy updated successfully!");
=======
      alert('Policy updated successfully!');
>>>>>>> upstream/main
    } catch (error) {
      alert(`Error updating policy: ${error.message}`);
      throw error;
    }
  };

  const handleStatusChange = async (policyId, newStatus) => {
    try {
      await actions.updatePolicyStatus(policyId, newStatus);
      await loadPolicies();
    } catch (error) {
      alert(`Error updating policy status: ${error.message}`);
    }
  };

  const handleDeletePolicy = async (policyId, policyName) => {
<<<<<<< HEAD
    if (
      confirm(
        `Are you sure you want to delete policy for ${policyName}? This action cannot be undone.`
      )
    ) {
=======
    if (confirm(`Are you sure you want to delete policy for ${policyName}? This action cannot be undone.`)) {
>>>>>>> upstream/main
      try {
        await actions.deletePolicy(policyId);
        await loadPolicies();
      } catch (error) {
        alert(`Error deleting policy: ${error.message}`);
      }
    }
  };

<<<<<<< HEAD
  const activePoliciesCount = policies.filter((policy) => policy.active).length;
  const inactivePoliciesCount = policies.filter(
    (policy) => !policy.active
  ).length;
=======
  const activePoliciesCount = policies.filter(policy => policy.active).length;
  const inactivePoliciesCount = policies.filter(policy => !policy.active).length;
>>>>>>> upstream/main

  return (
    <>
      {/* Main Content */}
<<<<<<< HEAD
      <div className={styles.containerpolicy}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className="info" style={{width:"40%"}}>
               <h3>Travel Policy Management</h3>
              <p>Streamline workforce data and maintain Policy records efficiently.</p>
=======
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3>Travel Policy Management</h3>
            <div className={styles.headerActions}>
              <div className={styles.searchBox}>
                <FaSearch className={styles.searchIcon} />
                <input 
                  type="text" 
                  placeholder="Search policies by category, year, or grade..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="all">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>

              <button className={styles.secondaryBtn} onClick={handleRefresh}>
                <FaSync className={styles.btnIcon} />
                Refresh
              </button>

              <button 
                className={styles.primaryBtn} 
                onClick={() => setShowAddModal(true)}
              >
                <FaPlus className={styles.btnIcon} />
                Create Policy
              </button>
            </div>
          </div>
          
          <div className={styles.cardBody}>
            <div className={styles.statsContainer}>
              <div className={styles.statCard}>
                <span className={styles.statNumber}>{policies.length}</span>
                <span className={styles.statLabel}>Total Policies</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statNumber}>{activePoliciesCount}</span>
                <span className={styles.statLabel}>Active Policies</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statNumber}>{inactivePoliciesCount}</span>
                <span className={styles.statLabel}>Inactive Policies</span>
              </div>
>>>>>>> upstream/main
            </div>
            <div className={styles.headerActions}>
              <div className={styles.searchBox}>
                <FaSearch className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search policies by category, year, or grade..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

<<<<<<< HEAD
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="all">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>

              <button className={styles.secondaryBtn} onClick={handleRefresh}>
                <FaSync className={styles.btnIcon} />
                Refresh
              </button>

              <button
                className={styles.primaryBtn}
                onClick={() => setShowAddModal(true)}
              >
                <FaPlus className={styles.btnIcon} />
                Create Policy
              </button>
            </div>
          </div>

          <div className={styles.cardBody}>
            <div className={styles.statsContainer}>
              <div className={styles.statCard}>
                <span className={styles.statNumber}>{policies.length}</span>
                <span className={styles.statLabel}>Total Policies</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statNumber}>{activePoliciesCount}</span>
                <span className={styles.statLabel}>Active Policies</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statNumber}>
                  {inactivePoliciesCount}
                </span>
                <span className={styles.statLabel}>Inactive Policies</span>
              </div>
            </div>

            <PolicyTable
              policies={filteredPolicies}
=======
            <PolicyTable 
              policies={filteredPolicies} 
>>>>>>> upstream/main
              loading={loading && policies.length === 0}
              onEdit={handleEditPolicy}
              onView={handleViewPolicy}
              onStatusChange={handleStatusChange}
              onDelete={handleDeletePolicy}
            />
<<<<<<< HEAD

            <div className={styles.pagination}>
              <button
                className={styles.paginationBtn}
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
              >
                Previous
              </button>
              {/* <span className={styles.paginationInfo}>
                Page {currentPage} - Showing {filteredPolicies.length} of{" "}
                {policies.length} policies
              </span> */}
              <button
                className={styles.paginationBtn}
                onClick={() => setCurrentPage((prev) => prev + 1)}
              >
=======
            
            <div className={styles.pagination}>
              <button 
                className={styles.paginationBtn}
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
              >
                Previous
              </button>
              <span className={styles.paginationInfo}>
                Page {currentPage} - Showing {filteredPolicies.length} of {policies.length} policies
              </span>
              <button 
                className={styles.paginationBtn}
                onClick={() => setCurrentPage(prev => prev + 1)}
              >
>>>>>>> upstream/main
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals - Separate from main content for proper overlay */}
      {showAddModal && (
        <AddPolicyModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAddPolicy}
        />
      )}

      {showEditModal && editingPolicy && (
<<<<<<< HEAD
        <EditPolicyModal
=======
        <EditPolicyModal 
>>>>>>> upstream/main
          policy={editingPolicy}
          onClose={() => {
            setShowEditModal(false);
            setEditingPolicy(null);
          }}
          onUpdate={handleUpdatePolicy}
        />
      )}

      {showViewModal && viewingPolicy && (
<<<<<<< HEAD
        <ViewPolicyModal
=======
        <ViewPolicyModal 
>>>>>>> upstream/main
          policy={viewingPolicy}
          onClose={() => {
            setShowViewModal(false);
            setViewingPolicy(null);
          }}
        />
      )}
    </>
  );
};

export default PolicyManagement;
