const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Basic Information
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  
  // Role and Status
  role: {
    type: String,
    enum: ['student', 'tutor', 'admin'],
    required: [true, 'Role is required']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  pendingApproval: {
    type: Boolean,
    default: function() {
      return this.role === 'tutor';
    }
  },
  approvedAt: {
    type: Date
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Profile Information
  avatar: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    maxlength: [1000, 'Bio cannot exceed 1000 characters'],
    default: ''
  },
  phone: {
    type: String,
    trim: true
  },
  dateOfBirth: {
    type: Date
  },
  city: {
    type: String,
    trim: true,
    maxlength: [100, 'City cannot exceed 100 characters']
  },
  country: {
    type: String,
    trim: true,
    default: 'United States'
  },
  
  // Tutor-specific fields
  subjects: [{
    type: String,
    trim: true
  }],
  qualifications: {
    type: String,
    maxlength: [1000, 'Qualifications cannot exceed 1000 characters']
  },
  experience: {
    type: Number,
    min: [0, 'Experience cannot be negative'],
    max: [50, 'Experience cannot exceed 50 years']
  },
  hourlyRate: {
    type: Number,
    min: [5, 'Hourly rate must be at least $5'],
    max: [500, 'Hourly rate cannot exceed $500']
  },
  availability: {
    monday: { start: String, end: String, available: { type: Boolean, default: false } },
    tuesday: { start: String, end: String, available: { type: Boolean, default: false } },
    wednesday: { start: String, end: String, available: { type: Boolean, default: false } },
    thursday: { start: String, end: String, available: { type: Boolean, default: false } },
    friday: { start: String, end: String, available: { type: Boolean, default: false } },
    saturday: { start: String, end: String, available: { type: Boolean, default: false } },
    sunday: { start: String, end: String, available: { type: Boolean, default: false } }
  },
  resume: {
    type: String // URL to uploaded resume
  },
  
  // Student-specific fields
  bookmarkedTutors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Rating and Reviews
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  
  // Timestamps and Activity
  lastLogin: {
    type: Date
  },
  profileCompleted: {
    type: Boolean,
    default: false
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String
  },
  passwordResetToken: {
    type: String
  },
  passwordResetExpires: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ pendingApproval: 1 });
userSchema.index({ subjects: 1 });
userSchema.index({ city: 1 });
userSchema.index({ averageRating: -1 });
userSchema.index({ hourlyRate: 1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for completed sessions count
userSchema.virtual('completedSessions', {
  ref: 'Session',
  localField: '_id',
  foreignField: 'tutor',
  count: true,
  match: { status: 'completed' }
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash password if it's been modified
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to check if tutor profile is complete
userSchema.methods.isTutorProfileComplete = function() {
  if (this.role !== 'tutor') return true;
  
  return !!(
    this.subjects && this.subjects.length > 0 &&
    this.qualifications &&
    this.experience !== undefined &&
    this.hourlyRate &&
    this.city &&
    this.bio
  );
};

// Method to update average rating
userSchema.methods.updateAverageRating = async function() {
  const Rating = mongoose.model('Rating');
  const stats = await Rating.aggregate([
    { $match: { tutor: this._id } },
    {
      $group: {
        _id: '$tutor',
        averageRating: { $avg: '$rating' },
        totalRatings: { $sum: 1 }
      }
    }
  ]);
  
  if (stats.length > 0) {
    this.averageRating = Math.round(stats[0].averageRating * 10) / 10;
    this.totalRatings = stats[0].totalRatings;
  } else {
    this.averageRating = 0;
    this.totalRatings = 0;
  }
  
  await this.save();
};

module.exports = mongoose.model('User', userSchema);
