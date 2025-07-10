const User = require('../models/User');
const Rating = require('../models/Rating');

// @desc    Get all tutors with filtering and search
// @route   GET /api/tutors
// @access  Public
const getAllTutors = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      search = '',
      subjects = '',
      minRate = 0,
      maxRate = 1000,
      minRating = 0,
      experience = '',
      city = '',
      sortBy = 'averageRating',
      sortOrder = 'desc'
    } = req.query;

    const skip = (page - 1) * limit;

    // Build query
    const query = {
      role: 'tutor',
      isActive: true,
      pendingApproval: false,
      profileCompleted: true
    };

    // Search by name or bio
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by subjects
    if (subjects) {
      const subjectArray = subjects.split(',').map(s => s.trim());
      query.subjects = { $in: subjectArray };
    }

    // Filter by hourly rate
    if (minRate || maxRate) {
      query.hourlyRate = {};
      if (minRate) query.hourlyRate.$gte = parseFloat(minRate);
      if (maxRate) query.hourlyRate.$lte = parseFloat(maxRate);
    }

    // Filter by rating
    if (minRating) {
      query.averageRating = { $gte: parseFloat(minRating) };
    }

    // Filter by experience
    if (experience) {
      const expRange = experience.split('-');
      if (expRange.length === 2) {
        query.experience = {
          $gte: parseInt(expRange[0]),
          $lte: parseInt(expRange[1])
        };
      } else if (experience.includes('+')) {
        const minExp = parseInt(experience.replace('+', ''));
        query.experience = { $gte: minExp };
      }
    }

    // Filter by city
    if (city) {
      query.city = { $regex: city, $options: 'i' };
    }

    // Build sort object
    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query
    const tutors = await User.find(query)
      .select('-password -email -bookmarkedTutors -emailVerificationToken -passwordResetToken')
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit));

    // Add session statistics to each tutor
    const Session = require('../models/Session');
    const tutorsWithStats = await Promise.all(
      tutors.map(async (tutor) => {
        const totalSessions = await Session.countDocuments({ tutor: tutor._id });
        const completedSessions = await Session.countDocuments({ tutor: tutor._id, status: 'completed' });

        return {
          ...tutor.toObject(),
          totalSessions,
          completedSessions
        };
      })
    );

    const total = await User.countDocuments(query);

    // Get unique subjects for filtering
    const allSubjects = await User.aggregate([
      { $match: { role: 'tutor', isActive: true, pendingApproval: false } },
      { $unwind: '$subjects' },
      { $group: { _id: '$subjects' } },
      { $sort: { _id: 1 } }
    ]);

    const subjects_list = allSubjects.map(item => item._id);

    res.status(200).json({
      success: true,
      tutors: tutorsWithStats,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      },
      filters: {
        subjects: subjects_list,
        totalTutors: total
      }
    });
  } catch (error) {
    console.error('Get tutors error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Search tutors with advanced filtering
// @route   GET /api/tutors/search
// @access  Public
const searchTutors = async (req, res) => {
  try {
    const {
      q = '',
      subjects = '',
      location = '',
      availability = '',
      page = 1,
      limit = 12
    } = req.query;

    const skip = (page - 1) * limit;

    // Build search query
    const query = {
      role: 'tutor',
      isActive: true,
      pendingApproval: false,
      profileCompleted: true
    };

    // Text search
    if (q) {
      query.$or = [
        { firstName: { $regex: q, $options: 'i' } },
        { lastName: { $regex: q, $options: 'i' } },
        { bio: { $regex: q, $options: 'i' } },
        { subjects: { $in: [new RegExp(q, 'i')] } },
        { qualifications: { $regex: q, $options: 'i' } }
      ];
    }

    // Subject filter
    if (subjects) {
      const subjectArray = subjects.split(',').map(s => s.trim());
      query.subjects = { $in: subjectArray };
    }

    // Location filter
    if (location) {
      query.$or = [
        { city: { $regex: location, $options: 'i' } },
        { country: { $regex: location, $options: 'i' } }
      ];
    }

    // Availability filter (simplified - just check if they have availability set)
    if (availability) {
      query['availability.monday.available'] = true;
    }

    const tutors = await User.find(query)
      .select('-password -email -bookmarkedTutors -emailVerificationToken -passwordResetToken')
      .sort({ averageRating: -1, totalRatings: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Add session statistics to each tutor
    const Session = require('../models/Session');
    const tutorsWithStats = await Promise.all(
      tutors.map(async (tutor) => {
        const totalSessions = await Session.countDocuments({ tutor: tutor._id });
        const completedSessions = await Session.countDocuments({ tutor: tutor._id, status: 'completed' });

        return {
          ...tutor.toObject(),
          totalSessions,
          completedSessions
        };
      })
    );

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      tutors: tutorsWithStats,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      },
      query: { q, subjects, location, availability }
    });
  } catch (error) {
    console.error('Search tutors error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get tutor by ID
// @route   GET /api/tutors/:id
// @access  Public
const getTutorById = async (req, res) => {
  try {
    const { id } = req.params;

    const tutor = await User.findById(id)
      .select('-password -email -bookmarkedTutors -emailVerificationToken -passwordResetToken');

    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: 'Tutor not found'
      });
    }

    if (tutor.role !== 'tutor' || !tutor.isActive || tutor.pendingApproval) {
      return res.status(404).json({
        success: false,
        message: 'Tutor not found'
      });
    }

    // Get tutor's ratings
    const ratings = await Rating.find({
      tutor: id,
      isPublic: true,
      isApproved: true
    })
    .populate('student', 'firstName lastName avatar')
    .sort({ createdAt: -1 })
    .limit(10);

    // Get rating statistics
    const ratingStats = await Rating.aggregate([
      {
        $match: {
          tutor: tutor._id,
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
          distribution: {
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

    res.status(200).json({
      success: true,
      tutor,
      ratings,
      ratingStats: ratingStats[0] || {
        averageRating: 0,
        totalRatings: 0,
        distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      }
    });
  } catch (error) {
    console.error('Get tutor by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update tutor availability
// @route   PUT /api/tutors/availability
// @access  Private (Tutor only)
const updateAvailability = async (req, res) => {
  try {
    const { availability } = req.body;

    if (!availability) {
      return res.status(400).json({
        success: false,
        message: 'Availability data is required'
      });
    }

    const tutor = await User.findById(req.user._id);

    if (!tutor || tutor.role !== 'tutor') {
      return res.status(403).json({
        success: false,
        message: 'Only tutors can update availability'
      });
    }

    tutor.availability = availability;
    await tutor.save();

    res.status(200).json({
      success: true,
      message: 'Availability updated successfully',
      availability: tutor.availability
    });
  } catch (error) {
    console.error('Update availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get tutor statistics for public viewing
// @route   GET /api/tutors/:id/stats
// @access  Public
const getTutorStats = async (req, res) => {
  try {
    const { id } = req.params;
    const Session = require('../models/Session');
    const mongoose = require('mongoose');

    // Get tutor session statistics
    const [
      totalSessions,
      completedSessions,
      averageRating
    ] = await Promise.all([
      Session.countDocuments({ tutor: id }),
      Session.countDocuments({ tutor: id, status: 'completed' }),
      Session.aggregate([
        { $match: { tutor: mongoose.Types.ObjectId.createFromHexString(id), rating: { $exists: true } } },
        { $group: { _id: null, avgRating: { $avg: '$rating' } } }
      ])
    ]);

    // Calculate response time (simplified - could be more sophisticated)
    const responseTime = 'Quick'; // This could be calculated from actual response data

    const stats = {
      totalSessions,
      completedSessions,
      averageRating: averageRating[0]?.avgRating || 0,
      responseTime
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

module.exports = {
  getAllTutors,
  searchTutors,
  getTutorById,
  updateAvailability,
  getTutorStats
};
