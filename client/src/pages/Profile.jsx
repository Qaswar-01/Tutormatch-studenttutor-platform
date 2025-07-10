import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AvatarUpload from '../components/profile/AvatarUpload';
import BasicInfoForm from '../components/profile/BasicInfoForm';
import TutorProfileForm from '../components/profile/TutorProfileForm';
import AvailabilityForm from '../components/profile/AvailabilityForm';
import SecurityForm from '../components/profile/SecurityForm';
import { User, Users, Calendar, Shield } from 'lucide-react';
import './Profile.css';

const Profile = () => {
  const { user, updateUser, isTutor, isStudent } = useAuth();
  const [activeTab, setActiveTab] = useState('basic');
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const response = await userAPI.getProfile();
      setProfileData(response.data.user);
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileUpdate = async (updatedData) => {
    try {
      setIsLoading(true);
      const response = await userAPI.updateProfile(updatedData);

      // Update both local state and auth context
      setProfileData(response.data.user);
      updateUser(response.data.user);

      toast.success('Profile updated successfully!');
      return response.data.user;
    } catch (error) {
      console.error('Error updating profile:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update profile';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpdate = async (avatarUrl) => {
    const updatedData = { ...profileData, avatar: avatarUrl };
    setProfileData(updatedData);
    updateUser(updatedData);
  };

  if (isLoading && !profileData) {
    return (
      <div className="profile-page">
        <div className="container">
          <LoadingSpinner text="Loading profile..." />
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="profile-page">
        <div className="container">
          <div className="error-message">
            <h2>Error Loading Profile</h2>
            <p>Unable to load your profile. Please try refreshing the page.</p>
            <button onClick={loadProfile} className="btn btn-primary">
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: <User size={18} /> },
    ...(isTutor() ? [
      { id: 'tutor', label: 'Tutor Info', icon: <Users size={18} /> },
      { id: 'availability', label: 'Availability', icon: <Calendar size={18} /> }
    ] : []),
    { id: 'security', label: 'Security', icon: <Shield size={18} /> }
  ];

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-header">
          <div className="profile-header-content">
            <AvatarUpload
              currentAvatar={profileData.avatar}
              userName={`${profileData.firstName} ${profileData.lastName}`}
              onAvatarUpdate={handleAvatarUpdate}
            />
            <div className="profile-header-info">
              <h1>{profileData.firstName} {profileData.lastName}</h1>
              <div className="profile-badges">
                <span className={`role-badge role-${profileData.role}`}>
                  {profileData.role}
                </span>
                {isTutor() && profileData.pendingApproval && (
                  <span className="status-badge pending">
                    Pending Approval
                  </span>
                )}
                {isTutor() && !profileData.pendingApproval && (
                  <span className="status-badge approved">
                    Approved
                  </span>
                )}
                {!profileData.profileCompleted && (
                  <span className="status-badge incomplete">
                    Profile Incomplete
                  </span>
                )}
              </div>
              <p className="profile-email">{profileData.email}</p>
              {profileData.bio && (
                <p className="profile-bio">{profileData.bio}</p>
              )}
            </div>
          </div>
        </div>

        <div className="profile-content">
          <div className="profile-tabs">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="tab-icon">{tab.icon}</span>
                <span className="tab-label">{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="profile-tab-content">
            {activeTab === 'basic' && (
              <BasicInfoForm
                profileData={profileData}
                onUpdate={handleProfileUpdate}
                isLoading={isLoading}
              />
            )}

            {activeTab === 'tutor' && isTutor() && (
              <TutorProfileForm
                profileData={profileData}
                onUpdate={handleProfileUpdate}
                isLoading={isLoading}
              />
            )}

            {activeTab === 'availability' && isTutor() && (
              <AvailabilityForm
                profileData={profileData}
                onUpdate={handleProfileUpdate}
                isLoading={isLoading}
              />
            )}

            {activeTab === 'security' && (
              <SecurityForm />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
