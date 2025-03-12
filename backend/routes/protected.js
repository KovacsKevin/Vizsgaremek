// Changed from /protected to /login to verify a token and return user info
router.get("/login", authenticateToken, (req, res) => {
    res.json({ 
        message: "Login successful", 
        user: req.user,
        isAuthenticated: true
    });
});

module.exports = router;