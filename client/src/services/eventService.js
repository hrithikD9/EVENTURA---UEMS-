// Mock event service with sample data

const MOCK_EVENTS = [
  {
    id: '1',
    title: 'Tech Talk: AI in Modern Development',
    description: 'Join us for an exciting discussion on how AI is transforming software development. Learn about the latest tools, techniques, and best practices from industry experts.',
    category: 'Technology',
    date: '2025-11-25',
    time: '14:00',
    location: 'Auditorium Hall A',
    organizer: 'CSE Society',
    organizerId: '1',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
    status: 'upcoming',
    attendees: 45,
    maxAttendees: 100,
    speakers: ['Dr. Ahmed Rahman', 'Prof. Sarah Khan'],
    tags: ['AI', 'Development', 'Technology'],
    registrationDeadline: '2025-11-24',
  },
  {
    id: '2',
    title: 'Annual Sports Meet 2025',
    description: 'Get ready for the most exciting sports event of the year! Participate in various indoor and outdoor games, compete with your peers, and win amazing prizes.',
    category: 'Sports',
    date: '2025-11-30',
    time: '09:00',
    location: 'University Sports Complex',
    organizer: 'Sports Club',
    organizerId: '2',
    image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800',
    status: 'upcoming',
    attendees: 120,
    maxAttendees: 200,
    tags: ['Sports', 'Competition', 'Outdoor'],
    registrationDeadline: '2025-11-28',
  },
  {
    id: '3',
    title: 'Cultural Night: Celebrating Diversity',
    description: 'Experience the rich cultural heritage through music, dance, and art. A night filled with performances from talented students showcasing traditions from around the world.',
    category: 'Cultural',
    date: '2025-12-05',
    time: '18:00',
    location: 'Main Auditorium',
    organizer: 'Cultural Society',
    organizerId: '3',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800',
    status: 'upcoming',
    attendees: 200,
    maxAttendees: 300,
    tags: ['Cultural', 'Music', 'Dance'],
    registrationDeadline: '2025-12-03',
  },
  {
    id: '4',
    title: 'Photography Workshop: Mastering DSLR',
    description: 'Learn the fundamentals of photography from professional photographers. Hands-on workshop covering composition, lighting, and post-processing techniques.',
    category: 'Workshop',
    date: '2025-12-10',
    time: '10:00',
    location: 'Photography Lab, Building 3',
    organizer: 'Photography Club',
    organizerId: '4',
    image: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800',
    status: 'upcoming',
    attendees: 25,
    maxAttendees: 30,
    tags: ['Photography', 'Workshop', 'Skills'],
    registrationDeadline: '2025-12-08',
  },
  {
    id: '5',
    title: 'Robotics Competition 2025',
    description: 'Showcase your robotics skills in this year\'s biggest competition. Build, program, and compete with your autonomous robots in various challenging tasks.',
    category: 'Competition',
    date: '2025-12-15',
    time: '13:00',
    location: 'Engineering Lab Complex',
    organizer: 'Robotics Club',
    organizerId: '5',
    image: 'https://images.unsplash.com/photo-1563207153-f403bf289096?w=800',
    status: 'upcoming',
    attendees: 60,
    maxAttendees: 80,
    tags: ['Robotics', 'Competition', 'Engineering'],
    registrationDeadline: '2025-12-12',
  },
];

const delay = (ms = 600) => new Promise(resolve => setTimeout(resolve, ms));

export const eventService = {
  async getAllEvents(filters = {}) {
    await delay();
    
    let filtered = [...MOCK_EVENTS];
    
    // Apply filters
    if (filters.category) {
      filtered = filtered.filter(e => e.category === filters.category);
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(e => 
        e.title.toLowerCase().includes(searchLower) ||
        e.description.toLowerCase().includes(searchLower) ||
        e.organizer.toLowerCase().includes(searchLower)
      );
    }
    
    if (filters.status) {
      filtered = filtered.filter(e => e.status === filters.status);
    }
    
    return filtered;
  },

  async getEventById(id) {
    await delay();
    
    const event = MOCK_EVENTS.find(e => e.id === id);
    if (!event) {
      throw new Error('Event not found');
    }
    
    return event;
  },

  async createEvent(eventData) {
    await delay();
    
    const newEvent = {
      id: Date.now().toString(),
      ...eventData,
      status: 'upcoming',
      attendees: 0,
      createdAt: new Date().toISOString(),
    };
    
    MOCK_EVENTS.push(newEvent);
    return newEvent;
  },

  async updateEvent(id, eventData) {
    await delay();
    
    const index = MOCK_EVENTS.findIndex(e => e.id === id);
    if (index === -1) {
      throw new Error('Event not found');
    }
    
    MOCK_EVENTS[index] = { ...MOCK_EVENTS[index], ...eventData };
    return MOCK_EVENTS[index];
  },

  async deleteEvent(id) {
    await delay();
    
    const index = MOCK_EVENTS.findIndex(e => e.id === id);
    if (index === -1) {
      throw new Error('Event not found');
    }
    
    MOCK_EVENTS.splice(index, 1);
    return { message: 'Event deleted successfully' };
  },

  async registerForEvent(eventId, userId) {
    await delay();
    
    const event = MOCK_EVENTS.find(e => e.id === eventId);
    if (!event) {
      throw new Error('Event not found');
    }
    
    if (event.attendees >= event.maxAttendees) {
      throw new Error('Event is full');
    }
    
    event.attendees += 1;
    return { message: 'Successfully registered for event', event };
  },

  async unregisterFromEvent(eventId, userId) {
    await delay();
    
    const event = MOCK_EVENTS.find(e => e.id === eventId);
    if (!event) {
      throw new Error('Event not found');
    }
    
    event.attendees = Math.max(0, event.attendees - 1);
    return { message: 'Successfully unregistered from event', event };
  },

  async getFeaturedEvents() {
    await delay();
    
    return MOCK_EVENTS.slice(0, 3);
  },

  async getUpcomingEvents() {
    await delay();
    
    return MOCK_EVENTS.filter(e => e.status === 'upcoming')
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  },
};
