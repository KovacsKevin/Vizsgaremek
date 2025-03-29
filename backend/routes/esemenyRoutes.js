const express = require("express");
const jwt = require("jsonwebtoken"); // Import jwt for token verification
const esemenyController = require("../controllers/esemenyController"); // Ensure this path is correct

const router = express.Router();

// Middleware to authenticate token (ensure the user is logged in)
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

// Create a new event (protected, requires authentication)
router.post("/createEsemeny", authenticateToken, esemenyController.createEsemeny);

// Get event by ID (public route, no authentication needed)
router.get("/getEsemeny/:id", esemenyController.getEsemenyById);

// Update event by ID (protected, only the event owner can update)
router.put("/updateEsemeny/:id", authenticateToken, esemenyController.updateEsemeny);

// Delete event by ID (protected, only the event owner can delete)
router.delete("/deleteEsemeny/:id", authenticateToken, esemenyController.deleteEsemeny);

// Get all events for the logged-in user (protected route)
router.get("/getAllEsemeny", esemenyController.getAllEsemeny);
router.get('/getEsemenyek/:telepules/:sportNev', esemenyController.getEsemenyekByTelepulesAndSportNev);
router.post("/join",authenticateToken, esemenyController.joinEsemeny);
router.get('/getesemenyimin/:id',authenticateToken,  esemenyController.getEsemenyMinimal);

// Get event participants
router.get("/events/:id/participants", esemenyController.getEventParticipants);

// Check if user is a participant
router.get("/events/:id/check-participation", authenticateToken, esemenyController.checkParticipation);
router.get('/getEsemenyekByAge/:telepules/:sportNev', authenticateToken, esemenyController.getEsemenyekFilteredByUserAge);

// Új végpont a kilépéshez
router.post("/leave", authenticateToken, esemenyController.leaveEsemeny);

// Új útvonal hozzáadása a router fájlhoz
router.get('/organized-events', authenticateToken, esemenyController.getOrganizedEvents);

// Új útvonal hozzáadása a router fájlhoz
router.get('/participated-events', authenticateToken, esemenyController.getParticipatedEvents);

// Get all events with details, ordered by start time descending
router.get("/events-with-details", esemenyController.getAllEsemenyWithDetails);




module.exports = router;
