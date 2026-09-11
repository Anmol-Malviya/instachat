const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');

router.get('/unread/:roomId/:uid', messageController.getUnreadCount);
router.patch('/read-room/:roomId', messageController.readRoom);
router.get('/search', messageController.searchMessages);
router.get('/:roomId', messageController.getMessages);
router.post('/', messageController.sendMessage);
router.patch('/:id/status', messageController.updateStatus);
router.patch('/:id/react', messageController.reactToMessage);
router.delete('/:id', messageController.deleteMessage);

module.exports = router;
