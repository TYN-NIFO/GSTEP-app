require('dotenv').config();
const mongoose = require('mongoose');
const Company = require('./models/Company');
const DriveRequest = require('./models/DriveRequest');
const Student = require('./models/Student');
const Application = require('./models/Application');
const connectDB = require('./config/db');

const createMockCompanies = async () => {
  try {
    await connectDB();
    
    // Create additional companies
    const companies = [
      {
        companyName: 'InnovateTech Solutions',
        hrName: 'Rajesh Kumar',
        email: 'hr@innovatetech.com',
        password: 'password123',
        contactNumber: '+91-9876543225',
        description: 'Leading innovation in technology solutions and digital transformation.',
        location: 'Bangalore, India'
      },
      {
        companyName: 'WebTech Solutions',
        hrName: 'Sunita Sharma',
        email: 'hr@webtech.com',
        password: 'password123',
        contactNumber: '+91-9876543226',
        description: 'Specialized in web development and e-commerce solutions.',
        location: 'Pune, India'
      },
      {
        companyName: 'ElectroTech Corp',
        hrName: 'Amit Patel',
        email: 'hr@electrotech.com',
        password: 'password123',
        contactNumber: '+91-9876543227',
        description: 'Electronics and embedded systems development company.',
        location: 'Chennai, India'
      },
      {
        companyName: 'Engineering Solutions',
        hrName: 'Priya Singh',
        email: 'hr@engsolutions.com',
        password: 'password123',
        contactNumber: '+91-9876543228',
        description: 'Comprehensive engineering solutions for industrial applications.',
        location: 'Mumbai, India'
      },
      {
        companyName: 'Construction Giants',
        hrName: 'Vikram Reddy',
        email: 'hr@constructiongiants.com',
        password: 'password123',
        contactNumber: '+91-9876543229',
        description: 'Large-scale construction and infrastructure development.',
        location: 'Hyderabad, India'
      }
    ];

    // Check and create companies that don't exist
    for (const companyData of companies) {
      const existingCompany = await Company.findOne({ email: companyData.email });
      if (!existingCompany) {
        await Company.create(companyData);
        console.log(`Created company: ${companyData.companyName}`);
      } else {
        console.log(`Company already exists: ${companyData.companyName}`);
      }
    }

    // Create additional drive requests for these companies
    const allCompanies = await Company.find({});
    const allStudents = await Student.find({});

    for (const company of allCompanies) {
      if (company.email !== 'test@company.com') {
        // Create 1-2 drives per company
        const driveCount = Math.floor(Math.random() * 2) + 1;
        
        for (let i = 0; i < driveCount; i++) {
          const driveData = {
            company: company._id,
            driveTitle: `${company.companyName} - Campus Recruitment ${2024 + i}`,
            description: `Join ${company.companyName} and be part of our growing team. We offer excellent career opportunities and growth prospects.`,
            eligibilityCriteria: 'B.Tech/M.Tech, CGPA >= 7.0, Good communication skills',
            dateTime: new Date(Date.now() + (Math.floor(Math.random() * 30) + 7) * 24 * 60 * 60 * 1000),
            mode: Math.random() > 0.5 ? 'Online' : 'Offline',
            status: ['Pending', 'Accepted', 'Rejected'][Math.floor(Math.random() * 3)]
          };

          const existingDrive = await DriveRequest.findOne({ 
            company: company._id, 
            driveTitle: driveData.driveTitle 
          });

          if (!existingDrive) {
            const createdDrive = await DriveRequest.create(driveData);
            console.log(`Created drive: ${driveData.driveTitle}`);

            // Create applications for this drive if it's accepted
            if (driveData.status === 'Accepted') {
              const applicantCount = Math.floor(Math.random() * 8) + 3; // 3-10 applicants
              const selectedStudents = allStudents
                .sort(() => 0.5 - Math.random())
                .slice(0, applicantCount);

              for (const student of selectedStudents) {
                const applicationStatus = ['Applied', 'Shortlisted', 'Selected', 'Rejected'][
                  Math.floor(Math.random() * 4)
                ];

                const existingApplication = await Application.findOne({
                  student: student._id,
                  driveRequest: createdDrive._id
                });

                if (!existingApplication) {
                  await Application.create({
                    student: student._id,
                    driveRequest: createdDrive._id,
                    company: company._id,
                    status: applicationStatus,
                    appliedAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000)
                  });

                  // Update student placement if selected
                  if (applicationStatus === 'Selected' && !student.isPlaced) {
                    await Student.updateOne(
                      { _id: student._id },
                      { 
                        isPlaced: true, 
                        placedCompany: company.companyName 
                      }
                    );
                  }
                }
              }
              console.log(`Created ${applicantCount} applications for ${driveData.driveTitle}`);
            }
          }
        }
      }
    }

    console.log('Mock companies and data creation completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error creating mock companies:', error);
    process.exit(1);
  }
};

createMockCompanies();
