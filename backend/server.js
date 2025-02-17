const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const { authenticateUser, requestPasswordReset, resetPassword } = require("./controllers/userController");


dotenv.config();
const app = express();

app.use(bodyParser.json());
app.use(express.json());
app.post("/login", authenticateUser);
app.post("/forgot-password", requestPasswordReset);
app.post("/reset-password", resetPassword);
app.use(cors());

// Felhasználó útvonalak
app.use("/api/v1", userRoutes);

const PORT = 8081;
app.listen(PORT, () => {
    console.log(`Szerver fut a ${PORT}-as porton`);
});
