const FormResponse = require('../models/formResponse');
const { google } = require('googleapis');
const transporter = require('../config/emailConfig');
//const { evaluateCandidate } = require('./aiModel');
const sendOfferEmail = require('../utils/sendOfferEmail');

// Function to save form response manually through POST request
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

// Function to fetch all form responses manually through GET request
const fetchAllResponses = async (req, res) => {
    try {
        const responses = await FormResponse.find();
        res.status(200).json(responses);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching form responses', error });
    }
};

// Function to fetch data from Google Sheets and store it in MongoDB
const fetchGoogleSheetData = async () => {
    const sheets = google.sheets({ version: 'v4', auth: jwtClient });
    const spreadsheetId = process.env.SHEET_ID; // Spreadsheet ID from the .env
    const range = 'Sheet1!A2:J'; // Adjust based on your sheet structure

    try {
        const response = await sheets.spreadsheets.values.get({ spreadsheetId, range });
        const rows = response.data.values;

        if (rows.length) {
            rows.forEach(async (row) => {
                const formResponses = [
                    { question: "Question 1", response: row[2] },
                    // Populate with other responses based on columns in Google Sheets
                ];

                const newFormResponse = new FormResponse({
                    fullName: row[0],
                    email: row[1],
                    formResponses
                });

                try {
                    await newFormResponse.save();
                    console.log(`Saved response for: ${row[0]}`);
                } catch (error) {
                    console.error(`Error saving response: ${error}`);
                }
            });
        } else {
            console.log('No data found in Google Sheets.');
        }
    } catch (error) {
        console.error('Error fetching data from Google Sheets:', error);
    }
};

// Function to process candidates through the AI model and send offers
const processCandidates = async () => {
    try {
        const responses = await FormResponse.find();

        for (let response of responses) {
            const score = await evaluateCandidate(response);
            response.candidacyScore = score;

            // Save the score
            await response.save();

            // If score is greater than 0.7, send an offer letter
            if (score >= 0.7) {
                await sendOfferEmail(response);
            }
        }
    } catch (error) {
        console.error('Error processing candidates:', error);
    }
};


module.exports = {
    saveFormResponse,
    fetchAllResponses,
    fetchGoogleSheetData,
    processCandidates,
};
