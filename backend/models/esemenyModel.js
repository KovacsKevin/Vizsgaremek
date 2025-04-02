const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require("./userModel");
const Helyszin = require("./helyszinModel");
const Sportok = require("./sportokModel");


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
            model: Helyszin,
            key: 'Id',
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
    sportId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Sportok,
            key: 'Id', 
        }
    },
    kezdoIdo: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
            isAfterNow(value) {
                if (new Date(value) < new Date()) {
                    throw new Error('A kezdő időpont nem lehet korábbi, mint a jelenlegi időpont!');
                }
            }
        }
    },
    zaroIdo: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
            isAfterKezdoIdo(value) {
                if (new Date(value) <= new Date(this.kezdoIdo)) {
                    throw new Error('A záró időpont nem lehet korábbi vagy egyenlő, mint a kezdő időpont!');
                }
            }
        }
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

    maximumLetszam: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 2
        }
    },

    imageUrl: { 
        type: DataTypes.STRING,  
        allowNull: true,  
    }
}, {
    timestamps: true,
});

Esemény.belongsTo(Helyszin, { foreignKey: 'helyszinId' });
Esemény.belongsTo(User, { foreignKey: 'userId' });
Esemény.belongsTo(Sportok, { foreignKey: 'sportId' })

sequelize.sync()
    .then(() => console.log("✅ Esemény table created or updated!"))
    .catch(err => console.error("❌ Error creating/updating Esemény table:", err));

module.exports = Esemény;
