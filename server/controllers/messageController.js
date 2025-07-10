const Message = require('../models/Message');
const Session = require('../models/Session');
const { validationResult } = require('express-validator');

// @desc    Send a message in a session
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { sessionId, text } = req.body;
    const senderId = req.user._id;

    // Check if session exists and is approved
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Security: Check if user is part of this session
    const isParticipant = 
      session.student.toString() === senderId.toString() ||
      session.tutor.toString() === senderId.toString();

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are not a participant in this session'
      });
    }

    // Security: Only allow chat for approved sessions
    if (session.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Chat is only available for approved sessions'
      });
    }

    // Determine receiver
    const receiverId = session.student.toString() === senderId.toString()
      ? session.tutor
      : session.student;

    // Create message
    const message = new Message({
      sessionId,
      senderId,
      receiverId,
      text: text.trim()
    });

    await message.save();

    // Populate sender and receiver info
    await message.populate('senderId', 'firstName lastName avatar');
    await message.populate('receiverId', 'firstName lastName avatar');

    // Emit message via Socket.io if available
    if (req.io) {
      const messageData = {
        _id: message._id,
        sessionId: message.sessionId,
        senderId: message.senderId,
        receiverId: message.receiverId,
        text: message.text,
        createdAt: message.createdAt,
        formattedTime: message.formattedTime
      };

      // Emit to session room
      req.io.to(`session_${sessionId}`).emit('new_message', messageData);
      console.log(`💬 Message emitted to session_${sessionId}`);
    }

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: message
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get messages for a session
// @route   GET /api/messages/session/:sessionId
// @access  Private
const getSessionMessages = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const userId = req.user._id;

    // Check if session exists
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Security: Check if user is part of this session
    const isParticipant = 
      session.student.toString() === userId.toString() ||
      session.tutor.toString() === userId.toString();

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are not a participant in this session'
      });
    }

    // Security: Only allow access for approved sessions
    if (session.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Messages are only available for approved sessions'
      });
    }

    // Get messages
    const messages = await Message.getSessionMessages(sessionId, page, limit);
    const total = await Message.countDocuments({ sessionId });

    // Mark messages as read for current user
    await Message.markAsRead(sessionId, userId);

    res.status(200).json({
      success: true,
      data: {
        messages: messages.reverse(), // Reverse to show oldest first
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get session messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Mark message as read
// @route   PUT /api/messages/:id/read
// @access  Private
const markMessageAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Security: Check if user has access to this message
    if (!message.hasAccess(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Only receiver can mark as read
    if (message.receiverId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only receiver can mark message as read'
      });
    }

    message.isRead = true;
    message.readAt = new Date();
    await message.save();

    res.status(200).json({
      success: true,
      message: 'Message marked as read'
    });
  } catch (error) {
    console.error('Mark message as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get unread message count for user
// @route   GET /api/messages/unread-count
// @access  Private
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;

    const unreadCount = await Message.countDocuments({
      receiverId: userId,
      isRead: false
    });

    res.status(200).json({
      success: true,
      data: { unreadCount }
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  sendMessage,
  getSessionMessages,
  markMessageAsRead,
  getUnreadCount
};
