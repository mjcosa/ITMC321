// config/db.js
const mongoose = require('mongoose');
require('dotenv').config(); // Loads the variables from .env

const connectDB = async () => {
  try {
    // Attempt to connect to the database using the URI from the .env file
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`MongoDB Connected Successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // Exit the Node process with a "failure" code (1) if the database fails to connect
    process.exit(1); 
  }
};

module.exports = connectDB;