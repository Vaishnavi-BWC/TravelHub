// components/superadmin/policies/PolicyTable.js
import React, { useState } from 'react';
import { useSuperAdmin } from "@/contexts/SuperAdminContext";
import { FaEdit, FaCheckCircle, FaTimesCircle, FaEye, FaDownload, FaTrash } from 'react-icons/fa';
import styles from '../superadmin.module.css';

const PolicyTable = ({ policies, loading }) => {
  const { actions } = useSuperAdmin();
  const [selectedPolicies, setSelectedPolicies] = useState([]);

  const handleStatusChange = async (policyId, currentStatus) => {
    const newStatus = !currentStatus;
    try {
      await actions.updatePolicyStatus(policyId, newStatus);
    } catch (error) {
      alert(`Error updating policy status: ${error.message}`);
    }
  };

  const handleSelectPolicy = (policyId, isSelected) => {
    if (isSelected) {
      setSelectedPolicies(prev => [...prev, policyId]);
    } else {
      setSelectedPolicies(prev => prev.filter(id => id !== policyId));
    }
  };

  const handleSelectAll = (isSelected) => {
    if (isSelected) {
      setSelectedPolicies(policies.map(policy => policy.id));
    } else {
      setSelectedPolicies([]);
    }
  };

  const handleViewPolicy = (policy) => {
    // Open policy details modal or navigate to details page
    console.log('View policy:', policy);
    alert(`Policy Details:\n\nName: ${policy.name}\nDescription: ${policy.description}\nCondition: ${policy.condition}\nAction: ${policy.action}`);
  };

  const handleDownloadAttachment = (policy) => {
    if (policy.attachmentUrl) {
      window.open(policy.attachmentUrl, '_blank');
    } else {
      alert('No attachment available for this policy');
    }
  };

  const handleDeletePolicy = async (policyId, policyName) => {
    if (confirm(`Are you sure you want to delete policy "${policyName}"? This action cannot be undone.`)) {
      try {
        await actions.deletePolicy(policyId);
        // Policy will be removed from the list via context update
      } catch (error) {
        alert(`Error deleting policy: ${error.message}`);
      }
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <span>Loading policies...</span>
      </div>
    );
  }

  return (
    <div className={styles.tableContainer}>
      <table className={styles.dataTable}>
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                onChange={(e) => handleSelectAll(e.target.checked)}
                checked={selectedPolicies.length === policies.length && policies.length > 0}
              />
            </th>
            <th>Policy ID</th>
            <th>Policy Name</th>
            <th>Description</th>
            <th>Condition</th>
            <th>Action</th>
            <th>Status</th>
            <th>Attachment</th>
            <th>Created By</th>
            <th>Created At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {policies.length === 0 ? (
            <tr>
              <td colSpan="11" className={styles.noData}>
                No policies found
              </td>
            </tr>
          ) : (
            policies.map(policy => (
              <tr key={policy.id} className={selectedPolicies.includes(policy.id) ? styles.selectedRow : ''}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedPolicies.includes(policy.id)}
                    onChange={(e) => handleSelectPolicy(policy.id, e.target.checked)}
                  />
                </td>
                <td className={styles.policyId}>#{policy.id}</td>
                <td className={styles.policyName}>{policy.name}</td>
                <td className={styles.descriptionCell}>
                  {policy.description || 'No description'}
                </td>
                <td className={styles.conditionCell}>
                  <code>{policy.condition}</code>
                </td>
                <td className={styles.actionCell}>
                  <code>{policy.action}</code>
                </td>
                <td>
                  <span className={`${styles.statusBadge} ${policy.isActive ? styles.active : styles.inactive}`}>
                    {policy.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  {policy.attachmentUrl ? (
                    <button 
                      className={styles.iconBtn}
                      onClick={() => handleDownloadAttachment(policy)}
                      title="Download Attachment"
                    >
                      <FaDownload />
                    </button>
                  ) : (
                    <span className={styles.noAttachment}>No file</span>
                  )}
                </td>
                <td>{policy.createdBy || 'System'}</td>
                <td>{policy.createdAt || 'N/A'}</td>
                <td>
                  <div className={styles.actionButtons}>
                    <button 
                      className={styles.iconBtn}
                      onClick={() => handleViewPolicy(policy)}
                      title="View Policy Details"
                    >
                      <FaEye />
                    </button>
                    <button 
                      className={styles.iconBtn}
                      onClick={() => actions.setSelectedPolicy(policy)}
                      title="Edit Policy"
                    >
                      <FaEdit />
                    </button>
                    <button 
                      className={styles.iconBtn}
                      onClick={() => handleStatusChange(policy.id, policy.isActive)}
                      title={policy.isActive ? 'Deactivate Policy' : 'Activate Policy'}
                    >
                      {policy.isActive ? <FaTimesCircle /> : <FaCheckCircle />}
                    </button>
                    <button 
                      className={`${styles.iconBtn} ${styles.danger}`}
                      onClick={() => handleDeletePolicy(policy.id, policy.name)}
                      title="Delete Policy"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PolicyTable;