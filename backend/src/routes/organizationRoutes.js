import express from 'express';
import {
  getOrganizations,
  getOrganization,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  joinOrganization,
  leaveOrganization,
  getOrganizationMembers,
  updateMemberRole,
  getOrganizationEvents,
  getOrganizationsByType
} from '../controllers/organizationController.js';
import { protect, authorize, checkOwnership } from '../middleware/auth.js';
import { validateOrganizationCreation } from '../middleware/validation.js';
import Organization from '../models/Organization.js';

const router = express.Router();

// Public routes
router.get('/', getOrganizations);
router.get('/type/:type', getOrganizationsByType);
router.get('/:id', getOrganization);
router.get('/:id/events', getOrganizationEvents);

// Protected routes
router.use(protect);

// User routes
router.post('/:id/join', joinOrganization);
router.delete('/:id/leave', leaveOrganization);

// Organizer/Admin routes
router.post('/', authorize('organizer', 'admin'), validateOrganizationCreation, createOrganization);

// Organization admin/Admin only routes
router.put('/:id', checkOwnership(Organization, 'id', 'members.executives.user'), updateOrganization);
router.delete('/:id', checkOwnership(Organization, 'id', 'members.executives.user'), deleteOrganization);
router.get('/:id/members', checkOwnership(Organization, 'id', 'members.executives.user'), getOrganizationMembers);
router.put('/:id/members/:userId', checkOwnership(Organization, 'id', 'members.executives.user'), updateMemberRole);

export default router;