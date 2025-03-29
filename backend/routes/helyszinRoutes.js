const express = require("express");
const router = express.Router();
const helyszinController = require("../controllers/helyszinController");
const jwt = require("jsonwebtoken"); // Import jwt for token verification




const authenticateToken = (req, res, next) => {
    const token = req.header("Authorization")?.split(" ")[1]; // Example header format: "Bearer TOKEN"
    if (!token) return res.sendStatus(401); // Unauthorized

    jwt.verify(token, "secretkey", (err, user) => {
        if (err) return res.sendStatus(403); // Forbidden
        console.log(user); // Check what user contains
        req.user = user; // Attach user info to the request
        next(); // Call the next middleware or route handler
    });
};





router.post("/createHelyszin",authenticateToken, helyszinController.createHelyszin); // Create a new location
router.get("/allHelyszin", helyszinController.getAllHelyszin); // Get all locations
router.get("/getHelyszinById",authenticateToken, helyszinController.getHelyszinById); // Get location by ID
router.put("updateHelyszin", authenticateToken,helyszinController.updateHelyszin); // Update location
router.delete("deleteHelyszin", authenticateToken, helyszinController.deleteHelyszin); // Delete location
router.get("/getOwnHelyszin",authenticateToken, helyszinController.getMyOwnHelyszin); 
module.exports = router;