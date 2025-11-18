# Eventura 

> A modern real-time event management platform for university clubs and organizations

Eventura is a comprehensive web-based platform designed to streamline event management for university clubs and student organizations. It provides a centralized system for creating, discovering, and managing events, connecting students with campus activities while offering powerful tools for event organizers.

## Features

### For Students

- **Event Discovery**: Browse upcoming events by category, date, or organization
- **Club & Organization Profiles**: Explore detailed pages for university clubs (CSE Society, Sports Club, etc.)
- **Event Registration**: Easily register for events with just a few clicks
- **My Events Dashboard**: Track registered events and attendance history
- **Real-time Updates**: Receive instant notifications about event changes or announcements

### For Event Organizers

- **Organization Management**: Create and customize your club/organization profile
- **Event Creation**: Design comprehensive event listings with details, schedules, and speakers
- **Attendee Management**: Track registrations and manage attendance
- **Analytics Dashboard**: View event performance metrics and attendee statistics
- **Real-time Communication**: Send updates to registered attendees

### Admin Features

- **User Management**: Approve organizers and manage user accounts
- **Content Moderation**: Review and moderate events and organization profiles
- **System Analytics**: Monitor platform usage and performance

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI library with hooks
- **React Router v6** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Next-generation frontend tooling
- **Axios** - Promise-based HTTP client
- **Socket.IO Client** - Real-time communication
- **Lucide React** - Beautiful icon library
- **React Hot Toast** - Toast notifications
- **date-fns** - Modern date utility library

### Backend (Optional - Currently using mock data)
- Node.js & Express.js
- MongoDB with Mongoose ODM
- JWT-based authentication
- RESTful API architecture

## 📂 Project Structure

```
eventura/
├── client/                   # React frontend application
│   ├── public/               # Static files
│   ├── src/
│   │   ├── assets/           # Images, icons
│   │   ├── components/       # Reusable React components
│   │   │   ├── common/       # Header, Footer, Button, Modal, Loader
│   │   │   ├── events/       # Event-related components
│   │   │   ├── organizations/# Organization components
│   │   │   ├── auth/         # Login, Register components
│   │   │   └── dashboard/    # Dashboard components
│   │   ├── context/          # React Context providers
│   │   ├── hooks/            # Custom React hooks
│   │   ├── pages/            # Page components (Home, Events, etc.)
│   │   ├── services/         # API services with mock data
│   │   ├── utils/            # Helper functions and constants
│   │   ├── App.jsx           # Main App with routing
│   │   ├── main.jsx          # Entry point
│   │   └── index.css         # Global styles
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── documentation/            # Project documentation
└── README.md                 # Project documentation
```


#PROJECT IS UNDER DEVELOPING!