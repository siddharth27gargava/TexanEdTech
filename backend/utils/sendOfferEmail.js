const transporter = require('../config/emailConfig');

const sendOfferEmail = async (formResponse) => {
    const mailOptions = {
        from: 'hackathonunt@gmail.com',
        to: formResponse.email,
        subject: 'Congratulations! Offer from TexanEdTech',
        text: `Dear ${formResponse.fullName},\n\nWe are pleased to extend you an offer based on your application.`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Offer letter sent to ${formResponse.fullName}`);
    } catch (error) {
        console.error(`Error sending email: ${error}`);
    }
};

module.exports = sendOfferEmail;
