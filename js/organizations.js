// organizations.js - Frontend script to fetch and display organizations

/**
 * Global variables
 */
let currentPage = 1;
let totalPages = 1;
let currentCategory = 'All';
let currentSearchTerm = '';
let userRole = '';

/**
 * Initialize the page
 */
document.addEventListener('DOMContentLoaded', async function() {
  try {
    // Get user role from local storage
    userRole = localStorage.getItem('userRole') || '';
    
    // Manage create organization section visibility
    manageCreateOrgVisibility();
    
    // Show organizer-specific message if applicable
    setTimeout(() => {
      // Use setTimeout to ensure DOM is fully loaded and container is available
      if (userRole === 'organizer') {
        showOrganizerMessage();
        // Debug function to check organization access
        checkOrganizerAccess();
      }
    }, 0);
    
    // Add event listener for login/logout events
    window.addEventListener('storage', function(e) {
      if (e.key === 'userRole' || e.key === 'token' || e.key === 'userId') {
        console.log('Auth state changed, updating UI');
        userRole = localStorage.getItem('userRole') || '';
        manageCreateOrgVisibility();
        
        // Refresh organizations if user is now an organizer or was an organizer
        if (userRole === 'organizer' || e.oldValue === 'organizer') {
          loadOrganizations();
          
          // Handle organizer message
          const existingMessage = document.querySelector('.organizer-message');
          if (existingMessage) {
            existingMessage.remove();
          }
          
          if (userRole === 'organizer') {
            showOrganizerMessage();
          }
        }
      }
    });
    
    // Listen for custom auth events (login/logout in same tab)
    window.addEventListener('authStateChanged', function(event) {
      console.log('Auth state changed event:', event.detail);
      userRole = localStorage.getItem('userRole') || '';
      manageCreateOrgVisibility();
      
      // Refresh organizations if user role changed
      loadOrganizations();
      
      // Handle organizer message
      const existingMessage = document.querySelector('.organizer-message');
      if (existingMessage) {
        existingMessage.remove();
      }
      
      if (userRole === 'organizer') {
        showOrganizerMessage();
      }
    });
    
    await checkServerStatus();
    
    // Setup event listeners
    setupEventListeners();
    
    // Load organizations data
    await loadInitialData();
  } catch (error) {
    console.error('Failed to initialize page:', error);
    showErrorMessage('There was a problem loading the organizations. Please try again later.');
  }
});

/**
 * Manage visibility of Create Organization section based on user role
 */
function manageCreateOrgVisibility() {
  const createOrgSection = document.querySelector('.create-org-section');
  if (!createOrgSection) return;
  
  // Get the latest user role directly from localStorage (in case it changed)
  const currentUserRole = localStorage.getItem('userRole');
  
  // If user is logged in as an organizer, hide the Create Organization section
  if (currentUserRole === 'organizer') {
    createOrgSection.style.display = 'none';
    console.log('Hiding create organization section for organizer');
    
    // Add a CSS rule to ensure it stays hidden even if other scripts try to show it
    const style = document.createElement('style');
    style.id = 'organizer-style';
    style.textContent = '.create-org-section { display: none !important; }';
    
    // Only add if it doesn't already exist
    if (!document.getElementById('organizer-style')) {
      document.head.appendChild(style);
    }
  } else {
    createOrgSection.style.display = 'block';
    // Remove the enforced style if it exists
    const existingStyle = document.getElementById('organizer-style');
    if (existingStyle) {
      existingStyle.remove();
    }
  }
}

/**
 * Display organizer-specific message
 */
function showOrganizerMessage() {
  // Find the first container after the header
  const container = document.querySelector('.container');
  if (!container) return;
  
  // Check if message already exists to prevent duplicates
  const existingMessage = document.querySelector('.organizer-message');
  if (existingMessage) {
    return; // Message already shown
  }
  
  const messageEl = document.createElement('div');
  messageEl.className = 'server-message info organizer-message';
  messageEl.innerHTML = `
    <i class="fas fa-info-circle"></i>
    <p><strong>Organizer View:</strong> You are only seeing organizations you manage. To create or manage your organizations, visit your <a href="admin-dashboard.html" style="color: var(--primary-blue); text-decoration: underline;">dashboard</a>.</p>
  `;
  
  // Find a better insertion point - after filter bar or as the first element of categories section
  const filterBar = document.querySelector('.filter-bar');
  const categoriesSection = document.querySelector('.categories-section');
  
  if (filterBar) {
    // Insert after filter bar
    filterBar.parentNode.insertBefore(messageEl, filterBar.nextSibling);
  } else if (categoriesSection) {
    // Insert before categories section
    categoriesSection.parentNode.insertBefore(messageEl, categoriesSection);
  } else {
    // Fallback: insert at the start of container
    container.prepend(messageEl);
  }
}

/**
 * Check if the backend server is available
 */
async function checkServerStatus() {
  try {
    const response = await fetch('http://localhost:5000/', { 
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache'
      }
    });
    
    if (!response.ok) {
      throw new Error('Server returned error status');
    }
    
    console.log('✅ Server is available');
    sessionStorage.setItem('serverStatus', 'online');
    return true;
  } catch (error) {
    console.warn('⚠️ Server is unavailable:', error);
    sessionStorage.setItem('serverStatus', 'offline');
    
    // Check if we have cached data
    const cachedOrgs = localStorage.getItem('cachedOrganizations');
    
    if (!cachedOrgs) {
      showDemoDataMessage();
    } else {
      showWarningMessage('Server is offline. Displaying cached data which may be outdated.');
    }
    
    return false;
  }
}

/**
 * Set up event listeners for the page
 */
function setupEventListeners() {
  // Filter tags click
  const filterTags = document.querySelectorAll('.filter-tag');
  filterTags.forEach(tag => {
    tag.addEventListener('click', function() {
      filterTags.forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      currentCategory = this.textContent;
      currentPage = 1;
      loadOrganizations();
    });
  });
  
  // Search input
  const searchInput = document.querySelector('.search-filter input');
  if (searchInput) {
    // Debounce search to avoid too many requests
    let searchTimeout;
    searchInput.addEventListener('input', function(e) {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        currentSearchTerm = e.target.value;
        currentPage = 1;
        loadOrganizations();
      }, 500);
    });
  }
  
  // Pagination
  document.querySelector('.pagination').addEventListener('click', function(e) {
    if (e.target.classList.contains('pagination-item') && !e.target.classList.contains('disabled')) {
      const pageText = e.target.textContent;
      
      if (pageText === '«') {
        // Previous page
        if (currentPage > 1) {
          currentPage--;
          loadOrganizations();
        }
      } else if (pageText === '»') {
        // Next page
        if (currentPage < totalPages) {
          currentPage++;
          loadOrganizations();
        }
      } else {
        // Specific page number
        currentPage = parseInt(pageText);
        loadOrganizations();
      }
    }
  });
  
  // Follow buttons
  document.addEventListener('click', async function(e) {
    if (e.target.classList.contains('follow-btn') || e.target.closest('.follow-btn')) {
      const button = e.target.classList.contains('follow-btn') ? e.target : e.target.closest('.follow-btn');
      const orgId = button.dataset.orgId;
      
      if (orgId) {
        await followOrganization(orgId, button);
      }
    }
  });
}

/**
 * Load initial data including featured org and categories
 */
async function loadInitialData() {
  // Load organizations
  await loadOrganizations();
  
  // Load categories
  await loadCategories();
  
  // Load featured organization
  await loadFeaturedOrganization();
}

/**
 * Load organizations with current filters
 */
async function loadOrganizations() {
  const organizationsGrid = document.querySelector('.organizations-grid');
  
  if (!organizationsGrid) return;
  
  // Show loading state
  organizationsGrid.innerHTML = getLoadingHTML();
  
  try {
    // Check if server is online or we're using cached data
    const isServerOnline = sessionStorage.getItem('serverStatus') === 'online';
    let organizations = [];
    
    if (isServerOnline) {
      // Build query parameters
      const params = new URLSearchParams({
        page: currentPage,
        limit: 6
      });
      
      if (currentCategory && currentCategory !== 'All') {
        params.append('category', currentCategory);
      }
      
      if (currentSearchTerm) {
        params.append('search', currentSearchTerm);
      }
      
      // Get user role and ID
      const userRole = localStorage.getItem('userRole');
      const userId = localStorage.getItem('userId');
      
      // If user is an organizer, filter to show only organizations they manage
      if (userRole === 'organizer' && userId) {
        params.append('adminUser', userId);
        console.log('Filtering organizations for organizer:', userId);
        
        // Create a special header to ensure proper ID comparison in MongoDB
        headers['X-User-Is-Organizer'] = 'true';
      }
      
      // Add authorization token if available
      const headers = { 'Content-Type': 'application/json' };
      const token = localStorage.getItem('token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const apiUrl = `http://localhost:5000/api/organizations?${params.toString()}`;
      console.log('Fetching organizations from:', apiUrl);
      
      const response = await fetch(apiUrl, {
        headers: headers
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }
      
      const data = await response.json();
      organizations = data.organizations;
      totalPages = data.pagination.totalPages;
      
      // Log the fetched organizations for debugging
      console.log(`Fetched ${organizations.length} organizations:`, organizations);
      console.log('User role:', userRole);
      console.log('User ID:', userId);
      
      // Cache the organizations data
      localStorage.setItem('cachedOrganizations', JSON.stringify(organizations));
      localStorage.setItem('cachedOrganizationsTimestamp', new Date().toISOString());
    } else {
      // Use cached data
      organizations = JSON.parse(localStorage.getItem('cachedOrganizations') || '[]');
      
      // Apply client-side filtering since we're offline
      if (currentCategory && currentCategory !== 'All') {
        organizations = organizations.filter(org => org.category === currentCategory);
      }
      
      if (currentSearchTerm) {
        const searchLower = currentSearchTerm.toLowerCase();
        organizations = organizations.filter(org => 
          org.name.toLowerCase().includes(searchLower) || 
          org.description.toLowerCase().includes(searchLower)
        );
      }
      
      // Handle pagination
      const startIdx = (currentPage - 1) * 6;
      const endIdx = startIdx + 6;
      const paginatedOrgs = organizations.slice(startIdx, endIdx);
      totalPages = Math.ceil(organizations.length / 6);
      organizations = paginatedOrgs;
    }
    
    // If no organizations found
    if (organizations.length === 0) {
      const userRole = localStorage.getItem('userRole');
      
      if (userRole === 'organizer') {
        organizationsGrid.innerHTML = `
          <div class="no-results">
            <i class="fas fa-building" style="font-size: 48px; color: var(--text-secondary); margin-bottom: 20px;"></i>
            <h3>No organizations found</h3>
            <p>You don't manage any organizations in this category. You can create a new organization from your dashboard.</p>
            <div style="display: flex; gap: 15px; justify-content: center; margin-top: 20px;">
              <a href="admin-dashboard.html" class="btn btn-primary">Go to Dashboard</a>
              <a href="admin-dashboard.html?section=create-org" class="btn btn-secondary">Create Organization</a>
            </div>
          </div>
        `;
      } else {
        organizationsGrid.innerHTML = `
          <div class="no-results">
            <i class="fas fa-search" style="font-size: 48px; color: var(--text-secondary); margin-bottom: 20px;"></i>
            <h3>No organizations found</h3>
            <p>Try changing your search criteria or category filter</p>
          </div>
        `;
      }
    } else {
      // Render organizations
      organizationsGrid.innerHTML = organizations.map(org => getOrganizationCardHTML(org)).join('');
    }
    
    // Update pagination
    updatePagination(currentPage, totalPages);
    
  } catch (error) {
    console.error('Error loading organizations:', error);
    organizationsGrid.innerHTML = getErrorHTML('Failed to load organizations. Please try again later.');
    
    // If we're online but got an error, try to use cached data as fallback
    const cachedOrgs = localStorage.getItem('cachedOrganizations');
    if (cachedOrgs) {
      try {
        const organizations = JSON.parse(cachedOrgs);
        if (organizations.length > 0) {
          showWarningMessage('Using cached data because we had trouble connecting to the server.');
          organizationsGrid.innerHTML = organizations.map(org => getOrganizationCardHTML(org)).join('');
        }
      } catch (cacheError) {
        console.error('Error parsing cached organizations:', cacheError);
      }
    }
  }
}

/**
 * Load organization categories
 */
async function loadCategories() {
  const categoryCards = document.querySelector('.category-cards');
  
  if (!categoryCards) return;
  
  try {
    const isServerOnline = sessionStorage.getItem('serverStatus') === 'online';
    let categories = [];
    
    if (isServerOnline) {
      const response = await fetch('http://localhost:5000/api/organizations/categories');
      
      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }
      
      categories = await response.json();
      
      // Cache the categories
      localStorage.setItem('cachedCategories', JSON.stringify(categories));
    } else {
      // Use cached categories or default ones
      const cachedCategories = localStorage.getItem('cachedCategories');
      
      if (cachedCategories) {
        categories = JSON.parse(cachedCategories);
      } else {
        // Default categories with estimated counts
        categories = [
          { _id: 'Technology', count: 24 },
          { _id: 'Science', count: 18 },
          { _id: 'Arts', count: 15 },
          { _id: 'Sports', count: 22 },
          { _id: 'Cultural', count: 17 }
        ];
      }
    }
    
    // Update category count text
    const categoryElements = document.querySelectorAll('.category-card');
    categoryElements.forEach(categoryEl => {
      const categoryTitle = categoryEl.querySelector('h3').textContent;
      const categoryCountEl = categoryEl.querySelector('.category-count');
      
      // Find matching category
      const matchingCategory = categories.find(c => c._id === categoryTitle);
      
      if (matchingCategory) {
        const count = matchingCategory.count;
        categoryCountEl.textContent = `${count} ${count === 1 ? 'club' : 'clubs'}`;
      }
    });
    
  } catch (error) {
    console.error('Error loading categories:', error);
  }
}

/**
 * Load featured organization
 */
async function loadFeaturedOrganization() {
  const featuredContainer = document.getElementById('featured-organization-container');
  
  if (!featuredContainer) return;
  
  // Show loading state
  featuredContainer.innerHTML = `<div class="loading-shimmer" style="height: 300px; width: 100%; border-radius: 16px;"></div>`;
  
  try {
    const isServerOnline = sessionStorage.getItem('serverStatus') === 'online';
    let featuredOrg = null;
    
    if (isServerOnline) {
      const response = await fetch('http://localhost:5000/api/organizations/featured');
      
      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }
      
      const featuredOrgs = await response.json();
      featuredOrg = featuredOrgs[0] || null;
      
      // Cache the featured org
      if (featuredOrg) {
        localStorage.setItem('cachedFeaturedOrg', JSON.stringify(featuredOrg));
      }
    } else {
      // Use cached featured org
      const cachedFeaturedOrg = localStorage.getItem('cachedFeaturedOrg');
      
      if (cachedFeaturedOrg) {
        featuredOrg = JSON.parse(cachedFeaturedOrg);
      }
    }
    
    // If no featured org, use the first organization from the list
    if (!featuredOrg) {
      const cachedOrgs = localStorage.getItem('cachedOrganizations');
      if (cachedOrgs) {
        const organizations = JSON.parse(cachedOrgs);
        if (organizations.length > 0) {
          featuredOrg = organizations[0];
        }
      }
    }
    
    // If we still don't have a featured org, show an error message
    if (!featuredOrg) {
      featuredContainer.innerHTML = `
        <div style="text-align: center; padding: 50px 20px; background: var(--surface-dark); border-radius: 12px;">
          <i class="fas fa-info-circle" style="font-size: 48px; color: var(--text-secondary); margin-bottom: 20px;"></i>
          <h3>No featured organization available</h3>
          <p>Check back later for featured organizations</p>
        </div>
      `;
      return;
    }
    
    // Check if user is an organizer
    const isOrganizer = localStorage.getItem('userRole') === 'organizer';
    
    // Render featured organization
    featuredContainer.innerHTML = `
      <div class="featured-org-card">
        <div class="featured-org-image">
          <img src="${featuredOrg.coverImage || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'}" alt="${featuredOrg.name}">
          ${isOrganizer ? `<span class="org-badge featured-org-badge"><i class="fas fa-eye"></i> You manage this</span>` : ''}
        </div>
        <div class="featured-org-content">
          <h3>${featuredOrg.name}</h3>
          <p>${featuredOrg.description}</p>
          <div class="featured-org-stats">
            <div class="featured-org-stat">
              <i class="fas fa-users"></i>
              <span>${featuredOrg.stats?.totalMembers || 0} Members</span>
            </div>
            <div class="featured-org-stat">
              <i class="fas fa-calendar-check"></i>
              <span>${featuredOrg.stats?.totalEvents || 0} Events</span>
            </div>
            <div class="featured-org-stat">
              <i class="fas fa-star"></i>
              <span>Featured</span>
            </div>
          </div>
          <div class="featured-org-actions">
            <a href="organization-details.html?id=${featuredOrg._id}" class="btn btn-primary">View Details</a>
            ${!isOrganizer ? `<button class="btn btn-outline follow-btn" data-org-id="${featuredOrg._id}">Follow</button>` : ''}
          </div>
        </div>
      </div>
    `;
    
    // Update follow button state
    const followBtn = featuredContainer.querySelector('.follow-btn');
    if (followBtn) {
      updateFollowButtonState(followBtn, featuredOrg);
    }
    
  } catch (error) {
    console.error('Error loading featured organization:', error);
  }
}

/**
 * Follow or unfollow an organization
 */
async function followOrganization(orgId, buttonElement) {
  try {
    // Get token and user role from localStorage
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    
    // If not logged in, redirect to login page
    if (!token) {
      window.location.href = `login.html?returnUrl=${encodeURIComponent(window.location.href)}`;
      return;
    }
    
    // If the user is an organizer, they shouldn't be able to follow organizations
    if (userRole === 'organizer') {
      showWarningMessage('As an organizer, you cannot follow organizations.');
      return;
    }
    
    // Toggle follow state optimistically
    const isCurrentlyFollowing = buttonElement.classList.contains('following');
    updateFollowButtonUI(buttonElement, !isCurrentlyFollowing);
    
    // Send API request
    const response = await fetch(`http://localhost:5000/api/organizations/${orgId}/follow`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Server responded with status ${response.status}`);
    }
    
    const data = await response.json();
    
    // Update button to reflect actual server state
    updateFollowButtonUI(buttonElement, data.isFollowing);
    
    // Show success message
    showSuccessMessage(data.message);
    
  } catch (error) {
    console.error('Error following organization:', error);
    showErrorMessage('Failed to update follow status. Please try again later.');
    
    // Revert button to original state
    updateFollowButtonUI(buttonElement, !buttonElement.classList.contains('following'));
  }
}

/**
 * Update the pagination UI
 */
function updatePagination(currentPage, totalPages) {
  const pagination = document.querySelector('.pagination');
  
  if (!pagination) return;
  
  let paginationHTML = `
    <a class="pagination-item ${currentPage === 1 ? 'disabled' : ''}">«</a>
  `;
  
  // Calculate range of pages to show
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, startPage + 4);
  
  // Adjust start page if needed
  if (endPage - startPage < 4) {
    startPage = Math.max(1, endPage - 4);
  }
  
  // Generate page links
  for (let i = startPage; i <= endPage; i++) {
    paginationHTML += `
      <a class="pagination-item ${i === currentPage ? 'active' : ''}">${i}</a>
    `;
  }
  
  paginationHTML += `
    <a class="pagination-item ${currentPage === totalPages ? 'disabled' : ''}">»</a>
  `;
  
  pagination.innerHTML = paginationHTML;
}

/**
 * Show error message
 */
function showErrorMessage(message) {
  const container = document.querySelector('.container');
  if (!container) return;
  
  const messageEl = document.createElement('div');
  messageEl.className = 'server-message error';
  messageEl.innerHTML = `
    <i class="fas fa-exclamation-circle"></i>
    <p>${message}</p>
  `;
  
  container.insertBefore(messageEl, container.firstChild);
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    messageEl.remove();
  }, 5000);
}

/**
 * Show warning message
 */
function showWarningMessage(message) {
  const container = document.querySelector('.container');
  if (!container) return;
  
  const messageEl = document.createElement('div');
  messageEl.className = 'server-message warning';
  messageEl.innerHTML = `
    <i class="fas fa-exclamation-triangle"></i>
    <p>${message}</p>
  `;
  
  container.insertBefore(messageEl, container.firstChild);
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    messageEl.remove();
  }, 5000);
}

/**
 * Show success message
 */
function showSuccessMessage(message) {
  const container = document.querySelector('.container');
  if (!container) return;
  
  const messageEl = document.createElement('div');
  messageEl.className = 'server-message info';
  messageEl.innerHTML = `
    <i class="fas fa-check-circle"></i>
    <p>${message}</p>
  `;
  
  container.insertBefore(messageEl, container.firstChild);
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    messageEl.remove();
  }, 5000);
}

/**
 * Show a message with specified type
 */
function showMessage(message, type = 'info') {
  // Check if there's already a message container
  let messageElement = document.getElementById('message-container');
  
  if (!messageElement) {
    // Create message container
    messageElement = document.createElement('div');
    messageElement.id = 'message-container';
    messageElement.style.position = 'fixed';
    messageElement.style.top = '80px';
    messageElement.style.left = '50%';
    messageElement.style.transform = 'translateX(-50%)';
    messageElement.style.zIndex = '9999';
    messageElement.style.maxWidth = '90%';
    messageElement.style.width = '400px';
    messageElement.style.padding = '15px 20px';
    messageElement.style.borderRadius = '8px';
    messageElement.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
    messageElement.style.animation = 'slideDown 0.3s forwards';
    document.body.appendChild(messageElement);
    
    // Add style for animation
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      @keyframes slideDown {
        from { transform: translate(-50%, -20px); opacity: 0; }
        to { transform: translate(-50%, 0); opacity: 1; }
      }
    `;
    document.head.appendChild(styleElement);
  }
  
  // Set style based on message type
  switch (type) {
    case 'error':
      messageElement.style.backgroundColor = 'rgba(235, 87, 87, 0.95)';
      messageElement.style.color = 'white';
      messageElement.style.borderLeft = '5px solid #d32f2f';
      break;
    case 'warning':
      messageElement.style.backgroundColor = 'rgba(255, 193, 7, 0.95)';
      messageElement.style.color = '#212121';
      messageElement.style.borderLeft = '5px solid #ff8f00';
      break;
    case 'success':
      messageElement.style.backgroundColor = 'rgba(39, 174, 96, 0.95)';
      messageElement.style.color = 'white';
      messageElement.style.borderLeft = '5px solid #219653';
      break;
    default:
      messageElement.style.backgroundColor = 'rgba(33, 150, 243, 0.95)';
      messageElement.style.color = 'white';
      messageElement.style.borderLeft = '5px solid #1565c0';
  }
  
  // Set message content
  messageElement.innerHTML = `
    <div style="display: flex; align-items: center;">
      <span>${message}</span>
      <button style="margin-left: auto; background: none; border: none; color: inherit; font-size: 20px; cursor: pointer; padding: 0 0 0 15px;">&times;</button>
    </div>
  `;
  
  // Add click handler to close button
  messageElement.querySelector('button').addEventListener('click', function() {
    messageElement.remove();
  });
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    if (messageElement.parentNode) {
      messageElement.remove();
    }
  }, 5000);
}

/**
 * Show the demo data message when server is offline and no cache
 */
function showDemoDataMessage() {
  // Create a message at the top of the organizations list
  const demoMessageHTML = `
    <div class="demo-message" style="background: rgba(33, 150, 243, 0.1); border: 1px solid rgba(33, 150, 243, 0.3); border-radius: 8px; padding: 15px 20px; margin-bottom: 30px; display: flex; align-items: center;">
      <i class="fas fa-info-circle" style="font-size: 24px; color: var(--primary-blue); margin-right: 15px;"></i>
      <div>
        <h3 style="margin: 0 0 5px 0; color: var(--primary-blue);">Demo Mode</h3>
        <p style="margin: 0; color: var(--text-secondary);">
          Server is offline. Displaying sample organizations data.
        </p>
      </div>
    </div>
  `;
  
  // Insert the message before the filter bar
  const filterBar = document.querySelector('.filter-bar');
  if (filterBar) {
    const demoMessage = document.createElement('div');
    demoMessage.innerHTML = demoMessageHTML;
    filterBar.parentNode.insertBefore(demoMessage.firstElementChild, filterBar);
  }
}

/**
 * Update follow button state based on organization data
 */
function updateFollowButtonState(button, organization) {
  // Get user ID from token
  const token = localStorage.getItem('token');
  let userId = null;
  
  if (token) {
    try {
      // Decode JWT token to get user ID
      const tokenParts = token.split('.');
      if (tokenParts.length === 3) {
        const payload = JSON.parse(atob(tokenParts[1]));
        userId = payload.id;
      }
    } catch (error) {
      console.error('Error decoding token:', error);
    }
  }
  
  // Check if user follows this org
  let isFollowing = false;
  
  if (userId && organization.followers) {
    isFollowing = organization.followers.some(
      follower => follower.userId === userId
    );
  }
  
  // Update button UI
  updateFollowButtonUI(button, isFollowing);
}

/**
 * Update the follow button UI
 */
function updateFollowButtonUI(button, isFollowing) {
  if (isFollowing) {
    button.innerHTML = '<i class="fas fa-bell-slash"></i> Unfollow';
    button.classList.add('following');
  } else {
    button.innerHTML = 'Follow';
    button.classList.remove('following');
  }
}

/**
 * Get HTML for organization card
 */
function getOrganizationCardHTML(org) {
  const isOrganizer = localStorage.getItem('userRole') === 'organizer';
  
  return `
    <div class="org-card">
      <div class="org-cover">
        <img src="${org.coverImage || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}" alt="${org.name}">
        <div class="org-logo">
          <img src="${org.logo || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(org.name)}`}" alt="${org.name} Logo">
        </div>
        <span class="org-type">${org.category}</span>
        ${isOrganizer ? `<span class="org-badge"><i class="fas fa-eye"></i> You manage this</span>` : ''}
      </div>
      <div class="org-content">
        <h3 class="org-name">${org.name}</h3>
        <p class="org-description">${org.description}</p>
        <div class="org-meta">
          <div class="org-stats">
            <div class="org-stat">
              <i class="fas fa-users"></i>
              <span>${org.stats?.totalMembers || 0}</span>
            </div>
            <div class="org-stat">
              <i class="fas fa-calendar-check"></i>
              <span>${org.stats?.totalEvents || 0}</span>
            </div>
          </div>
          <a href="organization-details.html?id=${org._id}" class="org-action">
            <i class="fas fa-arrow-right"></i>
          </a>
        </div>
      </div>
    </div>
  `;
}

/**
 * Get loading HTML placeholder
 */
function getLoadingHTML() {
  let html = '';
  
  for (let i = 0; i < 6; i++) {
    html += `
      <div class="org-card loading-card">
        <div class="org-cover loading-shimmer" style="height: 120px;"></div>
        <div class="org-content">
          <div class="loading-shimmer" style="height: 24px; width: 60%; margin-bottom: 10px;"></div>
          <div class="loading-shimmer" style="height: 16px; width: 90%; margin-bottom: 8px;"></div>
          <div class="loading-shimmer" style="height: 16px; width: 80%; margin-bottom: 20px;"></div>
          <div class="org-meta">
            <div class="org-stats">
              <div class="loading-shimmer" style="height: 16px; width: 40px;"></div>
              <div class="loading-shimmer" style="height: 16px; width: 40px; margin-left: 15px;"></div>
            </div>
            <div class="loading-shimmer" style="height: 32px; width: 32px; border-radius: 50%;"></div>
          </div>
        </div>
      </div>
    `;
  }
  
  return html;
}

/**
 * Get error HTML message
 */
function getErrorHTML(message) {
  return `
    <div style="text-align: center; padding: 50px 20px; background: var(--surface-dark); border-radius: 12px; grid-column: 1 / -1;">
      <i class="fas fa-exclamation-circle" style="font-size: 48px; color: var(--primary-blue); margin-bottom: 20px;"></i>
      <h3>${message}</h3>
      <button class="btn btn-primary" style="margin-top: 20px;" onclick="loadOrganizations()">Try Again</button>
    </div>
  `;
}

/**
 * Debug function to check if user ID matches adminUser in organizations
 */
async function checkOrganizerAccess() {
  const userId = localStorage.getItem('userId');
  const userRole = localStorage.getItem('userRole');
  const token = localStorage.getItem('token');
  
  if (userRole !== 'organizer' || !userId || !token) {
    console.log('Not an organizer or missing credentials');
    return;
  }
  
  try {
    // Direct API call to get organizations without filtering
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`http://localhost:5000/api/organizations`, {
      headers: headers
    });
    
    if (!response.ok) {
      throw new Error(`Server responded with status ${response.status}`);
    }
    
    const data = await response.json();
    const allOrgs = data.organizations || [];
    
    // Find organizations where this user is the admin
    const userOrgs = allOrgs.filter(org => org.adminUser === userId || 
                                         (org.adminUser && org.adminUser._id === userId));
    
    console.log('All organizations:', allOrgs);
    console.log('User ID:', userId);
    console.log('Organizations where user is admin:', userOrgs);
    
    if (userOrgs.length === 0) {
      console.warn('⚠️ User is an organizer but does not manage any organizations!');
      // This could mean either:
      // 1. The user is newly registered as an organizer and hasn't created any orgs
      // 2. There's a mismatch between userId and adminUser fields
    }
    
    return userOrgs;
  } catch (error) {
    console.error('Error checking organizer access:', error);
    return [];
  }
}
