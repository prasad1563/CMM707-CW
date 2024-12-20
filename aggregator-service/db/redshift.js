const { RedshiftDataClient } = require("@aws-sdk/client-redshift-data");

const redshiftDataApiClient = new RedshiftDataClient({
  region: process.env.AWS_REGION, // Ensure this environment variable is set in .env
  accessKeyId: process.env.AWS_ACCESS_KEY_ID, // Ensure in .env
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY // Ensure in .env
  }
);

module.exports = redshiftDataApiClient;
