const axios = require('axios');

const testRegistration = async () => {
  try {
    console.log('Testing company registration...');
    
    const testData = {
      companyName: 'Test Registration Company',
      hrName: 'Test HR Manager',
      email: 'testregistration@example.com',
      password: 'testpass123',
      contactNumber: '+91-9876543299',
      description: 'Test company for registration',
      location: 'Test City'
    };

    const response = await axios.post('http://localhost:5000/api/company/register', testData);
    
    console.log('✅ Registration successful!');
    console.log('Response:', response.data);
    
  } catch (error) {
    console.error('❌ Registration failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Message:', error.response.data.message);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
};

testRegistration();
