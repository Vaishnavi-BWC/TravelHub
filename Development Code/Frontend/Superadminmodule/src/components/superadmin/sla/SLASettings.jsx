import React, { useState } from 'react';
import { useSuperAdmin } from "@/contexts/SuperAdminContext";
import styles from '../superadmin.module.css';

const SLASettings = () => {
  const { state, actions } = useSuperAdmin();
  const { slaSettings } = state;
  const [settings, setSettings] = useState(slaSettings);

  const handleSettingChange = (index, field, value) => {
    const newSettings = [...settings];
    newSettings[index][field] = field === 'reminderHours' ? parseInt(value) : value;
    setSettings(newSettings);
  };

  const handleSave = () => {
    // In a real app, you would dispatch an action to save SLA settings
    alert('SLA settings saved successfully!');
  };

  return (
    <div className={styles.container}>
<div className={`${styles.card} maincard`}>
      <div className={styles.cardHeader}>
        <h3>SLA Settings</h3>
        <button className={styles.primaryBtn} onClick={handleSave}>
          Save Settings
        </button>
      </div>
      <div className={styles.cardBody}>
        <div className={styles.tableContainer}>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>Role</th>
                <th>Reminder (hours)</th>
                <th>Escalation Required</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {settings.map((setting, index) => (
                <tr key={setting.role}>
                  <td>{setting.role}</td>
                  <td>
                    <input 
                      type="number" 
                      value={setting.reminderHours}
                      onChange={(e) => handleSettingChange(index, 'reminderHours', e.target.value)}
                      className={styles.numberInput}
                    />
                  </td>
                  <td>
                    <input 
                      type="checkbox" 
                      checked={setting.escalation}
                      onChange={(e) => handleSettingChange(index, 'escalation', e.target.checked)}
                    />
                  </td>
                  <td>
                    <button className={styles.secondaryBtn}>
                      Reset to Default
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className={styles.slaInfo}>
          <h4>SLA Information</h4>
          <br></br>
          <p>Set reminder hours and escalation settings for different roles in the approval workflow.</p>
          <br></br>
          <ul>
            <li><strong>Reminder Hours:</strong> Time before a reminder is sent for pending approvals</li>
            <br></br>
            <li><strong>Escalation:</strong> Whether unresolved approvals should be escalated to higher authorities</li>
          </ul>
        </div>
      </div>
    </div>
    </div>
  );
};

export default SLASettings;