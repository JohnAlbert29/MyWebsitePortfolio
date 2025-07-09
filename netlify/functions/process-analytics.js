// netlify/functions/process-analytics.js
const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');

const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_KEY';
const supabase = createClient(supabaseUrl, supabaseKey);

const getCountryFromIP = async (ip) => {
  if (ip === 'unknown') return 'Unknown';
  try {
    const response = await fetch(`https://ipapi.co/${ip}/country_name/`);
    return await response.text() || 'Unknown';
  } catch {
    return 'Unknown';
  }
};

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  try {
    const data = JSON.parse(event.body);
    const ip = data.visitor?.ip || 'unknown';
    
    const { error } = await supabase
      .from('analytics')
      .insert([{
        page_url: data.page?.url,
        page_title: data.page?.title,
        screen_width: data.visitor?.screenWidth,
        screen_height: data.visitor?.screenHeight,
        country: await getCountryFromIP(ip),
        device_type: getDeviceType(data.visitor?.screenWidth)
      }]);

    if (error) throw error;

    return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
  } catch (error) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
  }
};

function getDeviceType(width) {
  if (!width) return 'unknown';
  if (width >= 1024) return 'desktop';
  if (width >= 768) return 'tablet';
  return 'mobile';
}