// event-details.js - Handles dynamic loading of event details from backend API with real-time updates

// Store event data
let currentEvent = null;
let eventId = null;

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
    
    // Check if we're in demo mode already
    const demoMode = localStorage.getItem('eventura_demo_mode') === 'true';
    if (demoMode) {
      // Return a special identifier for demo mode
      console.log("In demo mode, returning demo identifier");
      return 'demo-event';
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
    if (!eventId) {
      throw new Error('No event ID provided');
    }

    console.log(`Fetching event details for ID: ${eventId}`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(`http://localhost:5000/api/events/${eventId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      signal: controller.signal,
      cache: 'no-store'
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Server responded with ${response.status}:`, errorText);
      throw new Error(`Failed to fetch event details (Status: ${response.status})`);
    }
    
    const data = await response.json();
    console.log('Event data received:', data.success ? 'Success' : 'Failed');
    
    // Store event ID in localStorage for future reference
    if (data.success && data.data && data.data._id) {
      localStorage.setItem('lastViewedEventId', data.data._id);
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching event details:', error);
    
    // Different error messages based on error type
    if (error.name === 'AbortError') {
      showErrorMessage('Request timed out. The server might be running slowly or offline.');
    } else if (error.message.includes('Failed to fetch')) {
      // This usually means network error / CORS / server offline
      showErrorMessage('Network error: Could not connect to the server. Please check if the backend server is running.');
      // We don't need to show server status notification here as server-status.js will handle that
    } else {
      showErrorMessage(`Failed to load event details: ${error.message}`);
    }
    
    return { success: false, error: error.message };
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
 * @returns {Promise<Object} Registration result
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
/**
 * Show error or warning message to the user
 * @param {string} message - Message to display (can include HTML)
 * @param {boolean} persistent - If true, message won't auto-hide
 * @param {number} timeout - Time in ms before auto-hiding (default: 5000)
 * @param {string} type - Message type: 'error', 'warning', or 'info' (default: 'error')
 */
function showErrorMessage(message, persistent = false, timeout = 5000, type = 'error') {
  // Create message element if it doesn't exist
  let messageElement = document.getElementById('status-message');
  
  if (!messageElement) {
    messageElement = document.createElement('div');
    messageElement.id = 'status-message';
    document.body.appendChild(messageElement);
  }
  
  // Set proper class based on message type
  messageElement.className = type === 'warning' ? 'warning-message' :
                            type === 'info' ? 'info-message' : 'error-message';
  
  // Add an icon based on type
  const iconClass = type === 'warning' ? 'fa-exclamation-triangle' :
                   type === 'info' ? 'fa-info-circle' : 'fa-exclamation-circle';
                   
  // Set message and show
  messageElement.innerHTML = `
    <i class="fas ${iconClass}" style="margin-right: 10px;"></i>
    <span class="message-content">${message}</span>
  `; 
  messageElement.style.display = 'block';
  
  // Add close button
  const closeButton = document.createElement('span');
  closeButton.innerHTML = '&times;';
  closeButton.className = 'message-close-btn';
  closeButton.style.position = 'absolute';
  closeButton.style.top = '10px';
  closeButton.style.right = '15px';
  closeButton.style.fontSize = '24px';
  closeButton.style.cursor = 'pointer';
  closeButton.onclick = () => {
    messageElement.style.display = 'none';
    
    // Remove any timeouts for this message
    if (messageElement.hideTimeout) {
      clearTimeout(messageElement.hideTimeout);
    }
  };
  
  messageElement.appendChild(closeButton);
  
  // Auto-hide after specified timeout if not persistent
  if (!persistent) {
    // Clear any existing timeout
    if (messageElement.hideTimeout) {
      clearTimeout(messageElement.hideTimeout);
    }
    
    // Set new timeout
    messageElement.hideTimeout = setTimeout(() => {
      if (messageElement) {
        messageElement.style.display = 'none';
      }
    }, timeout);
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
      
      // Only update status if it's not already set to something specific (like sold out)
      if (!statusElement.classList.contains('status-closed') && 
          !statusElement.classList.contains('status-limited')) {
        statusElement.className = 'registration-status status-closed';
        statusElement.textContent = 'Event Ended';
      }
      
      if (registerButton && !registerButton.classList.contains('disabled')) {
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
  
  // Sort schedule by time
  try {
    const sortedSchedule = [...scheduleItems].sort((a, b) => {
      const timeA = a.startTime ? new Date(a.startTime) : new Date(a.time);
      const timeB = b.startTime ? new Date(b.startTime) : new Date(b.time);
      return timeA - timeB;
    });
    
    // Create timeline items for each schedule entry
    sortedSchedule.forEach(item => {
      const timelineItem = document.createElement('div');
      timelineItem.className = 'timeline-item';
      
      // Handle both formats: startTime or time
      let timeValue = item.startTime || item.time;
      let formattedTime;
      
      // Make sure the time is properly formatted
      try {
        formattedTime = formatTime(timeValue);
      } catch (error) {
        console.error('Error formatting time:', error);
        // Fallback format
        formattedTime = typeof timeValue === 'string' ? timeValue.split('T')[1]?.substring(0, 5) || 'TBA' : 'TBA';
      }
      
      // Add date if available and different from event date
      let dateDisplay = '';
      try {
        if (timeValue) {
          const itemDate = new Date(timeValue);
          const dateStr = itemDate.toLocaleDateString();
          dateDisplay = `<div class="timeline-date">${dateStr}</div>`;
        }
      } catch (e) {
        console.error('Error handling schedule date:', e);
      }
      
      timelineItem.innerHTML = `
        <div class="timeline-time">
          ${formattedTime}
          ${dateDisplay}
        </div>
        <div class="timeline-content">
          <h4>${item.title}</h4>
          ${item.description ? `<p>${item.description}</p>` : ''}
          ${item.speaker ? `<p class="timeline-speaker"><i class="fas fa-user-alt"></i> ${item.speaker}</p>` : ''}
        </div>
      `;
      
      timeline.appendChild(timelineItem);
    });
  } catch (error) {
    console.error('Error rendering schedule:', error);
    // Fallback rendering without sorting
    scheduleItems.forEach(item => {
      const timelineItem = document.createElement('div');
      timelineItem.className = 'timeline-item';
      
      timelineItem.innerHTML = `
        <div class="timeline-time">${item.startTime ? formatTime(item.startTime) : 'TBA'}</div>
        <div class="timeline-content">
          <h4>${item.title}</h4>
          ${item.description ? `<p>${item.description}</p>` : ''}
          ${item.speaker ? `<p class="timeline-speaker"><i class="fas fa-user-alt"></i> ${item.speaker}</p>` : ''}
        </div>
      `;
      
      timeline.appendChild(timelineItem);
    });
  }
  
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
    // Skip empty speaker entries
    if (!speaker.name || speaker.name.trim() === '') {
      return;
    }
    
    const speakerCard = document.createElement('div');
    speakerCard.className = 'speaker-card';
    
    // Default image if none provided
    const defaultImage = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(speaker.name) + '&background=random&color=fff&size=256';
    
    // Process the bio text to handle line breaks
    const bioText = speaker.bio ? speaker.bio.replace(/\n/g, '<br>') : '';
    
    speakerCard.innerHTML = `
      <div class="speaker-image">
        <img src="${speaker.image || defaultImage}" alt="${speaker.name}" 
             onerror="this.onerror=null; this.src='${defaultImage}';">
      </div>
      <h4>${speaker.name}</h4>
      ${speaker.title ? `<p class="speaker-title">${speaker.title}</p>` : ''}
      ${bioText ? `<p class="speaker-bio">${bioText}</p>` : ''}
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
  // Store event ID in the global variable
  eventId = getEventIdFromUrl();
  
  // Add a loading overlay instead of replacing the entire content
  const loadingOverlay = document.createElement('div');
  loadingOverlay.id = 'event-loading-overlay';
  loadingOverlay.style = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.85);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
  `;
  
  loadingOverlay.innerHTML = `
    <div class="loading-container" style="text-align: center; padding: 30px; background: var(--surface-dark-elevated); border-radius: 12px; width: 300px; max-width: 90%;">
      <div class="loading-spinner">
        <i class="fas fa-circle-notch fa-spin fa-3x" style="color: var(--primary-blue);"></i>
      </div>
      <p style="margin-top: 20px; font-size: 18px; color: white;">Loading event details...</p>
    </div>
  `;
  
  document.body.appendChild(loadingOverlay);
  
  // Initialize serverStatus variable 
  let serverAvailable = false;
  
  // Check localStorage for demo mode flag
  const demoMode = localStorage.getItem('eventura_demo_mode') === 'true';
  
  // If in demo mode, skip server check
  if (!demoMode) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout - faster response
      
      const response = await fetch('http://localhost:5000/', {
        signal: controller.signal,
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        console.log('✅ Server is available');
        serverAvailable = true;
        sessionStorage.setItem('serverStatus', 'online');
      } else {
        console.warn('Server responded with an error:', response.status);
        sessionStorage.setItem('serverStatus', 'offline');
      }
    } catch (error) {
      console.error('Server connection error:', error);
      serverAvailable = false;
      sessionStorage.setItem('serverStatus', 'offline');
    }
  } else {
    console.log('🔍 Running in demo mode - using cached data only');
  }

  // Get event ID from URL
  const eventId = getEventIdFromUrl();
  if (!eventId) {
    // Instead of just showing an error, let's show the demo options
    const mainContent = document.querySelector('.container');
    
    // Show a friendly message with options
    if (mainContent) {
      showDemoDataOptions(mainContent);
      
      // Also show a non-persistent info message at the top
      showErrorMessage(`
        <p><i class="fas fa-info-circle"></i> No event was specified. You can either:</p>
        <p>1. Select an event type below to view in demo mode, or</p>
        <p>2. <a href="events.html" style="color: white; text-decoration: underline;">Go to the events page</a> to browse available events.</p>
      `, false, 10000, 'info');
    } else {
      // Fallback if container not found
      showErrorMessage(`
        <p>No event specified. Please select an event from the events page.</p>
        <button class="btn btn-primary" onclick="window.location.href='events.html'">Go to Events Page</button>
      `, true);
    }
    
    return;
  }
  
  // Special handling for demo event identifier
  if (eventId === 'demo-event') {
    // Get the demo type from localStorage or default to 'conference'
    const demoType = localStorage.getItem('eventura_demo_type') || 'conference';
    console.log(`Loading demo event of type: ${demoType}`);
    enableDemoMode(demoType);
    return;
  }
  
  // Check if we have cached data for this event
  const cachedEvents = JSON.parse(localStorage.getItem('cachedEvents') || '{}');
  const cachedEvent = cachedEvents[eventId];
  let eventData = null;
  
  try {
    // Only attempt to fetch from server if server is available
    if (serverAvailable) {
      const result = await fetchEventDetails(eventId);
      
      if (result.success && result.data) {
        eventData = result.data;
        
        // Cache event data for offline access
        try {
          cachedEvents[eventId] = result.data;
          localStorage.setItem('cachedEvents', JSON.stringify(cachedEvents));
          console.log('✅ Event data cached for offline use');
        } catch (cacheError) {
          console.warn('Failed to cache event data:', cacheError);
        }
        
        // Render event details from server data
        renderEventDetails(eventData);
        
        // Setup registration button
        setupRegistrationButton(eventId, eventData);
      } else if (cachedEvent) {
        // If server request failed but we have cached data
        console.log('ℹ️ Server request failed. Using cached data instead.');
        showErrorMessage('Unable to get latest event data. Displaying cached data which may be outdated.', false, 5000, 'warning');
        eventData = cachedEvent;
        renderEventDetails(cachedEvent);
      } else {
        showErrorMessage('Failed to load event details from server and no cached data is available.');
        return;
      }
    } else {
      // Server not available, use cached data if possible
      if (cachedEvent) {
        console.log('ℹ️ Server unavailable. Using cached event data:', cachedEvent);
        showErrorMessage('Server is offline. Displaying cached data which may be outdated.', false, 7000, 'info');
        eventData = cachedEvent;
        renderEventDetails(cachedEvent);
      } else {
        // No connection, no cached data - show helpful message
        showErrorMessage('Cannot connect to server and no cached data is available for this event.', true, 0, 'error');
        
        // Show demo data selector to help user
        showDemoDataOptions(mainContent);
        return;
      }
    }
    
    // Update auth state in header - only if not in demo mode
    try {
      // Skip auth state update completely in demo mode
      if (localStorage.getItem('eventura_demo_mode') === 'true' || 
          localStorage.getItem('eventura_skip_auth') === 'true') {
        // Demo mode - skip auth state update entirely
        // Not logging anything to keep console completely clean
      } else {
        // Check if user controls exists first before attempting update
        const userControls = document.querySelector('.user-controls');
        if (userControls) {
          updateAuthState(0, false); // Pass false to disable retry warnings
        } else {
          // Only log this once, not for each retry
          console.debug('Skipping auth state update - user controls element not found');
        }
      }
    } catch (authError) {
      console.warn('Error updating auth state:', authError);
    }
    
    // Setup contact organizer button - with error handling
    try {
      if (eventData && eventData.organizer) {
        setupContactOrganizerButton(eventData.organizer);
      }
    } catch (organizerError) {
      console.warn('Error setting up contact organizer button:', organizerError);
    }
    
    // Try to fetch and render similar events with error handling
    try {
      if (eventData) {
        const similarEvents = await fetchSimilarEvents(eventData);
        if (similarEvents && similarEvents.length > 0) {
          renderSimilarEvents(similarEvents);
        }
      }
    } catch (similarError) {
      console.warn('Error fetching similar events:', similarError);
    }
    
    // Render schedule and speakers if available - with error handling
    try {
      if (eventData && eventData.schedule && eventData.schedule.length > 0) {
        renderSchedule(eventData.schedule);
      }
    } catch (scheduleError) {
      console.warn('Error rendering schedule:', scheduleError);
    }
    
    try {
      if (eventData && eventData.speakers && eventData.speakers.length > 0) {
        renderSpeakers(eventData.speakers);
      }
    } catch (speakersError) {
      console.warn('Error rendering speakers:', speakersError);
    }
    
    // Log additional fields for debugging
    console.log('Event additional fields:',  {
      hasSchedule: !!eventData.schedule,
      hasImage: !!eventData.image,
      hasSpeakers: !!eventData.speakers,
      hasPrice: !!eventData.price,
      hasDeadline: !!eventData.registrationDeadline,
      status: eventData.status
    });
    
  } catch (error) {
    console.error('Error initializing page:', error);
    
    // Make sure to clean up loading elements even when there's an error
    cleanupLoadingElements();
    
    showErrorMessage('An error occurred while loading the page. Please try again.');
    
    // Provide a more user-friendly fallback
    if (mainContent) {
      mainContent.innerHTML = `
        <div style="text-align: center; padding: 50px 20px; margin: 20px auto; max-width: 600px; background: var(--surface-dark-elevated); border-radius: 12px;">
          <i class="fas fa-exclamation-circle" style="font-size: 48px; color: var(--primary-blue); margin-bottom: 20px;"></i>
          <h2>We couldn't load this event</h2>
          <p style="margin: 20px 0; line-height: 1.6;">There was a problem loading the event details. This could be because:</p>
          <ul style="text-align: left; margin: 0 auto 20px; max-width: 400px; line-height: 1.6;">
            <li>The server is currently offline</li>
            <li>The event ID is invalid or the event was deleted</li>
            <li>There was a network connection issue</li>
          </ul>
          <div style="margin-top: 30px;">
            <a href="events.html" class="btn btn-primary">Browse All Events</a>
            <button onclick="location.reload()" class="btn btn-secondary" style="margin-left: 10px;">Try Again</button>
          </div>
        </div>
      `;
    }
  }
}

/**
 * Removes all loading elements and ensures the main page content is visible
 * This function should be called in success and error scenarios
 */
function cleanupLoadingElements() {
  // Remove the loading overlay if it exists
  const loadingOverlay = document.getElementById('event-loading-overlay');
  if (loadingOverlay) {
    // Add a short fade-out animation
    loadingOverlay.style.transition = 'opacity 0.5s';
    loadingOverlay.style.opacity = '0';
    
    // Remove from DOM after animation completes
    setTimeout(() => {
      loadingOverlay.remove();
    }, 500);
  }
  
  // Remove ALL loading containers
  const loadingContainers = document.querySelectorAll('.loading-container');
  loadingContainers.forEach(container => {
    container.style.display = 'none';
  });
  
  // Ensure the header and user controls are visible
  const header = document.querySelector('header');
  const nav = document.querySelector('.main-nav');
  const userControls = document.querySelector('.user-controls');
  
  // Make sure all header elements are visible with proper styling
  if (header) {
    header.classList.remove('hidden');
    header.style.display = 'block';
  }
  
  if (nav) {
    nav.classList.remove('hidden');
    nav.style.display = 'block';
  }
  
  if (userControls) {
    userControls.classList.remove('hidden');
    userControls.style.display = 'flex';
  }
  
  // Make sure any sections that should be shown are visible
  document.querySelectorAll('.event-section').forEach(section => {
    if (!section.classList.contains('hide-section')) {
      section.style.display = 'block';
    }
  });
}

/**
 * Render event details on the page
 * @param {Object} event - Event object with details
 */
function renderEventDetails(event) {
  console.log('Event data:', event); // Debug log to see all available data
  
  // Store current event in the global variable for real-time updates
  currentEvent = event;
  
  // Setup real-time listeners once we have the event data
  setupRealTimeListeners();
  
  // Cleanup loading elements
  cleanupLoadingElements();
  
  // Format dates
  const eventDate = new Date(event.eventDate);
  const formattedDate = formatDate(event.eventDate);
  const formattedTime = formatTime(event.eventDate);
  
  // Format registration deadline if available
  let deadlineDate = event.eventDate; // Default to event date
  if (event.registrationDeadline) {
    deadlineDate = event.registrationDeadline;
  }
  const formattedDeadline = formatDate(deadlineDate);
  
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
  
  // Handle organizer display
  let organizerName = 'Unknown';
  if (event.organizer) {
    if (typeof event.organizer === 'object') {
      organizerName = event.organizer.name || event.organizer.organizationInfo?.orgName || event.organizer.username || 'Unknown';
    } else if (typeof event.organizer === 'string') {
      organizerName = event.organizer;
    }
  }
  metaItems[3].innerHTML = `<i class="fas fa-users"></i> By ${organizerName}`;
  
  // Update event description
  const descriptionContainer = document.querySelector('.event-description');
  if (event.description) {
    // Handle HTML content safely
    const sanitizedDescription = event.description
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
      
    // Convert line breaks to paragraphs, but only if there are paragraphs
    if (sanitizedDescription.includes('\n')) {
      // Split by line breaks and create paragraphs
      const paragraphs = sanitizedDescription.split('\n')
        .filter(para => para.trim() !== '') // Remove empty paragraphs
        .map(paragraph => `<p>${paragraph}</p>`);
        
      descriptionContainer.innerHTML = paragraphs.join('');
    } else {
      // Single paragraph
      descriptionContainer.innerHTML = `<p>${sanitizedDescription}</p>`;
    }
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
  
  // Update registration status and deadline information
  const registrationStatus = document.querySelector('.registration-status');
  const registrationDeadlineObj = event.registrationDeadline ? new Date(event.registrationDeadline) : null;
  const now = new Date();
  
  // Check if event is full
  if (event.capacity <= (event.registered || 0)) {
    registrationStatus.className = 'registration-status status-closed';
    registrationStatus.textContent = 'Sold Out';
  } 
  // Check if registration deadline has passed
  else if (registrationDeadlineObj && registrationDeadlineObj < now) {
    registrationStatus.className = 'registration-status status-closed';
    registrationStatus.textContent = 'Registration Closed';
  }
  // Check if event has limited spots remaining
  else if (event.capacity && event.registered && ((event.capacity - event.registered) < 10)) {
    registrationStatus.className = 'registration-status status-limited';
    registrationStatus.textContent = `${event.capacity - event.registered} Spots Left`;
  }
  // Registration is open
  else {
    registrationStatus.className = 'registration-status status-open';
    registrationStatus.textContent = 'Registration Open';
  }
  
  // Update organizer info
  const organizerName_detail = document.querySelector('.organizer-detail h4');
  const organizerProfileLink = document.querySelector('.organizer-profile-link');
  const organizerDescription = document.querySelector('.organizer-description');
  const organizerAvatar = document.querySelector('.organizer-avatar');
  
  organizerName_detail.textContent = organizerName;
  
  if (event.organizer) {
    if (event.organizer._id) {
      organizerProfileLink.href = `organization-details.html?id=${event.organizer._id}`;
    }
    
    if (event.organizer.organizationInfo?.description) {
      organizerDescription.textContent = event.organizer.organizationInfo.description;
    } else if (event.organizer.description) {
      organizerDescription.textContent = event.organizer.description;
    } else {
      organizerDescription.textContent = 'No description provided.';
    }
    
    // Update organizer avatar if available
    const avatarImg = organizerAvatar.querySelector('img');
    if (avatarImg) {
      if (event.organizer.image || event.organizer.organizationInfo?.logo) {
        // If we have an image from the organizer, use that
        avatarImg.src = event.organizer.image || event.organizer.organizationInfo.logo;
        avatarImg.alt = organizerName;
      } else {
        // Otherwise use DiceBear for a consistent avatar based on organizer name
        avatarImg.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(organizerName)}`;
        avatarImg.alt = organizerName;
      }
    }
  }
  
  // Update event details
  document.querySelector('.capacity-value').textContent = event.capacity || 'Unlimited';
  document.querySelector('.registered-value').textContent = event.registered || 0;
  document.querySelector('.deadline-value').textContent = formattedDeadline;
  document.querySelector('.venue-value').textContent = event.location;
  
  // Update status
  const statusElement = document.querySelector('.status-value');
  if (statusElement) {
    const status = event.status || 'active';
    let statusDisplay = 'Active';
    let statusClass = 'status-section status-open';
    
    if (status === 'draft') {
      statusDisplay = 'Draft';
      statusClass = 'status-section status-limited';
    } else if (status === 'cancelled') {
      statusDisplay = 'Cancelled';
      statusClass = 'status-section status-closed';
    }
    
    statusElement.innerHTML = `<span class="${statusClass}">${statusDisplay}</span>`;
  }
  
  // Update category
  const categoryElement = document.querySelector('.category-value');
  if (categoryElement) {
    categoryElement.textContent = event.category || 'General';
  }
  
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
  
  // Check if event status is draft
  if (eventData.status === 'draft') {
    registerButton.disabled = true;
    registerButton.textContent = "Not Available";
    registerButton.classList.add('disabled');
    registerButton.title = "This event is not yet published";
    return;
  }
  
  // Check if event is already full
  if (eventData.capacity && eventData.capacity <= (eventData.registered || 0)) {
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
  
  // Check if registration deadline has passed
  if (eventData.registrationDeadline) {
    const deadlineDate = new Date(eventData.registrationDeadline);
    if (deadlineDate < new Date()) {
      registerButton.disabled = true;
      registerButton.textContent = "Registration Closed";
      registerButton.classList.add('disabled');
      return;
    }
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
 * @param {number} [retryCount=0] - Number of retries attempted
 * @param {boolean} [enableRetry=true] - Whether to retry if element not found
 * @returns {boolean} - Whether the update was successful
 */
function updateAuthState(retryCount = 0, enableRetry = true) {
  const token = localStorage.getItem('token');
  const userControls = document.querySelector('.user-controls');
  
  // Check if the user-controls element exists
  if (!userControls) {
    // Only log warning in specific circumstances and never in demo mode
    if ((!enableRetry || retryCount > 2) && 
        localStorage.getItem('eventura_demo_mode') !== 'true' && 
        localStorage.getItem('eventura_skip_auth') !== 'true') {
      // Use debug level instead of warn to keep console cleaner
      console.debug('User controls element not found in the DOM. This is normal if using a custom page layout without .user-controls.');
    }
    
    // If retries are enabled and we haven't exceeded max retries
    // Also skip retries in demo mode
    if (enableRetry && retryCount < 3 && 
        localStorage.getItem('eventura_demo_mode') !== 'true' &&
        localStorage.getItem('eventura_skip_auth') !== 'true') {
      // Increase delay between retries as we make more attempts
      const delay = 500 + (retryCount * 200);
      setTimeout(() => updateAuthState(retryCount + 1, enableRetry), delay);
    }
    return false; // Exit early if element doesn't exist
  }
  
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
    return true; // Successfully updated auth state for logged-in user
  } else {
    // For non-logged in users, don't modify anything as the default HTML already has login/signup links
    return true; // Successfully determined auth state (not logged in)
  }
}

/**
 * Shows demo data options when offline and no cached data is available
 * @param {HTMLElement} container - The container to render the demo UI in
 */
function showDemoDataOptions(container) {
  if (!container) return;
  
  // Clean up any loading elements first
  cleanupLoadingElements();
  
  // Make sure header and navbar are visible
  document.querySelector('header')?.classList.remove('hidden');
  document.querySelector('nav')?.classList.remove('hidden');
  document.querySelector('.user-controls')?.classList.remove('hidden');
  
  container.innerHTML = `
    <div style="max-width: 800px; margin: 30px auto; background: var(--surface-dark-elevated); border-radius: 12px; padding: 30px; text-align: center;">
      <i class="fas fa-wifi-slash" style="font-size: 48px; color: var(--primary-blue); margin-bottom: 20px;"></i>
      <h2>Server Connection Error</h2>
      <p style="margin: 15px 0 30px; line-height: 1.6;">
        We're unable to connect to the server and no cached data is available for this event.
        You can try one of the following options:
      </p>
      
      <div style="display: flex; flex-wrap: wrap; gap: 20px; justify-content: center; margin-bottom: 30px;">
        <div onclick="enableDemoMode('conference')" 
             style="cursor: pointer; flex: 1; min-width: 200px; max-width: 250px; background: rgba(255,255,255,0.05); padding: 20px; border-radius: 8px; transition: all 0.2s;">
          <i class="fas fa-laptop" style="font-size: 24px; margin-bottom: 10px; color: #3498db;"></i>
          <h3>Tech Conference</h3>
          <p style="font-size: 0.9rem; color: var(--text-secondary);">View a sample tech conference event with speakers and schedule</p>
        </div>
        
        <div onclick="enableDemoMode('concert')"
             style="cursor: pointer; flex: 1; min-width: 200px; max-width: 250px; background: rgba(255,255,255,0.05); padding: 20px; border-radius: 8px; transition: all 0.2s;">
          <i class="fas fa-music" style="font-size: 24px; margin-bottom: 10px; color: #9b59b6;"></i>
          <h3>Music Concert</h3>
          <p style="font-size: 0.9rem; color: var(--text-secondary);">View a sample music concert with performers and tickets</p>
        </div>
        
        <div onclick="enableDemoMode('workshop')"
             style="cursor: pointer; flex: 1; min-width: 200px; max-width: 250px; background: rgba(255,255,255,0.05); padding: 20px; border-radius: 8px; transition: all 0.2s;">
          <i class="fas fa-chalkboard-teacher" style="font-size: 24px; margin-bottom: 10px; color: #2ecc71;"></i>
          <h3>Workshop</h3>
          <p style="font-size: 0.9rem; color: var(--text-secondary);">View a sample educational workshop with detailed schedule</p>
        </div>
      </div>
      
      <div style="margin-top: 20px;">
        <p style="margin-bottom: 15px;">Or try these alternatives:</p>
        <button onclick="window.location.reload()" class="btn btn-secondary">
          <i class="fas fa-sync-alt"></i> Retry Connection
        </button>
        <button onclick="window.location.href='events.html'" class="btn btn-primary" style="margin-left: 10px;">
          <i class="fas fa-list"></i> Browse All Events
        </button>
      </div>
    </div>
  `;
  
  // Add hover effect to demo cards
  const demoCards = container.querySelectorAll('[onclick^="enableDemoMode"]');
  demoCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-5px)';
      card.style.background = 'rgba(255,255,255,0.08)';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0)';
      card.style.background = 'rgba(255,255,255,0.05)';
    });
  });
}

/**
 * Enables demo mode and displays a sample event
 * @param {string} eventType - Type of demo event to show
 */
function enableDemoMode(eventType) {
  // Set demo mode and event type in localStorage
  localStorage.setItem('eventura_demo_mode', 'true');
  localStorage.setItem('eventura_demo_type', eventType);
  // Set a flag to completely disable auth checks in demo mode
  localStorage.setItem('eventura_skip_auth', 'true');
  
  // Make sure to clean up any loading elements
  cleanupLoadingElements();
  
  // Sample events data
  const demoEvents = {
    conference: {
      _id: 'demo_conference_001',
      title: 'Future Tech Conference 2025',
      description: 'Join us for the biggest tech conference of the year featuring speakers from top tech companies, workshops, networking opportunities, and more. This three-day event will cover the latest trends in AI, blockchain, cloud computing, and more.',
      location: 'Tech Innovation Center, Silicon Valley',
      organizer: {
        _id: 'demo_org_001',
        name: 'Tech Innovators Association',
        description: 'A community of technology enthusiasts dedicated to promoting innovation and collaboration in the tech industry.',
        website: 'https://example.com/tech-innovators',
        logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?ixlib=rb-4.0.3'
      },
      category: 'Technology',
      eventDate: new Date('2025-08-15T09:00:00').toISOString(),
      endDate: new Date('2025-08-17T18:00:00').toISOString(),
      status: 'open',
      capacity: 500,
      registered: 327,
      price: 299.99,
      registrationDeadline: new Date('2025-08-10T23:59:59').toISOString(),
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3',
      schedule: [
        {
          date: new Date('2025-08-15T09:00:00').toISOString(),
          title: 'Opening Keynote: The Future of Technology',
          description: 'Welcome address and keynote presentation on emerging tech trends.',
          speaker: 'Dr. Emma Johnson'
        },
        {
          date: new Date('2025-08-15T11:00:00').toISOString(),
          title: 'AI Ethics Panel Discussion',
          description: 'Industry experts discuss the ethical implications of artificial intelligence.',
          speaker: 'Panel Moderator: Michael Chen'
        },
        {
          date: new Date('2025-08-15T14:00:00').toISOString(),
          title: 'Workshop: Building Secure Blockchain Applications',
          description: 'Hands-on workshop teaching secure blockchain development practices.',
          speaker: 'Sarah Patel'
        },
        {
          date: new Date('2025-08-16T09:00:00').toISOString(),
          title: 'Cloud Computing Masterclass',
          description: 'Advanced techniques for scalable and resilient cloud architectures.',
          speaker: 'James Rodriguez'
        },
        {
          date: new Date('2025-08-16T13:00:00').toISOString(),
          title: 'The Future of Work in Tech',
          description: 'How AI and automation are reshaping careers in technology.',
          speaker: 'Dr. Lisa Wong'
        },
        {
          date: new Date('2025-08-17T10:00:00').toISOString(),
          title: 'Closing Keynote: Technology for Social Good',
          description: 'How technology can be leveraged to address global challenges.',
          speaker: 'Prof. David Okafor'
        }
      ],
      speakers: [
        {
          name: 'Dr. Emma Johnson',
          title: 'CTO, FutureTech Inc.',
          bio: 'Dr. Johnson has over 15 years of experience in AI research and development. She leads the innovation team at FutureTech and has published numerous papers on machine learning algorithms.',
          image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3'
        },
        {
          name: 'Michael Chen',
          title: 'AI Ethics Researcher',
          bio: 'Michael specializes in the ethical implications of AI systems. He advises governments and corporations on responsible AI development and deployment strategies.',
          image: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?ixlib=rb-4.0.3'
        },
        {
          name: 'Sarah Patel',
          title: 'Blockchain Developer',
          bio: 'Sarah is a leading blockchain developer who has contributed to several major cryptocurrency projects. She specializes in smart contract security and decentralized applications.',
          image: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?ixlib=rb-4.0.3'
        },
        {
          name: 'James Rodriguez',
          title: 'Cloud Solutions Architect',
          bio: 'James has designed cloud infrastructure for Fortune 500 companies. He is an AWS certified solutions architect and specializes in high-performance computing environments.',
          image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3'
        }
      ]
    },
    concert: {
      _id: 'demo_concert_001',
      title: 'Summer Beats Festival 2025',
      description: 'Experience the ultimate summer music festival featuring top artists across multiple genres. From indie rock to electronic dance music, this two-day festival will feature performances on three stages, food vendors, art installations, and more!',
      location: 'Riverside Park Amphitheater',
      organizer: {
        _id: 'demo_org_002',
        name: 'Melody Entertainment',
        description: 'Leading concert and festival organizer with over 10 years of experience creating unforgettable live music experiences.',
        website: 'https://example.com/melody',
        logo: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-4.0.3'
      },
      category: 'Music',
      eventDate: new Date('2025-07-25T16:00:00').toISOString(),
      endDate: new Date('2025-07-26T23:00:00').toISOString(),
      status: 'limited',
      capacity: 5000,
      registered: 4876,
      price: 149.99,
      registrationDeadline: new Date('2025-07-20T23:59:59').toISOString(),
      image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?ixlib=rb-4.0.3',
      schedule: [
        {
          date: new Date('2025-07-25T16:00:00').toISOString(),
          title: 'Festival Gates Open',
          description: 'Come early to avoid lines and explore the venue!',
          speaker: ''
        },
        {
          date: new Date('2025-07-25T17:30:00').toISOString(),
          title: 'The Resonants',
          description: 'Opening act on the Main Stage',
          speaker: 'Main Stage'
        },
        {
          date: new Date('2025-07-25T19:00:00').toISOString(),
          title: 'Electronic Dreams',
          description: 'DJ set at the Electronic Dome',
          speaker: 'Electronic Dome'
        },
        {
          date: new Date('2025-07-25T21:00:00').toISOString(),
          title: 'Lunar Waves',
          description: 'Headliner for Day 1',
          speaker: 'Main Stage'
        },
        {
          date: new Date('2025-07-26T16:00:00').toISOString(),
          title: 'Day 2 Gates Open',
          description: 'Second day of the festival begins!',
          speaker: ''
        },
        {
          date: new Date('2025-07-26T21:30:00').toISOString(),
          title: 'Cosmic Rhythm',
          description: 'Final headliner performance',
          speaker: 'Main Stage'
        }
      ],
      speakers: [
        {
          name: 'Lunar Waves',
          title: 'Headlining Band',
          bio: 'Indie rock sensation known for their dreamy soundscapes and energetic live performances. Their latest album reached #1 on the charts.',
          image: 'https://images.unsplash.com/photo-1501612780327-45045538702b?ixlib=rb-4.0.3'
        },
        {
          name: 'Cosmic Rhythm',
          title: 'Electronic Music Producer',
          bio: 'Grammy-nominated producer known for blending electronic music with live instruments. Has collaborated with numerous top artists in the industry.',
          image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3'
        },
        {
          name: 'Electronic Dreams',
          title: 'DJ Duo',
          bio: 'This dynamic duo has been creating waves in the electronic music scene with their innovative mixes and high-energy performances.',
          image: 'https://images.unsplash.com/photo-1571266028253-8d9d05d4c086?ixlib=rb-4.0.3'
        }
      ]
    },
    workshop: {
      _id: 'demo_workshop_001',
      title: 'Digital Marketing Masterclass',
      description: 'Boost your digital marketing skills in this intensive one-day workshop. Learn about SEO, content marketing, social media strategy, email marketing, and analytics from industry experts. Includes hands-on exercises, networking opportunities, and take-home resources.',
      location: 'Business Innovation Center, Downtown',
      organizer: {
        _id: 'demo_org_003',
        name: 'Marketing Professionals Association',
        description: 'A community of marketing professionals dedicated to sharing knowledge and best practices in the field.',
        website: 'https://example.com/mpa',
        logo: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3'
      },
      category: 'Education',
      eventDate: new Date('2025-09-05T09:00:00').toISOString(),
      endDate: new Date('2025-09-05T17:00:00').toISOString(),
      status: 'open',
      capacity: 50,
      registered: 23,
      price: 199.99,
      registrationDeadline: new Date('2025-09-01T23:59:59').toISOString(),
      image: 'https://images.unsplash.com/photo-1528901166007-3784c7dd3653?ixlib=rb-4.0.3',
      schedule: [
        {
          date: new Date('2025-09-05T09:00:00').toISOString(),
          title: 'Registration & Welcome Coffee',
          description: 'Check-in and networking opportunity',
          speaker: ''
        },
        {
          date: new Date('2025-09-05T09:30:00').toISOString(),
          title: 'SEO in 2025: What Really Works Now',
          description: 'Latest search engine optimization techniques and strategies',
          speaker: 'Alex Rivera'
        },
        {
          date: new Date('2025-09-05T11:00:00').toISOString(),
          title: 'Content Marketing Strategy Workshop',
          description: 'Hands-on session to develop effective content marketing plans',
          speaker: 'Jennifer Lee'
        },
        {
          date: new Date('2025-09-05T13:00:00').toISOString(),
          title: 'Lunch & Networking',
          description: 'Catered lunch provided',
          speaker: ''
        },
        {
          date: new Date('2025-09-05T14:00:00').toISOString(),
          title: 'Social Media Marketing Masterclass',
          description: 'Advanced techniques for each major platform',
          speaker: 'Marcus Johnson'
        },
        {
          date: new Date('2025-09-05T15:30:00').toISOString(),
          title: 'Data Analytics for Marketers',
          description: 'How to use data to optimize your marketing efforts',
          speaker: 'Priya Singh'
        },
        {
          date: new Date('2025-09-05T16:30:00').toISOString(),
          title: 'Q&A Panel & Workshop Conclusion',
          description: 'Open discussion with all speakers',
          speaker: 'All Presenters'
        }
      ],
      speakers: [
        {
          name: 'Alex Rivera',
          title: 'SEO Specialist',
          bio: 'Alex has worked with major brands to improve their search visibility and has developed SEO strategies that have resulted in significant traffic increases for clients.',
          image: 'https://images.unsplash.com/photo-1600486913747-55e5470d6f40?ixlib=rb-4.0.3'
        },
        {
          name: 'Jennifer Lee',
          title: 'Content Marketing Director',
          bio: 'Jennifer leads content strategy for a major digital publisher. She specializes in creating engaging content that drives conversions and builds brand loyalty.',
          image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3'
        },
        {
          name: 'Marcus Johnson',
          title: 'Social Media Strategist',
          bio: 'Marcus has managed social media campaigns for global brands. His strategies have helped companies increase engagement and grow their social following.',
          image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3'
        },
        {
          name: 'Priya Singh',
          title: 'Marketing Analytics Expert',
          bio: 'Priya specializes in data-driven marketing decisions. She has developed analytics frameworks that help businesses measure and optimize their marketing ROI.',
          image: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?ixlib=rb-4.0.3'
        }
      ]
    }
  };
  
  // Get the selected demo event
  const demoEvent = demoEvents[eventType];
  if (!demoEvent) return;
  
  // Store in cachedEvents
  try {
    const cachedEvents = JSON.parse(localStorage.getItem('cachedEvents') || '{}');
    cachedEvents[demoEvent._id] = demoEvent;
    localStorage.setItem('cachedEvents', JSON.stringify(cachedEvents));
    
    // Show success message
    showErrorMessage(`Demo mode enabled. Displaying "${demoEvent.title}" sample event.`, false, 3000, 'info');
    
    // Check if we're already on the event details page
    const currentUrl = window.location.href;
    if (currentUrl.includes('event-details.html')) {
      // We're already on the event details page, just render the event directly
      // Clear any existing content first
      const mainContent = document.querySelector('.container');
      if (mainContent) {
        // Clear demo options if they were displayed
        mainContent.innerHTML = '';
      }
      
      // Add a small demo indicator badge to the page
      const demoIndicator = document.createElement('div');
      demoIndicator.innerHTML = `<div style="position: fixed; bottom: 20px; left: 20px; background: rgba(33, 150, 243, 0.9); color: white; padding: 8px 15px; border-radius: 20px; font-size: 0.8rem; z-index: 1000;">
        <i class="fas fa-flask"></i> Demo Mode: ${eventType}
      </div>`;
      document.body.appendChild(demoIndicator);
      
      // Render the event details
      renderEventDetails(demoEvent);
      
      // Set up UI elements
      setupRegistrationButton(demoEvent._id, demoEvent);
      if (demoEvent.organizer) {
        setupContactOrganizerButton(demoEvent.organizer);
      }
      
      // Render schedule and speakers if available
      if (demoEvent.schedule && demoEvent.schedule.length > 0) {
        renderSchedule(demoEvent.schedule);
      }
      if (demoEvent.speakers && demoEvent.speakers.length > 0) {
        renderSpeakers(demoEvent.speakers);
      }
    } else {
      // Redirect to the demo event if we're not on the event details page
      setTimeout(() => {
        window.location.href = `event-details.html?id=${demoEvent._id}`;
      }, 500);
    }
  } catch (error) {
    console.error('Failed to set up demo mode:', error);
    // Make sure loading elements are cleaned up even in error case
    cleanupLoadingElements();
    showErrorMessage('Failed to set up demo mode. Please try again.');
  }
}

// Add the real-time functions after the existing code
// Setup real-time listeners for event updates

/**
 * Set up real-time listeners for event updates
 */
function setupRealTimeListeners() {
  if (!window.eventura || !window.eventura.realtime || !currentEvent) return;
  
  // Join the event-specific room
  if (eventId) {
    // Wait for socket to be ready
    const checkSocketReady = setInterval(() => {
      if (window.eventura.realtime.isOnline && window.eventura.realtime.isOnline()) {
        console.log('Setting up real-time listeners for event:', eventId);
        
        // Add event listeners
        window.eventura.realtime.addEventListener('event-capacity-change', handleCapacityChange);
        window.eventura.realtime.addEventListener('event-joined', handleNewAttendee);
        window.eventura.realtime.addEventListener('event-updated', handleEventUpdate);
        
        clearInterval(checkSocketReady);
      }
    }, 500);
  }
}

/**
 * Handle capacity change event
 * @param {Object} data - Event data from WebSocket
 */
function handleCapacityChange(data) {
  if (!currentEvent || data.eventId !== currentEvent._id) return;
  
  console.log('Received real-time capacity change:', data);
  
  // Update the current event
  currentEvent.capacity = data.totalCapacity;
  
  // Update capacity display
  updateCapacityDisplay(data);
  
  // Show toast notification if capacity is almost full
  if (data.remainingCapacity <= 5) {
    showRealTimeToast('Almost Full', `Only ${data.remainingCapacity} spots remaining for this event!`, 'warning');
  }
}

/**
 * Handle new attendee event
 * @param {Object} data - Event data from WebSocket
 */
function handleNewAttendee(data) {
  if (!currentEvent || data.eventId !== currentEvent._id) return;
  
  console.log('Received real-time new attendee:', data);
  
  // Get user data
  const userData = data.user || {};
  
  // Add to attendee list if it exists
  updateAttendeeDisplay(userData);
  
  // Show toast notification
  showRealTimeToast('New Registration', `${userData.name} just registered for this event!`, 'info');
}

/**
 * Handle event update
 * @param {Object} data - Event data from WebSocket
 */
function handleEventUpdate(data) {
  if (!currentEvent || data.event._id !== currentEvent._id) return;
  
  console.log('Received real-time event update:', data);
  
  // Store previous data for comparison
  const previousEvent = { ...currentEvent };
  
  // Update current event
  currentEvent = data.event;
  
  // Check what changed and show appropriate notifications
  if (previousEvent.title !== currentEvent.title) {
    document.querySelector('.event-hero-content h1').textContent = currentEvent.title;
    document.title = `${currentEvent.title} - Eventura`;
    showRealTimeToast('Event Updated', `Event title has been updated to "${currentEvent.title}"`, 'info');
  }
  
  if (previousEvent.eventDate !== currentEvent.eventDate) {
    const newDate = formatDate(currentEvent.eventDate);
    const newTime = formatTime(currentEvent.eventDate);
    
    document.querySelector('.event-date').textContent = newDate;
    document.querySelector('.event-time').textContent = newTime;
    
    // Update countdown if it exists
    if (typeof initCountdown === 'function') {
      initCountdown(new Date(currentEvent.eventDate));
    }
    
    showRealTimeToast('Date Changed', `Event date has been changed to ${newDate}`, 'warning');
  }
  
  if (previousEvent.location !== currentEvent.location) {
    document.querySelector('.event-location').textContent = currentEvent.location;
    showRealTimeToast('Location Changed', `Event location has been updated to ${currentEvent.location}`, 'warning');
  }
}

/**
 * Update capacity display based on real-time data
 * @param {Object} data - Capacity data
 */
function updateCapacityDisplay(data) {
  // Find capacity element
  const capacityElement = document.querySelector('.event-capacity');
  if (!capacityElement) return;
  
  const remainingCapacity = data.remainingCapacity;
  const totalCapacity = data.totalCapacity;
  const percentage = Math.floor((totalCapacity - remainingCapacity) / totalCapacity * 100);
  
  // Update the text
  capacityElement.textContent = `${remainingCapacity} out of ${totalCapacity} spots remaining`;
  
  // Update visual indication
  if (remainingCapacity <= 5) {
    capacityElement.classList.add('almost-full');
  } else {
    capacityElement.classList.remove('almost-full');
  }
  
  // Update progress bar if it exists
  const progressBar = document.querySelector('.capacity-bar .progress-fill');
  if (progressBar) {
    progressBar.style.width = `${percentage}%`;
  }
  
  // Update registration button status if needed
  const registerBtn = document.querySelector('.register-btn');
  if (registerBtn && remainingCapacity === 0) {
    registerBtn.textContent = 'Event Full';
    registerBtn.classList.add('disabled');
    registerBtn.disabled = true;
  }
}

/**
 * Update attendee display with new attendee
 * @param {Object} userData - User data
 */
function updateAttendeeDisplay(userData) {
  // Check if attendees section exists
  const attendeesList = document.querySelector('.attendees-list');
  if (!attendeesList) return;
  
  // Create new attendee element
  const attendeeItem = document.createElement('div');
  attendeeItem.className = 'attendee-item new-attendee';
  attendeeItem.dataset.userId = userData._id;
  
  // Set HTML content
  attendeeItem.innerHTML = `
    <img src="${userData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}`}" 
         alt="${userData.name}" class="attendee-avatar">
    <div class="attendee-info">
      <span class="attendee-name">${userData.name}</span>
      <span class="attendee-badge">Just Joined</span>
    </div>
  `;
  
  // Add to list
  attendeesList.insertBefore(attendeeItem, attendeesList.firstChild);
  
  // Remove "Just Joined" badge after 30 seconds

  setTimeout(() => {
    if (attendeeItem.querySelector('.attendee-badge')) {
      attendeeItem.querySelector('.attendee-badge').remove();
    }
    attendeeItem.classList.remove('new-attendee');
  }, 30000);
}

/**
 * Show a toast notification for real-time updates
 * @param {string} title - Toast title
 * @param {string} message - Toast message
 * @param {string} type - Toast type (info, success, warning, error)
 */
function showRealTimeToast(title, message, type = 'info') {
  // Use the global toast function if available
  if (window.eventura && window.eventura.realtime) {
    // Create toast container if it doesn't exist
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.className = 'toast-container';
      document.body.appendChild(toastContainer);
    }
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <div class="toast-header">
        <i class="fas fa-info-circle"></i>
        <strong>${title}</strong>
        <button class="toast-close">&times;</button>
      </div>
      <div class="toast-body">
        ${message}
      </div>
    `;
    
    // Add toast to container
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
  } else {
    // Fallback if realtime.js is not loaded
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.innerHTML = `<strong>${title}:</strong> ${message}`;
    
    const container = document.querySelector('.container');
    if (container) {
      container.insertBefore(alert, container.firstChild);
      
      setTimeout(() => {
        alert.remove();
      }, 5000);
    }
  }
}

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', initPage);
