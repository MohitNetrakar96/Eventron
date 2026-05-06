// Next.js API route to act as a CORS proxy
// This will forward requests to the backend API and handle CORS issues

export default async function handler(req, res) {
  // Set CORS headers to allow requests from the frontend
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  // Handle OPTIONS method for preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Get the target URL from the request query or use the default backend URL
  const targetUrl = req.query.url || process.env.NEXT_PUBLIC_API_URL;
  const endpoint = req.query.endpoint || '';
  
  // Construct the full URL to forward the request to
  const url = `${targetUrl}/${endpoint}`;

  try {
    // Forward the request to the backend API
    const response = await fetch(url, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        // Forward other headers as needed
        ...req.headers,
        // Remove headers that might cause issues
        host: undefined,
        'accept-encoding': undefined,
      },
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
    });

    // Get the response data
    const data = await response.json();

    // Return the response from the backend API
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Error in CORS proxy:', error);
    res.status(500).json({ error: 'Error proxying request' });
  }
}
