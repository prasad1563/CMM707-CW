const express = require('express');
const connectDB = require('./db/mongo');
const doctorRoutes = require('./routes/doctorRoutes');

require('dotenv').config();

const app = express();

// Health check endpoint
app.get('/api/auth/health', (req, res) => {
  res.status(200).send('OK'); // Responds with a 200 status if the service is healthy
});

app.use(express.json());
///Connec to mongo DB
connectDB();

app.use('/api', doctorRoutes);

const PORT = process.env.DOCTOR_SERVICE_PORT || 5003;
app.listen(PORT, () => {
  console.log(`Doctor Service running on port ${PORT}`);
});
