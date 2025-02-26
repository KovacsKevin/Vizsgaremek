const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db");

// Define the Helyszin model
const Helyszin = sequelize.define("Helyszin", {
    Id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    Nev: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    Cim: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    Telepules: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    Iranyitoszam: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    Fedett: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
    },
    Oltozo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
    },
    Parkolas: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    Leiras: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    Berles: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
    },
    // Add userId as a foreign key linking Helyszin to User
    userId: {
        type: DataTypes.INTEGER,
        references: {
            model: 'Users',  // Referencing the User model
            key: 'id',       // The primary key in the User model
        },
        allowNull: false,  // Making this field mandatory
    }
}, {
    timestamps: true,
});

// Sync the model with the database
sequelize.sync()
    .then(() => console.log("✅ Helyszin table created!"))
    .catch(err => console.error("❌ Error creating Helyszin table:", err));

module.exports = Helyszin;
