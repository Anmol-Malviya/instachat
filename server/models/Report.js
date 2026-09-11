const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reporterId:     { type: String, required: true },
  reportedUserId: { type: String, required: true },
  messageId:      { type: String }, // Optional, if reporting a specific message
  reason:         { type: String, required: true },
  description:    { type: String, default: '' },
  status:         { type: String, enum: ['pending', 'reviewed', 'resolved'], default: 'pending' },
  reviewedBy:     { type: String }, // Admin ID
  reviewedAt:     { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);
