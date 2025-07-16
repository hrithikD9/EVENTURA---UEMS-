// my-events.js - Handles dynamic loading of user's events from the backend API

/**
 * Fetch user's registered events from the backend API
 */
async function fetchUserEvents() {
  try {
    // Get authentication token from local storage
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    // Check if server is online first
    try {
      const serverCheck = await fetch('http://localhost:5000/', { 
        method: 'GET',
        signal: AbortSignal.timeout(3000)
      });
      
      if (!serverCheck.ok) {
        throw new Error('Backend server is not responding');
      }
    } catch (serverError) {
      // Server is offline
      console.error('Server check failed:', serverError);
      
      // Show server status notification and return empty data
      if (typeof showServerNotification === 'function') {
        showServerNotification();
      } else {
        showErrorMessage('Backend server is offline. Please start the server and try again.');
      }
      
      // Return mock data for testing UI when server is down
      return {
        success: false,
        data: [],
        serverOffline: true,
        message: 'Backend server is offline'
      };
    }
    
    // Fetch events from API
    const response = await fetch('http://localhost:5000/api/events/user/registered', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch events');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching user events:', error);
    showErrorMessage('Failed to load your events. Please try again later.');
    return { success: false, data: [] };
  }
}

/**
 * Render event cards in the event list container
 * @param {Array} events - Array of event objects
 */
function renderUserEvents(events) {
  const eventContainer = document.getElementById('event-container');
  const eventGrid = document.createElement('div');
  eventGrid.className = 'event-grid';
  
  if (!events || events.length === 0) {
    // Show no events message
    eventContainer.innerHTML = `
      <div class="no-events">
        <div class="no-events-icon">
            <i class="far fa-calendar-times"></i>
        </div>
        <h3>You haven't registered for any events yet</h3>
        <p>Explore upcoming events and join the ones you're interested in to see them here.</p>
        <a href="events.html" class="btn btn-primary">Browse Events</a>
      </div>
    `;
    
    // Hide pagination if no events
    document.querySelector('.pagination').style.display = 'none';
    return;
  }
  
  // Loop through events and create cards
  events.forEach(event => {
    // Format date
    const eventDate = new Date(event.eventDate);
    const formattedDate = eventDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    
    const formattedTime = eventDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    
    // Determine event status
    const now = new Date();
    
    let statusClass = 'status-registered';
    let statusText = 'Registered';
    
    if (event.registrationStatus === 'attended') {
      statusClass = 'status-attending';
      statusText = 'Attended';
    } else if (event.registrationStatus === 'cancelled') {
      statusClass = 'status-past';
      statusText = 'Cancelled';
    } else if (eventDate < now) {
      statusClass = 'status-past';
      statusText = 'Past';
    } else {
      statusClass = 'status-upcoming';
      statusText = 'Upcoming';
    }
    
    // Create event card
    const eventCard = document.createElement('div');
    eventCard.className = 'event-item';
    eventCard.dataset.eventId = event._id;
    eventCard.dataset.status = statusText.toLowerCase();
    
    // Set default image if not provided
    const eventImage = event.image || 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
    
    eventCard.innerHTML = `
      <div class="event-image">
        <img src="${eventImage}" alt="${event.title}">
      </div>
      <div class="event-info">
        <h3 class="event-title">${event.title}</h3>
        <div class="event-meta">
          <span><i class="far fa-calendar"></i> ${formattedDate}</span>
          <span><i class="far fa-clock"></i> ${formattedTime}</span>
        </div>
        <span class="event-status ${statusClass}">${statusText}</span>
        <div class="event-actions">
          <a href="event-details.html?id=${event._id}" class="btn btn-outline">View Details</a>
          ${getActionButton(statusText, event._id)}
        </div>
      </div>
    `;
    
    eventGrid.appendChild(eventCard);
  });
  
  // Clear existing content and append new event grid
  eventContainer.innerHTML = '';
  eventContainer.appendChild(eventGrid);
  
  // Add event listeners for action buttons
  setupEventListeners();
}

/**
 * Get the appropriate action button based on event status
 */
function getActionButton(status, eventId) {
  switch(status.toLowerCase()) {
    case 'upcoming':
      return `<a href="#" class="btn btn-primary cancel-registration" data-event-id="${eventId}">Cancel</a>`;
    case 'registered':
      return `<a href="#" class="btn btn-primary" data-event-id="${eventId}">Check In</a>`;
    case 'past':
      return `<a href="#" class="btn btn-secondary" data-event-id="${eventId}">Give Feedback</a>`;
    case 'attended':
      return `<a href="#" class="btn btn-secondary" data-event-id="${eventId}">Get Certificate</a>`;
    default:
      return '';
  }
}

/**
 * Setup event listeners for action buttons
 */
function setupEventListeners() {
  // Cancel registration buttons
  const cancelButtons = document.querySelectorAll('.cancel-registration');
  cancelButtons.forEach(button => {
    button.addEventListener('click', async function(e) {
      e.preventDefault();
      
      const eventId = this.dataset.eventId;
      
      if (confirm('Are you sure you want to cancel your registration for this event?')) {
        try {
          // Get authentication token
          const token = localStorage.getItem('token');
          
          if (!token) {
            throw new Error('No authentication token found');
          }
          
          // In a real implementation, we would make an API call to cancel registration
          // For now, just remove the card
          const eventCard = this.closest('.event-item');
          eventCard.style.opacity = '0';
          setTimeout(() => {
            eventCard.remove();
            
            // Check if there are any events left
            const remainingEvents = document.querySelectorAll('.event-item');
            if (remainingEvents.length === 0) {
              // Show no events message
              document.getElementById('event-container').innerHTML = `
                <div class="no-events">
                  <div class="no-events-icon">
                      <i class="far fa-calendar-times"></i>
                  </div>
                  <h3>You haven't registered for any events yet</h3>
                  <p>Explore upcoming events and join the ones you're interested in to see them here.</p>
                  <a href="events.html" class="btn btn-primary">Browse Events</a>
                </div>
              `;
              
              // Hide pagination
              document.querySelector('.pagination').style.display = 'none';
            }
          }, 300);
          
          showSuccessMessage('Registration cancelled successfully');
        } catch (error) {
          console.error('Error cancelling registration:', error);
          showErrorMessage('Failed to cancel registration. Please try again.');
        }
      }
    });
  });
}

/**
 * Apply filters to events
 * @param {String} filter - Filter to apply (all, upcoming, registered, past)
 */
function applyFilter(filter) {
  const eventItems = document.querySelectorAll('.event-item');
  
  // Show/hide events based on filter
  let visibleCount = 0;
  
  eventItems.forEach(item => {
    const status = item.dataset.status;
    
    if (filter === 'all') {
      item.style.display = 'flex';
      visibleCount++;
    } else if (filter === status) {
      item.style.display = 'flex';
      visibleCount++;
    } else {
      item.style.display = 'none';
    }
  });
  
  // Show/hide no events message based on visible count
  const eventGrid = document.querySelector('.event-grid');
  const noEvents = document.querySelector('.no-events');
  
  if (visibleCount === 0) {
    if (eventGrid) eventGrid.style.display = 'none';
    if (noEvents) {
      noEvents.style.display = 'block';
    } else {
      document.getElementById('event-container').innerHTML = `
        <div class="no-events">
          <div class="no-events-icon">
            <i class="far fa-calendar-times"></i>
          </div>
          <h3>No ${filter} events found</h3>
          <p>Try a different filter or register for more events.</p>
          <a href="events.html" class="btn btn-primary">Browse Events</a>
        </div>
      `;
    }
    
    document.querySelector('.pagination').style.display = 'none';
  } else {
    if (eventGrid) eventGrid.style.display = 'grid';
    if (noEvents) noEvents.style.display = 'none';
    document.querySelector('.pagination').style.display = 'flex';
  }
}

/**
 * Show success message
 * @param {String} message - Message to display
 */
function showSuccessMessage(message) {
  const container = document.querySelector('.my-events-section .container');
  
  // Create success alert
  const successAlert = document.createElement('div');
  successAlert.className = 'success-alert';
  successAlert.style.cssText = `
    background-color: rgba(40, 167, 69, 0.1);
    border: 1px solid rgba(40, 167, 69, 0.3);
    color: #28a745;
    border-radius: 8px;
    padding: 15px 20px;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
  `;
  successAlert.innerHTML = `
    <i class="fas fa-check-circle" style="margin-right: 10px; font-size: 1.2rem;"></i>
    <span>${message}</span>
  `;
  
  // Insert at the top of the container
  container.insertBefore(successAlert, container.firstChild);
  
  // Remove after 3 seconds
  setTimeout(() => {
    successAlert.style.opacity = '0';
    successAlert.style.transition = 'opacity 0.5s ease';
    setTimeout(() => successAlert.remove(), 500);
  }, 3000);
}

/**
 * Show error message
 * @param {String} message - Message to display
 */
function showErrorMessage(message) {
  const container = document.querySelector('.my-events-section .container');
  
  // Create error alert
  const errorAlert = document.createElement('div');
  errorAlert.className = 'error-alert';
  errorAlert.style.cssText = `
    background-color: rgba(220, 53, 69, 0.1);
    border: 1px solid rgba(220, 53, 69, 0.3);
    color: #dc3545;
    border-radius: 8px;
    padding: 15px 20px;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
  `;
  errorAlert.innerHTML = `
    <i class="fas fa-exclamation-circle" style="margin-right: 10px; font-size: 1.2rem;"></i>
    <span>${message}</span>
  `;
  
  // Insert at the top of the container
  container.insertBefore(errorAlert, container.firstChild);
  
  // Remove after 5 seconds
  setTimeout(() => {
    errorAlert.style.opacity = '0';
    errorAlert.style.transition = 'opacity 0.5s ease';
    setTimeout(() => errorAlert.remove(), 500);
  }, 5000);
}

/**
 * Initialize the page
 */
async function initMyEventsPage() {
  // Show loading state
  document.getElementById('event-container').innerHTML = `
    <div style="display: flex; justify-content: center; align-items: center; padding: 50px 0;">
      <div class="spinner" style="width: 40px; height: 40px; border: 4px solid rgba(255, 255, 255, 0.1); border-radius: 50%; border-top-color: var(--primary-blue); animation: spin 1s linear infinite;"></div>
    </div>
  `;
  
  // Add animation style if not exists
  if (!document.getElementById('loading-spinner-style')) {
    const style = document.createElement('style');
    style.id = 'loading-spinner-style';
    style.textContent = `
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }
  
  // Fetch user events
  const result = await fetchUserEvents();
  
  // Handle server offline case
  if (result.serverOffline) {
    document.getElementById('event-container').innerHTML = `
      <div class="server-offline-message" style="text-align: center; padding: 40px 20px; background: rgba(220, 53, 69, 0.05); border-radius: 8px; margin: 20px 0;">
        <i class="fas fa-server" style="font-size: 3rem; color: #dc3545; margin-bottom: 20px; display: block;"></i>
        <h3>Backend Server is Offline</h3>
        <p style="max-width: 500px; margin: 15px auto;">
          We cannot load your events because the backend server is not running. 
          Please start the server using the instructions provided and refresh this page.
        </p>
        <button id="retry-connection" class="btn btn-primary" style="margin-top: 20px;">
          <i class="fas fa-sync-alt"></i> Retry Connection
        </button>
      </div>
    `;
    
    // Add retry button functionality
    document.getElementById('retry-connection').addEventListener('click', async () => {
      document.getElementById('retry-connection').innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Checking...';
      document.getElementById('retry-connection').disabled = true;
      
      try {
        const serverCheck = await fetch('http://localhost:5000/', { 
          method: 'GET',
          signal: AbortSignal.timeout(3000)
        });
        
        if (serverCheck.ok) {
          // Server is back online, reload page
          window.location.reload();
        } else {
          // Server still offline
          document.getElementById('retry-connection').innerHTML = '<i class="fas fa-sync-alt"></i> Retry Connection';
          document.getElementById('retry-connection').disabled = false;
          showErrorMessage('Backend server is still offline. Please start the server and try again.');
        }
      } catch (error) {
        // Server still offline
        document.getElementById('retry-connection').innerHTML = '<i class="fas fa-sync-alt"></i> Retry Connection';
        document.getElementById('retry-connection').disabled = false;
        showErrorMessage('Backend server is still offline. Please start the server and try again.');
      }
    });
    
  } else if (result.success) {
    // Render events
    renderUserEvents(result.data);
    
    // Setup filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        // Remove active class from all buttons
        filterButtons.forEach(btn => btn.classList.remove('active'));
        
        // Add active class to clicked button
        button.classList.add('active');
        
        // Apply filter
        applyFilter(button.textContent.toLowerCase());
      });
    });
  } else {
    // Handle other errors
    renderUserEvents([]);
  }
  
  // Check auth status and update UI
  updateAuthUI();
}

/**
 * Update UI based on authentication status
 */
function updateAuthUI() {
  // Check if auth.js is loaded
  if (window.eventura && window.eventura.auth) {
    const isLoggedIn = window.eventura.auth.isLoggedIn();
    const userRole = window.eventura.auth.getUserRole();
    
    // Update dashboard link visibility
    const dashboardLink = document.querySelector('.dashboard-link');
    if (dashboardLink) {
      dashboardLink.style.display = isLoggedIn && userRole === 'organizer' ? 'block' : 'none';
    }
    
    // Update user controls
    const userControls = document.querySelector('.user-controls');
    if (userControls && isLoggedIn) {
      userControls.innerHTML = `
        <div class="search-container">
          <button class="search-toggle"><i class="fas fa-search"></i></button>
          <div class="search-form">
            <input type="text" placeholder="Search events...">
            <button type="submit"><i class="fas fa-search"></i></button>
          </div>
        </div>
        <div class="user-dropdown">
          <button class="btn btn-outline dropdown-toggle">
            <i class="fas fa-user"></i> ${window.eventura.auth.getUsername() || 'User'}
          </button>
          <div class="dropdown-menu">
            <a href="profile.html"><i class="fas fa-user-circle"></i> My Profile</a>
            ${userRole === 'organizer' ? '<a href="admin-dashboard.html"><i class="fas fa-tachometer-alt"></i> Dashboard</a>' : ''}
            <a href="my-events.html" class="active"><i class="fas fa-calendar-check"></i> My Events</a>
            <a href="#" id="logout-btn"><i class="fas fa-sign-out-alt"></i> Logout</a>
          </div>
        </div>
      `;
      
      // Add logout event listener
      const logoutBtn = document.getElementById('logout-btn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
          e.preventDefault();
          window.eventura.auth.logout();
        });
      }
    }
  }
}

// Initialize when DOM content is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Check if user is logged in
  const isLoggedIn = localStorage.getItem('token');
  
  if (!isLoggedIn) {
    // Redirect to login page if not logged in
    window.location.href = 'login.html';
    return;
  }
  
  // Initialize the page
  initMyEventsPage();
});
