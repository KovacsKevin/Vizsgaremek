const db = require("../config/db");
const bcrypt = require("bcrypt");

// Összes felhasználó lekérése
const getAllUsers = (callback) => {
    const sql = "SELECT * FROM user";
    db.query(sql, callback);
};

// Egy felhasználó lekérése e-mail alapján
const getUserByEmail = (email, callback) => {
    const sql = "SELECT * FROM user WHERE Email = ?";
    db.query(sql, [email], (err, results) => {
        if (err) return callback(err, null);
        callback(null, results[0]); // Egyetlen felhasználó visszaadása
    });
};


// Jelszó frissítése az adatbázisban
const updatePassword = async (email, newPassword, callback) => {
    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const sql = "UPDATE user SET Jelszo = ? WHERE Email = ?";
        db.query(sql, [hashedPassword, email], callback);
    } catch (error) {
        callback(error, null);
    }
};

// Új felhasználó hozzáadása
const addUser = async (userData, callback) => {
    const { Email, Jelszo, Telefonszam, Felhasznalonev, Csaladnev, Keresztnev, Szuletesi_datum } = userData;
    
    try {
        const sql = `
            INSERT INTO user (Email, Jelszo, Telefonszam, Felhasznalonev, Csaladnev, Keresztnev, Szuletesi_datum)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        db.query(sql, [Email, Jelszo, Telefonszam, Felhasznalonev, Csaladnev, Keresztnev, Szuletesi_datum], callback);
    } catch (error) {
        callback(error, null);
    }
};

// Felhasználó törlése
const deleteUser = (id, callback) => {
    const sql = "DELETE FROM user WHERE Id = ?";
    db.query(sql, [id], callback);
};

// Felhasználó frissítése
const updateUser = (id, userData, callback) => {
    let sql = "UPDATE user SET ";
    const updates = [];
    const values = [];

    for (let key in userData) {
        updates.push(`${key} = ?`);
        values.push(userData[key]);
    }

    sql += updates.join(", ") + " WHERE Id = ?";
    values.push(id);

    db.query(sql, values, callback);
};

// Jelszó ellenőrzése (bcrypt.compare)
const checkPassword = async (enteredPassword, storedHash) => {
    return await bcrypt.compare(enteredPassword, storedHash);
};

module.exports = { getAllUsers, getUserByEmail, addUser, deleteUser, updateUser, getUserByEmail, updatePassword, checkPassword};