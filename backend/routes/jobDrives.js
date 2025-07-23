const express = require('express');
const JobDrive = require('../models/JobDrive');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Authorization middleware for PO
const authorizePO = (req, res, next) => {
  if (req.user.role !== 'po' && req.user.role !== 'placementofficer') {
    return res.status(403).json({ message: 'Access denied - Only Placement Officers can perform this action' });
  }
  next();
};

// Create new job drive - Only for authorized PO
router.post('/', auth, authorizePO, async (req, res) => {
  try {
    const jobDriveData = {
      companyName: req.body.companyName,
      role: req.body.role,
      type: req.body.type,
      ctc: req.body.ctc,
      location: req.body.location,
      date: req.body.date,
      description: req.body.description,
      requirements: req.body.requirements,
      skills: req.body.skills || [],
      bond: req.body.bond || '',
      rounds: req.body.rounds || [],
      isActive: req.body.isActive !== false,
      createdBy: req.user.id,
      eligibility: {
        minCGPA: req.body.eligibility?.cgpa || req.body.eligibility?.minCGPA || 0,
        maxBacklogs: parseInt(req.body.eligibility?.maxBacklogs) || 0,
        allowedDepartments: req.body.eligibility?.departments || req.body.eligibility?.allowedDepartments || [],
        allowedBatches: req.body.eligibility?.batches || req.body.eligibility?.allowedBatches || []
      }
    };

    const jobDrive = new JobDrive(jobDriveData);
    await jobDrive.save();

    res.status(201).json({
      message: 'Job drive created successfully',
      jobDrive
    });
  } catch (error) {
    console.error('Create job drive error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all job drives (for PO/admin)
router.get('/', auth, async (req, res) => {
  try {
    console.log('=== GET ALL JOB DRIVES ===');
    console.log('User role:', req.user.role);
    
    const jobDrives = await JobDrive.find()
      .sort({ createdAt: -1 })
      .populate('createdBy', 'email profile.name')
      .populate('applications.student', 'email profile.name profile.rollNumber');
    
    console.log(`Found ${jobDrives.length} job drives`);
    
    res.json({
      message: 'Job drives fetched successfully',
      jobDrives
    });
  } catch (error) {
    console.error('Get job drives error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get job drives for students (with eligibility check)
router.get('/student-drives', auth, async (req, res) => {
  try {
    console.log('=== GET STUDENT DRIVES ===');
    console.log('User:', req.user.email, 'Role:', req.user.role);
    console.log('User profile:', req.user.profile);
    
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Access denied - Students only' });
    }

    const currentDate = new Date();
    console.log('Current date:', currentDate);
    
    // Get all active job drives (remove profile check for now to debug)
    const jobDrives = await JobDrive.find({
      isActive: true,
      date: { $gte: currentDate }
    })
    .sort({ date: 1 })
    .populate('createdBy', 'email profile.name')
    .populate('applications.student', 'email profile.name profile.rollNumber');
    
    console.log(`Found ${jobDrives.length} active job drives for student`);
    
    // Log each drive for debugging
    jobDrives.forEach((drive, index) => {
      console.log(`Drive ${index + 1}:`, {
        id: drive._id,
        company: drive.companyName,
        role: drive.role,
        date: drive.date,
        isActive: drive.isActive,
        applications: drive.applications.length
      });
    });
    
    res.json({
      message: 'Job drives fetched successfully',
      jobDrives,
      total: jobDrives.length
    });
  } catch (error) {
    console.error('Get student drives error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all drives (alternative endpoint)
router.get('/all', auth, async (req, res) => {
  try {
    console.log('=== GET ALL DRIVES (ALTERNATIVE) ===');
    console.log('User role:', req.user.role);
    
    const jobDrives = await JobDrive.find()
      .sort({ createdAt: -1 })
      .populate('createdBy', 'email profile.name')
      .populate('applications.student', 'email profile.name profile.rollNumber');
    
    console.log(`Found ${jobDrives.length} job drives`);
    
    res.json({
      jobDrives
    });
  } catch (error) {
    console.error('Get all drives error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get stats for dashboard
router.get('/stats', auth, async (req, res) => {
  try {
    console.log('=== GET STATS ===');
    console.log('User role:', req.user.role);
    
    const totalDrives = await JobDrive.countDocuments();
    const upcomingDrives = await JobDrive.countDocuments({
      date: { $gte: new Date() },
      isActive: true
    });
    
    let totalApplications = 0;
    if (req.user.role === 'student') {
      const drives = await JobDrive.find({
        'applications.student': req.user.id
      });
      totalApplications = drives.length;
    } else {
      const drives = await JobDrive.find();
      totalApplications = drives.reduce((sum, drive) => sum + drive.applications.length, 0);
    }

    console.log('Stats:', { totalDrives, upcomingDrives, totalApplications });

    res.json({
      totalDrives,
      upcomingDrives,
      totalApplications
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Apply to job drive
router.post('/:id/apply', auth, async (req, res) => {
  try {
    console.log('=== APPLY TO JOB DRIVE ===');
    console.log('Drive ID:', req.params.id);
    console.log('User:', req.user.email, 'Role:', req.user.role);
    console.log('User ID:', req.user.id);
    
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Access denied - Students only' });
    }

    const jobDrive = await JobDrive.findById(req.params.id);
    if (!jobDrive) {
      return res.status(404).json({ message: 'Job drive not found' });
    }

    // Check if already applied
    const alreadyApplied = jobDrive.applications.some(
      app => app.student.toString() === req.user.id
    );

    if (alreadyApplied) {
      console.log('User already applied to this drive');
      return res.status(400).json({ message: 'Already applied to this job drive' });
    }

    // Add application
    const newApplication = {
      student: req.user.id,
      appliedAt: new Date(),
      status: 'applied'
    };
    
    jobDrive.applications.push(newApplication);
    await jobDrive.save();
    
    console.log('Application submitted successfully');
    console.log('New application:', newApplication);
    console.log('Total applications now:', jobDrive.applications.length);
    
    res.json({ 
      message: 'Application submitted successfully',
      application: newApplication
    });
  } catch (error) {
    console.error('Apply error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete job drive
router.delete('/:id', auth, authorizePO, async (req, res) => {
  try {
    console.log('=== DELETE JOB DRIVE ===');
    console.log('Drive ID:', req.params.id);
    console.log('User:', req.user.email, 'Role:', req.user.role);
    
    const jobDrive = await JobDrive.findByIdAndDelete(req.params.id);
    
    if (!jobDrive) {
      return res.status(404).json({ message: 'Job drive not found' });
    }
    
    console.log('Job drive deleted successfully');
    res.json({ message: 'Job drive deleted successfully' });
  } catch (error) {
    console.error('Delete job drive error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Debug route to check job drives in database
router.get('/debug/all', async (req, res) => {
  try {
    const jobDrives = await JobDrive.find();
    console.log('=== DEBUG: ALL JOB DRIVES ===');
    console.log(`Total drives in database: ${jobDrives.length}`);
    
    jobDrives.forEach((drive, index) => {
      console.log(`Drive ${index + 1}:`, {
        id: drive._id,
        company: drive.companyName,
        role: drive.role,
        isActive: drive.isActive,
        applications: drive.applications.length
      });
    });
    
    res.json({
      total: jobDrives.length,
      drives: jobDrives.map(drive => ({
        id: drive._id,
        companyName: drive.companyName,
        role: drive.role,
        isActive: drive.isActive,
        applicationsCount: drive.applications.length,
        createdAt: drive.createdAt
      }))
    });
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Test endpoint to check all drives
router.get('/test-all', async (req, res) => {
  try {
    const allDrives = await JobDrive.find();
    const activeDrives = await JobDrive.find({ isActive: true });
    const futureDrives = await JobDrive.find({ 
      isActive: true, 
      date: { $gte: new Date() } 
    });
    
    console.log('=== DRIVE TEST ===');
    console.log('Total drives:', allDrives.length);
    console.log('Active drives:', activeDrives.length);
    console.log('Future active drives:', futureDrives.length);
    
    res.json({
      total: allDrives.length,
      active: activeDrives.length,
      futureActive: futureDrives.length,
      drives: allDrives.map(drive => ({
        id: drive._id,
        company: drive.companyName,
        role: drive.role,
        date: drive.date,
        isActive: drive.isActive,
        createdAt: drive.createdAt
      }))
    });
  } catch (error) {
    console.error('Test error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;








