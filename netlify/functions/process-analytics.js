// netlify/functions/process-analytics.js
const fs = require('fs');
const path = require('path');

exports.handler = async (event) => {
    // Enable CORS
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };

    // Handle OPTIONS request
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ message: 'Successful preflight call.' })
        };
    }

    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const dataPath = path.join('/tmp', 'analytics.json');
        let existingData = { views: [] };
        
        // Load existing data if available
        if (fs.existsSync(dataPath)) {
            existingData = JSON.parse(fs.readFileSync(dataPath));
        }

        // Parse incoming data
        const newData = JSON.parse(event.body);
        
        // Update analytics store
        if (!existingData.visitorId) existingData.visitorId = newData.visitorId;
        if (!existingData.firstVisit) existingData.firstVisit = new Date().toISOString();
        existingData.lastVisit = new Date().toISOString();
        
        // Add new view
        existingData.views = [
            ...(existingData.views || []),
            newData
        ].filter((v, i, a) => 
            a.findIndex(t => t.timestamp === v.timestamp) === i
        ).sort((a, b) => 
            new Date(b.timestamp) - new Date(a.timestamp)
        ).slice(0, 1000); // Limit to 1000 most recent

        // Save to persistent storage
        fs.writeFileSync(dataPath, JSON.stringify(existingData));

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