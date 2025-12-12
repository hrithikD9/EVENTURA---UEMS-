import express from 'express';
import { 
  register, 
  login, 
  logout, 
  getMe, 
  forgotPassword, 
  resetPassword,
  updatePassword,
  verifyEmail
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { 
  validateUserRegistration, 
  validateUserLogin, 
  validatePasswordChange 
} from '../middleware/validation.js';

const router = express.Router();

// Public routes
router.post('/register', validateUserRegistration, register);
router.post('/login', validateUserLogin, login);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:resettoken', resetPassword);
router.get('/verify-email/:token', verifyEmail);

// Protected routes
router.get('/me', protect, getMe);
router.put('/update-password', protect, validatePasswordChange, updatePassword);

export default router;