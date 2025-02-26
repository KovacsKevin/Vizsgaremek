// models/Esemény.js
const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require("./userModel");  // Assuming User model is correctly imported
const Helyszin = require("./helyszinModel");  // Import the Helyszin model

// Define the Esemény model
const Esemény = sequelize.define("Esemény", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    helyszinId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Helyszin,  // Reference the Helyszin model
            key: 'Id',  // The key in the Helyszin table
        }
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,  // Reference the User model
            key: 'id',
        }
    },
    sportId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    kezdoIdo: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    zaroIdo: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    szint: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    minimumEletkor: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    maximumEletkor: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    timestamps: true,
});

// Establish associations
Esemény.belongsTo(Helyszin, { foreignKey: 'helyszinId' });
Esemény.belongsTo(User, { foreignKey: 'userId' });

sequelize.sync()
    .then(() => console.log("✅ Esemény table created!"))
    .catch(err => console.error("❌ Error creating Esemény table:", err));

module.exports = Esemény;
