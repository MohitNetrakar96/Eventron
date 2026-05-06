// Serverless function for handling admin authentication with CORS
const express = require('express');
const cors = require('cors');
const { adminAuth } = require('../controllers/adminController');

// Create a new Express app for this serverless function
const app = express();

// CORS configuration specifically for this endpoint
const corsOptions = {
  origin: ['https://eventxmanagement.vercel.app', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', (req, res) => {
  res.status(200).send();
});

// Parse JSON request bodies
app.use(express.json());

// Handle POST requests
app.post('/', adminAuth);

// Export the Express app as the serverless function handler
module.exports = app;
