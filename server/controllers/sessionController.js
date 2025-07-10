const Session = require('../models/Session');
const User = require('../models/User');
const Rating = require('../models/Rating');
const mongoose = require('mongoose');
const { validationResult } = require('express-validator');

// @desc    Create a new session request
// @route   POST /api/sessions
// @access  Private (Student only)
const createSession = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      tutor,
      subject,
      sessionDate,
      startTime,
      endTime,
      sessionType,
      description,
      preferredPlatform
    } = req.body;

    // Validate user is a student
    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Only students can create session requests'
      });
    }

    // Check if tutor exists and is approved
    const tutorUser = await User.findById(tutor);
    if (!tutorUser || tutorUser.role !== 'tutor' || tutorUser.pendingApproval) {
      return res.status(404).json({
        success: false,
        message: 'Tutor not found or not approved'
      });
    }

    // Check if tutor teaches the requested subject
    if (!tutorUser.subjects.includes(subject)) {
      return res.status(400).json({
        success: false,
        message: 'Tutor does not teach this subject'
      });
    }

    // Validate session date is in the future
    const sessionDateTime = new Date(`${sessionDate}T${startTime}`);
    if (sessionDateTime <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Session date must be in the future'
      });
    }

    // Validate start time is before end time
    const startDateTime = new Date(`${sessionDate}T${startTime}`);
    const endDateTime = new Date(`${sessionDate}T${endTime}`);
    if (startDateTime >= endDateTime) {
      return res.status(400).json({
        success: false,
        message: 'Start time must be before end time'
      });
    }

    // Check for conflicting sessions
    const conflictingSession = await Session.findOne({
      $or: [
        { student: req.user._id },
        { tutor: tutor }
      ],
      sessionDate: new Date(sessionDate),
      status: { $in: ['pending', 'approved', 'in-progress'] },
      $or: [
        {
          startTime: { $lt: endTime },
          endTime: { $gt: startTime }
        }
      ]
    });

    if (conflictingSession) {
      return res.status(409).json({
        success: false,
        message: 'Time slot conflicts with existing session'
      });
    }

    // Check tutor availability for the requested day
    const dayOfWeek = sessionDateTime.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const tutorAvailability = tutorUser.availability?.[dayOfWeek];
    
    if (!tutorAvailability?.available) {
      return res.status(400).json({
        success: false,
        message: 'Tutor is not available on this day'
      });
    }

    // Check if requested time is within tutor's available hours
    const requestedStart = startTime;
    const requestedEnd = endTime;
    const availableStart = tutorAvailability.start;
    const availableEnd = tutorAvailability.end;

    if (requestedStart < availableStart || requestedEnd > availableEnd) {
      return res.status(400).json({
        success: false,
        message: `Tutor is only available from ${availableStart} to ${availableEnd} on this day`
      });
    }

    // Calculate session duration and cost
    const durationMs = endDateTime - startDateTime;
    const durationHours = durationMs / (1000 * 60 * 60);
    const totalCost = durationHours * tutorUser.hourlyRate;

    // Create session
    const session = new Session({
      student: req.user._id,
      tutor,
      subject,
      sessionDate: new Date(sessionDate),
      startTime,
      endTime,
      duration: durationHours,
      hourlyRate: tutorUser.hourlyRate,
      totalCost,
      sessionType: sessionType || 'online',
      description,
      preferredPlatform: preferredPlatform || 'daily',
      status: 'pending'
    });

    await session.save();

    // Populate session data for response
    await session.populate([
      { path: 'student', select: 'firstName lastName email avatar' },
      { path: 'tutor', select: 'firstName lastName email avatar hourlyRate' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Session request created successfully',
      session
    });
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get user sessions with filtering
// @route   GET /api/sessions
// @access  Private
const getUserSessions = async (req, res) => {
  try {
    const {
      status,
      subject,
      page = 1,
      limit = 10,
      sortBy = 'sessionDate',
      sortOrder = 'desc',
      upcoming = false
    } = req.query;

    const skip = (page - 1) * limit;

    // Build query based on user role
    let query = {};
    if (req.user.role === 'student') {
      query.student = req.user._id;
    } else if (req.user.role === 'tutor') {
      query.tutor = req.user._id;
    } else {
      // Admin can see all sessions
    }

    // Apply filters
    if (status) {
      query.status = status;
    }

    if (subject) {
      query.subject = subject;
    }

    if (upcoming === 'true') {
      query.sessionDate = { $gte: new Date() };
      query.status = { $in: ['pending', 'approved'] };
    }

    // Build sort object
    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const sessions = await Session.find(query)
      .populate('student', 'firstName lastName email avatar')
      .populate('tutor', 'firstName lastName email avatar hourlyRate')
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Session.countDocuments(query);

    res.status(200).json({
      success: true,
      sessions,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get user sessions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get session by ID
// @route   GET /api/sessions/:id
// @access  Private
const getSessionById = async (req, res) => {
  try {
    const { id } = req.params;

    const session = await Session.findById(id)
      .populate('student', 'firstName lastName email avatar')
      .populate('tutor', 'firstName lastName email avatar hourlyRate');

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Check if user has access to this session
    const hasAccess =
      req.user.role === 'admin' ||
      session.student._id.toString() === req.user._id.toString() ||
      session.tutor._id.toString() === req.user._id.toString();

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.status(200).json({
      success: true,
      session
    });
  } catch (error) {
    console.error('Get session by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update session status (approve, reject, cancel, etc.)
// @route   PUT /api/sessions/:id
// @access  Private
const updateSession = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason, cancellationReason, meetingUrl } = req.body;

    const session = await Session.findById(id)
      .populate('student', 'firstName lastName email')
      .populate('tutor', 'firstName lastName email');

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Check permissions based on status change
    let hasPermission = false;

    if (status === 'approved' || status === 'rejected') {
      // Only tutor can approve/reject
      hasPermission = session.tutor._id.toString() === req.user._id.toString();
    } else if (status === 'cancelled') {
      // Student or tutor can cancel
      hasPermission =
        session.student._id.toString() === req.user._id.toString() ||
        session.tutor._id.toString() === req.user._id.toString();
    } else if (status === 'in-progress') {
      // Tutor can start session
      hasPermission = session.tutor._id.toString() === req.user._id.toString();
    } else if (status === 'completed') {
      // Tutor can mark as completed
      hasPermission = session.tutor._id.toString() === req.user._id.toString();
    } else if (req.user.role === 'admin') {
      hasPermission = true;
    }

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action'
      });
    }

    // Validate status transitions
    const validTransitions = {
      'pending': ['approved', 'rejected', 'cancelled'],
      'approved': ['in-progress', 'cancelled'],
      'in-progress': ['completed', 'cancelled'],
      'completed': [], // No transitions from completed
      'cancelled': [], // No transitions from cancelled
      'rejected': [] // No transitions from rejected
    };

    if (!validTransitions[session.status].includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change status from ${session.status} to ${status}`
      });
    }

    // Update session
    session.status = status;

    if (status === 'rejected' && rejectionReason) {
      session.rejectionReason = rejectionReason;
    }

    if (status === 'cancelled' && cancellationReason) {
      session.cancellationReason = cancellationReason;
    }

    if (status === 'approved' && meetingUrl) {
      session.meetingUrl = meetingUrl;
    }

    if (status === 'completed') {
      session.completedAt = new Date();
    }

    await session.save();

    res.status(200).json({
      success: true,
      message: `Session ${status} successfully`,
      session
    });
  } catch (error) {
    console.error('Update session error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Rate and review a completed session
// @route   POST /api/sessions/:id/rate
// @access  Private (Student only)
const rateSession = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, review, isPublic = true } = req.body;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    const session = await Session.findById(id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Check if user is the student of this session
    if (session.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the student can rate this session'
      });
    }

    // Check if session is completed
    if (session.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only rate completed sessions'
      });
    }

    // Check if already rated
    const existingRating = await Rating.findOne({
      session: id,
      student: req.user._id
    });

    if (existingRating) {
      return res.status(400).json({
        success: false,
        message: 'Session already rated'
      });
    }

    // Create rating
    const newRating = new Rating({
      session: id,
      student: req.user._id,
      tutor: session.tutor,
      rating,
      comment: review, // Rating model uses 'comment' field
      isPublic,
      subject: session.subject
    });

    await newRating.save();

    // Update session with rating
    session.rating = rating;
    session.review = review;
    await session.save();

    // Fix existing ratings that might have missing comments due to previous bug
    try {
      await Rating.updateMany(
        {
          student: req.user._id,
          comment: { $exists: false },
          $or: [{ comment: null }, { comment: '' }]
        },
        {
          $set: {
            comment: review || 'Great session!'
          }
        }
      );
    } catch (fixError) {
      console.log('Error fixing existing ratings:', fixError);
    }

    // Update tutor's average rating
    const tutorRatings = await Rating.find({ tutor: session.tutor });
    const averageRating = tutorRatings.reduce((sum, r) => sum + r.rating, 0) / tutorRatings.length;

    await User.findByIdAndUpdate(session.tutor, {
      averageRating: Math.round(averageRating * 10) / 10,
      totalRatings: tutorRatings.length
    });

    res.status(201).json({
      success: true,
      message: 'Session rated successfully',
      rating: newRating
    });
  } catch (error) {
    console.error('Rate session error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get tutor's availability for a specific date
// @route   GET /api/sessions/availability/:tutorId/:date
// @access  Public
const getTutorAvailability = async (req, res) => {
  try {
    const { tutorId, date } = req.params;

    const tutor = await User.findById(tutorId);
    if (!tutor || tutor.role !== 'tutor') {
      return res.status(404).json({
        success: false,
        message: 'Tutor not found'
      });
    }

    const requestedDate = new Date(date);
    const dayOfWeek = requestedDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

    // Get tutor's general availability for this day
    const dayAvailability = tutor.availability?.[dayOfWeek];

    if (!dayAvailability?.available) {
      return res.status(200).json({
        success: true,
        available: false,
        message: 'Tutor is not available on this day'
      });
    }

    // Get existing sessions for this date
    const existingSessions = await Session.find({
      tutor: tutorId,
      sessionDate: {
        $gte: new Date(date),
        $lt: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000)
      },
      status: { $in: ['pending', 'approved', 'in-progress'] }
    }).select('startTime endTime');

    // Calculate available time slots
    const availableSlots = [];
    const startHour = parseInt(dayAvailability.start.split(':')[0]);
    const startMinute = parseInt(dayAvailability.start.split(':')[1]);
    const endHour = parseInt(dayAvailability.end.split(':')[0]);
    const endMinute = parseInt(dayAvailability.end.split(':')[1]);

    // Generate 1-hour slots
    for (let hour = startHour; hour < endHour; hour++) {
      const slotStart = `${hour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`;
      const slotEnd = `${(hour + 1).toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`;

      // Check if this slot conflicts with existing sessions
      const hasConflict = existingSessions.some(session => {
        return (slotStart < session.endTime && slotEnd > session.startTime);
      });

      if (!hasConflict) {
        availableSlots.push({
          startTime: slotStart,
          endTime: slotEnd
        });
      }
    }

    res.status(200).json({
      success: true,
      available: true,
      dayAvailability,
      availableSlots,
      existingSessions: existingSessions.length
    });
  } catch (error) {
    console.error('Get tutor availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get session statistics for dashboard
// @route   GET /api/sessions/stats
// @access  Private
const getSessionStats = async (req, res) => {
  try {
    let query = {};

    // Filter by user role
    if (req.user.role === 'student') {
      query.student = req.user._id;
    } else if (req.user.role === 'tutor') {
      query.tutor = req.user._id;
    }
    // Admin sees all sessions

    const stats = await Session.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalSessions: { $sum: 1 },
          completedSessions: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          pendingSessions: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          approvedSessions: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
          },
          cancelledSessions: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          },
          totalEarnings: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$totalCost', 0] }
          },
          totalHours: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$duration', 0] }
          },
          averageRating: { $avg: '$rating' }
        }
      }
    ]);

    const result = stats[0] || {
      totalSessions: 0,
      completedSessions: 0,
      pendingSessions: 0,
      approvedSessions: 0,
      cancelledSessions: 0,
      totalEarnings: 0,
      totalHours: 0,
      averageRating: 0
    };

    // Get upcoming sessions
    const upcomingSessions = await Session.find({
      ...query,
      sessionDate: { $gte: new Date() },
      status: { $in: ['pending', 'approved'] }
    })
    .populate('student', 'firstName lastName')
    .populate('tutor', 'firstName lastName')
    .sort({ sessionDate: 1 })
    .limit(5);

    res.status(200).json({
      success: true,
      stats: result,
      upcomingSessions
    });
  } catch (error) {
    console.error('Get session stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Reschedule a session
// @route   PUT /api/sessions/:id/reschedule
// @access  Private
const rescheduleSession = async (req, res) => {
  try {
    const { id } = req.params;
    const { sessionDate, startTime, endTime, reason } = req.body;

    const session = await Session.findById(id);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Check permissions
    const hasPermission =
      session.student.toString() === req.user._id.toString() ||
      session.tutor.toString() === req.user._id.toString();

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Can only reschedule pending or approved sessions
    if (!['pending', 'approved'].includes(session.status)) {
      return res.status(400).json({
        success: false,
        message: 'Can only reschedule pending or approved sessions'
      });
    }

    // Validate new date is in the future
    const newSessionDateTime = new Date(`${sessionDate}T${startTime}`);
    if (newSessionDateTime <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'New session date must be in the future'
      });
    }

    // Check for conflicts
    const conflictingSession = await Session.findOne({
      _id: { $ne: id },
      $or: [
        { student: session.student },
        { tutor: session.tutor }
      ],
      sessionDate: new Date(sessionDate),
      status: { $in: ['pending', 'approved', 'in-progress'] },
      $or: [
        {
          startTime: { $lt: endTime },
          endTime: { $gt: startTime }
        }
      ]
    });

    if (conflictingSession) {
      return res.status(409).json({
        success: false,
        message: 'New time slot conflicts with existing session'
      });
    }

    // Update session
    session.sessionDate = new Date(sessionDate);
    session.startTime = startTime;
    session.endTime = endTime;
    session.rescheduleReason = reason;
    session.rescheduledAt = new Date();
    session.rescheduledBy = req.user._id;

    // Reset status to pending if it was approved
    if (session.status === 'approved') {
      session.status = 'pending';
    }

    await session.save();

    res.status(200).json({
      success: true,
      message: 'Session rescheduled successfully',
      session
    });
  } catch (error) {
    console.error('Reschedule session error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get pending session requests for tutor
// @route   GET /api/sessions/tutor/requests
// @access  Private (Tutor only)
const getTutorRequests = async (req, res) => {
  try {
    const tutorId = req.user._id;

    const requests = await Session.find({
      tutor: tutorId,
      status: 'pending'
    })
    .populate('student', 'firstName lastName email avatar')
    .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      requests
    });
  } catch (error) {
    console.error('Get tutor requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get tutor's sessions with filtering
// @route   GET /api/sessions/tutor/sessions
// @access  Private (Tutor only)
const getTutorSessions = async (req, res) => {
  try {
    const tutorId = req.user._id;
    const { status, page = 1, limit = 10 } = req.query;

    const query = { tutor: tutorId };
    if (status) {
      query.status = status;
    }

    const sessions = await Session.find(query)
      .populate('student', 'firstName lastName email avatar')
      .sort({ sessionDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Session.countDocuments(query);

    res.status(200).json({
      success: true,
      sessions,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get tutor sessions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get tutor's session statistics
// @route   GET /api/sessions/tutor/stats
// @access  Private (Tutor only)
const getTutorStats = async (req, res) => {
  try {
    const tutorId = req.user._id;

    const [
      totalSessions,
      approvedSessions,
      pendingSessions,
      completedSessions,
      cancelledSessions
    ] = await Promise.all([
      Session.countDocuments({ tutor: tutorId }),
      Session.countDocuments({ tutor: tutorId, status: 'approved' }),
      Session.countDocuments({ tutor: tutorId, status: 'pending' }),
      Session.countDocuments({ tutor: tutorId, status: 'completed' }),
      Session.countDocuments({ tutor: tutorId, status: 'cancelled' })
    ]);

    // Calculate earnings
    const completedSessionsWithCost = await Session.find({
      tutor: tutorId,
      status: 'completed'
    }).select('totalCost');

    const totalEarnings = completedSessionsWithCost.reduce((sum, session) => {
      return sum + (session.totalCost || 0);
    }, 0);

    // Get this month's stats
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const thisMonthSessions = await Session.countDocuments({
      tutor: tutorId,
      createdAt: { $gte: startOfMonth }
    });

    const thisMonthEarnings = await Session.aggregate([
      {
        $match: {
          tutor: new mongoose.Types.ObjectId(tutorId),
          status: 'completed',
          createdAt: { $gte: startOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalCost' }
        }
      }
    ]);

    const stats = {
      totalSessions,
      approvedSessions,
      pendingSessions,
      completedSessions,
      cancelledSessions,
      totalEarnings,
      thisMonthSessions,
      thisMonthEarnings: thisMonthEarnings[0]?.total || 0
    };

    res.status(200).json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Get tutor stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update session request status (approve/reject)
// @route   PUT /api/sessions/requests/:id
// @access  Private (Tutor only)
const updateSessionRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const tutorId = req.user._id;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be approved or rejected'
      });
    }

    const session = await Session.findOne({
      _id: id,
      tutor: tutorId,
      status: 'pending'
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session request not found'
      });
    }

    session.status = status;
    session.respondedAt = new Date();
    await session.save();

    // Populate for response
    await session.populate('student', 'firstName lastName email avatar');

    res.status(200).json({
      success: true,
      message: `Session request ${status} successfully`,
      session
    });
  } catch (error) {
    console.error('Update session request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  createSession,
  getUserSessions,
  getSessionById,
  updateSession,
  rateSession,
  getTutorAvailability,
  getSessionStats,
  rescheduleSession,
  getTutorRequests,
  getTutorSessions,
  getTutorStats,
  updateSessionRequest
};
