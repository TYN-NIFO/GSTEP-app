require('dotenv').config();
const mongoose = require('mongoose');
const Company = require('./models/Company');
const DriveRequest = require('./models/DriveRequest');
const Student = require('./models/Student');
const Application = require('./models/Application');
const connectDB = require('./config/db');

const createComprehensiveMockData = async () => {
  try {
    await connectDB();
    console.log('🚀 Creating comprehensive mock data for GStep...\n');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await Student.deleteMany({});
    await Application.deleteMany({});
    await DriveRequest.deleteMany({});
    await Company.deleteMany({});
    console.log('✅ Data cleared\n');

    // 1. Create Companies
    console.log('🏢 Creating companies...');
    const companies = [
      {
        companyName: 'Tech Solutions Inc.',
        hrName: 'Rajesh Kumar',
        email: 'test@company.com',
        password: 'password123',
        contactNumber: '+91-9876543210',
        description: 'Leading technology company specializing in software development and digital transformation.',
        location: 'Bangalore, India'
      },
      {
        companyName: 'InnovateTech Solutions',
        hrName: 'Priya Sharma',
        email: 'hr@innovatetech.com',
        password: 'password123',
        contactNumber: '+91-9876543211',
        description: 'Innovation-driven technology solutions for modern businesses.',
        location: 'Hyderabad, India'
      },
      {
        companyName: 'WebCraft Technologies',
        hrName: 'Amit Patel',
        email: 'hr@webcraft.com',
        password: 'password123',
        contactNumber: '+91-9876543212',
        description: 'Specialized in web development, e-commerce, and digital marketing solutions.',
        location: 'Pune, India'
      },
      {
        companyName: 'DataVision Analytics',
        hrName: 'Sunita Reddy',
        email: 'hr@datavision.com',
        password: 'password123',
        contactNumber: '+91-9876543213',
        description: 'Big data analytics and machine learning solutions provider.',
        location: 'Chennai, India'
      },
      {
        companyName: 'CloudTech Systems',
        hrName: 'Vikram Singh',
        email: 'hr@cloudtech.com',
        password: 'password123',
        contactNumber: '+91-9876543214',
        description: 'Cloud infrastructure and DevOps solutions for enterprises.',
        location: 'Mumbai, India'
      },
      {
        companyName: 'MobileTech Innovations',
        hrName: 'Kavya Nair',
        email: 'hr@mobiletech.com',
        password: 'password123',
        contactNumber: '+91-9876543215',
        description: 'Mobile app development and cross-platform solutions.',
        location: 'Kochi, India'
      }
    ];

    const createdCompanies = await Company.insertMany(companies);
    console.log(`✅ Created ${createdCompanies.length} companies\n`);

    // 2. Create Students (50 students across different departments)
    console.log('👨‍🎓 Creating students...');
    const students = [];
    
    // Computer Science Students (20)
    const csStudents = [
      'Arjun Sharma', 'Priya Patel', 'Rahul Kumar', 'Sneha Reddy', 'Vikram Singh',
      'Ananya Gupta', 'Karthik Nair', 'Meera Joshi', 'Rohit Verma', 'Kavya Iyer',
      'Aditya Mishra', 'Pooja Agarwal', 'Suresh Pillai', 'Divya Menon', 'Ravi Krishnan',
      'Sanjana Das', 'Nikhil Jain', 'Shreya Kulkarni', 'Akash Yadav', 'Nisha Bansal'
    ];

    csStudents.forEach((name, index) => {
      students.push({
        name,
        email: `${name.toLowerCase().replace(' ', '.')}@student.edu`,
        rollNumber: `CS2021${String(index + 1).padStart(3, '0')}`,
        department: 'Computer Science',
        year: 4,
        cgpa: (7.0 + Math.random() * 2.5).toFixed(2),
        resumeLink: `https://drive.google.com/file/d/cs${index + 1}/view`,
        phone: `+91-98765432${String(index + 10).padStart(2, '0')}`,
        skills: ['JavaScript', 'Python', 'React', 'Node.js', 'MongoDB', 'AWS'].slice(0, 3 + Math.floor(Math.random() * 3)),
        isPlaced: Math.random() > 0.4, // 60% placement rate
        placedCompany: Math.random() > 0.4 ? companies[Math.floor(Math.random() * companies.length)].companyName : null
      });
    });

    // Information Technology Students (15)
    const itStudents = [
      'Deepak Gupta', 'Ritika Sharma', 'Manish Kumar', 'Swati Patel', 'Gaurav Singh',
      'Neha Agarwal', 'Siddharth Nair', 'Priyanka Joshi', 'Abhishek Verma', 'Shweta Iyer',
      'Varun Mishra', 'Anjali Das', 'Harsh Jain', 'Pallavi Kulkarni', 'Rohan Yadav'
    ];

    itStudents.forEach((name, index) => {
      students.push({
        name,
        email: `${name.toLowerCase().replace(' ', '.')}@student.edu`,
        rollNumber: `IT2021${String(index + 1).padStart(3, '0')}`,
        department: 'Information Technology',
        year: 4,
        cgpa: (7.2 + Math.random() * 2.3).toFixed(2),
        resumeLink: `https://drive.google.com/file/d/it${index + 1}/view`,
        phone: `+91-98765433${String(index + 10).padStart(2, '0')}`,
        skills: ['Java', 'Spring Boot', 'Angular', 'MySQL', 'Docker', 'Kubernetes'].slice(0, 3 + Math.floor(Math.random() * 3)),
        isPlaced: Math.random() > 0.45, // 55% placement rate
        placedCompany: Math.random() > 0.45 ? companies[Math.floor(Math.random() * companies.length)].companyName : null
      });
    });

    // Electronics Students (10)
    const ecStudents = [
      'Rajesh Kumar', 'Lakshmi Reddy', 'Sunil Patel', 'Madhuri Singh', 'Prakash Gupta',
      'Sowmya Nair', 'Venkat Joshi', 'Ramya Iyer', 'Kiran Verma', 'Sushma Das'
    ];

    ecStudents.forEach((name, index) => {
      students.push({
        name,
        email: `${name.toLowerCase().replace(' ', '.')}@student.edu`,
        rollNumber: `EC2021${String(index + 1).padStart(3, '0')}`,
        department: 'Electronics',
        year: 4,
        cgpa: (7.0 + Math.random() * 2.0).toFixed(2),
        resumeLink: `https://drive.google.com/file/d/ec${index + 1}/view`,
        phone: `+91-98765434${String(index + 10).padStart(2, '0')}`,
        skills: ['C++', 'Embedded Systems', 'VLSI', 'MATLAB', 'Arduino', 'IoT'].slice(0, 3 + Math.floor(Math.random() * 3)),
        isPlaced: Math.random() > 0.6, // 40% placement rate
        placedCompany: Math.random() > 0.6 ? companies[Math.floor(Math.random() * companies.length)].companyName : null
      });
    });

    // Mechanical Students (5)
    const meStudents = ['Arun Kumar', 'Deepika Sharma', 'Manoj Patel', 'Rekha Singh', 'Santosh Gupta'];

    meStudents.forEach((name, index) => {
      students.push({
        name,
        email: `${name.toLowerCase().replace(' ', '.')}@student.edu`,
        rollNumber: `ME2021${String(index + 1).padStart(3, '0')}`,
        department: 'Mechanical',
        year: 4,
        cgpa: (7.5 + Math.random() * 1.5).toFixed(2),
        resumeLink: `https://drive.google.com/file/d/me${index + 1}/view`,
        phone: `+91-98765435${String(index + 10).padStart(2, '0')}`,
        skills: ['AutoCAD', 'SolidWorks', 'ANSYS', 'Manufacturing', 'Design', 'CAM'].slice(0, 3 + Math.floor(Math.random() * 3)),
        isPlaced: Math.random() > 0.5, // 50% placement rate
        placedCompany: Math.random() > 0.5 ? companies[Math.floor(Math.random() * companies.length)].companyName : null
      });
    });

    const createdStudents = await Student.insertMany(students);
    console.log(`✅ Created ${createdStudents.length} students\n`);

    // 3. Create Drive Requests (Multiple drives per company)
    console.log('📋 Creating drive requests...');
    const driveRequests = [];
    
    const jobTitles = [
      'Software Developer', 'Full Stack Developer', 'Frontend Developer', 'Backend Developer',
      'Data Analyst', 'DevOps Engineer', 'Mobile App Developer', 'UI/UX Designer',
      'Quality Assurance Engineer', 'System Administrator', 'Database Administrator',
      'Machine Learning Engineer', 'Cloud Engineer', 'Cybersecurity Analyst'
    ];

    for (let i = 0; i < createdCompanies.length; i++) {
      const company = createdCompanies[i];
      const numDrives = 2 + Math.floor(Math.random() * 3); // 2-4 drives per company
      
      for (let j = 0; j < numDrives; j++) {
        const jobTitle = jobTitles[Math.floor(Math.random() * jobTitles.length)];
        const daysFromNow = 7 + Math.floor(Math.random() * 60); // 7-67 days from now
        
        driveRequests.push({
          company: company._id,
          driveTitle: `${jobTitle} - ${company.companyName}`,
          description: `Join ${company.companyName} as a ${jobTitle}. We offer excellent career growth opportunities, competitive salary, and a collaborative work environment. This role involves working with cutting-edge technologies and contributing to innovative projects.`,
          eligibilityCriteria: `B.Tech/M.Tech in relevant field, CGPA >= ${(7.0 + Math.random() * 1.5).toFixed(1)}, Strong technical skills, Good communication abilities`,
          dateTime: new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000),
          mode: Math.random() > 0.5 ? 'Online' : 'Offline',
          status: ['Pending', 'Accepted', 'Rejected'][Math.floor(Math.random() * 3)]
        });
      }
    }

    const createdDrives = await DriveRequest.insertMany(driveRequests);
    console.log(`✅ Created ${createdDrives.length} drive requests\n`);

    console.log('📊 Drive status distribution:');
    const statusCounts = {};
    createdDrives.forEach(drive => {
      statusCounts[drive.status] = (statusCounts[drive.status] || 0) + 1;
    });
    console.log(statusCounts);
    console.log('');

    // 4. Create Applications (Realistic application patterns)
    console.log('📝 Creating applications...');
    const applications = [];
    
    // Only create applications for accepted drives
    const acceptedDrives = createdDrives.filter(drive => drive.status === 'Accepted');
    console.log(`Creating applications for ${acceptedDrives.length} accepted drives...\n`);

    for (const drive of acceptedDrives) {
      const numApplications = 5 + Math.floor(Math.random() * 15); // 5-19 applications per drive
      const applicants = createdStudents
        .sort(() => 0.5 - Math.random())
        .slice(0, numApplications);

      for (const student of applicants) {
        const statuses = ['Applied', 'Shortlisted', 'Selected', 'Rejected'];
        const weights = [0.4, 0.25, 0.15, 0.2]; // 40% applied, 25% shortlisted, 15% selected, 20% rejected
        
        let randomValue = Math.random();
        let selectedStatus = 'Applied';
        let cumulativeWeight = 0;
        
        for (let i = 0; i < statuses.length; i++) {
          cumulativeWeight += weights[i];
          if (randomValue <= cumulativeWeight) {
            selectedStatus = statuses[i];
            break;
          }
        }

        applications.push({
          student: student._id,
          driveRequest: drive._id,
          company: drive.company,
          status: selectedStatus,
          appliedAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000), // Applied within last 30 days
          notes: selectedStatus === 'Selected' ? 'Excellent technical skills and communication' : 
                 selectedStatus === 'Rejected' ? 'Did not meet technical requirements' : ''
        });
      }
    }

    const createdApplications = await Application.insertMany(applications);
    console.log(`✅ Created ${createdApplications.length} applications\n`);

    // 5. Update student placement status based on selections
    console.log('🎯 Updating student placement status...');
    const selectedApplications = createdApplications.filter(app => app.status === 'Selected');
    
    for (const app of selectedApplications) {
      const company = createdCompanies.find(c => c._id.equals(app.company));
      await Student.updateOne(
        { _id: app.student },
        { 
          isPlaced: true, 
          placedCompany: company.companyName 
        }
      );
    }
    console.log(`✅ Updated placement status for ${selectedApplications.length} students\n`);

    // 6. Generate Statistics Summary
    console.log('📈 FINAL STATISTICS SUMMARY:');
    console.log('=' .repeat(50));
    
    const totalStudents = createdStudents.length;
    const totalCompanies = createdCompanies.length;
    const totalDrives = createdDrives.length;
    const totalApplications = createdApplications.length;
    const placedStudents = await Student.countDocuments({ isPlaced: true });
    const selectedApplications_count = createdApplications.filter(app => app.status === 'Selected').length;

    console.log(`🏢 Companies: ${totalCompanies}`);
    console.log(`👨‍🎓 Students: ${totalStudents}`);
    console.log(`📋 Drive Requests: ${totalDrives}`);
    console.log(`📝 Applications: ${totalApplications}`);
    console.log(`🎯 Selected Students: ${selectedApplications_count}`);
    console.log(`🏆 Placed Students: ${placedStudents}`);
    console.log(`📊 Overall Placement Rate: ${((placedStudents / totalStudents) * 100).toFixed(1)}%`);
    
    console.log('\n📊 Department-wise Statistics:');
    const departments = ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical'];
    for (const dept of departments) {
      const deptStudents = await Student.countDocuments({ department: dept });
      const deptPlaced = await Student.countDocuments({ department: dept, isPlaced: true });
      const placementRate = deptStudents > 0 ? ((deptPlaced / deptStudents) * 100).toFixed(1) : 0;
      console.log(`  ${dept}: ${deptPlaced}/${deptStudents} (${placementRate}%)`);
    }

    console.log('\n🎉 Comprehensive mock data creation completed successfully!');
    console.log('🚀 Your GStep application now has rich, realistic data for testing!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating mock data:', error);
    process.exit(1);
  }
};

createComprehensiveMockData();
