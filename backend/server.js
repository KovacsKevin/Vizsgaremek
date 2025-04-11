const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const esemenyRoutes = require("./routes/esemenyRoutes");
const bodyParser = require("body-parser");
const helyszinRoutes = require("./routes/helyszinRoutes");
const sportokRoutes = require("./routes/sportokRoutes");
const dotenv = require("dotenv");
const sequelize = require("./config/db");
const User = require("./models/userModel"); 
const Esemény = require("./models/esemenyModel");
const Sportok = require("./models/sportokModel"); 
const Résztvevő = require("./models/resztvevoModel");
const { authenticateUser, requestPasswordReset, resetPassword } = require("./controllers/userController");
const path = require("path"); 
const { scheduleAllEvents } = require('./utils/eventScheduler');

dotenv.config();
const app = express();

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.json());
app.use(cors());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use("/api/v1", userRoutes);
app.use("/api/v1",esemenyRoutes);
app.use("/api/v1",helyszinRoutes);
app.use("/api/v1", sportokRoutes);


sequelize.sync({ alter: true }) 
    .then(() => console.log("✅ Database synchronized successfully!"))
    .catch((err) => console.error("❌ Error syncing database:", err));


const PORT = 8081;
app.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`);
  scheduleAllEvents();
});
