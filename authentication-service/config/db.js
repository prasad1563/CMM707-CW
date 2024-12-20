const mongoose = require("mongoose");
const env = require("dotenv");

env.config();
const dbconnection = async () => {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("Database connected"))
    .catch((err) => console.error(err));
};



//dbconnection();

module.exports = dbconnection;
