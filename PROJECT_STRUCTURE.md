# Eventura - React + Tailwind CSS Project Structure

## 📋 Overview

This document provides a complete overview of the restructured Eventura project, now built with React and Tailwind CSS.

## 🗂️ Complete Directory Structure

```
eventura/
├── client/                          # React frontend application
│   ├── public/
│   │   └── vite.svg                 # Favicon
│   ├── src/
│   │   ├── assets/
│   │   │   └── images/              # Image assets directory
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Header.jsx       # Navigation header
│   │   │   │   ├── Footer.jsx       # Site footer
│   │   │   │   ├── Button.jsx       # Reusable button component
│   │   │   │   ├── Modal.jsx        # Modal dialog component
│   │   │   │   └── Loader.jsx       # Loading spinner
│   │   │   └── events/
│   │   │       ├── EventCard.jsx    # Event display card
│   │   │       ├── EventList.jsx    # Event grid/list
│   │   │       └── EventFilters.jsx # Search and filter controls
│   │   ├── context/
│   │   │   ├── AuthContext.jsx      # Authentication state
│   │   │   └── EventContext.jsx     # Event management state
│   │   ├── hooks/
│   │   │   ├── useAuth.js           # Auth hook
│   │   │   └── useEvents.js         # Events hook
│   │   ├── pages/
│   │   │   ├── Home.jsx             # Landing page
│   │   │   ├── Events.jsx           # Events listing page
│   │   │   └── Login.jsx            # Login page
│   │   ├── services/
│   │   │   ├── api.js               # Axios instance
│   │   │   ├── authService.js       # Auth API (mock)
│   │   │   ├── eventService.js      # Event API (mock)
│   │   │   └── organizationService.js # Organization API (mock)
│   │   ├── utils/
│   │   │   ├── constants.js         # App constants
│   │   │   └── helpers.js           # Utility functions
│   │   ├── App.jsx                  # Main app component
│   │   ├── main.jsx                 # Entry point
│   │   └── index.css                # Global styles
│   ├── .env.example                 # Environment variables template
│   ├── .eslintrc.cjs                # ESLint configuration
│   ├── .gitignore                   # Git ignore rules
│   ├── index.html                   # HTML template
│   ├── package.json                 # Dependencies
│   ├── postcss.config.js            # PostCSS config
│   ├── tailwind.config.js           # Tailwind config
│   ├── vite.config.js               # Vite config
│   └── README.md                    # Client documentation
├── backend/                         # (Legacy - can be removed)
├── css/                             # (Legacy - can be removed)
├── js/                              # (Legacy - can be removed)
├── photos/                          # (Legacy - can be moved to client/src/assets)
├── *.html                           # (Legacy - can be removed)
├── MIGRATION_COMPLETE.md            # Migration notes
├── PROJECT_STRUCTURE.md             # This file
├── README.md                        # Main project documentation
└── setup-react.sh                   # Quick setup script
```

## 🎯 Key Files Explained

### Configuration Files

- **vite.config.js**: Vite build tool configuration with path aliases
- **tailwind.config.js**: Custom Tailwind theme (colors, fonts, animations)
- **postcss.config.js**: PostCSS with Tailwind and Autoprefixer
- **.eslintrc.cjs**: Linting rules for React
- **package.json**: Project dependencies and scripts

### Core Application Files

- **src/main.jsx**: Application entry point, renders App component
- **src/App.jsx**: Main component with routing setup
- **src/index.css**: Global styles with Tailwind directives and custom utilities

### Context Providers

- **AuthContext**: Manages user authentication state
  - login()
  - register()
  - logout()
  - updateUser()
  - isAuthenticated

- **EventContext**: Manages event data and operations
  - fetchEvents()
  - getEventById()
  - createEvent()
  - updateEvent()
  - deleteEvent()
  - registerForEvent()
  - unregisterFromEvent()

### Services Layer

All services currently use mock data (no backend required):

- **authService**: User authentication
- **eventService**: Event CRUD operations
- **organizationService**: Organization management

### Utility Functions

- **constants.js**: API URLs, routes, categories, status types
- **helpers.js**: Date formatting, text truncation, validation, etc.

## 🎨 Styling System

### Tailwind Custom Theme

```javascript
colors: {
  primary: { ... },    // Blue shades for main brand color
  secondary: { ... },  // Purple shades for accents
}

fonts: {
  sans: 'Inter',       // Body text
  display: 'Poppins',  // Headings
}

animations: {
  'fade-in',
  'slide-up',
}
```

### Custom CSS Classes

Defined in `src/index.css`:

- `.btn` - Base button styles
- `.btn-primary` - Primary button variant
- `.btn-secondary` - Secondary button variant
- `.btn-outline` - Outline button variant
- `.card` - Card container
- `.input` - Form input
- `.badge` - Status badge
- `.badge-primary`, `.badge-success`, etc.

## 🔗 Routing Structure

```javascript
/                    → Home
/events              → Events listing
/events/:id          → Event details (placeholder)
/organizations       → Organizations (placeholder)
/organizations/:id   → Organization details (placeholder)
/my-events           → User's registered events (placeholder)
/dashboard           → User dashboard (placeholder)
/create-event        → Create event form (placeholder)
/login               → Login page
/register            → Register page (placeholder)
/about               → About page (placeholder)
```

## 📦 Dependencies

### Core
- react: ^18.2.0
- react-dom: ^18.2.0
- react-router-dom: ^6.22.0

### UI & Utilities
- lucide-react: ^0.344.0 (icons)
- react-hot-toast: ^2.4.1 (notifications)
- date-fns: ^3.3.1 (date utilities)

### HTTP & Data
- axios: ^1.6.7
- socket.io-client: ^4.8.1 (for future real-time features)

### Styling
- tailwindcss: ^3.4.1
- autoprefixer: ^10.4.17
- postcss: ^8.4.35

### Build Tools
- vite: ^5.1.4
- @vitejs/plugin-react: ^4.2.1

## 🚀 Quick Start Commands

```bash
# Install dependencies
cd client && npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## 🔐 Mock Authentication

Demo users available:

| Email | Password | Role |
|-------|----------|------|
| john@neub.edu.bd | password123 | Student |
| jane@neub.edu.bd | password123 | Organizer |
| admin@neub.edu.bd | password123 | Admin |

## 🎯 Implementation Status

### ✅ Completed
- Project structure and configuration
- Tailwind CSS setup with custom theme
- React Router navigation
- Authentication system (mock)
- Event listing with filters
- Home page with hero and featured events
- Login page
- Reusable UI components
- Context-based state management
- Custom hooks
- Mock data services

### 🔄 To Be Implemented
- Register page
- Event details page
- Event creation/editing
- Organizations listing
- Organization details
- User dashboard
- My Events page
- Profile management
- Protected routes
- Real-time notifications
- Backend integration

## 💡 Development Guidelines

### Component Creation
1. Place in appropriate folder (common, events, organizations, etc.)
2. Use functional components with hooks
3. Apply Tailwind classes for styling
4. Export as default

### State Management
- Use Context for global state
- Use local state for component-specific data
- Create custom hooks for reusable logic

### API Integration
- All API calls go through service files
- Services currently return mock data
- Easy to swap with real API calls later

### Styling
- Use Tailwind utility classes
- Follow existing patterns for consistency
- Use custom classes from index.css when appropriate

## 🧹 Cleanup Recommendations

Optional files/folders to remove:

1. **Legacy Frontend**
   - All `*.html` files in root
   - `/css/` directory
   - `/js/` directory (except backend-related)
   - `styles.css`

2. **Backend** (if not needed)
   - `/backend/` directory
   - `start-server.sh`

3. **Assets**
   - Move `/photos/` to `/client/src/assets/images/`

## 📚 Resources

- [React Documentation](https://react.dev/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Vite Documentation](https://vitejs.dev/)
- [React Router Docs](https://reactrouter.com/)
- [Lucide Icons](https://lucide.dev/)

## 🤝 Contributing

When adding new features:

1. Create components following existing patterns
2. Add routes in `App.jsx`
3. Create service methods for data operations
4. Use Context when state needs to be shared
5. Create custom hooks for reusable logic
6. Follow Tailwind styling conventions

---

Last Updated: November 2025
