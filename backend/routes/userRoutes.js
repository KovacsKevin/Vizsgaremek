const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { authenticateToken, } = require("../controllers/userController"); 


// API végpontok
router.get("/getUser", userController.getUsers);
router.post("/addUser", userController.createUser);
router.delete("/deleteUser/:id", userController.deleteUser);
router.put("/updateUser/:id", userController.updateUser);
router.post("/login",userController.authenticateUser);
router.get("/get", (req, res) => {
    res.send("Helo")
})
router.get("/protected", authenticateToken, (req, res) => {
    res.json({ message: "Ez egy védett útvonal!", user: req.user });
});
module.exports = router;
