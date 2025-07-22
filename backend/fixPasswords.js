require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Company = require('./models/Company');
const connectDB = require('./config/db');

const fixPasswords = async () => {
  try {
    await connectDB();
    console.log('🔧 Fixing company passwords...');
    
    const companies = await Company.find({});
    console.log(`Found ${companies.length} companies`);
    
    for (const company of companies) {
      // Hash the password 'password123'
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);
      
      // Update the company with hashed password
      await Company.updateOne(
        { _id: company._id },
        { password: hashedPassword }
      );
      
      console.log(`✅ Fixed password for ${company.companyName}`);
    }
    
    console.log('🎉 All passwords fixed!');
    console.log('📝 All companies now use password: password123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error fixing passwords:', error);
    process.exit(1);
  }
};

fixPasswords();
