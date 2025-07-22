require('dotenv').config();
const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

// Test data
const testCompany = {
  companyName: 'Test Tech Corp',
  hrName: 'Jane Doe',
  email: 'jane@testtech.com',
  password: 'testpass123',
  contactNumber: '+91-9876543210',
  description: 'A test technology company',
  location: 'Mumbai, India'
};

const testDrive = {
  driveTitle: 'Full Stack Developer - Test Drive',
  description: 'Looking for talented full stack developers for our growing team.',
  eligibilityCriteria: 'B.Tech/M.Tech in CS/IT, CGPA >= 7.5, Strong programming skills',
  dateTime: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days from now
  mode: 'Online'
};

let authToken = '';
let companyId = '';
let driveId = '';

async function testAPI() {
  console.log('🚀 Starting GStep Recruiter Module API Tests\n');

  try {
    // Test 1: Company Registration
    console.log('1️⃣ Testing Company Registration...');
    try {
      const registerResponse = await axios.post(`${API_URL}/company/register`, testCompany);
      authToken = registerResponse.data.token;
      companyId = registerResponse.data._id;
      console.log('✅ Company registration successful');
      console.log(`   Company ID: ${companyId}`);
    } catch (error) {
      if (error.response?.data?.message === 'Company already exists') {
        console.log('ℹ️  Company already exists, proceeding with login...');
        
        // Test 2: Company Login
        console.log('\n2️⃣ Testing Company Login...');
        const loginResponse = await axios.post(`${API_URL}/company/login`, {
          email: testCompany.email,
          password: testCompany.password
        });
        authToken = loginResponse.data.token;
        companyId = loginResponse.data._id;
        console.log('✅ Company login successful');
      } else {
        throw error;
      }
    }

    // Test 3: Submit Drive Request
    console.log('\n3️⃣ Testing Drive Request Submission...');
    const driveResponse = await axios.post(`${API_URL}/company/request-drive`, testDrive, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    driveId = driveResponse.data._id;
    console.log('✅ Drive request submitted successfully');
    console.log(`   Drive ID: ${driveId}`);

    // Test 4: Get Drive Requests
    console.log('\n4️⃣ Testing Get Drive Requests...');
    const requestsResponse = await axios.get(`${API_URL}/company/requests`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Drive requests retrieved successfully');
    console.log(`   Total drives: ${requestsResponse.data.length}`);

    // Test 5: Get Applied Students (will be empty for new drive)
    console.log('\n5️⃣ Testing Get Applied Students...');
    const applicationsResponse = await axios.get(`${API_URL}/company/drive/${driveId}/applications`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Applied students retrieved successfully');
    console.log(`   Total applications: ${applicationsResponse.data.length}`);

    // Test 6: Get Statistics
    console.log('\n6️⃣ Testing Get Statistics...');
    const statsResponse = await axios.get(`${API_URL}/company/statistics`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Statistics retrieved successfully');
    console.log(`   Total applications: ${statsResponse.data.overview.totalApplications}`);
    console.log(`   Selected students: ${statsResponse.data.overview.selectedStudents}`);
    console.log(`   Placed students: ${statsResponse.data.overview.placedStudents}`);

    // Test 7: Test with existing test company data
    console.log('\n7️⃣ Testing with existing test company...');
    const existingLoginResponse = await axios.post(`${API_URL}/company/login`, {
      email: 'test@company.com',
      password: 'password123'
    });
    const existingToken = existingLoginResponse.data.token;
    
    const existingStatsResponse = await axios.get(`${API_URL}/company/statistics`, {
      headers: { Authorization: `Bearer ${existingToken}` }
    });
    console.log('✅ Existing company data retrieved successfully');
    console.log(`   Total applications: ${existingStatsResponse.data.overview.totalApplications}`);
    console.log(`   Department stats: ${Object.keys(existingStatsResponse.data.departmentStats).length} departments`);

    console.log('\n🎉 All API tests completed successfully!');
    console.log('\n📋 Test Summary:');
    console.log('   ✅ Company Registration/Login');
    console.log('   ✅ Drive Request Submission');
    console.log('   ✅ Drive Requests Retrieval');
    console.log('   ✅ Applied Students Retrieval');
    console.log('   ✅ Statistics Retrieval');
    console.log('   ✅ Existing Data Validation');

  } catch (error) {
    console.error('❌ API Test Failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Run tests
testAPI();
