const express = require('express');
const { 
  getOrganizations, 
  getOrganizationById, 
  followOrganization,
  getFeaturedOrganizations,
  getOrganizationCategories
} = require('../controllers/organizationController');
const { protect, isStudent } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.get('/', getOrganizations);
router.get('/featured', getFeaturedOrganizations);
router.get('/categories', getOrganizationCategories);
router.get('/:id', getOrganizationById);

// Protected routes
router.put('/:id/follow', protect, isStudent, followOrganization);

module.exports = router;
