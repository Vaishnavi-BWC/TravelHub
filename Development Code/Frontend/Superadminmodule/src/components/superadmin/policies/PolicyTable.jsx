// components/superadmin/policies/PolicyTable.js
import React from 'react';
import { FaEdit, FaCheckCircle, FaTimesCircle, FaEye, FaTrash, FaSpinner } from 'react-icons/fa';
import styles from './policy.module.css';

const PolicyTable = ({ policies, loading, onEdit, onView, onStatusChange, onDelete, actionLoading = {} }) => {
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <span>Loading policies...</span>
      </div>
    );
  }

  const formatPolicyData = (policy) => {
    return {
      id: policy.id,
      year: policy.year,
      active: policy.active,
      categoryName: policy.category?.name || 'N/A',
      gradePolicies: policy.gradePolicies || []
    };
  };

  return (
    <div className={styles.tableContainer}>
      <table className={styles.dataTable}>
        <thead>
          <tr>
            <th>Policy ID</th>
            <th>Year</th>
            <th>Category</th>
            <th>Grades</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {policies.length === 0 ? (
            <tr>
              <td colSpan="6" className={styles.noData}>
                No policies found
              </td>
            </tr>
          ) : (
            policies.map(policy => {
              const formattedPolicy = formatPolicyData(policy);
              const isLoading = actionLoading[policy.id];
              
              return (
                <tr key={formattedPolicy.id}>
                  <td className={styles.policyId}>#{formattedPolicy.id.substring(0, 8)}...</td>
                  <td>{formattedPolicy.year}</td>
                  <td>{formattedPolicy.categoryName}</td>
                  <td>
                    {formattedPolicy.gradePolicies.length > 0 ? (
                      <span className={styles.gradeBadge}>
                        {formattedPolicy.gradePolicies.length} grade(s)
                      </span>
                    ) : (
                      'No grades'
                    )}
                  </td>
                  <td>
                    <span className={`${styles.statusBadge} ${formattedPolicy.active ? styles.active : styles.inactive}`}>
                      {formattedPolicy.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actionButtons}>
                      <button 
                        className={styles.iconBtn}
                        onClick={() => onView && onView(policy)}
                        title="View Policy Details"
                        disabled={isLoading}
                      >
                        <FaEye />
                      </button>
                      <button 
                        className={styles.iconBtn}
                        onClick={() => onEdit && onEdit(policy)}
                        title="Edit Policy"
                        disabled={isLoading}
                      >
                        <FaEdit />
                      </button>
                      <button 
                        className={styles.iconBtn}
                        onClick={() => onStatusChange && onStatusChange(policy.id, !formattedPolicy.active)}
                        title={formattedPolicy.active ? 'Deactivate Policy' : 'Activate Policy'}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <FaSpinner className={styles.spinner} />
                        ) : formattedPolicy.active ? (
                          <FaTimesCircle />
                        ) : (
                          <FaCheckCircle />
                        )}
                      </button>
                      <button 
                        className={`${styles.iconBtn} ${styles.danger}`}
                        onClick={() => onDelete && onDelete(policy.id, formattedPolicy.categoryName)}
                        title="Delete Policy"
                        disabled={isLoading}
                      >
                        {isLoading ? <FaSpinner className={styles.spinner} /> : <FaTrash />}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PolicyTable;