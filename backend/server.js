const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Felhasználó útvonalak
app.use("/api/v1", userRoutes);

app.listen(8081, () => {
    console.log("Szerver fut a 8081-es porton");
});
