# Eventura - University Event Management System

Eventura is a web-based platform for event management, focused on university clubs, societies, and organizations.

## Features

### User Roles

- **Student**
  - Explore and join events
  - Explore and follow organizations

- **Organizer**
  - Create and manage an organization profile
  - Create and manage multiple events
  - Complete onboarding to provide organization details

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Express.js, Node.js
- **Database**: MongoDB

## Setup Instructions

### Prerequisites

- Node.js and npm
- MongoDB

### Backend Setup

1. Navigate to the backend folder:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file with the following variables:
   ```
   MONGO_URI=mongodb://localhost:27017/eventura
   JWT_SECRET=your_secret_key
   PORT=5000
   ```

4. Start the development server:
   ```
   npm run dev
   ```

### Frontend Setup

The frontend is built with vanilla HTML, CSS, and JavaScript. Simply open the HTML files in your browser.

For local development, you can use any local server like Live Server for VS Code.

## API Endpoints

### Authentication
- `POST /api/users/register` - Register a new user (student/organizer)
- `POST /api/users/login` - User login
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/onboarding` - Complete organizer onboarding

### Events
- `GET /api/events` - Get all events
- `POST /api/events` - Create a new event (organizer only)
- `GET /api/events/:id` - Get event by ID
- `PUT /api/events/:id/join` - Join an event (student only)
- `GET /api/events/myevents` - Get organizer's events

### Organizations
- `GET /api/organizations` - Get all organizations
- `GET /api/organizations/:id` - Get organization by ID
- `PUT /api/organizations/:id/follow` - Follow an organization (student only)
5. [Page Descriptions](#page-descriptions)
   - [Authentication Pages](#authentication-pages)
   - [Dashboard Pages](#dashboard-pages)
   - [Event Pages](#event-pages)
   - [Organization Pages](#organization-pages)
   - [Administrative Pages](#administrative-pages)
   - [Profile Pages](#profile-pages)
   - [Payment Pages](#payment-pages)
6. [User Flows](#user-flows)
7. [Responsive Design Guidelines](#responsive-design-guidelines)
8. [Dark Mode Implementation](#dark-mode-implementation)

---

## Design Principles

### 1. Clarity
All interfaces should be intuitive and self-explanatory, with clear labeling and guidance through complex processes.

### 2. Consistency
Maintain consistent design patterns, terminology, and interaction models across all pages to reduce cognitive load.

### 3. Efficiency
Minimize steps required to complete common tasks, and provide shortcuts for experienced users.

### 4. Accessibility
Ensure all interfaces are accessible to users with disabilities, following WCAG 2.1 AA standards.

### 5. Engagement
Create visually appealing interfaces that encourage participation and exploration of events.

### 6. Minimalism
Embrace space, simplicity and focused content presentation to reduce visual clutter and cognitive load.

### 7. Modern Aesthetics
Implement contemporary design trends including subtle animations, depth effects, and immersive visuals.

---

## Color Palette & Typography

### Dark Mode Primary Palette
- Background Dark (#121212): Primary background color
- Surface Dark (#1E1E1E): Card and surface elements
- Primary Blue (#2196F3): Used for primary buttons, links, and key UI elements
- Secondary Teal (#4DB6AC): Used for secondary actions and accents
- Accent Purple (#BB86FC): Used for highlights and interactive elements

### Secondary Colors
- Success Green (#4CAF50): For positive feedback and confirmations
- Error Red (#F44336): For error states and warnings
- Neutral Gray (#BDBDBD): For text and secondary information on dark backgrounds
- Elevation Overlays: Semi-transparent whites (8%, 12%, 16%, 24%) to create depth

### Typography
- Headings: Montserrat (Bold, Semi-bold)
- Body Text: Inter (Regular, Light)
- Size Hierarchy:
  - H1: 32px
  - H2: 24px
  - H3: 20px
  - Body: 16px
  - Caption: 14px

### Iconography
- Line icons with 2px stroke weight
- Animated micro-interactions on hover/focus
- Consistent 24x24px sizing for navigation and UI controls

---

## User Roles & Access

### Student
- Browse and register for events
- View event details and history
- Submit feedback
- Manage personal profile

### Teacher/Faculty
- All student capabilities
- Create and manage department/course events
- Moderate events
- Access specific analytics

### Club/Society Admin
- Manage club/society profile
- Create and manage club/society events
- Process registrations
- View event analytics

### Department Admin
- Manage department profile
- Approve/reject department-related events
- View comprehensive department analytics

### System Administrator
- Full system access
- Manage users, roles, and permissions
- Configure system settings
- Access all analytics and reporting

---

## Common UI Components

### Navigation Bar
- Transparent/blurred background with subtle elevation
- Logo (left-aligned) with glow effect
- Main navigation links with hover underline animation
- User profile dropdown with avatar and notification badge
- Search bar with voice input option and intelligent suggestions

### Sidebar Navigation (Dashboard)
- User/organization avatar and name
- Primary navigation links
- Secondary navigation links
- Quick action buttons

### Cards
- Floating card design with subtle shadow elevation
- Rounded corners (12px radius)
- Subtle hover states with scale transformation
- Background gradient option for featured cards
- Interactive elements with micro-animations

### Buttons
- Primary: Gradient fill with primary colors and subtle glow effect
- Secondary: Semi-transparent with border animation
- Text buttons: No background, primary color text with hover underline
- Icon buttons: Icon with ripple effect and tooltip

### Forms
- Floating labels with animation
- Subtle background for input fields with dynamic focus states
- Animated validation feedback
- Dark-mode optimized input fields with proper contrast
- Progressive disclosure for complex forms

### Modals & Dialogs
- Backdrop blur effect
- Smooth entrance and exit animations
- Elevated appearance with subtle border glow
- Clear title and close button with hover effect
- Concise content with proper spacing

---

## Page Descriptions

### Authentication Pages

#### Login Page
**Purpose:** Allow users to access the system with their credentials
**Key Elements:**
- University logo and Eventura branding
- Login form with username/email and password fields
- "Remember me" checkbox
- "Forgot password" link
- Login button
- Link to help/support

#### Registration Page
**Purpose:** Enable new users to create an account
**Key Elements:**
- Steps indicator (for multi-step registration)
- Personal information form
- Role selection (student, faculty, staff)
- Department selection
- Terms and conditions acceptance
- Registration submission button

#### Password Recovery Page
**Purpose:** Help users recover access to their accounts
**Key Elements:**
- Email input form
- Recovery instructions
- Submission button
- Return to login link

---

### Dashboard Pages

#### Student Dashboard
**Purpose:** Provide students with an overview of relevant events and actions
**Key Elements:**
- Upcoming registered events (timeline view)
- Event recommendations based on interests/department
- Quick registration for trending events
- Recent announcements from followed clubs/departments
- Activity summary (past events, registrations, etc.)
- Calendar integration with event dates

#### Club/Society Admin Dashboard
**Purpose:** Provide club admins with tools to manage events and members
**Key Elements:**
- Event management overview (active, draft, past)
- Registration statistics
- Member activity metrics
- Recent announcements/feedback
- Quick actions (create event, send announcement)
- Approval status indicators for pending events

#### Faculty Dashboard
**Purpose:** Allow faculty to monitor and create department-related events
**Key Elements:**
- Department event calendar
- Course-related event management
- Student participation metrics
- Event approval requests
- Quick actions for creating academic events

#### System Admin Dashboard
**Purpose:** Provide complete system oversight and management tools
**Key Elements:**
- System health metrics
- User registration statistics
- Event activity across all departments/clubs
- Moderation queue
- System configuration shortcuts
- Global announcements management

---

### Event Pages

#### Event Discovery Page
**Purpose:** Help users find events based on various criteria
**Key Elements:**
- Search bar with filters (date, category, department, etc.)
- Featured events carousel
- Category-based event browsing
- Upcoming events timeline/calendar view
- Event cards with key information
- Quick registration buttons
- Save/bookmark options

#### Event Details Page
**Purpose:** Display comprehensive information about a specific event
**Key Elements:**
- Hero image/banner
- Event title, date, time, location
- Organizer information with contact
- Detailed description
- Agenda/schedule
- Speaker/performer information
- Registration status and deadline
- Registration button/form
- Similar/related events
- Social sharing options
- Map/directions to venue

#### Event Creation/Edit Page
**Purpose:** Allow organizers to create and manage event details
**Key Elements:**
- Multi-step form with progress indicator
- Basic information section (title, description, category)
- Date and time selection with timezone
- Location selection (campus map integration)
- Capacity and registration settings
- Ticket/fee configuration
- Media upload (images, attachments)
- Custom form fields for registration
- Preview option
- Save as draft and publish buttons

#### Event Management Page
**Purpose:** Help organizers track and manage registrations and event operations
**Key Elements:**
- Registration list with filtering and search
- Attendance tracking tools
- Check-in QR code generation
- Communication tools for registered participants
- Cancellation/rescheduling options
- Analytics dashboard (registration trends, demographics)
- Feedback collection and reporting

---

### Organization Pages

#### Club/Society Profile Page
**Purpose:** Showcase club/society information and activities
**Key Elements:**
- Cover photo and logo
- Description and mission statement
- Member list with roles
- Upcoming and past events
- Join/follow button
- Contact information
- Gallery of past activities
- Announcement board

#### Department Profile Page
**Purpose:** Provide information about academic departments and their events
**Key Elements:**
- Department information and faculty
- Upcoming academic events
- Course-related activities
- Research showcases
- Student achievements
- Contact information

#### Club/Society Management Page
**Purpose:** Allow club admins to manage membership and settings
**Key Elements:**
- Member management tools
- Role assignment
- Profile editing
- Announcement creation
- Budget/resource tracking
- Documentation and resources
- Approval workflows

---

### Administrative Pages

#### User Management Page
**Purpose:** Enable administrators to manage system users
**Key Elements:**
- User list with search and filters
- Role assignment interface
- Account status controls
- Department/club affiliations
- Audit log of user activities

#### System Configuration Page
**Purpose:** Allow system-wide settings management
**Key Elements:**
- Email notification settings
- Registration policies
- Payment gateway configuration
- System branding options
- Academic calendar integration
- API configurations

#### Reports & Analytics Page
**Purpose:** Provide insights into system usage and event performance
**Key Elements:**
- Dashboard with key performance indicators
- Event participation metrics
- User engagement statistics
- Department/club activity comparison
- Custom report generation
- Data export options
- Visual charts and graphs

---

### Profile Pages

#### User Profile Page
**Purpose:** Allow users to view and edit their personal information
**Key Elements:**
- Profile photo and basic information
- Contact details
- Department/major information
- Interests and preferences
- Privacy settings
- Notification preferences
- Connected accounts (social media, etc.)

#### Event History Page
**Purpose:** Show users their past and upcoming event participation
**Key Elements:**
- Chronological list of registered events
- Event status indicators (attended, upcoming, canceled)
- Feedback submission options for past events
- Downloadable certificates/proofs of participation
- Calendar export options

---

### Payment Pages

#### Payment Gateway Page
**Purpose:** Facilitate secure payment for paid events
**Key Elements:**
- Event summary
- Fee breakdown
- Payment method selection (Cash, bKash, Nagad)
- Secure payment form
- Order summary
- Confirmation page with receipt
- Payment failure handling

#### Refund Processing Page
**Purpose:** Manage refund requests for canceled events or registrations
**Key Elements:**
- Refund policy information
- Eligible event list
- Refund request form
- Status tracking for refund requests
- Confirmation notifications

---

## User Flows

### Student User Flows

#### New User Registration Flow
1. Visit Eventura landing page
2. Click "Sign Up" button
3. Select "Student" role
4. Enter university ID for verification
5. Complete personal information form
6. Select department and interests
7. Accept terms and conditions
8. Create password
9. Receive email verification link
10. Verify email and complete registration
11. Land on personalized student dashboard

#### Event Discovery and Registration Flow
1. Log in to student account
2. Browse events through dashboard recommendations
3. Filter events by category, department, or date
4. View detailed information about an interesting event
5. Click "Register" button
6. Complete any event-specific registration questions
7. For paid events:
   - Review fee details
   - Select payment method (Cash/bKash/Nagad)
   - Complete payment process
   - Receive payment confirmation
8. Receive digital ticket with QR code via email and in-app
9. Add event to personal calendar
10. Receive reminder notifications (1 week, 1 day, 3 hours before)
11. Use QR code for check-in at event
12. Receive post-event feedback request
13. Submit event feedback

#### Profile Management Flow
1. Log in to student account
2. Navigate to "My Profile" section
3. Update personal information (profile picture, contact details)
4. Modify interests and preferences
5. Adjust notification settings
6. Connect social media accounts (optional)
7. View event history and upcoming events
8. Download certificates from past events

### Organizer User Flows

#### Club/Society Registration Flow
1. Log in as a student with admin privileges
2. Navigate to "Organizations" section
3. Click "Register New Club/Society"
4. Complete club information form
5. Add club description and purpose
6. Upload logo and cover photo
7. Add initial member list with roles
8. Submit for department approval
9. Receive approval notification
10. Access club management dashboard

#### Event Creation and Management Flow
1. Log in as club/society admin
2. Navigate to club management dashboard
3. Click "Create New Event" button
4. Complete multi-step event creation form:
   - Basic information (name, description, category)
   - Date, time, and location details
   - Upload event banner and media
   - Set capacity and registration requirements
   - Configure ticket types and pricing (if applicable)
   - Add custom registration questions
   - Set up approval workflow (if required)
5. Preview event listing
6. Submit for approval (if required) or publish directly
7. Monitor registrations in real-time
8. Send announcements to registered participants
9. Generate and distribute QR codes for check-in
10. Export attendance reports
11. View and analyze feedback after event

#### Announcement Distribution Flow
1. Log in as organization admin
2. Navigate to club management dashboard
3. Select "Announcements" section
4. Create new announcement with title and content
5. Select target audience (all followers, specific groups, event attendees)
6. Add media attachments (optional)
7. Schedule distribution time (immediate or future)
8. Preview announcement
9. Publish announcement
10. Track engagement metrics (views, interactions)

### Administrator User Flows

#### System Configuration Flow
1. Log in as system administrator
2. Access admin control panel
3. Navigate to "System Settings"
4. Configure email templates and notifications
5. Set registration policies and workflows
6. Manage payment gateway integration
7. Configure system branding and appearance
8. Set up academic calendar integration
9. Save and apply changes
10. Test configuration changes

#### User Management Flow
1. Log in as system administrator
2. Access admin control panel
3. Navigate to "User Management"
4. Search for specific users or filter by role/department
5. View user details and activity history
6. Modify user roles or permissions
7. Activate/deactivate user accounts
8. Handle account merge requests
9. Reset passwords or provide access recovery
10. Audit user activity logs

#### Event Approval Flow
1. Log in as department admin or system administrator
2. Receive notification about pending event approvals
3. Access "Pending Approvals" queue
4. Review event details and requirements
5. Check for policy compliance and conflicts
6. Approve, reject, or request modifications
7. Provide feedback/comments to event organizer
8. Upon approval, event becomes visible to target audience
9. Receive notifications about event updates or modifications
10. Monitor approved events for compliance

### External User Flows

#### Guest Registration Flow
1. Receive invitation link to university event
2. Access Eventura guest portal
3. Complete guest registration form
4. Provide identification details
5. For paid events, complete payment process
6. Receive digital ticket with QR code
7. Receive event reminders
8. Check in at event using QR code
9. Submit post-event feedback

#### Faculty Sponsorship Flow
1. Log in as faculty member
2. Receive club/event sponsorship request
3. Review event details and requirements
4. Approve sponsorship or request modifications
5. Provide departmental approval
6. Monitor sponsored event preparations
7. Receive attendance and outcome reports
8. Provide post-event assessment

### Cross-Functional Flows

#### Event Check-in Process Flow
1. Event organizer accesses check-in portal before event
2. Sets up check-in station with mobile device or computer
3. Attendee arrives at event location
4. Attendee presents digital QR code from ticket
5. Organizer scans QR code with check-in application
6. System validates ticket and checks registration status
7. For valid tickets:
   - System marks attendee as "checked in"
   - Displays attendee information to organizer
   - Updates attendance dashboard in real-time
8. For issues:
   - System flags problems (duplicate check-in, invalid ticket)
   - Provides resolution options to organizer
9. Organizer can manually check in attendees if needed
10. System tracks attendance statistics throughout event

#### Payment and Refund Processing Flow
1. User selects paid event and proceeds to registration
2. System calculates fees including any discounts
3. User selects payment method:
   - Cash (generates collection instructions)
   - bKash/Nagad (redirects to payment gateway)
4. Payment gateway processes transaction
5. System receives payment confirmation
6. Registration is marked as "paid" and ticket is issued
7. For refunds:
   - User requests refund through "My Registrations"
   - System checks refund eligibility based on policy
   - Admin approves/rejects refund request
   - If approved, refund is processed via original payment method
   - User receives refund confirmation
   - Registration is marked accordingly

#### Feedback and Reporting Flow
1. Event concludes and attendance data is finalized
2. System automatically sends feedback surveys to attendees
3. Attendees complete and submit feedback
4. System aggregates feedback and generates summary reports
5. Organizers review feedback dashboard
6. Department admins access cross-event analytics
7. System generates insights and recommendations
8. Reports are archived and accessible for future planning
9. Feedback trends inform system improvements
10. Annual reports summarize event performance across departments

---

## Responsive Design Guidelines

### Breakpoints
- Mobile: 320px - 480px
- Tablet: 481px - 768px 
- Desktop: 769px - 1279px
- Large Desktop: 1280px+

### Mobile Adaptations
- Single column layout
- Collapsible navigation menu
- Simplified event cards
- Larger touch targets for buttons
- Progressive disclosure of complex forms
- Bottom navigation bar for key actions

### Tablet Adaptations
- Two-column layout for certain pages
- Sidebar navigation (collapsible)
- Grid view for event listings
- Optimized form layouts

### Desktop Adaptations
- Multi-column layouts
- Persistent navigation
- Advanced filtering and search tools
- Dashboard widgets
- Split-screen views for complex workflows

---

## Dark Mode Implementation

### Philosophy
The dark mode design isn't simply an inverted color scheme, but a carefully crafted visual experience that reduces eye strain, enhances content focus, and provides a premium, modern aesthetic aligned with current user preferences.

### Core Principles
1. **Reduced Light Emission**: Minimizes blue light to reduce eye strain during extended use
2. **Content Hierarchy**: Uses subtle contrast variations to establish clear visual hierarchy
3. **Depth Through Elevation**: Employs varying levels of surface elevation rather than borders to define boundaries
4. **Vibrant Accents**: Selective use of higher saturation colors for interactive elements against muted backgrounds
5. **Reduced Contrast for Non-Essential Elements**: Employs 87% opacity for primary text, 60% for secondary text

### Surface Elevation System
- Base/Background: #121212
- Level 1 Elevation (Cards, Surfaces): #1E1E1E (with 8% white overlay)
- Level 2 Elevation (Modals, Navigation Drawers): #222222 (with 12% white overlay)
- Level 3 Elevation (Menus, Dialogs): #252525 (with 16% white overlay)
- Level 4 Elevation (Contextual Menus): #2C2C2C (with 24% white overlay)

### Design Adaptations for Dark Mode
- **Text**: Primary text at 87% white (#FFFFFF DE), secondary text at 60% white (#FFFFFF 99)
- **Icons**: Use semi-transparent white icons (87% opacity) with glowing effects for active states
- **Dividers & Borders**: Minimal use, prefer spatial separation and elevation changes
- **Shadows**: Subtle, colored shadows that complement the primary accent colors
- **Images & Media**: Slightly reduced contrast (90-95%) to better integrate with dark interfaces
- **States**: Distinct visual feedback for hover, active, disabled states using opacity and glow effects

### Implementation Guidelines
1. Use CSS variables for all color values to facilitate theme switching
2. Provide smooth transition animations when switching between light and dark modes
3. Consider system preference detection via `prefers-color-scheme` media query
4. Allow manual override of system preference
5. Persist user preference across sessions
6. Test all interface components in both modes for proper contrast and readability

---

This UI/UX guide serves as a comprehensive reference for designers, developers, and stakeholders involved in the implementation of the Eventura system. It ensures consistency across all interfaces while maintaining the core goals of streamlining event organization, simplifying registration, and boosting student engagement with a modern, visually appealing dark mode design.# EVENTURA---UEMS-
