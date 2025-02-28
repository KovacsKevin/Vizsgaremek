const express = require("express");
const router = express.Router();
const sportokController = require("../controllers/sportokController");
const jwt = require("jsonwebtoken");

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const token = req.header("Authorization")?.split(" ")[1]; // Example header format: "Bearer TOKEN"
    if (!token) return res.sendStatus(401); // Unauthorized

    jwt.verify(token, "secretkey", (err, user) => {
        if (err) return res.sendStatus(403); // Forbidden
        req.user = user; // Attach user info to the request
        next(); // Call the next middleware or route handler
    });
};

// Routes for Sportok (Sports)
router.post("/createSportok", authenticateToken, sportokController.createSportok); // Create a new sport
router.get("/allSportok", sportokController.getAllSportok); // Get all sports
router.get("/getSportokById", sportokController.getSportokById); // Get sport by ID
router.put("/updateSportok", authenticateToken, sportokController.updateSportok); // Update sport
router.delete("/deleteSportok", authenticateToken, sportokController.deleteSportok); // Delete sport

module.exports = router;
