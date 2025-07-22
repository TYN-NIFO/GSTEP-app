const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: '30d',
  });
};

// @route   POST /api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    console.log('Register request received with body:', JSON.stringify(req.body, null, 2)); // More detailed logging
    const { name, email, password, role, department, graduationYear, currentCompany, position, skills } = req.body;

    // Validation
    if (!name || !email || !password) {
      console.log('Missing required fields:', { 
        name: !!name, 
        email: !!email, 
        password: !!password 
      });
      return res.status(400).json({ 
        success: false, 
        message: 'Name, email and password are required',
        details: { 
          name: !!name, 
          email: !!email, 
          password: !!password 
        }
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('User already exists with email:', email);
      return res.status(400).json({ 
        success: false, 
        message: 'User already exists with this email address' 
      });
    }

    // Create user
    const userData = {
      name,
      email,
      password,
      role: role || 'alumni',
      department,
      graduationYear,
      currentCompany,
      position
    };
    
    // Add skills if provided
    if (skills && Array.isArray(skills)) {
      userData.skills = skills;
    }
    
    console.log('Creating user with data:', JSON.stringify(userData, null, 2));
    const user = new User(userData);

    await user.save();
    console.log('User created successfully:', email);

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        graduationYear: user.graduationYear,
        currentCompany: user.currentCompany,
        position: user.position,
        skills: user.skills
      }
    });
  } catch (error) {
    console.error('Registration error details:', error);
    if (error.name === 'ValidationError') {
      // Mongoose validation error
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ 
        success: false, 
        message: 'Validation error', 
        details: messages 
      });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
  try {
    console.log('Login request received:', req.body); // Debug log
    
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found:', email);
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('Password mismatch for user:', email);
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user._id);

    console.log('Login successful for user:', email);
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        graduationYear: user.graduationYear,
        currentCompany: user.currentCompany,
        position: user.position
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    res.json({
      success: true,
      user: req.user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/auth/check-email/:email
// @desc    Check if email exists (for debugging)
// @access  Public
router.get('/check-email/:email', async (req, res) => {
  try {
    const email = req.params.email;
    const user = await User.findOne({ email }).select('-password');
    
    if (user) {
      return res.json({ exists: true, user: { email: user.email, role: user.role } });
    } else {
      return res.json({ exists: false });
    }
  } catch (error) {
    console.error('Check email error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/auth/create-test-user
// @desc    Create a test user (for debugging)
// @access  Public
router.post('/create-test-user', async (req, res) => {
  try {
    // Check if test user exists
    const existingUser = await User.findOne({ email: 'test@example.com' });
    
    if (existingUser) {
      return res.json({ 
        success: true, 
        message: 'Test user already exists',
        user: {
          email: existingUser.email,
          role: existingUser.role
        }
      });
    }
    
    // Create test user
    const user = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'alumni',
      department: 'Computer Science',
      graduationYear: 2020,
      currentCompany: 'Test Company',
      position: 'Software Engineer'
    });
    
    await user.save();
    
    res.json({
      success: true,
      message: 'Test user created',
      user: {
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Create test user error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;






