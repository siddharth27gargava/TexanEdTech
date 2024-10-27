const nodemailer = require('nodemailer');

// Create a transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com', // Explicitly set the SMTP host
    port: 587, // Use port 587 for TLS connection
    secure: false, // Use false because port 587 is for STARTTLS
    auth: {
        user: 'hackathonunt@gmail.com', // Your Gmail address
        pass: 'pjexvlzhmuyasqjp' // Your App Password
    },
    tls: {
        rejectUnauthorized: false // Optional, can help prevent certain TLS-related issues
    }
});

// Define the sendEmail function
function sendEmail() {
    // Define email options
    const mailOptions = {
        from: 'hackathonunt@gmail.com',
        to: 'nara.29504@gmail.com',
        subject: 'Test Email from Node.js',
        text: 'This is a test email sent from a Node.js script using Gmail!'
    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(`Error: ${error}`);
        }
        console.log(`Email sent: ${info.response}`);
    });
}

sendEmail();