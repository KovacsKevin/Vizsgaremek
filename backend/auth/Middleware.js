const jwt = require("jsonwebtoken");

const generateToken = (userId, email) => {
    return jwt.sign(
        { userId, email },
        "secretkey",  
        { expiresIn: "1h" }
    );
};


const authenticateToken = (req, res, next) => {
    const token = req.header("Authorization")?.split(" ")[1]; // Example header format: "Bearer TOKEN"
    if (!token) return res.sendStatus(401); // Unauthorized if token is missing

    // Verify the token using the secret key
    jwt.verify(token, "secretkey", (err, user) => {
        if (err) return res.sendStatus(403); // Forbidden if token is invalid
        req.user = user; // Attach user info to the request object
        next(); // Proceed to the next middleware or route handler
    });
};








module.exports = {
    generateToken,authenticateToken
};
