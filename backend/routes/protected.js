router.get("/login", authenticateToken, (req, res) => {
    res.json({ 
        message: "Login successful", 
        user: req.user,
        isAuthenticated: true
    });
});

module.exports = router;