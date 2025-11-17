# North East University Bangladesh
## Department of Computer Science and Engineering
### Spring-2025 Semester
**Course Code: CSE - 06133230**				**Course Title: Project Work II**

## 1) Basic Information:

### Group Details
| Student ID | Student Name |
|------------|--------------|
| 0562310005101027 | Hrithik |
| 0562310005101030 | Priya |
| 0562310005101042 | Anjum |

**Project Title:** EVENTURA - University Event Management System (UEMS)

## 2) User Roles:

| User Types | Description |
|------------|-------------|
| Unregistered User | Can browse public events, organization pages, and general information. Can register for an account. |
| Student | Can view and register for events, follow organizations, manage personal event calendar, and update profile. |
| Event Organizer | Can create and manage events, view attendee lists, send notifications, and manage organization profile. |
| Club Representative (CR) | Can manage club events, approve member requests, post announcements, and coordinate with university administration. |
| Administrator | Manages system-wide settings, approves organizations, monitors platform usage, and handles user management. |

## 3) User Story Planning:

| Task Number | User Story | Responsible | Deadlines |
|-------------|------------|-------------|-----------|
| H-1 | Implement advanced event analytics dashboard with charts, attendance tracking, and export functionality (backend data aggregation + frontend visualization) | Hrithik | Week 3 |
| P-1 | Create student event registration system with email notifications (frontend forms + backend API endpoints) | Priya | Week 2 |
| A-1 | Build event discovery page with search and filtering capabilities (frontend UI + backend search API) | Anjum | Week 2 |
| H-2 | Develop real-time notification system using WebSockets for event updates and announcements (backend socket.io + frontend real-time updates) | Hrithik | Week 4 |
| P-2 | Implement user profile management with photo upload and bio editing (frontend profile forms + backend file handling) | Priya | Week 3 |
| A-2 | Create organization directory with detailed organization profiles and member lists (frontend pages + backend organization API) | Anjum | Week 3 |
| H-3 | Build advanced event scheduling system with conflict detection and resource booking (backend scheduling logic + frontend calendar interface) | Hrithik | Week 5 |
| P-3 | Develop event feedback and rating system for attendees (frontend rating forms + backend feedback storage) | Priya | Week 4 |
| A-3 | Implement basic event reminder system with email/SMS notifications (frontend reminder settings + backend notification service) | Anjum | Week 4 |
| H-4 | Create comprehensive admin panel with user management, event moderation, and system analytics (backend admin APIs + frontend admin dashboard) | Hrithik | Week 6 |
| P-4 | Build student dashboard showing upcoming events, registered events, and personal calendar (frontend dashboard + backend user event aggregation) | Priya | Week 5 |
| A-4 | Develop event attendance tracking with QR code check-in system (frontend QR scanner + backend attendance logging) | Anjum | Week 5 |
| H-5 | Implement event waitlist management with automatic promotion and smart notifications (backend queue management + frontend waitlist interface) | Hrithik | Week 7 |
| P-5 | Create organization follow/unfollow system with personalized event recommendations (frontend follow buttons + backend recommendation engine) | Priya | Week 6 |
| A-5 | Build event photo gallery and document sharing for completed events (frontend media upload + backend file management) | Anjum | Week 6 |
| H-6 | Develop multi-role authentication system with role-based access control and session management (backend auth middleware + frontend role-specific UI) | Hrithik | Week 8 |
| P-6 | Implement event collaboration tools allowing multiple organizers per event (frontend organizer management + backend permission system) | Priya | Week 7 |
| A-6 | Create event statistics and attendance reports for organizers (frontend report views + backend data export) | Anjum | Week 7 |

## 4) The Product Backlog:

| Story Number | User Story | Acceptance Tests |
|--------------|------------|------------------|
| H-1 | Implement advanced event analytics dashboard with charts, attendance tracking, and export functionality | 1. Analytics charts load with real event data (pass)<br>2. Attendance tracking shows accurate numbers (pass)<br>3. Export functionality generates valid CSV/PDF files (pass)<br>4. Dashboard handles large datasets efficiently (pass) |
| P-1 | Create student event registration system with email notifications | 1. Registration form validates input correctly (pass)<br>2. Email confirmations sent upon registration (pass)<br>3. Database stores registration data accurately (pass)<br>4. Registration limits enforced properly (pass) |
| A-1 | Build event discovery page with search and filtering capabilities | 1. Search returns relevant events based on keywords (pass)<br>2. Filters work correctly for date, category, location (pass)<br>3. Pagination handles large result sets (pass)<br>4. No events show appropriate message (pass) |
| H-2 | Develop real-time notification system using WebSockets for event updates | 1. Real-time updates appear without page refresh (pass)<br>2. WebSocket connections handle concurrent users (pass)<br>3. Notifications persist until acknowledged (pass)<br>4. System gracefully handles connection failures (pass) |
| P-2 | Implement user profile management with photo upload and bio editing | 1. Profile updates save correctly to database (pass)<br>2. Photo upload validates file type and size (pass)<br>3. Bio editing supports markdown formatting (pass)<br>4. Invalid data inputs are rejected (pass) |
| A-2 | Create organization directory with detailed profiles and member lists | 1. Organization profiles display complete information (pass)<br>2. Member lists show current active members (pass)<br>3. Organization search functionality works (pass)<br>4. Profile images load correctly (pass) |
| H-3 | Build advanced event scheduling system with conflict detection | 1. Conflict detection prevents double-booking resources (pass)<br>2. Calendar interface shows available time slots (pass)<br>3. Recurring events create properly (pass)<br>4. Schedule changes update all related components (pass) |
| P-3 | Develop event feedback and rating system for attendees | 1. Feedback forms submit successfully after events (pass)<br>2. Rating averages calculate correctly (pass)<br>3. Comments display with proper moderation (pass)<br>4. Anonymous feedback option works (pass) |
| A-3 | Implement basic event reminder system with notifications | 1. Reminders sent at configured intervals (pass)<br>2. Email/SMS notifications deliver successfully (pass)<br>3. Users can customize reminder preferences (pass)<br>4. Unsubscribe functionality works properly (pass) |
| H-4 | Create comprehensive admin panel with user and event management | 1. Admin can view and modify all user accounts (pass)<br>2. Event moderation tools function correctly (pass)<br>3. System analytics display accurate metrics (pass)<br>4. Role-based permissions enforced throughout (pass) |
| P-4 | Build student dashboard with events and personal calendar | 1. Dashboard shows relevant upcoming events (pass)<br>2. Registered events display with status (pass)<br>3. Personal calendar integrates event data (pass)<br>4. Dashboard loads quickly with optimized queries (pass) |
| A-4 | Develop event attendance tracking with QR code check-in | 1. QR codes generate unique for each attendee (pass)<br>2. Check-in process updates attendance records (pass)<br>3. Attendance reports reflect real-time data (pass)<br>4. QR scanner works on mobile devices (pass) |
| H-5 | Implement event waitlist management with automatic promotion | 1. Waitlist automatically promotes when spots open (pass)<br>2. Notifications sent to promoted attendees (pass)<br>3. Waitlist position updates in real-time (pass)<br>4. Waitlist capacity limits enforced (pass) |
| P-5 | Create organization follow system with event recommendations | 1. Follow/unfollow buttons update immediately (pass)<br>2. Personalized recommendations appear on dashboard (pass)<br>3. Recommendation algorithm considers user interests (pass)<br>4. Email digest of followed organizations works (pass) |
| A-5 | Build event photo gallery and document sharing system | 1. Photos upload and display in organized galleries (pass)<br>2. Document sharing supports multiple file types (pass)<br>3. Access permissions respect event privacy settings (pass)<br>4. File storage limits enforced appropriately (pass) |
| H-6 | Develop multi-role authentication with session management | 1. Role-based access restricts unauthorized features (pass)<br>2. Session timeout works with configurable duration (pass)<br>3. Password reset functionality secure and reliable (pass)<br>4. Two-factor authentication option available (pass) |
| P-6 | Implement event collaboration tools for multiple organizers | 1. Multiple organizers can edit same event (pass)<br>2. Permission levels (view/edit/admin) work correctly (pass)<br>3. Change history tracks all modifications (pass)<br>4. Collaborative editing prevents conflicts (pass) |
| A-6 | Create event statistics and attendance reports for organizers | 1. Statistics accurately reflect event performance (pass)<br>2. Reports export in multiple formats (pass)<br>3. Data visualization charts display correctly (pass)<br>4. Historical data comparison available (pass) |

## 5) Sprint Schedule:

### Week 1-2: Foundation & Basic Features
- **A-1**: Event discovery page (Anjum)
- **P-1**: Student registration system (Priya)

### Week 3-4: User Experience & Notifications  
- **H-1**: Analytics dashboard (Hrithik)
- **P-2**: Profile management (Priya)
- **A-2**: Organization directory (Anjum)
- **H-2**: Real-time notifications (Hrithik)
- **P-3**: Feedback system (Priya)
- **A-3**: Event reminders (Anjum)

### Week 5-6: Advanced Features & Management
- **H-3**: Event scheduling system (Hrithik)
- **P-4**: Student dashboard (Priya)
- **A-4**: Attendance tracking (Anjum)
- **H-4**: Admin panel (Hrithik)
- **P-5**: Organization follow system (Priya)
- **A-5**: Photo gallery (Anjum)

### Week 7-8: Integration & Polish
- **H-5**: Waitlist management (Hrithik)
- **P-6**: Event collaboration (Priya)
- **A-6**: Statistics reports (Anjum)
- **H-6**: Multi-role authentication (Hrithik)

## 6) Technical Requirements:

### Backend Development (All members must implement):
- **Database Operations**: CRUD operations with MongoDB
- **API Endpoints**: RESTful APIs with proper error handling
- **Authentication**: JWT-based user authentication
- **Data Validation**: Input validation and sanitization
- **Business Logic**: Core functionality implementation

### Frontend Development (All members must implement):
- **User Interface**: Responsive HTML/CSS layouts
- **JavaScript Logic**: DOM manipulation and event handling
- **API Integration**: Fetch/Axios calls to backend endpoints
- **Form Handling**: Input validation and submission
- **User Experience**: Interactive elements and feedback

### Complexity Distribution:
- **Hrithik (Advanced)**: Real-time features, complex algorithms, system architecture
- **Priya (Intermediate)**: Standard CRUD operations, user interfaces, basic integrations  
- **Anjum (Intermediate)**: Basic features, simple APIs, straightforward UI components

---
*This user story plan ensures balanced workload distribution while maintaining both frontend and backend development requirements for all team members.*