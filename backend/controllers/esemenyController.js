const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const Helyszin = require("../models/helyszinModel")
const Esemény = require("../models/esemenyModel");
const Sportok = require("../models/sportokModel");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit to 5MB
  fileFilter: function (req, file, cb) {
    // Check file type
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"));
    }
  }
}).single('imageFile'); // 'imageFile' should match the field name in the form

const createEsemeny = async (req, res) => {
    upload(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading
            return res.status(400).json({ message: `File upload error: ${err.message}` });
        } else if (err) {
            // An unknown error occurred
            return res.status(500).json({ message: `Error: ${err.message}` });
        }
        
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

            // Get the file path if a file was uploaded
            let imageUrl = null;
            if (req.file) {
                imageUrl = `/uploads/${req.file.filename}`;
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
                imageUrl  // This will be null if no file was uploaded
            });

            res.status(201).json({ message: "Event created successfully!", esemeny: newEsemény });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error creating event", error: error.message });
        }
    });
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

        // Delete the associated image file if it exists
        if (esemeny.imageUrl) {
            const imagePath = path.join(__dirname, '..', esemeny.imageUrl);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await esemeny.destroy();

        res.status(200).json({ message: "Event deleted successfully!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error deleting event", error: error.message });
    }
};

// Edit Event (Only by the Owner)
const updateEsemeny = async (req, res) => {
    upload(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ message: `File upload error: ${err.message}` });
        } else if (err) {
            return res.status(500).json({ message: `Error: ${err.message}` });
        }
        
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

            // Handle image update
            let imageUrl = esemeny.imageUrl; // Keep the existing image by default
            
            if (req.file) {
                // If a new image was uploaded, delete the old one if it exists
                if (esemeny.imageUrl) {
                    const oldImagePath = path.join(__dirname, '..', esemeny.imageUrl);
                    if (fs.existsSync(oldImagePath)) {
                        fs.unlinkSync(oldImagePath);
                    }
                }
                
                // Set the new image URL
                imageUrl = `/uploads/${req.file.filename}`;
            }

            // If clearImage flag is set, delete the image and set imageUrl to null
            if (req.body.clearImage === 'true' && !req.file) {
                if (esemeny.imageUrl) {
                    const imagePath = path.join(__dirname, '..', esemeny.imageUrl);
                    if (fs.existsSync(imagePath)) {
                        fs.unlinkSync(imagePath);
                    }
                }
                imageUrl = null;
            }

            // Update event details
            await esemeny.update({
                helyszinId,
                sportId,
                kezdoIdo,
                zaroIdo,
                szint,
                minimumEletkor,
                maximumEletkor,
                imageUrl
            });

            res.status(200).json({ message: "Event updated successfully!", esemeny });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error updating event", error: error.message });
        }
    });
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
        res.status(500).json({ message: "Error fetching event", error: error.message });
    }
};

// Get All Events (Public - No authentication required)
const getAllEsemeny = async (req, res) => {
    try {
        // Find all events
        const events = await Esemény.findAll();

        if (events.length === 0) {
            return res.status(404).json({ message: "No events found." });
        }

        res.json({ events });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching events", error: error.message });
    }
};

// Get Events by User ID
const getEsemenyByUserId = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Authentication token is required!" });
        }

        const decoded = jwt.verify(token, "secretkey");
        const userId = decoded.userId;

        // Find all events created by this user
        const events = await Esemény.findAll({
            where: { userId }
        });

        if (events.length === 0) {
            return res.status(404).json({ message: "No events found for this user." });
        }

        res.json({ events });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching user events", error: error.message });
    }
};

// Configure multer middleware for the router
const configureMulter = (req, res, next) => {
    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ message: `File upload error: ${err.message}` });
        } else if (err) {
            return res.status(500).json({ message: `Error: ${err.message}` });
        }
        next();
    });
};

const getEsemenyekByTelepulesAndSportNev = async (req, res) => {
    try {
        const { telepules, sportNev } = req.params;

        if (!telepules || !sportNev) {
            return res.status(400).json({ message: "Both city (telepules) and sport name (sportNev) are required!" });
        }

        const events = await Esemény.findAll({
            include: [
                {
                    model: Helyszin,
                    where: { Telepules: telepules },
                    attributes: ['id', 'Nev', 'Telepules', 'Cim']
                },
                {
                    model: Sportok,
                    where: { Nev: sportNev },
                    attributes: ['Id', 'Nev']
                }
            ]
        });

        if (events.length === 0) {
            return res.status(404).json({ message: "No events found for the specified city and sport." });
        }

        res.json({ events });
    } catch (error) {
        console.error("❌ Error fetching events:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};









module.exports = { 
    createEsemeny, 
    deleteEsemeny, 
    updateEsemeny, 
    getEsemenyById, 
    getAllEsemeny,
    getEsemenyByUserId,
    configureMulter,
    getEsemenyekByTelepulesAndSportNev
};