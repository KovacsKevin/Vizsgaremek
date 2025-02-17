const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const User = require("../models/userModel");

dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY;


// 📧 Nodemailer beállítása
const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});


// Összes felhasználó lekérése
const getUsers = (req, res) => {
    User.getAllUsers((err, data) => {
        if (err) return res.status(500).json({ message: "Hiba történt!" });
        res.json(data);
    });
};

// Új felhasználó hozzáadása bcrypt titkosítással
const createUser = async (req, res) => {
    const userData = req.body;
    if (!userData.Email || !userData.Jelszo || !userData.Felhasznalonev) {
        return res.status(400).json({ message: "Hiányzó adatok!" });
    }

    try {
        // Jelszó titkosítása
        userData.Jelszo = await bcrypt.hash(userData.Jelszo, 10);
        
        User.addUser(userData, (err, result) => {
            if (err) return res.status(500).json({ message: "Hiba történt a felhasználó létrehozásakor" });
            res.status(201).json({ message: "Felhasználó hozzáadva!", id: result.insertId });
        });
    } catch (error) {
        res.status(500).json({ message: "Hiba a jelszó titkosítása közben" });
    }
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

// Felhasználó frissítése (Jelszót is titkosítja, ha módosul)
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

const authenticateUser = async (req, res) => {
    const { Email, Jelszo } = req.body;

    if (!Email || !Jelszo) {
        return res.status(400).json({ message: "Hiányzó adatok!" });
    }

    User.getUserByEmail(Email, async (err, user) => {
        if (err) return res.status(500).json({ message: "Hiba történt az adatbázis lekérdezése során" });
        if (!user) return res.status(401).json({ message: "Hibás e-mail vagy jelszó!" });

        try {
            console.log("📌 Beírt jelszó:", Jelszo);
            console.log("🔐 Adatbázisban tárolt hash:", user.Jelszo);

            // Titkosítjuk a beírt jelszót (az összehasonlítás előtt) és kiírjuk
            const hashedInputPassword = await bcrypt.hash(Jelszo, 10);
            console.log("🔒 Titkosított beírt jelszó:", hashedInputPassword);

            // Ellenőrzés közvetlenül bcrypt.compare használatával
            const isMatch = await bcrypt.compare(Jelszo, user.Jelszo);

            console.log("🔍 bcrypt.compare() bemeneti értékek:");
            console.log("   🔑 Beírt jelszó:", Jelszo);
            console.log("   🔒 Hash az adatbázisból:", user.Jelszo);
            console.log("✅ Jelszó egyezés eredménye:", isMatch);

            if (!isMatch) {
                return res.status(401).json({ message: "Hibás e-mail vagy jelszó!" });
            }

            res.json({ message: "Sikeres bejelentkezés!" });
        } catch (error) {
            console.error("❌ Hiba a jelszó ellenőrzése során:", error);
            res.status(500).json({ message: "Hiba történt a jelszó ellenőrzése során" });
        }
    });
};






// 🔹 Jelszó-visszaállítási link generálás és e-mail küldés
const requestPasswordReset = (req, res) => {
    const { Email } = req.body;

    if (!Email) return res.status(400).json({ message: "E-mail megadása kötelező!" });

    User.getUserByEmail(Email, (err, user) => {
        if (err) return res.status(500).json({ message: "Hiba történt az adatbázis lekérdezése során" });
        if (!user) return res.status(404).json({ message: "A felhasználó nem található!" });

        // JWT token létrehozása (15 percig érvényes)
        const token = jwt.sign({ Email: user.Email }, SECRET_KEY, { expiresIn: "15m" });

        const resetLink = `http://localhost:3000/reset-password?token=${token}`;

        // 📧 E-mail küldés
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: Email,
            subject: "Jelszó visszaállítás",
            text: `Kattints az alábbi linkre a jelszavad visszaállításához:\n${resetLink}\nEz a link 15 percig érvényes.`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return res.status(500).json({ message: "Hiba történt az e-mail küldése közben!" });
            }
            res.json({ message: "Jelszó-visszaállító e-mail elküldve!", token });
        });
    });
};


// 🔹 Jelszó módosítása a visszaállító tokennel
const resetPassword = (req, res) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        return res.status(400).json({ message: "Hiányzó adatok!" });
    }

    try {
        // Token dekódolása
        const decoded = jwt.verify(token, SECRET_KEY);
        const Email = decoded.Email;

        // Jelszó frissítése az adatbázisban
        User.updatePassword(Email, newPassword, (err) => {
            if (err) return res.status(500).json({ message: "Hiba történt a jelszó frissítése közben!" });
            res.json({ message: "Jelszó sikeresen módosítva!" });
        });
    } catch (error) {
        res.status(401).json({ message: "Érvénytelen vagy lejárt token!" });
    }
};

module.exports = { getUsers, createUser, deleteUser, updateUser, authenticateUser, requestPasswordReset, resetPassword };
