const { Server } = require('socket.io');
const { User } = require('../models');
const { sendPushNotification } = require('./pushService');

exports.initializeSocket = (server, ALLOWED_ORIGINS) => {
  const io = new Server(server, {
    cors: { origin: ALLOWED_ORIGINS, methods: ['GET', 'POST'] }
  });

  let onlineUsers = new Map(); // uid → socketId

  io.on('connection', (socket) => {
    console.log('User Connected:', socket.id);

    socket.on('setup', async (userData) => {
      socket.join(userData.uid);
      onlineUsers.set(userData.uid, socket.id);
      socket.emit('connected');
      io.emit('user-online', userData.uid);
      await User.updateOne({ uid: userData.uid }, { status: 'online', lastSeen: new Date() }).catch(() => {});
    });

    socket.on('join-chat', (room) => {
      socket.join(room);
      console.log('User Joined Room:', room);
    });

    socket.on('typing',      (room) => socket.in(room).emit('typing'));
    socket.on('stop-typing', (room) => socket.in(room).emit('stop-typing'));

    socket.on('new-message', (payload) => {
      const { roomId, senderId, receiverId, messageId } = payload;
      if (!roomId) return;
      socket.in(roomId).emit('message-received', payload);
      if (receiverId) {
        io.to(receiverId).emit('message-received', payload);
        
        // Send Push Notification via pushService
        sendPushNotification(payload, senderId, receiverId);
      }

      if (receiverId && messageId && onlineUsers.has(receiverId)) {
        const senderSocketId = onlineUsers.get(senderId);
        if (senderSocketId) io.to(senderSocketId).emit('message-delivered', { messageId });
      }
    });

    socket.on('mark-read', ({ roomId, readerUid, senderUid }) => {
      const senderSocketId = onlineUsers.get(senderUid);
      if (senderSocketId) {
        io.to(senderSocketId).emit('messages-read', { roomId, readerUid });
      }
    });

    socket.on('call-user', (data) => {
      io.to(data.userToCall).emit('incoming-call', {
        signal: data.signal,
        from: data.from,
        name: data.name,
        callType: data.callType,
      });
    });

    socket.on('answer-call', (data) => {
      io.to(data.to).emit('call-accepted', { signal: data.signal });
    });

    socket.on('ice-candidate', (data) => {
      io.to(data.to).emit('ice-candidate', { candidate: data.candidate });
    });

    socket.on('call-ended',    (data) => io.to(data.to).emit('call-ended'));
    socket.on('call-rejected', (data) => io.to(data.to).emit('call-rejected'));
    socket.on('call-busy',     (data) => io.to(data.to).emit('call-busy'));

    socket.on('disconnect', async () => {
      console.log('User Disconnected:', socket.id);
      let disconnectedUid = null;
      onlineUsers.forEach((sid, uid) => { if (sid === socket.id) disconnectedUid = uid; });
      if (disconnectedUid) {
        onlineUsers.delete(disconnectedUid);
        io.emit('user-offline', disconnectedUid);
        await User.updateOne({ uid: disconnectedUid }, { status: 'offline', lastSeen: new Date() }).catch(() => {});
      }
    });
  });

  return io;
};
