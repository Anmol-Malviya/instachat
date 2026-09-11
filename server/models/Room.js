const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomId:      { type: String, required: true, unique: true },
  type:        { type: String, enum: ['direct', 'group'], default: 'direct' },
  name:        { type: String }, // For group chats
  avatarUrl:   { type: String }, // For group chats
  members:     [{
    userId: { type: String, required: true },
    role: { type: String, enum: ['admin', 'member'], default: 'member' },
    joinedAt: { type: Date, default: Date.now }
  }],
  createdBy:   { type: String }, // User ID who created the group
  pinnedMsg:   { type: Object, default: null },  // { id, text }
  disappearing:{ type: Boolean, default: false },
  blockedBy:   [{ type: String }],
  wallpapers:  { type: Map, of: String, default: {} }, // uid -> gradient string
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);
