const analyticsStore = {};

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const payload = JSON.parse(event.body);
        
        // Simple merge logic
        analyticsStore.visitorId = analyticsStore.visitorId || payload.visitorId;
        analyticsStore.firstVisit = analyticsStore.firstVisit || payload.firstVisit;
        analyticsStore.lastVisit = payload.lastVisit || analyticsStore.lastVisit;
        
        if (!analyticsStore.views) analyticsStore.views = [];
        analyticsStore.views = [...analyticsStore.views, ...payload.views]
            .filter((v, i, a) => a.findIndex(t => t.timestamp === v.timestamp) === i)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        return {
            statusCode: 200,
            body: JSON.stringify({ success: true })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};