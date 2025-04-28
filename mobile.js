/**
 * Eventura Mobile Responsiveness Script
 * 
 * This script handles mobile menu, search functionality, and other 
 * responsive features consistently across all pages.
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize mobile responsiveness features
    initMobileMenu();
    initSearchToggle();
    initDropdowns();
});

/**
 * Initialize mobile menu functionality
 */
function initMobileMenu() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    const body = document.body;
    
    if (!mobileMenuToggle || !mainNav) return;
    
    // Toggle mobile menu
    mobileMenuToggle.addEventListener('click', function() {
        mainNav.classList.toggle('active');
        this.classList.toggle('active');
        
        // Prevent body scrolling when menu is open
        if (mainNav.classList.contains('active')) {
            body.style.overflow = 'hidden';
        } else {
            body.style.overflow = '';
        }
    });

    // Close menu when clicking a link
    const navLinks = mainNav.querySelectorAll('a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            mainNav.classList.remove('active');
            mobileMenuToggle.classList.remove('active');
            body.style.overflow = '';
        });
    });
}

/**
 * Initialize search toggle functionality
 */
function initSearchToggle() {
    const searchToggle = document.querySelector('.search-toggle');
    const searchForm = document.querySelector('.search-form');
    
    if (!searchToggle || !searchForm) return;
    
    searchToggle.addEventListener('click', function(event) {
        searchForm.classList.toggle('active');
        event.stopPropagation(); // Prevent document click from immediately closing it
    });
    
    // Close search when clicking outside
    document.addEventListener('click', function(event) {
        if (!event.target.closest('.search-container') && searchForm.classList.contains('active')) {
            searchForm.classList.remove('active');
        }
    });
}

/**
 * Initialize dropdown menu functionality
 */
function initDropdowns() {
    const dropdowns = document.querySelectorAll('.dropdown');
    
    if (dropdowns.length === 0) return;
    
    // Special handling for touch devices
    if ('ontouchstart' in window) {
        dropdowns.forEach(dropdown => {
            const dropdownBtn = dropdown.querySelector('.dropdown-btn');
            const dropdownMenu = dropdown.querySelector('.dropdown-menu');
            
            if (!dropdownBtn || !dropdownMenu) return;
            
            dropdownBtn.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Close all other dropdowns first
                dropdowns.forEach(otherDropdown => {
                    if (otherDropdown !== dropdown) {
                        const otherMenu = otherDropdown.querySelector('.dropdown-menu');
                        if (otherMenu) {
                            otherMenu.style.visibility = 'hidden';
                            otherMenu.style.opacity = '0';
                        }
                    }
                });
                
                // Toggle current dropdown
                if (dropdownMenu.style.visibility === 'visible') {
                    dropdownMenu.style.visibility = 'hidden';
                    dropdownMenu.style.opacity = '0';
                } else {
                    dropdownMenu.style.visibility = 'visible';
                    dropdownMenu.style.opacity = '1';
                }
            });
        });
        
        // Close dropdowns when clicking outside
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.dropdown')) {
                dropdowns.forEach(dropdown => {
                    const menu = dropdown.querySelector('.dropdown-menu');
                    if (menu) {
                        menu.style.visibility = 'hidden';
                        menu.style.opacity = '0';
                    }
                });
            }
        });
    }
}

/**
 * Initialize smooth scrolling for anchor links
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            
            // Only process if it's a hash link to an element
            if (targetId !== '#' && targetId.startsWith('#')) {
                e.preventDefault();
                
                const target = document.querySelector(targetId);
                if (target) {
                    const headerHeight = document.querySelector('.main-header').offsetHeight || 80;
                    
                    window.scrollTo({
                        top: target.offsetTop - headerHeight,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
}

/**
 * Check if the screen size is mobile
 * @returns {boolean} True if screen is mobile size
 */
function isMobile() {
    return window.innerWidth <= 768;
}

/**
 * Adjust element heights to maintain consistency in card layouts
 * This helps with grid layouts where different content lengths create inconsistent heights
 */
function equalizeCardHeights() {
    const cardSelectors = [
        '.event-card', 
        '.org-card', 
        '.category-card',
        '.team-card',
        '.testimonial-card',
        '.feature-card'
    ];
    
    cardSelectors.forEach(selector => {
        const cards = document.querySelectorAll(selector);
        if (cards.length < 2) return; // No need to equalize if there's only 1 or no cards
        
        // Reset heights first
        cards.forEach(card => card.style.height = 'auto');
        
        // Skip equalization on mobile
        if (isMobile()) return;
        
        // Find the tallest card
        let maxHeight = 0;
        cards.forEach(card => {
            if (card.offsetHeight > maxHeight) {
                maxHeight = card.offsetHeight;
            }
        });
        
        // Apply height to all cards
        cards.forEach(card => {
            card.style.height = maxHeight + 'px';
        });
    });
}

// Export functions for use in other scripts
window.eventura = window.eventura || {};
window.eventura.mobile = {
    initMobileMenu,
    initSearchToggle,
    initDropdowns,
    initSmoothScroll,
    equalizeCardHeights,
    isMobile
};

// Additional initialization
window.addEventListener('load', function() {
    initSmoothScroll();
    equalizeCardHeights();
});

// Re-equalize card heights when window is resized
window.addEventListener('resize', function() {
    // Use debounce to prevent excessive calls
    clearTimeout(window.resizeTimeout);
    window.resizeTimeout = setTimeout(function() {
        equalizeCardHeights();
    }, 250);
});