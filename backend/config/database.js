const dotenv = require('dotenv');
dotenv.config();

//const express = require('express');
const mongoose = require('mongoose');

// MongoDB connection URI
const uri = process.env.MONGO_URI;
console.log('MongoDB URI:', uri);

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((error) => {
        console.error('MongoDB connection error:', error);
    });