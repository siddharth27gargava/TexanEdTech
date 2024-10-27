const FormResponse = require('../models/formResponse');

// Function to save form response
const saveFormResponse = async (req, res) => {
    const { fullName, email, formResponses } = req.body;
    const newResponse = new FormResponse({ fullName, email, formResponses });
    
    try {
        const savedResponse = await newResponse.save();
        res.status(201).json(savedResponse);
    } catch (error) {
        res.status(400).json({ message: 'Error adding form response', error });
    }
};

// Function to fetch all form responses
const fetchAllResponses = async (req, res) => {
    try {
        const responses = await FormResponse.find();
        res.status(200).json(responses);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching form responses', error });
    }
};

module.exports = { saveFormResponse, fetchAllResponses };
