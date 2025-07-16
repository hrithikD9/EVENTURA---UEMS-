// Dashboard API functions

/**
 * Fetch all dashboard data from the API
 */
async function fetchDashboardData() {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = 'login.html';
      return;
    }

    // Show loading indicators
    document.querySelectorAll('.loading-indicator').forEach(loader => {
      loader.style.display = 'flex';
    });

    // Fetch all required data in parallel
    const [statsResponse, eventsResponse, trendsResponse, registrantsResponse] = await Promise.all([
      fetchStats(),
      fetchRecentEvents(),
      fetchRegistrationTrends('30days'),
      fetchRecentRegistrants()
    ]);

    // Update the dashboard with the fetched data
    updateStats(statsResponse);
    updateRecentEvents(eventsResponse);
    updateRegistrationTrends(trendsResponse);
    updateRecentRegistrants(registrantsResponse);

    // Hide loading indicators
    document.querySelectorAll('.loading-indicator').forEach(loader => {
      loader.style.display = 'none';
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    showErrorMessage('Failed to load dashboard data. Please try again later.');
    
    // Hide loading indicators
    document.querySelectorAll('.loading-indicator').forEach(loader => {
      loader.style.display = 'none';
    });
  }
}

/**
 * Fetch dashboard statistics
 */
async function fetchStats() {
  try {
    const response = await fetch('http://localhost:5000/api/dashboard/stats', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch statistics');
    }

    return data.data;
  } catch (error) {
    console.error('Error fetching stats:', error);
    throw error;
  }
}

/**
 * Fetch recent events
 */
async function fetchRecentEvents() {
  try {
    const response = await fetch('http://localhost:5000/api/dashboard/events', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch recent events');
    }

    return data.data;
  } catch (error) {
    console.error('Error fetching recent events:', error);
    throw error;
  }
}

/**
 * Fetch registration trends
 * @param {string} period - The time period for trends (30days, 3months, 6months, year)
 */
async function fetchRegistrationTrends(period = '30days') {
  try {
    const response = await fetch(`http://localhost:5000/api/dashboard/trends?period=${period}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch registration trends');
    }

    return data.data;
  } catch (error) {
    console.error('Error fetching registration trends:', error);
    throw error;
  }
}

/**
 * Fetch recent registrants
 */
async function fetchRecentRegistrants() {
  try {
    const response = await fetch('http://localhost:5000/api/dashboard/registrants', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch recent registrants');
    }

    return data.data;
  } catch (error) {
    console.error('Error fetching recent registrants:', error);
    throw error;
  }
}

/**
 * Update statistics on the dashboard
 */
function updateStats(stats) {
  try {
    // Update the statistic cards
    document.getElementById('active-events-count').textContent = stats.activeEvents || '0';
    document.getElementById('registrations-count').textContent = stats.totalRegistrations || '0';
    document.getElementById('views-count').textContent = stats.totalViews || '0';
    document.getElementById('attendance-rate').textContent = (stats.attendanceRate || '0') + '%';
    
    // Update trend indicators
    if (stats.trends) {
      updateTrendIndicator('events-trend', 
        stats.trends.events?.change || 0, 
        stats.trends.events?.direction || 'up');
      updateTrendIndicator('registrations-trend', 
        stats.trends.registrations?.change || 0, 
        stats.trends.registrations?.direction || 'up');
      updateTrendIndicator('views-trend', 
        stats.trends.views?.change || 0, 
        stats.trends.views?.direction || 'up');
      updateTrendIndicator('attendance-trend', 
        stats.trends.attendance?.change || 0, 
        stats.trends.attendance?.direction || 'down');
    }
  } catch (error) {
    console.error('Error updating stats:', error);
    showErrorMessage('Error displaying statistics. Some data might be missing.');
  }
}

/**
 * Update trend indicator with appropriate icon and color
 */
function updateTrendIndicator(elementId, change, direction) {
  const element = document.getElementById(elementId);
  if (!element) return;

  // Set icon and text
  if (direction === 'up') {
    element.innerHTML = `<i class="fas fa-arrow-up"></i> ${Math.abs(change)}%`;
    element.classList.remove('text-danger');
    element.classList.add('text-success');
  } else {
    element.innerHTML = `<i class="fas fa-arrow-down"></i> ${Math.abs(change)}%`;
    element.classList.remove('text-success');
    element.classList.add('text-danger');
  }
}

/**
 * Update the recent events table
 */
function updateRecentEvents(events) {
  try {
    const tableBody = document.querySelector('#recent-events-table tbody');
    if (!tableBody) return;
    
    // Clear existing content
    tableBody.innerHTML = '';
    
    if (!events || events.length === 0) {
      const row = document.createElement('tr');
      row.innerHTML = '<td colspan="4" class="text-center">No events found</td>';
      tableBody.appendChild(row);
      return;
    }
    
    // Add each event to the table
    events.forEach(event => {
      try {
        const row = document.createElement('tr');
        
        // Format date safely
        let formattedDate = 'N/A';
        try {
          if (event.date) {
            const eventDate = new Date(event.date);
            if (!isNaN(eventDate.getTime())) {
              formattedDate = `${eventDate.toLocaleString('default', { month: 'short' })} ${eventDate.getDate()}, ${eventDate.getFullYear()}`;
            }
          }
        } catch (dateError) {
          console.error('Error formatting date:', dateError);
        }
        
        // Determine status class
        let statusClass = 'status-active';
        let statusDisplay = 'Active';
        
        if (event.status) {
          statusDisplay = event.status.charAt(0).toUpperCase() + event.status.slice(1);
          if (event.status === 'cancelled') statusClass = 'status-draft';  // Using existing CSS classes
          if (event.status === 'draft') statusClass = 'status-draft';
          if (event.status === 'completed') statusClass = 'status-completed';
        }
        
        row.innerHTML = `
          <td>
            <a href="event-details.html?id=${event.id}" class="fw-bold">${event.title || 'Untitled Event'}</a>
          </td>
          <td>${formattedDate}</td>
          <td>${event.registrations || 0}</td>
          <td><span class="event-status ${statusClass}">${statusDisplay}</span></td>
        `;
        
        tableBody.appendChild(row);
      } catch (rowError) {
        console.error('Error creating event row:', rowError, event);
      }
    });
  } catch (error) {
    console.error('Error updating events table:', error);
    const tableBody = document.querySelector('#recent-events-table tbody');
    if (tableBody) {
      tableBody.innerHTML = '<tr><td colspan="4">Error loading events. Please refresh the page.</td></tr>';
    }
  }
}

/**
 * Update the registration trends chart
 */
function updateRegistrationTrends(trendsData) {
  try {
    // Make sure we have data and canvas element
    if (!trendsData || !Array.isArray(trendsData)) {
      console.error('Invalid trends data:', trendsData);
      return;
    }
    
    const canvas = document.getElementById('registrationTrendsChart');
    if (!canvas) {
      console.error('Chart canvas element not found');
      return;
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Could not get 2D context from canvas');
      return;
    }
  
    // Extract dates and counts for the chart
    const labels = trendsData.map(item => item.date || 'N/A');
    const data = trendsData.map(item => item.count || 0);
    
    // Check if chart already exists and destroy it
    if (window.registrationChart) {
      window.registrationChart.destroy();
    }
    
    // Chart configuration
    const chartConfig = {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Registrations',
          data: data,
          borderColor: '#4e73df',
          backgroundColor: 'rgba(78, 115, 223, 0.05)',
          pointRadius: 3,
          pointBackgroundColor: '#4e73df',
          pointBorderColor: '#4e73df',
          pointHoverRadius: 3,
          pointHoverBackgroundColor: '#2e59d9',
          pointHoverBorderColor: '#2e59d9',
          pointHitRadius: 10,
          pointBorderWidth: 2,
          fill: true,
          tension: 0.3
        }]
      },
      options: {
        maintainAspectRatio: false,
        layout: {
          padding: {
            left: 10,
            right: 25,
            top: 25,
            bottom: 0
          }
        },
        scales: {
          x: {
            grid: {
              display: false,
              drawBorder: false
            },
            ticks: {
              maxTicksLimit: 7
            }
          },
          y: {
            ticks: {
              maxTicksLimit: 5,
              padding: 10,
              callback: function(value) {
                return value;
              }
            },
            grid: {
              color: "rgb(234, 236, 244)",
              zeroLineColor: "rgb(234, 236, 244)",
              drawBorder: false,
              borderDash: [2],
              zeroLineBorderDash: [2]
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: "rgb(255,255,255)",
            bodyFontColor: "#858796",
            titleMarginBottom: 10,
            titleFontColor: '#6e707e',
            titleFontSize: 14,
            borderColor: '#dddfeb',
            borderWidth: 1,
            xPadding: 15,
            yPadding: 15,
            displayColors: false,
            intersect: false,
            mode: 'index',
            caretPadding: 10,
            callbacks: {
              label: function(context) {
                return `Registrations: ${context.parsed.y}`;
              }
            }
          }
        }
      }
    };
    
    // Create the chart
    window.registrationChart = new Chart(ctx, chartConfig);
    
  } catch (chartError) {
    console.error('Error creating chart:', chartError);
    // Show a message in the chart container
    const chartContainer = document.querySelector('.chart-container');
    if (chartContainer) {
      chartContainer.innerHTML = `
        <div style="width: 100%; height: 100%; display: flex; justify-content: center; align-items: center;">
          <p><i class="fas fa-exclamation-circle" style="margin-right: 10px; color: red;"></i> 
          Error loading chart. Please refresh the page.</p>
        </div>
      `;
    }
  }
}

/**
 * Update the period for registration trends
 */
function changeTrendsPeriod(period) {
  // Update active button
  document.querySelectorAll('.trend-period-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelector(`[data-period="${period}"]`).classList.add('active');
  
  // Show loading indicator
  const trendsSection = document.querySelector('#registration-trends-card');
  trendsSection.querySelector('.loading-indicator').style.display = 'flex';
  
  // Fetch new data
  fetchRegistrationTrends(period)
    .then(data => {
      updateRegistrationTrends(data);
      trendsSection.querySelector('.loading-indicator').style.display = 'none';
    })
    .catch(error => {
      console.error('Error updating trends period:', error);
      trendsSection.querySelector('.loading-indicator').style.display = 'none';
      showErrorMessage('Failed to update registration trends.');
    });
}

/**
 * Update the recent registrants table
 */
function updateRecentRegistrants(registrants) {
  const tableBody = document.querySelector('#recent-registrants-table tbody');
  if (!tableBody) return;
  
  // Clear existing content
  tableBody.innerHTML = '';
  
  if (!registrants || registrants.length === 0) {
    const row = document.createElement('tr');
    row.innerHTML = '<td colspan="4" class="text-center">No recent registrants</td>';
    tableBody.appendChild(row);
    return;
  }
  
  // Add each registrant to the table
  registrants.forEach(registrant => {
    const row = document.createElement('tr');
    
    // Determine status class
    let statusClass = 'bg-success';
    if (registrant.status === 'Pending') statusClass = 'bg-warning';
    if (registrant.status === 'Cancelled') statusClass = 'bg-danger';
    
    // Create user initial avatar
    const initials = registrant.name ? registrant.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';
    
    row.innerHTML = `
      <td>
        <div class="d-flex align-items-center">
          <div class="avatar-circle mr-3">
            ${initials}
          </div>
          <div>
            <p class="fw-bold mb-1">${registrant.name || 'Unknown'}</p>
            <p class="text-muted mb-0">${registrant.email || 'No email'}</p>
          </div>
        </div>
      </td>
      <td>
        <p class="fw-normal mb-1">${registrant.eventTitle || 'Unknown Event'}</p>
      </td>
      <td>${registrant.formattedDate || 'N/A'}</td>
      <td><span class="badge ${statusClass}">${registrant.status || 'Unknown'}</span></td>
    `;
    
    tableBody.appendChild(row);
  });
}

/**
 * Show error message on the page
 */
function showErrorMessage(message) {
  const alertDiv = document.createElement('div');
  alertDiv.className = 'alert alert-danger alert-dismissible fade show';
  alertDiv.setAttribute('role', 'alert');
  alertDiv.innerHTML = `
    <strong>Error!</strong> ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `;
  
  // Insert at the top of the main content
  const mainContent = document.querySelector('.admin-main');
  if (mainContent) {
    mainContent.insertBefore(alertDiv, mainContent.firstChild);
  }
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    alertDiv.remove();
  }, 5000);
}

/**
 * Show success message on the page
 */
function showSuccessMessage(message) {
  const alertDiv = document.createElement('div');
  alertDiv.className = 'alert alert-success alert-dismissible fade show';
  alertDiv.setAttribute('role', 'alert');
  alertDiv.innerHTML = `
    <i class="fas fa-check-circle me-2"></i> ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `;
  
  // Insert at the top of the main content
  const mainContent = document.querySelector('.admin-main');
  if (mainContent) {
    mainContent.insertBefore(alertDiv, mainContent.firstChild);
  }
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    alertDiv.remove();
  }, 5000);
}

// Add CSS for avatar circles
const style = document.createElement('style');
style.textContent = `
  .avatar-circle {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: #4e73df;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    margin-right: 10px;
  }
`;
document.head.appendChild(style);

// Initialize dashboard when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Fetch all dashboard data
  fetchDashboardData();
  
  // Setup event listeners for trend period buttons
  document.querySelectorAll('.trend-period-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const period = this.getAttribute('data-period');
      if (period) {
        changeTrendsPeriod(period);
      }
    });
  });
});
