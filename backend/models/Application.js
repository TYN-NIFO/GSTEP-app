const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  driveRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DriveRequest',
    required: true
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  status: {
    type: String,
    enum: ['Applied', 'Shortlisted', 'Selected', 'Rejected'],
    default: 'Applied'
  },
  appliedAt: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    default: ''
  }
});

// Compound index to prevent duplicate applications
ApplicationSchema.index({ student: 1, driveRequest: 1 }, { unique: true });

module.exports = mongoose.model('Application', ApplicationSchema);
