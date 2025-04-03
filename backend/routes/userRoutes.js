// routes/userRoutes.js
const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../auth/Middleware");

// Middleware to authenticate token
const authenticateToken = (req, res, next) => {
    const token = req.header("Authorization")?.split(" ")[1]; // Example header format: "Bearer TOKEN"
    if (!token) return res.sendStatus(401); // Unauthorized

    jwt.verify(token, "secretkey", (err, user) => {
        if (err) return res.sendStatus(403); // Forbidden
        req.user = user; // Attach user info to the request
        next(); // Call the next middleware or route handler
    });
};

// API endpoints
router.post("/addUser", userController.createUser); // Create a new user
router.post("/login", userController.authenticateUser); // Authenticate a user
router.get("/getUser/:id", userController.getUser); // Get user by ID
router.put("/updateUser/:id", authenticateToken, userController.updateUser); // Update user by ID - most már védett
router.delete("/deleteUser/:id", authenticateToken, userController.deleteUser); // Delete user by ID - most már védett

// Új útvonalak a felhasználói beállítások kezeléséhez
router.get("/users/:id/settings", authenticateToken, userController.getUserSettings); // Beállítások lekérése
router.post("/users/:id/settings", authenticateToken, userController.saveUserSettings); // Beállítások mentése

// Felhasználói statisztikák lekérése
router.get('/user-stats/:userId', authenticateToken, userController.getUserStats);

// Changed from /protected to /login to verify a token and return user info
router.get("/login", authenticateToken, (req, res) => {
    res.json({ 
        message: "Login successful", 
        user: req.user,
        isAuthenticated: true
    });
});



module.exports = router;
