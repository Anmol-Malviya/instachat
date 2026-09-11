const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/', userController.upsertUser);
router.get('/search/:term', userController.searchUsers);
router.get('/username/:username', userController.checkUsername);
router.post('/batch', userController.getUsersBatch);
router.get('/recommendations/:uid', userController.getRecommendations);
router.get('/:uid', userController.getUserProfile);
router.patch('/:uid', userController.updateProfile);

module.exports = router;
