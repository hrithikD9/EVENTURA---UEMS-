/**
 * Server Status Checker
 * 
 * This script checks if the backend server is running and shows a notification if it's not.
 * Add this script to pages that make API calls to the backend.
 */

document.addEventListener('DOMContentLoaded', function() {
    checkServerStatus();
});

async function checkServerStatus() {
    try {
        // Try to fetch the API root to check if server is running
        const response = await fetch('http://localhost:5000/', { 
            method: 'GET',
            // Set a short timeout to avoid hanging
            signal: AbortSignal.timeout(2000)
        });
        
        if (response.ok) {
            console.log('Backend server is running');
            // You could add a small indicator somewhere in the UI if desired
        }
    } catch (error) {
        console.error('Backend server connection failed:', error);
        showServerNotification();
    }
}

function showServerNotification() {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'server-status-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-exclamation-triangle"></i>
            <span>Backend server is not running. Some features will not work.</span>
            <div class="notification-actions">
                <button class="notification-btn" id="server-notification-dismiss">Dismiss</button>
                <button class="notification-btn primary" id="server-notification-help">Get Help</button>
            </div>
        </div>
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
            max-width: 350px;
            animation: slide-in 0.3s ease-out;
            color: #fff;
        }
        
        .notification-content {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        
        .notification-content i {
            color: #ff5252;
            margin-right: 10px;
        }
        
        .notification-actions {
            display: flex;
            justify-content: flex-end;
            gap: 10px;
            margin-top: 10px;
        }
        
        .notification-btn {
            background: transparent;
            border: 1px solid #555;
            color: #fff;
            padding: 5px 10px;
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.2s;
        }
        
        .notification-btn:hover {
            background: #444;
        }
        
        .notification-btn.primary {
            background: #2196f3;
            border-color: #2196f3;
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
    
    // Add event listeners
    document.getElementById('server-notification-dismiss').addEventListener('click', () => {
        notification.remove();
    });
    
    document.getElementById('server-notification-help').addEventListener('click', () => {
        alert('To fix this issue, please start the backend server:\n\n1. Open a terminal\n2. Navigate to the backend directory: cd backend\n3. Run the server: npm run dev\n\nFor more help, see the README.md file.');
    });
}
