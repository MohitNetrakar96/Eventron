// Simple admin auth proxy that uses node-fetch for server-side requests
import fetch from 'node-fetch';

export default async function handler(req, res) {
  // Set CORS headers
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

  // Only allow POST requests for authentication
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Hard-code the backend URL for simplicity
    const backendUrl = 'https://eventxmanagement-server.vercel.app';
    
    // Log the request for debugging
    console.log('Request body:', req.body);
    
    // Make a direct request to the admin/auth endpoint
    const response = await fetch(`${backendUrl}/admin/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Origin': 'https://eventxmanagement.vercel.app'
      },
      body: JSON.stringify({
        email: req.body.email,
        password: req.body.password
      })
    });

    // Get the response as text first for debugging
    const text = await response.text();
    console.log('Response status:', response.status);
    console.log('Response text:', text);
    
    // Try to parse the response as JSON
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error('Error parsing response:', e);
      return res.status(500).json({ 
        error: 'Invalid response from server',
        details: text
      });
    }

    // Return the response data
    return res.status(response.status).json(data);
  } catch (error) {
    console.error('Error in admin auth proxy:', error);
    return res.status(500).json({ 
      error: 'Error processing request',
      message: error.message
    });
  }
}
