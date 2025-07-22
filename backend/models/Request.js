const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  alumniId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  studentName: String,
  message: { type: String, required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  response: String,
  respondedAt: Date
}, { timestamps: true });

module.exports = mongoose.model('Request', requestSchema);
