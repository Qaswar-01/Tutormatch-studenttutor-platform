import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Shield } from 'lucide-react';
import SecurityForm from '../components/profile/SecurityForm';
import './Settings.css';

const Settings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('account');
  // Removed settings state since we only have Account and Security tabs now

  const handleEditProfile = () => {
    navigate('/profile');
  };

  const tabs = [
    { id: 'account', label: 'Account', icon: <User size={18} /> },
    { id: 'security', label: 'Security', icon: <Shield size={18} /> }
  ];

  // Removed setting handlers since we only have Account and Security tabs now

  return (
    <div className="settings-page">
      <div className="container">
        <div className="settings-header">
          <h1>Settings</h1>
          <p>Manage your account settings and preferences</p>
        </div>

        <div className="settings-content">
          <div className="settings-sidebar">
            <nav className="settings-nav">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  className={`settings-nav-item ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="settings-main">
            {activeTab === 'account' && (
              <div className="settings-section">
                <h2>Account Information</h2>
                <div className="account-info">
                  <div className="info-item">
                    <label>Name</label>
                    <p>{user?.firstName} {user?.lastName}</p>
                  </div>
                  <div className="info-item">
                    <label>Email</label>
                    <p>{user?.email}</p>
                  </div>
                  <div className="info-item">
                    <label>Role</label>
                    <p className={`role-badge role-${user?.role}`}>{user?.role}</p>
                  </div>
                  <div className="info-item">
                    <label>Member Since</label>
                    <p>{new Date(user?.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="account-actions">
                  <button
                    className="btn btn-primary"
                    onClick={handleEditProfile}
                  >
                    Edit Profile
                  </button>
                  <button className="btn btn-outline btn-danger">Delete Account</button>
                </div>
              </div>
            )}



            {activeTab === 'security' && (
              <div className="settings-section">
                <SecurityForm />
              </div>
            )}




          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
