/**
 * Server Status Checker
 * 
 * This script checks if the backend server is running and shows a notification if it's not.
 * Add this script to pages that make API calls to the backend.
 */

document.addEventListener('DOMContentLoaded', function() {
    checkServerStatus();
    // Periodically check server status every 30 seconds
    setInterval(checkServerStatus, 30000);
});

async function checkServerStatus() {
    try {
        // Try to fetch the API root to check if server is running
        const response = await fetch('http://localhost:5000/', { 
            method: 'GET',
            // Set a short timeout to avoid hanging
            signal: AbortSignal.timeout(3000)
        });
        
        if (response.ok) {
            console.log('✅ Backend server is running');
            // Remove any existing server offline notifications
            const existingNotifications = document.querySelectorAll('.server-status-notification');
            existingNotifications.forEach(notification => notification.remove());
            
            // Store server status in session storage
            sessionStorage.setItem('serverStatus', 'online');
        }
    } catch (error) {
        console.error('❌ Backend server connection failed:', error);
        
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
                <button class="notification-btn primary" id="server-notification-help">Start Server</button>
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
    
    document.getElementById('server-notification-help').addEventListener('click', () => {
        // Show more detailed help with terminal command
        const helpModal = document.createElement('div');
        helpModal.className = 'server-help-modal';
        helpModal.innerHTML = `
            <div class="server-help-content">
                <h3>Start Backend Server</h3>
                <p>To fix this issue, please start the backend server by opening a terminal and running these commands:</p>
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
    
    // Add event listener for the banner
    document.getElementById('banner-dismiss').addEventListener('click', () => {
        banner.remove();
    });
}
