import React, { useState, useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';
import { sessionRequestStorage } from '../../utils/sessionStorage';
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
  AlertCircle
} from 'lucide-react';
import { formatCurrency, formatDate, formatTime } from '../../utils/helpers';
import './SessionRequestStatus.css';

const SessionRequestStatus = ({ session, onClose, onSessionApproved }) => {
  const { socket } = useSocket();
  const [currentStatus, setCurrentStatus] = useState(session.status);
  const [showChatVideo, setShowChatVideo] = useState(false);

  useEffect(() => {
    if (socket && session) {
      // Listen for real-time status updates
      const handleStatusUpdate = (statusData) => {
        console.log('Received status update:', statusData);
        if (statusData.sessionId === session._id) {
          setCurrentStatus(statusData.status);

          // Enable chat/video when approved
          if (statusData.status === 'approved') {
            setShowChatVideo(true);
            onSessionApproved && onSessionApproved(statusData);
          }
        }
      };

      socket.on('session_status_updated', handleStatusUpdate);

      return () => {
        socket.off('session_status_updated', handleStatusUpdate);
      };
    }
  }, [socket, session]);

  // Also check local storage for status updates
  useEffect(() => {
    const checkStatusUpdate = () => {
      if (session && session._id) {
        // Check if status has been updated in local storage
        const allRequests = sessionRequestStorage.getAll();
        const updatedRequest = allRequests.find(req => req._id === session._id);

        if (updatedRequest && updatedRequest.status !== currentStatus) {
          console.log('Status updated in local storage:', updatedRequest.status);
          setCurrentStatus(updatedRequest.status);

          if (updatedRequest.status === 'approved') {
            setShowChatVideo(true);
            onSessionApproved && onSessionApproved(updatedRequest);
          }
        }
      }
    };

    // Check immediately and then every 2 seconds
    checkStatusUpdate();
    const interval = setInterval(checkStatusUpdate, 2000);

    return () => clearInterval(interval);
  }, [session, currentStatus]);

  // Check if chat/video should be available
  useEffect(() => {
    if (currentStatus === 'approved') {
      setShowChatVideo(true);
    }
  }, [currentStatus]);
  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock size={24} className="status-icon pending" />;
      case 'approved':
        return <CheckCircle size={24} className="status-icon approved" />;
      case 'rejected':
        return <XCircle size={24} className="status-icon rejected" />;
      default:
        return <Clock size={24} className="status-icon pending" />;
    }
  };

  const getStatusMessage = (status) => {
    switch (status) {
      case 'pending':
        return {
          title: 'Request Sent Successfully!',
          message: 'Your session request has been sent to the tutor. They will review and respond within 24 hours.',
          action: 'Waiting for tutor response...',
          color: 'warning'
        };
      case 'approved':
        return {
          title: 'Session Approved! 🎉',
          message: 'Great news! Your tutor has approved your session request. You can now chat with your tutor and join the video session.',
          action: 'Session confirmed and ready to start',
          color: 'success'
        };
      case 'rejected':
        return {
          title: 'Session Request Declined',
          message: 'Unfortunately, your tutor cannot accommodate this session request. You can try booking a different time slot.',
          action: 'Try booking a different time',
          color: 'error'
        };
      default:
        return {
          title: 'Request Sent',
          message: 'Your session request is being processed.',
          action: 'Please wait for confirmation',
          color: 'info'
        };
    }
  };

  const statusInfo = getStatusMessage(currentStatus);

  const handleStartChat = () => {
    // Navigate to session room for chat
    window.location.href = `/sessions/${session._id}/room`;
  };

  const handleStartVideo = () => {
    // Navigate to session room for video
    window.location.href = `/sessions/${session._id}/room?video=true`;
  };



  return (
    <div className="session-request-status">
      <div className={`status-header ${statusInfo.color}`}>
        {getStatusIcon(currentStatus)}
        <div className="status-content">
          <h2 className="status-title">{statusInfo.title}</h2>
          <p className="status-message">{statusInfo.message}</p>
          <p className="status-action">{statusInfo.action}</p>
        </div>
      </div>

      <div className="session-details">
        <h3>Session Details</h3>
        
        <div className="detail-grid">
          <div className="detail-item">
            <User size={16} />
            <div className="detail-content">
              <span className="detail-label">Tutor</span>
              <span className="detail-value">
                {session.tutorInfo?.firstName} {session.tutorInfo?.lastName}
              </span>
            </div>
          </div>

          <div className="detail-item">
            <BookOpen size={16} />
            <div className="detail-content">
              <span className="detail-label">Subject</span>
              <span className="detail-value">{session.subject}</span>
            </div>
          </div>

          <div className="detail-item">
            <Calendar size={16} />
            <div className="detail-content">
              <span className="detail-label">Date & Time</span>
              <span className="detail-value">
                {formatDate(new Date(session.sessionDate))} at {session.startTime} - {session.endTime}
              </span>
            </div>
          </div>

          <div className="detail-item">
            <DollarSign size={16} />
            <div className="detail-content">
              <span className="detail-label">Total Cost</span>
              <span className="detail-value">{formatCurrency(session.totalCost)}</span>
            </div>
          </div>

          {session.sessionType === 'online' ? (
            <div className="detail-item">
              <Video size={16} />
              <div className="detail-content">
                <span className="detail-label">Session Type</span>
                <span className="detail-value">Online ({session.preferredPlatform})</span>
              </div>
            </div>
          ) : (
            <div className="detail-item">
              <MapPin size={16} />
              <div className="detail-content">
                <span className="detail-label">Session Type</span>
                <span className="detail-value">In-Person</span>
              </div>
            </div>
          )}
        </div>

        {session.description && (
          <div className="session-description">
            <h4>Session Description</h4>
            <p>{session.description}</p>
          </div>
        )}
      </div>

      {/* Chat and Video Actions - Only available after approval */}
      {showChatVideo && currentStatus === 'approved' && (
        <div className="session-actions">
          <h3>Ready to Start Your Session!</h3>
          <p>Your session has been approved. You can now communicate with your tutor.</p>

          <div className="action-buttons">
            <button
              onClick={handleStartChat}
              className="btn btn-outline btn-lg"
            >
              <MessageCircle size={18} />
              Start Chat
            </button>

            <button
              onClick={handleStartVideo}
              className="btn btn-primary btn-lg"
            >
              <Video size={18} />
              Join Video Session
            </button>
          </div>
        </div>
      )}

      {/* Regular Actions */}
      <div className="status-actions">
        <button onClick={onClose} className="btn btn-primary">
          {currentStatus === 'approved' ? 'Continue' : 'Got it!'}
        </button>
        <button
          onClick={() => window.location.href = '/sessions'}
          className="btn btn-outline"
        >
          View All Sessions
        </button>
      </div>

      <div className="next-steps">
        <h4>What happens next?</h4>
        <ul>
          {currentStatus === 'pending' && (
            <>
              <li>The tutor will review your request within 24 hours</li>
              <li>You'll receive a real-time notification when they respond</li>
              <li>If approved, chat and video features will become available</li>
              <li>You'll get session joining instructions via email</li>
            </>
          )}
          {currentStatus === 'approved' && (
            <>
              <li>✅ Your session is confirmed and ready to start</li>
              <li>💬 Chat with your tutor is now available</li>
              <li>📹 Video session can be started anytime</li>
              <li>📧 Check your email for session confirmation details</li>
              <li>⏰ You'll receive a reminder 1 hour before the session</li>
            </>
          )}
          {currentStatus === 'rejected' && (
            <>
              <li>Try booking a different time slot with this tutor</li>
              <li>Browse other tutors who teach {session.subject}</li>
              <li>Contact support if you need help finding alternatives</li>
              <li>Consider adjusting your preferred time or date</li>
            </>
          )}
        </ul>
      </div>

      {/* Real-time status indicator */}
      <div className="realtime-indicator">
        <div className="indicator-dot"></div>
        <span>Real-time updates enabled</span>
      </div>
    </div>
  );
};

export default SessionRequestStatus;
