/**
 * Real-time service for Eventura
 * 
 * This service provides functions to emit real-time updates to clients
 * using Socket.IO. It's used by controllers to notify clients of data changes.
 */

const socketConfig = require('../config/socket');

// Event types
const EVENT_TYPES = {
  EVENT_CREATED: 'event-created',
  EVENT_UPDATED: 'event-updated',
  EVENT_DELETED: 'event-deleted',
  EVENT_JOINED: 'event-joined',
  EVENT_CAPACITY_CHANGE: 'event-capacity-change',
  
  ORG_CREATED: 'org-created',
  ORG_UPDATED: 'org-updated',
  ORG_DELETED: 'org-deleted',
  ORG_FOLLOWED: 'org-followed',
  
  NOTIFICATION: 'notification'
};

/**
 * Notify all clients about a new event
 * @param {Object} event - The newly created event
 */
const notifyNewEvent = (event) => {
  socketConfig.emitToAll(EVENT_TYPES.EVENT_CREATED, { event });
  
  // Also notify organization-specific subscribers
  if (event.organizer && event.organizer.orgId) {
    socketConfig.emitToRoom(`org-${event.organizer.orgId}`, EVENT_TYPES.EVENT_CREATED, { event });
  }
};

/**
 * Notify clients about an updated event
 * @param {Object} event - The updated event
 */
const notifyEventUpdate = (event) => {
  socketConfig.emitToAll(EVENT_TYPES.EVENT_UPDATED, { event });
  socketConfig.emitToRoom(`event-${event._id}`, EVENT_TYPES.EVENT_UPDATED, { event });
  
  if (event.organizer && event.organizer.orgId) {
    socketConfig.emitToRoom(`org-${event.organizer.orgId}`, EVENT_TYPES.EVENT_UPDATED, { event });
  }
};

/**
 * Notify clients about a deleted event
 * @param {Object} event - The deleted event
 */
const notifyEventDeletion = (event) => {
  socketConfig.emitToAll(EVENT_TYPES.EVENT_DELETED, { eventId: event._id });
  socketConfig.emitToRoom(`event-${event._id}`, EVENT_TYPES.EVENT_DELETED, { eventId: event._id });
  
  if (event.organizer && event.organizer.orgId) {
    socketConfig.emitToRoom(`org-${event.organizer.orgId}`, EVENT_TYPES.EVENT_DELETED, { eventId: event._id });
  }
};

/**
 * Notify clients about event capacity changes (registrations)
 * @param {Object} event - The event with updated capacity
 * @param {Object} user - The user who joined the event
 */
const notifyEventCapacityChange = (event, user = null) => {
  const data = { 
    eventId: event._id,
    remainingCapacity: event.capacity - event.attendees.length,
    totalCapacity: event.capacity
  };
  
  socketConfig.emitToRoom(`event-${event._id}`, EVENT_TYPES.EVENT_CAPACITY_CHANGE, data);
  
  // If a user joined, emit a specific joined event
  if (user) {
    socketConfig.emitToRoom(`event-${event._id}`, EVENT_TYPES.EVENT_JOINED, {
      eventId: event._id,
      user: {
        _id: user._id,
        name: user.name,
        avatar: user.avatar
      }
    });
  }
};

/**
 * Notify clients about a new organization
 * @param {Object} organization - The newly created organization
 */
const notifyNewOrganization = (organization) => {
  socketConfig.emitToAll(EVENT_TYPES.ORG_CREATED, { organization });
};

/**
 * Notify clients about an updated organization
 * @param {Object} organization - The updated organization
 */
const notifyOrganizationUpdate = (organization) => {
  socketConfig.emitToAll(EVENT_TYPES.ORG_UPDATED, { organization });
  socketConfig.emitToRoom(`org-${organization._id}`, EVENT_TYPES.ORG_UPDATED, { organization });
};

/**
 * Notify clients about organization follow changes
 * @param {Object} organization - The followed/unfollowed organization
 */
const notifyOrganizationFollowChange = (organization) => {
  socketConfig.emitToRoom(`org-${organization._id}`, EVENT_TYPES.ORG_FOLLOWED, {
    organizationId: organization._id,
    followerCount: organization.followers.length
  });
};

/**
 * Send a notification to a specific user
 * @param {String} userId - The user ID to notify
 * @param {Object} notification - The notification data
 */
const notifyUser = (userId, notification) => {
  socketConfig.emitToRoom(`user-${userId}`, EVENT_TYPES.NOTIFICATION, notification);
};

module.exports = {
  EVENT_TYPES,
  notifyNewEvent,
  notifyEventUpdate,
  notifyEventDeletion,
  notifyEventCapacityChange,
  notifyNewOrganization,
  notifyOrganizationUpdate,
  notifyOrganizationFollowChange,
  notifyUser
};
