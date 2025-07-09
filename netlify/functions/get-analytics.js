// netlify/functions/get-analytics.js
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

    try {
        const dataPath = path.join('/tmp', 'analytics-data.json');
        let analyticsData = { views: [] };

        // Load existing data
        if (fs.existsSync(dataPath)) {
            analyticsData = JSON.parse(fs.readFileSync(dataPath));
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(analyticsData)
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: error.message })
        };
    }
};