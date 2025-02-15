const User = require("../models/userModel");

// Összes felhasználó lekérése
const getUsers = (req, res) => {
    User.getAllUsers((err, data) => {
        if (err) return res.status(500).json({ message: "Hiba történt!" });
        res.json(data);
    });
};

// Új felhasználó hozzáadása
const createUser = (req, res) => {
    const userData = req.body;
    if (!userData.Email || !userData.Jelszo || !userData.Felhasznalonev) {
        return res.status(400).json({ message: "Hiányzó adatok!" });
    }

    User.addUser(userData, (err, result) => {
        if (err) return res.status(500).json({ message: "Hiba történt a felhasználó létrehozásakor" });
        res.status(201).json({ message: "Felhasználó hozzáadva!", id: result.insertId });
    });
};

// Felhasználó törlése
const deleteUser = (req, res) => {
    const { id } = req.params;
    User.deleteUser(id, (err, result) => {
        if (err) return res.status(500).json({ message: "Hiba történt a törlés során" });
        if (result.affectedRows === 0) return res.status(404).json({ message: "A felhasználó nem található" });
        res.json({ message: "Felhasználó törölve" });
    });
};

// Felhasználó frissítése
const updateUser = (req, res) => {
    const { id } = req.params;
    const userData = req.body;

    User.updateUser(id, userData, (err, result) => {
        if (err) return res.status(500).json({ message: "Hiba történt a módosítás során" });
        if (result.affectedRows === 0) return res.status(404).json({ message: "A felhasználó nem található" });
        res.json({ message: "Felhasználó sikeresen módosítva" });
    });
};

module.exports = { getUsers, createUser, deleteUser, updateUser };
