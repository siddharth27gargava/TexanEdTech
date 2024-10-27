// server.js
require('dotenv').config();

const express = require('express');
const app = express();
app.use(express.json());
const port = process.env.PORT || 3000
app.listen(5000, () => console.log('Server is running on port 5000'));