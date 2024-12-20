const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  doctorName: { type: String, required: true },
  patientName: { type: String, required: true },
  appointmentDate: { type: Date, required: true },
},{ collection: 'appointments' });

module.exports = mongoose.model('Appointment', appointmentSchema);
