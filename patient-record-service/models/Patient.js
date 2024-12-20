const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, required: true },
  medicalHistory: { type: String },
  prescriptions: [{ type: String }],
  labResults: [{ type: String }],
},{ collection: 'patients' });

module.exports = mongoose.model('Patient', patientSchema);
