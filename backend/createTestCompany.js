require('dotenv').config();
const mongoose = require('mongoose');
const Company = require('./models/Company');
const connectDB = require('./config/db');

const createTestCompany = async () => {
  try {
    await connectDB();
    
    // Check if test company already exists
    const existingCompany = await Company.findOne({ email: 'test@company.com' });
    if (existingCompany) {
      console.log('Test company already exists');
      process.exit(0);
    }
    
    // Create test company
    const testCompany = await Company.create({
      companyName: 'Tech Solutions Inc.',
      hrName: 'John Smith',
      email: 'test@company.com',
      password: 'password123',
      contactNumber: '+91-9876543210',
      description: 'A leading technology company specializing in software development and IT solutions.',
      location: 'Bangalore, India'
    });
    
    console.log('Test company created successfully:');
    console.log('Email: test@company.com');
    console.log('Password: password123');
    console.log('Company ID:', testCompany._id);
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating test company:', error);
    process.exit(1);
  }
};

createTestCompany();
