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
        type: DataTypes.ENUM('elfogadva', 'elutasítva', 'függőben', 'meghívott'),
        allowNull: false,
        defaultValue: 'függőben' 
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

Résztvevő.belongsTo(Esemény, { foreignKey: 'eseményId' });
Résztvevő.belongsTo(User, { foreignKey: 'userId' });

Esemény.hasMany(Résztvevő, { foreignKey: 'eseményId' });
User.hasMany(Résztvevő, { foreignKey: 'userId' });

module.exports = Résztvevő;