import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import AvatarUpload from '../profile/AvatarUpload';
import './PlatformSettings.css';

const PlatformSettings = ({ analytics, onRefresh }) => {
  const { user, updateUser } = useAuth();
  const [settings, setSettings] = useState({
    platformName: 'TutorMatch',
    platformDescription: 'Connect with expert tutors for personalized learning',
    commissionRate: 15,
    minSessionDuration: 1,
    maxSessionDuration: 4,
    autoApprovalEnabled: false,
    emailNotificationsEnabled: true,
    maintenanceMode: false,
    registrationEnabled: true,
    maxFileSize: 10,
    supportedSubjects: [
      'Mathematics',
      'Science',
      'English',
      'History',
      'Computer Science',
      'Languages',
      'Arts',
      'Music'
    ]
  });

  const [newSubject, setNewSubject] = useState('');
  const [saving, setSaving] = useState(false);

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('platformSettings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(parsedSettings);
      } catch (error) {
        console.error('Error loading saved settings:', error);
      }
    }
  }, []);

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleAddSubject = () => {
    if (!newSubject.trim()) return;

    if (settings.supportedSubjects.includes(newSubject.trim())) {
      toast.error('Subject already exists');
      return;
    }

    const updatedSettings = {
      ...settings,
      supportedSubjects: [...settings.supportedSubjects, newSubject.trim()]
    };

    setSettings(updatedSettings);
    setNewSubject('');

    // Save to localStorage immediately
    localStorage.setItem('platformSettings', JSON.stringify(updatedSettings));
    toast.success(`Subject "${newSubject.trim()}" added successfully`);

    // Refresh analytics to update popular subjects
    if (onRefresh) {
      setTimeout(() => {
        onRefresh();
      }, 500);
    }
  };

  const handleRemoveSubject = (subject) => {
    const updatedSettings = {
      ...settings,
      supportedSubjects: settings.supportedSubjects.filter(s => s !== subject)
    };

    setSettings(updatedSettings);

    // Save to localStorage immediately
    localStorage.setItem('platformSettings', JSON.stringify(updatedSettings));
    toast.success(`Subject "${subject}" removed successfully`);

    // Refresh analytics to update popular subjects
    if (onRefresh) {
      setTimeout(() => {
        onRefresh();
      }, 500);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);

      // Save settings to localStorage for now (since no backend API exists)
      localStorage.setItem('platformSettings', JSON.stringify(settings));

      toast.success('Settings saved successfully');

      // Refresh analytics to update popular subjects
      if (onRefresh) {
        setTimeout(() => {
          onRefresh();
        }, 500);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpdate = async (avatarUrl) => {
    const updatedUser = { ...user, avatar: avatarUrl };
    updateUser(updatedUser);
    toast.success('Admin profile picture updated successfully!');
  };

  return (
    <div className="platform-settings">
      {/* Header */}
      <div className="settings-header">
        <div className="header-content">
          <h2>Platform Settings</h2>
          <p>Configure platform-wide settings and preferences</p>
        </div>
        <button
          onClick={handleSaveSettings}
          disabled={saving}
          className="save-btn"
        >
          {saving ? 'Saving...' : '💾 Save Changes'}
        </button>
      </div>

      <div className="settings-content">
        {/* Admin Profile Settings */}
        <div className="settings-section">
          <h3>Admin Profile</h3>

          <div className="admin-profile-section">
            <div className="admin-profile-info">
              <AvatarUpload
                currentAvatar={user?.avatar}
                userName={`${user?.firstName} ${user?.lastName}`}
                onAvatarUpdate={handleAvatarUpdate}
              />
              <div className="admin-profile-details">
                <h4>{user?.firstName} {user?.lastName}</h4>
                <p className="admin-email">{user?.email}</p>
                <span className="admin-role-badge">Administrator</span>
              </div>
            </div>
          </div>
        </div>

        {/* General Settings */}
        <div className="settings-section">
          <h3>General Settings</h3>
          
          <div className="setting-group">
            <label htmlFor="platformName" className="setting-label">
              Platform Name
            </label>
            <input
              id="platformName"
              type="text"
              value={settings.platformName}
              onChange={(e) => handleSettingChange('platformName', e.target.value)}
              className="setting-input"
            />
          </div>

          <div className="setting-group">
            <label htmlFor="platformDescription" className="setting-label">
              Platform Description
            </label>
            <textarea
              id="platformDescription"
              value={settings.platformDescription}
              onChange={(e) => handleSettingChange('platformDescription', e.target.value)}
              className="setting-textarea"
              rows="3"
            />
          </div>

          <div className="setting-group">
            <label htmlFor="commissionRate" className="setting-label">
              Commission Rate (%)
            </label>
            <input
              id="commissionRate"
              type="number"
              min="0"
              max="50"
              value={settings.commissionRate}
              onChange={(e) => handleSettingChange('commissionRate', parseInt(e.target.value))}
              className="setting-input"
            />
            <span className="setting-help">
              Percentage taken from each session payment
            </span>
          </div>
        </div>

        {/* Session Settings */}
        <div className="settings-section">
          <h3>Session Settings</h3>
          
          <div className="setting-row">
            <div className="setting-group">
              <label htmlFor="minSessionDuration" className="setting-label">
                Minimum Session Duration (hours)
              </label>
              <input
                id="minSessionDuration"
                type="number"
                min="0.5"
                max="8"
                step="0.5"
                value={settings.minSessionDuration}
                onChange={(e) => handleSettingChange('minSessionDuration', parseFloat(e.target.value))}
                className="setting-input"
              />
            </div>

            <div className="setting-group">
              <label htmlFor="maxSessionDuration" className="setting-label">
                Maximum Session Duration (hours)
              </label>
              <input
                id="maxSessionDuration"
                type="number"
                min="1"
                max="12"
                step="0.5"
                value={settings.maxSessionDuration}
                onChange={(e) => handleSettingChange('maxSessionDuration', parseFloat(e.target.value))}
                className="setting-input"
              />
            </div>
          </div>

          <div className="setting-group">
            <label htmlFor="maxFileSize" className="setting-label">
              Maximum File Upload Size (MB)
            </label>
            <input
              id="maxFileSize"
              type="number"
              min="1"
              max="100"
              value={settings.maxFileSize}
              onChange={(e) => handleSettingChange('maxFileSize', parseInt(e.target.value))}
              className="setting-input"
            />
          </div>
        </div>

        {/* Feature Toggles */}
        <div className="settings-section">
          <h3>Feature Settings</h3>
          
          <div className="toggle-group">
            <div className="toggle-item">
              <div className="toggle-info">
                <h4>Auto-Approval for Tutors</h4>
                <p>Automatically approve tutor applications without manual review</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.autoApprovalEnabled}
                  onChange={(e) => handleSettingChange('autoApprovalEnabled', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="toggle-item">
              <div className="toggle-info">
                <h4>Email Notifications</h4>
                <p>Send email notifications for important platform events</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.emailNotificationsEnabled}
                  onChange={(e) => handleSettingChange('emailNotificationsEnabled', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="toggle-item">
              <div className="toggle-info">
                <h4>User Registration</h4>
                <p>Allow new users to register on the platform</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.registrationEnabled}
                  onChange={(e) => handleSettingChange('registrationEnabled', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="toggle-item maintenance">
              <div className="toggle-info">
                <h4>Maintenance Mode</h4>
                <p>Put the platform in maintenance mode (users cannot access)</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.maintenanceMode}
                  onChange={(e) => handleSettingChange('maintenanceMode', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        {/* Supported Subjects */}
        <div className="settings-section">
          <h3>Supported Subjects</h3>
          
          <div className="subjects-manager">
            <div className="add-subject">
              <input
                type="text"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                placeholder="Add new subject..."
                className="subject-input"
                onKeyPress={(e) => e.key === 'Enter' && handleAddSubject()}
              />
              <button
                onClick={handleAddSubject}
                className="add-subject-btn"
              >
                Add Subject
              </button>
            </div>

            <div className="subjects-list">
              {settings.supportedSubjects.map((subject, index) => (
                <div key={index} className="subject-item">
                  <span className="subject-name">{subject}</span>
                  <button
                    onClick={() => handleRemoveSubject(subject)}
                    className="remove-subject-btn"
                    title="Remove subject"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* System Information */}
        <div className="settings-section">
          <h3>System Information</h3>
          
          <div className="system-info">
            <div className="info-item">
              <span className="info-label">Platform Version:</span>
              <span className="info-value">v2.1.0</span>
            </div>
            <div className="info-item">
              <span className="info-label">Last Updated:</span>
              <span className="info-value">December 20, 2024</span>
            </div>
            <div className="info-item">
              <span className="info-label">Database Status:</span>
              <span className="info-value status-online">🟢 Online</span>
            </div>
            <div className="info-item">
              <span className="info-label">Storage Used:</span>
              <span className="info-value">2.4 GB / 100 GB</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlatformSettings;
