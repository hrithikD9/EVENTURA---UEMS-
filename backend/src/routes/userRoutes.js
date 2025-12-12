import express from 'express';
import {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  updateProfile,
  getUserEvents,
  getUserStats
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validateProfileUpdate } from '../middleware/validation.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// User profile routes
router.get('/profile', getUser);
router.put('/profile', validateProfileUpdate, updateProfile);
router.get('/events', getUserEvents);
router.get('/stats', getUserStats);

// Admin only routes
router.use(authorize('admin'));
router.route('/')
  .get(getUsers);

router.route('/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

export default router;