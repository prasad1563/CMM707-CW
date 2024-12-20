const express = require('express');
const app = express();

// Health check endpoint
app.get('/api/auth/health', (req, res) => {
  res.status(200).send('OK'); // Responds with a 200 status if the service is healthy
});

app.use(express.json());

// Send notification
app.post('/api/notify', (req, res) => {
  const { recipient, message } = req.body;

  if (!recipient || !message) {
    return res.status(400).json({ error: 'Recipient and message are required' });
  }

  console.log(`Notification sent to ${recipient}: ${message}`);
  res.status(200).json({ success: true, message: 'Notification sent' });
});

const PORT = process.env.NOTIFICATION_SERVICE_PORT || 6000;
app.listen(PORT, () => console.log(`Notification Service running on port ${PORT}`));
