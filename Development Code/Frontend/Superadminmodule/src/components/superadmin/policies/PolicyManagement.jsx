// components/superadmin/policies/PolicyManagement.js
import React, { useState, useEffect } from 'react';
import { useSuperAdmin } from "@/contexts/SuperAdminContext";
import PolicyTable from './PolicyTable';
import AddPolicyModal from './AddPolicyModal';
import { FaPlus, FaSearch, FaSync, FaFilter, FaDownload, FaUpload } from 'react-icons/fa';
import styles from '../superadmin.module.css';

const PolicyManagement = () => {
  const { state, actions } = useSuperAdmin();
  const { policies, loading } = state;
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    actions.loadPolicies({
      page: currentPage,
      search: searchTerm,
      status: statusFilter !== 'all' ? statusFilter : undefined
    });
  }, [currentPage, searchTerm, statusFilter]);

  const filteredPolicies = policies.filter(policy =>
    policy.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    policy.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    policy.condition?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    policy.action?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRefresh = () => {
    actions.loadPolicies({
      page: currentPage,
      search: searchTerm,
      status: statusFilter !== 'all' ? statusFilter : undefined
    });
  };

  const handleAddPolicy = async (policyData) => {
    try {
      // If it's FormData (with file), send as is
      // If it's regular object, convert to FormData
      let submitData;
      
      if (policyData instanceof FormData) {
        submitData = policyData;
      } else {
        submitData = new FormData();
        Object.keys(policyData).forEach(key => {
          submitData.append(key, policyData[key]);
        });
      }
      
      await actions.createPolicy(submitData);
      setShowAddModal(false);
    } catch (error) {
      alert(`Error creating policy: ${error.message}`);
      throw error;
    }
  };

  const handleExportPolicies = () => {
    // Export policies as CSV
    const headers = ['Name', 'Description', 'Condition', 'Action', 'Status', 'Created At'];
    const csvContent = [
      headers.join(','),
      ...filteredPolicies.map(policy => [
        `"${policy.name}"`,
        `"${policy.description}"`,
        `"${policy.condition}"`,
        `"${policy.action}"`,
        policy.isActive ? 'Active' : 'Inactive',
        `"${policy.createdAt}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `policies-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleBulkStatusChange = async (newStatus) => {
    const selectedPolicies = filteredPolicies.filter(policy => policy.selected);
    if (selectedPolicies.length === 0) {
      alert('Please select policies to update');
      return;
    }

    if (confirm(`Are you sure you want to ${newStatus ? 'activate' : 'deactivate'} ${selectedPolicies.length} policy(s)?`)) {
      try {
        for (const policy of selectedPolicies) {
          await actions.updatePolicyStatus(policy.id, newStatus);
        }
        await actions.loadPolicies(); // Refresh the list
      } catch (error) {
        alert(`Error updating policies: ${error.message}`);
      }
    }
  };

  const activePoliciesCount = policies.filter(policy => policy.isActive).length;
  const inactivePoliciesCount = policies.filter(policy => !policy.isActive).length;

  return (
    <>
    <div className={styles.container}>
     <div className={`${styles.card} maincard`}>
        <div className={styles.cardHeader}>
          <h3>Policy Management</h3>
          <div className={styles.headerActions}>
            <div className={styles.searchBox}>
              <FaSearch className={styles.searchIcon} />
              <input 
                type="text" 
                placeholder="Search policies..." 
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
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <button className={styles.secondaryBtn} onClick={handleRefresh}>
              <FaSync className={styles.btnIcon} />
              Refresh
            </button>

            <button className={styles.secondaryBtn} onClick={handleExportPolicies}>
              <FaDownload className={styles.btnIcon} />
              Export
            </button>

            <button 
              className={styles.primaryBtn} 
              onClick={() => setShowAddModal(true)}
            >
              <FaPlus className={styles.btnIcon} />
              Add Policy
            </button>
          </div>
        </div>
        
        <div className={styles.cardBody}>
        
          {filteredPolicies.some(policy => policy.selected) && (
            <div className={styles.bulkActions}>
              <span className={styles.bulkActionsText}>
                {filteredPolicies.filter(policy => policy.selected).length} policy(s) selected
              </span>
              <button 
                className={styles.successBtn}
                onClick={() => handleBulkStatusChange(true)}
              >
                Activate Selected
              </button>
              <button 
                className={styles.warningBtn}
                onClick={() => handleBulkStatusChange(false)}
              >
                Deactivate Selected
              </button>
            </div>
          )}

          <PolicyTable 
            policies={filteredPolicies} 
            loading={loading && policies.length === 0}
          />
          
          {/* Pagination */}
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
              Next
            </button>
          </div>
        </div>
      </div>
</div>
      {showAddModal && (
        <AddPolicyModal 
          onClose={() => setShowAddModal(false)}
          onSave={handleAddPolicy}
        />
      )}
    </>
  );
};

export default PolicyManagement;