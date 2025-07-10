const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  // Notification Target
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Recipient is required']
  },
  
  // Notification Content
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    maxlength: [500, 'Message cannot exceed 500 characters']
  },
  
  // Notification Type and Category
  type: {
    type: String,
    enum: [
      'session_request',
      'session_approved',
      'session_rejected',
      'session_cancelled',
      'session_reminder',
      'session_started',
      'session_completed',
      'new_message',
      'tutor_approved',
      'tutor_rejected',
      'rating_received',
      'payment_received',
      'payment_failed',
      'profile_updated',
      'system_announcement',
      'account_warning',
      'general'
    ],
    required: [true, 'Type is required']
  },
  category: {
    type: String,
    enum: ['session', 'message', 'account', 'payment', 'system'],
    required: [true, 'Category is required']
  },
  
  // Priority and Urgency
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // Notification Status
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  
  // Related Data
  relatedModel: {
    type: String,
    enum: ['Session', 'Message', 'User', 'Rating', 'Payment']
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'relatedModel'
  },
  
  // Action Data
  actionUrl: {
    type: String // URL to navigate to when notification is clicked
  },
  actionText: {
    type: String // Text for action button
  },
  
  // Sender Information (optional)
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Delivery Settings
  deliveryMethods: {
    inApp: {
      type: Boolean,
      default: true
    },
    email: {
      type: Boolean,
      default: false
    },
    sms: {
      type: Boolean,
      default: false
    },
    push: {
      type: Boolean,
      default: false
    }
  },
  
  // Delivery Status
  deliveryStatus: {
    inApp: {
      delivered: { type: Boolean, default: false },
      deliveredAt: { type: Date }
    },
    email: {
      delivered: { type: Boolean, default: false },
      deliveredAt: { type: Date },
      error: { type: String }
    },
    sms: {
      delivered: { type: Boolean, default: false },
      deliveredAt: { type: Date },
      error: { type: String }
    },
    push: {
      delivered: { type: Boolean, default: false },
      deliveredAt: { type: Date },
      error: { type: String }
    }
  },
  
  // Scheduling
  scheduledFor: {
    type: Date // For scheduled notifications
  },
  expiresAt: {
    type: Date // When notification should be automatically removed
  },
  
  // Metadata
  metadata: {
    type: mongoose.Schema.Types.Mixed // Additional data specific to notification type
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ category: 1 });
notificationSchema.index({ priority: 1 });
notificationSchema.index({ scheduledFor: 1 });
notificationSchema.index({ expiresAt: 1 });

// Virtual for time ago
notificationSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diff = now - this.createdAt;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
});

// Virtual for icon based on type
notificationSchema.virtual('icon').get(function() {
  const iconMap = {
    'session_request': '📚',
    'session_approved': '✅',
    'session_rejected': '❌',
    'session_cancelled': '🚫',
    'session_reminder': '⏰',
    'session_started': '🎓',
    'session_completed': '🏆',
    'new_message': '💬',
    'tutor_approved': '👨‍🏫',
    'tutor_rejected': '❌',
    'rating_received': '⭐',
    'payment_received': '💰',
    'payment_failed': '💳',
    'profile_updated': '👤',
    'system_announcement': '📢',
    'account_warning': '⚠️',
    'general': '🔔'
  };
  return iconMap[this.type] || '🔔';
});

// Virtual for color based on priority
notificationSchema.virtual('color').get(function() {
  const colorMap = {
    'low': '#6B7280',
    'medium': '#3B82F6',
    'high': '#F59E0B',
    'urgent': '#EF4444'
  };
  return colorMap[this.priority] || '#3B82F6';
});

// Pre-save middleware to set expiration
notificationSchema.pre('save', function(next) {
  if (this.isNew && !this.expiresAt) {
    // Set default expiration to 30 days from now
    this.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }
  next();
});

// Method to mark as read
notificationSchema.methods.markAsRead = function() {
  if (!this.isRead) {
    this.isRead = true;
    this.readAt = new Date();
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to check if notification is expired
notificationSchema.methods.isExpired = function() {
  return this.expiresAt && new Date() > this.expiresAt;
};

// Static method to create notification
notificationSchema.statics.createNotification = function(data) {
  const notification = new this(data);
  return notification.save();
};

// Static method to get user notifications
notificationSchema.statics.getUserNotifications = function(userId, options = {}) {
  const {
    page = 1,
    limit = 20,
    unreadOnly = false,
    category = null,
    type = null
  } = options;
  
  const skip = (page - 1) * limit;
  const query = { recipient: userId };
  
  if (unreadOnly) query.isRead = false;
  if (category) query.category = category;
  if (type) query.type = type;
  
  // Don't show expired notifications
  query.$or = [
    { expiresAt: { $exists: false } },
    { expiresAt: { $gt: new Date() } }
  ];
  
  return this.find(query)
    .populate('sender', 'firstName lastName avatar')
    .populate('relatedId')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Static method to get unread count
notificationSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({
    recipient: userId,
    isRead: false,
    $or: [
      { expiresAt: { $exists: false } },
      { expiresAt: { $gt: new Date() } }
    ]
  });
};

// Static method to mark all as read
notificationSchema.statics.markAllAsRead = function(userId) {
  return this.updateMany(
    { recipient: userId, isRead: false },
    { 
      $set: { 
        isRead: true, 
        readAt: new Date() 
      } 
    }
  );
};

// Static method to clean up expired notifications
notificationSchema.statics.cleanupExpired = function() {
  return this.deleteMany({
    expiresAt: { $lt: new Date() }
  });
};

// Static method to create session-related notifications
notificationSchema.statics.createSessionNotification = function(type, session, recipient, additionalData = {}) {
  const notificationData = {
    recipient,
    type,
    category: 'session',
    relatedModel: 'Session',
    relatedId: session._id,
    ...additionalData
  };
  
  // Set notification content based on type
  switch (type) {
    case 'session_request':
      notificationData.title = 'New Session Request';
      notificationData.message = `You have a new session request for ${session.subject}`;
      notificationData.actionUrl = `/sessions/${session._id}`;
      notificationData.actionText = 'View Request';
      break;
      
    case 'session_approved':
      notificationData.title = 'Session Approved';
      notificationData.message = `Your session request for ${session.subject} has been approved`;
      notificationData.actionUrl = `/sessions/${session._id}`;
      notificationData.actionText = 'View Session';
      break;
      
    case 'session_rejected':
      notificationData.title = 'Session Rejected';
      notificationData.message = `Your session request for ${session.subject} has been rejected`;
      notificationData.actionUrl = `/sessions/${session._id}`;
      notificationData.actionText = 'View Details';
      break;
      
    case 'session_reminder':
      notificationData.title = 'Session Reminder';
      notificationData.message = `Your session for ${session.subject} starts in 15 minutes`;
      notificationData.actionUrl = `/sessions/${session._id}`;
      notificationData.actionText = 'Join Session';
      notificationData.priority = 'high';
      break;
      
    default:
      notificationData.title = 'Session Update';
      notificationData.message = `Your session for ${session.subject} has been updated`;
  }
  
  return this.createNotification(notificationData);
};

module.exports = mongoose.model('Notification', notificationSchema);
