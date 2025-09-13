// Dashboard functionality
let trafficChart = null;
let intersections = [];
let alerts = [];

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    loadDashboardData();
    initializeTrafficChart();
    
    // Set up periodic data refresh (every 30 seconds)
    setInterval(loadDashboardData, 30000);
    
    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
});

function initializeNavigation() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('nav a[data-route]');
    
    navLinks.forEach(link => {
        const route = link.getAttribute('data-route');
        if (route === currentPath) {
            link.classList.remove('text-muted-foreground', 'hover:bg-accent', 'hover:text-accent-foreground');
            link.classList.add('bg-primary', 'text-primary-foreground');
        }
    });
}

async function loadDashboardData() {
    try {
        // Load metrics
        const metricsResponse = await fetch('/api/metrics');
        const metrics = await metricsResponse.json();
        updateMetrics(metrics);
        
        // Load intersections
        const intersectionsResponse = await fetch('/api/intersections');
        intersections = await intersectionsResponse.json();
        updateTrafficMap();
        
        // Load alerts
        const alertsResponse = await fetch('/api/alerts');
        alerts = await alertsResponse.json();
        updateAlerts();
        
        // Load traffic volume data
        const volumeResponse = await fetch('/api/traffic-volume');
        const volumeData = await volumeResponse.json();
        updateTrafficChart(volumeData);
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

function updateMetrics(metrics) {
    document.getElementById('metric-intersections').textContent = metrics.activeIntersections;
    document.getElementById('metric-wait-time').textContent = `${metrics.averageWaitTime.toFixed(1)}s`;
    document.getElementById('metric-emergency').textContent = metrics.emergencyResponses;
    document.getElementById('metric-efficiency').textContent = `${metrics.efficiencyScore.toFixed(1)}%`;
}

function updateTrafficMap() {
    const svg = document.getElementById('traffic-map');
    
    // Clear existing intersections
    const existingIntersections = svg.querySelectorAll('.intersection');
    existingIntersections.forEach(el => el.remove());
    
    // Add intersections to map
    intersections.forEach((intersection, index) => {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', intersection.pos.x);
        circle.setAttribute('cy', intersection.pos.y);
        circle.setAttribute('r', '12');
        circle.setAttribute('class', 'intersection cursor-pointer');
        circle.setAttribute('data-intersection-id', intersection.id);
        
        // Set color based on status
        const statusColors = {
            optimal: '#10B981',    // green
            moderate: '#F59E0B',   // yellow
            congested: '#EF4444'   // red
        };
        circle.setAttribute('fill', statusColors[intersection.status] || '#6B7280');
        circle.setAttribute('stroke', '#FFFFFF');
        circle.setAttribute('stroke-width', '2');
        
        // Add hover and click events
        circle.addEventListener('click', () => showIntersectionDetails(intersection));
        circle.addEventListener('mouseenter', () => {
            circle.setAttribute('r', '15');
        });
        circle.addEventListener('mouseleave', () => {
            circle.setAttribute('r', '12');
        });
        
        svg.appendChild(circle);
        
        // Add label
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', intersection.pos.x);
        text.setAttribute('y', intersection.pos.y - 20);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('class', 'intersection-label');
        text.setAttribute('fill', 'currentColor');
        text.setAttribute('font-size', '12');
        text.textContent = intersection.name.split(' & ')[0]; // Show first part of name
        svg.appendChild(text);
    });
}

function showIntersectionDetails(intersection) {
    const detailsPanel = document.getElementById('intersection-details');
    const nameElement = document.getElementById('intersection-name');
    const infoElement = document.getElementById('intersection-info');
    
    nameElement.textContent = intersection.name;
    infoElement.textContent = `Status: ${intersection.status.toUpperCase()} | Vehicles: ${intersection.vehicleCount} | Wait: ${intersection.averageWaitTime}s`;
    
    detailsPanel.classList.remove('hidden');
}

function updateAlerts() {
    const container = document.getElementById('alerts-container');
    container.innerHTML = '';
    
    alerts.forEach(alert => {
        const alertElement = document.createElement('div');
        alertElement.className = `flex items-center justify-between p-4 rounded-lg border ${getAlertClasses(alert.type)}`;
        
        alertElement.innerHTML = `
            <div class="flex items-center space-x-3">
                <i data-lucide="${getAlertIcon(alert.type)}" class="h-5 w-5"></i>
                <div>
                    <h4 class="font-medium">${alert.title}</h4>
                    <p class="text-sm opacity-90">${alert.message}</p>
                    <p class="text-xs opacity-75 mt-1">${formatTimestamp(alert.timestamp)} • ${alert.location}</p>
                </div>
            </div>
            <div class="flex space-x-2">
                ${alert.actionRequired ? `<button onclick="takeAction('${alert.id}')" class="px-3 py-1 text-xs bg-primary text-primary-foreground rounded-md hover:bg-primary/90">Take Action</button>` : ''}
                <button onclick="dismissAlert('${alert.id}')" class="px-3 py-1 text-xs bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90">Dismiss</button>
            </div>
        `;
        
        container.appendChild(alertElement);
    });
    
    // Re-initialize Lucide icons for the new elements
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function getAlertClasses(type) {
    const classes = {
        success: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300',
        warning: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-300',
        critical: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300'
    };
    return classes[type] || classes.warning;
}

function getAlertIcon(type) {
    const icons = {
        success: 'check-circle',
        warning: 'alert-triangle',
        critical: 'alert-circle'
    };
    return icons[type] || 'alert-triangle';
}

function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

async function dismissAlert(alertId) {
    try {
        const response = await fetch(`/api/alerts/${alertId}/dismiss`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
            }
        });
        
        if (response.ok) {
            // Remove alert from local array and update UI
            alerts = alerts.filter(alert => alert.id !== alertId);
            updateAlerts();
        }
    } catch (error) {
        console.error('Error dismissing alert:', error);
    }
}

async function takeAction(alertId) {
    try {
        const response = await fetch(`/api/alerts/${alertId}/action`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
            }
        });
        
        if (response.ok) {
            // Reload data to reflect changes
            loadDashboardData();
        }
    } catch (error) {
        console.error('Error taking action on alert:', error);
    }
}

function initializeTrafficChart() {
    const ctx = document.getElementById('traffic-chart').getContext('2d');
    trafficChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Current',
                    data: [],
                    borderColor: '#3B82F6',
                    backgroundColor: '#3B82F6',
                    fill: false
                },
                {
                    label: 'Previous',
                    data: [],
                    borderColor: '#6B7280',
                    backgroundColor: '#6B7280',
                    fill: false
                },
                {
                    label: 'Target',
                    data: [],
                    borderColor: '#10B981',
                    backgroundColor: '#10B981',
                    fill: false,
                    borderDash: [5, 5]
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Vehicle Count'
                    }
                }
            }
        }
    });
}

function updateTrafficChart(data) {
    if (!trafficChart) return;
    
    trafficChart.data.labels = data.map(item => item.day);
    trafficChart.data.datasets[0].data = data.map(item => item.current);
    trafficChart.data.datasets[1].data = data.map(item => item.previous);
    trafficChart.data.datasets[2].data = data.map(item => item.target);
    
    trafficChart.update();
}