import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { sessionAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { getAvatarUrl, formatCurrency, formatDate, formatTime, formatSessionTime } from '../../utils/helpers';
import LoadingSpinner from '../common/LoadingSpinner';
import SessionActions from './SessionActions';
import {
  Clock,
  CheckCircle,
  XCircle,
  Ban,
  RotateCcw,
  Calendar,
  UserX,
  Link as LinkIcon
} from 'lucide-react';
import './SessionCard.css';

const SessionCard = ({ session, userRole, onUpdate }) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusUpdate = async (status, data = {}) => {
    try {
      setIsUpdating(true);
      const response = await sessionAPI.updateSession(session._id, { status, ...data });
      
      onUpdate(session._id, response.data.session);
      toast.success(`Session ${status} successfully`);
    } catch (error) {
      console.error('Error updating session:', error);
      const errorMessage = error.response?.data?.message || `Failed to ${status} session`;
      toast.error(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'warning',
      'approved': 'success',
      'rejected': 'error',
      'cancelled': 'error',
      'in-progress': 'info',
      'completed': 'success',
      'no-show': 'error'
    };
    return colors[status] || 'gray';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'pending': <Clock size={14} />,
      'approved': <CheckCircle size={14} />,
      'rejected': <XCircle size={14} />,
      'cancelled': <Ban size={14} />,
      'in-progress': <RotateCcw size={14} />,
      'completed': <CheckCircle size={14} />,
      'no-show': <UserX size={14} />
    };
    return icons[status] || <Calendar size={14} />;
  };

  const isStudent = userRole === 'student';
  const isTutor = userRole === 'tutor';
  const otherUser = isStudent ? session.tutor : session.student;
  const sessionDate = new Date(session.sessionDate);
  const isUpcoming = sessionDate > new Date() && ['pending', 'approved'].includes(session.status);
  const isPast = sessionDate < new Date();

  return (
    <div className={`session-card ${session.status}`}>
      <div className="session-card-header">
        <div className="session-user">
          <div className="user-avatar">
            <img 
              src={getAvatarUrl(otherUser)} 
              alt={`${otherUser.firstName} ${otherUser.lastName}`}
              className="avatar-image"
            />
          </div>
          <div className="user-info">
            <h3 className="user-name">
              {isStudent ? 'Tutor: ' : 'Student: '}
              {otherUser.firstName} {otherUser.lastName}
            </h3>
            <div className="session-subject">{session.subject}</div>
          </div>
        </div>
        
        <div className="session-status">
          <span className={`status-badge status-${getStatusColor(session.status)}`}>
            <span className="status-icon">{getStatusIcon(session.status)}</span>
            <span className="status-text">{session.status.replace('-', ' ')}</span>
          </span>
        </div>
      </div>

      <div className="session-card-body">
        <div className="session-details">
          <div className="detail-row">
            <div className="detail-item">
              <span className="detail-icon">📅</span>
              <span className="detail-text">{formatDate(sessionDate)}</span>
            </div>
            <div className="detail-item">
              <span className="detail-icon">⏰</span>
              <span className="detail-text">
                {formatSessionTime(session.startTime, session.endTime)}
              </span>
            </div>
          </div>
          
          <div className="detail-row">
            <div className="detail-item">
              <span className="detail-icon">⏱️</span>
              <span className="detail-text">{session.duration}h duration</span>
            </div>
            <div className="detail-item">
              <span className="detail-icon">💰</span>
              <span className="detail-text">{formatCurrency(session.totalCost)}</span>
            </div>
          </div>

          {session.sessionType && (
            <div className="detail-row">
              <div className="detail-item">
                <span className="detail-icon">
                  {session.sessionType === 'online' ? '💻' : '🏢'}
                </span>
                <span className="detail-text">
                  {session.sessionType === 'online' ? 'Online Session' : 'In-Person Session'}
                </span>
              </div>
            </div>
          )}
        </div>

        {session.description && (
          <div className="session-description">
            <p>{session.description}</p>
          </div>
        )}

        {session.rejectionReason && (
          <div className="rejection-reason">
            <strong>Rejection Reason:</strong> {session.rejectionReason}
          </div>
        )}

        {session.meetingUrl && session.status === 'approved' && (
          <div className="meeting-info">
            <div className="meeting-url">
              <span className="detail-icon"><LinkIcon size={16} /></span>
              <a
                href={session.meetingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="meeting-link"
              >
                Join Meeting
              </a>
            </div>
          </div>
        )}

        {session.rating && session.review && (
          <div className="session-rating">
            <div className="rating-stars">
              {'★'.repeat(session.rating)}{'☆'.repeat(5 - session.rating)}
            </div>
            <p className="rating-review">{session.review}</p>
          </div>
        )}
      </div>

      <div className="session-card-footer">
        <div className="session-meta">
          <span className="session-id">#{session._id.slice(-6)}</span>
          {isUpcoming && (
            <span className="upcoming-badge">Upcoming</span>
          )}
          {isPast && session.status === 'completed' && !session.rating && isStudent && (
            <span className="rate-reminder">Rate this session</span>
          )}
        </div>

        <div className="session-actions">
          {isUpdating ? (
            <LoadingSpinner size="small" text="" />
          ) : (
            <SessionActions
              session={session}
              userRole={userRole}
              onStatusUpdate={handleStatusUpdate}
              isUpcoming={isUpcoming}
              isPast={isPast}
            />
          )}
          
          <Link 
            to={`/sessions/${session._id}`}
            className="btn btn-outline btn-sm"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SessionCard;
