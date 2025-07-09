const fs = require('fs');
const path = require('path');

exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: JSON.stringify({ message: 'Preflight success' }) };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    try {
        const dataPath = path.join('/tmp', 'analytics.json');
        let existingData = { views: [] };
        
        if (fs.existsSync(dataPath)) {
            existingData = JSON.parse(fs.readFileSync(dataPath));
        }

        const newData = JSON.parse(event.body);
        
        // Prevent duplicates
        const isDuplicate = existingData.views.some(v => 
            v.timestamp === newData.timestamp && 
            v.page.url === newData.page.url
        );

        if (!isDuplicate) {
            if (!existingData.visitorId) existingData.visitorId = newData.visitorId;
            if (!existingData.firstVisit) existingData.firstVisit = newData.firstVisit;
            existingData.lastVisit = newData.lastVisit;
            
            existingData.views = [
                ...existingData.views,
                newData
            ].sort((a, b) => b.timestamp - a.timestamp)
             .slice(0, 1000);
            
            fs.writeFileSync(dataPath, JSON.stringify(existingData));
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ success: true, count: existingData.views.length })
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: error.message })
        };
    }
};