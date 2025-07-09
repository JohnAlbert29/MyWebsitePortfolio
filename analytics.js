// analytics.js - Complete Working Version with Global Analytics
document.addEventListener("DOMContentLoaded", function() {
    if (window.location.pathname.includes('analytics.html')) {
        loadAnalyticsData().then(renderAnalyticsDashboard);
        return;
    }

    console.log("Website Analytics Initialized");
    trackPageView();
});

async function trackPageView() {
    const analyticsData = JSON.parse(localStorage.getItem('websiteAnalytics') || '{}');
    
    // Generate or get visitor ID
    if (!analyticsData.visitorId) {
        analyticsData.visitorId = 'vis-' + Math.random().toString(36).substr(2, 9);
        analyticsData.firstVisit = Date.now();
    }
    
    analyticsData.lastVisit = Date.now();
    
    // Record the page view
    if (!analyticsData.views) {
        analyticsData.views = [];
    }
    
    const pageView = {
        timestamp: Date.now(),
        page: {
            url: window.location.pathname,
            title: cleanTitle(document.title),
            referrer: document.referrer
        },
        visitor: {
            screenWidth: window.screen.width,
            screenHeight: window.screen.height,
            userAgent: navigator.userAgent,
            ip: await getClientIP()
        },
        timing: {
            pageLoadTime: window.performance.timing?.loadEventEnd - window.performance.timing?.navigationStart || 0,
            domCompleteTime: window.performance.timing?.domComplete - window.performance.timing?.navigationStart || 0
        }
    };
    
    analyticsData.views.push(pageView);
    localStorage.setItem('websiteAnalytics', JSON.stringify(analyticsData));
    await submitToNetlify(pageView);
}

async function getClientIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip || 'unknown';
    } catch {
        return 'unknown';
    }
}

function cleanTitle(title) {
    if (!title) return 'Untitled Page';
    return title.replace(/[^a-zA-Z0-9 ]/g, '')
               .replace(/\s+/g, ' ')
               .trim()
               .substring(0, 50) || 'Page';
}

async function submitToNetlify(data) {
    try {
        const response = await fetch('/submit-analytics', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Submission failed');
    } catch (error) {
        console.error('Analytics submission error:', error);
    }
}

async function loadAnalyticsData() {
    const localData = JSON.parse(localStorage.getItem('websiteAnalytics') || '{}');
    try {
        const response = await fetch('/get-analytics');
        if (response.ok) {
            const serverData = await response.json();
            return mergeData(localData, serverData);
        }
    } catch (error) {
        console.error('Error loading analytics:', error);
    }
    return localData;
}

function mergeData(localData, serverData) {
    const merged = {
        ...serverData,
        ...localData,
        views: [...(serverData.views || []), ...(localData.views || [])]
    };
    
    // Deduplicate based on timestamp + URL + IP
    merged.views = merged.views.filter((v, i, a) => 
        a.findIndex(t => 
            t.timestamp === v.timestamp && 
            t.page.url === v.page.url &&
            t.visitor.ip === v.visitor.ip
        ) === i
    ).sort((a, b) => b.timestamp - a.timestamp);
    
    return merged;
}

function renderAnalyticsDashboard() {
    const analyticsData = JSON.parse(localStorage.getItem('websiteAnalytics') || '{}');
    const views = analyticsData.views || [];
    
    // Update overview stats
    document.getElementById('total-views').textContent = views.length;
    document.getElementById('unique-visitors').textContent = analyticsData.visitorId ? '1' : '0';
    document.getElementById('first-visit').textContent = analyticsData.firstVisit ? 
        new Date(analyticsData.firstVisit).toLocaleString() : 'N/A';
    document.getElementById('last-visit').textContent = analyticsData.lastVisit ? 
        new Date(analyticsData.lastVisit).toLocaleString() : 'N/A';
    
    // Calculate performance metrics
    const loadTimes = views.filter(v => v.timing.pageLoadTime).map(v => v.timing.pageLoadTime);
    const domTimes = views.filter(v => v.timing.domCompleteTime).map(v => v.timing.domCompleteTime);
    
    document.getElementById('avg-load-time').textContent = 
        loadTimes.length ? Math.round(loadTimes.reduce((a,b) => a + b, 0) / loadTimes.length) : 'N/A';
    document.getElementById('avg-dom-time').textContent = 
        domTimes.length ? Math.round(domTimes.reduce((a,b) => a + b, 0) / domTimes.length) : 'N/A';
    
    // Render all visualizations
    renderDeviceChart(views);
    renderPageViewsChart(views);
    renderRecentActivity(views);
    renderGlobalAnalytics(analyticsData);
}

function renderDeviceChart(views) {
    const container = document.getElementById('device-chart');
    const devices = { desktop: 0, tablet: 0, mobile: 0 };
    
    views.forEach(view => {
        const width = view.visitor.screenWidth;
        if (width >= 1024) devices.desktop++;
        else if (width >= 768) devices.tablet++;
        else devices.mobile++;
    });
    
    const total = views.length || 1;
    container.innerHTML = '';
    
    Object.entries(devices).forEach(([type, count]) => {
        const percent = Math.round((count / total) * 100);
        const typeLabel = type.charAt(0).toUpperCase() + type.slice(1);
        
        const deviceElement = document.createElement('div');
        deviceElement.style.marginBottom = '10px';
        deviceElement.innerHTML = `
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <span>${typeLabel}</span>
                <span>${count} (${percent}%)</span>
            </div>
            <div style="height: 10px; background: #eee; border-radius: 5px;">
                <div style="height: 100%; width: ${percent}%; background: ${
                    type === 'desktop' ? '#2196F3' : 
                    type === 'tablet' ? '#FFC107' : '#9C27B0'
                }; border-radius: 5px;"></div>
            </div>
        `;
        container.appendChild(deviceElement);
    });
}

function renderPageViewsChart(views) {
    const container = document.getElementById('page-views-chart');
    const pageCounts = {};
    
    views.forEach(view => {
        const page = view.page.url;
        pageCounts[page] = (pageCounts[page] || 0) + 1;
    });
    
    container.innerHTML = '';
    const maxCount = Math.max(...Object.values(pageCounts), 1);
    
    Object.entries(pageCounts).forEach(([page, count]) => {
        const percent = (count / maxCount) * 100;
        const barElement = document.createElement('div');
        barElement.style.marginBottom = '15px';
        barElement.innerHTML = `
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <span>${page}</span>
                <span>${count} views</span>
            </div>
            <div style="height: 20px; background: #eee; border-radius: 10px;">
                <div style="height: 100%; width: ${percent}%; background: #4CAF50; border-radius: 10px;"></div>
            </div>
        `;
        container.appendChild(barElement);
    });
}

function renderRecentActivity(views) {
    const tbody = document.querySelector('#recent-activity tbody');
    const recentViews = views.slice(-10).reverse();
    
    tbody.innerHTML = recentViews.map(view => {
        const width = view.visitor.screenWidth;
        let deviceType = 'desktop';
        if (width < 768) deviceType = 'mobile';
        else if (width < 1024) deviceType = 'tablet';
        
        const date = new Date(view.timestamp);
        const formattedDate = isNaN(date.getTime()) ? 'N/A' : 
            date.toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        
        return `
            <tr>
                <td>${view.page.title || view.page.url}</td>
                <td>${formattedDate}</td>
                <td><span class="device-badge ${deviceType}">${deviceType}</span></td>
                <td>${view.visitor.screenWidth}×${view.visitor.screenHeight}</td>
            </tr>
        `;
    }).join('');
}

function renderGlobalAnalytics(analyticsData) {
    const views = analyticsData.views || [];
    renderGlobalDeviceChart(views);
    renderTrafficTrendChart(views);
    renderCountryDistribution(views);
}

function renderGlobalDeviceChart(views) {
    const ctx = document.getElementById('global-device-chart').getContext('2d');
    
    // Destroy previous chart if it exists
    if (window.globalDeviceChart) {
        window.globalDeviceChart.destroy();
    }
    
    const devices = { desktop: 0, tablet: 0, mobile: 0 };
    views.forEach(view => {
        const width = view.visitor.screenWidth;
        if (width >= 1024) devices.desktop++;
        else if (width >= 768) devices.tablet++;
        else devices.mobile++;
    });

    window.globalDeviceChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Desktop', 'Tablet', 'Mobile'],
            datasets: [{
                data: [devices.desktop, devices.tablet, devices.mobile],
                backgroundColor: [
                    'rgba(26, 35, 126, 0.7)',
                    'rgba(255, 215, 0, 0.7)',
                    'rgba(69, 90, 100, 0.7)'
                ],
                borderColor: [
                    'rgba(26, 35, 126, 1)',
                    'rgba(255, 215, 0, 1)',
                    'rgba(69, 90, 100, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                },
                title: {
                    display: true,
                    text: 'Global Device Distribution'
                }
            }
        }
    });
}

function renderTrafficTrendChart(views) {
    const ctx = document.getElementById('traffic-trend-chart').getContext('2d');
    
    // Destroy previous chart if it exists
    if (window.trafficTrendChart) {
        window.trafficTrendChart.destroy();
    }
    
    // Group by date
    const dailyCounts = {};
    views.forEach(view => {
        const date = new Date(view.timestamp).toLocaleDateString();
        dailyCounts[date] = (dailyCounts[date] || 0) + 1;
    });

    const dates = Object.keys(dailyCounts).sort();
    const counts = dates.map(date => dailyCounts[date]);

    window.trafficTrendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Visits',
                data: counts,
                backgroundColor: 'rgba(26, 35, 126, 0.2)',
                borderColor: 'rgba(26, 35, 126, 1)',
                borderWidth: 2,
                tension: 0.1,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Traffic Over Time'
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function renderCountryDistribution(views) {
    const container = document.getElementById('country-distribution');
    const countries = {};
    
    views.forEach(view => {
        const country = view.visitor.country || 'Unknown';
        countries[country] = (countries[country] || 0) + 1;
    });

    container.innerHTML = Object.entries(countries)
        .sort((a, b) => b[1] - a[1])
        .map(([country, count]) => 
            `<span class="country-badge">${country}: ${count}</span>`
        ).join(' ');
}