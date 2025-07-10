import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { adminAPI } from '../../services/api';
import { toast } from 'react-toastify';
import LoadingSpinner from '../common/LoadingSpinner';
import AnalyticsOverview from './AnalyticsOverview';
import UserManagement from './UserManagement';
import SessionManagement from './SessionManagement';
import TutorApproval from './TutorApproval';
import PlatformSettings from './PlatformSettings';
import {
  BarChart3,
  Users,
  Calendar,
  Star,
  Clock,
  Settings,
  Ban
} from 'lucide-react';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'admin') {
      toast.error('Access denied. Admin privileges required.');
      return;
    }
    
    loadAnalytics();
  }, [user]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAnalytics();
      setAnalytics(response.data.analytics);
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <BarChart3 size={20} />,
      component: AnalyticsOverview
    },
    {
      id: 'tutors',
      label: 'Tutor Approval',
      icon: <Users size={20} />,
      component: TutorApproval,
      badge: analytics?.overview?.pendingTutors || 0
    },
    {
      id: 'users',
      label: 'User Management',
      icon: <Users size={20} />,
      component: UserManagement
    },
    {
      id: 'sessions',
      label: 'Session Management',
      icon: <Calendar size={20} />,
      component: SessionManagement
    },
    {
      id: 'settings',
      label: 'Platform Settings',
      icon: <Settings size={20} />,
      component: PlatformSettings
    }
  ];

  if (user?.role !== 'admin') {
    return (
      <div className="admin-access-denied">
        <div className="access-denied-content">
          <div className="access-denied-icon">
            <Ban size={64} />
          </div>
          <h2>Access Denied</h2>
          <p>You don't have permission to access the admin dashboard.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="admin-loading">
        <LoadingSpinner text="Loading admin dashboard..." />
      </div>
    );
  }

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <div className="admin-header">
        <div className="admin-title">
          <h1>Admin Dashboard</h1>
          <p>Manage users, sessions, and platform settings</p>
        </div>
        
        <div className="admin-user-info">
          <div className="admin-avatar">
            <img 
              src={user.avatar || '/default-avatar.png'} 
              alt={`${user.firstName} ${user.lastName}`}
            />
          </div>
          <div className="admin-details">
            <span className="admin-name">{user.firstName} {user.lastName}</span>
            <span className="admin-role">Administrator</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="admin-nav">
        <div className="admin-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`admin-tab ${activeTab === tab.id ? 'active' : ''}`}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
              {tab.badge > 0 && (
                <span className="tab-badge">{tab.badge}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="admin-content">
        {ActiveComponent && (
          <ActiveComponent 
            analytics={analytics}
            onRefresh={loadAnalytics}
          />
        )}
      </div>

      {/* Quick Stats Bar */}
      {analytics && (
        <div className="admin-quick-stats">
          <div className="quick-stat">
            <span className="stat-icon">
              <Users size={24} />
            </span>
            <div className="stat-info">
              <span className="stat-value">{analytics.overview.totalUsers}</span>
              <span className="stat-label">Total Users</span>
            </div>
          </div>

          <div className="quick-stat">
            <span className="stat-icon">
              <Calendar size={24} />
            </span>
            <div className="stat-info">
              <span className="stat-value">{analytics.overview.totalSessions}</span>
              <span className="stat-label">Total Sessions</span>
            </div>
          </div>

          <div className="quick-stat">
            <span className="stat-icon">
              <Star size={24} />
            </span>
            <div className="stat-info">
              <span className="stat-value">{analytics.overview.averageRating.toFixed(1)}</span>
              <span className="stat-label">Avg Rating</span>
            </div>
          </div>

          <div className="quick-stat">
            <span className="stat-icon">
              <Clock size={24} />
            </span>
            <div className="stat-info">
              <span className="stat-value">{analytics.overview.pendingTutors}</span>
              <span className="stat-label">Pending Approvals</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
