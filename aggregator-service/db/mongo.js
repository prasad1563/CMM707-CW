const mongoose = require("mongoose");
const env = require("dotenv");

env.config();
const connectDB = async () => {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("Database connected"))
    .catch((err) => console.error(err));
};

//dbconnection();

module.exports = connectDB;
