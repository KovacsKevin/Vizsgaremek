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
        validate: {
            isEmail: {
                msg: "Érvénytelen email formátum"
            }
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: "A jelszó nem lehet üres"
            }
        }
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            len: {
                args: [4, 16],
                msg: "A felhasználónév 4-16 karakter hosszú lehet"
            },
            is: {
                args: /^[a-zA-Z0-9]+$/,
                msg: "A felhasználónév csak betűket és számokat tartalmazhat"
            }
        }
    },
    phone: {
        type: DataTypes.STRING,
        validate: {
            is: {
                args: /^(\+36|06)[ -]?(1|20|30|31|50|70)[ -]?(\d{3}[ -]?\d{4}|\d{2}[ -]?\d{2}[ -]?\d{3})$/,
                msg: "Érvénytelen magyar telefonszám formátum"
            }
        }
    },
    firstName: {
        type: DataTypes.STRING,
        validate: {
            len: {
                args: [2, 15],
                msg: "A keresztnév 2-15 karakter hosszú lehet"
            },
            is: {
                args: /^[a-zA-ZáéíóöőúüűÁÉÍÓÖŐÚÜŰ]+$/,
                msg: "A keresztnév csak betűket tartalmazhat"
            }
        }
    },
    lastName: {
        type: DataTypes.STRING,
        validate: {
            len: {
                args: [2, 15],
                msg: "A családnév 2-15 karakter hosszú lehet"
            },
            is: {
                args: /^[a-zA-ZáéíóöőúüűÁÉÍÓÖŐÚÜŰ]+$/,
                msg: "A családnév csak betűket tartalmazhat"
            }
        }
    },
    birthDate: {
        type: DataTypes.DATE,
        validate: {
            isValidAge(value) {
                if (value) {
                    const birthDate = new Date(value);
                    const today = new Date();
                    
                    // Életkor kiszámítása
                    let age = today.getFullYear() - birthDate.getFullYear();
                    const m = today.getMonth() - birthDate.getMonth();
                    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                        age--;
                    }
                    
                    // Ellenőrzés: 6-100 év közötti életkor
                    if (age < 6) {
                        throw new Error('A felhasználónak legalább 6 évesnek kell lennie');
                    }
                    if (age > 100) {
                        throw new Error('A felhasználó nem lehet 100 évnél idősebb');
                    }
                }
            }
        }
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
    },
    bio: {
        type: DataTypes.TEXT,
        allowNull: true,
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
