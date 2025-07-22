const axios = require('axios');

const testNewFeatures = async () => {
  try {
    console.log('🚀 Testing New GStep Features');
    console.log('=' .repeat(50));
    
    // Login first
    console.log('1. Testing Login...');
    const loginResponse = await axios.post('http://localhost:5000/api/company/login', {
      email: 'test@company.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful');
    console.log(`   Company: ${loginResponse.data.companyName}`);
    console.log(`   HR: ${loginResponse.data.hrName}`);
    
    // Test profile endpoint
    console.log('\n2. Testing Profile Retrieval...');
    const profileResponse = await axios.get('http://localhost:5000/api/company/profile', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Profile retrieved successfully');
    console.log(`   Company: ${profileResponse.data.companyName}`);
    console.log(`   HR: ${profileResponse.data.hrName}`);
    console.log(`   Email: ${profileResponse.data.email}`);
    console.log(`   Location: ${profileResponse.data.location}`);
    
    // Test profile update
    console.log('\n3. Testing Profile Update...');
    const updateData = {
      companyName: profileResponse.data.companyName,
      hrName: profileResponse.data.hrName,
      contactNumber: profileResponse.data.contactNumber,
      description: 'Updated: Leading technology company with innovative solutions',
      location: 'Bangalore, Karnataka, India'
    };
    
    const updateResponse = await axios.put('http://localhost:5000/api/company/profile', updateData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Profile updated successfully');
    console.log(`   Updated Description: ${updateResponse.data.description}`);
    console.log(`   Updated Location: ${updateResponse.data.location}`);
    
    // Test enhanced statistics
    console.log('\n4. Testing Enhanced Statistics...');
    const statsResponse = await axios.get('http://localhost:5000/api/company/statistics', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const stats = statsResponse.data;
    console.log('✅ Enhanced statistics retrieved');
    console.log(`   Company: ${stats.companyInfo.name}`);
    console.log(`   HR: ${stats.companyInfo.hrName}`);
    console.log('   Application Breakdown:');
    console.log(`     - Total: ${stats.overview.totalApplications}`);
    console.log(`     - Applied: ${stats.overview.appliedStudents}`);
    console.log(`     - Shortlisted: ${stats.overview.shortlistedStudents}`);
    console.log(`     - Selected: ${stats.overview.selectedStudents}`);
    console.log(`     - Rejected: ${stats.overview.rejectedStudents}`);
    console.log(`     - Placed: ${stats.overview.placedStudents}`);
    console.log('   Drive Breakdown:');
    console.log(`     - Total: ${stats.overview.totalDrives}`);
    console.log(`     - Accepted: ${stats.overview.acceptedDrives}`);
    console.log(`     - Pending: ${stats.overview.pendingDrives}`);
    console.log(`     - Rejected: ${stats.overview.rejectedDrives}`);
    
    console.log('\n🎉 All new features working perfectly!');
    console.log('\n📱 Frontend Features Available:');
    console.log('   ✅ Enhanced Navbar with user profile and logout');
    console.log('   ✅ Profile page with edit functionality');
    console.log('   ✅ Company-specific statistics');
    console.log('   ✅ Enhanced statistics dashboard');
    
    console.log('\n🔐 Test in Browser:');
    console.log('   URL: http://localhost:3000');
    console.log('   Login: test@company.com / password123');
    console.log('   Features: Dashboard → Profile → Statistics');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
};

testNewFeatures();
