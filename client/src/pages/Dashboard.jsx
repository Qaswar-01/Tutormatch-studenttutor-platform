import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import TutorDashboard from '../components/dashboard/TutorDashboard';
import './Dashboard.css';
import {
  Settings,
  Users,
  BookOpen,
  User,
  Search,
  Calendar,
  Bell,
  Crown,
  GraduationCap,
  FileText,
  Clock
} from 'lucide-react';

const Dashboard = () => {
  const { user, isAdmin, isTutor, isStudent, isTutorApproved } = useAuth();

  if (!user) {
    return (
      <div className="dashboard-page">
        <div className="container">
          <div className="loading">Loading...</div>
        </div>
      </div>
    );
  }

  // Tutor pending approval
  if (isTutor() && user.pendingApproval) {
    return (
      <div className="dashboard-page">
        <div className="container">
          <div className="pending-approval">
            <div className="pending-card">
              <div className="pending-icon">
                <Clock size={64} />
              </div>
              <h1>Application Under Review</h1>
              <p>
                Thank you for applying to become a tutor! Your application is currently
                being reviewed by our team. We'll notify you once a decision has been made.
              </p>
              <div className="pending-actions">
                <Link to="/profile" className="btn btn-primary">
                  Complete Profile
                </Link>
                <Link to="/help" className="btn btn-outline">
                  Get Help
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Tutor with incomplete profile
  if (isTutor() && !user.profileCompleted) {
    return (
      <div className="dashboard-page">
        <div className="container">
          <div className="incomplete-profile">
            <div className="incomplete-card">
              <div className="incomplete-icon">
                <FileText size={64} />
              </div>
              <h1>Complete Your Profile</h1>
              <p>
                Please complete your tutor profile to start accepting session requests.
                Add your subjects, qualifications, and availability.
              </p>
              <Link to="/profile" className="btn btn-primary btn-lg">
                Complete Profile
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show TutorDashboard for approved tutors
  if (isTutor() && isTutorApproved()) {
    return <TutorDashboard />;
  }

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="dashboard-header">
          <h1>
            Welcome back, {user.firstName}!
            {isAdmin() && <Crown size={24} className="role-icon" />}
            {isTutor() && <Users size={24} className="role-icon" />}
            {isStudent() && <GraduationCap size={24} className="role-icon" />}
          </h1>
          <p className="dashboard-subtitle">
            {isAdmin() && 'Manage the platform and oversee all activities'}
            {isTutor() && 'Manage your sessions and help students succeed'}
            {isStudent() && 'Continue your learning journey'}
          </p>
        </div>

        <div className="dashboard-grid">
          {/* Quick Actions */}
          <div className="dashboard-card">
            <h2>Quick Actions</h2>
            <div className="quick-actions">
              {isAdmin() && (
                <>
                  <Link to="/admin" className="action-btn">
                    <span className="action-icon">
                      <Settings size={32} />
                    </span>
                    <span>Admin Panel</span>
                  </Link>
                  <Link to="/admin/pending-tutors" className="action-btn">
                    <span className="action-icon">
                      <Users size={32} />
                    </span>
                    <span>Review Tutors</span>
                  </Link>
                </>
              )}

              {isTutor() && (
                <>
                  <Link to="/sessions" className="action-btn">
                    <span className="action-icon">
                      <BookOpen size={32} />
                    </span>
                    <span>My Sessions</span>
                  </Link>
                  <Link to="/profile" className="action-btn">
                    <span className="action-icon">
                      <User size={32} />
                    </span>
                    <span>Edit Profile</span>
                  </Link>
                </>
              )}

              {isStudent() && (
                <>
                  <Link to="/tutors" className="action-btn">
                    <span className="action-icon">
                      <Search size={32} />
                    </span>
                    <span>Find Tutors</span>
                  </Link>
                  <Link to="/sessions" className="action-btn">
                    <span className="action-icon">
                      <Calendar size={32} />
                    </span>
                    <span>My Sessions</span>
                  </Link>
                  <Link to="/users/bookmarks" className="action-btn">
                    <span className="action-icon">
                      <BookOpen size={32} />
                    </span>
                    <span>Bookmarks</span>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="dashboard-card">
            <h2>Recent Activity</h2>
            <div className="activity-list">
              <div className="activity-item">
                <span className="activity-icon">
                  <Bell size={24} />
                </span>
                <div className="activity-content">
                  <p>Recent activity will be shown here</p>
                  <span className="activity-time">Coming soon</span>
                </div>
              </div>
            </div>
          </div>


        </div>
      </div>
    </div>
  );
};

export default Dashboard;
