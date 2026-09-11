const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  senderId:       { type: String, required: true },
  senderName:     { type: String },
  senderPhoto:    { type: String },
  senderUsername: { type: String },
  receiverId:     { type: String, required: true },
  status:         { type: String, default: 'pending' }, // pending | accepted | rejected
}, { timestamps: true });

module.exports = mongoose.model('Request', requestSchema);
