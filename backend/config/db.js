// config/db.js
const { Sequelize } = require("sequelize");

// Initialize Sequelize instance
const sequelize = new Sequelize({
  dialect: "mysql",  // Adjust this if using a different database
  host: "localhost", // Your database host
  username: "root",  // Your database username
  password: "",      // Your database password
  database: "sportpartner_kereso", // Your database name
});

module.exports = sequelize;
