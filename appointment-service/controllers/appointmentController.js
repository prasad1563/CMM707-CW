const axios = require('axios');
const Appointment = require('../models/Appointment');

// Schedule Appointment with doctor availability check
exports.createAppointment = async (req, res) => {
  const { doctorName, patientName, appointmentDate } = req.body;

  try {
    // Fetch Doctor Data
    const doctorResponse = await axios.get(`${process.env.DOCTOR_SERVICE_URL}`);
    const doctor = doctorResponse.data.find(doc => doc.name === doctorName);

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Check Availability
    const isAvailable = doctor.availability.some(
      slot => new Date(slot).getTime() === new Date(appointmentDate).getTime()
    );

    if (!isAvailable) {
      // Send Notification
      await axios.post(`${process.env.NOTIFICATION_SERVICE_URL}`, {
        recipient: patientName,
        message: `Doctor ${doctorName} is not available on ${appointmentDate}.`,
      });

      return res.status(400).json({ message: 'Doctor not available' });
    }

    // Create Appointment
    const appointment = new Appointment({ doctorName, patientName, appointmentDate });
    await appointment.save();
    res.status(201).json(appointment);

  } catch (error) {
    console.error(error); // Log error details for debugging in production
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


// Read all appointments with optional filtering
exports.readAppointments = async (req, res) => {
  try {
    const { doctorName, patientName } = req.query;

    // Build query filters dynamically
    const filters = {};
    if (doctorName) filters.doctorName = doctorName;
    if (patientName) filters.patientName = patientName;

    // Fetch appointments from the database
    const appointments = await Appointment.find(filters);
    res.status(200).json(appointments);

  } catch (error) {
    console.error(error); // Log error details for debugging in production
    res.status(500).json({ error: 'Failed to retrieve appointments' });
  }
};