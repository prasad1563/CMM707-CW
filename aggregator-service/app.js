const express = require('express');
const { aggregateData } = require('./jobs/aggregatorJob'); 
const app = express();

// Health check endpoint
app.get('/api/auth/health', (req, res) => {
    res.status(200).send('OK'); // Responds with a 200 status if the service is healthy
  });


// Start the aggregation job
aggregateData();

const PORT = process.env.AGG_SERVICE_PORT || 5006;
app.listen(PORT, () => console.log(`Aggregator Service running on port ${PORT}`));
