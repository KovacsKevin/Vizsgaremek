    // routes/userRoutes.js
    const express = require("express");
    const jwt = require("jsonwebtoken"); // Import jwt for token verification
    const router = express.Router();
    const userController = require("../controllers/userController"); // Ensure this path is correct

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
    router.put("/updateUser/:id", userController.updateUser); // Update user by ID
    router.delete("/deleteUser/:id", userController.deleteUser); // Delete user by ID

    // Use authenticateToken for the protected route
    router.get("/protected", authenticateToken, (req, res) => {
        res.json({ message: "This is a protected route!", user: req.user });
    });

    module.exports = router;
