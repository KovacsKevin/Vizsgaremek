const express = require("express");
const cors = require("cors");
const mysql = require("mysql");

const app = express();

// Middleware-ek
app.use(cors());
app.use(express.json());  // Hozzáadjuk a JSON body parser-t

// Adatbázis kapcsolat
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "sportpartner_kereso"
});

// GET kérés
app.get("/", (req, res) => {
  const sql = "SELECT * FROM user";
  db.query(sql, (err, data) => {
    if (err) return res.json("Error");
    return res.json(data);
  });
});

// POST kérés a felhasználó hozzáadására
app.post("/addUser", (req, res) => {
  const { Email, Jelszo, Telefonszam, Felhasznalonev, Csaladnev, Keresztnev, Szuletesi_datum } = req.body;



  // Ellenőrizzük, hogy minden szükséges adat megvan
  if (!Email || !Jelszo || !Telefonszam || !Felhasznalonev || !Csaladnev || !Keresztnev || !Szuletesi_datum) {
    return res.status(400).json({ message: "Minden mező kitöltése kötelező!" });
  }

  // SQL query, hogy hozzáadjuk a felhasználót az adatbázishoz
  const sql = `
    INSERT INTO user (Email, Jelszo, Telefonszam, Felhasznalonev, Csaladnev, Keresztnev, Szuletesi_datum)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  
  db.query(sql, [Email, Jelszo, Telefonszam, Felhasznalonev, Csaladnev, Keresztnev, Szuletesi_datum], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Hiba történt a felhasználó hozzáadásakor" });
    }
    return res.status(201).json({ message: "Felhasználó hozzáadva!", id: result.insertId });
  });
});

app.delete("/deleteUser/:id", (req, res) => {
    const { id } = req.params;  // helyes kinyerés a req.params-ból

    // SQL lekérdezés: felhasználó törlés a megadott id alapján
    const sql = `DELETE FROM user WHERE Id = ?`;

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Hiba történt a felhasználó törlésében" });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "A felhasználó nem található" });
        }
        return res.status(200).json({ message: "Felhasználó törölve", id });
    });
});

// Szerver indítása
app.listen(8081, () => {
  console.log("listening on port 8081");
});
