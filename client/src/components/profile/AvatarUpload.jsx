import React, { useState, useRef } from 'react';
import { userAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { getAvatarUrl } from '../../utils/helpers';
import LoadingSpinner from '../common/LoadingSpinner';
import './AvatarUpload.css';

const AvatarUpload = ({ currentAvatar, userName, onAvatarUpdate }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please select a valid image file (JPEG, PNG, or GIF)');
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error('File size must be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target.result);
    };
    reader.readAsDataURL(file);

    // Upload file
    uploadAvatar(file);
  };

  const uploadAvatar = async (file) => {
    try {
      setIsUploading(true);
      
      const formData = new FormData();
      formData.append('avatar', file);
      
      const response = await userAPI.uploadAvatar(formData);
      const newAvatarUrl = response.data.avatarUrl;
      
      // Update parent component
      onAvatarUpdate(newAvatarUrl);
      setPreviewUrl(null);
      
      toast.success('Avatar updated successfully!');
    } catch (error) {
      console.error('Avatar upload error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to upload avatar';
      toast.error(errorMessage);
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleAvatarClick = () => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  };

  const displayAvatar = previewUrl || currentAvatar || getAvatarUrl({ firstName: userName?.split(' ')[0], lastName: userName?.split(' ')[1] });

  return (
    <div className="avatar-upload">
      <div className="avatar-container" onClick={handleAvatarClick}>
        <div className="avatar-image">
          <img 
            src={displayAvatar} 
            alt={userName || 'User avatar'}
            className="avatar"
          />
          {isUploading && (
            <div className="avatar-loading">
              <LoadingSpinner size="small" color="white" text="" />
            </div>
          )}
          <div className="avatar-overlay">
            <span className="avatar-overlay-icon">📷</span>
            <span className="avatar-overlay-text">Change Photo</span>
          </div>
        </div>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif"
        onChange={handleFileSelect}
        className="avatar-input"
        disabled={isUploading}
      />
      
      <div className="avatar-info">
        <p className="avatar-help">
          Click to upload a new photo
        </p>
        <p className="avatar-requirements">
          JPEG, PNG or GIF. Max 5MB.
        </p>
      </div>
    </div>
  );
};

export default AvatarUpload;
