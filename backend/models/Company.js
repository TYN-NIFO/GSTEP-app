const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const CompanySchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true
  },
  hrName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  contactNumber: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  location: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
CompanySchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
CompanySchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Company', CompanySchema);