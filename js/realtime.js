/**
 * Eventura Real-Time Communication Client
 * 
 * This script sets up a Socket.IO connection to the server for real-time updates.
 * It handles connecting, disconnecting, room management, and event listeners.
 */

// Socket.IO instance
let socket = null;
let isConnected = false;
let reconnectAttempts = 0;
const maxReconnectAttempts = 5;

// Event listeners
const eventListeners = {};

/**
 * Initialize the Socket.IO connection
 */
function initSocket() {
  if (typeof io === 'undefined') {
    console.error('Socket.IO client library not loaded');
    loadSocketIOScript().then(() => {
      connectSocket();
    }).catch(err => {
      console.error('Failed to load Socket.IO:', err);
    });
    return;
  }
  
  connectSocket();
}

/**
 * Load Socket.IO client library dynamically
 */
function loadSocketIOScript() {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.socket.io/4.5.4/socket.io.min.js';
    script.integrity = 'sha384-/KNQL8Nu5gCHLqwqfQjA689Hhoqgi2S84SNUxC3roTe4EhJ9AfLkp8QiQcU8AMzI';
    script.crossOrigin = 'anonymous';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Socket.IO client'));
    document.head.appendChild(script);
  });
}

/**
 * Connect to the Socket.IO server
 */
function connectSocket() {
  try {
    // Get authentication token for secure connection
    const token = localStorage.getItem('token') || '';
    const userId = localStorage.getItem('userId') || '';
    
    // Connect to the server
    socket = io('http://localhost:5000', {
      auth: {
        token,
        userId
      },
      reconnection: true,
      reconnectionAttempts: maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000
    });
    
    // Setup event listeners
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);
    socket.on('reconnect_attempt', handleReconnectAttempt);
    socket.on('reconnect_failed', handleReconnectFailed);
    
    // Setup event listeners for Eventura-specific events
    setupEventListeners();
  } catch (error) {
    console.error('Failed to initialize Socket.IO:', error);
  }
}

/**
 * Handle successful connection
 */
function handleConnect() {
  console.log('Connected to real-time server');
  isConnected = true;
  reconnectAttempts = 0;
  
  // Join default rooms
  joinDefaultRooms();
}

/**
 * Handle disconnection
 */
function handleDisconnect(reason) {
  console.log(`Disconnected from real-time server: ${reason}`);
  isConnected = false;
}

/**
 * Handle connection error
 */
function handleConnectError(error) {
  console.error('Connection error:', error);
}

/**
 * Handle reconnection attempt
 */
function handleReconnectAttempt(attempt) {
  console.log(`Attempting to reconnect (${attempt}/${maxReconnectAttempts})`);
  reconnectAttempts = attempt;
}

/**
 * Handle reconnection failure
 */
function handleReconnectFailed() {
  console.error('Failed to reconnect to real-time server');
  
  // Show a notification to the user
  showReconnectError();
}

/**
 * Show a reconnection error notification
 */
function showReconnectError() {
  const errorMessage = document.createElement('div');
  errorMessage.className = 'server-message error';
  errorMessage.innerHTML = `
    <i class="fas fa-exclamation-circle"></i>
    <p>Lost connection to the server. <button class="btn btn-outline btn-sm" onclick="window.eventura.realtime.reconnect()">Reconnect</button></p>
  `;
  
  // Add to DOM
  const container = document.querySelector('.container');
  if (container && !document.querySelector('.server-message.error')) {
    container.prepend(errorMessage);
  }
}

/**
 * Join room on the server
 * @param {string} roomId - Room ID to join
 */
function joinRoom(roomId) {
  if (!isConnected || !socket) return;
  socket.emit('join-room', roomId);
}

/**
 * Leave room on the server
 * @param {string} roomId - Room ID to leave
 */
function leaveRoom(roomId) {
  if (!isConnected || !socket) return;
  socket.emit('leave-room', roomId);
}

/**
 * Join default rooms based on current user
 */
function joinDefaultRooms() {
  const userId = localStorage.getItem('userId');
  const userRole = localStorage.getItem('userRole');
  
  if (userId) {
    joinRoom(`user-${userId}`);
  }
  
  // If on event page, join event room
  const eventId = getEventIdFromUrl();
  if (eventId) {
    joinRoom(`event-${eventId}`);
  }
  
  // If on organization page, join org room
  const orgId = getOrgIdFromUrl();
  if (orgId) {
    joinRoom(`org-${orgId}`);
  }
}

/**
 * Extract event ID from current URL
 * @returns {string|null} Event ID or null
 */
function getEventIdFromUrl() {
  const url = window.location.href;
  if (url.includes('event-details.html')) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
  }
  return null;
}

/**
 * Extract organization ID from current URL
 * @returns {string|null} Organization ID or null
 */
function getOrgIdFromUrl() {
  const url = window.location.href;
  if (url.includes('organization-details.html')) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
  }
  return null;
}

/**
 * Setup default event listeners
 */
function setupEventListeners() {
  if (!socket) return;
  
  // Event created
  socket.on('event-created', (data) => {
    console.log('New event created:', data.event);
    notifyEventListeners('event-created', data);
    showEventToast('New Event', `${data.event.title} has been created`);
  });
  
  // Event updated
  socket.on('event-updated', (data) => {
    console.log('Event updated:', data.event);
    notifyEventListeners('event-updated', data);
  });
  
  // Event capacity change
  socket.on('event-capacity-change', (data) => {
    console.log('Event capacity changed:', data);
    notifyEventListeners('event-capacity-change', data);
    updateCapacityDisplay(data);
  });
  
  // Event joined
  socket.on('event-joined', (data) => {
    console.log('User joined event:', data);
    notifyEventListeners('event-joined', data);
    updateAttendeeList(data);
  });
  
  // Organization updated
  socket.on('org-updated', (data) => {
    console.log('Organization updated:', data.organization);
    notifyEventListeners('org-updated', data);
  });
  
  // Notification
  socket.on('notification', (data) => {
    console.log('Notification received:', data);
    notifyEventListeners('notification', data);
    showNotificationToast(data);
  });
}

/**
 * Register an event listener
 * @param {string} eventName - Event name
 * @param {function} callback - Callback function
 */
function addEventListener(eventName, callback) {
  if (!eventListeners[eventName]) {
    eventListeners[eventName] = [];
  }
  
  eventListeners[eventName].push(callback);
}

/**
 * Remove an event listener
 * @param {string} eventName - Event name
 * @param {function} callback - Callback function
 */
function removeEventListener(eventName, callback) {
  if (!eventListeners[eventName]) return;
  
  eventListeners[eventName] = eventListeners[eventName].filter(
    listener => listener !== callback
  );
}

/**
 * Notify all registered event listeners
 * @param {string} eventName - Event name
 * @param {object} data - Event data
 */
function notifyEventListeners(eventName, data) {
  if (!eventListeners[eventName]) return;
  
  for (const listener of eventListeners[eventName]) {
    try {
      listener(data);
    } catch (error) {
      console.error(`Error in ${eventName} listener:`, error);
    }
  }
}

/**
 * Update capacity display on event pages
 * @param {object} data - Capacity data
 */
function updateCapacityDisplay(data) {
  // Only update if we're on the right event page
  const eventId = getEventIdFromUrl();
  if (eventId !== data.eventId) return;
  
  // Update capacity elements
  const capacityElements = document.querySelectorAll('.event-capacity');
  capacityElements.forEach(element => {
    element.textContent = `${data.remainingCapacity} spots left out of ${data.totalCapacity}`;
    
    // Add visual indication if almost full
    if (data.remainingCapacity <= 5) {
      element.classList.add('almost-full');
    } else {
      element.classList.remove('almost-full');
    }
  });
}

/**
 * Update attendee list on event pages
 * @param {object} data - Attendee data
 */
function updateAttendeeList(data) {
  // Only update if we're on the right event page
  const eventId = getEventIdFromUrl();
  if (eventId !== data.eventId) return;
  
  // Find attendee list
  const attendeeList = document.querySelector('.attendee-list');
  if (!attendeeList) return;
  
  // Create new attendee element
  const attendeeItem = document.createElement('div');
  attendeeItem.className = 'attendee-item';
  attendeeItem.innerHTML = `
    <img src="${data.user.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(data.user.name)}" 
         alt="${data.user.name}" class="attendee-avatar">
    <div class="attendee-info">
      <span class="attendee-name">${data.user.name}</span>
    </div>
  `;
  
  // Add to list
  attendeeList.appendChild(attendeeItem);
}

/**
 * Show event toast notification
 * @param {string} title - Toast title
 * @param {string} message - Toast message
 */
function showEventToast(title, message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <div class="toast-header">
      <i class="fas fa-calendar"></i>
      <strong>${title}</strong>
      <button class="toast-close">&times;</button>
    </div>
    <div class="toast-body">
      ${message}
    </div>
  `;
  
  // Add toast to container
  const toastContainer = getOrCreateToastContainer();
  toastContainer.appendChild(toast);
  
  // Show toast
  setTimeout(() => {
    toast.classList.add('show');
  }, 100);
  
  // Remove toast after 5 seconds
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 5000);
  
  // Add close button functionality
  const closeButton = toast.querySelector('.toast-close');
  if (closeButton) {
    closeButton.addEventListener('click', () => {
      toast.classList.remove('show');
      setTimeout(() => {
        toast.remove();
      }, 300);
    });
  }
}

/**
 * Show notification toast
 * @param {object} notification - Notification data
 */
function showNotificationToast(notification) {
  showEventToast(notification.title, notification.message);
}

/**
 * Get or create toast container
 * @returns {HTMLElement} Toast container
 */
function getOrCreateToastContainer() {
  let container = document.querySelector('.toast-container');
  
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  
  return container;
}

/**
 * Manually reconnect to the server
 */
function reconnect() {
  if (socket) {
    socket.disconnect();
  }
  
  // Remove error message
  const errorMessage = document.querySelector('.server-message.error');
  if (errorMessage) {
    errorMessage.remove();
  }
  
  // Try to reconnect
  connectSocket();
}

/**
 * Check if user is online
 * @returns {boolean} True if online
 */
function isOnline() {
  return navigator.onLine && isConnected;
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Delay slightly to ensure page is fully loaded
  setTimeout(initSocket, 1000);
});

// Export functions to global namespace
window.eventura = window.eventura || {};
window.eventura.realtime = {
  init: initSocket,
  reconnect,
  addEventListener,
  removeEventListener,
  isOnline
};
