import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { videoAPI } from '../../services/api';
import { toast } from 'react-toastify';
import VideoCall from './VideoCall';
import LoadingSpinner from '../common/LoadingSpinner';
import './VideoButton.css';

const VideoButton = ({ session, className = '' }) => {
  const { user } = useAuth();
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const isTutor = session.tutor._id === user._id;
  const canStartVideo = ['approved', 'in-progress'].includes(session.status);
  const hasVideoRoom = !!session.meetingUrl;

  const handleVideoClick = async () => {
    if (!canStartVideo) {
      toast.error('Video calls are only available for approved sessions');
      return;
    }

    try {
      setLoading(true);

      // If no video room exists and user is tutor, create one
      if (!hasVideoRoom && isTutor) {
        await createVideoRoom();
      }

      // Open video call
      setIsVideoOpen(true);
    } catch (error) {
      console.error('Error starting video call:', error);
      toast.error('Failed to start video call');
    } finally {
      setLoading(false);
    }
  };

  const createVideoRoom = async () => {
    try {
      const response = await videoAPI.createVideoRoom(session._id, {
        max_participants: 2,
        enable_chat: true,
        enable_screenshare: true,
        enable_recording: false
      });

      toast.success('Video room created successfully');
      
      // Update session object with new meeting URL
      session.meetingUrl = response.data.room.url;
      session.videoRoomId = response.data.room.name;
    } catch (error) {
      console.error('Error creating video room:', error);
      throw error;
    }
  };

  const handleCallEnd = () => {
    setIsVideoOpen(false);
    toast.info('Video call ended');
  };

  if (!canStartVideo) {
    return null;
  }

  return (
    <>
      <button
        onClick={handleVideoClick}
        disabled={loading}
        className={`video-button ${className} ${hasVideoRoom ? 'has-room' : 'no-room'}`}
        title={hasVideoRoom ? 'Join video call' : 'Start video call'}
      >
        {loading ? (
          <>
            <LoadingSpinner size="small" />
            {isTutor && !hasVideoRoom ? 'Creating...' : 'Joining...'}
          </>
        ) : (
          <>
            📹 {hasVideoRoom ? 'Join Video' : 'Start Video'}
          </>
        )}
      </button>

      <VideoCall
        session={session}
        isOpen={isVideoOpen}
        onClose={() => setIsVideoOpen(false)}
        onCallEnd={handleCallEnd}
      />
    </>
  );
};

export default VideoButton;
