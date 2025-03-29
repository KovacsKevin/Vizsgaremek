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

router.post("/createHelyszin", authenticateToken, helyszinController.createHelyszin); // Create a new location
router.get("/allHelyszin", helyszinController.getAllHelyszin); // Get all locations
router.get("/getHelyszinById/:id", authenticateToken, helyszinController.getHelyszinById); // Get location by ID - Added :id parameter
router.put("/updateHelyszin/:id", authenticateToken, helyszinController.updateHelyszin); // Fixed: Added leading slash and :id parameter
router.delete("/deleteHelyszin/:id", authenticateToken, helyszinController.deleteHelyszin); // Fixed: Added leading slash and :id parameter
router.get("/getOwnHelyszin", authenticateToken, helyszinController.getMyOwnHelyszin); 

module.exports = router;
