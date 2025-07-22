require('dotenv').config();
const mongoose = require('mongoose');
const Company = require('./models/Company');
const Student = require('./models/Student');
const DriveRequest = require('./models/DriveRequest');
const Application = require('./models/Application');
const connectDB = require('./config/db');

const checkData = async () => {
  try {
    await connectDB();
    
    console.log('📊 CURRENT DATABASE STATUS:');
    console.log('=' .repeat(50));
    
    // Check companies
    const companies = await Company.find({});
    console.log(`🏢 Companies (${companies.length}):`);
    companies.forEach(company => {
      console.log(`  - ${company.companyName} (${company.email})`);
    });
    
    // Check students by department
    const departments = ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical'];
    console.log(`\n👨‍🎓 Students by Department:`);
    for (const dept of departments) {
      const count = await Student.countDocuments({ department: dept });
      const placed = await Student.countDocuments({ department: dept, isPlaced: true });
      console.log(`  - ${dept}: ${count} total, ${placed} placed (${count > 0 ? ((placed/count)*100).toFixed(1) : 0}%)`);
    }
    
    // Check drives
    const drives = await DriveRequest.find({});
    console.log(`\n📋 Drive Requests (${drives.length}):`);
    const driveStats = {};
    drives.forEach(drive => {
      driveStats[drive.status] = (driveStats[drive.status] || 0) + 1;
    });
    console.log(`  Status distribution:`, driveStats);
    
    // Check applications
    const applications = await Application.find({});
    console.log(`\n📝 Applications (${applications.length}):`);
    const appStats = {};
    applications.forEach(app => {
      appStats[app.status] = (appStats[app.status] || 0) + 1;
    });
    console.log(`  Status distribution:`, appStats);
    
    // Test login with first company
    if (companies.length > 0) {
      const testCompany = companies[0];
      console.log(`\n🔐 Test Login Credentials:`);
      console.log(`  Email: ${testCompany.email}`);
      console.log(`  Password: password123`);
      console.log(`  Company: ${testCompany.companyName}`);
      console.log(`  HR Name: ${testCompany.hrName}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkData();
