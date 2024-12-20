const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Connection = require("./config/db");
const authRoutes = require('./routes/authRoutes');

dotenv.config();
const app = express();

// Health check endpoint
app.get('/api/auth/health', (req, res) => {
  res.status(200).send('OK'); // Responds with a 200 status if the service is healthy
});

const PORT = process.env.AUTH_SERVICE_PORT || 5001;
//Connect to Mongo Db
Connection();

app.use(express.json());

//Routes
app.use('/api/auth', authRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port:${PORT}`);
});
