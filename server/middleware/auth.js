const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Check if user is admin
const adminAuth = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Check if user is tutor
const tutorAuth = async (req, res, next) => {
  try {
    if (req.user.role !== 'tutor' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Tutor only.' });
    }
    next();
  } catch (error) {
    console.error('Tutor auth error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Check if tutor is approved
const approvedTutorAuth = async (req, res, next) => {
  try {
    if (req.user.role === 'tutor' && req.user.pendingApproval) {
      return res.status(403).json({ 
        message: 'Account pending approval. Please wait for admin approval.',
        pendingApproval: true
      });
    }
    next();
  } catch (error) {
    console.error('Approved tutor auth error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Check if user is student
const studentAuth = async (req, res, next) => {
  try {
    if (req.user.role !== 'student' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Student only.' });
    }
    next();
  } catch (error) {
    console.error('Student auth error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  auth,
  adminAuth,
  tutorAuth,
  approvedTutorAuth,
  studentAuth
};
