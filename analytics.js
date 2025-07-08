// analytics.js - Updated for HTML Dashboard
document.addEventListener("DOMContentLoaded", function() {
    // Check if we're on the analytics page
    if (window.location.pathname.includes('analytics.html')) {
        renderAnalyticsDashboard();
        return;
    }

    // Regular tracking code
    console.log("Website Analytics Initialized");
    
    // ... [keep all your existing tracking functions] ...

    // Dashboard rendering function for analytics.html
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
        
        // Render device chart
        renderDeviceChart();
        
        // Render page views chart
        renderPageViewsChart();
        
        // Render recent activity table
        renderRecentActivity();
    }

    function renderDeviceChart() {
        const analyticsData = JSON.parse(localStorage.getItem('websiteAnalytics') || '{}');
        const views = analyticsData.views || [];
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

    function renderPageViewsChart() {
        const analyticsData = JSON.parse(localStorage.getItem('websiteAnalytics') || '{}');
        const views = analyticsData.views || [];
        const container = document.getElementById('page-views-chart');
        
        const pageCounts = {};
        views.forEach(view => {
            const page = view.page.url;
            pageCounts[page] = (pageCounts[page] || 0) + 1;
        });
        
        container.innerHTML = '';
        const maxCount = Math.max(...Object.values(pageCounts));
        
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

    function renderRecentActivity() {
        const analyticsData = JSON.parse(localStorage.getItem('websiteAnalytics') || '{}');
        const views = analyticsData.views || [];
        const tbody = document.querySelector('#recent-activity tbody');
        
        tbody.innerHTML = '';
        const recentViews = views.slice(-10).reverse();
        
        recentViews.forEach(view => {
            const width = view.visitor.screenWidth;
            let deviceType = 'desktop';
            if (width < 768) deviceType = 'mobile';
            else if (width < 1024) deviceType = 'tablet';
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${view.page.title || view.page.url}</td>
                <td>${new Date(view.timing.timestamp).toLocaleString()}</td>
                <td><span class="device-badge ${deviceType}">${deviceType}</span></td>
                <td>${view.visitor.screenWidth}×${view.visitor.screenHeight}</td>
            `;
            tbody.appendChild(row);
        });
    }
});