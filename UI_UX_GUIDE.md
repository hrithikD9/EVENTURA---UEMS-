# 🎨 Eventura UI/UX Guide

## Color Palette

### Primary Color (Blue)
```
#0ea5e9 - Main brand color
Used for: Buttons, links, highlights, icons
```

### Secondary Color (Purple)
```
#d946ef - Accent color
Used for: Special elements, badges, hover states
```

### Neutral Colors
```
White (#ffffff)  - Backgrounds, cards
Gray 50          - Page backgrounds
Gray 900         - Text
```

## Typography

### Font Families
- **Headings**: Poppins (bold, display)
- **Body**: Inter (clean, readable)

### Font Sizes
```
4xl: Hero headings
3xl: Page titles
2xl: Section headings
xl:  Card titles
lg:  Subheadings
base: Body text
sm:  Small text, labels
```

## Component Library

### Buttons

```jsx
// Primary Button (Blue background)
<button className="btn btn-primary">
  Primary Action
</button>

// Secondary Button (Gray background)
<button className="btn btn-secondary">
  Secondary Action
</button>

// Outline Button (Border only)
<button className="btn btn-outline">
  Outline Action
</button>

// Danger Button (Red background)
<button className="btn" variant="danger">
  Delete
</button>
```

**Visual:**
```
┌─────────────────┐
│ Primary Action  │  ← Blue (#0ea5e9)
└─────────────────┘

┌─────────────────┐
│ Secondary Action│  ← Gray (#e5e7eb)
└─────────────────┘

┌─────────────────┐
│ Outline Action  │  ← Border only
└─────────────────┘
```

### Cards

```jsx
<div className="card">
  <img src="..." className="w-full h-48 object-cover" />
  <div className="p-6">
    <h3 className="text-xl font-semibold">Card Title</h3>
    <p className="text-gray-600">Card content here...</p>
  </div>
</div>
```

**Visual:**
```
┌──────────────────────────┐
│                          │
│        [Image]           │
│                          │
├──────────────────────────┤
│  Card Title              │
│  Card content here...    │
│                          │
└──────────────────────────┘
```

### Input Fields

```jsx
<input 
  type="text" 
  className="input" 
  placeholder="Enter text..."
/>
```

**Visual:**
```
┌────────────────────────────┐
│ Enter text...              │
└────────────────────────────┘
```

### Badges

```jsx
<span className="badge badge-primary">Primary</span>
<span className="badge badge-success">Success</span>
<span className="badge badge-warning">Warning</span>
<span className="badge badge-danger">Danger</span>
```

**Visual:**
```
[Primary] [Success] [Warning] [Danger]
  Blue      Green     Yellow     Red
```

## Page Layouts

### Home Page Structure

```
┌─────────────────────────────────────────┐
│           Header (Sticky)                │
├─────────────────────────────────────────┤
│                                          │
│          Hero Section (Blue BG)          │
│        Welcome to Eventura               │
│     [Explore Events] [Organizations]     │
│                                          │
├─────────────────────────────────────────┤
│          Features Section (Gray BG)      │
│   [Icon] Discover    [Icon] Connect     │
│   [Icon] Track                           │
├─────────────────────────────────────────┤
│         Featured Events (White BG)       │
│   [Event Card] [Event Card] [Event Card] │
│                                          │
├─────────────────────────────────────────┤
│              CTA Section (Blue BG)       │
│         Ready to Get Started?            │
│         [Create Account]                 │
│                                          │
├─────────────────────────────────────────┤
│              Footer (Dark BG)            │
└─────────────────────────────────────────┘
```

### Events Page Structure

```
┌─────────────────────────────────────────┐
│           Header (Sticky)                │
├─────────────────────────────────────────┤
│   Discover Events                        │
│   Find and register for events           │
├─────────────────────────────────────────┤
│   [Search] [Category ▼] [Status ▼]     │
├─────────────────────────────────────────┤
│   ┌────────┐ ┌────────┐ ┌────────┐    │
│   │ Event  │ │ Event  │ │ Event  │    │
│   │ Card 1 │ │ Card 2 │ │ Card 3 │    │
│   └────────┘ └────────┘ └────────┘    │
│   ┌────────┐ ┌────────┐ ┌────────┐    │
│   │ Event  │ │ Event  │ │ Event  │    │
│   │ Card 4 │ │ Card 5 │ │ Card 6 │    │
│   └────────┘ └────────┘ └────────┘    │
├─────────────────────────────────────────┤
│              Footer                      │
└─────────────────────────────────────────┘
```

### Login Page Structure

```
┌─────────────────────────────────────────┐
│           Header (Sticky)                │
├─────────────────────────────────────────┤
│                                          │
│        ┌──────────────────────┐         │
│        │  Welcome Back        │         │
│        │  Sign in to account  │         │
│        ├──────────────────────┤         │
│        │ Demo Credentials Box │         │
│        ├──────────────────────┤         │
│        │ [📧] Email           │         │
│        │ [🔒] Password        │         │
│        │ [☑] Remember me      │         │
│        │ [Sign In Button]     │         │
│        │ Don't have account?  │         │
│        └──────────────────────┘         │
│                                          │
├─────────────────────────────────────────┤
│              Footer                      │
└─────────────────────────────────────────┘
```

## Event Card Anatomy

```
┌────────────────────────────────┐
│                                │
│        [Event Image]           │ ← 48h height
│  [Category]         [Status]   │ ← Badges
│                                │
├────────────────────────────────┤
│  Event Title                   │ ← Bold, large
│  Event description goes here...│ ← Gray text
│                                │
│  📅 Dec 25, 2024  🕒 2:00 PM  │ ← Icons + text
│  📍 Auditorium Hall A          │
│                                │
│  👥 45/100 attending           │
│              CSE Society →     │ ← Organizer
└────────────────────────────────┘
```

## Navigation Header

### Desktop View
```
┌─────────────────────────────────────────────────────┐
│ 📅 Eventura   Home Events Orgs About   Login Signup│
└─────────────────────────────────────────────────────┘
```

### Mobile View
```
┌────────────────────────────┐
│ 📅 Eventura          ☰     │
└────────────────────────────┘
     ↓ (When menu open)
┌────────────────────────────┐
│ 📅 Eventura          ✕     │
├────────────────────────────┤
│ Home                       │
│ Events                     │
│ Organizations              │
│ About                      │
├────────────────────────────┤
│ Login                      │
│ Sign Up                    │
└────────────────────────────┘
```

## Footer Structure

```
┌─────────────────────────────────────────────────────┐
│  📅 Eventura              Quick Links    Support    │
│  Modern event             • Events      • Help      │
│  management platform      • Orgs        • Contact   │
│  🔗 🔗 🔗                 • About       • Privacy   │
│                           • My Events   • Terms     │
│                                                      │
│  📍 North East University Bangladesh                │
│  📧 info@eventura.edu                               │
│  📞 +880 1234-567890                                │
├─────────────────────────────────────────────────────┤
│  © 2025 Eventura. All rights reserved.              │
└─────────────────────────────────────────────────────┘
```

## Responsive Breakpoints

```
Mobile      <  768px   Single column, stacked
Tablet      >= 768px   2 columns
Desktop     >= 1024px  3 columns
Large       >= 1280px  Full width (max 1280px)
```

## Animation Effects

### Fade In
```css
/* Used for page loads */
opacity: 0 → 1
duration: 0.5s
```

### Slide Up
```css
/* Used for modals */
transform: translateY(20px) → translateY(0)
opacity: 0 → 1
duration: 0.3s
```

### Hover Effects
```css
/* Cards */
shadow-md → shadow-xl
scale: 1 → 1.05

/* Buttons */
background lightens
transition: 0.2s
```

## Icon Usage

### Lucide React Icons
```jsx
import { Calendar, User, Mail, Clock } from 'lucide-react';

<Calendar className="h-5 w-5 text-primary-600" />
```

**Common Icons:**
- 📅 `Calendar` - Events, dates
- 🕒 `Clock` - Time
- 📍 `MapPin` - Location
- 👥 `Users` - Attendees, members
- 📧 `Mail` - Email
- 📞 `Phone` - Phone
- 👤 `User` - Profile
- 🔍 `Search` - Search
- ⚙️ `Settings` - Settings
- ❌ `X` - Close
- ☰ `Menu` - Mobile menu
- ✓ `Check` - Success
- ✏️ `Edit` - Edit
- 🗑️ `Trash` - Delete

## Spacing System

### Padding/Margin Scale (Tailwind)
```
p-0   → 0px
p-1   → 4px
p-2   → 8px
p-4   → 16px
p-6   → 24px
p-8   → 32px
p-12  → 48px
```

### Common Patterns
```jsx
// Card padding
className="p-6"

// Page container
className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"

// Section spacing
className="py-16"

// Element gaps
className="space-y-4"
className="gap-6"
```

## Loading States

### Loader Component
```
     ⟳
   Loading...
```

### Skeleton Screens (To be implemented)
```
┌────────────────────┐
│ ████████████       │ ← Animated shimmer
│ ████████           │
│ ████               │
└────────────────────┘
```

## Empty States

```
     📅
  No events found
  Try adjusting your filters
```

## Toast Notifications

### Success
```
┌──────────────────────────┐
│ ✓ Event created!         │
└──────────────────────────┘
```

### Error
```
┌──────────────────────────┐
│ ✕ Failed to create event │
└──────────────────────────┘
```

### Position: Top Right
### Duration: 3-4 seconds

## Design Principles

1. **Consistency**: Use existing components
2. **Simplicity**: Clean, uncluttered layouts
3. **Responsive**: Mobile-first approach
4. **Accessible**: Proper contrast, labels
5. **Fast**: Loading states for all actions
6. **Feedback**: Toast for every action

## Best Practices

### DO ✅
- Use Tailwind utility classes
- Follow existing component patterns
- Add hover states to interactive elements
- Include loading states
- Provide feedback for actions
- Make responsive (mobile-first)

### DON'T ❌
- Create custom CSS (use Tailwind)
- Mix different design patterns
- Forget mobile view
- Skip loading states
- Ignore accessibility
- Use too many colors

---

## UI Component Checklist

When creating a new component, ensure:

- [ ] Responsive (mobile, tablet, desktop)
- [ ] Loading state
- [ ] Empty state (if applicable)
- [ ] Error state (if applicable)
- [ ] Hover effects
- [ ] Focus states (keyboard navigation)
- [ ] Consistent spacing
- [ ] Proper icons
- [ ] Toast feedback
- [ ] Follows color scheme

---

**Remember**: The goal is a clean, modern, professional UI that's easy to use and beautiful to look at! 🎨
