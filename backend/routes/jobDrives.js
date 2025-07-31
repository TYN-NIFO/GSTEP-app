const express = require('express');
const JobDrive = require('../models/JobDrive');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { requirePlacementConsent } = require('../middleware/placementConsent');
const { requireCompleteProfile } = require('../middleware/profileComplete');

const router = express.Router();

// Authorization middleware for PO and PR
const authorizePO = (req, res, next) => {
  const allowedRoles = ['po', 'placementofficer', 'placement_officer', 'placement_representative'];
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Access denied - Only Placement Officers and Representatives can perform this action' });
  }
  next();
};

// Create new job drive - Only for authorized PO and PR
router.post('/', auth, authorizePO, async (req, res) => {
  try {
    console.log('=== CREATE JOB DRIVE ===');
    console.log('User role:', req.user.role);
    console.log('User ID:', req.user.id);
    
    const jobDriveData = {
      companyName: req.body.companyName,
      role: req.body.role,
      type: req.body.type || 'full-time', // Ensure default
      jobType: req.body.type || 'full-time', // Keep both for compatibility
      ctc: req.body.ctc,
      location: req.body.location,
      locations: req.body.locations || (req.body.location ? [req.body.location] : []),
      date: req.body.date,
      time: req.body.time,
      deadline: req.body.deadline,
      description: req.body.description,
      requirements: req.body.requirements || '', // Ensure it's a string
      skills: req.body.skills || [],
      bond: req.body.bond || '',
      rounds: req.body.rounds || [],
      selectionRounds: req.body.selectionRounds || [], // Add this line
      driveMode: req.body.driveMode || 'on-campus',
      venue: req.body.venue,
      testDetails: req.body.testDetails,
      interviewProcess: req.body.interviewProcess,
      isActive: req.body.isActive !== false,
      createdBy: req.user.id,
      eligibility: {
        minCGPA: req.body.eligibility?.cgpa || req.body.eligibility?.minCGPA || 0,
        maxBacklogs: parseInt(req.body.eligibility?.maxBacklogs) || 0,
        allowedDepartments: req.body.eligibility?.departments || req.body.eligibility?.allowedDepartments || [],
        allowedBatches: req.body.eligibility?.batches || req.body.eligibility?.allowedBatches || []
      }
    };

    console.log('Saving job drive data:', jobDriveData); // Debug log

    const jobDrive = new JobDrive(jobDriveData);
    await jobDrive.save();

    console.log('Job drive created successfully:', jobDrive);

    res.status(201).json({
      message: 'Job drive created successfully',
      jobDrive
    });
  } catch (error) {
    console.error('Create job drive error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all job drives (for placement representatives to see everything)
router.get('/', auth, async (req, res) => {
  try {
    console.log('Fetching all job drives for user:', req.user.role);
    
    let query = {};
    
    // If it's a student, only show active drives
    if (req.user.role === 'student') {
      query.isActive = true;
    }
    
    const jobDrives = await JobDrive.find(query)
      .populate('createdBy', 'email profile')
      .populate('applications.student', 'email profile')
      .sort({ createdAt: -1 });

    // Process drives for display
    const processedDrives = jobDrives.map(drive => ({
      ...drive.toObject(),
      type: drive.type || drive.jobType || 'full-time',
      jobType: drive.jobType || drive.type || 'full-time',
      displayType: drive.type === 'full-time' ? 'Full Time' : drive.type === 'internship' ? 'Internship' : 'Full Time',
      displayLocation: drive.location || (drive.locations && drive.locations.length > 0 ? drive.locations.join(', ') : 'Not specified')
    }));

    console.log(`Found ${processedDrives.length} job drives`);

    res.json({ 
      jobDrives: processedDrives,
      count: processedDrives.length 
    });
  } catch (error) {
    console.error('Error fetching job drives:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get student eligible drives
router.get('/student-drives', auth, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Access denied - Only students can access this' });
    }

    // Get user profile for eligibility check
    const user = await User.findById(req.user.id).populate('profile');
    if (!user || !user.profile) {
      return res.status(400).json({ message: 'Profile not found' });
    }

    const userProfile = user.profile;
    const userCGPA = parseFloat(userProfile.cgpa) || 0;
    const userBacklogs = parseInt(userProfile.currentBacklogs) || 0;
    const userDepartment = userProfile.department;

    // Get all active drives
    const allDrives = await JobDrive.find({ isActive: true })
      .populate('createdBy', 'email profile')
      .populate('applications.student', 'email profile')
      .sort({ createdAt: -1 });

    // Filter eligible drives
    const eligibleDrives = allDrives.filter(drive => {
      const eligibility = drive.eligibility || {};
      
      // Check CGPA
      if (eligibility.minCGPA && eligibility.minCGPA > userCGPA) {
        return false;
      }
      
      // Check department
      if (eligibility.allowedDepartments && 
          eligibility.allowedDepartments.length > 0 && 
          !eligibility.allowedDepartments.includes(userDepartment)) {
        return false;
      }
      
      // Check backlogs
      if (eligibility.maxBacklogs !== undefined && 
          eligibility.maxBacklogs < userBacklogs) {
        return false;
      }
      
      return true;
    });

    // Process drives to ensure all fields are properly set
    const processedDrives = eligibleDrives.map(drive => ({
      ...drive.toObject(),
      type: drive.type || drive.jobType || 'full-time',
      jobType: drive.jobType || drive.type || 'full-time',
      location: drive.location || (drive.locations && drive.locations.length > 0 ? drive.locations.join(', ') : 'Not specified')
    }));

    res.json({ 
      drives: processedDrives,
      count: processedDrives.length 
    });
  } catch (error) {
    console.error('Error fetching student drives:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all drives (for stats and general viewing)
router.get('/all', auth, async (req, res) => {
  try {
    const jobDrives = await JobDrive.find({ isActive: true })
      .populate('createdBy', 'email profile')
      .populate('applications.student', 'email profile')
      .sort({ createdAt: -1 });

    // Process drives to ensure all fields are properly set
    const processedDrives = jobDrives.map(drive => ({
      ...drive.toObject(),
      type: drive.type || drive.jobType || 'full-time',
      jobType: drive.jobType || drive.type || 'full-time',
      location: drive.location || (drive.locations && drive.locations.length > 0 ? drive.locations.join(', ') : 'Not specified')
    }));

    res.json({ 
      jobDrives: processedDrives,
      count: processedDrives.length 
    });
  } catch (error) {
    console.error('Error fetching all job drives:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get stats for dashboard
router.get('/stats', auth, async (req, res) => {
  try {
    // Get total drives count for everyone
    const allDrives = await JobDrive.countDocuments();
    
    if (req.user.role === 'student') {
      // For students - show their eligible drives and applications
      const user = await User.findById(req.user.id);
      const currentDate = new Date();
      
      // Get eligible drives count
      const userCGPA = parseFloat(user.profile?.cgpa) || 0;
      const userBacklogs = parseInt(user.profile?.currentBacklogs) || 0;
      const userDepartment = user.profile?.department;
      
      const eligibleDrives = await JobDrive.find({
        isActive: true,
        date: { $gte: currentDate },
        $and: [
          {
            $or: [
              { 'eligibility.minCGPA': { $lte: userCGPA + 0.01 } },
              { 'eligibility.minCGPA': { $exists: false } },
              { 'eligibility.minCGPA': 0 }
            ]
          },
          {
            $or: [
              { 'eligibility.allowedDepartments': { $size: 0 } },
              { 'eligibility.allowedDepartments': { $exists: false } },
              { 'eligibility.allowedDepartments': { $in: [userDepartment] } }
            ]
          },
          {
            $or: [
              { 'eligibility.maxBacklogs': { $gte: userBacklogs } },
              { 'eligibility.maxBacklogs': { $exists: false } }
            ]
          }
        ]
      });
      
      // Count applications by this student
      const appliedDrives = await JobDrive.countDocuments({
        'applications.student': req.user.id
      });
      
      res.json({
        totalDrives: eligibleDrives.length, // Eligible drives for student
        appliedDrives: appliedDrives, // Student's applications
        availableDrives: eligibleDrives.length - appliedDrives, // Available to apply
        allDrives: allDrives // Total drives in system
      });
    } else {
      // For PO/admin - show all drives data
      const upcomingDrives = await JobDrive.countDocuments({
        date: { $gte: new Date() },
        isActive: true
      });
      
      const drives = await JobDrive.find();
      const totalApplications = drives.reduce((sum, drive) => sum + drive.applications.length, 0);

      res.json({
        totalDrives: upcomingDrives, // Active upcoming drives
        upcomingDrives: upcomingDrives, // Same as above
        applicationsReceived: totalApplications, // Total applications
        allDrives: allDrives // Total drives in system
      });
    }
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Apply to drive
router.post('/:id/apply', auth, requireCompleteProfile, requirePlacementConsent, async (req, res) => {
  try {
    console.log('=== APPLY TO JOB DRIVE ===');
    console.log('Drive ID:', req.params.id);
    console.log('User:', req.user.email, 'Role:', req.user.role);
    
    // Allow both students and placement representatives to apply
    if (req.user.role !== 'student' && req.user.role !== 'placement_representative') {
      return res.status(403).json({ message: 'Access denied - Students and PRs only' });
    }

    const jobDrive = await JobDrive.findById(req.params.id);
    if (!jobDrive) {
      return res.status(404).json({ message: 'Job drive not found' });
    }

    if (!jobDrive.isActive) {
      return res.status(400).json({ message: 'Job drive is not active' });
    }

    // Check if application deadline has passed (use deadline if available, otherwise drive date)
    const checkDate = jobDrive.deadline || jobDrive.date;

    if (!checkDate) {
      return res.status(400).json({ message: 'No deadline or drive date set' });
    }

    const deadlineDate = new Date(checkDate);
    const currentDate = new Date();

    // Validate the deadline date
    if (isNaN(deadlineDate.getTime())) {
      console.error('Invalid deadline date:', checkDate);
      return res.status(400).json({ message: 'Invalid deadline date format' });
    }

    // If there's a specific time and we're checking deadline, apply the time
    if (jobDrive.time && jobDrive.deadline) {
      try {
        const [hours, minutes] = jobDrive.time.split(':');
        deadlineDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      } catch (timeError) {
        console.error('Error parsing time:', jobDrive.time, timeError);
      }
    } else {
      // If no specific time, allow applications until end of deadline day
      deadlineDate.setHours(23, 59, 59, 999);
    }

    console.log('=== DEADLINE CHECK ===');
    console.log('Raw checkDate:', checkDate);
    console.log('Parsed deadlineDate:', deadlineDate.toISOString());
    console.log('Current date:', currentDate.toISOString());
    console.log('Drive time:', jobDrive.time);
    console.log('Has deadline:', !!jobDrive.deadline);
    console.log('Deadline passed:', deadlineDate < currentDate);
    console.log('Time difference (hours):', (deadlineDate - currentDate) / (1000 * 60 * 60));

    if (deadlineDate < currentDate) {
      return res.status(400).json({ 
        message: 'Application deadline has passed',
        deadline: deadlineDate.toISOString(),
        current: currentDate.toISOString()
      });
    }

    // Check if already applied
    const alreadyApplied = jobDrive.applications.some(
      app => app.student.toString() === req.user.id
    );

    if (alreadyApplied) {
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

// Debug endpoint to check eligibility criteria
router.get('/debug/eligibility', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const allDrives = await JobDrive.find();
    
    const debugInfo = {
      user: {
        cgpa: user.profile?.cgpa,
        department: user.profile?.department,
        currentBacklogs: user.profile?.currentBacklogs
      },
      drives: allDrives.map(drive => ({
        id: drive._id,
        company: drive.companyName,
        role: drive.role,
        isActive: drive.isActive,
        date: drive.date,
        eligibility: drive.eligibility,
        meetsMinCGPA: !drive.eligibility?.minCGPA || drive.eligibility.minCGPA <= (user.profile?.cgpa || 0),
        meetsDepartment: !drive.eligibility?.allowedDepartments?.length || drive.eligibility.allowedDepartments.includes(user.profile?.department),
        meetsBacklogs: !drive.eligibility?.maxBacklogs || drive.eligibility.maxBacklogs >= (user.profile?.currentBacklogs || 0),
        isFuture: new Date(drive.date) >= new Date()
      }))
    };
    
    res.json(debugInfo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get PR jobs
router.get('/pr-jobs', auth, async (req, res) => {
  try {
    if (req.user.role !== 'pr' && req.user.role !== 'placement_representative') {
      return res.status(403).json({ message: 'Access denied - Only PRs can access this' });
    }

    const jobs = await JobDrive.find({ createdBy: req.user.id })
      .populate('createdBy', 'email profile')
      .sort({ createdAt: -1 });

    // Ensure all fields are properly set
    const processedJobs = jobs.map(job => ({
      ...job.toObject(),
      type: job.type || job.jobType || 'full-time',
      jobType: job.jobType || job.type || 'full-time',
      location: job.location || (job.locations && job.locations.length > 0 ? job.locations.join(', ') : 'Not specified')
    }));

    res.json({ jobs: processedJobs });
  } catch (error) {
    console.error('Error fetching PR jobs:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get PR stats
router.get('/pr-stats', auth, async (req, res) => {
  try {
    if (req.user.role !== 'pr' && req.user.role !== 'placement representative') {
      return res.status(403).json({ message: 'Access denied - Only PRs can access this' });
    }

    const totalJobs = await JobDrive.countDocuments({ createdBy: req.user.id });
    const activeJobs = await JobDrive.countDocuments({ 
      createdBy: req.user.id, 
      isActive: true,
      approvalStatus: 'approved'
    });
    const pendingJobs = await JobDrive.countDocuments({ 
      createdBy: req.user.id, 
      approvalStatus: 'pending'
    });

    // Get total applications for PR's jobs
    const prJobs = await JobDrive.find({ createdBy: req.user.id }).select('_id');
    const jobIds = prJobs.map(job => job._id);
    
    const totalApplications = await User.countDocuments({
      'applications.jobDrive': { $in: jobIds }
    });

    res.json({
      totalJobs,
      activeJobs,
      pendingApplications: pendingJobs,
      totalApplications
    });
  } catch (error) {
    console.error('Error fetching PR stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get PR applications
router.get('/pr-applications', auth, async (req, res) => {
  try {
    if (req.user.role !== 'pr' && req.user.role !== 'placement representative') {
      return res.status(403).json({ message: 'Access denied - Only PRs can access this' });
    }

    const prJobs = await JobDrive.find({ createdBy: req.user.id }).select('_id');
    const jobIds = prJobs.map(job => job._id);

    const applications = await User.aggregate([
      { $unwind: '$applications' },
      { $match: { 'applications.jobDrive': { $in: jobIds } } },
      {
        $lookup: {
          from: 'jobdrives',
          localField: 'applications.jobDrive',
          foreignField: '_id',
          as: 'jobDrive'
        }
      },
      { $unwind: '$jobDrive' },
      {
        $project: {
          _id: '$applications._id',
          student: {
            _id: '$_id',
            email: '$email',
            profile: '$profile'
          },
          jobDrive: '$jobDrive',
          status: '$applications.status',
          appliedAt: '$applications.appliedAt'
        }
      },
      { $sort: { appliedAt: -1 } }
    ]);

    res.json({ applications });
  } catch (error) {
    console.error('Error fetching PR applications:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get department applications count
router.get('/department-applications/:department', auth, async (req, res) => {
  try {
    const { department } = req.params;
    
    // Count all applications from users of this department
    const count = await User.countDocuments({
      'profile.department': department,
      'applications': { $exists: true, $not: { $size: 0 } }
    });
    
    res.json({ count });
  } catch (error) {
    console.error('Error fetching department applications:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single job drive by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const jobDrive = await JobDrive.findById(req.params.id)
      .populate('createdBy', 'email profile')
      .populate('applications.student', 'email profile');
    
    if (!jobDrive) {
      return res.status(404).json({ message: 'Job drive not found' });
    }

    res.json(jobDrive);
  } catch (error) {
    console.error('Error fetching job drive:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update job drive
router.put('/:id', auth, async (req, res) => {
  try {
    console.log('Updating job drive with data:', req.body); // Debug log
    
    const updateData = {
      companyName: req.body.companyName,
      role: req.body.role,
      type: req.body.type || req.body.jobType || 'full-time',
      jobType: req.body.type || req.body.jobType || 'full-time',
      ctc: req.body.ctc,
      location: req.body.location,
      locations: req.body.locations || [req.body.location],
      date: req.body.date,
      time: req.body.time,
      deadline: req.body.deadline,
      description: req.body.description,
      requirements: req.body.requirements || '', // Ensure string
      skills: req.body.skills || [],
      bond: req.body.bond || '',
      rounds: req.body.rounds || [],
      driveMode: req.body.driveMode || 'on-campus',
      venue: req.body.venue,
      testDetails: req.body.testDetails,
      interviewProcess: req.body.interviewProcess,
      eligibility: {
        minCGPA: req.body.eligibility?.cgpa || req.body.eligibility?.minCGPA || 0,
        maxBacklogs: parseInt(req.body.eligibility?.maxBacklogs) || 0,
        allowedDepartments: req.body.eligibility?.departments || req.body.eligibility?.allowedDepartments || [],
        allowedBatches: req.body.eligibility?.batches || req.body.eligibility?.allowedBatches || []
      }
    };
    
    console.log('Processed update data:', updateData); // Debug log
    
    const updatedJobDrive = await JobDrive.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('createdBy', 'email profile');
    
    console.log('Job drive updated successfully:', updatedJobDrive);
    res.json({
      message: 'Job drive updated successfully',
      jobDrive: updatedJobDrive
    });
  } catch (error) {
    console.error('Update job drive error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Debug route to check specific drive data
router.get('/debug/drive/:id', async (req, res) => {
  try {
    const drive = await JobDrive.findById(req.params.id);
    console.log('=== DRIVE DEBUG ===');
    console.log('Drive data:', JSON.stringify(drive, null, 2));
    res.json({
      drive,
      fields: {
        type: drive.type,
        jobType: drive.jobType,
        location: drive.location,
        locations: drive.locations
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get job drives by department
router.get('/department/:department', auth, async (req, res) => {
  try {
    const department = decodeURIComponent(req.params.department);
    console.log('Fetching drives for department:', department);
    
    const jobDrives = await JobDrive.find({
      isActive: true,
      'eligibility.allowedDepartments': { $in: [department] }
    })
    .populate('createdBy', 'email profile')
    .populate('applications.student', 'email profile')
    .sort({ createdAt: -1 });

    res.json({ 
      jobDrives: jobDrives,
      count: jobDrives.length 
    });
  } catch (error) {
    console.error('Error fetching department job drives:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get students who applied to a specific job drive
router.get('/:id/students', auth, async (req, res) => {
  try {
    const jobDrive = await JobDrive.findById(req.params.id)
      .populate({
        path: 'applications.student',
        select: 'email profile',
        model: 'User'
      });

    if (!jobDrive) {
      return res.status(404).json({ message: 'Job drive not found' });
    }

    // Process students with null-safe profile access
    const students = jobDrive.applications.map(application => {
      const student = application.student;
      if (!student) {
        console.log('Warning: Found application with null student');
        return null;
      }

      const profile = student.profile || {};
      
      return {
        _id: student._id,
        name: profile.name || 'N/A',
        email: student.email || 'N/A',
        rollNumber: profile.rollNumber || 'N/A',
        department: profile.department || 'N/A',
        cgpa: profile.cgpa || 'N/A',
        phoneNumber: profile.phoneNumber || 'N/A',
        degree: profile.degree || 'N/A',
        appliedAt: application.appliedAt || new Date(),
        status: application.status || 'applied'
      };
    }).filter(student => student !== null);

    console.log(`Found ${students.length} students for job drive ${jobDrive.companyName}`);
    students.forEach(student => {
      console.log(`Student: ${student.name} (${student.rollNumber})`);
    });

    res.json({ students });
  } catch (error) {
    console.error('Error fetching job drive students:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add placed students to a job drive
router.post('/:id/placed-students', auth, async (req, res) => {
  try {
    console.log('=== ADD PLACED STUDENTS ===');
    console.log('Drive ID:', req.params.id);
    console.log('User:', req.user.email, 'Role:', req.user.role);
    console.log('Request body:', req.body);
    
    // Allow placement representatives and PRs
    const allowedRoles = ['placement_representative', 'pr', 'po', 'placement_officer'];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied - Only Placement Representatives can add placed students' });
    }

    const jobDrive = await JobDrive.findById(req.params.id);
    if (!jobDrive) {
      return res.status(404).json({ message: 'Job drive not found' });
    }

    console.log('Job drive found:', jobDrive.companyName);

    const { placedStudents } = req.body;
    console.log('Placed students data:', placedStudents);
    
    if (!placedStudents || !Array.isArray(placedStudents) || placedStudents.length === 0) {
      return res.status(400).json({ message: 'No placed students provided' });
    }

    // Validate placed students data
    for (const student of placedStudents) {
      if (!student.name || !student.rollNumber || !student.email) {
        return res.status(400).json({ message: 'Name, roll number, and email are required for all students' });
      }
    }

    // Initialize placedStudents array if it doesn't exist
    if (!jobDrive.placedStudents) {
      jobDrive.placedStudents = [];
    }

    // Add new placed students with timestamp
    const newPlacedStudents = placedStudents.map(student => ({
      name: student.name,
      rollNumber: student.rollNumber,
      department: student.department || '',
      email: student.email,
      mobileNumber: student.mobileNumber || '',
      addedBy: req.user.id,
      addedAt: new Date()
    }));

    jobDrive.placedStudents.push(...newPlacedStudents);
    await jobDrive.save();
    
    console.log(`✅ Added ${placedStudents.length} placed students to drive ${jobDrive.companyName}`);
    
    res.json({ 
      message: `Successfully added ${placedStudents.length} placed students`,
      placedStudents: newPlacedStudents,
      totalPlacedStudents: jobDrive.placedStudents.length
    });

  } catch (error) {
    console.error('❌ Add placed students error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update a specific placed student
router.put('/:id/update-placed-student', auth, async (req, res) => {
  try {
    console.log('=== UPDATE PLACED STUDENT ===');
    console.log('Drive ID:', req.params.id);
    console.log('User:', req.user.email, 'Role:', req.user.role);
    
    const allowedRoles = ['placement_representative', 'pr', 'po', 'placement_officer'];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { index, studentData } = req.body;
    
    const jobDrive = await JobDrive.findById(req.params.id);
    if (!jobDrive) {
      return res.status(404).json({ message: 'Job drive not found' });
    }

    if (!jobDrive.placedStudents || index >= jobDrive.placedStudents.length || index < 0) {
      return res.status(400).json({ message: 'Invalid student index' });
    }

    // Update the student data
    jobDrive.placedStudents[index] = {
      ...jobDrive.placedStudents[index],
      ...studentData,
      updatedAt: new Date()
    };

    await jobDrive.save();
    
    res.json({ 
      message: 'Student updated successfully',
      placedStudents: jobDrive.placedStudents 
    });
  } catch (error) {
    console.error('Update placed student error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a specific placed student
router.delete('/:id/delete-placed-student', auth, async (req, res) => {
  try {
    console.log('=== DELETE PLACED STUDENT ===');
    console.log('Drive ID:', req.params.id);
    console.log('User:', req.user.email, 'Role:', req.user.role);
    
    const allowedRoles = ['placement_representative', 'pr', 'po', 'placement_officer'];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { index } = req.body;
    
    const jobDrive = await JobDrive.findById(req.params.id);
    if (!jobDrive) {
      return res.status(404).json({ message: 'Job drive not found' });
    }

    if (!jobDrive.placedStudents || index >= jobDrive.placedStudents.length || index < 0) {
      return res.status(400).json({ message: 'Invalid student index' });
    }

    // Remove the student at the specified index
    jobDrive.placedStudents.splice(index, 1);

    await jobDrive.save();
    
    res.json({ 
      message: 'Student deleted successfully',
      placedStudents: jobDrive.placedStudents 
    });
  } catch (error) {
    console.error('Delete placed student error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update round status
router.patch('/:id/rounds/:roundIndex/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const { id, roundIndex } = req.params;
    
    const jobDrive = await JobDrive.findById(id);
    if (!jobDrive) {
      return res.status(404).json({ message: 'Job drive not found' });
    }
    
    if (!jobDrive.selectionRounds || roundIndex >= jobDrive.selectionRounds.length) {
      return res.status(400).json({ message: 'Invalid round index' });
    }
    
    jobDrive.selectionRounds[roundIndex].status = status;
    await jobDrive.save();
    
    res.json({ 
      message: 'Round status updated successfully',
      selectionRounds: jobDrive.selectionRounds 
    });
  } catch (error) {
    console.error('Update round status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Select students for next round
router.post('/:id/rounds/:roundIndex/select-students', auth, async (req, res) => {
  try {
    const { studentIds } = req.body;
    const { id, roundIndex } = req.params;
    
    const jobDrive = await JobDrive.findById(id);
    if (!jobDrive) {
      return res.status(404).json({ message: 'Job drive not found' });
    }
    
    if (!jobDrive.selectionRounds || roundIndex >= jobDrive.selectionRounds.length) {
      return res.status(400).json({ message: 'Invalid round index' });
    }
    
    jobDrive.selectionRounds[roundIndex].selectedStudents = studentIds;
    await jobDrive.save();
    
    res.json({ 
      message: 'Students selected successfully',
      selectionRounds: jobDrive.selectionRounds 
    });
  } catch (error) {
    console.error('Select students error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add selection rounds to existing job drive
router.post('/:id/add-selection-rounds', auth, async (req, res) => {
  try {
    const { selectionRounds } = req.body;
    
    const jobDrive = await JobDrive.findById(req.params.id);
    if (!jobDrive) {
      return res.status(404).json({ message: 'Job drive not found' });
    }
    
    jobDrive.selectionRounds = selectionRounds;
    await jobDrive.save();
    
    res.json({ 
      message: 'Selection rounds added successfully',
      jobDrive 
    });
  } catch (error) {
    console.error('Add selection rounds error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Debug route to check application data structure
router.get('/:id/debug-applications', auth, async (req, res) => {
  try {
    const jobDrive = await JobDrive.findById(req.params.id);
    
    if (!jobDrive) {
      return res.status(404).json({ message: 'Job drive not found' });
    }

    console.log('=== DEBUG APPLICATIONS ===');
    console.log('Total applications:', jobDrive.applications.length);
    
    jobDrive.applications.forEach((app, index) => {
      console.log(`Application ${index + 1}:`, {
        studentId: app.student,
        appliedAt: app.appliedAt,
        status: app.status
      });
    });

    // Try to populate and see what happens
    const populatedDrive = await JobDrive.findById(req.params.id)
      .populate('applications.student', 'email profile');

    console.log('=== AFTER POPULATION ===');
    populatedDrive.applications.forEach((app, index) => {
      console.log(`Application ${index + 1}:`, {
        student: app.student,
        hasProfile: !!app.student?.profile,
        profileName: app.student?.profile?.name
      });
    });

    res.json({
      raw: jobDrive.applications,
      populated: populatedDrive.applications
    });
  } catch (error) {
    console.error('Debug applications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get students by IDs (for round management)
router.post('/:id/get-students-by-ids', auth, async (req, res) => {
  try {
    const { studentIds } = req.body;
    console.log('Getting students by IDs:', studentIds);
    
    const jobDrive = await JobDrive.findById(req.params.id)
      .populate('applications.student', 'email profile');
    
    if (!jobDrive) {
      return res.status(404).json({ message: 'Job drive not found' });
    }

    // Find students from the applications
    const students = [];
    for (const application of jobDrive.applications) {
      if (studentIds.includes(application.student._id.toString())) {
        const student = application.student;
        
        if (student && student.profile) {
          students.push({
            _id: student._id,
            name: student.profile.name || 'N/A',
            email: student.email || 'N/A',
            rollNumber: student.profile.rollNumber || 'N/A',
            department: student.profile.department || 'N/A',
            cgpa: student.profile.cgpa || 'N/A',
            phoneNumber: student.profile.phoneNumber || 'N/A',
            degree: student.profile.degree || 'N/A',
            appliedAt: application.appliedAt || new Date(),
            status: application.status || 'applied'
          });
        }
      }
    }

    console.log('Found students:', students.length);
    res.json({ students });
  } catch (error) {
    console.error('Error fetching students by IDs:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;


































































