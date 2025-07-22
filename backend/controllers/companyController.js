const jwt = require('jsonwebtoken');
const Company = require('../models/Company');
const DriveRequest = require('../models/DriveRequest');
const Application = require('../models/Application');
const Student = require('../models/Student');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new company
// @route   POST /api/company/register
// @access  Public
const registerCompany = async (req, res) => {
  try {
    const { companyName, hrName, email, password, contactNumber, description, location } = req.body;

    // Validate required fields
    if (!companyName || !hrName || !email || !password || !contactNumber) {
      return res.status(400).json({
        message: 'Please provide all required fields: companyName, hrName, email, password, contactNumber'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    console.log('Attempting to register company:', { companyName, hrName, email });

    // Check if company exists
    const companyExists = await Company.findOne({ email });
    if (companyExists) {
      return res.status(400).json({ message: 'Company with this email already exists' });
    }

    // Create company
    const company = await Company.create({
      companyName,
      hrName,
      email,
      password,
      contactNumber,
      description: description || '',
      location: location || ''
    });

    console.log('Company created successfully:', company._id);

    if (company) {
      res.status(201).json({
        _id: company._id,
        companyName: company.companyName,
        hrName: company.hrName,
        email: company.email,
        token: generateToken(company._id)
      });
    } else {
      res.status(400).json({ message: 'Failed to create company' });
    }
  } catch (error) {
    console.error('Registration error:', error);

    // Handle specific MongoDB errors
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Company with this email already exists' });
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }

    res.status(500).json({
      message: 'Server error during registration. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Auth company & get token
// @route   POST /api/company/login
// @access  Public
const loginCompany = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for company email
    const company = await Company.findOne({ email });

    if (company && (await company.matchPassword(password))) {
      res.json({
        _id: company._id,
        companyName: company.companyName,
        hrName: company.hrName,
        email: company.email,
        token: generateToken(company._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new drive request
// @route   POST /api/company/request-drive
// @access  Private
const createDriveRequest = async (req, res) => {
  try {
    const { driveTitle, description, eligibilityCriteria, dateTime, mode } = req.body;

    const driveRequest = await DriveRequest.create({
      company: req.company._id,
      driveTitle,
      description,
      eligibilityCriteria,
      dateTime,
      mode
    });

    res.status(201).json(driveRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all drive requests for a company
// @route   GET /api/company/requests
// @access  Private
const getDriveRequests = async (req, res) => {
  try {
    const driveRequests = await DriveRequest.find({ company: req.company._id });
    res.json(driveRequests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get applied students for a specific drive
// @route   GET /api/company/drive/:id/applications
// @access  Private
const getAppliedStudents = async (req, res) => {
  try {
    const driveId = req.params.id;

    // Verify the drive belongs to the logged-in company
    const drive = await DriveRequest.findOne({ _id: driveId, company: req.company._id });
    if (!drive) {
      return res.status(404).json({ message: 'Drive not found or unauthorized' });
    }

    // Get all applications for this drive with student details
    const applications = await Application.find({ driveRequest: driveId })
      .populate('student', 'name email resumeLink department year cgpa phone skills')
      .sort({ appliedAt: -1 });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update company profile
// @route   PUT /api/company/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { companyName, hrName, contactNumber, description, location } = req.body;

    const updatedCompany = await Company.findByIdAndUpdate(
      req.company._id,
      {
        companyName,
        hrName,
        contactNumber,
        description,
        location
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedCompany) {
      return res.status(404).json({ message: 'Company not found' });
    }

    res.json(updatedCompany);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get company profile
// @route   GET /api/company/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const company = await Company.findById(req.company._id).select('-password');

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    res.json(company);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get placement statistics for the company
// @route   GET /api/company/statistics
// @access  Private
const getPlacementStatistics = async (req, res) => {
  try {
    // Get all drives for this company
    const drives = await DriveRequest.find({ company: req.company._id });
    const driveIds = drives.map(drive => drive._id);

    // Get all applications for company's drives
    const applications = await Application.find({ driveRequest: { $in: driveIds } })
      .populate('student', 'department isPlaced placedCompany')
      .populate('driveRequest', 'driveTitle');

    // Calculate statistics
    const totalApplications = applications.length;
    const selectedStudents = applications.filter(app => app.status === 'Selected').length;
    const shortlistedStudents = applications.filter(app => app.status === 'Shortlisted').length;
    const rejectedStudents = applications.filter(app => app.status === 'Rejected').length;
    const appliedStudents = applications.filter(app => app.status === 'Applied').length;

    // Count students placed specifically by this company
    const placedStudents = applications.filter(app =>
      app.student.isPlaced && app.student.placedCompany === req.company.companyName
    ).length;

    // Department-wise statistics
    const departmentStats = {};
    applications.forEach(app => {
      const dept = app.student.department;
      if (!departmentStats[dept]) {
        departmentStats[dept] = { total: 0, selected: 0, placed: 0 };
      }
      departmentStats[dept].total++;
      if (app.status === 'Selected') departmentStats[dept].selected++;
      if (app.student.isPlaced && app.student.placedCompany === req.company.companyName) {
        departmentStats[dept].placed++;
      }
    });

    // Drive-wise statistics
    const driveStats = {};
    applications.forEach(app => {
      const driveTitle = app.driveRequest.driveTitle;
      if (!driveStats[driveTitle]) {
        driveStats[driveTitle] = { total: 0, selected: 0, placed: 0 };
      }
      driveStats[driveTitle].total++;
      if (app.status === 'Selected') driveStats[driveTitle].selected++;
      if (app.student.isPlaced && app.student.placedCompany === req.company.companyName) {
        driveStats[driveTitle].placed++;
      }
    });

    res.json({
      overview: {
        totalApplications,
        appliedStudents,
        shortlistedStudents,
        selectedStudents,
        rejectedStudents,
        placedStudents,
        totalDrives: drives.length,
        acceptedDrives: drives.filter(d => d.status === 'Accepted').length,
        pendingDrives: drives.filter(d => d.status === 'Pending').length,
        rejectedDrives: drives.filter(d => d.status === 'Rejected').length
      },
      departmentStats,
      driveStats,
      companyInfo: {
        name: req.company.companyName,
        hrName: req.company.hrName,
        email: req.company.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerCompany,
  loginCompany,
  createDriveRequest,
  getDriveRequests,
  getAppliedStudents,
  getPlacementStatistics,
  updateProfile,
  getProfile
};