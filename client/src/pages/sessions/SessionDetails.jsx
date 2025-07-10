import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { sessionAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { getAvatarUrl, formatCurrency, formatDate, formatTime, formatSessionTime } from '../../utils/helpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import SessionActions from '../../components/sessions/SessionActions';
import ChatButton from '../../components/chat/ChatButton';

import {
  ArrowLeft,
  Calendar,
  Clock,
  DollarSign,
  User,
  MapPin,
  FileText,
  Star,
  AlertCircle,
  CheckCircle,
  XCircle,
  Ban,
  RotateCcw
} from 'lucide-react';
import './SessionDetails.css';

const SessionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSessionDetails();
  }, [id]);

  const loadSessionDetails = async () => {
    try {
      setLoading(true);
      const response = await sessionAPI.getSessionById(id);
      console.log('Session data received:', response.data); // Debug log
      setSession(response.data.session);
    } catch (error) {
      console.error('Error loading session details:', error);
      setError(error.response?.data?.message || 'Failed to load session details');
      toast.error('Failed to load session details');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (status, data = {}) => {
    try {
      const response = await sessionAPI.updateSession(session._id, { status, ...data });
      setSession(response.data.session);
      toast.success(`Session ${status} successfully`);
    } catch (error) {
      console.error('Error updating session:', error);
      const errorMessage = error.response?.data?.message || `Failed to ${status} session`;
      toast.error(errorMessage);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': '#f59e0b',
      'approved': '#10b981',
      'rejected': '#ef4444',
      'cancelled': '#ef4444',
      'in-progress': '#3b82f6',
      'completed': '#10b981',
      'no-show': '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'pending': <Clock size={20} />,
      'approved': <CheckCircle size={20} />,
      'rejected': <XCircle size={20} />,
      'cancelled': <Ban size={20} />,
      'in-progress': <RotateCcw size={20} />,
      'completed': <CheckCircle size={20} />,
      'no-show': <AlertCircle size={20} />
    };
    return icons[status] || <Calendar size={20} />;
  };

  if (loading) {
    return (
      <div className="session-details-loading">
        <LoadingSpinner text="Loading session details..." />
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="session-details-error">
        <div className="error-content">
          <AlertCircle size={48} />
          <h2>Session Not Found</h2>
          <p>{error || 'The requested session could not be found.'}</p>
          <button onClick={() => navigate('/sessions')} className="btn btn-primary">
            Back to Sessions
          </button>
        </div>
      </div>
    );
  }

  const isStudent = user.role === 'student';
  const isTutor = user.role === 'tutor';
  const otherUser = isStudent ? session.tutor : session.student;
  const sessionDate = new Date(session.sessionDate);
  const isUpcoming = sessionDate > new Date() && ['pending', 'approved'].includes(session.status);
  const isPast = sessionDate < new Date();

  // Debug log to see session structure
  console.log('Session object:', session);
  console.log('Session date:', session.sessionDate);
  console.log('Start time:', session.startTime);
  console.log('End time:', session.endTime);
  console.log('Total cost:', session.totalCost);
  console.log('Duration:', session.duration);

  return (
    <div className="session-details-container">
      {/* Header */}
      <div className="session-details-header">
        <button 
          onClick={() => navigate('/sessions')}
          className="back-button"
        >
          <ArrowLeft size={20} />
          Back to Sessions
        </button>
        
        <div className="session-title">
          <h1>Session Details</h1>
          <span className="session-id">#{session._id.slice(-8)}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="session-details-content">
        {/* Status Card */}
        <div className="status-card">
          <div 
            className="status-indicator"
            style={{ backgroundColor: getStatusColor(session.status) }}
          >
            {getStatusIcon(session.status)}
            <span className="status-text">
              {session.status.replace('-', ' ').toUpperCase()}
            </span>
          </div>
          
          {isUpcoming && (
            <div className="upcoming-badge">
              <Calendar size={16} />
              Upcoming Session
            </div>
          )}
        </div>

        {/* Participant Info */}
        <div className="participant-card">
          <div className="participant-header">
            <h3>
              <User size={20} />
              {isStudent ? 'Your Tutor' : 'Your Student'}
            </h3>
          </div>
          
          <div className="participant-info">
            <div className="participant-avatar">
              <img 
                src={getAvatarUrl(otherUser)} 
                alt={`${otherUser.firstName} ${otherUser.lastName}`}
              />
            </div>
            <div className="participant-details">
              <h4>{otherUser.firstName} {otherUser.lastName}</h4>
              <p>{otherUser.email}</p>
              {otherUser.bio && <p className="bio">{otherUser.bio}</p>}
            </div>
          </div>
        </div>

        {/* Session Info */}
        <div className="session-info-card">
          <h3>Session Information</h3>
          
          <div className="info-grid">
            <div className="info-item">
              <FileText size={18} />
              <div>
                <label>Subject</label>
                <span>{session.subject}</span>
              </div>
            </div>
            
            <div className="info-item">
              <Calendar size={18} />
              <div>
                <label>Date</label>
                <span>{session.sessionDate ? formatDate(sessionDate) : 'Not specified'}</span>
              </div>
            </div>

            <div className="info-item">
              <Clock size={18} />
              <div>
                <label>Time</label>
                <span>
                  {session.startTime || session.endTime
                    ? formatSessionTime(session.startTime, session.endTime)
                    : 'Not specified'
                  }
                </span>
              </div>
            </div>

            <div className="info-item">
              <Clock size={18} />
              <div>
                <label>Duration</label>
                <span>
                  {session.duration
                    ? `${session.duration} hour${session.duration !== 1 ? 's' : ''}`
                    : 'Not specified'
                  }
                </span>
              </div>
            </div>

            <div className="info-item">
              <DollarSign size={18} />
              <div>
                <label>Total Cost</label>
                <span>
                  {session.totalCost !== undefined && session.totalCost !== null
                    ? formatCurrency(session.totalCost)
                    : 'Not specified'
                  }
                </span>
              </div>
            </div>
            
            <div className="info-item">
              <MapPin size={18} />
              <div>
                <label>Session Type</label>
                <span>
                  {session.sessionType === 'online' ? '💻 Online' : '🏢 In-Person'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        {session.description && (
          <div className="description-card">
            <h3>Description</h3>
            <p>{session.description}</p>
          </div>
        )}

        {/* Rejection/Cancellation Reason */}
        {(session.rejectionReason || session.cancellationReason) && (
          <div className="reason-card">
            <h3>
              {session.rejectionReason ? 'Rejection Reason' : 'Cancellation Reason'}
            </h3>
            <p>{session.rejectionReason || session.cancellationReason}</p>
          </div>
        )}

        {/* Rating */}
        {session.rating && (
          <div className="rating-card">
            <h3>Session Rating</h3>
            <div className="rating-display">
              <div className="stars">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={20} 
                    fill={i < session.rating ? '#fbbf24' : 'none'}
                    color={i < session.rating ? '#fbbf24' : '#d1d5db'}
                  />
                ))}
              </div>
              <span className="rating-value">{session.rating}/5</span>
            </div>
            {session.review && (
              <div className="review-text">
                <p>"{session.review}"</p>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="actions-card">
          <h3>Actions</h3>
          <div className="action-buttons">
            <SessionActions
              session={session}
              userRole={user.role}
              onStatusUpdate={handleStatusUpdate}
              isUpcoming={isUpcoming}
              isPast={isPast}
            />
            
            {session.status === 'approved' && (
              <ChatButton session={session} />
            )}
            
            {session.status === 'approved' && (
              <Link 
                to={`/sessions/${session._id}/room`}
                className="btn btn-primary"
              >
                Enter Session Room
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionDetails;
