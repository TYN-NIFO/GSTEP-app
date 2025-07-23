const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const authorize = require('../middleware/authorize');

const router = express.Router();

// Configure multer for file upload
const upload = multer({ dest: 'uploads/' });

// Upload CGPA CSV
router.post('/upload-cgpa', auth, upload.single('csvFile'), async (req, res) => {
  try {
    console.log('=== UPLOAD CGPA ROUTE HIT ===');
    console.log('User:', req.user.email, 'Role:', req.user.role);
    console.log('File received:', req.file ? 'Yes' : 'No');
    
    // Allow moorthy@gmail.com regardless of role, or specific roles
    const isAuthorized = req.user.email === 'moorthy@gmail.com' || 
                        req.user.role === 'po' || 
                        req.user.role === 'placementofficer' || 
                        req.user.role === 'staff';
    
    if (!isAuthorized) {
      return res.status(403).json({ 
        message: 'Access denied - Only placement officers can upload CGPA data',
        userRole: req.user.role,
        userEmail: req.user.email
      });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    console.log('File path:', req.file.path);
    console.log('File size:', req.file.size);

    const results = [];
    let updatedCount = 0;
    let errorCount = 0;

    // Parse CSV file
    fs.createReadStream(req.file.path)
      .pipe(csv({
        skipEmptyLines: true,
        trim: true,
        mapHeaders: ({ header }) => header.trim().replace(/[\r\n]/g, '')
      }))
      .on('data', (data) => {
        // Clean all values
        const cleanData = {};
        Object.keys(data).forEach(key => {
          const cleanKey = key.trim().replace(/[\r\n]/g, '');
          const cleanValue = data[key] ? data[key].toString().trim().replace(/[\r\n]/g, '') : '';
          cleanData[cleanKey] = cleanValue;
        });
        
        console.log('Cleaned CSV Row:', cleanData);
        results.push(cleanData);
      })
      .on('end', async () => {
        try {
          console.log('=== CSV PARSING COMPLETE ===');
          console.log('Total rows:', results.length);
          
          if (results.length === 0) {
            console.log('No data found in CSV');
            fs.unlinkSync(req.file.path);
            return res.json({
              message: 'No data found in CSV file',
              updatedCount: 0,
              errorCount: 0,
              totalRows: 0
            });
          }

          // Show CSV structure
          console.log('CSV Headers:', Object.keys(results[0]));
          console.log('First 3 rows:', results.slice(0, 3));
          
          for (const row of results) {
            console.log('\n--- Processing Row ---');
            console.log('Raw row data:', JSON.stringify(row, null, 2));
            
            // Try multiple column variations for roll number
            const rollNo = row['ROLL NO'] || row['rollNo'] || row['Roll No'] || 
                          row['roll_no'] || row['ROLL_NO'] || row['RollNo'] || 
                          row['RollNumber'] || row['rollNumber'] || row['registerNo'];
            
            // Try multiple column variations for CGPA
            const cgpa = row['CGPA'] || row['cgpa'] || row['Cgpa'] || 
                        row['GPA'] || row['gpa'] || row['Gpa'];
            
            console.log('Extracted rollNo:', `"${rollNo}"`);
            console.log('Extracted cgpa:', `"${cgpa}"`);
            
            if (!rollNo || !cgpa) {
              console.log('❌ Missing required data - rollNo or cgpa is empty');
              console.log('Available columns:', Object.keys(row));
              errorCount++;
              continue;
            }

            const cleanRollNo = rollNo.toString().trim();
            const cleanCgpa = parseFloat(cgpa);
            
            if (isNaN(cleanCgpa)) {
              console.log('❌ Invalid CGPA value:', cgpa);
              errorCount++;
              continue;
            }
            
            console.log('Searching for student with rollNo:', cleanRollNo);

            // Search for student with more detailed logging
            const student = await User.findOne({
              $or: [
                { 'profile.rollNumber': cleanRollNo },
                { 'profile.registerNo': cleanRollNo }
              ],
              role: 'student'
            });

            if (student) {
              console.log('✅ Student found:', student.profile.name);
              console.log('  Email:', student.email);
              console.log('  Roll Number in DB:', student.profile.rollNumber);
              console.log('  Register No in DB:', student.profile.registerNo);
              console.log('  Current CGPA:', student.profile.cgpa);
              console.log('  New CGPA:', cleanCgpa);
              
              // Update CGPA
              const oldCgpa = student.profile.cgpa;
              student.profile.cgpa = cleanCgpa;
              await student.save();
              
              console.log('✅ CGPA updated from', oldCgpa, 'to', cleanCgpa);
              updatedCount++;
            } else {
              console.log('❌ No student found for rollNo:', cleanRollNo);
              
              // Try to find similar roll numbers
              const similarStudents = await User.find({
                role: 'student',
                $or: [
                  { 'profile.rollNumber': { $regex: cleanRollNo.slice(-4), $options: 'i' } },
                  { 'profile.registerNo': { $regex: cleanRollNo.slice(-4), $options: 'i' } }
                ]
              }).select('profile.rollNumber profile.registerNo profile.name email').limit(3);
              
              console.log('Similar students found:', similarStudents.map(s => ({
                name: s.profile?.name,
                rollNumber: s.profile?.rollNumber,
                registerNo: s.profile?.registerNo,
                email: s.email
              })));
              
              errorCount++;
            }
          }

          // Clean up
          fs.unlinkSync(req.file.path);

          console.log('=== FINAL RESULTS ===');
          console.log('Updated:', updatedCount);
          console.log('Errors:', errorCount);
          console.log('Total:', results.length);

          res.json({
            message: `CSV processed: ${updatedCount} updated, ${errorCount} errors`,
            updatedCount,
            errorCount,
            totalRows: results.length,
            details: {
              csvHeaders: Object.keys(results[0] || {}),
              sampleData: results.slice(0, 2)
            }
          });

        } catch (error) {
          console.error('Error processing CSV:', error);
          fs.unlinkSync(req.file.path);
          res.status(500).json({ message: 'Error processing CSV file', error: error.message });
        }
      })
      .on('error', (error) => {
        console.error('Error reading CSV:', error);
        fs.unlinkSync(req.file.path);
        res.status(500).json({ message: 'Error reading CSV file' });
      });

  } catch (error) {
    console.error('Upload error:', error);
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Debug route to check students data
router.get('/debug-students', auth, async (req, res) => {
  try {
    if (req.user.email !== 'moorthy@gmail.com') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const students = await User.find({ role: 'student' })
      .select('email profile')
      .limit(10);
    
    res.json({
      totalStudents: await User.countDocuments({ role: 'student' }),
      sampleStudents: students.map(s => ({
        email: s.email,
        name: s.profile?.name,
        rollNumber: s.profile?.rollNumber,
        registerNo: s.profile?.registerNo,
        cgpa: s.profile?.cgpa,
        department: s.profile?.department
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Debug route to check CSV format
router.post('/debug-csv', auth, upload.single('csvFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const results = [];
    
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        fs.unlinkSync(req.file.path); // Clean up
        
        res.json({
          message: 'CSV parsed successfully',
          totalRows: results.length,
          headers: Object.keys(results[0] || {}),
          sampleRows: results.slice(0, 5),
          allData: results
        });
      })
      .on('error', (error) => {
        fs.unlinkSync(req.file.path);
        res.status(500).json({ message: 'Error reading CSV', error: error.message });
      });
  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Debug route to check specific student CGPA
router.get('/debug-student/:rollNumber', auth, async (req, res) => {
  try {
    const { rollNumber } = req.params;
    const student = await User.findOne({
      $or: [
        { 'profile.rollNumber': rollNumber },
        { 'profile.registerNo': rollNumber }
      ],
      role: 'student'
    });
    
    if (student) {
      res.json({
        found: true,
        student: {
          name: student.profile.name,
          rollNumber: student.profile.rollNumber,
          cgpa: student.profile.cgpa,
          email: student.email
        }
      });
    } else {
      res.json({ found: false, rollNumber });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Debug route to check user data
router.get('/debug-user-data', auth, async (req, res) => {
  try {
    const users = await User.find({}, {
      email: 1,
      role: 1,
      'profile.name': 1,
      'profile.rollNumber': 1
    });
    
    console.log('All users in database:', users);
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Fix user profile route
router.post('/fix-user-profile', auth, async (req, res) => {
  try {
    if (req.user.email !== 'moorthy@gmail.com') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const user = await User.findById(req.user.id);
    user.profile.name = 'Moorthy';
    user.role = 'po';
    await user.save();

    res.json({ 
      message: 'Profile fixed',
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profile: user.profile
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Debug route to check specific student by email
router.get('/debug-my-profile/:email', auth, async (req, res) => {
  try {
    if (req.user.email !== 'moorthy@gmail.com') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const { email } = req.params;
    const student = await User.findOne({ email: email });
    
    if (student) {
      res.json({
        found: true,
        student: {
          email: student.email,
          name: student.profile?.name,
          rollNumber: student.profile?.rollNumber,
          registerNo: student.profile?.registerNo,
          cgpa: student.profile?.cgpa,
          department: student.profile?.department,
          batch: student.profile?.batch,
          role: student.role
        }
      });
    } else {
      res.json({ found: false, email });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Manual CGPA update for testing
router.post('/update-cgpa-manual', auth, async (req, res) => {
  try {
    if (req.user.email !== 'moorthy@gmail.com') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const { email, cgpa } = req.body;
    
    const student = await User.findOne({ email: email });
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const oldCgpa = student.profile.cgpa;
    student.profile.cgpa = parseFloat(cgpa);
    await student.save();

    res.json({
      message: 'CGPA updated successfully',
      student: {
        email: student.email,
        name: student.profile.name,
        rollNumber: student.profile.rollNumber,
        oldCgpa: oldCgpa,
        newCgpa: student.profile.cgpa
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;































