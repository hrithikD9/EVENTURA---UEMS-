/**
 * Eventura Authentication and Dashboard Visibility Script
 * 
 * This script handles checking user login status and controlling dashboard visibility
 * for organizers across the entire site.
 */

// API URL
const API_URL = 'http://localhost:5000/api';

// Check login status when the page loads
document.addEventListener('DOMContentLoaded', function() {
    checkLoginStatus();
});

/**
 * Checks if the user is logged in and updates the UI accordingly
 */
function checkLoginStatus() {
    const token = localStorage.getItem('token');
    const isLoggedIn = !!token;
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
 * Handles user login
 */
async function login(email, password) {
    try {
        const response = await fetch(`${API_URL}/users/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }

        // Save user data
        localStorage.setItem('token', data.token);
        localStorage.setItem('userRole', data.role);
        localStorage.setItem('userName', data.name);
        localStorage.setItem('userEmail', data.email);
        localStorage.setItem('userId', data._id);
        localStorage.setItem('isLoggedIn', 'true');
        
        // Create session
        createSession(data.role);

        // Redirect based on role and onboarding status
        if (data.role === 'organizer') {
            if (data.organizationInfo && data.organizationInfo.isOnboardingComplete) {
                window.location.href = 'admin-dashboard.html';
            } else {
                window.location.href = 'organization-onboarding.html';
            }
        } else {
            window.location.href = 'index.html';
        }

        return { success: true };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

/**
 * Handles user registration
 */
async function register(name, email, password, role) {
    try {
        const response = await fetch(`${API_URL}/users/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, password, role }),
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Registration failed');
        }

        // Save user data
        localStorage.setItem('token', data.token);
        localStorage.setItem('userRole', data.role);
        localStorage.setItem('userName', data.name);
        localStorage.setItem('userEmail', data.email);
        localStorage.setItem('userId', data._id);
        localStorage.setItem('isLoggedIn', 'true');
        
        // Create session
        createSession(data.role);

        // Redirect based on role
        if (data.role === 'organizer') {
            window.location.href = 'organization-onboarding.html';
        } else {
            window.location.href = 'index.html';
        }

        return { success: true };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

/**
 * Complete organization onboarding
 */
async function completeOnboarding(orgName, description) {
    try {
        const token = localStorage.getItem('token');
        
        const response = await fetch(`${API_URL}/users/onboarding`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ orgName, description }),
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Onboarding failed');
        }

        window.location.href = 'admin-dashboard.html';
        return { success: true };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

/**
 * Handles user logout
 */
function logout() {
    // Clear authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userId');
    localStorage.removeItem('isLoggedIn');
    
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

/**
 * Get the authenticated user profile
 */
async function getUserProfile() {
    try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('User not authenticated');
        
        const response = await fetch(`${API_URL}/users/profile`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to get profile');
        }

        return { success: true, data };
    } catch (error) {
        console.error('Profile fetch error:', error);
        // Check if it's a network error (server not running)
        if (!window.navigator.onLine || error.name === 'TypeError') {
            return { success: false, message: 'Backend server connection failed. Please ensure the server is running.' };
        }
        return { success: false, message: error.message };
    }
}

/**
 * Update user profile
 */
async function updateProfile(profileData) {
    try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('User not authenticated');
        
        // Before sending, log to see what we're sending
        console.log('Updating profile with data:', profileData);
        
        const response = await fetch(`${API_URL}/users/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(profileData),
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to update profile');
        }

        // Update local storage with new name if it was changed
        if (profileData.name) {
            localStorage.setItem('userName', data.name);
        }
        
        console.log('Profile updated successfully:', data);

        return { success: true, data };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

/**
 * Change user password
 */
async function changePassword(currentPassword, newPassword) {
    try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('User not authenticated');
        
        const response = await fetch(`${API_URL}/users/change-password`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ currentPassword, newPassword }),
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to change password');
        }

        return { success: true, message: data.message };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

// Export functions for use in other scripts
window.eventura = window.eventura || {};
window.eventura.auth = {
    checkLoginStatus,
    logout,
    login,
    register,
    completeOnboarding,
    createSession,
    getUserProfile,
    updateProfile,
    changePassword,
    isLoggedIn: () => !!localStorage.getItem('token'),
    getUserRole: () => localStorage.getItem('userRole'),
    getUserName: () => localStorage.getItem('userName'),
    getUserEmail: () => localStorage.getItem('userEmail')
};