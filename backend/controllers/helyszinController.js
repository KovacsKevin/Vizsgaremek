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

        // Update the validation in createHelyszin function
        if (!Nev || !Cim || !Telepules || !Iranyitoszam || !Parkolas) {
            return res.status(400).json({ message: "Missing required fields for creating location!" });
        }

        // When creating a new location, set default empty string for Leiras if not provided
        const newHelyszin = await Helyszin.create({
            Nev,
            Cim,
            Telepules,
            Iranyitoszam,
            Fedett: Fedett !== undefined ? Fedett : false,
            Oltozo: Oltozo !== undefined ? Oltozo : false,
            Parkolas,
            Leiras: Leiras || "",
            Berles: Berles !== undefined ? Berles : false,
            userId,
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

        if (!id) {
            return res.status(400).json({ message: "Location ID is required!" });
        }

        // Find the location by its ID
        const helyszin = await Helyszin.findByPk(id);

        if (!helyszin) {
            return res.status(404).json({ message: "Location not found!" });
        }

        res.json({ helyszin });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching location", error: error.message });
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
            Leiras: Leiras || "", // Provide default empty string if not provided
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

const getMyOwnHelyszin = async (req, res) => {
    try {
        const userId = req.user?.userId; // Accessing userId instead of id

        if (!userId) {
            return res.status(400).json({ message: "User ID is missing in the request." });
        }

        // Find the locations associated with the authenticated user
        const helyszin = await Helyszin.findAll({
            where: {
                userId: userId // Assuming `user_id` is the column that associates helyszin with the user
            }
        });

        if (helyszin.length === 0) {
            return res.status(404).json({ message: "No locations found for this user!" });
        }

        res.json({ locations: helyszin });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching locations", error });
    }
};




module.exports = {
    createHelyszin,
    getAllHelyszin,
    getHelyszinById,
    updateHelyszin,
    deleteHelyszin,
    getMyOwnHelyszin
};
