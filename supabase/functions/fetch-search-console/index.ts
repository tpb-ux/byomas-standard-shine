import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const gscCredentials = Deno.env.get('GOOGLE_SEARCH_CONSOLE_CREDENTIALS');

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { siteUrl, startDate, endDate, dimensions } = await req.json();

    if (!gscCredentials) {
      console.log('[GSC] No credentials configured, returning mock data');
      
      // Return mock data when no credentials are configured
      const mockData = await generateMockGSCData(supabase, siteUrl);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          data: mockData,
          isMock: true,
          message: 'Using mock data. Configure GOOGLE_SEARCH_CONSOLE_CREDENTIALS for real data.'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    // Parse credentials
    let credentials;
    try {
      credentials = JSON.parse(gscCredentials);
    } catch (e) {
      throw new Error('Invalid GOOGLE_SEARCH_CONSOLE_CREDENTIALS format');
    }

    // Get access token using service account
    const accessToken = await getAccessToken(credentials);

    // Fetch data from Google Search Console API
    const gscData = await fetchGSCData({
      accessToken,
      siteUrl: siteUrl || 'https://byoma.com.br',
      startDate: startDate || getDateDaysAgo(28),
      endDate: endDate || getDateDaysAgo(0),
      dimensions: dimensions || ['page', 'query'],
    });

    // Save data to database
    await saveGSCData(supabase, gscData);

    console.log(`[GSC] Fetched ${gscData.rows?.length || 0} rows from Search Console`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: gscData,
        rowCount: gscData.rows?.length || 0
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[GSC] Error:', errorMessage);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

// Get OAuth2 access token from service account credentials
async function getAccessToken(credentials: {
  client_email: string;
  private_key: string;
}): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  
  const header = {
    alg: 'RS256',
    typ: 'JWT',
  };

  const payload = {
    iss: credentials.client_email,
    scope: 'https://www.googleapis.com/auth/webmasters.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  };

  // Create JWT
  const encoder = new TextEncoder();
  const headerB64 = btoa(JSON.stringify(header));
  const payloadB64 = btoa(JSON.stringify(payload));
  const signatureInput = `${headerB64}.${payloadB64}`;

  // Import private key
  const pemContents = credentials.private_key
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\n/g, '');
  
  const binaryKey = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));
  
  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    binaryKey,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );

  // Sign the JWT
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    encoder.encode(signatureInput)
  );

  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  const jwt = `${headerB64}.${payloadB64}.${signatureB64}`;

  // Exchange JWT for access token
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  const tokenData = await tokenResponse.json();
  
  if (!tokenData.access_token) {
    throw new Error('Failed to get access token: ' + JSON.stringify(tokenData));
  }

  return tokenData.access_token;
}

// Fetch data from Google Search Console API
async function fetchGSCData(options: {
  accessToken: string;
  siteUrl: string;
  startDate: string;
  endDate: string;
  dimensions: string[];
}) {
  const response = await fetch(
    `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(options.siteUrl)}/searchAnalytics/query`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${options.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        startDate: options.startDate,
        endDate: options.endDate,
        dimensions: options.dimensions,
        rowLimit: 1000,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`GSC API error: ${error}`);
  }

  return response.json();
}

// Save GSC data to Supabase
async function saveGSCData(supabase: any, gscData: any) {
  if (!gscData.rows || gscData.rows.length === 0) return;

  const today = new Date().toISOString().split('T')[0];

  // Get all articles to match URLs
  const { data: articles } = await supabase
    .from('articles')
    .select('id, slug');

  const articleMap = new Map(
    articles?.map((a: any) => [`/blog/${a.slug}`, a.id]) || []
  );

  const records = gscData.rows.map((row: any) => {
    const url = row.keys[0];
    const query = row.keys[1] || null;
    
    // Try to match article
    const urlPath = new URL(url).pathname;
    const articleId = articleMap.get(urlPath) || null;

    return {
      article_id: articleId,
      url,
      query,
      clicks: row.clicks || 0,
      impressions: row.impressions || 0,
      ctr: row.ctr || 0,
      position: row.position || 0,
      date: today,
    };
  });

  // Upsert records
  const { error } = await supabase
    .from('search_console_data')
    .upsert(records, {
      onConflict: 'url,date',
      ignoreDuplicates: false,
    });

  if (error) {
    console.error('[GSC] Error saving data:', error);
  }
}

// Generate mock GSC data based on existing articles
async function generateMockGSCData(supabase: any, siteUrl: string) {
  const { data: articles } = await supabase
    .from('articles')
    .select('id, slug, title, main_keyword')
    .eq('status', 'published')
    .limit(20);

  if (!articles || articles.length === 0) {
    return { rows: [] };
  }

  const mockRows = articles.flatMap((article: any) => {
    const baseUrl = siteUrl || 'https://byoma.com.br';
    const url = `${baseUrl}/blog/${article.slug}`;
    
    // Generate mock queries based on title/keyword
    const queries = [
      article.main_keyword || article.title.split(' ').slice(0, 3).join(' '),
      `${article.main_keyword || ''} 2024`,
      `o que é ${article.main_keyword || article.title.split(' ')[0]}`,
    ].filter(Boolean);

    return queries.map((query, i) => ({
      keys: [url, query],
      clicks: Math.floor(Math.random() * 100) + (10 - i * 3),
      impressions: Math.floor(Math.random() * 1000) + 100,
      ctr: Math.random() * 0.1,
      position: Math.floor(Math.random() * 30) + 1 + i * 5,
    }));
  });

  return { rows: mockRows };
}

function getDateDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
}
