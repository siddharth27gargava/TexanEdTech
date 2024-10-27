const nodemailer = require('nodemailer');

// Create a transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Use TLS
    auth: {
        user: 'hackathonunt@gmail.com', // Your Gmail address
        pass: 'pjexvlzhmuyasqjp' // Your App Password
    },
    tls: {
        rejectUnauthorized: false
    }
});

module.exports = transporter;
