const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db");

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
        type: DataTypes.STRING, 
        allowNull: true,  
    }
}, {
    timestamps: false,  
});


module.exports = Sportok;
