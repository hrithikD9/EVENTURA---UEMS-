import express from 'express';
import {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
  unregisterFromEvent,
  getEventRegistrations,
  markAttendance,
  submitFeedback,
  getFeaturedEvents,
  getEventsByCategory,
  searchEvents
} from '../controllers/eventController.js';
import { protect, authorize, optionalAuth, checkOwnership } from '../middleware/auth.js';
import { 
  validateEventCreation, 
  validateEventUpdate, 
  validateFeedback 
} from '../middleware/validation.js';
import Event from '../models/Event.js';

const router = express.Router();

// Public routes
router.get('/', optionalAuth, getEvents);
router.get('/featured', getFeaturedEvents);
router.get('/category/:category', getEventsByCategory);
router.get('/search', searchEvents);
router.get('/:id', optionalAuth, getEvent);

// Protected routes
router.use(protect);

// User routes
router.post('/:id/register', registerForEvent);
router.delete('/:id/register', unregisterFromEvent);
router.post('/:id/feedback', validateFeedback, submitFeedback);

// Organizer/Admin routes
router.post('/', authorize('organizer', 'admin'), validateEventCreation, createEvent);

// Event owner/Admin only routes
router.put('/:id', authorize('organizer', 'admin'), validateEventUpdate, updateEvent);
router.delete('/:id', authorize('organizer', 'admin'), deleteEvent);
router.get('/:id/registrations', authorize('organizer', 'admin'), getEventRegistrations);
router.post('/:id/attendance', authorize('organizer', 'admin'), markAttendance);

export default router;