import api from './api';

export const organizationService = {
  // Get all organizations
  getOrganizations: async (params = {}) => {
    try {
      const response = await api.get('/organizations', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch organizations');
    }
  },

  // Get organization by ID
  getOrganizationById: async (id) => {
    try {
      const response = await api.get(`/organizations/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch organization');
    }
  },

  // Create organization
  createOrganization: async (orgData) => {
    try {
      const response = await api.post('/organizations', orgData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create organization');
    }
  },

  // Update organization
  updateOrganization: async (id, orgData) => {
    try {
      const response = await api.put(`/organizations/${id}`, orgData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update organization');
    }
  },

  // Delete organization
  deleteOrganization: async (id) => {
    try {
      const response = await api.delete(`/organizations/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete organization');
    }
  },

  // Join organization
  joinOrganization: async (id, position = 'Member') => {
    try {
      const response = await api.post(`/organizations/${id}/join`, { position });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to join organization');
    }
  },

  // Leave organization
  leaveOrganization: async (id) => {
    try {
      const response = await api.delete(`/organizations/${id}/leave`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to leave organization');
    }
  },

  // Get organization members
  getOrganizationMembers: async (id) => {
    try {
      const response = await api.get(`/organizations/${id}/members`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch organization members');
    }
  },

  // Get organization events
  getOrganizationEvents: async (id) => {
    try {
      const response = await api.get(`/organizations/${id}/events`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch organization events');
    }
  }
};
