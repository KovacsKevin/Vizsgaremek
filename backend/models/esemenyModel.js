// models/Esemény.js
const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db");

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
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users', // Use the actual table name here
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

// Esemény model definition is done, now establish associations
Esemény.associate = function (models) {
    Esemény.belongsTo(models.User, { foreignKey: 'userId' });
};

sequelize.sync()
    .then(() => console.log("✅ Esemény table created!"))
    .catch(err => console.error("❌ Error creating Esemény table:", err));

module.exports = Esemény;
