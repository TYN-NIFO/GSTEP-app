const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('../config/passport');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { sendVerificationEmail, generateVerificationToken } = require('../services/emailService');

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// Check OAuth availability
router.get('/oauth/status', (req, res) => {
  const googleAvailable = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
  
  res.json({
    google: {
      available: googleAvailable,
      message: googleAvailable ? 'Google OAuth is available' : 'Google OAuth is not configured'
    }
  });
});

// Google OAuth routes - always define them but handle missing credentials
router.get('/google', (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(503).json({ 
      message: 'Google OAuth is not configured. Please contact administrator.',
      error: 'oauth_not_configured'
    });
  }
  
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

router.get('/google/callback', (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/login?error=oauth_not_configured`);
  }
  
  passport.authenticate('google', { session: false }, async (err, user) => {
    if (err) {
      console.error('Google callback error:', err);
      return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/login?error=auth_failed`);
    }
    
    if (!user) {
      return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/login?error=auth_failed`);
    }
    
    try {
      // Generate JWT token
      const token = generateToken(user._id);
      
      // Redirect to frontend with token
      res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify({
        id: user._id,
        email: user.email,
        role: user.role,
        profile: user.profile
      }))}`);
    } catch (error) {
      console.error('Token generation error:', error);
      res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/login?error=auth_failed`);
    }
  })(req, res, next);
});

// Regular login with email verification check
router.post('/login', async (req, res) => {
  try {
    console.log('=== LOGIN DEBUG ===');
    console.log('Request body:', req.body);
    
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    console.log('User found in database:', user ? 'Yes' : 'No');
    
    if (user) {
      console.log('User details:', {
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        hasPassword: user.password ? 'Yes' : 'No',
        passwordLength: user.password?.length,
        googleId: user.googleId ? 'Has Google ID' : 'No Google ID'
      });
    }
    
    if (!user) {
      console.log('❌ User not found in database for email:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check for GCT email domain for students and staff
    if ((user.role === 'student' || user.role === 'staff') && !email.endsWith('@gct.ac.in')) {
      console.log('Non-GCT email login attempt:', email);
      return res.status(400).json({ 
        message: 'Only GCT email domain allowed.' 
      });
    }

    console.log('Comparing password...');
    const isMatch = await user.comparePassword(password);
    console.log('Password match result:', isMatch);
    
    if (!isMatch) {
      console.log('❌ Password does not match for user:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check email verification (except for Google users and admin)
    if (!user.isEmailVerified && !user.googleId && email !== 'moorthy@gmail.com') {
      console.log('❌ Email not verified for user:', email);
      return res.status(400).json({ 
        message: 'Please verify your email before logging in',
        requiresVerification: true,
        email: email
      });
    }

    const token = generateToken(user._id);

    console.log('✅ Login successful for:', email);
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profile: user.profile,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Register route with email verification
router.post('/register', async (req, res) => {
  try {
    console.log('=== REGISTRATION DEBUG ===');
    console.log('Request body:', req.body);
    console.log('Request headers:', req.headers);
    
    const { email, password, role, name } = req.body;
    
    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    if (password.length < 6) {
      console.log('Password too short');
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const userRole = role || 'student';
    console.log('User role:', userRole);
    
    // Only restrict PO role to specific email
    if ((userRole === 'po' || userRole === 'placementofficer') && email !== 'moorthy@gmail.com') {
      console.log('Unauthorized PO registration attempt');
      return res.status(400).json({ 
        message: 'Only moorthy@gmail.com can register as Placement Officer' 
      });
    }

    // Check for GCT email domain for students and staff
    if ((userRole === 'student' || userRole === 'staff') && !email.endsWith('@gct.ac.in')) {
      console.log('Non-GCT email registration attempt:', email);
      return res.status(400).json({ 
        message: 'Only GCT email domain allowed.' 
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('User already exists:', email);
      return res.status(400).json({ message: 'User already exists' });
    }

    // Generate verification token for ALL users
    const { generateVerificationToken } = require('../services/emailService');
    const verificationToken = generateVerificationToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    console.log('Creating user with verification token');
    
    const userData = {
      email,
      password,
      role: userRole,
      profile: { name: name || '' },
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
      isEmailVerified: false // All users start unverified
    };

    // Special handling for admin
    if (email === 'moorthy@gmail.com') {
      userData.profile.name = 'Moorthy';
      userData.role = 'po';
      userData.isEmailVerified = true; // Auto-verify only admin
      console.log('Admin user - auto-verified');
    }

    console.log('User data to save:', { ...userData, password: '[HIDDEN]' });

    const user = new User(userData);
    await user.save();
    console.log('User saved to database:', user.email);

    // Send verification email to ALL users (except admin)
    if (email !== 'moorthy@gmail.com') {
      try {
        const { sendVerificationEmail } = require('../services/emailService');
        await sendVerificationEmail(email, verificationToken);
        console.log(`Verification email sent to: ${email}`);
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        // Don't fail registration if email fails
      }
    }

    console.log('Registration successful for:', email);
    res.status(201).json({ 
      message: email === 'moorthy@gmail.com' 
        ? 'Admin account created successfully' 
        : 'Registration successful! Please check your email to verify your account.',
      requiresVerification: email !== 'moorthy@gmail.com'
    });
  } catch (error) {
    console.error('Registration error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Email verification route
router.get('/verify-email', async (req, res) => {
  try {
    console.log('=== EMAIL VERIFICATION DEBUG ===');
    const { token } = req.query;
    console.log('Verification token received:', token);
    
    if (!token) {
      console.log('No token provided');
      return res.status(400).json({ message: 'Verification token is required' });
    }

    // First check if user is already verified with this token
    let user = await User.findOne({ emailVerificationToken: token });
    
    if (!user) {
      // Check if user exists but is already verified
      const verifiedUser = await User.findOne({ 
        isEmailVerified: true,
        email: { $exists: true }
      });
      
      if (verifiedUser) {
        console.log('User already verified, checking if this was their token...');
        return res.status(400).json({ 
          message: 'This email has already been verified. Please try logging in.' 
        });
      }
      
      console.log('Invalid token - no user found');
      return res.status(400).json({ message: 'Invalid verification token' });
    }

    // Check if token is expired
    if (user.emailVerificationExpires && user.emailVerificationExpires < Date.now()) {
      console.log('Token expired for user:', user.email);
      return res.status(400).json({ message: 'Verification token has expired. Please request a new verification email.' });
    }

    // Check if already verified
    if (user.isEmailVerified) {
      console.log('User already verified:', user.email);
      return res.status(200).json({ message: 'Email already verified. You can now log in.' });
    }

    console.log('Verifying user:', user.email);
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    console.log('Email verified successfully for:', user.email);
    res.json({ message: 'Email verified successfully! You can now log in.' });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ message: 'Server error during verification' });
  }
});

// Get current user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ user });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, rollNumber, department, backlogs, batch } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.profile = {
      ...user.profile,
      name,
      rollNumber,
      registerNo: rollNumber,
      department,
      backlogs: parseInt(backlogs) || 0,
      batch
    };

    await user.save();
    
    res.json({ 
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profile: user.profile
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Resend verification email
router.post('/resend-verification', async (req, res) => {
  try {
    console.log('=== RESEND VERIFICATION ===');
    const { email } = req.body;
    console.log('Email:', email);
    
    if (!email) {
      console.log('No email provided');
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    console.log('User found:', user ? 'Yes' : 'No');
    
    if (!user) {
      console.log('User not found');
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isEmailVerified) {
      console.log('User already verified');
      return res.status(400).json({ message: 'Email is already verified' });
    }

    // Generate new verification token
    const verificationToken = generateVerificationToken();
    
    // Update user with new token
    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    await user.save();
    
    // Send verification email
    await sendVerificationEmail(email, verificationToken);
    
    console.log('Verification email resent to:', email);
    res.json({ message: 'Verification email sent successfully' });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Debug route to check users (remove after debugging)
router.get('/debug-users', async (req, res) => {
  try {
    const users = await User.find({}, {
      email: 1,
      role: 1,
      isEmailVerified: 1,
      'profile.name': 1,
      password: 1
    });
    
    const userInfo = users.map(user => ({
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      profileName: user.profile?.name,
      hasPassword: user.password ? 'Yes' : 'No',
      passwordLength: user.password?.length
    }));
    
    console.log('Users in database:', userInfo);
    res.json({ users: userInfo });
  } catch (error) {
    console.error('Debug users error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Debug route to check specific user
router.get('/debug-user/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.json({ message: 'User not found' });
    }
    
    res.json({
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      profileName: user.profile?.name,
      hasPassword: user.password ? 'Yes' : 'No',
      passwordLength: user.password?.length,
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error('Debug user error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Route to reset admin password
router.post('/reset-admin-password', async (req, res) => {
  try {
    const { newPassword } = req.body;
    
    if (!newPassword) {
      return res.status(400).json({ message: 'New password is required' });
    }
    
    const user = await User.findOne({ email: 'moorthy@gmail.com' });
    
    if (!user) {
      return res.status(404).json({ message: 'Admin user not found' });
    }
    
    // Update password (will be hashed by the pre-save hook)
    user.password = newPassword;
    await user.save();
    
    console.log('Admin password updated successfully');
    res.json({ message: 'Admin password updated successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Route to create or recreate admin user
router.post('/setup-admin', async (req, res) => {
  try {
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }
    
    // Delete existing admin if exists
    await User.deleteOne({ email: 'moorthy@gmail.com' });
    
    // Create new admin user
    const adminUser = new User({
      email: 'moorthy@gmail.com',
      password: password,
      role: 'po',
      isEmailVerified: true,
      profile: {
        name: 'Moorthy'
      }
    });
    
    await adminUser.save();
    console.log('Admin user created/recreated successfully');
    
    res.json({ 
      message: 'Admin user created successfully',
      email: 'moorthy@gmail.com',
      role: 'po'
    });
  } catch (error) {
    console.error('Setup admin error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;




























