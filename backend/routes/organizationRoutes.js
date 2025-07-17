const express = require('express');
const { 
  getOrganizations, 
  getOrganizationById, 
  followOrganization,
  getFeaturedOrganizations,
  getOrganizationCategories,
  debugOrganizationsByAdmin,
  createDebugOrganization
} = require('../controllers/organizationController');
const { protect, isStudent } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.get('/', getOrganizations);
router.get('/featured', getFeaturedOrganizations);
router.get('/categories', getOrganizationCategories);
router.get('/debug/:adminId', debugOrganizationsByAdmin);  // Debug endpoint
router.get('/:id', getOrganizationById);

// Protected routes
router.put('/:id/follow', protect, isStudent, followOrganization);

// Debug/Admin routes - removed protect middleware for easier testing
router.post('/admin', createDebugOrganization);

module.exports = router;
