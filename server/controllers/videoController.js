const Session = require('../models/Session');
const videoService = require('../services/videoService');
const { validationResult } = require('express-validator');

// @desc    Create video room for session
// @route   POST /api/video/room/:sessionId
// @access  Private (Tutor only)
const createVideoRoom = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { options = {} } = req.body;

    // Get session and verify access
    const session = await Session.findById(sessionId)
      .populate('student', 'firstName lastName')
      .populate('tutor', 'firstName lastName');

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Check if user is the tutor
    if (session.tutor._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the tutor can create video rooms'
      });
    }

    // Check if session is approved
    if (session.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Video room can only be created for approved sessions'
      });
    }

    // Check if room already exists
    if (session.meetingUrl) {
      return res.status(400).json({
        success: false,
        message: 'Video room already exists for this session'
      });
    }

    try {
      // Create Daily.co room
      const room = await videoService.createRoom(sessionId, options);
      
      // Update session with meeting URL
      session.meetingUrl = room.url;
      session.videoRoomId = room.name;
      await session.save();

      res.status(201).json({
        success: true,
        message: 'Video room created successfully',
        room: {
          url: room.url,
          name: room.name,
          sessionId: session._id
        }
      });
    } catch (error) {
      console.error('Error creating video room:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create video room'
      });
    }
  } catch (error) {
    console.error('Create video room error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get video room token for session
// @route   GET /api/video/token/:sessionId
// @access  Private
const getVideoToken = async (req, res) => {
  try {
    const { sessionId } = req.params;

    // Get session and verify access
    const session = await Session.findById(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Check if user is part of this session
    const isParticipant = 
      session.student.toString() === req.user._id.toString() ||
      session.tutor.toString() === req.user._id.toString();

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'You are not a participant in this session'
      });
    }

    // Check if session has a video room, create one if it doesn't exist and user is tutor
    if (!session.videoRoomId) {
      if (session.tutor.toString() === req.user._id.toString()) {
        console.log('No video room found, creating one for tutor...');
        try {
          console.log('Auto-creating video room for session:', session._id);
          // Create Daily.co room
          const room = await videoService.createRoom(session._id);

          // Update session with meeting URL
          session.meetingUrl = room.url;
          session.videoRoomId = room.name;
          await session.save();

          console.log('✅ Video room created automatically:', room.name);
        } catch (error) {
          console.error('Error auto-creating video room:', error);
          return res.status(500).json({
            success: false,
            message: 'Failed to create video room automatically'
          });
        }
      } else {
        return res.status(400).json({
          success: false,
          message: 'No video room exists for this session'
        });
      }
    }

    // Check if session is approved or in progress
    if (!['approved', 'in-progress'].includes(session.status)) {
      return res.status(400).json({
        success: false,
        message: 'Video access is only available for approved sessions'
      });
    }

    try {
      // Determine user role
      const userRole = session.tutor.toString() === req.user._id.toString() ? 'tutor' : 'student';
      
      // Create meeting token
      const tokenData = await videoService.createMeetingToken(
        session.videoRoomId,
        req.user._id.toString(),
        userRole
      );

      // Generate full room URL with token
      const roomUrl = videoService.generateRoomUrl(session.videoRoomId, tokenData.token);

      res.status(200).json({
        success: true,
        token: tokenData.token,
        roomUrl,
        roomName: session.videoRoomId,
        userRole
      });
    } catch (error) {
      console.error('Error creating video token:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create video access token'
      });
    }
  } catch (error) {
    console.error('Get video token error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete video room for session
// @route   DELETE /api/video/room/:sessionId
// @access  Private (Tutor only)
const deleteVideoRoom = async (req, res) => {
  try {
    const { sessionId } = req.params;

    // Get session and verify access
    const session = await Session.findById(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Check if user is the tutor
    if (session.tutor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the tutor can delete video rooms'
      });
    }

    // Check if room exists
    if (!session.videoRoomId) {
      return res.status(400).json({
        success: false,
        message: 'No video room exists for this session'
      });
    }

    try {
      // Delete Daily.co room
      await videoService.deleteRoom(session.videoRoomId);

      // Update session
      session.meetingUrl = null;
      session.videoRoomId = null;
      await session.save();

      res.status(200).json({
        success: true,
        message: 'Video room deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting video room:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete video room'
      });
    }
  } catch (error) {
    console.error('Delete video room error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get video room information
// @route   GET /api/video/room/:sessionId
// @access  Private
const getVideoRoom = async (req, res) => {
  try {
    const { sessionId } = req.params;

    // Get session and verify access
    const session = await Session.findById(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Check if user is part of this session
    const isParticipant = 
      session.student.toString() === req.user._id.toString() ||
      session.tutor.toString() === req.user._id.toString();

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'You are not a participant in this session'
      });
    }

    // Check if room exists
    if (!session.videoRoomId) {
      return res.status(404).json({
        success: false,
        message: 'No video room exists for this session'
      });
    }

    try {
      // Get room information
      const room = await videoService.getRoom(session.videoRoomId);

      res.status(200).json({
        success: true,
        room: {
          name: room.name,
          url: room.url,
          created_at: room.created_at,
          config: room.config,
          sessionId: session._id
        }
      });
    } catch (error) {
      console.error('Error getting video room:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get room information'
      });
    }
  } catch (error) {
    console.error('Get video room error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get video service status
// @route   GET /api/video/status
// @access  Private (Admin only)
const getVideoStatus = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const status = videoService.getStatus();

    res.status(200).json({
      success: true,
      status
    });
  } catch (error) {
    console.error('Get video status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  createVideoRoom,
  getVideoToken,
  deleteVideoRoom,
  getVideoRoom,
  getVideoStatus
};
