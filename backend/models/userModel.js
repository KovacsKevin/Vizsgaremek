const db = require("../config/db");

// Felhasználók lekérése
const getAllUsers = (callback) => {
    const sql = "SELECT * FROM user";
    db.query(sql, callback);
};

// Új felhasználó hozzáadása
const addUser = (userData, callback) => {
    const { Email, Jelszo, Telefonszam, Felhasznalonev, Csaladnev, Keresztnev, Szuletesi_datum } = userData;
    const sql = `
        INSERT INTO user (Email, Jelszo, Telefonszam, Felhasznalonev, Csaladnev, Keresztnev, Szuletesi_datum)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(sql, [Email, Jelszo, Telefonszam, Felhasznalonev, Csaladnev, Keresztnev, Szuletesi_datum], callback);
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

module.exports = { getAllUsers, addUser, deleteUser, updateUser };
