const Rating = require('../models/Rating');
const Session = require('../models/Session');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// @desc    Create a rating for a completed session
// @route   POST /api/ratings
// @access  Private (Student only)
const createRating = async (req, res) => {
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
      sessionId,
      rating,
      comment,
      detailedRatings,
      isPublic = true
    } = req.body;

    // Get session and verify it exists and is completed
    const session = await Session.findById(sessionId)
      .populate('student', 'firstName lastName')
      .populate('tutor', 'firstName lastName');

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Check if user is the student
    if (session.student._id.toString() !== req.user._id.toString()) {
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

    // Check if rating already exists
    const existingRating = await Rating.findOne({ session: sessionId });
    if (existingRating) {
      return res.status(400).json({
        success: false,
        message: 'Session has already been rated'
      });
    }

    // Create rating
    const newRating = new Rating({
      session: sessionId,
      student: req.user._id,
      tutor: session.tutor._id,
      rating,
      comment,
      detailedRatings,
      isPublic,
      subject: session.subject,
      sessionDuration: session.duration,
      sessionDate: session.sessionDate
    });

    await newRating.save();

    // Update session with rating
    session.rating = rating;
    session.review = comment;
    await session.save();

    // Populate the rating for response
    await newRating.populate('student', 'firstName lastName avatar');
    await newRating.populate('tutor', 'firstName lastName');

    res.status(201).json({
      success: true,
      message: 'Rating created successfully',
      rating: newRating
    });
  } catch (error) {
    console.error('Create rating error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get ratings for a tutor
// @route   GET /api/ratings/tutor/:tutorId
// @access  Public
const getTutorRatings = async (req, res) => {
  try {
    const { tutorId } = req.params;
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      minRating = 1,
      maxRating = 5,
      subject
    } = req.query;

    // Verify tutor exists
    const tutor = await User.findById(tutorId);
    if (!tutor || tutor.role !== 'tutor') {
      return res.status(404).json({
        success: false,
        message: 'Tutor not found'
      });
    }

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    // Build query
    const query = {
      tutor: tutorId,
      isPublic: true,
      isApproved: true,
      rating: { $gte: parseInt(minRating), $lte: parseInt(maxRating) }
    };

    if (subject) {
      query.subject = { $regex: subject, $options: 'i' };
    }

    // Get ratings
    const ratings = await Rating.find(query)
      .populate('student', 'firstName lastName avatar')
      .populate('session', 'subject duration sessionDate')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await Rating.countDocuments(query);

    // Get rating statistics
    const stats = await Rating.getTutorRatingStats(tutorId);

    res.status(200).json({
      success: true,
      ratings,
      stats: stats[0] || {
        averageRating: 0,
        totalRatings: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      },
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get tutor ratings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get rating by ID
// @route   GET /api/ratings/:id
// @access  Public
const getRatingById = async (req, res) => {
  try {
    const { id } = req.params;

    const rating = await Rating.findById(id)
      .populate('student', 'firstName lastName avatar')
      .populate('tutor', 'firstName lastName avatar')
      .populate('session', 'subject duration sessionDate');

    if (!rating) {
      return res.status(404).json({
        success: false,
        message: 'Rating not found'
      });
    }

    // Check if rating is public or user has access
    if (!rating.isPublic && !rating.isApproved) {
      const hasAccess = 
        req.user && (
          rating.student._id.toString() === req.user._id.toString() ||
          rating.tutor._id.toString() === req.user._id.toString() ||
          req.user.role === 'admin'
        );

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }

    res.status(200).json({
      success: true,
      rating
    });
  } catch (error) {
    console.error('Get rating by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update rating
// @route   PUT /api/ratings/:id
// @access  Private (Student who created the rating)
const updateRating = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment, detailedRatings, isPublic } = req.body;

    const existingRating = await Rating.findById(id);
    if (!existingRating) {
      return res.status(404).json({
        success: false,
        message: 'Rating not found'
      });
    }

    // Check if user is the student who created the rating
    if (existingRating.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own ratings'
      });
    }

    // Check if rating can be updated (within 7 days)
    const daysSinceCreated = (new Date() - existingRating.createdAt) / (1000 * 60 * 60 * 24);
    if (daysSinceCreated > 7) {
      return res.status(400).json({
        success: false,
        message: 'Ratings can only be updated within 7 days of creation'
      });
    }

    // Update fields
    if (rating !== undefined) existingRating.rating = rating;
    if (comment !== undefined) existingRating.comment = comment;
    if (detailedRatings !== undefined) existingRating.detailedRatings = detailedRatings;
    if (isPublic !== undefined) existingRating.isPublic = isPublic;

    await existingRating.save();

    // Update session rating
    const session = await Session.findById(existingRating.session);
    if (session) {
      session.rating = existingRating.rating;
      session.review = existingRating.comment;
      await session.save();
    }

    await existingRating.populate('student', 'firstName lastName avatar');
    await existingRating.populate('tutor', 'firstName lastName');

    res.status(200).json({
      success: true,
      message: 'Rating updated successfully',
      rating: existingRating
    });
  } catch (error) {
    console.error('Update rating error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete rating
// @route   DELETE /api/ratings/:id
// @access  Private (Student who created the rating or Admin)
const deleteRating = async (req, res) => {
  try {
    const { id } = req.params;

    const rating = await Rating.findById(id);
    if (!rating) {
      return res.status(404).json({
        success: false,
        message: 'Rating not found'
      });
    }

    // Check permissions
    const canDelete = 
      rating.student.toString() === req.user._id.toString() ||
      req.user.role === 'admin';

    if (!canDelete) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await rating.remove();

    // Update session
    const session = await Session.findById(rating.session);
    if (session) {
      session.rating = null;
      session.review = null;
      await session.save();
    }

    res.status(200).json({
      success: true,
      message: 'Rating deleted successfully'
    });
  } catch (error) {
    console.error('Delete rating error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Add helpful vote to rating
// @route   POST /api/ratings/:id/vote
// @access  Private
const voteOnRating = async (req, res) => {
  try {
    const { id } = req.params;
    const { isHelpful } = req.body;

    const rating = await Rating.findById(id);
    if (!rating) {
      return res.status(404).json({
        success: false,
        message: 'Rating not found'
      });
    }

    // Users cannot vote on their own ratings
    if (rating.student.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot vote on your own rating'
      });
    }

    await rating.addHelpfulVote(req.user._id, isHelpful);

    res.status(200).json({
      success: true,
      message: 'Vote recorded successfully',
      helpfulCount: rating.helpfulCount,
      notHelpfulCount: rating.notHelpfulCount
    });
  } catch (error) {
    console.error('Vote on rating error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Remove vote from rating
// @route   DELETE /api/ratings/:id/vote
// @access  Private
const removeVoteFromRating = async (req, res) => {
  try {
    const { id } = req.params;

    const rating = await Rating.findById(id);
    if (!rating) {
      return res.status(404).json({
        success: false,
        message: 'Rating not found'
      });
    }

    await rating.removeVote(req.user._id);

    res.status(200).json({
      success: true,
      message: 'Vote removed successfully',
      helpfulCount: rating.helpfulCount,
      notHelpfulCount: rating.notHelpfulCount
    });
  } catch (error) {
    console.error('Remove vote error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Add tutor response to rating
// @route   POST /api/ratings/:id/response
// @access  Private (Tutor only)
const addTutorResponse = async (req, res) => {
  try {
    const { id } = req.params;
    const { response } = req.body;

    if (!response || response.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Response content is required'
      });
    }

    const rating = await Rating.findById(id);
    if (!rating) {
      return res.status(404).json({
        success: false,
        message: 'Rating not found'
      });
    }

    // Check if user is the tutor
    if (rating.tutor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the tutor can respond to this rating'
      });
    }

    await rating.addTutorResponse(response.trim());

    res.status(200).json({
      success: true,
      message: 'Response added successfully',
      tutorResponse: rating.tutorResponse
    });
  } catch (error) {
    console.error('Add tutor response error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Flag rating for review
// @route   POST /api/ratings/:id/flag
// @access  Private
const flagRating = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const validReasons = ['inappropriate', 'spam', 'fake', 'offensive', 'other'];
    if (!reason || !validReasons.includes(reason)) {
      return res.status(400).json({
        success: false,
        message: 'Valid reason is required'
      });
    }

    const rating = await Rating.findById(id);
    if (!rating) {
      return res.status(404).json({
        success: false,
        message: 'Rating not found'
      });
    }

    // Users cannot flag their own ratings
    if (rating.student.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot flag your own rating'
      });
    }

    await rating.flag(req.user._id, reason);

    res.status(200).json({
      success: true,
      message: 'Rating flagged for review'
    });
  } catch (error) {
    console.error('Flag rating error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get user's ratings (as student)
// @route   GET /api/ratings/my-ratings
// @access  Private
const getMyRatings = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const ratings = await Rating.find({ student: req.user._id })
      .populate('tutor', 'firstName lastName avatar')
      .populate('session', 'subject duration sessionDate')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Rating.countDocuments({ student: req.user._id });

    res.status(200).json({
      success: true,
      ratings,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get my ratings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Fix existing ratings with missing comments
// @route   POST /api/ratings/fix-comments
// @access  Private (Admin only)
const fixRatingComments = async (req, res) => {
  try {
    console.log('🔧 Starting review fix...');

    // Find all ratings that have missing or empty comments
    const ratingsToFix = await Rating.find({
      $or: [
        { comment: { $exists: false } },
        { comment: null },
        { comment: '' }
      ]
    }).populate('session');

    console.log(`Found ${ratingsToFix.length} ratings to fix`);
    let fixedCount = 0;

    for (const rating of ratingsToFix) {
      if (rating.session && rating.session.review) {
        // Copy the review from session to rating comment
        rating.comment = rating.session.review;
        await rating.save();
        console.log(`✅ Fixed rating ${rating._id} - added comment: "${rating.comment}"`);
        fixedCount++;
      } else {
        // Set a default comment if no review exists
        rating.comment = 'Great session!';
        await rating.save();
        console.log(`✅ Fixed rating ${rating._id} - added default comment`);
        fixedCount++;
      }
    }

    res.status(200).json({
      success: true,
      message: `Fixed ${fixedCount} ratings`,
      fixedCount,
      totalFound: ratingsToFix.length
    });
  } catch (error) {
    console.error('❌ Error fixing reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Error fixing reviews',
      error: error.message
    });
  }
};

module.exports = {
  createRating,
  getTutorRatings,
  getRatingById,
  updateRating,
  deleteRating,
  voteOnRating,
  removeVoteFromRating,
  addTutorResponse,
  flagRating,
  getMyRatings,
  fixRatingComments
};
