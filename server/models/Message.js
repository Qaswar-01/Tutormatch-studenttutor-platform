const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    required: [true, 'Session ID is required'],
    index: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Sender ID is required'],
    index: true
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Receiver ID is required'],
    index: true
  },
  text: {
    type: String,
    required: [true, 'Message text is required'],
    trim: true,
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
messageSchema.index({ sessionId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1, receiverId: 1 });
messageSchema.index({ sessionId: 1, senderId: 1, receiverId: 1 });

// Virtual for formatted timestamp
messageSchema.virtual('formattedTime').get(function() {
  return this.createdAt.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
});

// Static method to get messages for a session
messageSchema.statics.getSessionMessages = function(sessionId, page = 1, limit = 50) {
  const skip = (page - 1) * limit;
  
  return this.find({ sessionId })
    .populate('senderId', 'firstName lastName avatar')
    .populate('receiverId', 'firstName lastName avatar')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Static method to mark messages as read
messageSchema.statics.markAsRead = function(sessionId, userId) {
  return this.updateMany(
    {
      sessionId,
      receiverId: userId,
      isRead: false
    },
    {
      $set: {
        isRead: true,
        readAt: new Date()
      }
    }
  );
};

// Method to check if user has access to this message
messageSchema.methods.hasAccess = function(userId) {
  return this.senderId.toString() === userId.toString() || 
         this.receiverId.toString() === userId.toString();
};

module.exports = mongoose.model('Message', messageSchema);
