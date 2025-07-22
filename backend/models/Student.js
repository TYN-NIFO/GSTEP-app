const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  rollNumber: {
    type: String,
    required: true,
    unique: true
  },
  department: {
    type: String,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  cgpa: {
    type: Number,
    required: true
  },
  resumeLink: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  skills: [{
    type: String
  }],
  isPlaced: {
    type: Boolean,
    default: false
  },
  placedCompany: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Student', StudentSchema);
