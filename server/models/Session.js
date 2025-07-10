const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  // Participants
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student is required']
  },
  tutor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Tutor is required']
  },
  
  // Session Details
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
    maxlength: [100, 'Subject cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    trim: true
  },
  
  // Scheduling
  sessionDate: {
    type: Date,
    required: [true, 'Session date is required']
  },
  startTime: {
    type: String,
    required: [true, 'Start time is required']
  },
  endTime: {
    type: String,
    required: [true, 'End time is required']
  },
  duration: {
    type: Number,
    required: [true, 'Duration is required'],
    min: [0.5, 'Duration must be at least 0.5 hours'],
    max: [3, 'Duration cannot exceed 3 hours']
  },
  
  // Status and Workflow
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'in-progress', 'completed', 'cancelled', 'no-show'],
    default: 'pending'
  },
  rejectionReason: {
    type: String,
    maxlength: [500, 'Rejection reason cannot exceed 500 characters']
  },
  cancellationReason: {
    type: String,
    maxlength: [500, 'Cancellation reason cannot exceed 500 characters']
  },
  cancellationReason: {
    type: String,
    maxlength: [500, 'Cancellation reason cannot exceed 500 characters']
  },
  
  // Session Management
  sessionStartTime: {
    type: Date
  },
  sessionEndTime: {
    type: Date
  },
  actualDuration: {
    type: Number // in minutes
  },
  
  // Video Call Integration
  meetingUrl: {
    type: String
  },
  videoRoomId: {
    type: String
  },
  videoCallStarted: {
    type: Boolean,
    default: false
  },
  videoCallStartTime: {
    type: Date
  },
  videoCallEndTime: {
    type: Date
  },
  
  // Payment and Pricing
  hourlyRate: {
    type: Number,
    required: [true, 'Hourly rate is required'],
    min: [5, 'Hourly rate must be at least $5']
  },
  totalCost: {
    type: Number,
    required: [true, 'Total cost is required']
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded', 'failed'],
    default: 'pending'
  },
  paymentId: {
    type: String // For payment processor reference
  },
  
  // Communication
  studentMessage: {
    type: String,
    maxlength: [500, 'Student message cannot exceed 500 characters']
  },
  tutorResponse: {
    type: String,
    maxlength: [500, 'Tutor response cannot exceed 500 characters']
  },
  
  // Session Notes and Materials
  sessionNotes: {
    type: String,
    maxlength: [2000, 'Session notes cannot exceed 2000 characters']
  },
  materials: [{
    name: String,
    url: String,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Feedback and Rating
  isRated: {
    type: Boolean,
    default: false
  },
  studentRating: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      maxlength: [500, 'Comment cannot exceed 500 characters']
    },
    ratedAt: {
      type: Date
    }
  },
  tutorFeedback: {
    comment: {
      type: String,
      maxlength: [500, 'Feedback cannot exceed 500 characters']
    },
    providedAt: {
      type: Date
    }
  },
  
  // Timestamps and Metadata
  requestedAt: {
    type: Date,
    default: Date.now
  },
  respondedAt: {
    type: Date
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  
  // Cancellation
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  cancellationReason: {
    type: String,
    maxlength: [500, 'Cancellation reason cannot exceed 500 characters']
  },
  cancelledAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
sessionSchema.index({ student: 1 });
sessionSchema.index({ tutor: 1 });
sessionSchema.index({ status: 1 });
sessionSchema.index({ sessionDate: 1 });
sessionSchema.index({ subject: 1 });
sessionSchema.index({ createdAt: -1 });

// Virtual for session duration in hours
sessionSchema.virtual('durationInHours').get(function() {
  return this.duration / 60;
});

// Virtual for formatted total cost
sessionSchema.virtual('formattedAmount').get(function() {
  return `$${(this.totalCost || 0).toFixed(2)}`;
});

// Virtual for session status display
sessionSchema.virtual('statusDisplay').get(function() {
  const statusMap = {
    'pending': 'Pending Approval',
    'approved': 'Approved',
    'rejected': 'Rejected',
    'in-progress': 'In Progress',
    'completed': 'Completed',
    'cancelled': 'Cancelled',
    'no-show': 'No Show'
  };
  return statusMap[this.status] || this.status;
});

// Pre-save middleware to calculate total cost
sessionSchema.pre('save', function(next) {
  if (this.isModified('duration') || this.isModified('hourlyRate')) {
    this.totalCost = this.duration * this.hourlyRate;
  }

  this.lastUpdated = new Date();
  next();
});

// Pre-save middleware to set responded date
sessionSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status !== 'pending' && !this.respondedAt) {
    this.respondedAt = new Date();
  }
  next();
});

// Method to check if session can be started
sessionSchema.methods.canStart = function() {
  return this.status === 'approved' &&
         this.sessionDate &&
         new Date() >= new Date(this.sessionDate.getTime() - 15 * 60 * 1000); // 15 minutes before
};

// Method to check if session can be cancelled
sessionSchema.methods.canCancel = function() {
  return ['pending', 'approved'].includes(this.status);
};

// Method to check if session can be rated
sessionSchema.methods.canRate = function() {
  return this.status === 'completed' && !this.isRated;
};

// Method to start session
sessionSchema.methods.startSession = function() {
  this.status = 'in-progress';
  this.sessionStartTime = new Date();
  return this.save();
};

// Method to end session
sessionSchema.methods.endSession = function() {
  this.status = 'completed';
  this.sessionEndTime = new Date();
  
  if (this.sessionStartTime) {
    this.actualDuration = Math.round((this.sessionEndTime - this.sessionStartTime) / (1000 * 60));
  }
  
  return this.save();
};

// Static method to get sessions by user
sessionSchema.statics.getSessionsByUser = function(userId, role = null) {
  const query = {};
  
  if (role === 'student') {
    query.student = userId;
  } else if (role === 'tutor') {
    query.tutor = userId;
  } else {
    query.$or = [{ student: userId }, { tutor: userId }];
  }
  
  return this.find(query)
    .populate('student', 'firstName lastName avatar')
    .populate('tutor', 'firstName lastName avatar subjects averageRating')
    .sort({ createdAt: -1 });
};

// Static method to get upcoming sessions
sessionSchema.statics.getUpcomingSessions = function(userId) {
  return this.find({
    $or: [{ student: userId }, { tutor: userId }],
    status: 'approved',
    sessionDate: { $gte: new Date() }
  })
  .populate('student', 'firstName lastName avatar')
  .populate('tutor', 'firstName lastName avatar subjects')
  .sort({ sessionDate: 1 });
};

module.exports = mongoose.model('Session', sessionSchema);
