const express = require('express');
const bodyParser = require('body-parser');
const appointmentRoutes = require('./routes/appointmentRoutes');
//const notificationRoutes = require('./routes/notificationRoutes'); 
const connectDB = require('./db/mongo'); // Import your DB connection file
require('dotenv').config();

// Initialize Express app
const app = express();

// Health check endpoint
app.get('/api/auth/health', (req, res) => {
  res.status(200).send('OK'); // Responds with a 200 status if the service is healthy
});

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Connect to the database
connectDB();

// Routes
app.use('/api/appointments', appointmentRoutes);
//app.use('/api/notify', notificationRoutes);  // Define a route for notifications

// Root route
app.get('/', (req, res) => {
  res.send('HealthSync API is running!');
});

// Server setup
const port = process.env.APPOINTMENT_SERVICE_PORT || 5007;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
