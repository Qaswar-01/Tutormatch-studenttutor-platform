const Notification = require('../models/Notification');
const { validationResult } = require('express-validator');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      unreadOnly = false,
      category,
      type
    } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      unreadOnly: unreadOnly === 'true',
      category,
      type
    };

    const notifications = await Notification.getUserNotifications(req.user._id, options);
    const total = await Notification.countDocuments({
      recipient: req.user._id,
      ...(options.unreadOnly && { isRead: false }),
      ...(options.category && { category: options.category }),
      ...(options.type && { type: options.type }),
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: new Date() } }
      ]
    });

    const unreadCount = await Notification.getUnreadCount(req.user._id);

    res.status(200).json({
      success: true,
      notifications,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      },
      unreadCount
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get unread notification count
// @route   GET /api/notifications/unread-count
// @access  Private
const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.getUnreadCount(req.user._id);
    
    res.status(200).json({
      success: true,
      count
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipient: req.user._id
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    await notification.markAsRead();

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      notification
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Mark multiple notifications as read
// @route   PUT /api/notifications/mark-read
// @access  Private
const markMultipleAsRead = async (req, res) => {
  try {
    const { notificationIds } = req.body;

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return res.status(400).json({
        success: false,
        message: 'Notification IDs array is required'
      });
    }

    await Notification.updateMany(
      {
        _id: { $in: notificationIds },
        recipient: req.user._id
      },
      {
        $set: {
          isRead: true,
          readAt: new Date()
        }
      }
    );

    const unreadCount = await Notification.getUnreadCount(req.user._id);

    res.status(200).json({
      success: true,
      message: 'Notifications marked as read',
      unreadCount
    });
  } catch (error) {
    console.error('Mark multiple as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/mark-all-read
// @access  Private
const markAllAsRead = async (req, res) => {
  try {
    await Notification.markAllAsRead(req.user._id);

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
      unreadCount: 0
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.user._id
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    const unreadCount = await Notification.getUnreadCount(req.user._id);

    res.status(200).json({
      success: true,
      message: 'Notification deleted',
      unreadCount
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete multiple notifications
// @route   DELETE /api/notifications/bulk-delete
// @access  Private
const deleteMultipleNotifications = async (req, res) => {
  try {
    const { notificationIds } = req.body;

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return res.status(400).json({
        success: false,
        message: 'Notification IDs array is required'
      });
    }

    await Notification.deleteMany({
      _id: { $in: notificationIds },
      recipient: req.user._id
    });

    const unreadCount = await Notification.getUnreadCount(req.user._id);

    res.status(200).json({
      success: true,
      message: 'Notifications deleted',
      unreadCount
    });
  } catch (error) {
    console.error('Delete multiple notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create notification (Admin only)
// @route   POST /api/notifications
// @access  Private (Admin)
const createNotification = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const notification = await Notification.createNotification({
      ...req.body,
      sender: req.user._id
    });

    await notification.populate('sender', 'firstName lastName avatar');
    await notification.populate('recipient', 'firstName lastName');

    // Emit real-time notification
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${notification.recipient._id}`).emit('newNotification', notification);
    }

    res.status(201).json({
      success: true,
      message: 'Notification created',
      notification
    });
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get notification statistics
// @route   GET /api/notifications/stats
// @access  Private
const getNotificationStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const stats = await Notification.aggregate([
      {
        $match: {
          recipient: userId,
          $or: [
            { expiresAt: { $exists: false } },
            { expiresAt: { $gt: new Date() } }
          ]
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          unread: {
            $sum: {
              $cond: [{ $eq: ['$isRead', false] }, 1, 0]
            }
          },
          byCategory: {
            $push: {
              category: '$category',
              isRead: '$isRead'
            }
          },
          byPriority: {
            $push: {
              priority: '$priority',
              isRead: '$isRead'
            }
          }
        }
      }
    ]);

    const result = stats[0] || { total: 0, unread: 0, byCategory: [], byPriority: [] };

    // Process category stats
    const categoryStats = {};
    result.byCategory.forEach(item => {
      if (!categoryStats[item.category]) {
        categoryStats[item.category] = { total: 0, unread: 0 };
      }
      categoryStats[item.category].total++;
      if (!item.isRead) {
        categoryStats[item.category].unread++;
      }
    });

    // Process priority stats
    const priorityStats = {};
    result.byPriority.forEach(item => {
      if (!priorityStats[item.priority]) {
        priorityStats[item.priority] = { total: 0, unread: 0 };
      }
      priorityStats[item.priority].total++;
      if (!item.isRead) {
        priorityStats[item.priority].unread++;
      }
    });

    res.status(200).json({
      success: true,
      stats: {
        total: result.total,
        unread: result.unread,
        read: result.total - result.unread,
        categories: categoryStats,
        priorities: priorityStats
      }
    });
  } catch (error) {
    console.error('Get notification stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markMultipleAsRead,
  markAllAsRead,
  deleteNotification,
  deleteMultipleNotifications,
  createNotification,
  getNotificationStats
};
