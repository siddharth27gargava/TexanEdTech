const mongoose = require('mongoose');

const formResponseSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    formResponses: { type: String, required: true },
    candidacyPosition: { type: String, default: '' }
});

const FormResponse = mongoose.model('FormResponse', formResponseSchema);
module.exports = FormResponse;
