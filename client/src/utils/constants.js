export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const USER_ROLES = {
  STUDENT: 'student',
  ORGANIZER: 'organizer',
  ADMIN: 'admin',
};

export const EVENT_CATEGORIES = [
  'Technology',
  'Sports',
  'Cultural',
  'Academic',
  'Social',
  'Workshop',
  'Seminar',
  'Competition',
  'Other',
];

export const EVENT_STATUS = {
  UPCOMING: 'upcoming',
  ONGOING: 'ongoing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

export const ORGANIZATION_TYPES = [
  'Academic Club',
  'Sports Club',
  'Cultural Society',
  'Technical Society',
  'Social Organization',
  'Other',
];

export const ROUTES = {
  HOME: '/',
  EVENTS: '/events',
  EVENT_DETAILS: '/events/:id',
  ORGANIZATIONS: '/organizations',
  ORGANIZATION_DETAILS: '/organizations/:id',
  MY_EVENTS: '/my-events',
  DASHBOARD: '/dashboard',
  CREATE_EVENT: '/create-event',
  LOGIN: '/login',
  REGISTER: '/register',
  PROFILE: '/profile',
  ABOUT: '/about',
};
