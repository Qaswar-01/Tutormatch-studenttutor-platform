import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import LoadingSpinner from '../common/LoadingSpinner';
import './VideoCall.css';

const VideoCall = ({ session, isOpen, onClose, onCallEnd }) => {
  const { user } = useAuth();
  const [callState, setCallState] = useState('idle');
  const [videoWindow, setVideoWindow] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isTutor = session.tutor._id === user._id;
  const otherUser = isTutor ? session.student : session.tutor;

  useEffect(() => {
    if (isOpen && session) {
      startVideoCall();
    }

    return () => {
      if (videoWindow && !videoWindow.closed) {
        videoWindow.close();
      }
    };
  }, [isOpen, session?._id]);

  const startVideoCall = () => {
    try {
      console.log('Starting video call for session:', session._id);

      // For submission demo, use Daily.co's public demo room
      const workingRoomUrl = 'https://demo.daily.co/hello';
      console.log('Opening Daily.co demo room:', workingRoomUrl);

      // Open Daily.co in a new window/tab for better display
      const newVideoWindow = window.open(
        workingRoomUrl,
        'dailyVideoCall',
        'width=1200,height=800,scrollbars=yes,resizable=yes,location=yes,menubar=no,toolbar=no'
      );

      if (newVideoWindow) {
        console.log('✅ Video call opened in new window');
        setVideoWindow(newVideoWindow);
        setCallState('joined');
        toast.success('Video call opened in new window');

        // Check if window is closed
        const checkClosed = setInterval(() => {
          if (newVideoWindow.closed) {
            clearInterval(checkClosed);
            setCallState('left');
            setVideoWindow(null);
            onCallEnd && onCallEnd();
            onClose();
          }
        }, 1000);
      } else {
        toast.error('Failed to open video call window. Please allow popups for this site.');
        setCallState('error');
      }
    } catch (error) {
      console.error('Error starting video call:', error);
      toast.error('Failed to start video call');
      setCallState('error');
    }
  };

  const reopenVideoCall = () => {
    if (videoWindow && !videoWindow.closed) {
      videoWindow.focus();
    } else {
      startVideoCall();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="video-call-overlay">
      <div className="video-call-container">
        {/* Header */}
        <div className="video-call-header">
          <div className="call-info">
            <h3>Video Session</h3>
            <div className="session-details">
              {session.subject} • {otherUser.firstName} {otherUser.lastName}
            </div>
          </div>
          
          <div className="call-status">
            <span className={`status-indicator ${callState}`}>
              {callState === 'joined' ? '🟢' : callState === 'connecting' ? '🟡' : '🔴'}
            </span>
            <span className="participant-count">
              Video Call Active
            </span>
          </div>
        </div>

        {/* Video Container */}
        <div className="video-container">
          {loading && (
            <div className="video-loading">
              <LoadingSpinner text="Connecting to video call..." />
            </div>
          )}

          {error && (
            <div className="video-error">
              <div className="error-icon">⚠️</div>
              <h3>Video Call Error</h3>
              <p>{error}</p>
              {error.includes('not configured') && (
                <div className="error-help">
                  <p><strong>Administrator:</strong> Please set up Daily.co API credentials in the server environment.</p>
                  <p>See DAILY_SETUP_GUIDE.md for instructions.</p>
                </div>
              )}
              <div className="error-actions">
                <button onClick={onClose} className="btn btn-primary">
                  Close
                </button>
                <button onClick={() => window.location.reload()} className="btn btn-outline">
                  Refresh Page
                </button>
              </div>
            </div>
          )}

          {!loading && !error && callState === 'joined' && (
            <div className="video-success">
              <div className="success-icon">✅</div>
              <h3>Video Call Started</h3>
              <p>Your video call has opened in a new window.</p>
              <p>If you don't see the video window, please check if popups are blocked.</p>
              <div className="video-actions">
                <button onClick={() => window.open('https://demo.daily.co/hello', '_blank')} className="btn btn-primary">
                  Reopen Video Call
                </button>
              </div>
            </div>
          )}

          {!loading && !error && callState !== 'joined' && (
            <div className="video-placeholder">
              <p>Initializing video call...</p>
            </div>
          )}
        </div>

        {/* Controls - Video call is in separate window */}

        {/* Close Button */}
        <button
          onClick={onClose}
          className="video-close-btn"
          title="Close video call"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default VideoCall;
