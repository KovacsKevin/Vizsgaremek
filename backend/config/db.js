const mysql = require("mysql");

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "sportpartner_kereso"
});

db.connect((err) => {
    if (err) {
        console.error("Adatbázis kapcsolat hiba: " + err.message);
    } else {
        console.log("Sikeres adatbázis kapcsolat!");
    }
});

module.exports = db;
