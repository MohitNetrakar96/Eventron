const express = require('express');
const router = express.Router();
const { handleSingleImageUpload, handleMultipleImageUpload } = require('../controllers/uploadController');

// Route for single image upload
router.post('/image', handleSingleImageUpload);

// Route for multiple image upload
router.post('/images', handleMultipleImageUpload);

module.exports = router;
