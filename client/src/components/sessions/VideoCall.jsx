import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff,
  Monitor,
  Settings,
  Users,
  MessageCircle
} from 'lucide-react';
import { toast } from 'react-toastify';
import './VideoCall.css';

const VideoCall = ({ session, onEndCall, onToggleChat }) => {
  const { user } = useAuth();
  const { socket, startVideoCall, endVideoCall } = useSocket();
  const [isCallActive, setIsCallActive] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [participants, setParticipants] = useState([]);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const callStartTimeRef = useRef(null);
  const intervalRef = useRef(null);

  const isStudent = user.role === 'student';
  const otherUser = isStudent ? session.tutor : session.student;

  useEffect(() => {
    // Initialize video call
    initializeCall();
    
    return () => {
      cleanup();
    };
  }, []);

  useEffect(() => {
    if (isCallActive && !intervalRef.current) {
      callStartTimeRef.current = Date.now();
      intervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - callStartTimeRef.current) / 1000);
        setCallDuration(elapsed);
      }, 1000);
    }
  }, [isCallActive]);

  const initializeCall = async () => {
    try {
      // Get user media (camera and microphone)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Mock participants for demo
      setParticipants([
        {
          id: user._id,
          name: `${user.firstName} ${user.lastName}`,
          role: user.role,
          isLocal: true,
          videoEnabled: true,
          audioEnabled: true
        },
        {
          id: otherUser._id,
          name: `${otherUser.firstName} ${otherUser.lastName}`,
          role: otherUser.role,
          isLocal: false,
          videoEnabled: true,
          audioEnabled: true
        }
      ]);

      setIsCallActive(true);
      toast.success('Video call started successfully!');

      // Notify other participant via socket
      if (socket) {
        startVideoCall(session._id, 'mock-room-url');
      }

    } catch (error) {
      console.error('Error initializing video call:', error);
      toast.error('Failed to access camera/microphone. Please check permissions.');
    }
  };

  const cleanup = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Stop local video stream
    if (localVideoRef.current?.srcObject) {
      const tracks = localVideoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
    }
  };

  const handleEndCall = () => {
    cleanup();
    setIsCallActive(false);
    
    if (socket) {
      endVideoCall(session._id);
    }
    
    toast.info('Video call ended');
    onEndCall && onEndCall();
  };

  const toggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
    
    if (localVideoRef.current?.srcObject) {
      const videoTrack = localVideoRef.current.srcObject.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoEnabled;
      }
    }
    
    toast.info(isVideoEnabled ? 'Camera turned off' : 'Camera turned on');
  };

  const toggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled);
    
    if (localVideoRef.current?.srcObject) {
      const audioTrack = localVideoRef.current.srcObject.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isAudioEnabled;
      }
    }
    
    toast.info(isAudioEnabled ? 'Microphone muted' : 'Microphone unmuted');
  };

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }
        
        setIsScreenSharing(true);
        toast.success('Screen sharing started');
      } else {
        // Switch back to camera
        const cameraStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = cameraStream;
        }
        
        setIsScreenSharing(false);
        toast.info('Screen sharing stopped');
      }
    } catch (error) {
      console.error('Error toggling screen share:', error);
      toast.error('Failed to toggle screen sharing');
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="video-call">
      <div className="video-call-header">
        <div className="call-info">
          <h3>Video Session: {session.subject}</h3>
          <div className="call-details">
            <span className="call-duration">{formatDuration(callDuration)}</span>
            <span className="participant-count">
              <Users size={14} />
              {participants.length} participants
            </span>
          </div>
        </div>
        
        <div className="call-header-actions">
          <button 
            onClick={onToggleChat}
            className="btn btn-outline btn-sm"
            title="Toggle Chat"
          >
            <MessageCircle size={16} />
            Chat
          </button>
        </div>
      </div>

      <div className="video-container">
        {/* Remote Video (Other Participant) */}
        <div className="remote-video-container">
          <video
            ref={remoteVideoRef}
            className="remote-video"
            autoPlay
            playsInline
            poster={otherUser.avatar}
          />
          <div className="video-overlay">
            <span className="participant-name">
              {otherUser.firstName} {otherUser.lastName}
            </span>
          </div>
          {/* Mock remote video placeholder */}
          <div className="mock-remote-video">
            <img 
              src={otherUser.avatar || `https://ui-avatars.com/api/?name=${otherUser.firstName}+${otherUser.lastName}&size=200`}
              alt={`${otherUser.firstName} ${otherUser.lastName}`}
              className="participant-avatar"
            />
            <p>{otherUser.firstName} {otherUser.lastName}</p>
            <span className="connection-status">Connected</span>
          </div>
        </div>

        {/* Local Video (Self) */}
        <div className="local-video-container">
          <video
            ref={localVideoRef}
            className="local-video"
            autoPlay
            playsInline
            muted
          />
          <div className="video-overlay">
            <span className="participant-name">You</span>
          </div>
        </div>
      </div>

      <div className="video-controls">
        <div className="control-group">
          <button
            onClick={toggleAudio}
            className={`control-btn ${!isAudioEnabled ? 'disabled' : ''}`}
            title={isAudioEnabled ? 'Mute microphone' : 'Unmute microphone'}
          >
            {isAudioEnabled ? <Mic size={20} /> : <MicOff size={20} />}
          </button>

          <button
            onClick={toggleVideo}
            className={`control-btn ${!isVideoEnabled ? 'disabled' : ''}`}
            title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
          >
            {isVideoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
          </button>

          <button
            onClick={toggleScreenShare}
            className={`control-btn ${isScreenSharing ? 'active' : ''}`}
            title={isScreenSharing ? 'Stop screen sharing' : 'Share screen'}
          >
            <Monitor size={20} />
          </button>
        </div>

        <div className="control-group">
          <button
            onClick={handleEndCall}
            className="control-btn end-call"
            title="End call"
          >
            <PhoneOff size={20} />
          </button>
        </div>

        <div className="control-group">
          <button
            className="control-btn"
            title="Settings"
          >
            <Settings size={20} />
          </button>
        </div>
      </div>

      {!isCallActive && (
        <div className="call-connecting">
          <div className="connecting-spinner"></div>
          <p>Connecting to video call...</p>
        </div>
      )}
    </div>
  );
};

export default VideoCall;
