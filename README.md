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
- HTML5, CSS3, JavaScript (Vanilla)
- Real-time updates with Socket.IO client
- Responsive design with custom CSS

### Backend
- Node.js & Express.js
- MongoDB with Mongoose ODM
- JWT-based authentication
- Socket.IO for real-time features
- RESTful API architecture

### Dependencies
- **Backend**:
  - express: ^5.1.0
  - mongoose: ^8.16.3
  - bcrypt: ^6.0.0
  - jsonwebtoken: ^9.0.2
  - socket.io: ^4.8.1
  - dotenv: ^17.2.0
  - cors: ^2.8.5
  - express-async-handler: ^1.2.0

## 📂 Project Structure

```
eventura/
├── backend/                  # Server-side code
│   ├── config/               # Database and socket configuration
│   ├── controllers/          # Request handlers
│   ├── middleware/           # Authentication middleware
│   ├── models/               # MongoDB schemas
│   ├── routes/               # API routes
│   ├── services/             # Business logic and services
│   ├── utils/                # Helper functions
│   ├── server.js             # Express app entry point
│   └── package.json          # Backend dependencies
├── css/                      # CSS modules and components
├── js/                       # Frontend JavaScript files
│   ├── events.js             # Event listing functionality
│   ├── realtime.js           # Socket.IO client implementation
│   └── ...                   # Other module-specific JS files
├── documentation/            # Project documentation
├── photos/                   # Image assets
├── *.html                    # Frontend pages
├── styles.css                # Global CSS styles
└── README.md                 # Project documentation
```

## 🔧 Installation & Setup

### Prerequisites
- Node.js (v16 or later)
- MongoDB (v5 or later)
- npm or yarn

### Setting Up the Backend

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/eventura.git
   cd eventura
   ```

2. Install backend dependencies
   ```bash
   cd backend
   npm install
   ```

3. Create a `.env` file in the backend directory with the following variables
   ```
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/eventura
   JWT_SECRET=your_jwt_secret_here
   NODE_ENV=development
   ```

4. Start the backend server
   ```bash
   npm run dev
   ```

### Setting Up the Frontend

The frontend is built with vanilla HTML, CSS, and JavaScript. No build process is required.

1. Open any HTML file in a modern web browser, or set up a simple server:
   ```bash
   # Using Python's built-in server
   python -m http.server
   
   # Or using a Node.js server like http-server
   npm install -g http-server
   http-server
   ```

2. Access the application at `http://localhost:8000` (or the port shown in the console)

## 🚀 Running the Project

You can use the included shell script to start the server:

```bash
bash start-server.sh
```

Or manually:

1. Start MongoDB (if running locally)
   ```bash
   mongod
   ```

2. Start the backend server
   ```bash
   cd backend
   npm run dev
   ```

3. Open `index.html` in your browser or use a local server as mentioned above

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
