const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');

// Enhanced Supabase initialization with error handling
let supabase;
try {
  supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY, // Changed from SUPABASE_KEY
    {
      auth: {
        persistSession: false
      }
    }
  );
} catch (err) {
  console.error('Supabase init failed:', err.message);
}

const getCountryFromIP = async (ip) => {
  if (ip === 'unknown') return 'Unknown';
  try {
    const response = await fetch(`https://ipapi.co/${ip}/country_name/`, {
      timeout: 3000
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return (await response.text()) || 'Unknown';
  } catch (err) {
    console.error('IP lookup failed:', err.message);
    return 'Unknown';
  }
};

exports.handler = async (event) => {
  // Enhanced CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers };
  }

  try {
    // Validate request
    if (!event.body) throw new Error('Empty request body');
    const data = JSON.parse(event.body);
    
    // Debug logging
    console.log('Incoming data:', {
      url: data.page?.url,
      ip: data.visitor?.ip?.slice(0, 8) + '...'
    });

    // Enhanced IP handling
    const ip = data.visitor?.ip || 'unknown';
    const country = await getCountryFromIP(ip);

    // Validate Supabase connection
    if (!supabase) throw new Error('Supabase client not initialized');

    // Insert with timeout
    const { error } = await supabase
      .from('analytics')
      .insert([{
        page_url: data.page?.url,
        page_title: data.page?.title,
        screen_width: data.visitor?.screenWidth,
        screen_height: data.visitor?.screenHeight,
        country: country,
        device_type: getDeviceType(data.visitor?.screenWidth),
        user_agent: data.visitor?.userAgent,
        referrer: data.page?.referrer,
        timestamp: new Date().toISOString()
      }])
      .timeout(5000); // 5 second timeout

    if (error) throw error;

    return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
  } catch (error) {
    console.error('Processing error:', error.message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      })
    };
  }
};

function getDeviceType(width) {
  if (!width) return 'unknown';
  if (width >= 1024) return 'desktop';
  if (width >= 768) return 'tablet';
  return 'mobile';
}