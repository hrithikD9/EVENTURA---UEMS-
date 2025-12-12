import api from './api';

export const eventService = {
  // Get all events
  getEvents: async (params = {}) => {
    try {
      const response = await api.get('/events', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch events');
    }
  },

  // Get event by ID
  getEventById: async (id) => {
    try {
      const response = await api.get(`/events/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch event');
    }
  },

  // Create event
  createEvent: async (eventData) => {
    try {
      const response = await api.post('/events', eventData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create event');
    }
  },

  // Update event
  updateEvent: async (id, eventData) => {
    try {
      const response = await api.put(`/events/${id}`, eventData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update event');
    }
  },

  // Delete event
  deleteEvent: async (id) => {
    try {
      const response = await api.delete(`/events/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete event');
    }
  },

  // Register for event
  registerForEvent: async (eventId) => {
    try {
      const response = await api.post(`/events/${eventId}/register`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to register for event');
    }
  },

  // Unregister from event
  unregisterFromEvent: async (eventId) => {
    try {
      const response = await api.delete(`/events/${eventId}/unregister`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to unregister from event');
    }
  },

  // Get user's events
  getUserEvents: async () => {
    try {
      const response = await api.get('/events/my-events');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch user events');
    }
  },

  // Search events
  searchEvents: async (query) => {
    try {
      const response = await api.get('/events/search', { params: { q: query } });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to search events');
    }
  },

  // Get featured events
  getFeaturedEvents: async () => {
    try {
      const response = await api.get('/events/featured');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch featured events');
    }
  }
};
