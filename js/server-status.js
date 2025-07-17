/**
 * Server Status Checker
 * 
 * This script checks if the backend server is running and shows a notification if it's not.
 * Add this script to pages that make API calls to the backend.
 */

document.addEventListener('DOMContentLoaded', function() {
    // Check if we're in demo mode, don't bother checking server status if so
    if (localStorage.getItem('eventura_demo_mode') === 'true') {
        console.log('🔍 Running in demo mode - skipping server status checks');
        return;
    }
    
    // Check server status once on page load
    checkServerStatus();
    
    // Periodically check server status every 60 seconds (increased from 30s to reduce requests)
    setInterval(checkServerStatus, 60000);
});

async function checkServerStatus() {
    try {
        // Try to fetch the API root to check if server is running
        const response = await fetch('http://localhost:5000/', { 
            method: 'GET',
            // Set a short timeout to avoid hanging
            signal: AbortSignal.timeout(5000), // Increased timeout for slow connections
            // Prevent caching issues
            cache: 'no-store',
            headers: {
                'Cache-Control': 'no-cache'
            }
        });
        
        if (response.ok) {
            console.log('✅ Backend server is running');
            // Remove any existing server offline notifications
            const existingNotifications = document.querySelectorAll('.server-status-notification, .server-status-banner');
            existingNotifications.forEach(notification => notification.remove());
            
            // Store server status in session storage
            sessionStorage.setItem('serverStatus', 'online');
            
            // If we were previously offline, reload the page to ensure data loads properly
            if (sessionStorage.getItem('prevServerStatus') === 'offline') {
                sessionStorage.removeItem('prevServerStatus');
                // Only reload if we're not in the process of submitting a form
                if (!document.querySelector('form.submitting')) {
                    console.log('Server came back online - reloading page');
                    window.location.reload();
                }
            }
        } else {
            throw new Error(`Server responded with status: ${response.status}`);
        }
    } catch (error) {
        console.error('❌ Backend server connection failed:', error);
        
        // Save previous state before updating
        sessionStorage.setItem('prevServerStatus', sessionStorage.getItem('serverStatus') || 'unknown');
        
        // Only show notification if we haven't shown one already
        if (sessionStorage.getItem('serverStatus') !== 'offline') {
            showServerNotification();
            sessionStorage.setItem('serverStatus', 'offline');
        }
    }
}

function showServerNotification() {
    // Remove any existing notifications first
    const existingNotifications = document.querySelectorAll('.server-status-notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'server-status-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <div class="notification-header">
                <i class="fas fa-exclamation-triangle"></i>
                <span>Backend Server Offline</span>
            </div>
            <p>The backend server is not running. Dynamic features like event registration, viewing my events, and dashboard functionality will not work.</p>
            <div class="notification-actions">
                <button class="notification-btn" id="server-notification-dismiss">Dismiss</button>
                <button class="notification-btn primary" id="server-notification-demo">Demo Mode</button>
                <button class="notification-btn secondary" id="server-notification-help">Start Server</button>
                <button class="notification-btn refresh" id="server-notification-retry"><i class="fas fa-sync-alt"></i> Retry</button>
            </div>
        </div>
    `;
    
    // Also add a top banner for critical visibility
    const banner = document.createElement('div');
    banner.className = 'server-status-banner';
    banner.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <span>Backend server is offline. Some features will not work.</span>
        <button id="banner-dismiss" class="banner-dismiss"><i class="fas fa-times"></i></button>
    `;
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        .server-status-notification {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #2d2d2d;
            border-left: 4px solid #ff5252;
            padding: 15px;
            border-radius: 4px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
            z-index: 9999;
            width: 350px;
            max-width: 90vw;
            animation: slide-in 0.3s ease-out;
            color: #fff;
        }
        
        .server-status-banner {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: rgba(220, 53, 69, 0.9);
            color: white;
            padding: 10px 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            animation: slide-down 0.3s ease-out;
        }
        
        .server-status-banner i {
            margin-right: 10px;
        }
        
        .banner-dismiss {
            background: transparent;
            border: none;
            color: white;
            margin-left: 20px;
            cursor: pointer;
            opacity: 0.7;
        }
        
        .banner-dismiss:hover {
            opacity: 1;
        }
        
        .notification-content {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        
        .notification-header {
            display: flex;
            align-items: center;
            font-weight: bold;
            font-size: 1.1em;
        }
        
        .notification-header i {
            color: #ff5252;
            margin-right: 10px;
            font-size: 1.2em;
        }
        
        .notification-content p {
            margin: 0;
            line-height: 1.5;
            color: #ccc;
        }
        
        .notification-actions {
            display: flex;
            justify-content: space-between;
            gap: 10px;
            margin-top: 10px;
        }
        
        .notification-btn {
            background: transparent;
            border: 1px solid #555;
            color: #fff;
            padding: 8px 12px;
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.2s;
            flex: 1;
        }
        
        .notification-btn:hover {
            background: #444;
        }
        
        .notification-btn.primary {
            background: #2196f3;
            border-color: #2196f3;
        }
        
        .notification-btn.refresh {
            background: #28a745;
            border-color: #28a745;
        }
        
        .notification-btn.refresh:hover {
            background: #218838;
        }
        
        @keyframes slide-in {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slide-down {
            from { transform: translateY(-100%); }
            to { transform: translateY(0); }
        }
        
        .notification-btn.primary:hover {
            background: #1976d2;
        }
        
        @keyframes slide-in {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    
    // Add to DOM
    document.head.appendChild(style);
    document.body.appendChild(notification);
    document.body.insertBefore(banner, document.body.firstChild);
    
    // Add event listeners for the notification
    document.getElementById('server-notification-dismiss').addEventListener('click', () => {
        notification.remove();
    });
    
    document.getElementById('server-notification-demo').addEventListener('click', () => {
        // Enable demo mode
        localStorage.setItem('eventura_demo_mode', 'true');
        localStorage.setItem('eventura_skip_auth', 'true');
        sessionStorage.setItem('serverStatus', 'demo');
        notification.remove();
        banner.remove();
        
        // Show success message
        const demoMsg = document.createElement('div');
        demoMsg.className = 'server-status-banner';
        demoMsg.style.background = 'rgba(46, 204, 113, 0.9)';
        demoMsg.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>Demo mode enabled! The app will work without a backend server.</span>
            <button id="demo-banner-dismiss" class="banner-dismiss"><i class="fas fa-times"></i></button>
        `;
        document.body.insertBefore(demoMsg, document.body.firstChild);
        
        // Add dismiss event listener
        document.getElementById('demo-banner-dismiss').addEventListener('click', () => {
            demoMsg.remove();
        });
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            if (demoMsg.parentNode) {
                demoMsg.remove();
            }
        }, 5000);
        
        // Reload the page to apply demo mode
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    });
    
    document.getElementById('server-notification-help').addEventListener('click', () => {
        // Show more detailed help with terminal command
        const helpModal = document.createElement('div');
        helpModal.className = 'server-help-modal';
        helpModal.innerHTML = `
            <div class="server-help-content">
                <h3>Start Backend Server</h3>
                <p>To fix this issue, please start the backend server using one of these methods:</p>
                
                <h4>Option 1: Use Demo Mode (Recommended)</h4>
                <div class="action-block">
                    <button id="enable-demo-mode" class="btn btn-primary">
                        <i class="fas fa-flask"></i> Enable Demo Mode
                    </button>
                    <p style="margin-top: 10px; font-size: 0.9rem;">
                        Demo mode allows you to explore the application with sample data without requiring a server connection.
                    </p>
                </div>
                
                <h4>Option 2: Start Server Manually</h4>
                <div class="command-block">
                    <code>cd /home/hrithik/Documents/Eventura/backend</code><br>
                    <code>node server.js</code>
                </div>
                
                <p>After starting the server, click the "Retry" button to check if the connection is working.</p>
                
                <div class="modal-actions">
                    <button class="modal-btn close">Close</button>
                </div>
            </div>
        `;
        
        // Add modal styles
        const modalStyle = document.createElement('style');
        modalStyle.textContent = `
            .server-help-modal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.7);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10001;
            }
            
            .server-help-content {
                background: #2d2d2d;
                border-radius: 8px;
                padding: 25px;
                max-width: 500px;
                width: 90%;
            }
            
            .server-help-content h3 {
                margin-top: 0;
                color: #2196f3;
            }
            
            .command-block {
                background: #1e1e1e;
                border: 1px solid #444;
                padding: 15px;
                border-radius: 4px;
                margin: 15px 0;
                overflow-x: auto;
            }
            
            .action-block {
                background: rgba(33, 150, 243, 0.1);
                padding: 15px;
                border-radius: 4px;
                margin: 15px 0;
                border-left: 4px solid #2196f3;
            }
            
            #enable-demo-mode {
                background: #2196f3;
                border: none;
                color: white;
                padding: 10px 20px;
                border-radius: 4px;
                cursor: pointer;
                font-weight: bold;
                display: flex;
                align-items: center;
                gap: 8px;
                transition: background-color 0.2s;
            }
            
            #enable-demo-mode:hover {
                background: #1976d2;
            }
            
            .command-block code {
                color: #f1f1f1;
                font-family: monospace;
            }
            
            .modal-actions {
                display: flex;
                justify-content: flex-end;
                margin-top: 20px;
            }
            
            .modal-btn {
                background: #2196f3;
                border: none;
                color: white;
                padding: 8px 20px;
                border-radius: 4px;
                cursor: pointer;
            }
            
            .modal-btn:hover {
                background: #1976d2;
            }
        `;
        
        document.head.appendChild(modalStyle);
        document.body.appendChild(helpModal);
        
        // Close modal when clicking the close button
        helpModal.querySelector('.modal-btn.close').addEventListener('click', () => {
            helpModal.remove();
        });
        
        // Close modal when clicking outside the content
        helpModal.addEventListener('click', (e) => {
            if (e.target === helpModal) {
                helpModal.remove();
            }
        });
    });
    
    document.getElementById('server-notification-retry').addEventListener('click', async () => {
        notification.querySelector('#server-notification-retry').innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Checking...';
        await checkServerStatus();
    });
    
    // Add event listener for demo mode button if it exists
    document.body.addEventListener('click', (e) => {
        if (e.target && (e.target.id === 'enable-demo-mode' || e.target.closest('#enable-demo-mode'))) {
            // Set demo mode in localStorage
            localStorage.setItem('eventura_demo_mode', 'true');
            localStorage.setItem('eventura_skip_auth', 'true');
            
            // Show success message
            const notification = document.createElement('div');
            notification.style = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: rgba(33, 150, 243, 0.9);
                color: white;
                padding: 15px 25px;
                border-radius: 8px;
                z-index: 10000;
                box-shadow: 0 4px 10px rgba(0,0,0,0.3);
                animation: slideIn 0.3s forwards;
            `;
            notification.innerHTML = `
                <div style="display: flex; align-items: center;">
                    <i class="fas fa-flask" style="margin-right: 10px; font-size: 20px;"></i>
                    <div>
                        <div style="font-weight: bold;">Demo Mode Enabled</div>
                        <div style="font-size: 0.9rem;">Refreshing page with sample data...</div>
                    </div>
                </div>
            `;
            document.body.appendChild(notification);
            
            // Close any open modals
            const modal = document.querySelector('.server-help-modal');
            if (modal) modal.remove();
            
            // Refresh the page after a short delay
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        }
    });
    
    // Add event listener for the banner
    document.getElementById('banner-dismiss').addEventListener('click', () => {
        banner.remove();
    });
}
