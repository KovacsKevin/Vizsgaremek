const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require("./userModel");
const Esemény = require("./esemenyModel");

const Résztvevő = sequelize.define("Résztvevő", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    eseményId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Esemény,
            key: 'id',
        }
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id',
        }
    },
    szerep: {
        type: DataTypes.ENUM('szervező', 'játékos'),
        allowNull: false,
        defaultValue: 'játékos'
    },
    csatlakozásDátuma: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    státusz: {
        type: DataTypes.ENUM('elfogadva', 'elutasítva', 'függőben'),
        allowNull: false,
        defaultValue: 'elfogadva'
    },
    megjegyzés: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['eseményId', 'userId']
        }
    ]
});

// Establish relationships
Résztvevő.belongsTo(Esemény, { foreignKey: 'eseményId' });
Résztvevő.belongsTo(User, { foreignKey: 'userId' });

// Add reverse relationships
Esemény.hasMany(Résztvevő, { foreignKey: 'eseményId' });
User.hasMany(Résztvevő, { foreignKey: 'userId' });

sequelize.sync()
    .then(() => console.log("✅ Resztvevo table created!"))
    .catch(err => console.error("❌ Error creating Helyszin table:", err));

module.exports = Résztvevő;