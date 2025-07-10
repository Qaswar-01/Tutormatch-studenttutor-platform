import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { sessionAPI, videoAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { 
  MessageCircle, 
  Video, 
  VideoOff,
  ArrowLeft,
  Clock,
  User,
  BookOpen
} from 'lucide-react';
import VideoCall from '../../components/video/VideoCall';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate, formatTime } from '../../utils/helpers';
import './SessionRoom.css';

const SessionRoom = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { joinSessionRoom, leaveSessionRoom } = useSocket();
  
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showVideo, setShowVideo] = useState(false);

  const [sessionStarted, setSessionStarted] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    loadSession();
    
    return () => {
      if (session) {
        leaveSessionRoom(session._id);
      }
    };
  }, [id]);

  useEffect(() => {
    if (session) {
      joinSessionRoom(session._id);
    }
  }, [session]);

  // Cleanup effect to prevent duplicate video instances
  useEffect(() => {
    return () => {
      // Cleanup when component unmounts
      if (showVideo) {
        setShowVideo(false);
      }
    };
  }, []);

  const loadSession = async () => {
    try {
      setLoading(true);

      const response = await sessionAPI.getSessionById(id);
      const sessionData = response.data.session;
      setSession(sessionData);

      // Check if user has access to this session
      if (sessionData && sessionData.status !== 'approved') {
        setAccessDenied(true);
        toast.error('This session is not yet approved. Chat and video are only available after tutor approval.');
        return;
      }

      // Reset access denied if session is approved
      if (sessionData && sessionData.status === 'approved') {
        setAccessDenied(false);
      }

    } catch (error) {
      console.error('Error loading session:', error);
      toast.error('Failed to load session');
      navigate('/sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleStartVideo = async () => {
    try {
      setLoading(true);

      // Check if video room already exists
      if (!session.videoRoomId) {
        // Create video room first (only tutors can create rooms)
        if (user.role === 'tutor') {
          console.log('Creating video room for session:', session._id);
          const createResponse = await videoAPI.createVideoRoom(session._id);
          console.log('Video room created:', createResponse);

          // Reload session to get updated videoRoomId
          await loadSession();

          // Wait a moment for the session to update
          setTimeout(() => {
            setShowVideo(true);
            setSessionStarted(true);
            toast.success('Video session started!');
            setLoading(false);
          }, 1000);
          return;
        } else {
          // Students need to wait for tutor to create room
          toast.error('Video room not available. Please ask your tutor to start the video session first.');
          setLoading(false);
          return;
        }
      }

      setShowVideo(true);
      setSessionStarted(true);
      toast.success('Video session started!');
    } catch (error) {
      console.error('Error starting video session:', error);
      if (error.response?.status === 404) {
        toast.error('Session not found. Please refresh the page.');
      } else if (error.response?.status === 400) {
        toast.error('Video room creation failed. Please try again.');
      } else {
        toast.error('Failed to start video session. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEndVideo = () => {
    console.log('Ending video session');
    setShowVideo(false);
    toast.info('Video session ended');
  };

  const handleVideoError = () => {
    console.log('Video error occurred, resetting state');
    setShowVideo(false);
    setSessionStarted(false);
    toast.error('Video session encountered an error. Please try again.');
  };



  const handleBackToSessions = () => {
    navigate('/sessions');
  };

  if (loading) {
    return (
      <div className="session-room">
        <div className="container">
          <LoadingSpinner text="Loading session..." />
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="session-room">
        <div className="container">
          <div className="error-message">
            <h2>Session Not Found</h2>
            <p>The session you're looking for doesn't exist or you don't have access to it.</p>
            <button onClick={handleBackToSessions} className="btn btn-primary">
              Back to Sessions
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (accessDenied || (session && session.status !== 'approved')) {
    return (
      <div className="session-room">
        <div className="container">
          <div className="access-denied-message">
            <div className="access-denied-icon">
              <Clock size={48} />
            </div>
            <h2>Session Not Yet Approved</h2>
            <p>
              This session is still pending approval from your tutor.
              Video features will become available once the tutor approves your request.
            </p>
            <div className="session-status">
              <span className={`status-badge ${session.status}`}>
                {session.status === 'pending' && 'Pending Approval'}
                {session.status === 'rejected' && 'Request Declined'}
                {session.status === 'cancelled' && 'Session Cancelled'}
              </span>
            </div>
            <div className="access-denied-actions">
              <button onClick={handleBackToSessions} className="btn btn-primary">
                Back to Sessions
              </button>
              <button
                onClick={() => window.location.reload()}
                className="btn btn-outline"
              >
                Check Status
              </button>
            </div>
            <div className="realtime-note">
              <div className="indicator-dot"></div>
              <span>You'll be notified in real-time when the status changes</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isStudent = user.role === 'student';
  const otherUser = isStudent ? session.tutor : session.student;

  return (
    <div className="session-room">
      {!showVideo && (
        <div className="session-room-header">
          <div className="header-left">
            <button 
              onClick={handleBackToSessions}
              className="btn btn-outline btn-sm"
            >
              <ArrowLeft size={16} />
              Back to Sessions
            </button>
            
            <div className="session-info">
              <h1>{session.subject} Session</h1>
              <div className="session-details">
                <span className="detail">
                  <User size={14} />
                  with {otherUser.firstName} {otherUser.lastName}
                </span>
                <span className="detail">
                  <Clock size={14} />
                  {formatDate(new Date(session.sessionDate))} at {session.startTime}
                </span>
                <span className="detail">
                  <BookOpen size={14} />
                  {session.duration} hour{session.duration !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>
          
          <div className="header-actions">
            {!sessionStarted && (
              <button
                onClick={handleStartVideo}
                className="btn btn-primary"
              >
                <Video size={18} />
                Start Video Session
              </button>
            )}

            {sessionStarted && !showVideo && (
              <button
                onClick={handleStartVideo}
                className="btn btn-success"
              >
                <Video size={18} />
                Resume Video
              </button>
            )}
          </div>
        </div>
      )}

      <div className={`session-content ${showVideo ? 'video-mode' : 'chat-mode'}`}>
        {showVideo ? (
          <VideoCall
            key={`video-call-${session._id}-${sessionStarted}`}
            session={session}
            onClose={handleEndVideo}
            onCallEnd={handleVideoError}
            isOpen={showVideo}
          />
        ) : (
          <div className="session-layout">
            <div className="session-placeholder">
                <div className="placeholder-content">
                  <Video size={64} className="placeholder-icon" />
                  <h2>Ready to Start Your Session?</h2>
                  <p>
                    {user.role === 'tutor'
                      ? `Connect with ${otherUser.firstName} via video call to begin the ${session.subject.toLowerCase()} session.`
                      : session.videoRoomId
                        ? `Join ${otherUser.firstName} in the video call for your ${session.subject.toLowerCase()} session.`
                        : `Waiting for ${otherUser.firstName} to start the video session. You'll be able to join once they create the room.`
                    }
                  </p>

                  <div className="session-actions">
                    <button
                      onClick={handleStartVideo}
                      className="btn btn-primary btn-lg"
                      disabled={loading || (user.role === 'student' && !session.videoRoomId)}
                    >
                      <Video size={20} />
                      {loading ? 'Creating Room...' :
                       user.role === 'tutor' ? 'Start Video Session' :
                       session.videoRoomId ? 'Join Video Session' : 'Waiting for Tutor...'}
                    </button>

                    {/* Refresh button for troubleshooting */}
                    <button
                      onClick={() => window.location.reload()}
                      className="btn btn-outline btn-lg"
                      title="Refresh if you're experiencing issues"
                    >
                      🔄 Refresh
                    </button>
                  </div>

                  <div className="session-summary">
                    <h3>Session Details</h3>
                    <div className="summary-grid">
                      <div className="summary-item">
                        <span className="label">Subject:</span>
                        <span className="value">{session.subject}</span>
                      </div>
                      <div className="summary-item">
                        <span className="label">Duration:</span>
                        <span className="value">{session.duration} hour{session.duration !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="summary-item">
                        <span className="label">Time:</span>
                        <span className="value">{session.startTime} - {session.endTime}</span>
                      </div>
                      <div className="summary-item">
                        <span className="label">Type:</span>
                        <span className="value">Online Session</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
          </div>
        )}
      </div>


    </div>
  );
};

export default SessionRoom;
