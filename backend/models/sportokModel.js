const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db");

// Define the Sportok model
const Sportok = sequelize.define("Sportok", {
    Id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    Nev: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    Leiras: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    KepUrl: {
        type: DataTypes.STRING, // Kép URL-t tárolunk itt
        allowNull: true,  // Ha nem kötelező a kép, akkor allowNull true
    }
}, {
    timestamps: false,  // No timestamps as in the provided SQL definition
});

// Sync the model with the database


module.exports = Sportok;
