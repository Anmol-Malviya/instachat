const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');

router.post('/groups', roomController.createGroup);
router.get('/groups/:userId', roomController.getUserGroups);
router.get('/:roomId', roomController.getRoom);
router.patch('/:roomId', roomController.updateRoom);

module.exports = router;
