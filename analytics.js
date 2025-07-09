// Chart instance storage
let globalDeviceChart = null;

// Initialize analytics when DOM loads
document.addEventListener("DOMContentLoaded", function() {
  try {
    if (window.location.pathname.includes('analytics.html')) {
      loadAnalyticsData()
        .then(renderAnalyticsDashboard)
        .catch(error => console.error('Dashboard error:', error));
    } else {
      trackPageView();
    }
  } catch (error) {
    console.error('Initialization error:', error);
  }
});

// Track a page view
async function trackPageView() {
  try {
    const analyticsData = JSON.parse(localStorage.getItem('websiteAnalytics') || '{}');
    
    // Generate or get visitor ID
    if (!analyticsData.visitorId) {
      analyticsData.visitorId = 'vis-' + Math.random().toString(36).slice(2, 11);
      analyticsData.firstVisit = Date.now();
    }
    
    analyticsData.lastVisit = Date.now();
    
    // Create page view data
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
        loadTime: window.performance.timing?.loadEventEnd - window.performance.timing?.navigationStart || 0
      }
    };
    
    // Store locally and submit
    analyticsData.views = [...(analyticsData.views || []), pageView].slice(-50);
    localStorage.setItem('websiteAnalytics', JSON.stringify(analyticsData));
    
    await submitToNetlify(pageView);
  } catch (error) {
    console.error('Tracking error:', error);
  }
}

// Get client IP address
async function getClientIP() {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip || 'unknown';
  } catch (error) {
    console.error('IP fetch error:', error);
    return 'unknown';
  }
}

// Clean up page titles
function cleanTitle(title) {
  if (!title) return 'Untitled Page';
  return title.replace(/[^a-zA-Z0-9 ]/g, '')
             .replace(/\s+/g, ' ')
             .trim()
             .substring(0, 50) || 'Page';
}

// Submit data to Netlify function
async function submitToNetlify(data) {
  try {
    const response = await fetch('/submit-analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
  } catch (error) {
    console.error('Submission error:', error);
    throw error;
  }
}

// Load analytics data from server
async function loadAnalyticsData() {
  try {
    const response = await fetch('/get-analytics');
    const serverData = await response.json();
    const localData = JSON.parse(localStorage.getItem('websiteAnalytics') || '{}');
    return mergeData(localData, serverData);
  } catch (error) {
    console.error('Load error:', error);
    return JSON.parse(localStorage.getItem('websiteAnalytics') || '{}');
  }
}

// Merge local and server data
function mergeData(localData, serverData) {
  const allViews = [...(serverData.views || []), ...(localData.views || [])];
  
  // Remove duplicates
  const uniqueViews = allViews.filter((v, i, a) => 
    a.findIndex(t => 
      t.timestamp === v.timestamp && 
      t.page.url === v.page.url
    ) === i
  );
  
  return {
    ...localData,
    views: uniqueViews.sort((a, b) => b.timestamp - a.timestamp)
  };
}

// Render the analytics dashboard
function renderAnalyticsDashboard() {
  try {
    const analyticsData = JSON.parse(localStorage.getItem('websiteAnalytics') || '{}');
    const views = analyticsData.views || [];
    
    // Update overview stats
    document.getElementById('total-views').textContent = views.length;
    document.getElementById('unique-visitors').textContent = analyticsData.visitorId ? '1' : '0';
    document.getElementById('first-visit').textContent = analyticsData.firstVisit ? 
      new Date(analyticsData.firstVisit).toLocaleString() : 'N/A';
    document.getElementById('last-visit').textContent = analyticsData.lastVisit ? 
      new Date(analyticsData.lastVisit).toLocaleString() : 'N/A';
    
    // Render visualizations
    renderDeviceChart(views);
    renderPageViewsChart(views);
    renderRecentActivity(views);
    renderGlobalAnalytics(views);
  } catch (error) {
    console.error('Render error:', error);
  }
}

// Render device breakdown chart
function renderDeviceChart(views) {
  try {
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
  } catch (error) {
    console.error('Device chart error:', error);
  }
}

// Render page views chart
function renderPageViewsChart(views) {
  try {
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
  } catch (error) {
    console.error('Page views chart error:', error);
  }
}

// Render recent activity table
function renderRecentActivity(views) {
  try {
    const tbody = document.querySelector('#recent-activity tbody');
    const recentViews = views.slice(0, 10).reverse();
    
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
          <td>${view.visitor.country || 'Unknown'}</td>
        </tr>
      `;
    }).join('') || '<tr><td colspan="5">No recent activity found</td></tr>';
  } catch (error) {
    console.error('Recent activity error:', error);
  }
}

// Render global analytics charts
function renderGlobalAnalytics(views) {
  try {
    // Clean up previous chart
    if (globalDeviceChart) {
      globalDeviceChart.destroy();
    }
    
    // Device distribution chart
    const ctx = document.getElementById('global-device-chart').getContext('2d');
    const devices = { desktop: 0, tablet: 0, mobile: 0 };
    
    views.forEach(view => {
      const width = view.visitor.screenWidth;
      if (width >= 1024) devices.desktop++;
      else if (width >= 768) devices.tablet++;
      else devices.mobile++;
    });
    
    globalDeviceChart = new Chart(ctx, {
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
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
    
    // Country distribution
    const countries = {};
    views.forEach(view => {
      const country = view.visitor.country || 'Unknown';
      countries[country] = (countries[country] || 0) + 1;
    });
    
    const countryContainer = document.getElementById('country-distribution');
    countryContainer.innerHTML = Object.entries(countries)
      .sort((a, b) => b[1] - a[1])
      .map(([country, count]) => `<span class="country-badge">${country}: ${count}</span>`)
      .join(' ') || '<span>No country data available</span>';
  } catch (error) {
    console.error('Global analytics error:', error);
  }
}

// Clean up when page unloads
window.addEventListener('beforeunload', () => {
  if (globalDeviceChart) {
    globalDeviceChart.destroy();
  }
});