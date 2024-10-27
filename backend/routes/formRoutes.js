const express = require('express');
const { saveFormResponse, fetchAllResponses } = require('../controllers/formController');
const router = express.Router();

// POST endpoint to add form response
router.post('/responses', saveFormResponse);

// GET endpoint to fetch all form responses
router.get('/responses', fetchAllResponses);

module.exports = router;
