const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  uid:         { type: String, required: true, unique: true }, // Firebase UID
  name:        { type: String, default: 'New User' },
  email:       { type: String },
  photoURL:    { type: String },
  username:    { type: String, lowercase: true, trim: true },
  bio:         { type: String, default: '' },
  phone:       { type: String, default: '' },
  dob:         { type: String, default: '' },
  status:      { type: String, default: 'offline' }, // online | offline
  connections: [{ type: String }],                   // array of Firebase UIDs
  isProfileComplete: { type: Boolean, default: false },
  lastSeen:    { type: Date, default: Date.now },
  pushSubscriptions: { type: Array, default: [] },
  fcmTokens: { type: Array, default: [] },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
