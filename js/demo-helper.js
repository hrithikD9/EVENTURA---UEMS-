/**
 * Demo Helper Functions
 * This script provides utility functions for operating in demo mode 
 * when the backend server is not available
 */

/**
 * Toggle demo mode on or off
 * @param {boolean} enabled - Whether demo mode should be enabled
 */
function toggleDemoMode(enabled) {
    if (enabled) {
        localStorage.setItem('eventura_demo_mode', 'true');
        console.log('Demo mode enabled');
        
        // Show notification
        showDemoNotification(true);
    } else {
        localStorage.removeItem('eventura_demo_mode');
        sessionStorage.removeItem('serverStatus');
        console.log('Demo mode disabled');
        
        // Show notification
        showDemoNotification(false);
    }
}

/**
 * Show a notification about demo mode status
 * @param {boolean} enabled - Whether demo mode is being enabled or disabled
 */
function showDemoNotification(enabled) {
    const notification = document.createElement('div');
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.right = '20px';
    notification.style.background = enabled ? 'rgba(46, 204, 113, 0.9)' : 'rgba(52, 152, 219, 0.9)';
    notification.style.color = 'white';
    notification.style.padding = '15px 20px';
    notification.style.borderRadius = '4px';
    notification.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
    notification.style.zIndex = '9999';
    notification.style.display = 'flex';
    notification.style.alignItems = 'center';
    notification.style.animation = 'fadeIn 0.3s ease';
    
    notification.innerHTML = `
        <i class="fas ${enabled ? 'fa-check-circle' : 'fa-info-circle'}" style="margin-right: 10px; font-size: 1.2em;"></i>
        <div>
            <strong>${enabled ? 'Demo Mode Enabled' : 'Demo Mode Disabled'}</strong>
            <p style="margin: 5px 0 0 0; font-size: 0.9em;">${
                enabled 
                ? 'The app will work without a backend server.' 
                : 'The app will attempt to connect to the backend server.'
            }</p>
        </div>
        <button style="background: none; border: none; color: white; margin-left: 15px; cursor: pointer; font-size: 1.2em;">
            &times;
        </button>
    `;
    
    // Add style for animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
    `;
    document.head.appendChild(style);
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Close button functionality
    notification.querySelector('button').addEventListener('click', () => {
        notification.remove();
    });
    
    // Auto-hide after 4 seconds
    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.3s ease forwards';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 4000);
}

// Add a small demo mode indicator to the page when in demo mode
document.addEventListener('DOMContentLoaded', function() {
    if (localStorage.getItem('eventura_demo_mode') === 'true') {
        const demoIndicator = document.createElement('div');
        demoIndicator.style.position = 'fixed';
        demoIndicator.style.bottom = '10px';
        demoIndicator.style.left = '10px';
        demoIndicator.style.background = 'rgba(46, 204, 113, 0.8)';
        demoIndicator.style.color = 'white';
        demoIndicator.style.padding = '5px 10px';
        demoIndicator.style.borderRadius = '4px';
        demoIndicator.style.fontSize = '12px';
        demoIndicator.style.zIndex = '999';
        demoIndicator.style.cursor = 'pointer';
        demoIndicator.innerHTML = '<i class="fas fa-laptop-code" style="margin-right: 5px;"></i> Demo Mode';
        
        // Add tooltip
        demoIndicator.title = 'Click to disable demo mode';
        
        // Add click handler to disable demo mode
        demoIndicator.addEventListener('click', function() {
            if (confirm('Do you want to disable demo mode? This will attempt to connect to the backend server.')) {
                toggleDemoMode(false);
                window.location.reload();
            }
        });
        
        document.body.appendChild(demoIndicator);
    }
});
