const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');

router.get('/:uid', requestController.getRequests);
router.post('/', requestController.sendRequest);
router.patch('/:id/accept', requestController.acceptRequest);

module.exports = router;
