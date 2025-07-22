const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Opportunity = require('../models/Opportunity');
const User = require('../models/User');

// @route   GET /api/students/profile
// @desc    Get student profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const student = await User.findById(req.user.id).select('-password');
    res.json({
      success: true,
      student
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/students/opportunities
// @desc    Get all active job opportunities for students
// @access  Private
router.get('/opportunities', auth, async (req, res) => {
  try {
    const { department, type, search } = req.query;
    
    let filter = { isActive: true };
    
    // Filter by department if specified
    if (department && department !== 'all') {
      filter.department = department;
    }
    
    // Filter by job type if specified
    if (type && type !== 'all') {
      filter.type = type;
    }
    
    // Search filter
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const opportunities = await Opportunity.find(filter)
      .populate('postedBy', 'name currentCompany position')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      opportunities
    });
  } catch (error) {
    console.error('Get opportunities error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/students/my-applications
// @desc    Get student's applications
// @access  Private
router.get('/my-applications', auth, async (req, res) => {
  try {
    const applications = await Opportunity.find({
      'applicants.student': req.user.id
    })
    .populate('postedBy', 'name currentCompany')
    .sort({ 'applicants.appliedAt': -1 });

    const formattedApplications = applications.map(opp => {
      const application = opp.applicants.find(app => app.student.toString() === req.user.id);
      return {
        _id: opp._id,
        title: opp.title,
        company: opp.company,
        location: opp.location,
        type: opp.type,
        postedBy: opp.postedBy,
        appliedAt: application.appliedAt,
        status: application.status
      };
    });

    res.json({
      success: true,
      applications: formattedApplications
    });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/students/apply/:opportunityId
// @desc    Apply for a job opportunity
// @access  Private
router.post('/apply/:opportunityId', auth, async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.opportunityId);
    
    if (!opportunity) {
      return res.status(404).json({ success: false, message: 'Opportunity not found' });
    }

    // Check if already applied
    const alreadyApplied = opportunity.applicants.some(
      applicant => applicant.student.toString() === req.user.id
    );

    if (alreadyApplied) {
      return res.status(400).json({ success: false, message: 'Already applied for this opportunity' });
    }

    // Add application
    opportunity.applicants.push({
      student: req.user.id,
      appliedAt: new Date()
    });

    await opportunity.save();

    res.json({
      success: true,
      message: 'Application submitted successfully'
    });
  } catch (error) {
    console.error('Apply error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;


