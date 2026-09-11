const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  roomId:       { type: String, required: true, index: true },
  senderId:     { type: String, required: true },
  text:         { type: String, default: '' },
  mediaUrl:     { type: String }, // For attachments
  mimeType:     { type: String }, // 'image/png', 'video/mp4', 'audio/mp3', etc.
  replyTo:      { type: String }, // ID of the message being replied to
  status:       { type: String, default: 'sent' }, // sent | delivered | read
  isSticker:    { type: Boolean, default: false },
  isSystem:     { type: Boolean, default: false },
  disappearing: { type: Boolean, default: false },
  isDeleted:    { type: Boolean, default: false },
  editedAt:     { type: Date },
  reactions:    { type: Map, of: String, default: {} },
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
