const { Request, User } = require('../models');

exports.getRequests = async (req, res) => {
  try {
    const requests = await Request.find({ receiverId: req.params.uid, status: 'pending' });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.sendRequest = async (req, res) => {
  try {
    const { senderId, senderName, senderPhoto, senderUsername, receiverId } = req.body;
    const existing = await Request.findOne({ senderId, receiverId, status: 'pending' });
    if (existing) return res.json(existing);
    const request = await Request.create({ senderId, senderName, senderPhoto, senderUsername, receiverId });
    res.json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.acceptRequest = async (req, res) => {
  try {
    const request = await Request.findByIdAndUpdate(req.params.id, { status: 'accepted' }, { new: true });
    if (!request) return res.status(404).json({ error: 'Request not found' });

    await User.updateOne({ uid: request.receiverId }, { $addToSet: { connections: request.senderId } });
    await User.updateOne({ uid: request.senderId  }, { $addToSet: { connections: request.receiverId } });

    res.json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
