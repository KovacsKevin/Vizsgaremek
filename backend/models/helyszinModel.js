const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db");

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
            min: 1000,  
            max: 9999,  
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
    userId: {
        type: DataTypes.INTEGER,
        references: {
            model: 'Users',  
            key: 'id',      
        },
        allowNull: false,  
    }
}, {
    timestamps: true,
});


module.exports = Helyszin;
