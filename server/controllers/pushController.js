const { User } = require('../models');

exports.subscribe = async (req, res) => {
  try {
    const { uid, subscription } = req.body;
    if (!uid || !subscription) return res.status(400).json({ error: 'uid and subscription required' });

    if (subscription.type === 'fcm') {
      await User.updateOne(
        { uid },
        { $addToSet: { fcmTokens: subscription.fcmToken } }
      );
    } else {
      await User.updateOne(
        { uid },
        { $addToSet: { pushSubscriptions: subscription } }
      );
    }
    res.status(201).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
