# Eventura Quick Reference Cheat Sheet 🚀

## 🏃 Quick Start

```bash
cd client
npm install
npm run dev
# Open http://localhost:3000
```

## 🔑 Demo Login
```
Email: john@neub.edu.bd
Password: password123
```

## 📁 Key Directories

| Path | Purpose |
|------|---------|
| `src/components/common/` | Reusable UI components |
| `src/components/events/` | Event-specific components |
| `src/pages/` | Page components |
| `src/context/` | State management |
| `src/services/` | API services (mock) |
| `src/utils/` | Helper functions |
| `src/assets/` | Images, icons, etc. |

## 🎨 Tailwind Utilities

### Colors
```jsx
// Primary (Blue)
className="bg-primary-600 text-primary-600"

// Secondary (Purple)
className="bg-secondary-600 text-secondary-600"

// Gray
className="bg-gray-50 text-gray-900"
```

### Custom Classes
```jsx
// Buttons
className="btn btn-primary"
className="btn btn-secondary"
className="btn btn-outline"

// Cards
className="card"

// Inputs
className="input"

// Badges
className="badge badge-primary"
className="badge badge-success"
className="badge badge-warning"
className="badge badge-danger"
```

### Layout
```jsx
// Flex
className="flex items-center justify-between gap-4"

// Grid
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"

// Spacing
className="p-4 px-6 py-8 m-4 mx-auto"

// Responsive
className="w-full md:w-1/2 lg:w-1/3"
```

## 🪝 Custom Hooks

### useAuth
```jsx
import { useAuth } from '@/hooks/useAuth';

const { user, isAuthenticated, login, logout } = useAuth();

// Login
await login(email, password);

// Logout
logout();

// Check auth
if (isAuthenticated) { /* ... */ }
```

### useEvents
```jsx
import { useEvents } from '@/hooks/useEvents';

const { 
  events, 
  loading, 
  filters,
  fetchEvents,
  updateFilters 
} = useEvents();

// Update filters
updateFilters({ category: 'Technology', search: 'AI' });

// Register for event
await registerForEvent(eventId, userId);
```

## 🔄 Context Usage

### With Provider
```jsx
// Already set up in App.jsx
<AuthProvider>
  <EventProvider>
    {/* Your components */}
  </EventProvider>
</AuthProvider>
```

### Without Provider (Direct)
```jsx
import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';

const { user, login } = useContext(AuthContext);
```

## 🛣️ React Router

### Navigation
```jsx
import { Link, useNavigate } from 'react-router-dom';

// Link component
<Link to="/events">Events</Link>

// Programmatic navigation
const navigate = useNavigate();
navigate('/events');
navigate('/events/123');
navigate(-1); // Go back
```

### Route Parameters
```jsx
import { useParams } from 'react-router-dom';

const { id } = useParams(); // From /events/:id
```

## 📝 Creating Components

### Functional Component Template
```jsx
import { useState } from 'react';

const ComponentName = ({ prop1, prop2 }) => {
  const [state, setState] = useState(initialValue);

  const handleAction = () => {
    // Logic here
  };

  return (
    <div className="container">
      {/* JSX here */}
    </div>
  );
};

export default ComponentName;
```

### Component with Context
```jsx
import { useAuth } from '@/hooks/useAuth';

const MyComponent = () => {
  const { user, isAuthenticated } = useAuth();

  return (
    <div>
      {isAuthenticated ? (
        <p>Welcome, {user.name}!</p>
      ) : (
        <p>Please login</p>
      )}
    </div>
  );
};
```

## 🎯 Common Patterns

### Loading State
```jsx
{loading ? (
  <Loader size="lg" />
) : (
  <div>Content</div>
)}
```

### Conditional Rendering
```jsx
{isAuthenticated && <Button>Create Event</Button>}

{user?.role === 'organizer' && (
  <Link to="/dashboard">Dashboard</Link>
)}
```

### List Rendering
```jsx
{events.map((event) => (
  <EventCard key={event.id} event={event} />
))}
```

### Form Handling
```jsx
const [formData, setFormData] = useState({
  email: '',
  password: ''
});

const handleChange = (e) => {
  setFormData({
    ...formData,
    [e.target.name]: e.target.value
  });
};

const handleSubmit = async (e) => {
  e.preventDefault();
  await login(formData.email, formData.password);
};

<form onSubmit={handleSubmit}>
  <input
    name="email"
    value={formData.email}
    onChange={handleChange}
  />
</form>
```

## 🔔 Toast Notifications

```jsx
import toast from 'react-hot-toast';

// Success
toast.success('Event created!');

// Error
toast.error('Failed to create event');

// Loading
const toastId = toast.loading('Creating event...');
toast.success('Done!', { id: toastId });

// Custom
toast('Custom message', {
  duration: 4000,
  position: 'top-center',
});
```

## 🎨 Icons (Lucide React)

```jsx
import { Calendar, User, Mail, Clock } from 'lucide-react';

<Calendar className="h-5 w-5 text-primary-600" />
<User className="h-6 w-6" />
```

Common icons:
- `Calendar`, `Clock`, `MapPin`, `Users`
- `Mail`, `Phone`, `User`
- `Menu`, `X`, `Search`, `Filter`
- `LogOut`, `LogIn`, `Eye`, `EyeOff`
- `Plus`, `Edit`, `Trash`, `Check`

## 📅 Date Formatting

```jsx
import { formatDate, formatDateTime, getTimeAgo } from '@/utils/helpers';

formatDate('2024-12-25')        // "December 25, 2024"
formatDateTime('2024-12-25')    // "December 25, 2024 at 2:00 PM"
getTimeAgo('2024-12-20')        // "5 days ago"
```

## 🔧 Common Imports

```jsx
// React
import { useState, useEffect, useContext } from 'react';

// Router
import { Link, useNavigate, useParams } from 'react-router-dom';

// Custom
import { useAuth } from '@/hooks/useAuth';
import { useEvents } from '@/hooks/useEvents';
import Button from '@/components/common/Button';
import Loader from '@/components/common/Loader';

// Utils
import { formatDate } from '@/utils/helpers';
import { ROUTES, EVENT_CATEGORIES } from '@/utils/constants';

// Toast
import toast from 'react-hot-toast';

// Icons
import { Calendar, User } from 'lucide-react';
```

## 📦 NPM Commands

```bash
# Install
npm install
npm install <package-name>

# Dev
npm run dev

# Build
npm run build
npm run preview

# Quality
npm run lint

# Update
npm update
npm outdated
```

## 🐛 Debugging Tips

### React DevTools
```jsx
// Add to component
console.log({ user, events, loading });

// Inspect props
console.log('Props:', { prop1, prop2 });
```

### Network
```jsx
// In service files
console.log('API Call:', { method, url, data });
```

### State
```jsx
useEffect(() => {
  console.log('State changed:', state);
}, [state]);
```

## 🎯 File Naming

- Components: `PascalCase.jsx` (EventCard.jsx)
- Hooks: `camelCase.js` (useAuth.js)
- Utils: `camelCase.js` (helpers.js)
- Constants: `camelCase.js` (constants.js)
- Styles: `kebab-case.css` (index.css)

## 📱 Responsive Breakpoints

```jsx
// Mobile first
className="text-sm md:text-base lg:text-lg"

// Breakpoints
sm:  640px   // Small devices
md:  768px   // Medium devices
lg:  1024px  // Large devices
xl:  1280px  // Extra large
2xl: 1536px  // 2X Extra large
```

## 🎨 Color Reference

### Primary (Blue)
- 50: #f0f9ff
- 100: #e0f2fe
- 500: #0ea5e9 ⭐
- 600: #0284c7
- 900: #0c4a6e

### Secondary (Purple)
- 50: #fdf4ff
- 100: #fae8ff
- 500: #d946ef ⭐
- 600: #c026d3
- 900: #701a75

## 🚀 Build & Deploy

```bash
# Build
cd client
npm run build

# Output directory
# dist/

# Deploy to Vercel
vercel

# Deploy to Netlify
netlify deploy --prod

# Deploy to GitHub Pages
npm run build
# Upload dist/ folder
```

## 📚 Documentation Files

- `README.md` - Project overview
- `COMPLETE_SUMMARY.md` - Migration summary
- `PROJECT_STRUCTURE.md` - Detailed structure
- `ARCHITECTURE.md` - Architecture diagrams
- `CHEAT_SHEET.md` - This file!

---

**Pro Tip:** Keep this file open while developing! 💡
