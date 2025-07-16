// events.js - Handles dynamic loading of events from the backend API

/**
 * Fetch events from the backend API with optional filters
 * @param {Object} filters - Optional filters like category, date, venue, organization
 * @param {Number} page - Page number for pagination
 * @param {Number} limit - Number of events per page
 */
async function fetchEvents(filters = {}, page = 1, limit = 9) {
  try {
    // Build query string from filters
    const queryParams = new URLSearchParams();
    queryParams.append('page', page);
    queryParams.append('limit', limit);
    
    // Add any filters that are provided
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        queryParams.append(key, filters[key]);
      }
    });
    
    // Fetch events from API
    const response = await fetch(`http://localhost:5000/api/events?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch events');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching events:', error);
    showErrorMessage('Failed to load events. Please try again later.');
    return { success: false, data: [], totalPages: 0 };
  }
}

/**
 * Render event cards in the event list container
 * @param {Array} events - Array of event objects
 */
function renderEvents(events) {
  const eventListContainer = document.querySelector('.event-list');
  
  // Clear existing content
  eventListContainer.innerHTML = '';
  
  if (!events || events.length === 0) {
    eventListContainer.innerHTML = `
      <div class="no-events-message" style="grid-column: 1 / -1; text-align: center; padding: 50px 20px;">
        <i class="fas fa-calendar-times" style="font-size: 3rem; color: var(--text-secondary); margin-bottom: 20px;"></i>
        <h3>No Events Found</h3>
        <p>Try adjusting your filters or check back later for new events.</p>
      </div>
    `;
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
    
    // Create event card
    const eventCard = document.createElement('div');
    eventCard.className = 'event-card';
    eventCard.innerHTML = `
      <div class="event-image">
        <img src="${event.image || 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}" alt="${event.title}">
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
          <span>By ${event.organizer?.name || 'Unknown'}</span>
        </div>
        <a href="event-details.html?id=${event._id}" class="btn btn-secondary">Register Now</a>
      </div>
    `;
    
    eventListContainer.appendChild(eventCard);
  });
}

/**
 * Render pagination controls
 * @param {Number} currentPage - Current active page
 * @param {Number} totalPages - Total number of pages
 */
function renderPagination(currentPage, totalPages) {
  const paginationContainer = document.querySelector('.pagination');
  
  // Clear existing content
  paginationContainer.innerHTML = '';
  
  // Don't show pagination if there's only one page or no pages
  if (totalPages <= 1) {
    paginationContainer.style.display = 'none';
    return;
  } else {
    paginationContainer.style.display = 'flex';
  }
  
  // Previous page button
  const prevButton = document.createElement('a');
  prevButton.href = '#';
  prevButton.className = `pagination-item${currentPage === 1 ? ' disabled' : ''}`;
  prevButton.innerHTML = '<i class="fas fa-angle-left"></i>';
  if (currentPage > 1) {
    prevButton.addEventListener('click', (e) => {
      e.preventDefault();
      loadEvents(currentPage - 1);
    });
  }
  paginationContainer.appendChild(prevButton);
  
  // Calculate which page numbers to show
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, startPage + 4);
  
  // Adjust if we're showing fewer than 5 pages
  if (endPage - startPage < 4) {
    startPage = Math.max(1, endPage - 4);
  }
  
  // Page number buttons
  for (let i = startPage; i <= endPage; i++) {
    const pageButton = document.createElement('a');
    pageButton.href = '#';
    pageButton.className = `pagination-item${i === currentPage ? ' active' : ''}`;
    pageButton.textContent = i;
    pageButton.addEventListener('click', (e) => {
      e.preventDefault();
      if (i !== currentPage) {
        loadEvents(i);
      }
    });
    paginationContainer.appendChild(pageButton);
  }
  
  // Next page button
  const nextButton = document.createElement('a');
  nextButton.href = '#';
  nextButton.className = `pagination-item${currentPage === totalPages ? ' disabled' : ''}`;
  nextButton.innerHTML = '<i class="fas fa-angle-right"></i>';
  if (currentPage < totalPages) {
    nextButton.addEventListener('click', (e) => {
      e.preventDefault();
      loadEvents(currentPage + 1);
    });
  }
  paginationContainer.appendChild(nextButton);
}

/**
 * Show loading spinner while fetching events
 * @param {Boolean} isLoading - Whether to show or hide the loading spinner
 */
function setLoading(isLoading) {
  const eventListContainer = document.querySelector('.event-list');
  
  if (isLoading) {
    // Add loading indicator
    eventListContainer.innerHTML = `
      <div class="loading-spinner" style="grid-column: 1 / -1; display: flex; justify-content: center; align-items: center; padding: 50px 0;">
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
  }
}

/**
 * Show error message to the user
 * @param {String} message - Error message to display
 */
function showErrorMessage(message) {
  const container = document.querySelector('.events-content .container');
  
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
 * Load events with the specified filters and page
 * @param {Number} page - Page number
 */
async function loadEvents(page = 1) {
  // Show loading state
  setLoading(true);
  
  // Get filter values
  const category = document.getElementById('category').value;
  const date = document.getElementById('date').value;
  const venue = document.getElementById('venue').value;
  const organization = document.getElementById('organization').value;
  
  // Get search query if any
  const urlParams = new URLSearchParams(window.location.search);
  const searchQuery = urlParams.get('search');
  
  // Build filters object
  const filters = {
    category,
    date,
    venue,
    organization,
    search: searchQuery
  };
  
  // Fetch events from API
  const result = await fetchEvents(filters, page);
  
  if (result.success) {
    // Render events
    renderEvents(result.data);
    
    // Render pagination
    renderPagination(page, result.totalPages || 1);
    
    // Scroll to top of event list
    const eventsSection = document.querySelector('.events-content');
    eventsSection.scrollIntoView({ behavior: 'smooth' });
  } else {
    // Show error and render empty state
    renderEvents([]);
    renderPagination(1, 1);
  }
}

// Handle filter form submission
document.addEventListener('DOMContentLoaded', () => {
  // Load events on page load
  loadEvents();
  
  // Setup event listeners for filter form
  const filterForm = document.getElementById('event-filters');
  if (filterForm) {
    filterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      loadEvents(1); // Reset to first page when filters change
    });
    
    // Reset filters button
    const resetButton = filterForm.querySelector('button[type="reset"]');
    if (resetButton) {
      resetButton.addEventListener('click', () => {
        // Wait for the form to reset
        setTimeout(() => {
          loadEvents(1);
        }, 0);
      });
    }
  }
  
  // Setup search form
  const searchForm = document.querySelector('.search-form');
  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const searchInput = searchForm.querySelector('input');
      if (searchInput && searchInput.value.trim()) {
        // Add search parameter to URL
        const url = new URL(window.location.href);
        url.searchParams.set('search', searchInput.value.trim());
        window.history.pushState({}, '', url);
        
        // Load events with search
        loadEvents(1);
      }
    });
  }
  
  // Check if user is logged in to show/hide dashboard link
  updateAuthUI();
});

/**
 * Update UI based on authentication status
 */
function updateAuthUI() {
  // Check if auth.js is loaded
  if (window.eventura && window.eventura.auth) {
    const isLoggedIn = window.eventura.auth.isLoggedIn();
    const userRole = window.eventura.auth.getUserRole();
    
    // Update user controls
    const userControls = document.querySelector('.user-controls');
    if (userControls) {
      if (isLoggedIn) {
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
              <a href="my-events.html"><i class="fas fa-calendar-check"></i> My Events</a>
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
    
    // Show/hide dashboard link in main nav
    const dashboardLink = document.querySelector('.dashboard-link');
    if (dashboardLink) {
      if (isLoggedIn && userRole === 'organizer') {
        dashboardLink.style.display = 'block';
      } else {
        dashboardLink.style.display = 'none';
      }
    }
  }
}
