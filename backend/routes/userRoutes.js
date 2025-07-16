const express = require('express');
const { registerUser, loginUser, completeOnboarding, getUserProfile } = require('../controllers/userController');
const { protect, isOrganizer } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);
router.put('/onboarding', protect, isOrganizer, completeOnboarding);

module.exports = router;
