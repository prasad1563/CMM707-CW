const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialization: { type: String, required: true },
  availability: [{ type: Date, required: true }], // Array of available time slots
},{ collection: 'doctors' });

module.exports = mongoose.model('Doctor', doctorSchema);
