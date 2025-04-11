const Sportok = require("../models/sportokModel");
const jwt = require("jsonwebtoken");

const createSportok = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Authentication token is required!" });
        }

        const decoded = jwt.verify(token, "secretkey");
        const userId = decoded.userId;

        const { Nev, Leiras } = req.body;

        if (!Nev || !Leiras) {
            return res.status(400).json({ message: "Missing required fields for creating sport!" });
        }

        const newSportok = await Sportok.create({
            Nev,
            Leiras,
            userId, 
        });

        res.status(201).json({ message: "Sport created successfully!", sportok: newSportok });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error creating sport", error });
    }
};

const getAllSportok = async (req, res) => {
    try {
        const sportok = await Sportok.findAll();

        if (sportok.length === 0) {
            return res.status(404).json({ message: "No sports found." });
        }

        res.json({ sportok });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching sports", error });
    }
};

const getSportokById = async (req, res) => {
    try {
        const { id } = req.params;

        const sportok = await Sportok.findByPk(id);

        if (!sportok) {
            return res.status(404).json({ message: "Sport not found!" });
        }

        res.json({ sportok });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching sport", error });
    }
};

const updateSportok = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Authentication token is required!" });
        }

        const decoded = jwt.verify(token, "secretkey");
        const userId = decoded.userId;

        const { id } = req.params;
        const { Nev, Leiras } = req.body;

        const sportok = await Sportok.findByPk(id);

        if (!sportok) {
            return res.status(404).json({ message: "Sport not found!" });
        }

        if (sportok.userId !== userId) {
            return res.status(403).json({ message: "You can only update your own sports!" });
        }

        await sportok.update({
            Nev,
            Leiras,
        });

        res.status(200).json({ message: "Sport updated successfully!", sportok });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating sport", error });
    }
};

const deleteSportok = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Authentication token is required!" });
        }

        const decoded = jwt.verify(token, "secretkey");
        const userId = decoded.userId;

        const { id } = req.params;
        const sportok = await Sportok.findByPk(id);

        if (!sportok) {
            return res.status(404).json({ message: "Sport not found!" });
        }

        if (sportok.userId !== userId) {
            return res.status(403).json({ message: "You can only delete your own sports!" });
        }

        await sportok.destroy();

        res.status(200).json({ message: "Sport deleted successfully!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error deleting sport", error });
    }
};






module.exports = {
    createSportok,
    getAllSportok,
    getSportokById,
    updateSportok,
    deleteSportok,
};
