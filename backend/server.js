const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const esemenyRoutes = require("./routes/esemenyRoutes");
const bodyParser = require("body-parser");
const helyszinRoutes = require("./routes/helyszinRoutes");
const sportokRoutes = require("./routes/sportokRoutes");
const dotenv = require("dotenv");
const sequelize = require("./config/db"); // Sequelize configuration
const User = require("./models/userModel"); // Import User model to ensure it's synced
const Esemény = require("./models/esemenyModel");
const Sportok = require("./models/sportokModel"); // If you're using Esemény model as well
const Résztvevő = require("./models/resztvevoModel");
const { authenticateUser, requestPasswordReset, resetPassword } = require("./controllers/userController");
const path = require("path"); // Add path module
const { scheduleAllEvents } = require('./utils/eventScheduler');

dotenv.config();
const app = express();

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.json());
app.use(cors());

// Add this line to serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// User routes
app.use("/api/v1", userRoutes);
app.use("/api/v1",esemenyRoutes);
app.use("/api/v1",helyszinRoutes);
app.use("/api/v1", sportokRoutes);


// Synchronize the database, including the User and other models like Esemény
sequelize.sync({ alter: true }) // `alter: true` ensures that existing tables are updated if needed
    .then(() => console.log("✅ Database synchronized successfully!"))
    .catch((err) => console.error("❌ Error syncing database:", err));


const PORT = 8081;
app.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`);
    // Összes aktív esemény időzítésének beállítása
  scheduleAllEvents();
});
