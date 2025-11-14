import React, { useState, useEffect } from 'react';
import { useSuperAdmin } from "@/contexts/SuperAdminContext";
import { FaPlus, FaTrash, FaSave, FaSpinner } from 'react-icons/fa';
import styles from '../superadmin.module.css';

const SystemSettings = () => {
  const { state, actions } = useSuperAdmin();
  const { systemSettings, loading } = state;
  
  // Initialize with empty arrays if systemSettings is undefined
  const [settings, setSettings] = useState({
    vendors: [],
    locations: [],
    currencies: [],
    costCenters: []
  });
  
  const [newVendor, setNewVendor] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newCurrency, setNewCurrency] = useState('');
  const [newCostCenter, setNewCostCenter] = useState('');
  const [saving, setSaving] = useState(false);

  // Load settings when component mounts
  useEffect(() => {
    if (!systemSettings) {
      actions.loadSystemSettings();
    }
  }, []);

  // Update local state when systemSettings loads
  useEffect(() => {
    if (systemSettings) {
      setSettings({
        vendors: systemSettings.vendors || [],
        locations: systemSettings.locations || [],
        currencies: systemSettings.currencies || [],
        costCenters: systemSettings.costCenters || []
      });
    }
  }, [systemSettings]);

  const handleAddVendor = () => {
    if (newVendor.trim()) {
      setSettings(prev => ({
        ...prev,
        vendors: [...prev.vendors, newVendor.trim()]
      }));
      setNewVendor('');
    }
  };

  const handleAddLocation = () => {
    if (newLocation.trim()) {
      setSettings(prev => ({
        ...prev,
        locations: [...prev.locations, newLocation.trim()]
      }));
      setNewLocation('');
    }
  };

  const handleAddCurrency = () => {
    if (newCurrency.trim()) {
      setSettings(prev => ({
        ...prev,
        currencies: [...prev.currencies, newCurrency.trim()]
      }));
      setNewCurrency('');
    }
  };

  const handleAddCostCenter = () => {
    if (newCostCenter.trim()) {
      setSettings(prev => ({
        ...prev,
        costCenters: [...prev.costCenters, newCostCenter.trim()]
      }));
      setNewCostCenter('');
    }
  };

  const handleRemoveItem = (category, index) => {
    setSettings(prev => {
      const newArray = [...prev[category]];
      newArray.splice(index, 1);
      return {
        ...prev,
        [category]: newArray
      };
    });
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await actions.updateSystemSettings(settings);
      alert('System settings saved successfully!');
    } catch (error) {
      alert('Error saving settings: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleKeyPress = (e, onAdd) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onAdd();
    }
  };

  const renderSettingsSection = (title, items, category, newValue, setNewValue, onAdd) => (
    <div className={styles.settingsSection}>
      <h4>{title}</h4>
      <div className={styles.settingsList}>
        {items && items.length > 0 ? (
          items.map((item, index) => (
            <div key={index} className={styles.settingsItem}>
              <span>{item}</span>
              <button 
                className={styles.dangerBtn}
                onClick={() => handleRemoveItem(category, index)}
                type="button"
              >
                <FaTrash />
              </button>
            </div>
          ))
        ) : (
          <div className={styles.emptyState}>
            No {title.toLowerCase()} added yet
          </div>
        )}
      </div>
      <div className={styles.addItem}>
        <input
          type="text"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          onKeyPress={(e) => handleKeyPress(e, onAdd)}
          placeholder={`Add new ${title.toLowerCase().slice(0, -1)}...`}
          disabled={saving}
        />
        <button 
          className={styles.primaryBtn} 
          onClick={onAdd}
          disabled={saving || !newValue.trim()}
          type="button"
        >
          <FaPlus className={styles.btnIcon} />
          Add
        </button>
      </div>
    </div>
  );

  if (loading && !systemSettings) {
    return (
      <div className={styles.card}>
        <div className={styles.cardBody}>
          <div className={styles.loadingContainer}>
            <FaSpinner className={styles.spinner} />
            <span>Loading system settings...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.card} maincard`}>
      <div className={styles.cardHeader}>
        <h3>System Settings</h3>
        <button 
          className={styles.primaryBtn} 
          onClick={handleSaveSettings}
          disabled={saving}
        >
          {saving ? (
            <>
              <FaSpinner className={styles.spinner} />
              Saving...
            </>
          ) : (
            <>
              <FaSave className={styles.btnIcon} />
              Save All Settings
            </>
          )}
        </button>
      </div>
      <div className={styles.cardBody}>
        <div className={styles.settingsDescription}>
          <p>Manage system-wide settings including vendors, locations, currencies, and cost centers.</p>
        </div>
        <div className={styles.settingsGrid}>
          {renderSettingsSection(
            'Vendors', 
            settings.vendors, 
            'vendors', 
            newVendor, 
            setNewVendor, 
            handleAddVendor
          )}
          {renderSettingsSection(
            'Locations', 
            settings.locations, 
            'locations', 
            newLocation, 
            setNewLocation, 
            handleAddLocation
          )}
          {renderSettingsSection(
            'Currencies', 
            settings.currencies, 
            'currencies', 
            newCurrency, 
            setNewCurrency, 
            handleAddCurrency
          )}
          {renderSettingsSection(
            'Cost Centers', 
            settings.costCenters, 
            'costCenters', 
            newCostCenter, 
            setNewCostCenter, 
            handleAddCostCenter
          )}
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;