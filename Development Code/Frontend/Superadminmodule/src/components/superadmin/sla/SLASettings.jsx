import React, { useState, useEffect } from 'react';
import { useSuperAdmin } from "@/contexts/SuperAdminContext";
import styles from '../superadmin.module.css';

const SLASettings = () => {
  const { state, actions } = useSuperAdmin();
  const { slaSettings, loading } = state;
  const [settings, setSettings] = useState([]);
  const [workflowType, setWorkflowType] = useState('PRE_TRAVEL');
  const [bulkTimeLimit, setBulkTimeLimit] = useState(48);
  const [activeTab, setActiveTab] = useState('individual');

  useEffect(() => {
    loadSLASettings();
  }, [workflowType]);

  useEffect(() => {
    if (slaSettings && slaSettings.stepSettings) {
      const transformedSettings = Object.values(slaSettings.stepSettings).map(step => ({
        id: step.configId, // Use configId as the unique identifier
        role: step.approverRole,
        slaHours: step.timeLimitHours,
        autoApprove: step.autoApproveAfterTimeout,
        sequenceOrder: step.sequenceOrder,
        isActive: step.isActive,
        isMandatory: step.isMandatory,
        stepName: step.stepName,
        configId: step.configId // CORRECTED: Use the actual configId UUID from API
      }));
      setSettings(transformedSettings);
    }
  }, [slaSettings]);

  const loadSLASettings = async () => {
    await actions.loadSlaSettings(workflowType);
  };

  // Individual Step Actions
  const updateStepSLA = async (configId, timeLimitHours, autoApproveAfterTimeout) => {
    try {
      await actions.updateStepSLA(configId, {
        timeLimitHours,
        autoApproveAfterTimeout
      });
      await loadSLASettings();
      alert('Step SLA updated successfully!');
    } catch (error) {
      alert('Error updating step SLA: ' + error.message);
    }
  };

  const toggleStepActivation = async (configId, isActive) => {
    try {
      await actions.toggleStepActivation(configId, { isActive });
      await loadSLASettings();
      alert(`Step ${isActive ? 'activated' : 'deactivated'} successfully!`);
    } catch (error) {
      alert('Error toggling step activation: ' + error.message);
    }
  };

  const updateStepSequence = async (configId, newSequenceOrder) => {
    try {
      await actions.updateStepSequence(configId, { newSequenceOrder });
      await loadSLASettings();
      alert('Step sequence updated successfully!');
    } catch (error) {
      alert('Error updating step sequence: ' + error.message);
    }
  };

  // Bulk Actions
  const updateBulkSLA = async () => {
    try {
      await actions.updateBulkSLA(workflowType, { timeLimitHours: bulkTimeLimit });
      await loadSLASettings();
      alert('Bulk SLA settings updated successfully!');
    } catch (error) {
      alert('Error updating bulk SLA: ' + error.message);
    }
  };

  // Handle individual setting changes
  const handleSettingChange = (index, field, value) => {
    const newSettings = [...settings];
    
    if (field === 'slaHours') {
      newSettings[index][field] = parseInt(value) || 0;
    } else if (field === 'autoApprove') {
      newSettings[index][field] = Boolean(value);
    } else {
      newSettings[index][field] = value;
    }
    
    setSettings(newSettings);
  };

  const handleSaveIndividual = async (index) => {
    const setting = settings[index];
    await updateStepSLA(
      setting.configId, // This should now be the UUID like "fb4269bf-986f-4c3a-9240-5db8603236f8"
      setting.slaHours,
      setting.autoApprove
    );
  };

  const sortedSettings = [...settings].sort((a, b) => a.sequenceOrder - b.sequenceOrder);

  if (loading && !slaSettings) {
    return (
      <div className={styles.container}>
        <div className={`${styles.card} maincard`}>
          <div className={styles.loading}>Loading SLA Settings...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={`${styles.card} maincard`}>
        <div className={styles.cardHeader}>
          <div className={styles.headerLeft}>
            <h3>SLA Settings</h3>
            <select 
              value={workflowType}
              onChange={(e) => setWorkflowType(e.target.value)}
              className={styles.workflowSelect}
            >
              <option value="PRE_TRAVEL">Pre-Travel</option>
              <option value="POST_TRAVEL">Post-Travel</option>
              <option value="EXPENSE">Expense</option>
            </select>
          </div>
          
          <div className={styles.tabButtons}>
            <button 
              className={`${styles.tabButton} ${activeTab === 'individual' ? styles.tabButtonActive : ''}`}
              onClick={() => setActiveTab('individual')}
            >
              Individual Steps
            </button>
            <button 
              className={`${styles.tabButton} ${activeTab === 'bulk' ? styles.tabButtonActive : ''}`}
              onClick={() => setActiveTab('bulk')}
            >
              Bulk Update
            </button>
          </div>
        </div>
        
        <div className={styles.cardBody}>
          {slaSettings && (
            <div className={styles.workflowInfo}>
              <p><strong>Workflow Type:</strong> {slaSettings.workflowType}</p>
              <p><strong>Total Steps:</strong> {slaSettings.totalSteps}</p>
              <p><strong>Active Steps:</strong> {slaSettings.activeSteps}</p>
              <p><strong>Default Time Limit:</strong> {slaSettings.defaultTimeLimitHours} hours</p>
              <p><strong>Last Updated:</strong> {new Date(slaSettings.lastUpdated).toLocaleString()}</p>
            </div>
          )}

          {activeTab === 'individual' && (
            <>
              <div className={styles.tableContainer}>
                <table className={styles.dataTable}>
                  <thead>
                    <tr>
                      <th>Step Name</th>
                      <th>Approver Role</th>
                      <th>Sequence</th>
                      <th>SLA Hours</th>
                      <th>Auto Approve</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedSettings.map((setting, index) => (
                      <tr key={setting.id} className={!setting.isActive ? styles.inactiveRow : ''}>
                        <td className={styles.stepCell}>
                          <span className={styles.stepName}>{setting.stepName}</span>
                          {setting.isMandatory && <span className={styles.mandatoryBadge}>Mandatory</span>}
                        </td>
                        <td className={styles.roleCell}>
                          <span className={styles.roleBadge}>{setting.role}</span>
                        </td>
                        <td className={styles.sequenceCell}>
                          <select
                            value={setting.sequenceOrder}
                            onChange={(e) => updateStepSequence(setting.configId, parseInt(e.target.value))}
                            className={styles.sequenceSelect}
                            disabled={!setting.isActive}
                          >
                            {[1, 2, 3, 4, 5, 6].map(num => (
                              <option key={num} value={num}>#{num}</option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <input 
                            type="number" 
                            value={setting.slaHours}
                            onChange={(e) => handleSettingChange(index, 'slaHours', e.target.value)}
                            className={styles.numberInput}
                            min="1"
                            max="720"
                            disabled={!setting.isActive}
                          />
                        </td>
                        <td>
                          <input 
                            type="checkbox" 
                            checked={setting.autoApprove}
                            onChange={(e) => handleSettingChange(index, 'autoApprove', e.target.checked)}
                            className={styles.checkbox}
                            disabled={!setting.isActive}
                          />
                        </td>
                        <td>
                          <button
                            className={`${styles.statusToggle} ${setting.isActive ? styles.statusActive : styles.statusInactive}`}
                            onClick={() => toggleStepActivation(setting.configId, !setting.isActive)}
                          >
                            {setting.isActive ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td>
                          <div className={styles.actionButtons}>
                            <button 
                              className={styles.primaryBtnSmall}
                              onClick={() => handleSaveIndividual(index)}
                              disabled={!setting.isActive || loading}
                              title="Save SLA settings for this step"
                            >
                              {loading ? 'Saving...' : 'Save'}
                            </button>
                            <button 
                              className={styles.secondaryBtnSmall}
                              onClick={() => toggleStepActivation(setting.configId, !setting.isActive)}
                              disabled={loading}
                              title={setting.isActive ? 'Deactivate Step' : 'Activate Step'}
                            >
                              {setting.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {settings.some(s => !s.isActive) && (
                <div className={styles.inactiveNote}>
                  <i className="fas fa-info-circle"></i>
                  <span>Inactive steps are shown in light gray and cannot be modified until activated.</span>
                </div>
              )}
            </>
          )}

          {activeTab === 'bulk' && (
            <div className={styles.bulkUpdateSection}>
              <div className={styles.bulkForm}>
                <h4>Bulk Update All Steps</h4>
                <p>Set the same SLA hours for all active approval steps in this workflow.</p>
                
                <div className={styles.formGroup}>
                  <label htmlFor="bulkTimeLimit">SLA Hours (for all active steps):</label>
                  <input
                    id="bulkTimeLimit"
                    type="number"
                    value={bulkTimeLimit}
                    onChange={(e) => setBulkTimeLimit(parseInt(e.target.value) || 48)}
                    className={styles.numberInput}
                    min="1"
                    max="720"
                  />
                  <small className={styles.helpText}>Hours (1-720)</small>
                </div>
                
                <button 
                  className={styles.primaryBtn}
                  onClick={updateBulkSLA}
                  disabled={loading}
                >
                  {loading ? 'Updating...' : 'Apply to All Active Steps'}
                </button>
                
                <div className={styles.bulkInfo}>
                  <p><strong>Note:</strong> This will update the SLA hours for all <strong>active</strong> steps in the {workflowType} workflow. Inactive steps will not be affected.</p>
                </div>
              </div>
            </div>
          )}
          
          <div className={styles.slaInfo}>
            <h4>SLA Configuration Guide</h4>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <strong>SLA Hours</strong>
                <p>Maximum time allowed for approval completion at each step. After this time, the system will either auto-approve or escalate based on settings.</p>
              </div>
              <div className={styles.infoItem}>
                <strong>Auto Approve</strong>
                <p>When enabled, requests automatically approve after SLA hours expire. When disabled, requests will escalate to administrators.</p>
              </div>
              <div className={styles.infoItem}>
                <strong>Sequence Order</strong>
                <p>Defines the order in which approval steps are processed. Steps are executed sequentially from lowest to highest number.</p>
              </div>
              <div className={styles.infoItem}>
                <strong>Step Status</strong>
                <p>Activate or deactivate specific approval steps. Inactive steps are skipped in the workflow.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SLASettings;