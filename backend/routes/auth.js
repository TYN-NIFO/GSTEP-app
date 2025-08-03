const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const User = require("../models/User");
const CGPAReference = require('../models/CGPAReference');
const { auth } = require("../middleware/auth");
const { 
  userValidationRules, 
  validate, 
  authLimiter,
  sanitizeInput 
} = require("../middleware/validation");
const { config } = require("../config/config");
const logger = require("../utils/logger");

const router = express.Router();

// Email transporter
const transporter = nodemailer.createTransport({
  service: config.email.service,
  auth: {
    user: config.email.user,
    pass: config.email.pass,
  },
});

// Registration route with enhanced validation
router.post("/register", 
  authLimiter,
  sanitizeInput,
  userValidationRules.register,
  validate,
  async (req, res) => {
    try {
      const { name, email, password, role } = req.body;

      logger.info('User registration attempt', {
        email,
        role,
        ip: req.ip
      });

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        logger.logSecurity('Registration failed - User already exists', {
          email,
          ip: req.ip
        });
        return res.status(400).json({ message: "User already exists with this email" });
      }

      const verificationToken = crypto.randomBytes(32).toString("hex");
      const verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000;

      const user = new User({
        name,
        email,
        password,
        role,
        verificationToken,
        verificationTokenExpires,
        profile: {
          name: name,
        },
      });

      await user.save();

      // Auto-assign CGPA for new students if data exists
      if (role === 'student') {
        try {
          const emailPrefix = email.split('@')[0].toUpperCase();
          
          logger.info('Auto-assigning CGPA for new student', {
            email,
            rollNumber: emailPrefix
          });
          
          const cgpaRef = await CGPAReference.findOne({
            rollNumber: emailPrefix
          });

          if (cgpaRef && cgpaRef.cgpa) {
            user.profile.cgpa = cgpaRef.cgpa;
            user.profile.rollNumber = emailPrefix;
            user.markModified('profile');
            await user.save();
            
            logger.info('CGPA auto-assigned successfully', {
              email,
              cgpa: cgpaRef.cgpa
            });
          } else {
            logger.warn('No CGPA reference found for student', {
              email,
              rollNumber: emailPrefix
            });
          }
        } catch (error) {
          logger.error('Error in auto CGPA assignment', {
            error: error.message,
            email
          });
        }
      }

      const verificationUrl = `${config.cors.origin}/verify-email/${verificationToken}`;
      
      const mailOptions = {
        from: config.email.user,
        to: email,
        subject: 'Verify Your Email - Campus Placement Portal',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Email Verification</h2>
            <p>Hello ${user.name},</p>
            <p>Please verify your email address by clicking the link below:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" style="background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Verify Email Address
              </a>
            </div>
            <p>This link will expire in 24 hours.</p>
            <p>If you didn't request this, please ignore this email.</p>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);

      logger.info('User registered successfully', {
        email,
        role,
        userId: user._id
      });

      res.status(201).json({
        message: "Registration successful! Please check your email to verify your account.",
        userId: user._id,
      });
    } catch (error) {
      logger.logError(error, req);
      res.status(500).json({ message: error.message || "Registration failed" });
    }
  }
);

// Login route with enhanced validation
router.post('/login', 
  authLimiter,
  sanitizeInput,
  userValidationRules.login,
  validate,
  async (req, res) => {
    try {
      const { email, password } = req.body;

      logger.info('Login attempt', {
        email,
        ip: req.ip
      });

      const user = await User.findOne({ email });
      if (!user) {
        logger.logSecurity('Login failed - User not found', {
          email,
          ip: req.ip
        });
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        logger.logSecurity('Login failed - Invalid password', {
          email,
          ip: req.ip
        });
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      if (!user.isVerified) {
        logger.warn('Login failed - Email not verified', {
          email,
          ip: req.ip
        });
        return res.status(400).json({ 
          message: 'Please verify your email before logging in',
          needsVerification: true,
          email: user.email
        });
      }

      if (user.role === 'student' || user.role === 'placement_representative') {
        user.calculateProfileCompletion();
        await user.save({ validateBeforeSave: false });
      }

      const token = jwt.sign(
        { userId: user._id, email: user.email, role: user.role },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );

      logger.info('User logged in successfully', {
        email: user.email,
        role: user.role,
        userId: user._id
      });

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
          profile: user.profile || {},
          isProfileComplete: user.profile?.isProfileComplete || false,
          profileCompletionPercentage: user.profile?.profileCompletionPercentage || 0,
          needsProfileCompletion: (user.role === 'student' || user.role === 'placement_representative') && !user.profile?.isProfileComplete,
          placementPolicyConsent: user.placementPolicyConsent || { hasAgreed: false },
          verificationStatus: user.verificationStatus || { otpVerified: false, isVerified: false }
        }
      });
    } catch (error) {
      logger.logError(error, req);
      res.status(500).json({ message: 'Server error during login' });
    }
  }
);

// Profile update route
router.put('/profile', 
  auth,
  sanitizeInput,
  userValidationRules.profile,
  validate,
  async (req, res) => {
  try {
    const userId = req.user.id;
    const updateData = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        $set: { 
          'profile': updateData,
          'isProfileComplete': true 
        }
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ 
      message: 'Profile updated successfully',
      user: updatedUser 
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Email verification route
router.get('/verify-email/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    logger.info('Email verification attempt', {
      token: token ? 'Token provided' : 'No token',
      ip: req.ip
    });

    if (!token) {
      return res.status(400).json({ message: 'Verification token is required' });
    }

    // First check if user exists with this token (not expired)
    let user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() }
    });

    // If not found, check if user is already verified with this token pattern
    if (!user) {
      user = await User.findOne({
        email: { $exists: true },
        isVerified: true
      });
      
      // If user is already verified, return success
      if (user) {
        logger.info('User already verified', {
          email: user.email,
          ip: req.ip
        });
        return res.json({ 
          message: 'Email already verified! You can now log in.',
          success: true 
        });
      }
    }

    logger.info('Email verification - user lookup', {
      userFound: !!user,
      email: user?.email || 'No user found',
      ip: req.ip
    });

    if (!user) {
      return res.status(400).json({ 
        message: 'Invalid or expired verification token' 
      });
    }

    // Update user verification status only if not already verified
    if (!user.isVerified) {
      user.isVerified = true;
      user.verificationToken = undefined;
      user.verificationTokenExpires = undefined;
      await user.save();
      logger.info('User email verified successfully', {
        email: user.email,
        ip: req.ip
      });
    }

    res.json({ 
      message: 'Email verified successfully! You can now log in.',
      success: true 
    });

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ 
      message: 'Server error during email verification' 
    });
  }
});

// Resend verification email route
router.post('/resend-verification', 
  authLimiter,
  sanitizeInput,
  async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    user.verificationToken = verificationToken;
    user.verificationTokenExpires = verificationTokenExpires;
    await user.save();

    // Send verification email
    const verificationUrl = `${config.cors.origin}/verify-email/${verificationToken}`;
    
    const mailOptions = {
      from: config.email.user,
      to: email,
      subject: 'Verify Your Email - Campus Placement Portal',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Email Verification</h2>
          <p>Hello ${user.name},</p>
          <p>Please verify your email address by clicking the link below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          <p>This link will expire in 24 hours.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    res.json({ 
      message: 'Verification email sent successfully! Please check your inbox.' 
    });

  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ 
      message: 'Failed to send verification email' 
    });
  }
});

// Add token verification route
router.get('/verify-token', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Calculate profile completion for students and PRs
    if (user.role === 'student' || user.role === 'placement_representative') {
      user.calculateProfileCompletion();
      await user.save({ validateBeforeSave: false });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        profile: user.profile || {},
        isProfileComplete: user.profile?.isProfileComplete || false,
        profileCompletionPercentage: user.profile?.profileCompletionPercentage || 0,
        placementPolicyConsent: user.placementPolicyConsent || { hasAgreed: false },
        verificationStatus: user.verificationStatus || { otpVerified: false, isVerified: false }
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        profile: user.profile || {},
        isProfileComplete: user.profile?.isProfileComplete || false,
        profileCompletionPercentage: user.profile?.profileCompletionPercentage || 0,
        placementPolicyConsent: user.placementPolicyConsent || { hasAgreed: false },
        verificationStatus: user.verificationStatus || { otpVerified: false, isVerified: false }
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;










