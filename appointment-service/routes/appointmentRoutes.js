const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');

// Route to schedule an appointment
router.post('/', appointmentController.createAppointment);
// Route to get appointments with optional filters
router.get('/', appointmentController.readAppointments);

module.exports = router;

