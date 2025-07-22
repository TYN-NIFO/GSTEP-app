const axios = require('axios');

const testLogin = async () => {
  try {
    console.log('Testing company login...');
    
    const loginData = {
      email: 'test@company.com',
      password: 'password123'
    };

    const response = await axios.post('http://localhost:5000/api/company/login', loginData);
    
    console.log('✅ Login successful!');
    console.log('Company:', response.data.companyName);
    console.log('HR Name:', response.data.hrName);
    console.log('Token received:', response.data.token ? 'Yes' : 'No');
    
    // Test getting drive requests with the token
    const token = response.data.token;
    const drivesResponse = await axios.get('http://localhost:5000/api/company/requests', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Drive requests fetched successfully!');
    console.log('Number of drives:', drivesResponse.data.length);
    
    // Test getting statistics
    const statsResponse = await axios.get('http://localhost:5000/api/company/statistics', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Statistics fetched successfully!');
    console.log('Total applications:', statsResponse.data.overview.totalApplications);
    console.log('Selected students:', statsResponse.data.overview.selectedStudents);
    
  } catch (error) {
    console.error('❌ Test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Message:', error.response.data.message);
    } else {
      console.error('Error:', error.message);
    }
  }
};

testLogin();
