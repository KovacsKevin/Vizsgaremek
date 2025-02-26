const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const Esemény = require("../models/esemenyModel");

// Create Event (Esemény)
const createEsemeny = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Authentication token is required!" });
        }

        const decoded = jwt.verify(token, "secretkey");
        const userId = decoded.userId;

        const { helyszinId, sportId, kezdoIdo, zaroIdo, szint, minimumEletkor, maximumEletkor } = req.body;

        if (!helyszinId || !sportId || !kezdoIdo || !zaroIdo || !szint || !minimumEletkor || !maximumEletkor) {
            return res.status(400).json({ message: "Missing required fields for creating event!" });
        }

        const newEsemény = await Esemény.create({
            helyszinId,
            sportId,
            kezdoIdo,
            zaroIdo,
            szint,
            minimumEletkor,
            maximumEletkor,
            userId,
        });

        res.status(201).json({ message: "Event created successfully!", esemeny: newEsemény });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error creating event", error });
    }
};

// Delete Event (Only by the Owner)
const deleteEsemeny = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Authentication token is required!" });
        }

        const decoded = jwt.verify(token, "secretkey");
        const userId = decoded.userId;

        const { id } = req.params;
        const esemeny = await Esemény.findByPk(id);

        if (!esemeny) {
            return res.status(404).json({ message: "Event not found!" });
        }

        if (esemeny.userId !== userId) {
            return res.status(403).json({ message: "You can only delete your own events!" });
        }

        await esemeny.destroy();

        res.status(200).json({ message: "Event deleted successfully!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error deleting event", error });
    }
};

// Edit Event (Only by the Owner)
const updateEsemeny = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Authentication token is required!" });
        }

        const decoded = jwt.verify(token, "secretkey");
        const userId = decoded.userId;

        const { id } = req.params;
        const { helyszinId, sportId, kezdoIdo, zaroIdo, szint, minimumEletkor, maximumEletkor } = req.body;

        const esemeny = await Esemény.findByPk(id);

        if (!esemeny) {
            return res.status(404).json({ message: "Event not found!" });
        }

        if (esemeny.userId !== userId) {
            return res.status(403).json({ message: "You can only edit your own events!" });
        }

        // Update event details
        await esemeny.update({
            helyszinId,
            sportId,
            kezdoIdo,
            zaroIdo,
            szint,
            minimumEletkor,
            maximumEletkor
        });

        res.status(200).json({ message: "Event updated successfully!", esemeny });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating event", error });
    }
};

// Get Event by ID (Public - No authentication required)
const getEsemenyById = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the event by its ID
        const esemeny = await Esemény.findByPk(id);

        if (!esemeny) {
            return res.status(404).json({ message: "Event not found!" });
        }

        res.json({ esemeny });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching event", error });
    }
};

// Get All Events for the Logged-in User (Requires Authentication)
const getAllEsemeny = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Authentication token is required!" });
        }

        const decoded = jwt.verify(token, "secretkey");
        const userId = decoded.userId;

        // Find all events created by the logged-in user
        const events = await Esemény.findAll({
            where: { userId },
        });

        res.json({ events });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching events", error });
    }
};

module.exports = { createEsemeny, deleteEsemeny, updateEsemeny, getEsemenyById, getAllEsemeny };
