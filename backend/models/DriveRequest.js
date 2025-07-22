const mongoose = require('mongoose');

const DriveRequestSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  driveTitle: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  eligibilityCriteria: {
    type: String,
    required: true
  },
  dateTime: {
    type: Date,
    required: true
  },
  mode: {
    type: String,
    enum: ['Online', 'Offline'],
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Rejected'],
    default: 'Pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('DriveRequest', DriveRequestSchema);