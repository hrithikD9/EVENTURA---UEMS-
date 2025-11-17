import { createContext, useState, useEffect } from 'react';
import { eventService } from '@/services/eventService';
import toast from 'react-hot-toast';

export const EventContext = createContext(null);

export const EventProvider = ({ children }) => {
  const [events, setEvents] = useState([]);
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    search: '',
    status: 'upcoming',
  });

  useEffect(() => {
    fetchEvents();
    fetchFeaturedEvents();
  }, []);

  const fetchEvents = async (customFilters = null) => {
    setLoading(true);
    try {
      const data = await eventService.getAllEvents(customFilters || filters);
      setEvents(data);
    } catch (error) {
      toast.error('Failed to fetch events');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeaturedEvents = async () => {
    try {
      const data = await eventService.getFeaturedEvents();
      setFeaturedEvents(data);
    } catch (error) {
      console.error('Failed to fetch featured events:', error);
    }
  };

  const getEventById = async (id) => {
    try {
      return await eventService.getEventById(id);
    } catch (error) {
      toast.error('Event not found');
      throw error;
    }
  };

  const createEvent = async (eventData) => {
    try {
      const newEvent = await eventService.createEvent(eventData);
      setEvents([newEvent, ...events]);
      toast.success('Event created successfully!');
      return newEvent;
    } catch (error) {
      toast.error('Failed to create event');
      throw error;
    }
  };

  const updateEvent = async (id, eventData) => {
    try {
      const updatedEvent = await eventService.updateEvent(id, eventData);
      setEvents(events.map(e => e.id === id ? updatedEvent : e));
      toast.success('Event updated successfully!');
      return updatedEvent;
    } catch (error) {
      toast.error('Failed to update event');
      throw error;
    }
  };

  const deleteEvent = async (id) => {
    try {
      await eventService.deleteEvent(id);
      setEvents(events.filter(e => e.id !== id));
      toast.success('Event deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete event');
      throw error;
    }
  };

  const registerForEvent = async (eventId, userId) => {
    try {
      const { event } = await eventService.registerForEvent(eventId, userId);
      setEvents(events.map(e => e.id === eventId ? event : e));
      toast.success('Successfully registered for event!');
      return event;
    } catch (error) {
      toast.error(error.message || 'Failed to register for event');
      throw error;
    }
  };

  const unregisterFromEvent = async (eventId, userId) => {
    try {
      const { event } = await eventService.unregisterFromEvent(eventId, userId);
      setEvents(events.map(e => e.id === eventId ? event : e));
      toast.success('Successfully unregistered from event');
      return event;
    } catch (error) {
      toast.error('Failed to unregister from event');
      throw error;
    }
  };

  const updateFilters = (newFilters) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    fetchEvents(updatedFilters);
  };

  const value = {
    events,
    featuredEvents,
    loading,
    filters,
    fetchEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent,
    registerForEvent,
    unregisterFromEvent,
    updateFilters,
  };

  return <EventContext.Provider value={value}>{children}</EventContext.Provider>;
};
