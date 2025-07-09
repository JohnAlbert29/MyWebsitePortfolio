// netlify/functions/get-analytics.js
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'YOUR_SUPABASE_URL',
  'YOUR_SUPABASE_KEY'
);

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  try {
    const { data, error } = await supabase
      .from('analytics')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(1000);

    if (error) throw error;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ views: data || [] })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};