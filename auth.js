/**
 * Eventura Authentication and Dashboard Visibility Script
 * 
 * This script handles checking user login status and controlling dashboard visibility
 * for organizers across the entire site.
 */

// Check login status when the page loads
document.addEventListener('DOMContentLoaded', function() {
    checkLoginStatus();
});

/**
 * Checks if the user is logged in and updates the UI accordingly
 */
function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userRole = localStorage.getItem('userRole');
    const userName = localStorage.getItem('userName');
    const userEmail = localStorage.getItem('userEmail');
    
    // Get UI elements
    const loginButton = document.querySelector('.user-controls a.btn-outline');
    const signupButton = document.querySelector('.user-controls a.btn-primary');
    const userControls = document.querySelector('.user-controls');
    const dashboardLink = document.querySelector('.dashboard-link');
    
    if (isLoggedIn && userName) {
        // User is logged in - replace login/signup with user dropdown
        if (loginButton && signupButton && userControls) {
            // Remove login and signup buttons
            loginButton.remove();
            signupButton.remove();
            
            // Create user dropdown
            const userDropdown = createUserDropdown(userName, userRole);
            userControls.appendChild(userDropdown);
            
            // Setup the dropdown toggle functionality
            setupDropdownToggle();
        }
        
        // Show dashboard link only for organizers
        if (dashboardLink && userRole === 'organizer') {
            dashboardLink.classList.add('visible');
        } else if (dashboardLink) {
            dashboardLink.classList.remove('visible');
        }
    } else {
        // User is not logged in
        if (dashboardLink) {
            dashboardLink.classList.remove('visible');
        }
    }
}

/**
 * Sets up click event handling for user dropdown
 */
function setupDropdownToggle() {
    const dropdownToggle = document.querySelector('.dropdown-toggle');
    const dropdownContent = document.querySelector('.dropdown-content');
    
    if (dropdownToggle && dropdownContent) {
        // Add click event to toggle dropdown
        dropdownToggle.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent event from bubbling up
            dropdownContent.classList.toggle('active');
        });
        
        // Close dropdown when clicking elsewhere on the document
        document.addEventListener('click', function(e) {
            // Only close if clicking outside the dropdown
            if (!e.target.closest('.user-dropdown')) {
                dropdownContent.classList.remove('active');
            }
        });
        
        // Add keyboard accessibility
        dropdownToggle.setAttribute('tabindex', '0');
        dropdownToggle.setAttribute('role', 'button');
        dropdownToggle.setAttribute('aria-haspopup', 'true');
        dropdownToggle.setAttribute('aria-expanded', 'false');
        
        dropdownToggle.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                dropdownContent.classList.toggle('active');
                this.setAttribute('aria-expanded', dropdownContent.classList.contains('active'));
            }
        });
    }
}

/**
 * Creates user dropdown element for logged in user
 */
function createUserDropdown(userName, userRole) {
    // Create dropdown container
    const dropdown = document.createElement('div');
    dropdown.className = 'user-dropdown';
    
    // Create dropdown toggle
    const toggle = document.createElement('div');
    toggle.className = 'dropdown-toggle';
    
    // Add user avatar
    const avatar = document.createElement('img');
    avatar.className = 'user-avatar';
    avatar.src = 'https://api.dicebear.com/7.x/initials/svg?seed=' + userName;
    avatar.alt = 'User Avatar';
    
    // Add username
    const nameSpan = document.createElement('span');
    nameSpan.textContent = userName;
    
    // Add dropdown caret
    const caret = document.createElement('i');
    caret.className = 'fas fa-caret-down';
    caret.style.marginLeft = '5px';
    caret.setAttribute('aria-hidden', 'true'); // Hide from screen readers
    
    // Assemble toggle button
    toggle.appendChild(avatar);
    toggle.appendChild(nameSpan);
    toggle.appendChild(caret);
    
    // Create dropdown content
    const dropdownContent = document.createElement('div');
    dropdownContent.className = 'dropdown-content';
    dropdownContent.setAttribute('role', 'menu');
    
    // Add dropdown links based on role
    dropdownContent.innerHTML = `
        <a href="profile.html" role="menuitem"><i class="fas fa-user"></i> My Profile</a>
        ${userRole === 'organizer' ? '<a href="admin-dashboard.html" role="menuitem"><i class="fas fa-tachometer-alt"></i> Dashboard</a>' : ''}
        <a href="my-events.html" role="menuitem"><i class="fas fa-calendar-check"></i> My Events</a>
        <div class="divider"></div>
        <a href="#" id="logout-link" role="menuitem"><i class="fas fa-sign-out-alt"></i> Logout</a>
    `;
    
    // Assemble dropdown
    dropdown.appendChild(toggle);
    dropdown.appendChild(dropdownContent);
    
    // Add logout functionality
    setTimeout(() => {
        const logoutLink = document.getElementById('logout-link');
        if (logoutLink) {
            logoutLink.addEventListener('click', function(e) {
                e.preventDefault();
                logout();
            });
        }
    }, 100);
    
    return dropdown;
}

/**
 * Handles user logout
 */
function logout() {
    // Clear authentication data
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('orgCode');
    
    // Remove session-related items
    localStorage.removeItem('sessionStart');
    localStorage.removeItem('lastActivity');
    localStorage.removeItem('sessionTimeout');
    
    // Redirect to home page
    window.location.href = 'index.html';
}

/**
 * Creates a new session when user logs in - without timeout restrictions
 * @param {string} userRole - The role of the logged in user (student/organizer)
 */
function createSession(userRole) {
    const now = new Date().getTime();
    localStorage.setItem('sessionStart', now);
    localStorage.setItem('lastActivity', now);
    
    // Permanent session - no timeout
    localStorage.setItem('sessionTimeout', '9999999999999'); // Effectively permanent (about 300 years)
}

/**
 * Updates the last activity timestamp - No longer actively monitoring
 * Kept for backwards compatibility with existing code
 */
function updateLastActivity() {
    // No-op - Timeout checking disabled
}

/**
 * Checks if the session has expired - disabled
 * Kept for backwards compatibility with existing code
 */
function checkSessionExpiration() {
    // No-op - Timeout checking disabled
    return false;
}

/**
 * Start monitoring user activity - disabled
 * Kept for backwards compatibility with existing code
 */
function startActivityMonitoring() {
    // No-op - Timeout checking disabled
}

// Export functions for use in other scripts
window.eventura = window.eventura || {};
window.eventura.auth = {
    checkLoginStatus,
    logout,
    createSession,
    isLoggedIn: () => localStorage.getItem('isLoggedIn') === 'true',
    getUserRole: () => localStorage.getItem('userRole'),
    getUserName: () => localStorage.getItem('userName'),
    getUserEmail: () => localStorage.getItem('userEmail')
};