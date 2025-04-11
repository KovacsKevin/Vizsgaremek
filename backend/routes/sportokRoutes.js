const express = require("express");
const router = express.Router();
const sportokController = require("../controllers/sportokController");
const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
    const token = req.header("Authorization")?.split(" ")[1]; 
    if (!token) return res.sendStatus(401); 

    jwt.verify(token, "secretkey", (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user; 
        next(); 
    });
};

// Routes for Sportok (Sports)
router.post("/createSportok", authenticateToken, sportokController.createSportok); 
router.get("/allSportok", sportokController.getAllSportok); 
router.get("/getSportokById", sportokController.getSportokById); 
router.put("/updateSportok", authenticateToken, sportokController.updateSportok); 
router.delete("/deleteSportok", authenticateToken, sportokController.deleteSportok); 

module.exports = router;
