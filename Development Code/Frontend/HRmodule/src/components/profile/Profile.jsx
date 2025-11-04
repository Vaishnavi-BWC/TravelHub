import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import Badge from '../common/Badge';
import LoadingSpinner from '../common/LoadingSpinner';
import hrService from '../../services/hrService'; // Import the HR service

const Profile = () => {
  const { user, setUser } = useApp();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    department: '',
    position: '',
    location: ''
  });

  // Load HR profile data
  useEffect(() => {
    const loadHRProfile = async () => {
      try {
        setLoading(true);
        const profileData = await hrService.getHRProfile();
        
        // Update both local state and context
        setFormData({
          fullName: profileData.fullName || 'HR Manager',
          email: profileData.email || 'hr.manager@company.com',
          phoneNumber: profileData.phoneNumber || '+1 (555) 987-6543',
          department: profileData.department || 'Human Resources',
          position: profileData.position || 'HR Manager',
          location: profileData.location || 'Corporate Office',
          employeeid: profileData.id || 'HR001'
        });
        
        // Update global user context if needed
        if (setUser) {
          setUser(prevUser => ({
            ...prevUser,
            ...profileData
          }));
        }
      } catch (err) {
        console.error('Failed to load HR profile:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadHRProfile();
  }, [setUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      await hrService.updateHRProfile(formData);
      
      // Refresh profile data after update
      const updatedProfile = await hrService.getHRProfile();
      setFormData({
        fullName: updatedProfile.fullName,
        email: updatedProfile.email,
        phoneNumber: updatedProfile.phoneNumber,
        department: updatedProfile.department,
        position: updatedProfile.position,
        location: updatedProfile.location,
        employeeid: updatedProfile.id
      });
      
      setIsEditing(false);
      console.log('HR Profile updated successfully');
    } catch (err) {
      console.error('Failed to update HR profile:', err);
      setError('Failed to save profile: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    // Reset form data to original user data
    if (user) {
      setFormData({
        fullName: user.fullName || 'HR Manager',
        email: user.email || 'hr.manager@company.com',
        phoneNumber: user.phoneNumber || '+1 (555) 987-6543',
        department: user.department || 'Human Resources',
        position: user.position || 'HR Manager',
        location: user.location || 'Corporate Office',
        employeeid: user.id || 'HR001'
      });
    }
    setIsEditing(false);
  };

  const avatar = user?.avatar || "https://ui-avatars.com/api/?name=HR+Manager&background=0D8ABC&color=fff";

  if (loading && !user) {
    return <LoadingSpinner text="Loading HR profile..." />;
  }

  if (error) {
    return <div className="error">Error loading HR profile: {error}</div>;
  }

  return (
    <div className="content contentprofile">
      <div className="detailHeader">
        <h2>HR Manager Profile</h2>
        <p>Manage your personal information and account settings</p>
      </div>

      <div className="profileContainer">
        <div className="card profileCard">
          <div className="cardBody">
            <img
              src={avatar}
              alt="Profile"
              className="profileImage"
            />
            <h3>{formData.fullName}</h3>
            <p>{formData.department} Department</p>
            <div style={{ margin: '20px 0' }}>
              <Badge variant="active">Active</Badge>
            </div>

            {!isEditing ? (
              <>
                <button
                  className="btn btnPrimary"
                  style={{ marginBottom: '10px' }}
                  onClick={() => setIsEditing(true)}
                >
                  <i className="fas fa-edit"></i> Edit Profile
                </button>&nbsp;&nbsp;
                <button className="btn btnSecondary">
                  <i className="fas fa-camera"></i> Change Photo
                </button>
              </>
            ) : (
              <>
                <button
                  className="btn btnPrimary"
                  style={{ marginBottom: '10px' }}
                  onClick={handleSaveProfile}
                  disabled={loading}
                >
                  <i className="fas fa-save"></i> {loading ? 'Saving...' : 'Save'}
                </button>
                &nbsp;&nbsp;  
                <button
                  className="btn btnSecondary"
                  onClick={handleCancelEdit}
                  disabled={loading}
                >
                  <i className="fas fa-times"></i> Cancel
                </button>
              </>
            )}
          </div>
        </div>

        <div className="card profileDetails">
          <div className="cardHeader">
            <h3>Personal Information</h3>
          </div>
          <div className="cardBody">
            <div className="detailItem">
              <label>Full Name</label>
              {isEditing ? (
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="formControl"
                />
              ) : (
                <p>{formData.fullName}</p>
              )}
            </div>

            <div className="detailItem">
              <label>Employee ID</label>
              <p className="read-only-field">{formData.employeeid}</p>
            </div>

            <div className="detailItem">
              <label>Email Address</label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="formControl"
                />
              ) : (
                <p>{formData.email}</p>
              )}
            </div>

            <div className="detailItem">
              <label>Phone Number</label>
              {isEditing ? (
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className="formControl"
                />
              ) : (
                <p>{formData.phoneNumber}</p>
              )}
            </div>

            <div className="detailItem">
              <label>Department</label>
              <p className="read-only-field">{formData.department}</p>
            </div>

            <div className="detailItem">
              <label>Position</label>
              <p className="read-only-field">{formData.position}</p>
            </div>

            <div className="detailItem">
              <label>Location</label>
              {isEditing ? (
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="formControl"
                />
              ) : (
                <p>{formData.location}</p>
              )}
            </div>

            <div className="detailItem">
              <label>Date Joined</label>
              <p>{user?.dateJoined || ''}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { Profile };
export default Profile;