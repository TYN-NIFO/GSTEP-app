require('dotenv').config();
const mongoose = require('mongoose');

const testConnection = async () => {
  try {
    console.log('Testing MongoDB connection...');
    console.log('URI:', process.env.MONGO_URI ? 'URI is set' : 'URI is missing');
    
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // 10 seconds
      socketTimeoutMS: 45000,
    };

    const conn = await mongoose.connect(process.env.MONGO_URI, options);
    console.log('✅ MongoDB Connected Successfully!');
    console.log('Host:', conn.connection.host);
    console.log('Database:', conn.connection.name);
    console.log('Ready State:', conn.connection.readyState);
    
    // Test a simple operation
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));
    
    await mongoose.disconnect();
    console.log('✅ Connection test completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ MongoDB Connection Failed:');
    console.error('Error:', error.message);
    
    if (error.message.includes('IP')) {
      console.log('\n🔧 Possible Solutions:');
      console.log('1. Add your IP address to MongoDB Atlas whitelist');
      console.log('2. Go to MongoDB Atlas → Network Access → Add IP Address');
      console.log('3. Add 0.0.0.0/0 to allow all IPs (for development only)');
    }
    
    if (error.message.includes('authentication')) {
      console.log('\n🔧 Authentication Issue:');
      console.log('1. Check username and password in connection string');
      console.log('2. Verify database user permissions');
    }
    
    process.exit(1);
  }
};

testConnection();
