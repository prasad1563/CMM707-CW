const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');

router.post('/patients', patientController.createPatient);
router.get('/patients', patientController.getPatients);

module.exports = router;
