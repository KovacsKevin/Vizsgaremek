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
        validate: {
            notEmpty: true
        }
    },
    Cim: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    Telepules: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    Iranyitoszam: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            isInt: true,
            min: 1000,  // Ensures 4-digit postal codes
            max: 9999,  // Ensures 4-digit postal codes
            len: {
                args: [4, 4],
                msg: "Az irányítószám pontosan 4 számjegyből kell álljon"
            }
        }
    },
    Fedett: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    Oltozo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    Parkolas: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            isIn: [['ingyenes', 'fizetős', 'nincs']]
        }
    },
    Leiras: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: ""
    },
    Berles: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
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
