const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Opportunity = require('../models/Opportunity');
const User = require('../models/User');

// @route   GET /api/alumni/profile
// @desc    Get alumni profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/alumni/dashboard
// @desc    Get alumni dashboard data
// @access  Private
router.get('/dashboard', auth, async (req, res) => {
  try {
    const opportunities = await Opportunity.find({ postedBy: req.user.id });
    
    const stats = {
      totalOpportunities: opportunities.length,
      activeOpportunities: opportunities.filter(opp => opp.isActive).length,
      totalApplications: opportunities.reduce((total, opp) => total + opp.applicants.length, 0),
      profileViews: opportunities.reduce((total, opp) => total + opp.views, 0)
    };

    const recentOpportunities = opportunities
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    res.json({
      success: true,
      stats,
      recentOpportunities
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/alumni/opportunity
// @desc    Create a new job opportunity
// @access  Private
router.post('/opportunity', auth, async (req, res) => {
  try {
    const { title, company, location, type, description, requirements, skills, department, salary } = req.body;

    const opportunity = new Opportunity({
      title,
      company,
      location,
      type,
      description,
      requirements: Array.isArray(requirements) ? requirements : [requirements],
      skills: Array.isArray(skills) ? skills : (skills ? [skills] : []),
      department,
      salary,
      postedBy: req.user.id
    });

    await opportunity.save();

    res.json({
      success: true,
      message: 'Opportunity posted successfully',
      opportunity
    });
  } catch (error) {
    console.error('Create opportunity error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/alumni/my-opportunities
// @desc    Get all opportunities posted by the alumni
// @access  Private
router.get('/my-opportunities', auth, async (req, res) => {
  try {
    const opportunities = await Opportunity.find({ postedBy: req.user.id })
      .sort({ createdAt: -1 })
      .populate('applicants.student', 'name email department');

    res.json({
      success: true,
      opportunities
    });
  } catch (error) {
    console.error('Get opportunities error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/alumni/opportunity/:id/toggle-status
// @desc    Toggle opportunity active status
// @access  Private
router.put('/opportunity/:id/toggle-status', auth, async (req, res) => {
  try {
    const { isActive } = req.body;
    
    const opportunity = await Opportunity.findOneAndUpdate(
      { _id: req.params.id, postedBy: req.user.id },
      { isActive },
      { new: true }
    );

    if (!opportunity) {
      return res.status(404).json({ success: false, message: 'Opportunity not found' });
    }

    res.json({
      success: true,
      message: `Opportunity ${isActive ? 'activated' : 'deactivated'} successfully`,
      opportunity
    });
  } catch (error) {
    console.error('Toggle status error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/alumni/opportunity/:id
// @desc    Delete an opportunity
// @access  Private
router.delete('/opportunity/:id', auth, async (req, res) => {
  try {
    const opportunity = await Opportunity.findOneAndDelete({
      _id: req.params.id,
      postedBy: req.user.id
    });

    if (!opportunity) {
      return res.status(404).json({ success: false, message: 'Opportunity not found' });
    }

    res.json({
      success: true,
      message: 'Opportunity deleted successfully'
    });
  } catch (error) {
    console.error('Delete opportunity error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/alumni/opportunity/:id
// @desc    Get single opportunity for editing
// @access  Private
router.get('/opportunity/:id', auth, async (req, res) => {
  try {
    const opportunity = await Opportunity.findOne({
      _id: req.params.id,
      postedBy: req.user.id
    });

    if (!opportunity) {
      return res.status(404).json({ success: false, message: 'Opportunity not found' });
    }

    res.json({
      success: true,
      opportunity
    });
  } catch (error) {
    console.error('Get opportunity error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/alumni/opportunity/:id
// @desc    Update an opportunity
// @access  Private
router.put('/opportunity/:id', auth, async (req, res) => {
  try {
    const { title, company, location, type, description, requirements, skills, department, salary } = req.body;

    const opportunity = await Opportunity.findOneAndUpdate(
      { _id: req.params.id, postedBy: req.user.id },
      {
        title,
        company,
        location,
        type,
        description,
        requirements: Array.isArray(requirements) ? requirements : [requirements],
        skills: Array.isArray(skills) ? skills : (skills ? [skills] : []),
        department,
        salary,
        updatedAt: Date.now()
      },
      { new: true }
    );

    if (!opportunity) {
      return res.status(404).json({ success: false, message: 'Opportunity not found' });
    }

    res.json({
      success: true,
      message: 'Opportunity updated successfully',
      opportunity
    });
  } catch (error) {
    console.error('Update opportunity error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;



