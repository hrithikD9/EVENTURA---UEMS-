# Eventura 🎉

> A modern real-time event management platform for university clubs and organizations

Eventura is a comprehensive web-based platform designed to streamline event management for university clubs and student organizations. It provides a centralized system for creating, discovering, and managing events, connecting students with campus activities while offering powerful tools for event organizers.

## 🚀 Features

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
- Socket.IO for real-time features
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

## 🔧 Installation & Setup

### Prerequisites
- Node.js (v16 or later)
- npm or yarn

### Setting Up the Frontend

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/eventura.git
   cd eventura
   ```

2. Install frontend dependencies
   ```bash
   cd client
   npm install
   ```

3. Create a `.env` file in the client directory (optional)
   ```bash
   cp .env.example .env
   ```

4. Start the development server
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:3000`

### Mock Authentication

For testing, use these credentials:
- **Email:** john@neub.edu.bd
- **Password:** password123

Other demo users:
- jane@neub.edu.bd (Organizer role)
- admin@neub.edu.bd (Admin role)

## 🚀 Running the Project

### Quick Start (Recommended)

```bash
./setup-react.sh
```

### Manual Setup

1. Navigate to client directory
```bash
cd client
```

2. Install dependencies
```bash
npm install
```

3. Start development server
```bash
npm run dev
```

4. Open browser at `http://localhost:3000`

### Production Build

```bash
cd client
npm run build
npm run preview
```

The application currently uses mock data for development. No backend setup is required.

### ⚠️ Important Note

All old HTML/CSS/JS files have been removed. The project is now 100% React-based. If you run `npx serve` at the root, you'll see a redirect page. Always use `npm run dev` inside the `client/` folder.

## 📱 Screenshots

_[Add screenshots of your application here]_

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📬 Contact

Project Link: [https://github.com/yourusername/eventura](https://github.com/yourusername/eventura)

---

&copy; 2025 Eventura. All rights reserved.
