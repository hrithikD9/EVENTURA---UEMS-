/**
 * Socket.IO configuration module for Eventura
 * 
 * This module sets up Socket.IO for real-time communication between clients and server.
 * It provides functions to initialize the Socket.IO server and manage connections.
 */

// Store global socket instance
let io;

/**
 * Initialize Socket.IO with an HTTP server instance
 * @param {Object} server - HTTP server instance
 */
function init(server) {
  io = require('socket.io')(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });
  
  io.on('connection', (socket) => {
    console.log(`New client connected: ${socket.id}`);
    
    // Join room based on organization or event ID
    socket.on('join-room', (roomId) => {
      socket.join(roomId);
      console.log(`Socket ${socket.id} joined room: ${roomId}`);
    });
    
    // Leave room
    socket.on('leave-room', (roomId) => {
      socket.leave(roomId);
      console.log(`Socket ${socket.id} left room: ${roomId}`);
    });
    
    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
  
  console.log('Socket.IO initialized');
  return io;
}

/**
 * Get the Socket.IO instance
 * @returns {Object} Socket.IO instance
 */
function getIO() {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
}

/**
 * Emit an event to all connected clients
 * @param {string} event - Event name
 * @param {any} data - Data to send
 */
function emitToAll(event, data) {
  getIO().emit(event, data);
}

/**
 * Emit an event to a specific room
 * @param {string} room - Room name (usually organization or event ID)
 * @param {string} event - Event name
 * @param {any} data - Data to send
 */
function emitToRoom(room, event, data) {
  getIO().to(room).emit(event, data);
}

module.exports = {
  init,
  getIO,
  emitToAll,
  emitToRoom
};
