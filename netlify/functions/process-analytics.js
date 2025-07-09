const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

const getCountryFromIP = async (ip) => {
    if (ip === 'unknown') return 'Unknown';
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    
    try {
        const response = await fetch(`https://ipapi.co/${ip}/country_name/`, {
            signal: controller.signal
        });
        clearTimeout(timeout);
        return await response.text() || 'Unknown';
    } catch {
        return 'Unknown';
    }
};

exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    try {
        const dataPath = path.join('/tmp', 'analytics-data.json');
        let existingData = { views: [] };

        if (fs.existsSync(dataPath)) {
            existingData = JSON.parse(fs.readFileSync(dataPath));
        }

        const newData = JSON.parse(event.body);
        newData.visitor.country = await getCountryFromIP(newData.visitor.ip);

        if (!existingData.visitorId) existingData.visitorId = newData.visitorId;
        if (!existingData.firstVisit) existingData.firstVisit = newData.firstVisit;
        existingData.lastVisit = new Date().toISOString();

        const isDuplicate = existingData.views.some(v => 
            v.timestamp === newData.timestamp && 
            v.page.url === newData.page.url &&
            v.visitor.ip === newData.visitor.ip
        );

        if (!isDuplicate) {
            existingData.views = [newData, ...existingData.views].slice(0, 1000);
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