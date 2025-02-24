const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const sequelize = require("./config/db"); // Sequelize konfiguráció betöltése
const { authenticateUser, requestPasswordReset, resetPassword } = require("./controllers/userController");

dotenv.config();
const app = express();

app.use(bodyParser.json());
app.use(express.json());
app.use(cors());

// Felhasználó útvonalak
app.use("/api/v1", userRoutes);

// Adatbázis szinkronizálás
sequelize.sync({ alter: true }) // `alter: true` biztosítja a meglévő táblák frissítését
    .then(() => console.log("✅ Adatbázis sikeresen szinkronizálva!"))
    .catch((err) => console.error("❌ Adatbázis szinkronizálási hiba:", err));

const PORT = 8081;
app.listen(PORT, () => {
    console.log(`✅ Szerver fut a ${PORT}-as porton`);
});
