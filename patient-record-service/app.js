const express = require('express');
const connectDB = require('./db/mongo');
const patientRoutes = require('./routes/patientRoutes');

require('dotenv').config();
const app = express();
// Health check endpoint
app.get('/api/auth/health', (req, res) => {
  res.status(200).send('OK'); // Responds with a 200 status if the service is healthy
});

// Middleware
app.use(express.json());

// Connect to Database
connectDB();

// Routes
app.use('/api', patientRoutes);

// Start Server
const PORT = process.env.PATIENT_SERVICE_PORT || 3000;
app.listen(PORT, () => {
  console.log(`Patient Record Service running on port ${PORT}`);
});
