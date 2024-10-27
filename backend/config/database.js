const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

// Function to connect to MongoDB
const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URI; // Replace with your MongoDB URI stored in .env
        await mongoose.connect(uri);
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1); // Exit process if unable to connect
    }
};

module.exports = connectDB;
