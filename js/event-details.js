// event-details.js - Handles dynamic loading of event details from backend API

/**
 * Get event ID from URL query parameters
 * @returns {string|null} Event ID from URL or null if not found
 */
function getEventIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');
  
  // Debug log to check what's coming from URL
  console.log("Event ID from URL:", id);
  
  // If no ID in URL, check if it might be in a different parameter or format
  if (!id) {
    // Check if ID might be in a different parameter
    const urlPath = window.location.pathname;
    const pathParts = urlPath.split('/');
    const potentialId = pathParts[pathParts.length - 1];
    
    // If the last part of the URL path might be an ID (matches MongoDB ObjectId format)
    if (potentialId && potentialId.match(/^[0-9a-fA-F]{24}$/)) {
      console.log("Found potential ID in path:", potentialId);
      return potentialId;
    }
    
    // Check localStorage for recently created or viewed event
    const lastCreatedEventId = localStorage.getItem('lastCreatedEventId');
    if (lastCreatedEventId) {
      console.log("Using recently created event ID from localStorage:", lastCreatedEventId);
      return lastCreatedEventId;
    }
    
    // Also check for recently viewed event as fallback
    const recentViewedEvent = localStorage.getItem('lastViewedEventId');
    if (recentViewedEvent) {
      console.log("Using recently viewed event ID from localStorage:", recentViewedEvent);
      return recentViewedEvent;
    }
  }
  
  return id;
}

/**
 * Fetch event details from backend API
 * @param {string} eventId - The ID of the event to fetch
 * @returns {Promise<Object>} Event details object
 */
async function fetchEventDetails(eventId) {
  try {
    const response = await fetch(`http://localhost:5000/api/events/${eventId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch event details (Status: ${response.status})`);
    }
    
    const data = await response.json();
    
    // Store event ID in localStorage for future reference
    if (data.success && data.data && data.data._id) {
      localStorage.setItem('lastViewedEventId', data.data._id);
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching event details:', error);
    showErrorMessage('Failed to load event details. Please try again later.');
    return { success: false };
  }
}

/**
 * Fetch similar events based on category or organizer
 * @param {Object} event - Current event object
 * @param {number} limit - Number of similar events to fetch
 * @returns {Promise<Array>} Array of similar events
 */
async function fetchSimilarEvents(event, limit = 3) {
  try {
    // Construct query parameters to find similar events
    const params = new URLSearchParams({
      limit: limit,
      category: event.category
    });
    
    const response = await fetch(`http://localhost:5000/api/events?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch similar events');
    }
    
    const data = await response.json();
    
    // Filter out the current event
    return data.data.filter(e => e._id !== event._id).slice(0, limit);
  } catch (error) {
    console.error('Error fetching similar events:', error);
    return [];
  }
}

/**
 * Register current user for the event
 * @param {string} eventId - The ID of the event to register for
 * @returns {Promise<Object>} Registration result
 */
async function registerForEvent(eventId) {
  try {
    // Get auth token from localStorage
    const token = localStorage.getItem('token');
    if (!token) {
      // Redirect to login page with return URL
      window.location.href = `login.html?returnUrl=${encodeURIComponent(window.location.href)}`;
      return { success: false, message: 'Authentication required' };
    }

    const response = await fetch(`http://localhost:5000/api/events/${eventId}/join`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to register for event');
    }
    
    return data;
  } catch (error) {
    console.error('Error registering for event:', error);
    showErrorMessage(`Registration failed: ${error.message}`);
    return { success: false, message: error.message };
  }
}

/**
 * Show error message to the user
 * @param {string} message - Error message to display
 * @param {boolean} persistent - If true, message won't auto-hide
 */
function showErrorMessage(message, persistent = false) {
  // Create error element if it doesn't exist
  let errorElement = document.getElementById('error-message');
  
  if (!errorElement) {
    errorElement = document.createElement('div');
    errorElement.id = 'error-message';
    errorElement.className = 'error-message';
    document.body.appendChild(errorElement);
  }
  
  // Set message and show
  errorElement.innerHTML = message; // Using innerHTML to support HTML content
  errorElement.style.display = 'block';
  
  // Add close button
  const closeButton = document.createElement('span');
  closeButton.innerHTML = '&times;';
  closeButton.className = 'error-close-btn';
  closeButton.style.position = 'absolute';
  closeButton.style.top = '5px';
  closeButton.style.right = '10px';
  closeButton.style.fontSize = '20px';
  closeButton.style.cursor = 'pointer';
  closeButton.onclick = () => {
    errorElement.style.display = 'none';
  };
  
  errorElement.appendChild(closeButton);
  
  // Auto-hide after 5 seconds if not persistent
  if (!persistent) {
    setTimeout(() => {
      if (errorElement) {
        errorElement.style.display = 'none';
      }
    }, 5000);
  }
}

/**
 * Format date from ISO string to readable format
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date string
 */
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Format time from ISO string to readable format
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted time string
 */
function formatTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Update the countdown timer based on event date
 * @param {Date} eventDate - The date of the event
 */
function initCountdown(eventDate) {
  const countdownElement = document.querySelector('.event-countdown');
  const statusElement = document.querySelector('.registration-status');
  const registerButton = document.querySelector('.btn-primary.btn-block');
  
  // Function to update countdown
  function updateCountdown() {
    // Get current date and time
    const now = new Date().getTime();
    
    // Calculate time remaining
    const timeRemaining = eventDate.getTime() - now;
    
    // Check if the event has already passed
    if (timeRemaining < 0) {
      // Event has already started/passed
      countdownElement.innerHTML = '<div class="countdown-title">Event Has Ended</div>';
      statusElement.className = 'registration-status status-closed';
      statusElement.textContent = 'Registration Closed';
      
      if (registerButton) {
        registerButton.disabled = true;
        registerButton.textContent = "Event Has Ended";
        registerButton.classList.add('disabled');
      }
      
      // No need to continue updates
      clearInterval(countdownTimer);
      return;
    }
    
    // Calculate days, hours, minutes, seconds
    const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
    
    // Update the countdown display
    document.getElementById("days").innerText = String(days).padStart(2, '0');
    document.getElementById("hours").innerText = String(hours).padStart(2, '0');
    document.getElementById("minutes").innerText = String(minutes).padStart(2, '0');
    document.getElementById("seconds").innerText = String(seconds).padStart(2, '0');
  }
  
  // Initial update
  updateCountdown();
  
  // Set up the countdown interval to update every second
  const countdownTimer = setInterval(updateCountdown, 1000);
}

/**
 * Render schedule section if schedule data is available
 * @param {Array} scheduleItems - Array of schedule items
 */
function renderSchedule(scheduleItems) {
  const scheduleSection = document.querySelector('.schedule-section');
  const timeline = document.querySelector('.timeline');
  
  // If no schedule data, keep section hidden
  if (!scheduleItems || scheduleItems.length === 0) {
    scheduleSection.style.display = 'none';
    return;
  }
  
  // Clear existing timeline items
  timeline.innerHTML = '';
  
  // Create timeline items for each schedule entry
  scheduleItems.forEach(item => {
    const timelineItem = document.createElement('div');
    timelineItem.className = 'timeline-item';
    
    const formattedTime = formatTime(item.startTime || item.time);
    
    timelineItem.innerHTML = `
      <div class="timeline-time">${formattedTime}</div>
      <div class="timeline-content">
        <h4>${item.title}</h4>
        <p>${item.description || ''}</p>
        ${item.speaker ? `<p><em>Presenter: ${item.speaker}</em></p>` : ''}
      </div>
    `;
    
    timeline.appendChild(timelineItem);
  });
  
  // Show the schedule section
  scheduleSection.style.display = 'block';
}

/**
 * Render speakers section if speaker data is available
 * @param {Array} speakers - Array of speaker objects
 */
function renderSpeakers(speakers) {
  const speakersSection = document.querySelector('.speakers-section');
  const speakersGrid = document.querySelector('.speakers-grid');
  
  // If no speakers data, keep section hidden
  if (!speakers || speakers.length === 0) {
    speakersSection.style.display = 'none';
    return;
  }
  
  // Clear existing speakers
  speakersGrid.innerHTML = '';
  
  // Create speaker cards for each speaker
  speakers.forEach(speaker => {
    const speakerCard = document.createElement('div');
    speakerCard.className = 'speaker-card';
    
    speakerCard.innerHTML = `
      <div class="speaker-image">
        <img src="${speaker.image || 'https://via.placeholder.com/150'}" alt="${speaker.name}">
      </div>
      <h4>${speaker.name}</h4>
      <p class="speaker-title">${speaker.title || ''}</p>
      <p class="speaker-bio">${speaker.bio || ''}</p>
    `;
    
    speakersGrid.appendChild(speakerCard);
  });
  
  // Show the speakers section
  speakersSection.style.display = 'block';
}

/**
 * Render similar events section
 * @param {Array} events - Array of similar event objects
 */
function renderSimilarEvents(events) {
  const similarEventsSection = document.querySelector('.similar-events');
  const similarEventsList = document.querySelector('.similar-events-list');
  
  // If no similar events, keep section hidden
  if (!events || events.length === 0) {
    similarEventsSection.style.display = 'none';
    return;
  }
  
  // Clear existing events
  similarEventsList.innerHTML = '';
  
  // Create event cards for similar events
  events.forEach(event => {
    const eventDate = new Date(event.eventDate);
    const eventCard = document.createElement('div');
    eventCard.className = 'event-card';
    
    eventCard.innerHTML = `
      <div class="event-card-image">
        <img src="${event.image || 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'}" alt="${event.title}">
        <span class="badge badge-primary">${event.category}</span>
      </div>
      <div class="event-card-content">
        <div class="event-date">${formatDate(event.eventDate)}</div>
        <h3>${event.title}</h3>
        <p class="event-location"><i class="fas fa-map-marker-alt"></i> ${event.location}</p>
        <a href="event-details.html?id=${event._id}" class="btn btn-secondary">View Details</a>
      </div>
    `;
    
    similarEventsList.appendChild(eventCard);
  });
  
  // Show the similar events section
  similarEventsSection.style.display = 'block';
}

/**
 * Main function to initialize the page
 */
async function initPage() {
  // Check if server is available
  try {
    const response = await fetch('http://localhost:5000/api/status');
    if (!response.ok) {
      showErrorMessage('Server is not responding. Some features may not work properly.');
    }
  } catch (error) {
    console.error('Server connection error:', error);
    showErrorMessage('Cannot connect to server. Please check your connection or try again later.');
    return;
  }

  // Get event ID from URL
  const eventId = getEventIdFromUrl();
  if (!eventId) {
    // Show a persistent error message with a button to go to events page
    showErrorMessage(`
      <p>Event ID not found. This could be because:</p>
      <ul style="text-align: left; margin: 10px 0;">
        <li>The event link is incorrect</li>
        <li>The event has been deleted</li>
        <li>You're creating a new event that hasn't been saved yet</li>
      </ul>
      <p>Please try selecting an event from the events page.</p>
      <button class="btn btn-primary" onclick="window.location.href='events.html'">Go to Events Page</button>
    `, true); // true makes the message persistent
    
    return;
  }
  
  try {
    // Fetch event details
    const result = await fetchEventDetails(eventId);
    
    if (!result.success || !result.data) {
      showErrorMessage('Failed to load event details.');
      return;
    }
    
    // Render event details
    renderEventDetails(result.data);
    
    // Update auth state in header
    updateAuthState();
    
    // Setup registration button
    setupRegistrationButton(eventId, result.data);
    
    // Setup contact organizer button
    setupContactOrganizerButton(result.data.organizer);
    
    // Fetch and render similar events
    const similarEvents = await fetchSimilarEvents(result.data);
    renderSimilarEvents(similarEvents);
    
    // Render schedule and speakers if available
    if (result.data.schedule) {
      renderSchedule(result.data.schedule);
    }
    
    if (result.data.speakers) {
      renderSpeakers(result.data.speakers);
    }
    
  } catch (error) {
    console.error('Error initializing page:', error);
    showErrorMessage('An error occurred while loading the page. Please try again.');
  }
}

/**
 * Render event details on the page
 * @param {Object} event - Event object with details
 */
function renderEventDetails(event) {
  // Format dates
  const eventDate = new Date(event.eventDate);
  const formattedDate = formatDate(event.eventDate);
  const formattedTime = formatTime(event.eventDate);
  
  // Update page title
  document.title = `${event.title} - Eventura`;
  
  // Update hero section
  document.querySelector('.event-hero-image').src = event.image || 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80';
  document.querySelector('.event-hero-image').alt = event.title;
  document.querySelector('.badge.badge-primary').textContent = event.category;
  document.querySelector('.event-hero-content h1').textContent = event.title;
  
  // Update event meta information
  const metaItems = document.querySelectorAll('.event-meta-item');
  metaItems[0].innerHTML = `<i class="far fa-calendar"></i> ${formattedDate}`;
  metaItems[1].innerHTML = `<i class="far fa-clock"></i> ${formattedTime}`;
  metaItems[2].innerHTML = `<i class="fas fa-map-marker-alt"></i> ${event.location}`;
  metaItems[3].innerHTML = `<i class="fas fa-users"></i> By ${event.organizer?.name || event.organizer?.organizationInfo?.orgName || 'Unknown'}`;
  
  // Update event description
  const descriptionContainer = document.querySelector('.event-description');
  if (event.description) {
    descriptionContainer.innerHTML = event.description.split('\n').map(paragraph => `<p>${paragraph}</p>`).join('');
  } else {
    descriptionContainer.innerHTML = '<p>No description provided for this event.</p>';
  }
  
  // Update location info
  const locationAddress = document.querySelector('.location-address');
  locationAddress.innerHTML = `<strong>${event.location}</strong>`;
  
  // Update price
  const priceElement = document.querySelector('.event-price');
  if (event.price && event.price > 0) {
    priceElement.textContent = `$${event.price.toFixed(2)}`;
  } else {
    priceElement.textContent = 'Free';
  }
  
  // Update registration status
  const registrationStatus = document.querySelector('.registration-status');
  if (event.capacity > event.registered) {
    registrationStatus.className = 'registration-status status-open';
    registrationStatus.textContent = 'Registration Open';
  } else {
    registrationStatus.className = 'registration-status status-closed';
    registrationStatus.textContent = 'Sold Out';
  }
  
  // Update organizer info
  const organizerName = document.querySelector('.organizer-detail h4');
  const organizerProfileLink = document.querySelector('.organizer-profile-link');
  const organizerDescription = document.querySelector('.organizer-description');
  
  organizerName.textContent = event.organizer?.name || event.organizer?.organizationInfo?.orgName || 'Unknown';
  
  if (event.organizer) {
    organizerProfileLink.href = `organization-details.html?id=${event.organizer._id}`;
    organizerDescription.textContent = event.organizer.organizationInfo?.description || 'No description provided.';
  }
  
  // Update event details
  document.querySelector('.capacity-value').textContent = event.capacity;
  document.querySelector('.registered-value').textContent = event.registered || 0;
  document.querySelector('.deadline-value').textContent = formatDate(event.registrationDeadline || event.eventDate);
  document.querySelector('.venue-value').textContent = event.location;
  
  // Initialize countdown
  initCountdown(eventDate);
}

/**
 * Setup registration button
 * @param {string} eventId - The event ID
 * @param {Object} eventData - Event data object
 */
function setupRegistrationButton(eventId, eventData) {
  const registerButton = document.querySelector('.btn-primary.btn-block');
  const isLoggedIn = localStorage.getItem('token') !== null;
  
  // Check if event is already full
  if (eventData.capacity <= eventData.registered) {
    registerButton.disabled = true;
    registerButton.textContent = "Sold Out";
    registerButton.classList.add('disabled');
    return;
  }
  
  // Check if event has passed
  const eventDate = new Date(eventData.eventDate);
  if (eventDate < new Date()) {
    registerButton.disabled = true;
    registerButton.textContent = "Event Has Ended";
    registerButton.classList.add('disabled');
    return;
  }
  
  // Check if user is already registered
  if (isLoggedIn) {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    if (userData.registeredEvents && userData.registeredEvents.includes(eventId)) {
      registerButton.disabled = true;
      registerButton.textContent = "Already Registered";
      registerButton.classList.add('disabled');
      return;
    }
  }
  
  registerButton.addEventListener('click', async function() {
    if (!isLoggedIn) {
      // Redirect to login page with return URL
      window.location.href = 'login.html?returnUrl=' + encodeURIComponent(window.location.href);
      return;
    }
    
    // Show loading state
    registerButton.textContent = 'Registering...';
    registerButton.disabled = true;
    
    // Register for the event
    const result = await registerForEvent(eventId);
    
    if (result.success) {
      registerButton.textContent = 'Registered';
      registerButton.disabled = true;
      
      // Show success message
      alert('Registration successful! You\'ll receive a confirmation email shortly.');
      
      // Update user data in localStorage
      try {
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        if (!userData.registeredEvents) {
          userData.registeredEvents = [];
        }
        if (!userData.registeredEvents.includes(eventId)) {
          userData.registeredEvents.push(eventId);
          localStorage.setItem('user', JSON.stringify(userData));
        }
      } catch (error) {
        console.error('Error updating local user data:', error);
      }
    } else {
      // Show error and reset button
      registerButton.textContent = 'Register Now';
      registerButton.disabled = false;
      
      // Show specific error if available
      if (result.message) {
        showErrorMessage(result.message);
      }
    }
  });
}

/**
 * Set up the contact organizer button
 * @param {Object} organizer - The organizer object
 */
function setupContactOrganizerButton(organizer) {
  const contactButton = document.querySelector('.contact-organizer-btn');
  
  contactButton.addEventListener('click', function() {
    // In a real application, this would open a contact form modal
    // For now, we'll just show an alert with the information
    const organizerName = organizer?.name || 'the organizer';
    alert(`Contact ${organizerName}:\n\nIn a real application, this would open a contact form or show contact details for the organizer.`);
  });
}

/**
 * Update auth state in the header
 */
function updateAuthState() {
  const token = localStorage.getItem('token');
  const userControls = document.querySelector('.user-controls');
  
  if (token) {
    userControls.innerHTML = `
      <div class="search-container">
        <button class="search-toggle"><i class="fas fa-search"></i></button>
        <div class="search-form">
          <input type="text" placeholder="Search events...">
          <button type="submit"><i class="fas fa-search"></i></button>
        </div>
      </div>
      <a href="my-events.html" class="btn btn-secondary">My Events</a>
      <div class="user-dropdown">
        <button class="user-dropdown-toggle">
          <i class="fas fa-user-circle"></i>
          <i class="fas fa-chevron-down"></i>
        </button>
        <div class="user-dropdown-menu">
          <a href="profile.html">Profile</a>
          <a href="admin-dashboard.html" id="dashboard-link" style="display: none;">Dashboard</a>
          <a href="#" id="logout-link">Log Out</a>
        </div>
      </div>
    `;
    
    // Add event listener for logout
    document.getElementById('logout-link').addEventListener('click', function(e) {
      e.preventDefault();
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('isLoggedIn');
      window.location.href = 'index.html';
    });
    
    // Add event listener for dropdown toggle
    document.querySelector('.user-dropdown-toggle').addEventListener('click', function() {
      document.querySelector('.user-dropdown-menu').classList.toggle('active');
    });
    
    // Check if user is an organizer
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user && user.role === 'organizer') {
        document.getElementById('dashboard-link').style.display = 'block';
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
  }
}

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', initPage);
