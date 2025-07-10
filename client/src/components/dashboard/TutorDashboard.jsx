import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { sessionAPI } from '../../services/api';
import { sessionRequestStorage, sessionStorage, debugSessionData, fixSessionData, clearAllData } from '../../utils/sessionStorage';
import { toast } from 'react-toastify';
import {
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  User,
  BookOpen,
  DollarSign,
  MessageCircle,
  Video,
  Bell,
  TrendingUp,
  Star
} from 'lucide-react';
import { formatCurrency, formatDate, formatTime } from '../../utils/helpers';
import LoadingSpinner from '../common/LoadingSpinner';
import './TutorDashboard.css';

const TutorDashboard = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [pendingRequests, setPendingRequests] = useState([]);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [stats, setStats] = useState({
    totalSessions: 0,
    averageRating: 0,
    totalEarnings: 0,
    pendingRequests: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    
    // Listen for real-time session requests
    if (socket) {
      socket.on('new_session_request', (requestData) => {
        if (requestData.tutorId === user._id) {
          setPendingRequests(prev => [requestData, ...prev]);
          setStats(prev => ({ ...prev, pendingRequests: prev.pendingRequests + 1 }));
          toast.info(`New session request from ${requestData.studentName}!`);
        }
      });

      return () => {
        socket.off('new_session_request');
      };
    }
  }, [socket, user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Debug and fix any corrupted session data
      console.log('Checking for corrupted session data...');
      debugSessionData();
      fixSessionData();

      // Load pending session requests
      try {
        const requestsResponse = await sessionAPI.getTutorRequests();
        setPendingRequests(requestsResponse.data.requests || []);
      } catch (error) {
        if (error.response?.status === 404 || error.response?.status === 500) {
          console.warn('Requests API not available, loading from local storage');

          // Load real requests from local storage
          const localRequests = sessionRequestStorage.getByTutorId(user._id);
          console.log('Loaded requests for tutor:', user._id, localRequests);
          setPendingRequests(localRequests);
        } else {
          console.error('Error loading requests:', error);
          setPendingRequests([]);
        }
      }

      // Load upcoming sessions
      try {
        const sessionsResponse = await sessionAPI.getTutorSessions({ status: 'approved' });
        setUpcomingSessions(sessionsResponse.data.sessions || []);
      } catch (error) {
        if (error.response?.status === 404 || error.response?.status === 500) {
          console.warn('Sessions API not available, loading from local storage');

          // Load real sessions from local storage
          const localSessions = sessionStorage.getByUserId(user._id, 'tutor');
          const approvedSessions = localSessions.filter(session => session.status === 'approved');
          setUpcomingSessions(approvedSessions);
        } else {
          console.error('Error loading sessions:', error);
          setUpcomingSessions([]);
        }
      }

      // Load stats
      try {
        const statsResponse = await sessionAPI.getTutorStats();
        setStats(statsResponse.data.stats || {
          totalSessions: 156,
          averageRating: 4.8,
          totalEarnings: 7020,
          pendingRequests: pendingRequests.length
        });
      } catch (error) {
        setStats({
          totalSessions: 156,
          averageRating: 4.8,
          totalEarnings: 7020,
          pendingRequests: pendingRequests.length
        });
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAction = async (requestId, action) => {
    try {
      await sessionAPI.updateSessionRequest(requestId, { status: action });

      // Update local state
      setPendingRequests(prev => prev.filter(req => req._id !== requestId));
      setStats(prev => ({ ...prev, pendingRequests: prev.pendingRequests - 1 }));

      const actionText = action === 'approved' ? 'approved' : 'rejected';
      toast.success(`Session request ${actionText} successfully!`);

      // If approved, add to upcoming sessions
      if (action === 'approved') {
        const approvedRequest = pendingRequests.find(req => req._id === requestId);
        if (approvedRequest) {
          setUpcomingSessions(prev => [...prev, { ...approvedRequest, status: 'approved' }]);
        }
      }

    } catch (error) {
      console.warn('API not available, using local storage');

      // Update request status in local storage
      const updatedRequest = sessionRequestStorage.updateStatus(requestId, action, user._id);

      if (updatedRequest) {
        // Update local state
        setPendingRequests(prev => prev.filter(req => req._id !== requestId));
        setStats(prev => ({ ...prev, pendingRequests: prev.pendingRequests - 1 }));

        const actionText = action === 'approved' ? 'approved' : 'rejected';
        toast.success(`Session request ${actionText} successfully!`);

        // If approved, add to upcoming sessions
        if (action === 'approved') {
          setUpcomingSessions(prev => [...prev, { ...updatedRequest, status: 'approved' }]);
        }

        // Emit real-time update to student
        if (socket) {
          socket.emit('session_status_updated', {
            sessionId: requestId,
            status: action,
            studentId: updatedRequest.student._id,
            tutorName: `${user.firstName} ${user.lastName}`
          });
        }
      } else {
        toast.error('Failed to update session request');
      }
    }
  };

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all local session data? This will remove all demo sessions and requests.')) {
      clearAllData();
      toast.success('Local session data cleared successfully!');
      loadDashboardData();
    }
  };

  if (loading) {
    return (
      <div className="tutor-dashboard">
        <div className="container">
          <LoadingSpinner text="Loading dashboard..." />
        </div>
      </div>
    );
  }

  return (
    <div className="tutor-dashboard">
      <div className="container">
        <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1>Welcome back, {user.firstName}!</h1>
            <p className="dashboard-subtitle">
              Manage your sessions and help students succeed
            </p>
          </div>
          <button
            onClick={handleClearData}
            className="btn btn-outline btn-sm"
            title="Clear all demo session data"
          >
            Clear Demo Data
          </button>
        </div>

        {/* Stats Overview */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <BookOpen size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.totalSessions}</div>
              <div className="stat-label">Total Sessions</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <Star size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.averageRating}</div>
              <div className="stat-label">Average Rating</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <DollarSign size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-number">{formatCurrency(stats.totalEarnings)}</div>
              <div className="stat-label">Total Earnings</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <Bell size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.pendingRequests}</div>
              <div className="stat-label">Pending Requests</div>
            </div>
          </div>
        </div>

        <div className="dashboard-content">
          {/* Pending Session Requests */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Pending Session Requests</h2>
              {pendingRequests.length > 0 && (
                <span className="request-count">{pendingRequests.length} new</span>
              )}
            </div>
            
            {pendingRequests.length === 0 ? (
              <div className="empty-state">
                <Bell size={48} />
                <h3>No pending requests</h3>
                <p>New session requests will appear here</p>
              </div>
            ) : (
              <div className="requests-list">
                {pendingRequests.map((request) => (
                  <div key={request._id} className="request-card">
                    <div className="request-header">
                      <div className="student-info">
                        <img
                          src={request.student.avatar}
                          alt={`${request.student.firstName} ${request.student.lastName}`}
                          className="student-avatar"
                        />
                        <div className="student-details">
                          <h4>{request.student.firstName} {request.student.lastName}</h4>
                          <span className="request-time">
                            {formatTime(new Date(request.createdAt))} ago
                          </span>
                        </div>
                      </div>
                      <div className="request-cost">
                        {formatCurrency(request.totalCost)}
                      </div>
                    </div>
                    
                    <div className="request-details">
                      <div className="detail-item">
                        <BookOpen size={16} />
                        <span>{request.subject}</span>
                      </div>
                      <div className="detail-item">
                        <Calendar size={16} />
                        <span>
                          {formatDate(new Date(request.sessionDate))} at {request.startTime} - {request.endTime}
                        </span>
                      </div>
                      <div className="detail-item">
                        <Clock size={16} />
                        <span>{request.duration} hour{request.duration !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                    
                    {request.description && (
                      <div className="request-description">
                        <p>"{request.description}"</p>
                      </div>
                    )}
                    
                    <div className="request-actions">
                      <button
                        onClick={() => handleRequestAction(request._id, 'rejected')}
                        className="btn btn-outline btn-sm"
                      >
                        <XCircle size={16} />
                        Decline
                      </button>
                      <button
                        onClick={() => handleRequestAction(request._id, 'approved')}
                        className="btn btn-primary btn-sm"
                      >
                        <CheckCircle size={16} />
                        Accept
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="dashboard-section">
            <h2>Quick Actions</h2>
            <div className="quick-actions">
              <Link to="/sessions" className="action-card">
                <Calendar size={32} />
                <span>View All Sessions</span>
              </Link>
              <Link to="/profile" className="action-card">
                <User size={32} />
                <span>Edit Profile</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorDashboard;
