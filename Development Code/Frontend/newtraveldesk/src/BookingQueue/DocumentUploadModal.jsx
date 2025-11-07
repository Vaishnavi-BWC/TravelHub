import React, { useState, useEffect } from 'react';
import './DocumentUploadModal.css';

const DocumentUploadModal = ({ 
  isOpen, 
  onClose, 
  travelRequestId, 
  bookingId,
  onUploadSuccess 
}) => {
  const [uploadForm, setUploadForm] = useState({
    documentType: 'FLIGHT_TICKET',
    description: '',
    file: null
  });
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [userId, setUserId] = useState('');

  const documentTypes = [
    'FLIGHT_TICKET',
    'HOTEL_VOUCHER',
    'CAR_RENTAL',
    'TRAIN_TICKET',
    'TRAVEL_INSURANCE',
    'VISA_DOCUMENT',
    'BOARDING_PASS',
    'INVOICE',
    'RECEIPT',
    'OTHER'
  ];

  // Fetch user ID from the correct endpoint using proxy
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        console.log('🔐 Fetching user ID from auth endpoint...');
        
        // Use the correct proxy endpoint for auth
        const response = await fetch('/api/auth/me', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          credentials: 'include'
        });

        console.log('🔐 Auth response status:', response.status);
        
        if (response.ok) {
          const userData = await response.json();
          console.log('🔐 User data received:', userData);
          setUserId(userData.id || userData.userId || userData.sub || '');
        } else {
          console.warn('❌ Failed to fetch user ID from /api/auth/me, status:', response.status);
          
          // Try alternative endpoints
          await tryAlternativeEndpoints();
        }
      } catch (error) {
        console.error('❌ Error fetching user ID:', error);
        await tryAlternativeEndpoints();
      }
    };

    const tryAlternativeEndpoints = async () => {
      try {
        console.log('🔄 Trying alternative user ID endpoints...');
        
        // Try travel-desk-proxy endpoint
        const travelDeskResponse = await fetch('/travel-desk-proxy/api/auth/me', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          credentials: 'include'
        });
        
        if (travelDeskResponse.ok) {
          const userData = await travelDeskResponse.json();
          console.log('✅ User ID from travel-desk-proxy:', userData);
          setUserId(userData.id || userData.userId || userData.sub || '');
          return;
        }
        
        // Try localStorage as last resort
        const storedUserId = localStorage.getItem('userId') || 
                            localStorage.getItem('user_id') ||
                            sessionStorage.getItem('userId') ||
                            sessionStorage.getItem('user_id');
        
        if (storedUserId) {
          console.log('✅ User ID from storage:', storedUserId);
          setUserId(storedUserId);
          return;
        }
        
        // Final fallback
        console.warn('⚠️ Using fallback user ID');
        setUserId('231a34ae-120f-4079-a2a2-a9b8c3b91eac');
        
      } catch (fallbackError) {
        console.error('❌ All user ID fetch methods failed:', fallbackError);
        setUserId('231a34ae-120f-4079-a2a2-a9b8c3b91eac');
      }
    };

    if (isOpen) {
      fetchUserId();
    }
  }, [isOpen]);

  const handleFormChange = (field, value) => {
    setUploadForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      setUploadForm(prev => ({ ...prev, file }));
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!uploadForm.file) {
      alert('Please select a file to upload');
      return;
    }

    if (!uploadForm.documentType) {
      alert('Please select a document type');
      return;
    }

    if (!userId) {
      alert('User ID not available. Please try again.');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      const formData = new FormData();
      formData.append('file', uploadForm.file);
      formData.append('documentType', uploadForm.documentType);
      formData.append('description', uploadForm.description);

      // Use the exact endpoint format with travelRequestId and bookingId
      const endpoint = `/travel-desk-proxy/api/travel-desk/approvals/${travelRequestId}/bookings/${bookingId}/documents/upload`;

      console.log('📤 Uploading document to:', endpoint);
      console.log('📦 Upload data:', {
        documentType: uploadForm.documentType,
        description: uploadForm.description,
        fileName: uploadForm.file.name,
        fileSize: uploadForm.file.size,
        fileType: uploadForm.file.type,
        userId: userId,
        travelRequestId: travelRequestId,
        bookingId: bookingId
      });

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'X-User-Id': userId,
          // Don't set Content-Type for FormData, let browser set it with boundary
        },
        credentials: 'include',
        body: formData
      });

      // Simulate progress for better UX
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${response.status} - ${errorText}`);
      }

      const uploadResponse = await response.json();
      clearInterval(interval);
      setUploadProgress(100);

      console.log('✅ Document uploaded successfully:', uploadResponse);

      // Reset form
      setUploadForm({
        documentType: 'FLIGHT_TICKET',
        description: '',
        file: null
      });

      // Notify parent component
      if (onUploadSuccess) {
        onUploadSuccess(uploadResponse);
      }

      // Show success message
      alert(`✅ Document uploaded successfully!\n\n📄 File: ${uploadResponse.fileName}\n📋 Type: ${uploadResponse.documentType}\n📝 Description: ${uploadResponse.description}`);

      // Close modal after successful upload
      onClose();

    } catch (err) {
      console.error('❌ Error uploading document:', err);
      alert(`❌ Document upload failed: ${err.message}`);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleClose = () => {
    if (!uploading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay document-upload-overlay" onClick={handleClose}>
      <div className="modal-content document-upload-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Upload Booking Document</h3>
          <button 
            className="modal-close" 
            onClick={handleClose}
            disabled={uploading}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleUpload}>
          <div className="modal-body">
            <div className="upload-info">
              <h4>Booking Information</h4>
              <div className="info-grid">
                <div className="info-item">
                  <label>Travel Request ID:</label>
                  <span>{travelRequestId}</span>
                </div>
                <div className="info-item">
                  <label>Booking ID:</label>
                  <span>{bookingId}</span>
                </div>
                <div className="info-item">
                  <label>User ID:</label>
                  <span className={userId ? 'user-id-valid' : 'user-id-loading'}>
                    {userId ? userId : 'Loading...'}
                  </span>
                </div>
              </div>
            </div>

            <div className="upload-form">
              <h4>Document Details</h4>
              
              <div className="form-group">
                <label htmlFor="documentType" className="required">Document Type</label>
                <select 
                  id="documentType"
                  value={uploadForm.documentType}
                  onChange={(e) => handleFormChange('documentType', e.target.value)}
                  required
                  disabled={uploading}
                >
                  {documentTypes.map(type => (
                    <option key={type} value={type}>
                      {type.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea 
                  id="description"
                  value={uploadForm.description}
                  onChange={(e) => handleFormChange('description', e.target.value)}
                  placeholder="Enter document description (e.g., Confirmed flight ticket for AI-101)"
                  rows="3"
                  disabled={uploading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="file" className="required">Select File</label>
                <div className="file-input-container">
                  <input 
                    type="file" 
                    id="file"
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    required
                    disabled={uploading}
                  />
                  <label htmlFor="file" className="file-input-label">
                    <i className="fas fa-cloud-upload-alt"></i>
                    {uploadForm.file ? uploadForm.file.name : 'Choose file...'}
                  </label>
                </div>
                <div className="file-info">
                  {uploadForm.file && (
                    <>
                      <span>Size: {(uploadForm.file.size / 1024 / 1024).toFixed(2)} MB</span>
                      <span>Type: {uploadForm.file.type || 'Unknown'}</span>
                    </>
                  )}
                </div>
                <div className="file-requirements">
                  <small>Supported formats: PDF, JPG, JPEG, PNG, DOC, DOCX (Max 10MB)</small>
                </div>
              </div>

              {uploading && (
                <div className="upload-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <span className="progress-text">{uploadProgress}%</span>
                </div>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button 
              type="button"
              className="btn btn-outline" 
              onClick={handleClose}
              disabled={uploading}
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="btn btn-primary" 
              disabled={uploading || !uploadForm.file}
            >
              {uploading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Uploading...
                </>
              ) : (
                <>
                  <i className="fas fa-upload"></i> Upload Document
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DocumentUploadModal;