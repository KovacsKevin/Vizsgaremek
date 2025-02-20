const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const User = require("../models/userModel");

dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY;

const getUsers = (req, res) => {
    User.getAllUsers((err, data) => {
        if (err) return res.status(500).json({ message: "Hiba történt!" });
        res.json(data);
    });
};

const createUser = async (req, res) => {
    const userData = req.body;

    if (!userData.Email || !userData.Jelszo || !userData.Felhasznalonev) {
        return res.status(400).json({ message: "Hiányzó adatok!" });
    }

    try {
        const hashedPassword = await bcrypt.hash(userData.Jelszo, 10);
        userData.Jelszo = hashedPassword;

        User.addUser(userData, (err, result) => {
            if (err) {
                return res.status(500).json({ message: "Hiba történt a felhasználó létrehozásakor" });
            }

            res.status(201).json({ message: "Felhasználó hozzáadva!", id: result.insertId });
        });
    } catch (error) {
        res.status(500).json({ message: "Hiba a jelszó titkosítása közben" });
    }
};

const deleteUser = (req, res) => {
    const { id } = req.params;
    User.deleteUser(id, (err, result) => {
        if (err) return res.status(500).json({ message: "Hiba történt a törlés során" });
        if (result.affectedRows === 0) return res.status(404).json({ message: "A felhasználó nem található" });
        res.json({ message: "Felhasználó törölve" });
    });
};

const updateUser = async (req, res) => {
    const { id } = req.params;
    const userData = req.body;

    try {
        if (userData.Jelszo) {
            userData.Jelszo = await bcrypt.hash(userData.Jelszo, 10);
        }

        User.updateUser(id, userData, (err, result) => {
            if (err) return res.status(500).json({ message: "Hiba történt a módosítás során" });
            if (result.affectedRows === 0) return res.status(404).json({ message: "A felhasználó nem található" });
            res.json({ message: "Felhasználó sikeresen módosítva" });
        });
    } catch (error) {
        res.status(500).json({ message: "Hiba a jelszó titkosítása közben" });
    }
};

// Middleware to validate JWT
const authenticateToken = (req, res, next) => {
    const token = req.header("Authorization");

    if (!token) {
        return res.status(401).json({ message: "Nincs token, hozzáférés megtagadva!" });
    }

    try {
        const decoded = jwt.verify(token.replace("Bearer ", ""), "process.env.JWT_SECRET");
        req.user = decoded; // Attach user data to request
        next();
    } catch (err) {
        res.status(403).json({ message: "Érvénytelen token!" });
    }
};

// Login route with authentication
const authenticateUser = async (req, res) => {
    const { Email, Jelszo } = req.body;

    if (!Email || !Jelszo) {
        return res.status(400).json({ message: "Hiányzó adatok!" });
    }

    User.getUserByEmail(Email, async (err, user) => {
        if (err) return res.status(500).json({ message: "Hiba történt az adatbázis lekérdezése során" });
        if (!user) return res.status(401).json({ message: "Hibás e-mail vagy jelszó!" });

        try {
            const isMatch = await bcrypt.compare(Jelszo, user.Jelszo);

            if (!isMatch) {
                return res.status(401).json({ message: "Hibás e-mail vagy jelszó!" });
            }

            // Generate JWT token
            const token = jwt.sign(
                { 
                    userId: user.ID,
                    email: user.Email,
                },
                "process.env.JWT_SECRET",  // Use environment variable for security
                { expiresIn: "1h" }
            );

            // Return token with success message
            res.json({ 
                message: "Sikeres bejelentkezés!", 
                token,
                user: {
                    id: user.ID,
                    email: user.Email,
                    name: user.Name,
                }
            });
        } catch (error) {
            console.error("❌ Hiba a jelszó ellenőrzése során:", error);
            res.status(500).json({ message: "Hiba történt a jelszó ellenőrzése során" });
        }
    });
};


const requestPasswordReset = (req, res) => {
    const { Email } = req.body;

    if (!Email) return res.status(400).json({ message: "E-mail megadása kötelező!" });

    User.getUserByEmail(Email, (err, user) => {
        if (err) return res.status(500).json({ message: "Hiba történt az adatbázis lekérdezése során" });
        if (!user) return res.status(404).json({ message: "A felhasználó nem található!" });

        const token = jwt.sign({ Email: user.Email }, SECRET_KEY, { expiresIn: "15m" });

        res.json({ 
            message: "Másold ki ezt a linket és nyisd meg a böngészőben:", 
            resetLink: `http://localhost:8081/reset-password?token=${token}`, 
            token 
        });
    });
};

const resetPassword = (req, res) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        return res.status(400).json({ message: "Hiányzó adatok!" });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        const Email = decoded.Email;

        User.updatePassword(Email, newPassword, (err) => {
            if (err) return res.status(500).json({ message: "Hiba történt a jelszó frissítése közben!" });
            res.json({ message: "Jelszó sikeresen módosítva!" });
        });
    } catch (error) {
        res.status(401).json({ message: "Érvénytelen vagy lejárt token!" });
    }
};

module.exports = { getUsers, createUser, deleteUser, updateUser, authenticateUser, requestPasswordReset, resetPassword,  authenticateToken };
