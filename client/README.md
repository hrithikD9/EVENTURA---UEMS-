## Internal Project Structure

```
src/
├── assets/          # Images, fonts, and other static assets
├── components/      # Reusable React components
│   ├── common/      # Shared components (Header, Footer, Button, etc.)
│   ├── events/      # Event-related components
│   ├── organizations/ # Organization components
│   ├── auth/        # Authentication components
│   └── dashboard/   # Dashboard components
├── context/         # React Context providers
├── hooks/           # Custom React hooks
├── pages/           # Page components
├── services/        # API services (currently with mock data)
├── utils/           # Utility functions and constants
├── App.jsx          # Main App component with routing
├── main.jsx         # Entry point
└── index.css        # Global styles with Tailwind

## Features

### Implemented
- ✅ Home page with hero and featured events
- ✅ Events listing with filters
- ✅ Login page with authentication
- ✅ Responsive header and footer
- ✅ Mock data services
- ✅ Context-based state management
- ✅ Custom hooks for auth and events
- ✅ Reusable UI components
- ✅ Toast notifications

### Coming Soon
- 🔄 Register page
- 🔄 Event details page
- 🔄 Organizations listing and details
- 🔄 User dashboard
- 🔄 Create/edit event forms
- 🔄 Profile management
- 🔄 Real-time socket integration

## Mock Authentication

For testing, use these credentials:
- **Email:** john@neub.edu.bd
- **Password:** password123

Other demo users:
- jane@neub.edu.bd (Organizer)
- admin@neub.edu.bd (Admin)

