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
  const [localChanges, setLocalChanges] = useState({});
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    loadSLASettings();
  }, [workflowType]);

  useEffect(() => {
    console.log('🔄 SLA Settings from context updated:', slaSettings);
    if (slaSettings && slaSettings.stepSettings) {
      console.log('📊 Transforming step settings...');
      
      const transformedSettings = Object.values(slaSettings.stepSettings).map(step => ({
        id: step.configId,
        role: step.approverRole,
        slaHours: step.timeLimitHours,
        autoApprove: step.autoApproveAfterTimeout,
        sequenceOrder: step.sequenceOrder,
        isActive: step.isActive,
        isMandatory: step.isMandatory,
        stepName: step.stepName,
        configId: step.configId
      }));
      
      // Sort by sequence order for display
      const sortedSettings = transformedSettings.sort((a, b) => a.sequenceOrder - b.sequenceOrder);
      
      console.log('✅ Sorted transformed settings:', sortedSettings);
      setSettings(sortedSettings);
      setLocalChanges({});
    }
  }, [slaSettings]);

  const loadSLASettings = async () => {
    console.log('🔍 Loading SLA settings for workflow:', workflowType);
    await actions.loadSlaSettings(workflowType);
  };

  // Individual Step Actions
  const updateStepSLA = async (configId, timeLimitHours, autoApproveAfterTimeout) => {
    setSavingId(configId);
    try {
      console.log('💾 Updating step SLA for configId:', configId, { timeLimitHours, autoApproveAfterTimeout });
      
      // Find the step name for debugging
      const step = settings.find(s => s.configId === configId);
      console.log('🎯 Updating step:', step?.stepName, 'with configId:', configId);
      
      await actions.updateStepSLA(configId, {
        timeLimitHours,
        autoApproveAfterTimeout
      });
      
      alert(`Step ${step?.stepName || 'Unknown'} updated successfully!`);
    } catch (error) {
      console.error('❌ Error updating step SLA:', error);
      alert('Error updating step SLA: ' + error.message);
    } finally {
      setSavingId(null);
    }
  };

  const toggleStepActivation = async (configId, isActive) => {
    try {
      const step = settings.find(s => s.configId === configId);
      console.log('🔧 Toggling activation for:', step?.stepName, 'to', isActive);
      
      await actions.toggleStepActivation(configId, { isActive });
      alert(`Step ${step?.stepName || 'Unknown'} ${isActive ? 'activated' : 'deactivated'} successfully!`);
    } catch (error) {
      alert('Error toggling step activation: ' + error.message);
    }
  };

  const updateStepSequence = async (configId, newSequenceOrder) => {
    try {
      const step = settings.find(s => s.configId === configId);
      console.log('🔄 Updating sequence for:', step?.stepName, 'to', newSequenceOrder);
      
      await actions.updateStepSequence(configId, { newSequenceOrder });
      alert(`Step ${step?.stepName || 'Unknown'} sequence updated successfully!`);
    } catch (error) {
      alert('Error updating step sequence: ' + error.message);
    }
  };

  // Bulk Actions
  const updateBulkSLA = async () => {
    try {
      await actions.updateBulkSLA(workflowType, { timeLimitHours: bulkTimeLimit });
      alert('Bulk SLA settings updated successfully!');
    } catch (error) {
      alert('Error updating bulk SLA: ' + error.message);
    }
  };

  // Handle local changes
  const handleLocalChange = (configId, field, value) => {
    console.log('📝 Local change for configId:', configId, field, value);
    setLocalChanges(prev => ({
      ...prev,
      [configId]: {
        ...prev[configId],
        [field]: field === 'slaHours' ? parseInt(value) || 0 : Boolean(value)
      }
    }));
  };

  // FIXED: Handle save for individual step - use configId directly instead of index
  const handleSaveIndividual = async (configId) => {
    const setting = settings.find(s => s.configId === configId);
    if (!setting) {
      console.error('❌ Could not find setting for configId:', configId);
      return;
    }
    
    const localChange = localChanges[configId];
    const slaHours = localChange?.slaHours !== undefined ? localChange.slaHours : setting.slaHours;
    const autoApprove = localChange?.autoApprove !== undefined ? localChange.autoApprove : setting.autoApprove;
    
    console.log('💾 Saving step:', {
      stepName: setting.stepName,
      configId: configId,
      slaHours,
      autoApprove,
      originalSLA: setting.slaHours,
      originalAutoApprove: setting.autoApprove
    });
    
    await updateStepSLA(configId, slaHours, autoApprove);
    
    // Clear local changes after save
    setLocalChanges(prev => {
      const newChanges = { ...prev };
      delete newChanges[configId];
      return newChanges;
    });
  };

  // Get display value - uses local changes if available
  const getDisplayValue = (setting, field) => {
    const localChange = localChanges[setting.configId];
    if (localChange && localChange[field] !== undefined) {
      return localChange[field];
    }
    return setting[field];
  };

  // Check if a setting has unsaved changes
  const hasUnsavedChanges = (configId) => {
    return localChanges[configId] !== undefined;
  };

  // Debug function to check current mapping
  const debugStepMapping = () => {
    console.log('🐛 DEBUG - Current step mapping:');
    settings.forEach((setting, index) => {
      console.log(`Row ${index}: ${setting.stepName} -> configId: ${setting.configId}`);
    });
  };

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
    <div className={styles.containersla}>
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
            
            {/* Temporary debug button */}
             
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
                      <th>Mandatory</th>
                      <th>Sequence</th>
                      <th>SLA Hours</th>
                      <th>Auto Approve</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {settings.map((setting) => (
                      <tr key={setting.configId} className={!setting.isActive ? styles.inactiveRow : ''}>
                        <td className={styles.stepCell}>
                          <span className={styles.stepName}>{setting.stepName}</span>
                          {hasUnsavedChanges(setting.configId) && (
                            <span className={styles.unsavedBadge}>Unsaved</span>
                          )}
                          {/* Debug info - remove later */}
                          {/* <small style={{display: 'block', color: '#666', fontSize: '10px'}}>
                            ID: {setting.configId.substring(0, 8)}...
                          </small> */}
                        </td>
                        <td className={styles.roleCell}>
                          <span className={styles.roleBadge}>{setting.role}</span>
                        </td>
                        <td>
                            {setting.isMandatory && <span className={styles.mandatoryBadge}>Mandatory</span>}
                        </td>
                        <td className={styles.sequenceCell}>
                          <select
                            value={setting.sequenceOrder}
                            onChange={(e) => updateStepSequence(setting.configId, parseInt(e.target.value))}
                            className={styles.sequenceSelect}
                            disabled={!setting.isActive}
                          >
                            {[1, 2, 3, 4, 5, 6].map(num => (
                              <option key={num} value={num}>{num}</option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <input 
                            type="number" 
                            value={getDisplayValue(setting, 'slaHours')}
                            onChange={(e) => handleLocalChange(setting.configId, 'slaHours', e.target.value)}
                            className={`${styles.numberInput} ${hasUnsavedChanges(setting.configId) ? styles.unsavedInput : ''}`}
                            min="1"
                            max="720"
                            disabled={!setting.isActive}
                          />
                        </td>
                        <td>
                          <input 
                            type="checkbox" 
                            checked={getDisplayValue(setting, 'autoApprove')}
                            onChange={(e) => handleLocalChange(setting.configId, 'autoApprove', e.target.checked)}
                            className={`${styles.checkbox} ${hasUnsavedChanges(setting.configId) ? styles.unsavedCheckbox : ''}`}
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
                              className={`${styles.primaryBtnSmall} ${hasUnsavedChanges(setting.configId) ? styles.saveHighlight : ''}`}
                              onClick={() => handleSaveIndividual(setting.configId)}
                              disabled={!setting.isActive || loading || savingId === setting.configId}
                              title={`Save SLA settings for ${setting.stepName}`}
                            >
                              {savingId === setting.configId ? 'Saving...' : 'Save'}
                            </button>
                            <button 
                              className={styles.secondaryBtnSmall}
                              onClick={() => toggleStepActivation(setting.configId, !setting.isActive)}
                              disabled={loading}
                              title={setting.isActive ? `Deactivate ${setting.stepName}` : `Activate ${setting.stepName}`}
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

              {Object.keys(localChanges).length > 0 && (
                <div className={styles.unsavedNote}>
                  <i className="fas fa-exclamation-triangle"></i>
                  <span>You have unsaved changes. Click 'Save' on each row to apply changes.</span>
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
        </div>
      </div>
    </div>
  );
};

export default SLASettings;