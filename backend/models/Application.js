const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  opportunity: { type: mongoose.Schema.Types.ObjectId, ref: 'Opportunity', required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  appliedAt: { type: Date, default: Date.now },
  response: String,
  respondedAt: Date
}, { timestamps: true });

module.exports = mongoose.model('Application', applicationSchema);