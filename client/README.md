# Eventura Frontend (React + Tailwind CSS)

Modern React-based frontend for the Eventura event management platform.

## Tech Stack

- **React 18** - UI library
- **React Router v6** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Fast build tool and dev server
- **Axios** - HTTP client
- **Lucide React** - Icon library
- **React Hot Toast** - Toast notifications
- **date-fns** - Date utilities

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

3. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

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

## Customization

### Tailwind Configuration

Edit `tailwind.config.js` to customize:
- Colors
- Fonts
- Animations
- Breakpoints

### API Integration

Currently using mock data. To connect to a real backend:
1. Update `VITE_API_URL` in `.env`
2. Replace mock services in `src/services/` with real API calls

## Development Tips

1. **Path Aliases**: Use `@/` to import from src directory
   ```javascript
   import Button from '@/components/common/Button';
   ```

2. **Component Structure**: Follow the existing patterns for consistency

3. **Styling**: Use Tailwind utility classes. Custom classes are in `index.css`

4. **State Management**: Use Context for global state, local state for component-specific data

## Building for Production

```bash
npm run build
```

Build output will be in the `dist/` directory.

## License

MIT
