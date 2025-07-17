/**
 * Top Organizations Real-Time Updates
 * 
 * This script enhances the homepage by dynamically loading top organizations
 * and setting up real-time updates when organizations are created or modified.
 */

// Cache DOM elements
let orgGrid = null;
let loadingTimeout = null;

/**
 * Initialize top organizations component
 */
function initTopOrganizations() {
  // Find the organizations grid
  orgGrid = document.querySelector('.organizations-preview .organizations-grid');
  if (!orgGrid) return;
  
  // Load organizations
  loadTopOrganizations();
  
  // Register for real-time updates
  if (window.eventura && window.eventura.realtime) {
    window.eventura.realtime.addEventListener('org-created', handleNewOrganization);
    window.eventura.realtime.addEventListener('org-updated', handleOrganizationUpdate);
  }
}

/**
 * Load top organizations from API
 */
async function loadTopOrganizations() {
  if (!orgGrid) return;
  
  // Start loading animation
  startLoading();
  
  try {
    const response = await fetch('http://localhost:5000/api/organizations/featured');
    if (!response.ok) throw new Error('Failed to fetch organizations');
    
    const data = await response.json();
    displayOrganizations(data.organizations || []);
  } catch (error) {
    console.error('Error loading top organizations:', error);
    displayError();
  } finally {
    // Stop loading animation
    stopLoading();
  }
}

/**
 * Display organizations in the grid
 * @param {Array} organizations - List of organizations to display
 */
function displayOrganizations(organizations) {
  if (!orgGrid) return;
  
  // Clear existing content
  orgGrid.innerHTML = '';
  
  if (organizations.length === 0) {
    orgGrid.innerHTML = `
      <div class="no-orgs-message">
        <i class="far fa-building"></i>
        <p>No organizations found.</p>
      </div>
    `;
    return;
  }
  
  // Create organization cards (limited to 4)
  organizations.slice(0, 4).forEach(org => {
    orgGrid.appendChild(createOrganizationCard(org));
  });
}

/**
 * Create an organization card element
 * @param {Object} org - Organization data
 * @returns {HTMLElement} Organization card element
 */
function createOrganizationCard(org) {
  // Create the card element
  const cardElement = document.createElement('a');
  cardElement.href = `organization-details.html?id=${org._id}`;
  cardElement.className = 'org-card';
  cardElement.dataset.orgId = org._id;
  
  // Default image if none provided
  const logoSrc = org.logo || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80';
  
  // Set HTML content
  cardElement.innerHTML = `
    <img src="${logoSrc}" alt="${org.name}">
    <h3>${org.name}</h3>
  `;
  
  // Add animation class
  cardElement.classList.add('fade-in');
  
  return cardElement;
}

/**
 * Display error message
 */
function displayError() {
  if (!orgGrid) return;
  
  orgGrid.innerHTML = `
    <div class="error-message">
      <i class="fas fa-exclamation-circle"></i>
      <p>Failed to load organizations. Please try again later.</p>
      <button class="btn btn-outline btn-sm" onclick="loadTopOrganizations()">Retry</button>
    </div>
  `;
}

/**
 * Start loading animation
 */
function startLoading() {
  if (!orgGrid) return;
  
  // Don't show loading state immediately for better UX
  loadingTimeout = setTimeout(() => {
    orgGrid.innerHTML = `
      <div class="loading-indicator">
        <div class="spinner"></div>
        <p>Loading organizations...</p>
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
 * Handle new organization creation in real-time
 * @param {Object} data - Organization data from WebSocket
 */
function handleNewOrganization(data) {
  // Only update if we're on the homepage and the organization grid exists
  if (!orgGrid) return;
  
  const org = data.organization;
  if (!org) return;
  
  // Get current organizations
  const currentOrgs = Array.from(orgGrid.querySelectorAll('.org-card'));
  
  // If we already have 4 or more orgs, remove the last one
  if (currentOrgs.length >= 4) {
    currentOrgs[currentOrgs.length - 1].remove();
  }
  
  // Create and insert the new org card at the beginning
  const newCard = createOrganizationCard(org);
  newCard.classList.add('highlight-new');
  
  if (currentOrgs.length > 0) {
    orgGrid.insertBefore(newCard, orgGrid.firstChild);
  } else {
    orgGrid.appendChild(newCard);
  }
  
  // Remove highlight after 3 seconds
  setTimeout(() => {
    newCard.classList.remove('highlight-new');
  }, 3000);
}

/**
 * Handle organization update in real-time
 * @param {Object} data - Organization data from WebSocket
 */
function handleOrganizationUpdate(data) {
  // Only update if we're on the homepage and the organization grid exists
  if (!orgGrid) return;
  
  const org = data.organization;
  if (!org) return;
  
  // Find existing card
  const existingCard = orgGrid.querySelector(`.org-card[data-org-id="${org._id}"]`);
  if (!existingCard) return;
  
  // Replace with updated card
  const updatedCard = createOrganizationCard(org);
  updatedCard.classList.add('highlight-update');
  existingCard.replaceWith(updatedCard);
  
  // Remove highlight after 3 seconds
  setTimeout(() => {
    updatedCard.classList.remove('highlight-update');
  }, 3000);
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initTopOrganizations);

// Expose functions globally
window.loadTopOrganizations = loadTopOrganizations;
