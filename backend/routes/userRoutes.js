const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../auth/Middleware");

const authenticateToken = (req, res, next) => {
    const token = req.header("Authorization")?.split(" ")[1]; 
    if (!token) return res.sendStatus(401); 

    jwt.verify(token, "secretkey", (err, user) => {
        if (err) return res.sendStatus(403); 
        req.user = user; 
        next(); 
    });
};

// API endpoints
router.post("/addUser", userController.createUser);
router.post("/login", userController.authenticateUser); 
router.get("/getUser/:id", userController.getUser);
router.put("/updateUser/:id", authenticateToken, userController.updateUser);
router.delete("/deleteUser/:id", authenticateToken, userController.deleteUser); 

router.get("/users/:id/settings", authenticateToken, userController.getUserSettings);
router.post("/users/:id/settings", authenticateToken, userController.saveUserSettings);

router.get('/user-stats/:userId', authenticateToken, userController.getUserStats);

router.get("/login", authenticateToken, (req, res) => {
    res.json({ 
        message: "Login successful", 
        user: req.user,
        isAuthenticated: true
    });
});

router.get("/list",authenticateToken,userController.listAllUsers)

router.get("/search-users", authenticateToken, userController.searchUsers);

module.exports = router;
