const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// @route   GET /api/users/students
// @desc    Get all students for alumni to connect with
// @access  Private (Alumni only)
router.get('/students', auth, async (req, res) => {
  try {
    if (req.user.role !== 'alumni') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const students = await User.find({ role: 'student' })
      .select('name email department currentYear interests')
      .sort({ name: 1 });

    res.json({ success: true, students });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/users/alumni
// @desc    Get all alumni for students to connect with
// @access  Private (Students only)
router.get('/alumni', auth, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const alumni = await User.find({ role: 'alumni' })
      .select('name email department graduationYear currentCompany position')
      .sort({ name: 1 });

    res.json({ success: true, alumni });
  } catch (error) {
    console.error('Get alumni error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({ success: true, user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
