const Helyszin = require("../models/helyszinModel");
const jwt = require("jsonwebtoken");

const createHelyszin = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Authentication token is required!" });
        }

        const decoded = jwt.verify(token, "secretkey");
        const userId = decoded.userId;

        const { Nev, Cim, Telepules, Iranyitoszam, Fedett, Oltozo, Parkolas, Leiras, Berles } = req.body;

        if (!Nev || !Cim || !Telepules || !Iranyitoszam || !Parkolas) {
            return res.status(400).json({ message: "Missing required fields for creating location!" });
        }

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

const getAllHelyszin = async (req, res) => {
    try {
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

const getHelyszinById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: "Location ID is required!" });
        }

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

        if (helyszin.userId !== userId) {
            return res.status(403).json({ message: "You can only update your own locations!" });
        }


        const updatedData = {
            Nev,
            Cim,
            Telepules,
            Iranyitoszam,
            Fedett: Fedett === true || Fedett === "true",
            Oltozo: Oltozo === true || Oltozo === "true",
            Parkolas,
            Leiras: Leiras || "", 
            Berles: Berles === true || Berles === "true",
        };


        await helyszin.update(updatedData);

        res.status(200).json({
            message: "Location updated successfully!",
            helyszin,
            updatedLocation: helyszin 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating location", error });
    }
};


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

        if (helyszin.userId !== userId) {
            return res.status(403).json({ message: "You can only delete your own locations!" });
        }

        await helyszin.destroy();

        res.status(200).json({ message: "Location deleted successfully!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error deleting location", error });
    }
};

const getMyOwnHelyszin = async (req, res) => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(400).json({ message: "User ID is missing in the request." });
        }

        const helyszin = await Helyszin.findAll({
            where: {
                userId: userId
            }
        });

        if (helyszin.length === 0) {
            return res.status(404).json({ message: "Előszőr hozzon létre egy helyszínt a +-gomb segítségével!" });
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
