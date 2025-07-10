const User = require('../models/User');
const Notification = require('../models/Notification');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary (if credentials are provided)
if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('bookmarkedTutors', 'firstName lastName avatar subjects averageRating hourlyRate city');
    
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      bio,
      phone,
      dateOfBirth,
      city,
      country,
      subjects,
      qualifications,
      experience,
      hourlyRate,
      availability
    } = req.body;
    
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Update basic fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (bio !== undefined) user.bio = bio;
    if (phone) user.phone = phone;
    if (dateOfBirth) user.dateOfBirth = dateOfBirth;
    if (city) user.city = city;
    if (country) user.country = country;
    
    // Update tutor-specific fields
    if (user.role === 'tutor') {
      if (subjects) user.subjects = subjects;
      if (qualifications) user.qualifications = qualifications;
      if (experience !== undefined) user.experience = experience;
      if (hourlyRate) user.hourlyRate = hourlyRate;
      if (availability) user.availability = availability;
      
      // Check if profile is now complete
      user.profileCompleted = user.isTutorProfileComplete();
    } else {
      // For students, profile is complete if basic info is filled
      user.profileCompleted = !!(firstName && lastName && bio && city);
    }
    
    await user.save();
    
    // Create notification for profile update
    await Notification.createNotification({
      recipient: user._id,
      title: 'Profile Updated',
      message: 'Your profile has been successfully updated.',
      type: 'profile_updated',
      category: 'account',
      priority: 'low'
    });
    
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Upload user avatar
// @route   POST /api/users/upload-avatar
// @access  Private
const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }
    
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    let avatarUrl = '';

    // Upload to Cloudinary if configured with real values (not placeholders)
    const hasValidCloudinary = process.env.CLOUDINARY_CLOUD_NAME &&
                               process.env.CLOUDINARY_API_KEY &&
                               process.env.CLOUDINARY_API_SECRET &&
                               !process.env.CLOUDINARY_CLOUD_NAME.includes('your_') &&
                               !process.env.CLOUDINARY_API_KEY.includes('your_') &&
                               !process.env.CLOUDINARY_API_SECRET.includes('your_');


    if (hasValidCloudinary) {
      try {
        const result = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            {
              resource_type: 'image',
              folder: 'tutormatch/avatars',
              public_id: `user_${user._id}`,
              overwrite: true,
              transformation: [
                { width: 300, height: 300, crop: 'fill', gravity: 'face' },
                { quality: 'auto', fetch_format: 'auto' }
              ]
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          ).end(req.file.buffer);
        });

        avatarUrl = result.secure_url;
      } catch (cloudinaryError) {
        console.error('Cloudinary upload error:', cloudinaryError);
        return res.status(500).json({
          success: false,
          message: 'Failed to upload image to cloud storage'
        });
      }
    } else {
      // For development, create a resized data URL from the uploaded file
      try {
        const sharp = require('sharp');

        // Resize image to 300x300 for consistency with Cloudinary
        const resizedBuffer = await sharp(req.file.buffer)
          .resize(300, 300, {
            fit: 'cover',
            position: 'center'
          })
          .jpeg({ quality: 80 })
          .toBuffer();

        const base64Image = resizedBuffer.toString('base64');
        avatarUrl = `data:image/jpeg;base64,${base64Image}`;

        console.log('Using resized base64 image for development (Cloudinary not configured)');
      } catch (error) {
        console.error('Error creating resized base64 image:', error);
        // Fallback to placeholder
        avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.firstName)}+${encodeURIComponent(user.lastName)}&size=300&background=random`;
      }
    }
    
    // Update user avatar
    user.avatar = avatarUrl;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Avatar uploaded successfully',
      avatarUrl
    });
  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete user account
// @route   DELETE /api/users/account
// @access  Private
const deleteAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Soft delete - deactivate account instead of removing
    user.isActive = false;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Account deactivated successfully'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get user by ID (public profile)
// @route   GET /api/users/:id
// @access  Public
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-email -phone -dateOfBirth -bookmarkedTutors -emailVerified -lastLogin');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Only show approved tutors or students
    if (user.role === 'tutor' && user.pendingApproval) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Bookmark/unbookmark tutor
// @route   POST /api/users/bookmark/:tutorId
// @access  Private (Student only)
const toggleBookmark = async (req, res) => {
  try {
    const { tutorId } = req.params;
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    if (user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Only students can bookmark tutors'
      });
    }
    
    // Check if tutor exists and is approved
    const tutor = await User.findById(tutorId);
    if (!tutor || tutor.role !== 'tutor' || tutor.pendingApproval) {
      return res.status(404).json({
        success: false,
        message: 'Tutor not found'
      });
    }
    
    // Toggle bookmark
    const isBookmarked = user.bookmarkedTutors.includes(tutorId);
    
    if (isBookmarked) {
      user.bookmarkedTutors = user.bookmarkedTutors.filter(
        id => id.toString() !== tutorId
      );
    } else {
      user.bookmarkedTutors.push(tutorId);
    }
    
    await user.save();
    
    res.status(200).json({
      success: true,
      message: isBookmarked ? 'Tutor unbookmarked' : 'Tutor bookmarked',
      isBookmarked: !isBookmarked
    });
  } catch (error) {
    console.error('Toggle bookmark error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get user's bookmarked tutors
// @route   GET /api/users/bookmarks
// @access  Private (Student only)
const getBookmarks = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('bookmarkedTutors', 'firstName lastName avatar subjects averageRating hourlyRate city totalRatings');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      bookmarks: user.bookmarkedTutors
    });
  } catch (error) {
    console.error('Get bookmarks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  uploadAvatar,
  deleteAccount,
  getUserById,
  toggleBookmark,
  getBookmarks
};
