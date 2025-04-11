const jwt = require("jsonwebtoken");

const generateToken = (userId, email) => {
    return jwt.sign(
        { userId, email },
        "secretkey",  
        { expiresIn: "1h" }
    );
};


const authenticateToken = (req, res, next) => {
    const token = req.header("Authorization")?.split(" ")[1];
    if (!token) return res.sendStatus(401); 

    jwt.verify(token, "secretkey", (err, user) => {
        if (err) return res.sendStatus(403); 
        req.user = user; 
        next(); 
    });
};








module.exports = {
    generateToken,authenticateToken
};
