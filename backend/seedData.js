require('dotenv').config();
const mongoose = require('mongoose');
const Student = require('./models/Student');
const Application = require('./models/Application');
const Company = require('./models/Company');
const DriveRequest = require('./models/DriveRequest');
const connectDB = require('./config/db');

const seedStudents = async () => {
  try {
    await connectDB();

    // Clear existing data for fresh start
    console.log('Clearing existing data...');
    await Student.deleteMany({});
    await Application.deleteMany({});
    await DriveRequest.deleteMany({});
    await Company.deleteMany({});
    
    const students = [
      // Computer Science Students
      {
        name: 'Arjun Sharma',
        email: 'arjun.sharma@student.edu',
        rollNumber: 'CS2021001',
        department: 'Computer Science',
        year: 4,
        cgpa: 8.5,
        resumeLink: 'https://drive.google.com/file/d/1234567890/view',
        phone: '+91-9876543210',
        skills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
        isPlaced: true,
        placedCompany: 'Tech Solutions Inc.'
      },
      {
        name: 'Priya Patel',
        email: 'priya.patel@student.edu',
        rollNumber: 'CS2021002',
        department: 'Computer Science',
        year: 4,
        cgpa: 9.2,
        resumeLink: 'https://drive.google.com/file/d/1234567891/view',
        phone: '+91-9876543211',
        skills: ['Python', 'Django', 'PostgreSQL', 'AWS'],
        isPlaced: true,
        placedCompany: 'Tech Solutions Inc.'
      },
      {
        name: 'Rahul Kumar',
        email: 'rahul.kumar@student.edu',
        rollNumber: 'CS2021003',
        department: 'Computer Science',
        year: 4,
        cgpa: 8.9,
        resumeLink: 'https://drive.google.com/file/d/1234567893/view',
        phone: '+91-9876543213',
        skills: ['Java', 'Spring Boot', 'MySQL', 'Docker'],
        isPlaced: false
      },
      {
        name: 'Sneha Reddy',
        email: 'sneha.reddy@student.edu',
        rollNumber: 'CS2021004',
        department: 'Computer Science',
        year: 4,
        cgpa: 8.7,
        resumeLink: 'https://drive.google.com/file/d/1234567894/view',
        phone: '+91-9876543214',
        skills: ['React', 'Angular', 'TypeScript', 'Firebase'],
        isPlaced: true,
        placedCompany: 'InnovateTech'
      },
      {
        name: 'Vikram Singh',
        email: 'vikram.singh@student.edu',
        rollNumber: 'CS2021005',
        department: 'Computer Science',
        year: 4,
        cgpa: 8.3,
        resumeLink: 'https://drive.google.com/file/d/1234567895/view',
        phone: '+91-9876543215',
        skills: ['C++', 'Data Structures', 'Algorithms', 'System Design'],
        isPlaced: false
      },

      // Information Technology Students
      {
        name: 'Ananya Gupta',
        email: 'ananya.gupta@student.edu',
        rollNumber: 'IT2021001',
        department: 'Information Technology',
        year: 4,
        cgpa: 8.8,
        resumeLink: 'https://drive.google.com/file/d/1234567896/view',
        phone: '+91-9876543216',
        skills: ['PHP', 'Laravel', 'Vue.js', 'MySQL'],
        isPlaced: true,
        placedCompany: 'WebTech Solutions'
      },
      {
        name: 'Karthik Nair',
        email: 'karthik.nair@student.edu',
        rollNumber: 'IT2021002',
        department: 'Information Technology',
        year: 4,
        cgpa: 8.4,
        resumeLink: 'https://drive.google.com/file/d/1234567897/view',
        phone: '+91-9876543217',
        skills: ['Python', 'Flask', 'MongoDB', 'Redis'],
        isPlaced: false
      },
      {
        name: 'Meera Joshi',
        email: 'meera.joshi@student.edu',
        rollNumber: 'IT2021003',
        department: 'Information Technology',
        year: 4,
        cgpa: 9.0,
        resumeLink: 'https://drive.google.com/file/d/1234567898/view',
        phone: '+91-9876543218',
        skills: ['JavaScript', 'Node.js', 'Express', 'GraphQL'],
        isPlaced: true,
        placedCompany: 'Tech Solutions Inc.'
      },

      // Electronics Students
      {
        name: 'Rohit Verma',
        email: 'rohit.verma@student.edu',
        rollNumber: 'EC2021001',
        department: 'Electronics',
        year: 4,
        cgpa: 7.8,
        resumeLink: 'https://drive.google.com/file/d/1234567899/view',
        phone: '+91-9876543219',
        skills: ['C++', 'Embedded Systems', 'Arduino', 'MATLAB'],
        isPlaced: false
      },
      {
        name: 'Kavya Iyer',
        email: 'kavya.iyer@student.edu',
        rollNumber: 'EC2021002',
        department: 'Electronics',
        year: 4,
        cgpa: 8.2,
        resumeLink: 'https://drive.google.com/file/d/1234567900/view',
        phone: '+91-9876543220',
        skills: ['VLSI', 'Verilog', 'FPGA', 'Signal Processing'],
        isPlaced: true,
        placedCompany: 'ElectroTech Corp'
      },

      // Mechanical Students
      {
        name: 'Aditya Mishra',
        email: 'aditya.mishra@student.edu',
        rollNumber: 'ME2021001',
        department: 'Mechanical',
        year: 4,
        cgpa: 8.1,
        resumeLink: 'https://drive.google.com/file/d/1234567901/view',
        phone: '+91-9876543221',
        skills: ['AutoCAD', 'SolidWorks', 'ANSYS', 'Manufacturing'],
        isPlaced: true,
        placedCompany: 'Engineering Solutions'
      },
      {
        name: 'Pooja Agarwal',
        email: 'pooja.agarwal@student.edu',
        rollNumber: 'ME2021002',
        department: 'Mechanical',
        year: 4,
        cgpa: 7.9,
        resumeLink: 'https://drive.google.com/file/d/1234567902/view',
        phone: '+91-9876543222',
        skills: ['CAD', 'CAM', 'Thermodynamics', 'Fluid Mechanics'],
        isPlaced: false
      },

      // Civil Engineering Students
      {
        name: 'Suresh Pillai',
        email: 'suresh.pillai@student.edu',
        rollNumber: 'CE2021001',
        department: 'Civil Engineering',
        year: 4,
        cgpa: 8.0,
        resumeLink: 'https://drive.google.com/file/d/1234567903/view',
        phone: '+91-9876543223',
        skills: ['AutoCAD', 'Revit', 'Project Management', 'Structural Analysis'],
        isPlaced: true,
        placedCompany: 'Construction Giants'
      },
      {
        name: 'Divya Menon',
        email: 'divya.menon@student.edu',
        rollNumber: 'CE2021002',
        department: 'Civil Engineering',
        year: 4,
        cgpa: 8.3,
        resumeLink: 'https://drive.google.com/file/d/1234567904/view',
        phone: '+91-9876543224',
        skills: ['Structural Design', 'Concrete Technology', 'Surveying', 'GIS'],
        isPlaced: false
      }
    ];
    
    const createdStudents = await Student.insertMany(students);
    console.log(`${createdStudents.length} students created successfully`);

    // Find test company and create multiple drive requests with applications
    const testCompany = await Company.findOne({ email: 'test@company.com' });
    if (testCompany) {
      // Create multiple drive requests
      const driveRequests = [
        {
          company: testCompany._id,
          driveTitle: 'Software Developer - Campus Recruitment 2024',
          description: 'We are looking for talented software developers to join our team. This is a great opportunity for fresh graduates to start their career in technology.',
          eligibilityCriteria: 'B.Tech/M.Tech in CS/IT, CGPA >= 7.0, No active backlogs, Good programming skills',
          dateTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          mode: 'Online',
          status: 'Accepted'
        },
        {
          company: testCompany._id,
          driveTitle: 'Full Stack Developer - Internship Program',
          description: 'Exciting internship opportunity for students to work on real-world projects with modern technologies.',
          eligibilityCriteria: 'B.Tech in CS/IT, CGPA >= 7.5, Knowledge of web technologies',
          dateTime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          mode: 'Offline',
          status: 'Accepted'
        },
        {
          company: testCompany._id,
          driveTitle: 'Data Analyst - Entry Level',
          description: 'Join our data analytics team and work with big data to derive meaningful insights.',
          eligibilityCriteria: 'B.Tech/M.Tech in CS/IT/ECE, CGPA >= 8.0, Knowledge of Python/R',
          dateTime: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
          mode: 'Online',
          status: 'Pending'
        }
      ];

      const createdDrives = await DriveRequest.insertMany(driveRequests);
      console.log(`${createdDrives.length} drive requests created`);

      // Create comprehensive applications for realistic statistics
      const applications = [
        // Applications for Software Developer drive
        { student: createdStudents[0]._id, driveRequest: createdDrives[0]._id, company: testCompany._id, status: 'Selected' },
        { student: createdStudents[1]._id, driveRequest: createdDrives[0]._id, company: testCompany._id, status: 'Selected' },
        { student: createdStudents[2]._id, driveRequest: createdDrives[0]._id, company: testCompany._id, status: 'Applied' },
        { student: createdStudents[3]._id, driveRequest: createdDrives[0]._id, company: testCompany._id, status: 'Selected' },
        { student: createdStudents[4]._id, driveRequest: createdDrives[0]._id, company: testCompany._id, status: 'Rejected' },
        { student: createdStudents[7]._id, driveRequest: createdDrives[0]._id, company: testCompany._id, status: 'Selected' },

        // Applications for Full Stack Developer drive
        { student: createdStudents[2]._id, driveRequest: createdDrives[1]._id, company: testCompany._id, status: 'Shortlisted' },
        { student: createdStudents[4]._id, driveRequest: createdDrives[1]._id, company: testCompany._id, status: 'Applied' },
        { student: createdStudents[5]._id, driveRequest: createdDrives[1]._id, company: testCompany._id, status: 'Selected' },
        { student: createdStudents[6]._id, driveRequest: createdDrives[1]._id, company: testCompany._id, status: 'Applied' },
        { student: createdStudents[8]._id, driveRequest: createdDrives[1]._id, company: testCompany._id, status: 'Rejected' },

        // Applications for Data Analyst drive
        { student: createdStudents[1]._id, driveRequest: createdDrives[2]._id, company: testCompany._id, status: 'Applied' },
        { student: createdStudents[3]._id, driveRequest: createdDrives[2]._id, company: testCompany._id, status: 'Applied' },
        { student: createdStudents[7]._id, driveRequest: createdDrives[2]._id, company: testCompany._id, status: 'Applied' },
        { student: createdStudents[9]._id, driveRequest: createdDrives[2]._id, company: testCompany._id, status: 'Applied' },
        { student: createdStudents[11]._id, driveRequest: createdDrives[2]._id, company: testCompany._id, status: 'Applied' }
      ];

      await Application.insertMany(applications);
      console.log(`${applications.length} comprehensive applications created`);

      // Update student placement status based on selections
      await Student.updateOne(
        { _id: createdStudents[0]._id },
        { isPlaced: true, placedCompany: 'Tech Solutions Inc.' }
      );
      await Student.updateOne(
        { _id: createdStudents[1]._id },
        { isPlaced: true, placedCompany: 'Tech Solutions Inc.' }
      );
      await Student.updateOne(
        { _id: createdStudents[3]._id },
        { isPlaced: true, placedCompany: 'Tech Solutions Inc.' }
      );
      await Student.updateOne(
        { _id: createdStudents[5]._id },
        { isPlaced: true, placedCompany: 'Tech Solutions Inc.' }
      );
      await Student.updateOne(
        { _id: createdStudents[7]._id },
        { isPlaced: true, placedCompany: 'Tech Solutions Inc.' }
      );

      console.log('Student placement status updated');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedStudents();
