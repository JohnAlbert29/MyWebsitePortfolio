// analytics.js - Enhanced for Netlify storage
document.addEventListener("DOMContentLoaded", function() {
    // Check if we're on the analytics page
    if (window.location.pathname.includes('analytics.html')) {
        loadAnalyticsData().then(renderAnalyticsDashboard);
        return;
    }

    // Regular tracking code
    console.log("Website Analytics Initialized");
    trackPageView();
});

function trackPageView() {
    const analyticsData = JSON.parse(localStorage.getItem('websiteAnalytics') || '{}');
    
    // Generate or get visitor ID
    if (!analyticsData.visitorId) {
        analyticsData.visitorId = 'vis-' + Math.random().toString(36).substr(2, 9);
        analyticsData.firstVisit = new Date().toISOString();
    }
    
    analyticsData.lastVisit = new Date().toISOString();
    
    // Record the page view
    if (!analyticsData.views) {
        analyticsData.views = [];
    }
    
    const pageView = {
        timestamp: new Date().toISOString(),
        page: {
            url: window.location.pathname,
            title: document.title,
            referrer: document.referrer
        },
        visitor: {
            screenWidth: window.screen.width,
            screenHeight: window.screen.height,
            userAgent: navigator.userAgent
        },
        timing: {
            pageLoadTime: window.performance.timing?.loadEventEnd - window.performance.timing?.navigationStart || 0,
            domCompleteTime: window.performance.timing?.domComplete - window.performance.timing?.navigationStart || 0
        }
    };
    
    analyticsData.views.push(pageView);
    localStorage.setItem('websiteAnalytics', JSON.stringify(analyticsData));
    
    // Submit to Netlify
    submitToNetlify(analyticsData);
}

// Submit data via hidden form
function submitToNetlify(data) {
    const form = document.createElement('form');
    form.name = 'analytics-submission';
    form.method = 'POST';
    form.action = '/';
    form.style.display = 'none';
    
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'analytics-data';
    input.value = JSON.stringify(data);
    
    form.appendChild(input);
    document.body.appendChild(form);
    form.submit();
    setTimeout(() => form.remove(), 1000);
}

// Load data from both localStorage and server
async function loadAnalyticsData() {
    // Get local data
    const localData = JSON.parse(localStorage.getItem('websiteAnalytics') || '{}');
    
    try {
        // Try to get server data
        const response = await fetch('/.netlify/functions/get-analytics');
        if (response.ok) {
            const serverData = await response.json();
            
            // Merge data
            return {
                ...localData,
                ...serverData,
                views: [...(localData.views || []), ...(serverData.views || [])]
                    .filter((v, i, a) => a.findIndex(t => t.timestamp === v.timestamp) === i)
            };
        }
    } catch (error) {
        console.error('Error loading server analytics:', error);
    }
    
    return localData;
}

// Keep all your existing rendering functions exactly as they were
function renderAnalyticsDashboard() {
    // ... [your existing implementation] ...
}