const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db");

// Define the User model
const User = sequelize.define("User", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    phone: {
        type: DataTypes.STRING,
    },
    firstName: {
        type: DataTypes.STRING,
    },
    lastName: {
        type: DataTypes.STRING,
    },
    birthDate: {
        type: DataTypes.DATE,
    },
    // Ellenőrizzük, hogy a mezők típusa megfelelő-e
    profileBackground: {
        type: DataTypes.STRING,
        defaultValue: "gradient1"
    },
    customBackground: {
        type: DataTypes.TEXT('long'),  // Nagyobb méretű TEXT típus a képadatokhoz
    },
    profilePicture: {
        type: DataTypes.TEXT('long'),  // Nagyobb méretű TEXT típus a képadatokhoz
    }
}, {
    timestamps: true,
});

// User model definition is done, now establish associations
User.associate = function (models) {
    User.hasMany(models.Esemény, { foreignKey: 'userId' });
};

User.associate = function (models) {
    User.hasMany(models.Helyszin, { foreignKey: 'userId' });  // User can have many locations
};

sequelize.sync()
    .then(() => console.log("✅ User table created!"))
    .catch(err => console.error("❌ Error creating User table:", err));

module.exports = User;