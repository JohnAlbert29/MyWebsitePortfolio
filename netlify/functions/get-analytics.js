// netlify/functions/get-analytics.js
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

    try {
        // Try to read from persistent storage
        const dataPath = path.join('/tmp', 'analytics.json');
        let analyticsData = { views: [] };
        
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