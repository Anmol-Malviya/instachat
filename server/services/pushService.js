const admin = require('../config/firebase');
const webpush = require('web-push');
const { User } = require('../models');

// Web Push Configuration
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || 'BIWtA1MgjhDdv3oKcKlRhoyyD_YSCEX1n3WfVsQPPGu20IE64UhU4QCqgnHmLN2vjTo3BaQ4ILjNzNjMuFak7tU';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || 'sRCSFag74zwbQQE_xu1-CVV4QJs2UTEPXTmddwOxaNI';

webpush.setVapidDetails(
  'mailto:example@yourdomain.com',
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

exports.sendPushNotification = async (payload, senderId, receiverId) => {
  try {
    const receiver = await User.findOne({ uid: receiverId });
    const sender = await User.findOne({ uid: senderId });
    
    if (receiver) {
      const title = sender ? sender.name : 'New Message';
      const body = payload.isSticker ? 'Sent a sticker' : (payload.text || 'New message arrived');

      // 1. Send via FCM
      if (receiver.fcmTokens?.length > 0) {
        const fcmMessage = {
          notification: { title, body },
          data: {
            url: '/dashboard',
            senderId: senderId,
          },
          tokens: receiver.fcmTokens,
        };

        admin.messaging().sendEachForMulticast(fcmMessage).then((response) => {
          console.log(`✅ FCM Sent: ${response.successCount} success, ${response.failureCount} failure`);
          if (response.failureCount > 0) {
            const failedTokens = [];
            response.responses.forEach((resp, idx) => {
              if (!resp.success) {
                const errorCode = resp.error.code;
                if (errorCode === 'messaging/registration-token-not-registered' || 
                    errorCode === 'messaging/invalid-registration-token') {
                  failedTokens.push(receiver.fcmTokens[idx]);
                }
              }
            });
            if (failedTokens.length > 0) {
              User.updateOne({ uid: receiverId }, { $pull: { fcmTokens: { $in: failedTokens } } }).catch(() => {});
            }
          }
        }).catch(err => console.error('❌ FCM Error:', err));
      }

      // 2. Send via Web-Push (Legacy fallback)
      if (receiver.pushSubscriptions?.length > 0) {
        const pushPayload = JSON.stringify({
          title,
          body,
          url: `/dashboard`,
          tag: senderId,
        });

        receiver.pushSubscriptions.forEach(sub => {
          webpush.sendNotification(sub, pushPayload).catch(err => {
            if (err.statusCode === 410 || err.statusCode === 404) {
              User.updateOne({ uid: receiverId }, { $pull: { pushSubscriptions: sub } }).catch(() => {});
            }
          });
        });
      }
    }
  } catch (pushErr) {
    console.error('❌ Push Notification system error:', pushErr);
  }
};
