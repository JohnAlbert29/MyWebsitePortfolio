const { createClient } = require('@supabase/supabase-js');

// Initialize with error handling
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

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  try {
    // Validate Supabase connection
    if (!supabase) throw new Error('Database connection failed');

    // Get data with timeout
    const { data, error } = await supabase
      .from('analytics')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(1000)
      .timeout(5000);

    if (error) throw error;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        views: data || [],
        meta: {
          last_updated: new Date().toISOString()
        }
      })
    };
  } catch (error) {
    console.error('Fetch error:', error.message);
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