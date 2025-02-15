const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// API végpontok
router.get("/getUser", userController.getUsers);
router.post("/addUser", userController.createUser);
router.delete("/deleteUser/:id", userController.deleteUser);
router.put("/updateUser/:id", userController.updateUser);

module.exports = router;
