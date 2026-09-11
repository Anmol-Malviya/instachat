const { User } = require('../models');

exports.upsertUser = async (req, res) => {
  try {
    const { uid, name, email, photoURL } = req.body;
    if (!uid) return res.status(400).json({ error: 'uid required' });
    let user;
    try {
      user = await User.findOneAndUpdate(
        { uid },
        { $setOnInsert: { uid, name, email, photoURL } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    } catch (upsertErr) {
      if (upsertErr.code === 11000 && email) {
        user = await User.findOneAndUpdate(
          { email },
          { $set: { uid, name, photoURL } },
          { new: true }
        );
        if (!user) throw upsertErr;
      } else {
        throw upsertErr;
      }
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.searchUsers = async (req, res) => {
  try {
    const { term } = req.params;
    const { selfUid } = req.query;
    const users = await User.find({
      uid: { $ne: selfUid },
      $or: [
        { email: { $regex: `^${term}$`, $options: 'i' } },
        { username: { $regex: `^${term}$`, $options: 'i' } },
      ]
    }).limit(20).select('-__v');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.checkUsername = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username.toLowerCase() });
    res.json({ taken: !!user, uid: user?.uid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUsersBatch = async (req, res) => {
  try {
    const { uids } = req.body;
    if (!uids || !uids.length) return res.json([]);
    const users = await User.find({ uid: { $in: uids } }).select('-__v');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getRecommendations = async (req, res) => {
  try {
    const uid = req.params.uid;
    const currentUser = await User.findOne({ uid });
    if (!currentUser) return res.status(404).json({ error: 'User not found' });

    const currentConns = currentUser.connections || [];
    const excludeUids = [...currentConns, uid];
    
    let recommendations = await User.aggregate([
      { $match: { uid: { $nin: excludeUids } } },
      { $addFields: { 
          mutualCount: { 
            $size: { $setIntersection: [ { $ifNull: ["$connections", []] }, currentConns ] } 
          }
      }},
      { $match: { mutualCount: { $gt: 0 } } },
      { $sort: { mutualCount: -1 } },
      { $limit: 5 }
    ]);
    
    if (recommendations.length < 5) {
      const needed = 5 - recommendations.length;
      const recUids = recommendations.map(r => r.uid);
      const randomUsers = await User.aggregate([
        { $match: { uid: { $nin: [...excludeUids, ...recUids] } } },
        { $sample: { size: needed } },
        { $addFields: { mutualCount: 0 } }
      ]);
      recommendations = [...recommendations, ...randomUsers];
    }
    
    res.json(recommendations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.params.uid });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const allowed = ['name', 'username', 'bio', 'phone', 'dob', 'photoURL', 'isProfileComplete', 'status', 'lastSeen'];
    const update  = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) update[k] = req.body[k]; });
    const user = await User.findOneAndUpdate({ uid: req.params.uid }, update, { new: true });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
