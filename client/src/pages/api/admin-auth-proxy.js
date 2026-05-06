// Specific proxy endpoint for admin authentication
// This handles the admin/auth endpoint specifically
import { NextApiRequest, NextApiResponse } from 'next';

// Helper function to parse request body
const parseBody = (req) => {
  try {
    return req.body;
  } catch (e) {
    console.error('Error parsing request body:', e);
    return {};
  }
};

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
    // Get the backend URL from environment variables
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://eventxmanagement-server.vercel.app';
    console.log('Backend URL:', backendUrl);
    
    // Parse the request body
    const body = parseBody(req);
    console.log('Request body:', JSON.stringify(body));
    
    // Make the request to the backend admin/auth endpoint
    console.log('Sending request to:', `${backendUrl}/admin/auth`);
    const response = await fetch(`${backendUrl}/admin/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Origin': 'https://eventxmanagement.vercel.app'
      },
      body: JSON.stringify(body),
    });

    console.log('Response status:', response.status);
    
    // Get the response data
    const text = await response.text();
    console.log('Response text:', text);
    
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error('Error parsing response JSON:', e);
      return res.status(500).json({ error: 'Invalid JSON response from server', details: text });
    }

    // Return the response from the backend API
    return res.status(response.status).json(data);
  } catch (error) {
    console.error('Error in admin auth proxy:', error);
    return res.status(500).json({ error: 'Error proxying admin authentication request', details: error.message });
  }
}
