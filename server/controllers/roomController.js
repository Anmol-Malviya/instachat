const { Room } = require('../models');

exports.getRoom = async (req, res) => {
  try {
    let room = await Room.findOne({ roomId: req.params.roomId });
    if (!room) room = { roomId: req.params.roomId, pinnedMsg: null, disappearing: false, blockedBy: [], wallpapers: {} };
    res.json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateRoom = async (req, res) => {
  try {
    const allowed = ['pinnedMsg', 'disappearing', 'blockedBy'];
    const update  = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) update[k] = req.body[k]; });

    if (req.body.wallpaperUid && req.body.wallpaperValue !== undefined) {
      update[`wallpapers.${req.body.wallpaperUid}`] = req.body.wallpaperValue;
    }

    const room = await Room.findOneAndUpdate(
      { roomId: req.params.roomId },
      update,
      { upsert: true, new: true }
    );
    res.json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createGroup = async (req, res) => {
  try {
    const { name, avatarUrl, memberIds, createdBy } = req.body;
    const roomId = `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const members = memberIds.map(userId => ({
      userId,
      role: userId === createdBy ? 'admin' : 'member'
    }));

    const newGroup = new Room({
      roomId,
      type: 'group',
      name,
      avatarUrl,
      members,
      createdBy
    });

    await newGroup.save();
    res.status(201).json(newGroup);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUserGroups = async (req, res) => {
  try {
    const userId = req.params.userId;
    const groups = await Room.find({ 
      type: 'group',
      'members.userId': userId 
    });
    res.json(groups);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
