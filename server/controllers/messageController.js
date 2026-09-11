const { Message } = require('../models');

exports.getMessages = async (req, res) => {
  try {
    const msgs = await Message.find({ roomId: req.params.roomId }).sort({ createdAt: 1 }).limit(200);
    res.json(msgs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { roomId, senderId, text, isSticker, isSystem, disappearing, mediaUrl, mimeType, replyTo } = req.body;
    const msg = await Message.create({ roomId, senderId, text, isSticker, isSystem, disappearing, mediaUrl, mimeType, replyTo });
    res.json(msg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const msg = await Message.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(msg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.readRoom = async (req, res) => {
  try {
    const { readerUid } = req.body;
    await Message.updateMany(
      { roomId: req.params.roomId, senderId: { $ne: readerUid }, status: { $ne: 'read' } },
      { status: 'read' }
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.reactToMessage = async (req, res) => {
  try {
    const { uid, emoji } = req.body;
    const msg = await Message.findById(req.params.id);
    if (!msg) return res.status(404).json({ error: 'Not found' });
    if (msg.reactions.get(uid) === emoji) {
      msg.reactions.delete(uid);
    } else {
      msg.reactions.set(uid, emoji);
    }
    await msg.save();
    res.json(msg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteMessage = async (req, res) => {
  try {
    await Message.findByIdAndUpdate(req.params.id, { isDeleted: true, text: 'This message was deleted' });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.searchMessages = async (req, res) => {
  try {
    const { q, roomId } = req.query;
    if (!q) return res.json([]);
    const query = { 
      text: { $regex: q, $options: 'i' },
      isDeleted: false 
    };
    if (roomId) query.roomId = roomId;
    
    const msgs = await Message.find(query).sort({ createdAt: -1 }).limit(50);
    res.json(msgs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Message.countDocuments({
      roomId: req.params.roomId,
      senderId: { $ne: req.params.uid },
      status: { $ne: 'read' }
    });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
