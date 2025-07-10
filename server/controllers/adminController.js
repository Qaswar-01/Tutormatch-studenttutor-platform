const User = require('../models/User');
const Session = require('../models/Session');
const Rating = require('../models/Rating');
const Notification = require('../models/Notification');

// @desc    Get pending tutors for approval
// @route   GET /api/admin/pending-tutors
// @access  Private (Admin only)
const getPendingTutors = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    
    const tutors = await User.find({
      role: 'tutor',
      pendingApproval: true,
      isActive: true
    })
    .select('-password -bookmarkedTutors -emailVerificationToken -passwordResetToken')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));
    
    const total = await User.countDocuments({
      role: 'tutor',
      pendingApproval: true,
      isActive: true
    });
    
    res.status(200).json({
      success: true,
      tutors,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get pending tutors error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Approve or reject tutor
// @route   PUT /api/admin/approve-tutor/:id
// @access  Private (Admin only)
const approveTutor = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, rejectionReason } = req.body; // action: 'approve' or 'reject'
    
    const tutor = await User.findById(id);
    
    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: 'Tutor not found'
      });
    }
    
    if (tutor.role !== 'tutor') {
      return res.status(400).json({
        success: false,
        message: 'User is not a tutor'
      });
    }
    
    if (!tutor.pendingApproval) {
      return res.status(400).json({
        success: false,
        message: 'Tutor is already processed'
      });
    }
    
    if (action === 'approve') {
      tutor.pendingApproval = false;
      tutor.approvedAt = new Date();
      tutor.approvedBy = req.user._id;
      
      await tutor.save();
      
      // Create approval notification for tutor
      await Notification.createNotification({
        recipient: tutor._id,
        title: 'Application Approved! 🎉',
        message: 'Congratulations! Your tutor application has been approved. You can now start accepting session requests.',
        type: 'tutor_approved',
        category: 'account',
        priority: 'high',
        actionUrl: '/dashboard',
        actionText: 'Go to Dashboard'
      });
      
      res.status(200).json({
        success: true,
        message: 'Tutor approved successfully',
        tutor
      });
    } else if (action === 'reject') {
      // For rejection, we might want to keep the user but mark as rejected
      // Or delete the account - for now, let's deactivate
      tutor.isActive = false;
      tutor.pendingApproval = false;
      
      await tutor.save();
      
      // Create rejection notification for tutor
      await Notification.createNotification({
        recipient: tutor._id,
        title: 'Application Not Approved',
        message: `Unfortunately, your tutor application was not approved. ${rejectionReason ? `Reason: ${rejectionReason}` : 'Please contact support for more information.'}`,
        type: 'tutor_rejected',
        category: 'account',
        priority: 'high'
      });
      
      res.status(200).json({
        success: true,
        message: 'Tutor rejected successfully'
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid action. Use "approve" or "reject"'
      });
    }
  } catch (error) {
    console.error('Approve tutor error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin only)
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, role, status, search } = req.query;
    const skip = (page - 1) * limit;
    
    // Build query
    const query = {};
    if (role) query.role = role;
    if (status === 'active') query.isActive = true;
    if (status === 'inactive') query.isActive = false;
    if (status === 'pending') query.pendingApproval = true;
    
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    const users = await User.find(query)
      .select('-password -emailVerificationToken -passwordResetToken')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await User.countDocuments(query);
    
    res.status(200).json({
      success: true,
      users,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get all sessions
// @route   GET /api/admin/sessions
// @access  Private (Admin only)
const getAllSessions = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, subject } = req.query;
    const skip = (page - 1) * limit;
    
    // Build query
    const query = {};
    if (status) query.status = status;
    if (subject) query.subject = { $regex: subject, $options: 'i' };
    
    const sessions = await Session.find(query)
      .populate('student', 'firstName lastName email avatar')
      .populate('tutor', 'firstName lastName email avatar subjects')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Session.countDocuments(query);
    
    res.status(200).json({
      success: true,
      sessions,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get all sessions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get platform analytics
// @route   GET /api/admin/analytics
// @access  Private (Admin only)
const getAnalytics = async (req, res) => {
  try {
    // Get basic counts - handle users that might not have isActive field
    const totalUsers = await User.countDocuments({
      $or: [
        { isActive: true },
        { isActive: { $exists: false } } // Include users without isActive field
      ]
    });

    const totalStudents = await User.countDocuments({
      role: 'student',
      $or: [
        { isActive: true },
        { isActive: { $exists: false } }
      ]
    });

    const totalTutors = await User.countDocuments({
      role: 'tutor',
      pendingApproval: false,
      $or: [
        { isActive: true },
        { isActive: { $exists: false } }
      ]
    });

    const pendingTutors = await User.countDocuments({
      role: 'tutor',
      pendingApproval: true
    });
    
    const totalSessions = await Session.countDocuments();
    const completedSessions = await Session.countDocuments({ status: 'completed' });
    const pendingSessions = await Session.countDocuments({ status: 'pending' });
    const approvedSessions = await Session.countDocuments({ status: 'approved' });
    
    const totalRatings = await Rating.countDocuments();
    const averageRating = await Rating.aggregate([
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ]);
    
    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const newUsersLast30Days = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
      $or: [
        { isActive: true },
        { isActive: { $exists: false } }
      ]
    });
    
    const sessionsLast30Days = await Session.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });
    
    // Get top subjects
    const topSubjects = await Session.aggregate([
      { $group: { _id: '$subject', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    // Get top tutors by rating
    const topTutors = await User.find({
      role: 'tutor',
      pendingApproval: false,
      $or: [
        { isActive: true },
        { isActive: { $exists: false } }
      ],
      totalRatings: { $gte: 5 }
    })
    .select('firstName lastName averageRating totalRatings subjects')
    .sort({ averageRating: -1, totalRatings: -1 })
    .limit(10);
    
    // Monthly session stats (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
    
    const monthlyStats = await Session.aggregate([
      {
        $match: {
          createdAt: { $gte: twelveMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          sessions: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    
    res.status(200).json({
      success: true,
      analytics: {
        overview: {
          totalUsers,
          totalStudents,
          totalTutors,
          pendingTutors,
          totalSessions,
          completedSessions,
          pendingSessions,
          approvedSessions,
          totalRatings,
          averageRating: averageRating[0]?.avgRating || 0
        },
        recentActivity: {
          newUsersLast30Days,
          sessionsLast30Days
        },
        topSubjects,
        topTutors,
        monthlyStats
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update user status (activate/deactivate)
// @route   PUT /api/admin/users/:id/status
// @access  Private (Admin only)
const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    user.isActive = isActive;
    await user.save();
    
    // Create notification for user
    await Notification.createNotification({
      recipient: user._id,
      title: isActive ? 'Account Activated' : 'Account Deactivated',
      message: isActive 
        ? 'Your account has been reactivated by an administrator.'
        : 'Your account has been deactivated. Please contact support for assistance.',
      type: isActive ? 'general' : 'account_warning',
      category: 'account',
      priority: 'high'
    });
    
    res.status(200).json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getPendingTutors,
  approveTutor,
  getAllUsers,
  getAllSessions,
  getAnalytics,
  updateUserStatus
};
