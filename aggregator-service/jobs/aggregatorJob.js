const axios = require('axios');
const redshiftDataApiClient = require('../db/redshift'); // Import Redshift Data API client
require('dotenv').config();
const { ExecuteStatementCommand } = require('@aws-sdk/client-redshift-data');

const aggregateData = async () => {
  try {
    // Fetch data from external services (Doctor, Appointment, Patient)
    const doctorsResponse = await axios.get(`${process.env.DOCTOR_SERVICE_URL}`); // Doctor service API
    const appointmentsResponse = await axios.get(`${process.env.APPOINTMENT_SERVICE_URL}`); // Appointment service API
    const patientsResponse = await axios.get(`${process.env.PATIENT_SERVICE_URL}`); // Patient service API

    const doctors = doctorsResponse.data;
    const appointments = appointmentsResponse.data;
    const patients = patientsResponse.data;

    // Aggregate the appointment data
    const aggregatedData = doctors.map(doctor => {
      const doctorAppointments = appointments.filter(appointment => appointment.doctorName === doctor.name);

      const appointmentCount = doctorAppointments.length;
      const appointmentFrequency = calculateAppointmentFrequency(doctorAppointments);

      // Aggregate symptoms and conditions (grouped by specialty)
      const symptomConditionSummary = aggregateSymptomsAndConditions(patients, doctorAppointments, doctor.specialization);

      return {
        doctorName: doctor.name,
        appointmentCount,
        appointmentFrequency,
        specialty: doctor.specialization,
        symptomsConditions: symptomConditionSummary
      };
    });

    // Save the aggregated data to Redshift
    await saveAggregatedDataToRedshift(aggregatedData);
  } catch (error) {
    console.error('Error in aggregation job:', error);
  }
};

// Helper function to calculate the appointment frequency
const calculateAppointmentFrequency = (appointments) => {
  const appointmentDates = appointments.map(appointment => new Date(appointment.date));
  const sortedDates = appointmentDates.sort((a, b) => a - b);

  if (sortedDates.length < 2) {
    return 'random';  // If less than 2 appointments, consider as random
  }

  const dateDifferences = sortedDates.slice(1).map((date, index) => (date - sortedDates[index]) / (1000 * 3600 * 24)); // days difference
  const averageDifference = dateDifferences.reduce((acc, diff) => acc + diff, 0) / dateDifferences.length;

  if (averageDifference <= 7) {
    return 'weekly';
  } else if (averageDifference <= 30) {
    return 'monthly';
  } else {
    return 'random';
  }
};

// Aggregate symptoms and conditions for each specialty
// Aggregate symptoms and conditions for each specialty
// Aggregate symptoms and conditions for each specialty
const aggregateSymptomsAndConditions = (patients, doctorAppointments) => {
  // Gather all symptoms/conditions from patients who visited the doctor
  const allConditions = doctorAppointments.flatMap(appointment => {
    const patient = patients.find(patient => patient.name === appointment.patientName);
    if (patient && patient.medicalHistory) {
      // Directly use the string as it is
      const conditionsString = patient.medicalHistory;
      return [conditionsString.trim()];  // If it's a single condition string, include it directly
    }
    return [];
  });

  // Count the frequency of each condition
  const conditionCount = allConditions.reduce((acc, condition) => {
    acc[condition] = (acc[condition] || 0) + 1;
    return acc;
  }, {});

  // Create a formatted string for the symptoms/conditions with their counts
  const symptomsConditions = Object.entries(conditionCount)
    .map(([condition, count]) => `${condition} (${count})`)
    .join(', ');

  return { symptomsConditions, conditionCount: allConditions.length };
};


// Save the aggregated data to Redshift
const saveAggregatedDataToRedshift = async (aggregatedData) => {
  if (!aggregatedData || aggregatedData.length === 0) {
    console.error('No data to save to Redshift.');
    return;
  }

  const escapeString = (value) => {
    if (value == null) return '';  // If value is null or undefined, return an empty string
    return String(value).replace(/'/g, "''"); // Escape single quotes
  };

  try {
    console.log("Truncating Redshift tables...");

    // Truncate existing tables
    const truncateAppointments = `
      TRUNCATE TABLE aggregated_appointments;
    `;
    const truncateSymptoms = `
      TRUNCATE TABLE aggregated_symptoms_conditions;
    `;

    // Execute truncate statements
    await redshiftDataApiClient.send(new ExecuteStatementCommand({
      ClusterIdentifier: process.env.REDSHIFT_CLUSTER_ID,
      Database: process.env.REDSHIFT_DB,
      DbUser: process.env.REDSHIFT_USER,
      Sql: truncateAppointments
    }));

    await redshiftDataApiClient.send(new ExecuteStatementCommand({
      ClusterIdentifier: process.env.REDSHIFT_CLUSTER_ID,
      Database: process.env.REDSHIFT_DB,
      DbUser: process.env.REDSHIFT_USER,
      Sql: truncateSymptoms
    }));

    console.log("Tables truncated successfully. Starting data insertion...");

    for (const data of aggregatedData) {
      // Validate required fields
      if (!data.doctorName || !data.appointmentFrequency || !data.specialty || !data.symptomsConditions) {
        console.error('Invalid data entry:', data);
        continue;
      }

      // SQL to insert aggregated appointments
      const appointmentSqlStatement = `
        INSERT INTO aggregated_appointments (doctor_name, appointment_count, appointment_frequency, specialty)
        VALUES ('${escapeString(data.doctorName)}', ${data.appointmentCount}, 
                '${escapeString(data.appointmentFrequency)}', '${escapeString(data.specialty)}');
      `;

      // SQL to insert symptoms and conditions
      const symptomsSqlStatement = `
        INSERT INTO aggregated_symptoms_conditions (specialty, symptoms_conditions, condition_count)
        VALUES ('${escapeString(data.specialty)}', '${escapeString(data.symptomsConditions.symptomsConditions)}', 
                ${data.symptomsConditions.conditionCount});
      `;

      // Log the SQL queries for debugging
      console.log('Executing SQL for appointments:', appointmentSqlStatement);
      console.log('Executing SQL for symptoms/conditions:', symptomsSqlStatement);

      // Execute the SQL commands
      await redshiftDataApiClient.send(new ExecuteStatementCommand({
        ClusterIdentifier: process.env.REDSHIFT_CLUSTER_ID,
        Database: process.env.REDSHIFT_DB,
        DbUser: process.env.REDSHIFT_USER,
        Sql: appointmentSqlStatement
      }));

      await redshiftDataApiClient.send(new ExecuteStatementCommand({
        ClusterIdentifier: process.env.REDSHIFT_CLUSTER_ID,
        Database: process.env.REDSHIFT_DB,
        DbUser: process.env.REDSHIFT_USER,
        Sql: symptomsSqlStatement
      }));
    }

    console.log('Aggregated data saved to Redshift successfully.');
  } catch (error) {
    console.error('Error saving aggregated data to Redshift:', error);
    throw error;
  }
};

module.exports = { aggregateData };
