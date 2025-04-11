const express = require("express");
const router = express.Router();
const helyszinController = require("../controllers/helyszinController");
const jwt = require("jsonwebtoken"); 

const authenticateToken = (req, res, next) => {
    const token = req.header("Authorization")?.split(" ")[1]; 
    if (!token) return res.sendStatus(401); 

    jwt.verify(token, "secretkey", (err, user) => {
        if (err) return res.sendStatus(403);
        console.log(user);
        req.user = user; 
        next(); 
    });
};

router.post("/createHelyszin", authenticateToken, helyszinController.createHelyszin); 
router.get("/allHelyszin", helyszinController.getAllHelyszin); 
router.get("/getHelyszinById/:id", authenticateToken, helyszinController.getHelyszinById); 
router.put("/updateHelyszin/:id", authenticateToken, helyszinController.updateHelyszin); 
router.delete("/deleteHelyszin/:id", authenticateToken, helyszinController.deleteHelyszin); 
router.get("/getOwnHelyszin", authenticateToken, helyszinController.getMyOwnHelyszin); 

module.exports = router;
