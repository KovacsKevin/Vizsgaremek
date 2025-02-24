// dbConfig.js - Database configuration using Sequelize
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
    "sportpartner_kereso", // Database name
    "root", // Database user
    "", // Database password
    {
        host: "localhost",
        dialect: "mysql",
        logging: false,
    }
);

sequelize.authenticate()
    .then(() => console.log("✅ Sikeres adatbázis kapcsolat!"))
    .catch(err => console.error("❌ Adatbázis kapcsolat hiba:", err));

module.exports = sequelize;