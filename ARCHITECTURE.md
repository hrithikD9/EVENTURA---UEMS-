# Eventura Architecture Diagram

## Application Flow

```
┌─────────────────────────────────────────────────────────────┐
│                         Browser                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                    React App                          │  │
│  │                                                       │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │  │
│  │  │   Header    │  │   Router    │  │   Footer    │  │  │
│  │  └─────────────┘  └──────┬──────┘  └─────────────┘  │  │
│  │                           │                          │  │
│  │         ┌─────────────────┼─────────────────┐        │  │
│  │         │                 │                 │        │  │
│  │    ┌────▼────┐      ┌────▼────┐      ┌────▼────┐    │  │
│  │    │  Home   │      │ Events  │      │  Login  │    │  │
│  │    │  Page   │      │  Page   │      │  Page   │    │  │
│  │    └────┬────┘      └────┬────┘      └────┬────┘    │  │
│  │         │                │                 │        │  │
│  │         └────────────────┼─────────────────┘        │  │
│  │                          │                          │  │
│  │         ┌────────────────┴────────────────┐         │  │
│  │         │        Components                │         │  │
│  │         │  EventCard, EventList, Filters   │         │  │
│  │         └────────────────┬────────────────┘         │  │
│  │                          │                          │  │
│  │         ┌────────────────┴────────────────┐         │  │
│  │         │         Context                  │         │  │
│  │         │  AuthContext, EventContext       │         │  │
│  │         └────────────────┬────────────────┘         │  │
│  │                          │                          │  │
│  │         ┌────────────────┴────────────────┐         │  │
│  │         │         Services                 │         │  │
│  │         │  authService, eventService       │         │  │
│  │         └────────────────┬────────────────┘         │  │
│  │                          │                          │  │
│  │         ┌────────────────┴────────────────┐         │  │
│  │         │        Mock Data                 │         │  │
│  │         │  (In-memory storage)             │         │  │
│  │         └──────────────────────────────────┘         │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Component Hierarchy

```
App
├── Router
│   ├── Header
│   │   ├── Logo
│   │   ├── Navigation
│   │   └── User Menu
│   │
│   ├── Routes
│   │   ├── Home
│   │   │   ├── Hero Section
│   │   │   ├── Features Grid
│   │   │   └── EventList (Featured)
│   │   │
│   │   ├── Events
│   │   │   ├── Page Header
│   │   │   ├── EventFilters
│   │   │   │   ├── Search Input
│   │   │   │   ├── Category Select
│   │   │   │   └── Status Select
│   │   │   └── EventList
│   │   │       └── EventCard (multiple)
│   │   │           ├── Image
│   │   │           ├── Title
│   │   │           ├── Description
│   │   │           ├── Date/Time
│   │   │           ├── Location
│   │   │           └── Attendee Count
│   │   │
│   │   └── Login
│   │       ├── Logo
│   │       ├── Demo Credentials
│   │       ├── Form
│   │       │   ├── Email Input
│   │       │   ├── Password Input
│   │       │   └── Submit Button
│   │       └── Sign Up Link
│   │
│   └── Footer
│       ├── Brand Section
│       ├── Quick Links
│       ├── Support Links
│       └── Contact Info
│
└── Providers
    ├── AuthProvider
    └── EventProvider
```

## Data Flow

```
┌──────────┐
│   User   │
│  Action  │
└────┬─────┘
     │
     ▼
┌────────────┐
│ Component  │
└────┬───────┘
     │
     ▼
┌────────────┐
│   Hook     │ (useAuth, useEvents)
└────┬───────┘
     │
     ▼
┌────────────┐
│  Context   │ (AuthContext, EventContext)
└────┬───────┘
     │
     ▼
┌────────────┐
│  Service   │ (authService, eventService)
└────┬───────┘
     │
     ▼
┌────────────┐
│ Mock Data  │ (Arrays of objects)
└────┬───────┘
     │
     ▼
┌────────────┐
│  Response  │
└────┬───────┘
     │
     ▼
┌────────────┐
│   Update   │
│   State    │
└────┬───────┘
     │
     ▼
┌────────────┐
│  Re-render │
│ Component  │
└────────────┘
```

## State Management

```
┌─────────────────────────────────────────────┐
│          Global State (Context)             │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │        AuthContext                    │  │
│  │  - user: Object | null                │  │
│  │  - isAuthenticated: boolean           │  │
│  │  - loading: boolean                   │  │
│  │  - login()                            │  │
│  │  - logout()                           │  │
│  │  - register()                         │  │
│  │  - updateUser()                       │  │
│  └──────────────────────────────────────┘  │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │        EventContext                   │  │
│  │  - events: Array                      │  │
│  │  - featuredEvents: Array              │  │
│  │  - loading: boolean                   │  │
│  │  - filters: Object                    │  │
│  │  - fetchEvents()                      │  │
│  │  - getEventById()                     │  │
│  │  - createEvent()                      │  │
│  │  - updateEvent()                      │  │
│  │  - deleteEvent()                      │  │
│  │  - registerForEvent()                 │  │
│  │  - unregisterFromEvent()              │  │
│  │  - updateFilters()                    │  │
│  └──────────────────────────────────────┘  │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│        Local State (useState)               │
│  - Form inputs                              │
│  - UI toggles (modals, menus)               │
│  - Component-specific data                  │
└─────────────────────────────────────────────┘
```

## Routing Structure

```
┌─────────────────────────────────────────┐
│            React Router                 │
│                                         │
│  /                   → Home             │
│  /events             → Events           │
│  /events/:id         → EventDetails*    │
│  /organizations      → Organizations*   │
│  /organizations/:id  → OrgDetails*      │
│  /my-events          → MyEvents*        │
│  /dashboard          → Dashboard*       │
│  /create-event       → CreateEvent*     │
│  /login              → Login            │
│  /register           → Register*        │
│  /about              → About*           │
│  *                   → NotFound         │
│                                         │
│  * = Placeholder (to be implemented)    │
└─────────────────────────────────────────┘
```

## Service Layer Architecture

```
┌────────────────────────────────────────────┐
│              Services                      │
│                                            │
│  ┌──────────────────────────────────────┐ │
│  │        authService.js                 │ │
│  │  ┌────────────────────────────────┐  │ │
│  │  │ MOCK_USERS = [...]              │  │ │
│  │  └────────────────────────────────┘  │ │
│  │  - login(email, password)            │ │
│  │  - register(userData)                │ │
│  │  - logout()                          │ │
│  │  - getCurrentUser()                  │ │
│  │  - isAuthenticated()                 │ │
│  │  - updateProfile(userData)           │ │
│  └──────────────────────────────────────┘ │
│                                            │
│  ┌──────────────────────────────────────┐ │
│  │        eventService.js                │ │
│  │  ┌────────────────────────────────┐  │ │
│  │  │ MOCK_EVENTS = [...]             │  │ │
│  │  └────────────────────────────────┘  │ │
│  │  - getAllEvents(filters)             │ │
│  │  - getEventById(id)                  │ │
│  │  - createEvent(eventData)            │ │
│  │  - updateEvent(id, data)             │ │
│  │  - deleteEvent(id)                   │ │
│  │  - registerForEvent(eventId, userId) │ │
│  │  - unregisterFromEvent(...)          │ │
│  │  - getFeaturedEvents()               │ │
│  │  - getUpcomingEvents()               │ │
│  └──────────────────────────────────────┘ │
│                                            │
│  ┌──────────────────────────────────────┐ │
│  │    organizationService.js             │ │
│  │  ┌────────────────────────────────┐  │ │
│  │  │ MOCK_ORGANIZATIONS = [...]      │  │ │
│  │  └────────────────────────────────┘  │ │
│  │  - getAllOrganizations(filters)      │ │
│  │  - getOrganizationById(id)           │ │
│  │  - getOrganizationBySlug(slug)       │ │
│  │  - createOrganization(orgData)       │ │
│  │  - updateOrganization(id, data)      │ │
│  │  - getTopOrganizations()             │ │
│  │  - joinOrganization(orgId, userId)   │ │
│  │  - leaveOrganization(...)            │ │
│  └──────────────────────────────────────┘ │
└────────────────────────────────────────────┘
```

## Styling System

```
┌────────────────────────────────────────────┐
│          Tailwind CSS                      │
│                                            │
│  ┌──────────────────────────────────────┐ │
│  │      tailwind.config.js               │ │
│  │  - Custom colors (primary, secondary) │ │
│  │  - Custom fonts (Inter, Poppins)     │ │
│  │  - Custom animations                 │ │
│  │  - Custom breakpoints                │ │
│  └──────────────────────────────────────┘ │
│              ↓                             │
│  ┌──────────────────────────────────────┐ │
│  │         index.css                     │ │
│  │  @tailwind base                       │ │
│  │  @tailwind components                 │ │
│  │  @tailwind utilities                  │ │
│  │                                       │ │
│  │  Custom component classes:            │ │
│  │  - .btn, .btn-primary, .btn-outline  │ │
│  │  - .card                              │ │
│  │  - .input                             │ │
│  │  - .badge, .badge-primary            │ │
│  └──────────────────────────────────────┘ │
│              ↓                             │
│  ┌──────────────────────────────────────┐ │
│  │       Component Styling               │ │
│  │  className="btn btn-primary"          │ │
│  │  className="card hover:shadow-xl"     │ │
│  │  className="flex items-center gap-2"  │ │
│  └──────────────────────────────────────┘ │
└────────────────────────────────────────────┘
```

## Build Process

```
┌────────────────┐
│  Source Code   │
│   (src/*.jsx)  │
└───────┬────────┘
        │
        ▼
┌────────────────┐
│      Vite      │
│  - Fast HMR    │
│  - Bundling    │
│  - Optimization│
└───────┬────────┘
        │
        ├──────────┐
        │          │
        ▼          ▼
┌─────────────┐  ┌─────────────┐
│ Development │  │ Production  │
│   Server    │  │    Build    │
│ (Port 3000) │  │  (dist/)    │
└─────────────┘  └─────────────┘
```

---

This architecture provides:
- **Clear separation of concerns**
- **Reusable components**
- **Centralized state management**
- **Mock data for development**
- **Easy to extend and maintain**
