// app.js
require('dotenv').config();
const express = require('express');
const connectDB = require('./config/database');
const formRoutes = require('./routes/formRoutes');

const app = express();

// Connect to MongoDB
// connectDB();

// Middleware
app.use(express.json());

// Routes
app.use('/api', formRoutes);

// Export the app instance
module.exports = app;
