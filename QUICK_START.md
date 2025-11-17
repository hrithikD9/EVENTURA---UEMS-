# Eventura - Quick Start Guide 🚀

## Running the Application

### Start Development Server:
```bash
cd client
npm run dev
```

**URL:** http://localhost:3000/

---

## Demo Accounts

```
📧 john@neub.edu.bd | 🔑 password123
📧 jane@neub.edu.bd | 🔑 password123  
📧 admin@neub.edu.bd | 🔑 admin123
```

---

## Page Routes

| Page | URL | Auth Required |
|------|-----|---------------|
| Home | `/` | ❌ No |
| Events List | `/events` | ❌ No |
| Event Details | `/events/:id` | ❌ No |
| Organizations | `/organizations` | ❌ No |
| Org Details | `/organizations/:id` | ❌ No |
| Login | `/login` | ❌ No |
| Register | `/register` | ❌ No |
| My Events | `/my-events` | ✅ Yes |
| Dashboard | `/dashboard` | ✅ Yes |
| Create Event | `/create-event` | ✅ Yes |

---

## Key Features

### ✅ Completed:
- [x] User Registration & Login
- [x] Event Browsing & Search
- [x] Event Details & Registration
- [x] Organization Profiles
- [x] My Events Dashboard
- [x] Protected Routes
- [x] Responsive Design
- [x] Form Validation
- [x] Toast Notifications

### 🚧 Placeholders:
- [ ] Dashboard (placeholder)
- [ ] Create Event (placeholder)
- [ ] About Page (placeholder)

---

## Quick Test Workflow

1. **Open App:** http://localhost:3000/
2. **Browse Events:** Click "Events" in navbar
3. **View Event:** Click any event card
4. **Try Register:** Click "Register Now" → Redirected to login
5. **Login:** Use john@neub.edu.bd / password123
6. **Register for Event:** Click "Register Now" again → Success!
7. **View My Events:** Click "My Events" in navbar
8. **See Dashboard:** View your registered events

---

## Project Structure

```
client/
├── src/
│   ├── pages/              # Route pages
│   │   ├── Home.jsx
│   │   ├── Events.jsx
│   │   ├── EventDetails.jsx
│   │   ├── Organizations.jsx
│   │   ├── OrganizationDetails.jsx
│   │   ├── MyEvents.jsx
│   │   ├── Login.jsx
│   │   └── Register.jsx
│   ├── components/         # Reusable components
│   │   ├── common/
│   │   ├── events/
│   │   └── organizations/
│   ├── context/            # State management
│   ├── services/           # API services (mock data)
│   ├── hooks/              # Custom hooks
│   └── utils/              # Helper functions
```

---

## Common Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

---

## Troubleshooting

### Server won't start:
```bash
cd client
rm -rf node_modules
npm install
npm run dev
```

### Login not working:
- Check credentials: john@neub.edu.bd / password123
- Check browser console for errors
- Clear localStorage: `localStorage.clear()`

### Events not showing:
- Refresh page
- Check browser console
- Restart dev server

---

## Tech Stack

- **Frontend:** React 18.2.0
- **Build Tool:** Vite 5.1.4
- **Styling:** Tailwind CSS 3.4.1
- **Routing:** React Router v6.22.0
- **Icons:** Lucide React
- **Notifications:** React Hot Toast
- **HTTP Client:** Axios

---

## File Reference

### Authentication:
- `src/context/AuthContext.jsx` - Auth state
- `src/services/authService.js` - Mock auth API
- `src/components/common/ProtectedRoute.jsx` - Route guard

### Events:
- `src/context/EventContext.jsx` - Event state
- `src/services/eventService.js` - Mock event API
- `src/pages/EventDetails.jsx` - Event details page
- `src/pages/MyEvents.jsx` - User's events dashboard

### Organizations:
- `src/services/organizationService.js` - Mock org API
- `src/pages/Organizations.jsx` - Org listing
- `src/pages/OrganizationDetails.jsx` - Org profile

---

**Need help? Check IMPLEMENTATION_COMPLETE.md for detailed documentation!** 📚
