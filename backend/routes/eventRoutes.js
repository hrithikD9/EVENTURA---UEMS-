const express = require('express');
const { createEvent, getEvents, getEventById, joinEvent, getOrganizerEvents, getUserEvents } = require('../controllers/eventController');
const { protect, isOrganizer, isStudent } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .get(getEvents)
  .post(protect, isOrganizer, createEvent);

router.route('/myevents')
  .get(protect, isOrganizer, getOrganizerEvents);

router.route('/user/registered')
  .get(protect, getUserEvents);

router.route('/:id')
  .get(getEventById);

router.route('/:id/join')
  .put(protect, isStudent, joinEvent);

module.exports = router;
