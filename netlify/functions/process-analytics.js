// netlify/functions/process-analytics.js
const fs = require('fs');
const path = require('path');

exports.handler = async (event) => {
    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };

    // Handle OPTIONS preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers };
    }

    // Only allow POST
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    try {
        const dataPath = path.join('/tmp', 'analytics-data.json');
        let existingData = { views: [] };

        // Load existing data
        if (fs.existsSync(dataPath)) {
            existingData = JSON.parse(fs.readFileSync(dataPath));
        }

        const newData = JSON.parse(event.body);
        
        // Update visitor info
        if (!existingData.visitorId) existingData.visitorId = newData.visitorId;
        if (!existingData.firstVisit) existingData.firstVisit = newData.firstVisit;
        existingData.lastVisit = new Date().toISOString();

        // Check for duplicates
        const isDuplicate = existingData.views.some(v => 
            v.timestamp === newData.timestamp && 
            v.page.url === newData.page.url &&
            v.visitor.ip === newData.visitor.ip
        );

        if (!isDuplicate) {
            existingData.views = [
                newData,
                ...existingData.views
            ].slice(0, 1000); // Keep only most recent 1000 views
            
            fs.writeFileSync(dataPath, JSON.stringify(existingData));
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ success: true })
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: error.message })
        };
    }
};