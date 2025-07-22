const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    console.log('Auth middleware called'); // Debug log
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      console.log('No token provided'); // Debug log
      return res.status(401).json({ success: false, message: 'No token, authorization denied' });
    }

    console.log('Token received:', token.substring(0, 20) + '...'); // Debug log
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      console.log('User not found for token'); // Debug log
      return res.status(401).json({ success: false, message: 'Token is not valid' });
    }

    console.log('User authenticated:', user.email); // Debug log
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ success: false, message: 'Token is not valid' });
  }
};

module.exports = auth;



