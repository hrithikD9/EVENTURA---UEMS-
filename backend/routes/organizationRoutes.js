const express = require('express');
const { getOrganizations, getOrganizationById, followOrganization } = require('../controllers/organizationController');
const { protect, isStudent } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getOrganizations);
router.get('/:id', getOrganizationById);
router.put('/:id/follow', protect, isStudent, followOrganization);

module.exports = router;
