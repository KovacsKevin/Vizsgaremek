const Helyszin = require("../models/helyszinModel");
const jwt = require("jsonwebtoken");

// Create Location (Helyszin) - Only authenticated users can create a location
const createHelyszin = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Authentication token is required!" });
        }

        const decoded = jwt.verify(token, "secretkey");
        const userId = decoded.userId;

        const { Nev, Cim, Telepules, Iranyitoszam, Fedett, Oltozo, Parkolas, Leiras, Berles } = req.body;

        if (!Nev || !Cim || !Telepules || !Iranyitoszam || !Fedett || !Oltozo || !Parkolas || !Leiras || !Berles) {
            return res.status(400).json({ message: "Missing required fields for creating location!" });
        }

        // Create a new location
        const newHelyszin = await Helyszin.create({
            Nev,
            Cim,
            Telepules,
            Iranyitoszam,
            Fedett,
            Oltozo,
            Parkolas,
            Leiras,
            Berles,
            userId,  // Assuming each location has a userId field for the owner
        });

        res.status(201).json({ message: "Location created successfully!", helyszin: newHelyszin });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error creating location", error });
    }
};

// Get all Locations (Helyszin) - Public access
const getAllHelyszin = async (req, res) => {
    try {
        // Fetch all locations from the database
        const helyszinek = await Helyszin.findAll();

        if (helyszinek.length === 0) {
            return res.status(404).json({ message: "No locations found." });
        }

        res.json({ helyszinek });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching locations", error });
    }
};

// Get a Location by ID (Public access)
const getHelyszinById = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the location by its ID
        const helyszin = await Helyszin.findByPk(id);

        if (!helyszin) {
            return res.status(404).json({ message: "Location not found!" });
        }

        res.json({ helyszin });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching location", error });
    }
};

// Update Location (Helyszin) - Only the owner can update the location
const updateHelyszin = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Authentication token is required!" });
        }

        const decoded = jwt.verify(token, "secretkey");
        const userId = decoded.userId;

        const { id } = req.params;
        const { Nev, Cim, Telepules, Iranyitoszam, Fedett, Oltozo, Parkolas, Leiras, Berles } = req.body;

        const helyszin = await Helyszin.findByPk(id);

        if (!helyszin) {
            return res.status(404).json({ message: "Location not found!" });
        }

        // Ensure the user is the owner of the location before updating
        if (helyszin.userId !== userId) {
            return res.status(403).json({ message: "You can only update your own locations!" });
        }

        // Update location details
        await helyszin.update({
            Nev,
            Cim,
            Telepules,
            Iranyitoszam,
            Fedett,
            Oltozo,
            Parkolas,
            Leiras,
            Berles,
        });

        res.status(200).json({ message: "Location updated successfully!", helyszin });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating location", error });
    }
};

// Delete Location (Helyszin) - Only the owner can delete the location
const deleteHelyszin = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Authentication token is required!" });
        }

        const decoded = jwt.verify(token, "secretkey");
        const userId = decoded.userId;

        const { id } = req.params;
        const helyszin = await Helyszin.findByPk(id);

        if (!helyszin) {
            return res.status(404).json({ message: "Location not found!" });
        }

        // Ensure the user is the owner of the location before deleting
        if (helyszin.userId !== userId) {
            return res.status(403).json({ message: "You can only delete your own locations!" });
        }

        // Delete the location
        await helyszin.destroy();

        res.status(200).json({ message: "Location deleted successfully!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error deleting location", error });
    }
};

module.exports = {
    createHelyszin,
    getAllHelyszin,
    getHelyszinById,
    updateHelyszin,
    deleteHelyszin,
};
