/**
 * Vercel Serverless Function - Spoonacular API Proxy
 *
 * This proxy keeps the API key secure on the server side.
 * All Spoonacular API requests are routed through this endpoint.
 *
 * Usage: /api/spoonacular?endpoint=/recipes/complexSearch&query=pasta&diet=vegetarian
 */

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.SPOONACULAR_API_KEY;

  if (!apiKey) {
    console.error('SPOONACULAR_API_KEY environment variable is not set');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  // Extract the endpoint path from query params
  const { endpoint, ...queryParams } = req.query;

  if (!endpoint) {
    return res.status(400).json({
      error: 'Missing endpoint parameter',
      usage: '/api/spoonacular?endpoint=/recipes/complexSearch&query=pasta'
    });
  }

  // Build the Spoonacular API URL
  const baseURL = 'https://api.spoonacular.com';
  const url = new URL(endpoint, baseURL);

  // Add all query parameters
  Object.entries(queryParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.append(key, String(value));
    }
  });

  // Add the API key
  url.searchParams.append('apiKey', apiKey);

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.message || 'Spoonacular API error',
        status: response.status,
      });
    }

    // Cache successful responses for 5 minutes
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
    return res.status(200).json(data);

  } catch (error) {
    console.error('Spoonacular API proxy error:', error);
    return res.status(500).json({
      error: 'Failed to fetch from Spoonacular API',
      message: error.message
    });
  }
}
