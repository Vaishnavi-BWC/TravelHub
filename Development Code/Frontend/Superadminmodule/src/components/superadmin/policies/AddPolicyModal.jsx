// components/superadmin/policies/AddPolicyModal.js
import React, { useState } from 'react';
import { FaTimes, FaPlus, FaSpinner, FaUpload, FaFilePdf, FaFileAlt } from 'react-icons/fa';
import styles from '../superadmin.module.css';

const AddPolicyModal = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    condition: '',
    action: '',
    isActive: true,
    attachment: null,
    attachmentName: ''
  });
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file type and size
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
      const maxSize = 10 * 1024 * 1024; // 10MB

      if (!allowedTypes.includes(file.type)) {
        alert('Please upload only PDF, DOC, DOCX, or TXT files.');
        return;
      }

      if (file.size > maxSize) {
        alert('File size should be less than 10MB.');
        return;
      }

      setFormData(prev => ({
        ...prev,
        attachment: file,
        attachmentName: file.name
      }));
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileChange({ target: { files } });
    }
  };

  const removeAttachment = () => {
    setFormData(prev => ({
      ...prev,
      attachment: null,
      attachmentName: ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Create FormData to handle file upload
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('description', formData.description);
      submitData.append('condition', formData.condition);
      submitData.append('action', formData.action);
      submitData.append('isActive', formData.isActive);
      
      if (formData.attachment) {
        submitData.append('attachment', formData.attachment);
      }

      await onSave(submitData);
      onClose();
    } catch (error) {
      console.error('Error saving policy:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (fileName) => {
    if (fileName?.toLowerCase().endsWith('.pdf')) {
      return <FaFilePdf className={styles.fileIcon} style={{ color: '#e74c3c' }} />;
    }
    return <FaFileAlt className={styles.fileIcon} style={{ color: '#3498db' }} />;
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal} style={{ maxWidth: '600px' }}>
        <div className={styles.modalHeader}>
          <h3>Add New Policy</h3>
          <button className={styles.closeBtn} onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className={styles.modalBody}>
            <div className={styles.formGroup}>
              <label>Policy Name *</label>
              <input 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter policy name"
                required
                disabled={loading}
              />
            </div>
            
            <div className={styles.formGroup}>
              <label>Description</label>
              <textarea 
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Policy description"
                rows="3"
                disabled={loading}
              />
            </div>
            
            <div className={styles.formGroup}>
              <label>Condition *</label>
              <textarea 
                name="condition"
                value={formData.condition}
                onChange={handleInputChange}
                placeholder="Define condition (e.g., destination == 'international' OR cost > 1000)"
                rows="3"
                required
                disabled={loading}
              />
              <div className={styles.helpText}>
                Examples: destination == 'international', cost 1000, department == 'Sales'
              </div>
            </div>
            
            <div className={styles.formGroup}>
              <label>Action *</label>
              <textarea 
                name="action"
                value={formData.action}
                onChange={handleInputChange}
                placeholder="Define action (e.g., max_cost: 1500, requires_approval: true, class: business)"
                rows="3"
                required
                disabled={loading}
              />
              <div className={styles.helpText}>
                Examples: max_cost: 1500, requires_approval: true, class: business
              </div>
            </div>

            {/* File Upload Section */}
            <div className={styles.formGroup}>
              <label>Policy Document (Optional)</label>
              {!formData.attachment ? (
                <div 
                  className={`${styles.fileUploadArea} ${dragOver ? styles.dragOver : ''}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    id="policyAttachment"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.txt"
                    className={styles.fileInput}
                    disabled={loading}
                  />
                  <div className={styles.uploadContent}>
                    <FaUpload className={styles.uploadIcon} />
                    <p>Drag & drop a file here or click to browse</p>
                    <small>Supported formats: PDF, DOC, DOCX, TXT (Max 10MB)</small>
                  </div>
                </div>
              ) : (
                <div className={styles.filePreview}>
                  <div className={styles.fileInfo}>
                    {getFileIcon(formData.attachmentName)}
                    <div className={styles.fileDetails}>
                      <span className={styles.fileName}>{formData.attachmentName}</span>
                      <span className={styles.fileSize}>
                        {(formData.attachment.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    className={styles.removeFileBtn}
                    onClick={removeAttachment}
                    disabled={loading}
                  >
                    <FaTimes />
                  </button>
                </div>
              )}
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.checkboxLabel}>
                <input 
                  type="checkbox" 
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  disabled={loading}
                />
                <span className={styles.checkboxText}>Active Policy</span>
              </label>
            </div>
          </div>
          
          <div className={styles.modalFooter}>
            <button 
              type="button" 
              className={styles.secondaryBtn} 
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className={styles.primaryBtn} 
              disabled={loading}
            >
              {loading ? (
                <>
                  <FaSpinner className={styles.spinner} />
                  Saving...
                </>
              ) : (
                <>
                  <FaPlus className={styles.btnIcon} />
                  Add Policy
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPolicyModal;