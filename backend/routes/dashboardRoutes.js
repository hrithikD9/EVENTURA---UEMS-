const express = require('express');
const router = express.Router();
const { 
  getDashboardStats,
  getRecentEvents,
  getRegistrationTrends,
  getRecentRegistrants
} = require('../controllers/dashboardController');
const { protect, isOrganizer } = require('../middleware/authMiddleware');

// All dashboard routes require authentication and organizer role
router.use(protect);
router.use(isOrganizer);

// Dashboard endpoints
router.get('/stats', getDashboardStats);
router.get('/events', getRecentEvents);
router.get('/trends', getRegistrationTrends);
router.get('/registrants', getRecentRegistrants);

module.exports = router;
