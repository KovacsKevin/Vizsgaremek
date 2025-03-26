const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const Helyszin = require("../models/helyszinModel")
const Esemény = require("../models/esemenyModel");
const Sportok = require("../models/sportokModel");
const multer = require("multer");
const Résztvevő = require("../models/resztvevoModel");
const path = require("path");
const fs = require("fs");
const sequelize = require("../config/db");

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

            const { helyszinId, sportId, kezdoIdo, zaroIdo, szint, minimumEletkor, maximumEletkor, maximumLetszam } = req.body;

            if (!helyszinId || !sportId || !kezdoIdo || !zaroIdo || !szint || !minimumEletkor || !maximumEletkor || !maximumLetszam) {
                return res.status(400).json({ message: "Missing required fields for creating event!" });
            }

            // Get the file path if a file was uploaded
            let imageUrl = null;
            if (req.file) {
                imageUrl = `/uploads/${req.file.filename}`;
            }

            // Use a transaction to ensure both operations succeed or fail together
            const result = await sequelize.transaction(async (t) => {
                // Create the event
                const newEsemény = await Esemény.create({
                    helyszinId,
                    sportId,
                    kezdoIdo,
                    zaroIdo,
                    szint,
                    minimumEletkor,
                    maximumEletkor,
                    maximumLetszam,
                    userId,
                    imageUrl // This will be null if no file was uploaded
                }, { transaction: t });

                // Add the creator as a participant with "szervező" role
                const résztvevő = await Résztvevő.create({
                    eseményId: newEsemény.id,
                    userId: userId,
                    szerep: 'szervező',
                    státusz: 'elfogadva',
                    csatlakozásDátuma: new Date()
                }, { transaction: t });

                return { newEsemény, résztvevő };
            });

            res.status(201).json({
                message: "Event created successfully!",
                esemeny: result.newEsemény,
                creator: {
                    userId: result.résztvevő.userId,
                    role: result.résztvevő.szerep
                }
            });
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
            const { helyszinId, sportId, kezdoIdo, zaroIdo, szint, minimumEletkor, maximumEletkor, maximumLetszam } = req.body;

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
                maximumLetszam,
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

        // Check if both city (telepules) and sport name (sportNev) are provided
        if (!telepules || !sportNev) {
            return res.status(400).json({ message: "Both city (telepules) and sport name (sportNev) are required!" });
        }

        // Fetch events based on city and sport name using Sequelize ORM
        const events = await Esemény.findAll({
            include: [
                {
                    model: Helyszin,
                    where: { Telepules: telepules },  // Match city in the Helyszin model
                    attributes: [
                        'Id', 'Nev', 'Telepules', 'Cim', 'Iranyitoszam', 'Fedett', 'Oltozo',
                        'Parkolas', 'Leiras', 'Berles', 'userId'
                    ]  // Return all relevant attributes for Helyszin
                },
                {
                    model: Sportok,
                    where: { Nev: sportNev },  // Match sport name in the Sportok model
                    attributes: ['Id', 'Nev', 'Leiras', 'KepUrl']  // Return all relevant attributes for Sportok
                }
            ]
        });

        // If no events are found, return a 404 response
        if (events.length === 0) {
            return res.status(404).json({ message: "No events found for the specified city and sport." });
        }

        // Return the found events as a response with full event details
        res.json({ events });
    } catch (error) {
        // Log the error and send a 500 response in case of an exception
        console.error("❌ Error fetching events:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


// Update the joinEsemeny function to properly check capacity
const joinEsemeny = async (req, res) => {
    try {
        // Authenticate user
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Authentication token is required!" });
        }

        const decoded = jwt.verify(token, "secretkey");
        const userId = decoded.userId;

        // Get event ID from route parameters
        const { eseményId } = req.body;
        const { megjegyzés } = req.body;

        if (!eseményId) {
            return res.status(400).json({ message: "Event ID is required!" });
        }

        // Check if event exists
        const esemény = await Esemény.findByPk(eseményId);
        if (!esemény) {
            return res.status(404).json({ message: "Event not found!" });
        }

        // Check if user is already a participant
        const existingParticipant = await Résztvevő.findOne({
            where: {
                eseményId: eseményId,
                userId: userId
            }
        });

        if (existingParticipant) {
            return res.status(400).json({
                message: "You are already a participant in this event!",
                status: existingParticipant.státusz,
                role: existingParticipant.szerep
            });
        }

        // Check if the event is at capacity
        const participantCount = await Résztvevő.count({
            where: {
                eseményId: eseményId,
                státusz: 'elfogadva'
            }
        });

        if (participantCount >= esemény.maximumLetszam) {
            return res.status(400).json({ message: "This event is at full capacity!" });
        }

        // Create a new participant record - automatically accepted
        const newParticipant = await Résztvevő.create({
            eseményId: eseményId,
            userId: userId,
            szerep: 'játékos', // Default role is player
            státusz: 'elfogadva', // Auto-accept the participant
            csatlakozásDátuma: new Date(),
            megjegyzés: megjegyzés || null
        });

        // Get user details to return in response
        const user = await User.findByPk(userId, {
            attributes: ['id', 'name', 'email', 'profileImage']
        });

        res.status(201).json({
            message: "You have successfully joined the event!",
            participant: {
                id: newParticipant.id,
                userId: userId,
                name: user.name,
                image: user.profileImage,
                status: newParticipant.státusz,
                role: newParticipant.szerep,
                joinDate: newParticipant.csatlakozásDátuma
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error joining event", error: error.message });
    }
};




const getEsemenyMinimal = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if the event exists by ID
        const esemeny = await Esemény.findByPk(id, {
            attributes: ['id'] // Only fetch the ID field to minimize data transfer
        });

        // Return true if event exists, false otherwise
        if (esemeny) {
            res.json({ exists: true });
        } else {
            res.json({ exists: false });
        }
    } catch (error) {
        console.error("Error checking event existence:", error);
        res.status(500).json({
            message: "Error checking event existence",
            error: error.message
        });
    }
};

// Add this function before the module.exports
const checkParticipation = async (req, res) => {
    try {
        const { id: eseményId } = req.params;
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: "Authentication token is required!" });
        }

        const decoded = jwt.verify(token, "secretkey");
        const userId = decoded.userId;

        // Check if the event exists
        const esemény = await Esemény.findByPk(eseményId);
        if (!esemény) {
            return res.status(404).json({ message: "Event not found!" });
        }

        // Check if the user is a participant
        const participant = await Résztvevő.findOne({
            where: {
                eseményId: eseményId,
                userId: userId
            }
        });

        res.json({
            isParticipant: !!participant,
            status: participant ? participant.státusz : null,
            role: participant ? participant.szerep : null
        });
    } catch (error) {
        console.error("Error checking participation:", error);
        res.status(500).json({ message: "Error checking participation status", error: error.message });
    }
};

// Add this function as well
const getEventParticipants = async (req, res) => {
    try {
      const { id: eseményId } = req.params;
  
      // Check if the event exists
      const esemény = await Esemény.findByPk(eseményId);
      if (!esemény) {
        return res.status(404).json({ message: "Event not found!" });
      }
  
      // Get all participants for this event
      const participants = await Résztvevő.findAll({
        where: {
          eseményId: eseményId,
          státusz: 'elfogadva' // Only include accepted participants
        },
        include: [
          {
            model: User,
            attributes: ['id', 'email', 'username', 'firstName', 'lastName', 'profilePicture', 'birthDate'] // Use the correct field names
          }
        ]
      });
  
      // Format the participant data
      const formattedParticipants = participants.map(participant => ({
        id: participant.userId,
        name: participant.User.username || `${participant.User.firstName || ''} ${participant.User.lastName || ''}`.trim(), // Use username or combine firstName and lastName
        email: participant.User.email,
        image: participant.User.profilePicture || null,
        bio: null, // This field doesn't exist in your model
        age: participant.User.birthDate ? calculateAge(participant.User.birthDate) : null, // Calculate age from birthDate
        role: participant.szerep,
        joinDate: participant.csatlakozásDátuma
      }));
  
      res.json({
        participants: formattedParticipants,
        count: formattedParticipants.length,
        maxParticipants: esemény.maximumLetszam
      });
    } catch (error) {
      console.error("Error fetching participants:", error);
      res.status(500).json({ message: "Error fetching event participants", error: error.message });
    }
  };
  
  // Helper function to calculate age from birthDate
  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };
  





module.exports = {
    createEsemeny,
    deleteEsemeny,
    updateEsemeny,
    getEsemenyById,
    getAllEsemeny,
    getEsemenyByUserId,
    configureMulter,
    getEsemenyekByTelepulesAndSportNev,
    joinEsemeny,
    getEsemenyMinimal,
    checkParticipation,
    getEventParticipants
};
