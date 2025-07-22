const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // MongoDB connection options for Atlas
    const options = {
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    };

    console.log('Connecting to MongoDB Atlas...');
    console.log('URI:', process.env.MONGO_URI ? 'URI provided' : 'URI missing');

    const conn = await mongoose.connect(process.env.MONGO_URI, options);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);

    // Don't exit the process, just log the error and continue
    // This allows the server to start even if DB is temporarily unavailable
    console.log('Server will continue running without database connection');
    console.log('Please check your MongoDB Atlas configuration:');
    console.log('1. Verify IP whitelist includes your current IP');
    console.log('2. Check username/password in connection string');
    console.log('3. Ensure cluster is running');
  }
};

module.exports = connectDB;