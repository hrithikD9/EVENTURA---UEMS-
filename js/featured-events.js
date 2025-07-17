/**
 * Featured Events Real-Time Updates
 * 
 * This script enhances the homepage by dynamically loading featured events 
 * and setting up real-time updates when events are created or modified.
 */

// Cache DOM elements
let eventsGrid = null;
let loadingTimeout = null;

/**
 * Initialize featured events component
 */
function initFeaturedEvents() {
  // Find the events grid
  eventsGrid = document.querySelector('.featured-events .events-grid');
  if (!eventsGrid) return;
  
  // Load events
  loadFeaturedEvents();
  
  // Register for real-time updates
  if (window.eventura && window.eventura.realtime) {
    window.eventura.realtime.addEventListener('event-created', handleNewEvent);
    window.eventura.realtime.addEventListener('event-updated', handleEventUpdate);
  }
}

/**
 * Load featured events from API
 */
async function loadFeaturedEvents() {
  if (!eventsGrid) return;
  
  // Start loading animation
  startLoading();
  
  try {
    const response = await fetch('http://localhost:5000/api/events?limit=3&sort=newest');
    if (!response.ok) throw new Error('Failed to fetch events');
    
    const data = await response.json();
    displayEvents(data.data || []);
  } catch (error) {
    console.error('Error loading featured events:', error);
    displayError();
  } finally {
    // Stop loading animation
    stopLoading();
  }
}

/**
 * Display events in the grid
 * @param {Array} events - List of events to display
 */
function displayEvents(events) {
  if (!eventsGrid) return;
  
  // Clear existing content
  eventsGrid.innerHTML = '';
  
  if (events.length === 0) {
    eventsGrid.innerHTML = `
      <div class="no-events-message">
        <i class="far fa-calendar-times"></i>
        <p>No upcoming events found.</p>
      </div>
    `;
    return;
  }
  
  // Create event cards
  events.forEach(event => {
    eventsGrid.appendChild(createEventCard(event));
  });
}

/**
 * Create an event card element
 * @param {Object} event - Event data
 * @returns {HTMLElement} Event card element
 */
function createEventCard(event) {
  // Format the date
  const eventDate = new Date(event.eventDate);
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  
  // Format the time
  const formattedTime = eventDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
  
  // Create the card element
  const cardElement = document.createElement('div');
  cardElement.className = 'event-card';
  cardElement.dataset.eventId = event._id;
  
  // Set HTML content
  cardElement.innerHTML = `
    <div class="event-image">
      <img src="${event.image || 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}" 
           alt="${event.title}">
      <span class="event-category">${event.category}</span>
    </div>
    <div class="event-details">
      <div class="event-meta">
        <span class="event-date"><i class="far fa-calendar"></i> ${formattedDate}</span>
        <span class="event-time"><i class="far fa-clock"></i> ${formattedTime}</span>
      </div>
      <h3 class="event-title">${event.title}</h3>
      <p class="event-location"><i class="fas fa-map-marker-alt"></i> ${event.location}</p>
      <div class="event-organizer">
        <span>By ${event.organizer ? event.organizer.name : 'Unknown'}</span>
      </div>
      <a href="event-details.html?id=${event._id}" class="btn btn-secondary">View Details</a>
    </div>
  `;
  
  // Add animation class
  cardElement.classList.add('fade-in');
  
  return cardElement;
}

/**
 * Display error message
 */
function displayError() {
  if (!eventsGrid) return;
  
  eventsGrid.innerHTML = `
    <div class="error-message">
      <i class="fas fa-exclamation-circle"></i>
      <p>Failed to load events. Please try again later.</p>
      <button class="btn btn-outline btn-sm" onclick="loadFeaturedEvents()">Retry</button>
    </div>
  `;
}

/**
 * Start loading animation
 */
function startLoading() {
  if (!eventsGrid) return;
  
  // Don't show loading state immediately for better UX
  loadingTimeout = setTimeout(() => {
    eventsGrid.innerHTML = `
      <div class="loading-indicator">
        <div class="spinner"></div>
        <p>Loading events...</p>
      </div>
    `;
  }, 300); // Show loading after 300ms if the data hasn't loaded yet
}

/**
 * Stop loading animation
 */
function stopLoading() {
  if (loadingTimeout) {
    clearTimeout(loadingTimeout);
    loadingTimeout = null;
  }
}

/**
 * Handle new event creation in real-time
 * @param {Object} data - Event data from WebSocket
 */
function handleNewEvent(data) {
  // Only update if we're on the homepage and the events grid exists
  if (!eventsGrid) return;
  
  const event = data.event;
  if (!event) return;
  
  // Check if event meets criteria for featured display
  const now = new Date();
  const eventDate = new Date(event.eventDate);
  
  // Only show upcoming events
  if (eventDate < now) return;
  
  // Get current events
  const currentEvents = Array.from(eventsGrid.querySelectorAll('.event-card'));
  
  // If we already have 3 or more events, remove the last one
  if (currentEvents.length >= 3) {
    currentEvents[currentEvents.length - 1].remove();
  }
  
  // Create and insert the new event card at the beginning
  const newCard = createEventCard(event);
  newCard.classList.add('highlight-new');
  
  if (currentEvents.length > 0) {
    eventsGrid.insertBefore(newCard, eventsGrid.firstChild);
  } else {
    eventsGrid.appendChild(newCard);
  }
  
  // Remove highlight after 3 seconds
  setTimeout(() => {
    newCard.classList.remove('highlight-new');
  }, 3000);
}

/**
 * Handle event update in real-time
 * @param {Object} data - Event data from WebSocket
 */
function handleEventUpdate(data) {
  // Only update if we're on the homepage and the events grid exists
  if (!eventsGrid) return;
  
  const event = data.event;
  if (!event) return;
  
  // Find existing card
  const existingCard = eventsGrid.querySelector(`.event-card[data-event-id="${event._id}"]`);
  if (!existingCard) return;
  
  // Replace with updated card
  const updatedCard = createEventCard(event);
  updatedCard.classList.add('highlight-update');
  existingCard.replaceWith(updatedCard);
  
  // Remove highlight after 3 seconds
  setTimeout(() => {
    updatedCard.classList.remove('highlight-update');
  }, 3000);
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initFeaturedEvents);

// Expose functions globally
window.loadFeaturedEvents = loadFeaturedEvents;
