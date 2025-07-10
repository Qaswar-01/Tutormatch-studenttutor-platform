const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  // Rating Participants
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    required: [true, 'Session is required'],
    unique: true // One rating per session
  },
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
  
  // Rating Details
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5'],
    validate: {
      validator: function(v) {
        return Number.isInteger(v);
      },
      message: 'Rating must be a whole number'
    }
  },
  
  // Review Content
  comment: {
    type: String,
    trim: true,
    maxlength: [500, 'Comment cannot exceed 500 characters']
  },
  
  // Detailed Ratings (optional breakdown)
  detailedRatings: {
    communication: {
      type: Number,
      min: 1,
      max: 5
    },
    knowledge: {
      type: Number,
      min: 1,
      max: 5
    },
    punctuality: {
      type: Number,
      min: 1,
      max: 5
    },
    helpfulness: {
      type: Number,
      min: 1,
      max: 5
    },
    overall: {
      type: Number,
      min: 1,
      max: 5
    }
  },
  
  // Rating Status
  isPublic: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: true // Automatically verified since it's tied to a completed session
  },
  
  // Moderation
  isFlagged: {
    type: Boolean,
    default: false
  },
  flaggedReason: {
    type: String,
    enum: ['inappropriate', 'spam', 'fake', 'offensive', 'other']
  },
  flaggedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  flaggedAt: {
    type: Date
  },
  
  // Admin Review
  isApproved: {
    type: Boolean,
    default: true
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  },
  adminNotes: {
    type: String,
    maxlength: [500, 'Admin notes cannot exceed 500 characters']
  },
  
  // Tutor Response
  tutorResponse: {
    content: {
      type: String,
      trim: true,
      maxlength: [500, 'Tutor response cannot exceed 500 characters']
    },
    respondedAt: {
      type: Date
    }
  },
  
  // Helpful Votes (like/dislike system)
  helpfulVotes: {
    helpful: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      votedAt: {
        type: Date,
        default: Date.now
      }
    }],
    notHelpful: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      votedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  
  // Metadata
  subject: {
    type: String,
    required: [true, 'Subject is required']
  },
  sessionDuration: {
    type: Number // Duration in minutes
  },
  sessionDate: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
ratingSchema.index({ tutor: 1, createdAt: -1 });
ratingSchema.index({ student: 1 });
ratingSchema.index({ session: 1 });
ratingSchema.index({ rating: -1 });
ratingSchema.index({ isPublic: 1 });
ratingSchema.index({ isApproved: 1 });
ratingSchema.index({ subject: 1 });

// Virtual for helpful votes count
ratingSchema.virtual('helpfulCount').get(function() {
  return this.helpfulVotes.helpful.length;
});

// Virtual for not helpful votes count
ratingSchema.virtual('notHelpfulCount').get(function() {
  return this.helpfulVotes.notHelpful.length;
});

// Virtual for net helpful score
ratingSchema.virtual('helpfulScore').get(function() {
  return this.helpfulCount - this.notHelpfulCount;
});

// Virtual for formatted date
ratingSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Virtual for rating display (stars)
ratingSchema.virtual('ratingStars').get(function() {
  return '★'.repeat(this.rating) + '☆'.repeat(5 - this.rating);
});

// Virtual for average detailed rating
ratingSchema.virtual('averageDetailedRating').get(function() {
  if (!this.detailedRatings) return this.rating;
  
  const ratings = Object.values(this.detailedRatings).filter(r => r !== undefined);
  if (ratings.length === 0) return this.rating;
  
  const sum = ratings.reduce((acc, rating) => acc + rating, 0);
  return Math.round((sum / ratings.length) * 10) / 10;
});

// Pre-save middleware to populate session details
ratingSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      const Session = mongoose.model('Session');
      const session = await Session.findById(this.session);
      
      if (session) {
        this.subject = session.subject;
        this.sessionDuration = session.actualDuration || session.duration;
        this.sessionDate = session.sessionEndTime || session.scheduledDate;
      }
    } catch (error) {
      console.error('Error populating session details:', error);
    }
  }
  next();
});

// Post-save middleware to update tutor's average rating
ratingSchema.post('save', async function() {
  try {
    const User = mongoose.model('User');
    const tutor = await User.findById(this.tutor);
    if (tutor) {
      await tutor.updateAverageRating();
    }
  } catch (error) {
    console.error('Error updating tutor average rating:', error);
  }
});

// Post-remove middleware to update tutor's average rating
ratingSchema.post('remove', async function() {
  try {
    const User = mongoose.model('User');
    const tutor = await User.findById(this.tutor);
    if (tutor) {
      await tutor.updateAverageRating();
    }
  } catch (error) {
    console.error('Error updating tutor average rating after removal:', error);
  }
});

// Method to add helpful vote
ratingSchema.methods.addHelpfulVote = function(userId, isHelpful = true) {
  // Remove any existing vote from this user
  this.helpfulVotes.helpful = this.helpfulVotes.helpful.filter(
    vote => !vote.user.equals(userId)
  );
  this.helpfulVotes.notHelpful = this.helpfulVotes.notHelpful.filter(
    vote => !vote.user.equals(userId)
  );
  
  // Add new vote
  if (isHelpful) {
    this.helpfulVotes.helpful.push({ user: userId });
  } else {
    this.helpfulVotes.notHelpful.push({ user: userId });
  }
  
  return this.save();
};

// Method to remove vote
ratingSchema.methods.removeVote = function(userId) {
  this.helpfulVotes.helpful = this.helpfulVotes.helpful.filter(
    vote => !vote.user.equals(userId)
  );
  this.helpfulVotes.notHelpful = this.helpfulVotes.notHelpful.filter(
    vote => !vote.user.equals(userId)
  );
  
  return this.save();
};

// Method to flag rating
ratingSchema.methods.flag = function(userId, reason) {
  this.isFlagged = true;
  this.flaggedBy = userId;
  this.flaggedReason = reason;
  this.flaggedAt = new Date();
  this.isApproved = false; // Pending admin review
  
  return this.save();
};

// Method to add tutor response
ratingSchema.methods.addTutorResponse = function(response) {
  this.tutorResponse = {
    content: response,
    respondedAt: new Date()
  };
  
  return this.save();
};

// Static method to get ratings for tutor
ratingSchema.statics.getTutorRatings = function(tutorId, options = {}) {
  const {
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = -1,
    minRating = 1,
    maxRating = 5
  } = options;
  
  const skip = (page - 1) * limit;
  
  return this.find({
    tutor: tutorId,
    isPublic: true,
    isApproved: true,
    rating: { $gte: minRating, $lte: maxRating }
  })
  .populate('student', 'firstName lastName avatar')
  .populate('session', 'subject duration')
  .sort({ [sortBy]: sortOrder })
  .skip(skip)
  .limit(limit);
};

// Static method to get rating statistics for tutor
ratingSchema.statics.getTutorRatingStats = function(tutorId) {
  return this.aggregate([
    {
      $match: {
        tutor: new mongoose.Types.ObjectId(tutorId),
        isPublic: true,
        isApproved: true
      }
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalRatings: { $sum: 1 },
        ratingDistribution: {
          $push: '$rating'
        }
      }
    },
    {
      $project: {
        _id: 0,
        averageRating: { $round: ['$averageRating', 1] },
        totalRatings: 1,
        ratingDistribution: {
          5: {
            $size: {
              $filter: {
                input: '$ratingDistribution',
                cond: { $eq: ['$$this', 5] }
              }
            }
          },
          4: {
            $size: {
              $filter: {
                input: '$ratingDistribution',
                cond: { $eq: ['$$this', 4] }
              }
            }
          },
          3: {
            $size: {
              $filter: {
                input: '$ratingDistribution',
                cond: { $eq: ['$$this', 3] }
              }
            }
          },
          2: {
            $size: {
              $filter: {
                input: '$ratingDistribution',
                cond: { $eq: ['$$this', 2] }
              }
            }
          },
          1: {
            $size: {
              $filter: {
                input: '$ratingDistribution',
                cond: { $eq: ['$$this', 1] }
              }
            }
          }
        }
      }
    }
  ]);
};

module.exports = mongoose.model('Rating', ratingSchema);
