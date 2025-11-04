import React, { useState, useEffect } from 'react'
import { useApp } from '../../contexts/AppContext'
import SuperAdminService from '../../services/superAdminService';
import './ProfilePage.css'

const ProfilePage = () => {
  const { user } = useApp()
  const [superAdminProfile, setSuperAdminProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: ''
  })

  useEffect(() => {
    const fetchSuperAdminProfile = async () => {
      try {
        setLoading(true)
        const profileData = await SuperAdminService.getSuperAdminProfile()
        setSuperAdminProfile(profileData)
        // Initialize edit form data
        setEditFormData({
          name: profileData.name,
          email: profileData.email,
          phone: profileData.phone,
          location: profileData.location || 'New York, USA'
        })
      } catch (err) {
        console.error('Error fetching super admin profile:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchSuperAdminProfile()
  }, [])

  const handleEditClick = () => {
    setIsEditing(true)
  }

  const handleCancelClick = () => {
    setIsEditing(false)
    // Reset form data to original values
    if (superAdminProfile) {
      setEditFormData({
        name: superAdminProfile.name,
        email: superAdminProfile.email,
        phone: superAdminProfile.phone,
        location: superAdminProfile.location || 'New York, USA'
      })
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSaveClick = async () => {
    try {
      // Call the update API
      await SuperAdminService.updateSuperAdminProfile(editFormData)
      
      // Update local state with the new data
      const updatedProfile = {
        ...superAdminProfile,
        ...editFormData
      }
      setSuperAdminProfile(updatedProfile)
      setIsEditing(false)
      
      console.log('Profile updated successfully')
      
    } catch (err) {
      console.error('Error saving profile:', err)
      setError('Failed to save profile: ' + err.message)
    }
  }

  // Add safety checks for user data
  const getAvatar = () => {
    return user?.avatar || superAdminProfile?.avatar || 'https://ui-avatars.com/api/?name=Super+Admin&background=0D8ABC&color=fff';
  };

  const getProfileData = () => {
    return superAdminProfile || user || {
      name: 'Super Admin',
      email: 'super.admin@company.com',
      level: 'Super Admin',
      department: 'Administration',
      role: 'SUPER_ADMIN',
      active: true,
      id: 'SA-001',
      managerName: 'System Owner',
      projectIds: []
    };
  };

  if (loading) {
    return <div className="loading">Loading profile...</div>
  }

  if (error) {
    return <div className="error">Error loading profile: {error}</div>
  }

  const profileData = getProfileData();
  const avatarSrc = getAvatar();

  return (
    <div className="profile-page">
      <div className="page-header">
        <h2>Super Admin Profile</h2>
        <p>Manage your personal information and account settings</p>
      </div>

      <div className="profile-container">
        <div className="card profile-card">
          <div className="card-body">
            <img
              src={avatarSrc}
              alt="Profile"
              className="profile-image"
            />
            <h3>{profileData.name}</h3>
            <p>{profileData.level || 'Super Admin'}</p>
            <div style={{margin: '20px 0'}}>
              <span className={`status ${profileData.active ? 'approved' : 'rejected'}`}>
                {profileData.active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <button 
              className="btn btn-primary editprofile" 
              style={{marginBottom: '10px'}}
              onClick={isEditing ? handleSaveClick : handleEditClick}
            >
              <i className="fas fa-user"></i> {isEditing ? 'Save Profile' : 'Edit Profile'}
            </button>
            <button className="btn">
              <i className="fas fa-user"></i> Change Photo
            </button>

            {isEditing && (
              <button 
                className="btn changephoto" 
                onClick={handleCancelClick}
                style={{marginBottom: '10px'}}
              >
                <i className="fas fa-times"></i> Cancel
              </button>
            )}
          </div>
        </div>
    
        <div className="card profile-details">
          <div className="card-header">
            <h3>Personal Information</h3>
          </div>
          <div className="card-body">
            {/* Read-only fields */}
            <div className="detail-item">
              <label>Employee ID</label>
              <p className="read-only-field">{profileData.id}</p>
            </div>
            <div className="detail-item">
              <label>Department</label>
              <p className="read-only-field">{profileData.department || 'Administration'}</p>
            </div>
            <div className="detail-item">
              <label>Position/Level</label>
              <p className="read-only-field">{profileData.level || 'Super Admin'}</p>
            </div>
            <div className="detail-item">
              <label>Manager Name</label>
              <p className="read-only-field">{profileData.managerName || 'System Owner'}</p>
            </div>
            <div className="detail-item">
              <label>Role</label>
              <p className="read-only-field">{profileData.role || 'SUPER_ADMIN'}</p>
            </div>
            <div className="detail-item">
              <label>Status</label>
              <p className="read-only-field">{profileData.active ? 'Active' : 'Inactive'}</p>
            </div>
            {profileData.projectIds && profileData.projectIds.length > 0 && (
              <div className="detail-item">
                <label>Project IDs</label>
                <p className="read-only-field">{profileData.projectIds.join(', ')}</p>
              </div>
            )}

            {/* Editable fields */}
            <div className="detail-item">
              <label>Full Name</label>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={editFormData.name}
                  onChange={handleInputChange}
                  className="form-input"
                />
              ) : (
                <p>{profileData.name}</p>
              )}
            </div>
            <div className="detail-item">
              <label>Email Address</label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={editFormData.email}
                  onChange={handleInputChange}
                  className="form-input"
                />
              ) : (
                <p>{profileData.email || 'super.admin@company.com'}</p>
              )}
            </div>
            <div className="detail-item">
              <label>Phone Number</label>
              {isEditing ? (
                <input
                  type="tel"
                  name="phone"
                  value={editFormData.phone}
                  onChange={handleInputChange}
                  className="form-input"
                />
              ) : (
                <p>{profileData.phone || '+1 (555) 123-4567'}</p>
              )}
            </div>
            <div className="detail-item">
              <label>Location</label>
              {isEditing ? (
                <input
                  type="text"
                  name="location"
                  value={editFormData.location}
                  onChange={handleInputChange}
                  className="form-input"
                />
              ) : (
                <p>{profileData.location || 'New York, USA'}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage