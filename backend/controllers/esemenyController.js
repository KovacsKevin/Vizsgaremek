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
const { Op } = require("sequelize");
const { scheduleEventDeletion } = require('../utils/eventScheduler');

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

            // Validate maximum participants
            if (parseInt(maximumLetszam) < 2) {
                return res.status(400).json({ message: "Maximum létszám legalább 2 fő kell legyen!" });
            }

            // Validate dates
            const now = new Date();
            const kezdoIdoDate = new Date(kezdoIdo);
            const zaroIdoDate = new Date(zaroIdo);

            if (kezdoIdoDate < now) {
                return res.status(400).json({ message: "A kezdő időpont nem lehet korábbi, mint a jelenlegi időpont!" });
            }

            if (zaroIdoDate <= kezdoIdoDate) {
                return res.status(400).json({ message: "A záró időpont nem lehet korábbi vagy egyenlő, mint a kezdő időpont!" });
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

            // Időzítés beállítása az új eseményhez
            scheduleEventDeletion(result.newEsemény);

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

// This function already exists in the controller, but let's ensure it's working correctly
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

        // Check if user is the organizer
        const isOrganizer = await Résztvevő.findOne({
            where: {
                eseményId: id,
                userId: userId,
                szerep: 'szervező'
            }
        });

        if (!isOrganizer) {
            return res.status(403).json({ message: "You can only delete events where you are the organizer!" });
        }

        // Delete the associated image file if it exists
        if (esemeny.imageUrl) {
            const imagePath = path.join(__dirname, '..', esemeny.imageUrl);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        // First delete all participants
        await Résztvevő.destroy({
            where: {
                eseményId: id
            }
        });

        // Then delete the event
        await esemeny.destroy();

        res.status(200).json({ message: "Event deleted successfully!" });
    } catch (error) {
        console.error("Error deleting event:", error);
        res.status(500).json({ message: "Error deleting event", error: error.message });
    }
};

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
            const { helyszinId, sportId, kezdoIdo, zaroIdo, szint, minimumEletkor, maximumEletkor, maximumLetszam, leiras } = req.body;

            const esemeny = await Esemény.findByPk(id);

            if (!esemeny) {
                return res.status(404).json({ message: "Event not found!" });
            }

            // Validate maximum participants
            if (parseInt(maximumLetszam) < 2) {
                return res.status(400).json({ message: "Maximum létszám legalább 2 fő kell legyen!" });
            }

            // Validate dates
            const kezdoIdoDate = new Date(kezdoIdo);
            const zaroIdoDate = new Date(zaroIdo);

            // Only check against current time for future events
            const now = new Date();
            const currentKezdoIdo = new Date(esemeny.kezdoIdo);

            if (currentKezdoIdo > now && kezdoIdoDate < now) {
                return res.status(400).json({ message: "A kezdő időpont nem lehet korábbi, mint a jelenlegi időpont!" });
            }

            if (zaroIdoDate <= kezdoIdoDate) {
                return res.status(400).json({ message: "A záró időpont nem lehet korábbi vagy egyenlő, mint a kezdő időpont!" });
            }

            // Check if user is the organizer
            const isOrganizer = await Résztvevő.findOne({
                where: {
                    eseményId: id,
                    userId: userId,
                    szerep: 'szervező'
                }
            });

            if (!isOrganizer) {
                return res.status(403).json({ message: "You can only edit events where you are the organizer!" });
            }

            // Handle image update
            let imageUrl = esemeny.imageUrl;

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
                leiras: leiras || "",
                imageUrl
            });

            // Fetch the updated event with related data
            const updatedEsemeny = await Esemény.findByPk(id, {
                include: [
                    { model: Helyszin, attributes: ['Id', 'Nev', 'Telepules', 'Cim', 'Iranyitoszam', 'Fedett', 'Oltozo', 'Parkolas', 'Berles', 'Leiras'] },
                    { model: Sportok, attributes: ['Id', 'Nev', 'KepUrl'] }
                ]
            });

            // Időzítés frissítése a módosított eseményhez
            scheduleEventDeletion(updatedEsemeny);

            res.status(200).json({
                message: "Event updated successfully!",
                esemeny: updatedEsemeny
            });
        } catch (error) {
            console.error("Error updating event:", error);
            res.status(500).json({ message: "Error updating event", error: error.message });
        }
    });
};

// Kilépés egy eseményből
const leaveEsemeny = async (req, res) => {
    try {
        // Authenticate user
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Authentication token is required!" });
        }

        const decoded = jwt.verify(token, "secretkey");
        const userId = decoded.userId;

        // Get event ID from request body
        const { eseményId } = req.body;

        if (!eseményId) {
            return res.status(400).json({ message: "Event ID is required!" });
        }

        // Check if event exists
        const esemény = await Esemény.findByPk(eseményId);
        if (!esemény) {
            return res.status(404).json({ message: "Event not found!" });
        }

        // Check if user is a participant
        const participant = await Résztvevő.findOne({
            where: {
                eseményId: eseményId,
                userId: userId
            }
        });

        if (!participant) {
            return res.status(404).json({ message: "You are not a participant in this event!" });
        }

        // Check if user is a player (only players can leave)
        if (participant.szerep !== 'játékos') {
            return res.status(403).json({ message: "Only players can leave an event. Organizers must delete the event instead." });
        }

        // Delete the participant
        await participant.destroy();

        res.status(200).json({
            message: "You have successfully left the event!"
        });

    } catch (error) {
        console.error("Error leaving event:", error);
        res.status(500).json({ message: "Error leaving event", error: error.message });
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
        res.status(500).json({ message: "Error fetching event", error: error.message });
    }
};

// Get All Events (Public - No authentication required)
const getAllEsemeny = async (req, res) => {
    try {
        // Only get events that haven't ended yet
        const currentTime = new Date();

        const events = await Esemény.findAll({
            where: {
                zaroIdo: { [Op.gt]: currentTime } // Only events with closing time in the future
            }
        });

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
        const currentTime = new Date();

        // Check if both city (telepules) and sport name (sportNev) are provided
        if (!telepules || !sportNev) {
            return res.status(400).json({ message: "Both city (telepules) and sport name (sportNev) are required!" });
        }

        // Fetch events based on city and sport name using Sequelize ORM
        const events = await Esemény.findAll({
            where: {
                zaroIdo: { [Op.gt]: currentTime } // Only events with closing time in the future
            },
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

// Add this new function to filter events by user age
const getEsemenyekFilteredByUserAge = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Authentication token is required!" });
        }

        const decoded = jwt.verify(token, "secretkey");
        const userId = decoded.userId;
        const currentTime = new Date();

        // Get user details to calculate age
        const user = await User.findByPk(userId);
        if (!user || !user.birthDate) {
            return res.status(400).json({ message: "User birth date is not available!" });
        }

        // Calculate user's age
        const birthDate = new Date(user.birthDate);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        // Get telepules and sportNev from params
        const { telepules, sportNev } = req.params;

        // Check if both city (telepules) and sport name (sportNev) are provided
        if (!telepules || !sportNev) {
            return res.status(400).json({ message: "Both city (telepules) and sport name (sportNev) are required!" });
        }

        // Fetch events based on city and sport name, and filter by user age
        const events = await Esemény.findAll({
            where: {
                minimumEletkor: { [Op.lte]: age },
                maximumEletkor: { [Op.gte]: age },
                zaroIdo: { [Op.gt]: currentTime } // Only events with closing time in the future
            },
            include: [
                {
                    model: Helyszin,
                    where: { Telepules: telepules },
                    attributes: [
                        'Id', 'Nev', 'Telepules', 'Cim', 'Iranyitoszam', 'Fedett', 'Oltozo',
                        'Parkolas', 'Leiras', 'Berles', 'userId'
                    ]
                },
                {
                    model: Sportok,
                    where: { Nev: sportNev },
                    attributes: ['Id', 'Nev', 'Leiras', 'KepUrl']
                }
            ]
        });

        // If no events are found, return a 404 response
        if (events.length === 0) {
            return res.status(404).json({
                message: "No events found for the specified city, sport, and your age range.",
                userAge: age
            });
        }

        // Return the found events as a response with full event details
        res.json({
            events,
            userAge: age
        });
    } catch (error) {
        // Log the error and send a 500 response in case of an exception
        console.error("❌ Error fetching age-filtered events:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Update the joinEsemeny function to properly check capacity
// In the joinEsemeny function
const joinEsemeny = async (req, res) => {
    try {
        const { eseményId } = req.body;
        const userId = req.user.userId;

        console.log(`Join request for event ${eseményId} by user ${userId}`);

        // Check if the event exists
        const event = await Esemény.findByPk(eseményId);
        if (!event) {
            return res.status(404).json({ message: "Esemény nem található" });
        }

        // Check if the user is already a participant
        const existingParticipant = await Résztvevő.findOne({
            where: { eseményId, userId }
        });

        if (existingParticipant) {
            return res.status(400).json({ message: "A felhasználó már résztvevője az eseménynek" });
        }

        // Check if the user is the organizer of the event
        const isOrganizer = await Résztvevő.findOne({
            where: {
                eseményId,
                userId,
                szerep: 'szervező'
            }
        });

        // Create a new participant with pending status
        // Only auto-approve if the user is the organizer
        const newParticipant = await Résztvevő.create({
            eseményId,
            userId,
            szerep: 'játékos',
            státusz: isOrganizer ? 'elfogadva' : 'függőben',
            csatlakozásDátuma: new Date()
        });

        // Get user details to return
        const user = await User.findByPk(userId, {
            attributes: ['id', 'name', 'email', 'image', 'age', 'level']
        });

        // Return success response with participant details
        return res.status(201).json({
            message: isOrganizer ? "Sikeresen csatlakozott az eseményhez" : "Csatlakozási kérelem elküldve",
            participant: {
                userId: user.id,
                name: user.name,
                image: user.image,
                age: user.age,
                level: user.level,
                role: 'játékos',
                joinDate: newParticipant.csatlakozásDátuma,
                status: newParticipant.státusz
            }
        });
    } catch (error) {
        console.error("Hiba a csatlakozás során:", error);
        return res.status(500).json({ message: "Szerver hiba a csatlakozás során" });
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
                    attributes: ['id', 'username', 'firstName', 'lastName', 'email', 'profilePicture', 'birthDate'] // Include relevant user details
                }
            ]
        });

        // Format the participant data
        const formattedParticipants = participants.map(participant => {
            // Calculate age if birthDate is available
            let age = null;
            if (participant.User.birthDate) {
                const birthDate = new Date(participant.User.birthDate);
                const today = new Date();
                age = today.getFullYear() - birthDate.getFullYear();
                const m = today.getMonth() - birthDate.getMonth();
                if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                    age--;
                }
            }

            // Prepare user name from available fields
            const name = participant.User.username ||
                `${participant.User.firstName || ''} ${participant.User.lastName || ''}`.trim() ||
                'Felhasználó';

            return {
                id: participant.userId,
                name: name,
                email: participant.User.email,
                image: participant.User.profilePicture || '',
                bio: participant.User.bio || '',
                age: age,
                role: participant.szerep,
                joinDate: participant.csatlakozásDátuma
            };
        });

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

// Események lekérése, ahol a felhasználó szervező
const getOrganizedEvents = async (req, res) => {
    try {
        // Authenticate user
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Authentication token is required!" });
        }

        const decoded = jwt.verify(token, "secretkey");
        const userId = decoded.userId;
        const currentTime = new Date();

        // Lekérjük azokat az eseményeket, ahol a felhasználó szervező
        const events = await Esemény.findAll({
            where: {
                zaroIdo: { [Op.gt]: currentTime } // Only active events
            },
            include: [
                {
                    model: Résztvevő,
                    where: {
                        userId: userId,
                        szerep: 'szervező'
                    },
                    attributes: [], // Nem szükséges a résztvevő adatait visszaadni
                    required: true
                },
                {
                    model: Helyszin,
                    attributes: ['Telepules', 'Iranyitoszam', 'Fedett', 'Oltozo', 'Parkolas', 'Leiras', 'Berles', 'Nev', 'Cim']
                },
                {
                    model: Sportok,
                    attributes: ['Nev', 'KepUrl']
                }
            ],
            attributes: {
                include: [
                    [
                        sequelize.literal(`(
                                    SELECT COUNT(*)
                                    FROM Résztvevős
                                    WHERE 
                                        Résztvevős.eseményId = Esemény.id
                                        AND Résztvevős.státusz = 'elfogadva'
                                )`),
                        'résztvevőkSzáma' // Résztvevők számának megjelenítése
                    ]
                ]
            }
        });

        if (events.length === 0) {
            return res.status(404).json({ message: "Nem találhatók szervezett események." });
        }

        res.json({ events });
    } catch (error) {
        console.error("Hiba a szervezett események lekérésekor:", error);
        res.status(500).json({ message: "Szerver hiba", error: error.message });
    }
};

// Események lekérése, ahol a felhasználó játékos
const getParticipatedEvents = async (req, res) => {
    try {
        // Authenticate user
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Authentication token is required!" });
        }

        const decoded = jwt.verify(token, "secretkey");
        const userId = decoded.userId;
        const currentTime = new Date();

        // Lekérjük azokat az eseményeket, ahol a felhasználó játékos
        const events = await Esemény.findAll({
            where: {
                zaroIdo: { [Op.gt]: currentTime } // Only active events
            },
            include: [
                {
                    model: Résztvevő,
                    where: {
                        userId: userId,
                        szerep: 'játékos',
                        státusz: 'elfogadva'
                    },
                    attributes: [], // Nem szükséges a résztvevő adatait visszaadni
                    required: true
                },
                {
                    model: Helyszin,
                    attributes: ['Telepules', 'Iranyitoszam', 'Fedett', 'Oltozo', 'Parkolas', 'Leiras', 'Berles', 'Nev', 'Cim']
                },
                {
                    model: Sportok,
                    attributes: ['Nev', 'KepUrl']
                }
            ],
            attributes: {
                include: [
                    [
                        sequelize.literal(`(
                                    SELECT COUNT(*)
                                    FROM Résztvevős
                                    WHERE 
                                        Résztvevős.eseményId = Esemény.id
                                        AND Résztvevős.státusz = 'elfogadva'
                                )`),
                        'résztvevőkSzáma' // Résztvevők számának megjelenítése
                    ]
                ]
            }
        });

        if (events.length === 0) {
            return res.status(404).json({ message: "Nem találhatók események, ahol játékosként veszel részt." });
        }

        res.json({ events });
    } catch (error) {
        console.error("Hiba a játékosként résztvett események lekérésekor:", error);
        res.status(500).json({ message: "Szerver hiba", error: error.message });
    }
};

// Get archived events (ended within the last 31 days)
const getArchivedEvents = async (req, res) => {
    try {
        // Authenticate user
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Authentication token is required!" });
        }

        const decoded = jwt.verify(token, "secretkey");
        const userId = decoded.userId;

        // Calculate date range (now to 31 days ago)
        const now = new Date();
        const thirtyOneDaysAgo = new Date();
        thirtyOneDaysAgo.setDate(thirtyOneDaysAgo.getDate() - 31);

        // Find events where the user participated (either as organizer or player)
        // and the event has ended (zaroIdo < now) but not older than 31 days
        const archivedEvents = await Esemény.findAll({
            where: {
                zaroIdo: {
                    [Op.lt]: now,
                    [Op.gt]: thirtyOneDaysAgo
                }
            },
            include: [
                {
                    model: Résztvevő,
                    where: {
                        userId: userId,
                        státusz: 'elfogadva'
                    },
                    attributes: ['szerep'], // Include role to distinguish between organizer and player
                    required: true
                },
                {
                    model: Helyszin,
                    attributes: ['Telepules', 'Iranyitoszam', 'Fedett', 'Oltozo', 'Parkolas', 'Leiras', 'Berles', 'Nev', 'Cim']
                },
                {
                    model: Sportok,
                    attributes: ['Nev', 'KepUrl']
                }
            ],
            attributes: {
                include: [
                    [
                        sequelize.literal(`(
                            SELECT COUNT(*)
                            FROM Résztvevős
                            WHERE 
                                Résztvevős.eseményId = Esemény.id
                                AND Résztvevős.státusz = 'elfogadva'
                        )`),
                        'résztvevőkSzáma' // Include participant count
                    ]
                ]
            }
        });

        if (archivedEvents.length === 0) {
            return res.status(404).json({ message: "Nem találhatók archivált események." });
        }

        res.json({ events: archivedEvents });
    } catch (error) {
        console.error("Hiba az archivált események lekérésekor:", error);
        res.status(500).json({ message: "Szerver hiba", error: error.message });
    }
};

// Get all events with participant count, ordered by start time descending
const getAllEsemenyWithDetails = async (req, res) => {
    try {
        const currentTime = new Date();

        // Find all events with venue information that haven't ended yet
        const events = await Esemény.findAll({
            where: {
                zaroIdo: { [Op.gt]: currentTime } // Only events with closing time in the future
            },
            include: [
                {
                    model: Helyszin,
                    attributes: ['Nev', 'Telepules'] // Include venue name and city
                },
                {
                    model: Sportok,
                    attributes: ['Nev', 'KepUrl'] // Include sport name and image
                }
            ],
            attributes: ['id', 'kezdoIdo', 'zaroIdo', 'maximumLetszam', 'imageUrl'], // Added imageUrl
            order: [['kezdoIdo', 'DESC']] // Order by start time descending
        });

        if (events.length === 0) {
            return res.status(404).json({ message: "No events found." });
        }

        // Get participant counts for all events
        const eventIds = events.map(event => event.id);

        // Count participants for each event
        const participantCounts = await Résztvevő.findAll({
            attributes: [
                'eseményId',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            where: {
                eseményId: { [Op.in]: eventIds },
                státusz: 'elfogadva' // Only count accepted participants
            },
            group: ['eseményId']
        });

        // Create a map of event ID to participant count
        const countMap = {};
        participantCounts.forEach(item => {
            countMap[item.eseményId] = parseInt(item.getDataValue('count'));
        });

        // Format the response
        const formattedEvents = events.map(event => ({
            esemenyId: event.id,
            kezdoIdo: event.kezdoIdo,
            zaroIdo: event.zaroIdo,
            helyszinNev: event.Helyszin.Nev,
            telepules: event.Helyszin.Telepules,
            sportNev: event.Sportok.Nev,
            sportKepUrl: event.Sportok.KepUrl, // Include sport image URL
            imageUrl: event.imageUrl, // Include event's own image URL
            resztvevoCount: countMap[event.id] || 0,
            maximumLetszam: event.maximumLetszam
        }));

        res.json({ events: formattedEvents });

    } catch (error) {
        console.error("Error fetching events with details:", error);
        res.status(500).json({ message: "Error fetching events", error: error.message });
    }
};

// Résztvevő eltávolítása (csak szervező által)
const removeParticipant = async (req, res) => {
    try {
        // Authenticate user
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Authentication token is required!" });
        }

        const decoded = jwt.verify(token, "secretkey");
        const userId = decoded.userId;

        // Get event ID and participant ID from request body
        const { eseményId, userId: participantId } = req.body;

        if (!eseményId || !participantId) {
            return res.status(400).json({ message: "Event ID and participant ID are required!" });
        }

        // Check if event exists
        const esemény = await Esemény.findByPk(eseményId);
        if (!esemény) {
            return res.status(404).json({ message: "Event not found!" });
        }

        // Check if the current user is a participant with 'szervező' role
        const organizerParticipant = await Résztvevő.findOne({
            where: {
                eseményId: eseményId,
                userId: userId,
                szerep: 'szervező'
            }
        });

        if (!organizerParticipant) {
            return res.status(403).json({ message: "Only organizers can remove participants!" });
        }

        // Check if the participant to be removed exists
        const participantToRemove = await Résztvevő.findOne({
            where: {
                eseményId: eseményId,
                userId: participantId
            }
        });

        if (!participantToRemove) {
            return res.status(404).json({ message: "Participant not found in this event!" });
        }

        // Don't allow removing organizers
        if (participantToRemove.szerep === 'szervező') {
            return res.status(403).json({ message: "Organizers cannot be removed from the event!" });
        }

        // Delete the participant
        await participantToRemove.destroy();

        res.status(200).json({
            message: "Participant successfully removed from the event!",
            removedParticipantId: participantId
        });

    } catch (error) {
        console.error("Error removing participant:", error);
        res.status(500).json({ message: "Error removing participant", error: error.message });
    }
};

// Get event search data by ID
const getEventSearchData = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the event with its related Helyszin and Sportok data
        const event = await Esemény.findByPk(id, {
            include: [
                {
                    model: Helyszin,
                    attributes: ['Telepules']
                },
                {
                    model: Sportok,
                    attributes: ['Nev']
                }
            ]
        });

        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Event not found"
            });
        }

        // Return the search data
        res.status(200).json({
            success: true,
            telepules: event.Helyszin.Telepules,
            sportNev: event.Sportok.Nev,
            esemenyId: event.id
        });

    } catch (error) {
        console.error("Error fetching event search data:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

// Get all events filtered by user age
const getAllEsemenyekFilteredByUserAge = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Authentication token is required!" });
        }

        const decoded = jwt.verify(token, "secretkey");
        const userId = decoded.userId;
        const currentTime = new Date();

        // Get user details to calculate age
        const user = await User.findByPk(userId);
        if (!user || !user.birthDate) {
            return res.status(400).json({ message: "User birth date is not available!" });
        }

        // Calculate user's age
        const birthDate = new Date(user.birthDate);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        // Fetch all events filtered by user age
        const events = await Esemény.findAll({
            where: {
                minimumEletkor: { [Op.lte]: age },
                maximumEletkor: { [Op.gte]: age },
                zaroIdo: { [Op.gt]: currentTime } // Only events with closing time in the future
            },
            include: [
                {
                    model: Helyszin,
                    attributes: [
                        'Id', 'Nev', 'Telepules', 'Cim', 'Iranyitoszam', 'Fedett', 'Oltozo',
                        'Parkolas', 'Leiras', 'Berles', 'userId'
                    ]
                },
                {
                    model: Sportok,
                    attributes: ['Id', 'Nev', 'Leiras', 'KepUrl']
                }
            ]
        });

        // If no events are found, return a 404 response
        if (events.length === 0) {
            return res.status(404).json({
                message: "No events found for your age range.",
                userAge: age
            });
        }

        // Return the found events as a response with full event details
        res.json({
            events,
            userAge: age
        });
    } catch (error) {
        // Log the error and send a 500 response in case of an exception
        console.error("❌ Error fetching age-filtered events:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get events by location only
const getEsemenyekByTelepules = async (req, res) => {
    try {
        const { telepules } = req.params;
        const currentTime = new Date();

        // Check if city (telepules) is provided
        if (!telepules) {
            return res.status(400).json({ message: "City (telepules) is required!" });
        }

        // Fetch events based on city using Sequelize ORM
        const events = await Esemény.findAll({
            where: {
                zaroIdo: { [Op.gt]: currentTime } // Only events with closing time in the future
            },
            include: [
                {
                    model: Helyszin,
                    where: { Telepules: telepules },  // Match city in the Helyszin model
                    attributes: [
                        'Id', 'Nev', 'Telepules', 'Cim', 'Iranyitoszam', 'Fedett', 'Oltozo',
                        'Parkolas', 'Leiras', 'Berles', 'userId'
                    ]
                },
                {
                    model: Sportok,
                    attributes: ['Id', 'Nev', 'Leiras', 'KepUrl']
                }
            ]
        });

        // If no events are found, return a 404 response
        if (events.length === 0) {
            return res.status(404).json({ message: "No events found for the specified city." });
        }

        // Return the found events as a response with full event details
        res.json({ events });
    } catch (error) {
        // Log the error and send a 500 response in case of an exception
        console.error("❌ Error fetching events by location:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get events by sport only
const getEsemenyekBySportNev = async (req, res) => {
    try {
        const { sportNev } = req.params;
        const currentTime = new Date();

        // Check if sport name is provided
        if (!sportNev) {
            return res.status(400).json({ message: "Sport name (sportNev) is required!" });
        }

        // Fetch events based on sport name using Sequelize ORM
        const events = await Esemény.findAll({
            where: {
                zaroIdo: { [Op.gt]: currentTime } // Only events with closing time in the future
            },
            include: [
                {
                    model: Helyszin,
                    attributes: [
                        'Id', 'Nev', 'Telepules', 'Cim', 'Iranyitoszam', 'Fedett', 'Oltozo',
                        'Parkolas', 'Leiras', 'Berles', 'userId'
                    ]
                },
                {
                    model: Sportok,
                    where: { Nev: sportNev },  // Match sport name in the Sportok model
                    attributes: ['Id', 'Nev', 'Leiras', 'KepUrl']
                }
            ]
        });

        // If no events are found, return a 404 response
        if (events.length === 0) {
            return res.status(404).json({ message: "No events found for the specified sport." });
        }

        // Return the found events as a response with full event details
        res.json({ events });
    } catch (error) {
        // Log the error and send a 500 response in case of an exception
        console.error("❌ Error fetching events by sport:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get events by location only with age filter
const getEsemenyekByTelepulesAndAge = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Authentication token is required!" });
        }

        const decoded = jwt.verify(token, "secretkey");
        const userId = decoded.userId;
        const currentTime = new Date();

        // Get user details to calculate age
        const user = await User.findByPk(userId);
        if (!user || !user.birthDate) {
            return res.status(400).json({ message: "User birth date is not available!" });
        }

        // Calculate user's age
        const birthDate = new Date(user.birthDate);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        const { telepules } = req.params;

        // Check if city is provided
        if (!telepules) {
            return res.status(400).json({ message: "City (telepules) is required!" });
        }

        // Fetch events based on city and user age
        const events = await Esemény.findAll({
            where: {
                minimumEletkor: { [Op.lte]: age },
                maximumEletkor: { [Op.gte]: age },
                zaroIdo: { [Op.gt]: currentTime } // Only events with closing time in the future
            },
            include: [
                {
                    model: Helyszin,
                    where: { Telepules: telepules },
                    attributes: [
                        'Id', 'Nev', 'Telepules', 'Cim', 'Iranyitoszam', 'Fedett', 'Oltozo',
                        'Parkolas', 'Leiras', 'Berles', 'userId'
                    ]
                },
                {
                    model: Sportok,
                    attributes: ['Id', 'Nev', 'Leiras', 'KepUrl']
                }
            ]
        });

        // If no events are found, return a 404 response
        if (events.length === 0) {
            return res.status(404).json({
                message: "No events found for the specified city and your age range.",
                userAge: age
            });
        }

        // Return the found events as a response with full event details
        res.json({
            events,
            userAge: age
        });
    } catch (error) {
        // Log the error and send a 500 response in case of an exception
        console.error("❌ Error fetching age-filtered events by location:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get events by sport only with age filter
const getEsemenyekBySportNevAndAge = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Authentication token is required!" });
        }

        const decoded = jwt.verify(token, "secretkey");
        const userId = decoded.userId;
        const currentTime = new Date();

        // Get user details to calculate age
        const user = await User.findByPk(userId);
        if (!user || !user.birthDate) {
            return res.status(400).json({ message: "User birth date is not available!" });
        }

        // Calculate user's age
        const birthDate = new Date(user.birthDate);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        const { sportNev } = req.params;

        // Check if sport name is provided
        if (!sportNev) {
            return res.status(400).json({ message: "Sport name (sportNev) is required!" });
        }

        // Fetch events based on sport name and user age
        const events = await Esemény.findAll({
            where: {
                minimumEletkor: { [Op.lte]: age },
                maximumEletkor: { [Op.gte]: age },
                zaroIdo: { [Op.gt]: currentTime } // Only events with closing time in the future
            },
            include: [
                {
                    model: Helyszin,
                    attributes: [
                        'Id', 'Nev', 'Telepules', 'Cim', 'Iranyitoszam', 'Fedett', 'Oltozo',
                        'Parkolas', 'Leiras', 'Berles', 'userId'
                    ]
                },
                {
                    model: Sportok,
                    where: { Nev: sportNev },
                    attributes: ['Id', 'Nev', 'Leiras', 'KepUrl']
                }
            ]
        });

        // If no events are found, return a 404 response
        if (events.length === 0) {
            return res.status(404).json({
                message: "No events found for the specified sport and your age range.",
                userAge: age
            });
        }

        // Return the found events as a response with full event details
        res.json({
            events,
            userAge: age
        });
    } catch (error) {
        // Log the error and send a 500 response in case of an exception
        console.error("❌ Error fetching age-filtered events by sport:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get pending participants for an event (only for organizers)
const getPendingParticipants = async (req, res) => {
    try {
        const { id: eseményId } = req.params;
        const userId = req.user.userId;

        // Check if the event exists
        const esemény = await Esemény.findByPk(eseményId);
        if (!esemény) {
            return res.status(404).json({ message: "Event not found!" });
        }

        // Check if the user is a participant for this event
        const isParticipant = await Résztvevő.findOne({
            where: {
                eseményId: eseményId,
                userId: userId,
                státusz: 'elfogadva'
            }
        });

        if (!isParticipant) {
            return res.status(403).json({ message: "Only participants can view pending invitations!" });
        }

        // Get all pending participants for this event (only 'függőben' status)
        const pendingParticipants = await Résztvevő.findAll({
            where: {
                eseményId: eseményId,
                státusz: 'függőben' // Only include 'függőben' status, not 'meghívott'
            },
            include: [
                {
                    model: User,
                    attributes: ['id', 'username', 'firstName', 'lastName', 'email', 'profilePicture', 'birthDate']
                }
            ]
        });

        // Format the participant data
        const formattedParticipants = pendingParticipants.map(participant => {
            // Calculate age if birthDate is available
            let age = null;
            if (participant.User.birthDate) {
                age = calculateAge(participant.User.birthDate);
            }

            // Prepare user name from available fields
            const name = participant.User.username ||
                `${participant.User.firstName || ''} ${participant.User.lastName || ''}`.trim() ||
                'Felhasználó';

            return {
                id: participant.userId,
                name: name,
                email: participant.User.email,
                image: participant.User.profilePicture || '',
                bio: participant.User.bio || '',
                age: age,
                role: participant.szerep,
                status: participant.státusz,
                joinDate: participant.csatlakozásDátuma
            };
        });

        res.json({
            pendingParticipants: formattedParticipants,
            count: formattedParticipants.length
        });
    } catch (error) {
        console.error("Error fetching pending participants:", error);
        res.status(500).json({ message: "Error fetching pending participants", error: error.message });
    }
};


// Approve a participant's request
const approveParticipant = async (req, res) => {
    try {
        const { eseményId, userId: participantId } = req.body;
        const organizerId = req.user.userId;

        // Check if the event exists
        const esemény = await Esemény.findByPk(eseményId);
        if (!esemény) {
            return res.status(404).json({ message: "Event not found!" });
        }

        // Check if the user is an organizer for this event
        const isOrganizer = await Résztvevő.findOne({
            where: {
                eseményId: eseményId,
                userId: organizerId,
                szerep: 'szervező'
            }
        });

        if (!isOrganizer) {
            return res.status(403).json({ message: "Only organizers can approve participants!" });
        }

        // Check if the participant exists and is pending
        const participant = await Résztvevő.findOne({
            where: {
                eseményId: eseményId,
                userId: participantId,
                státusz: 'függőben'
            }
        });

        if (!participant) {
            return res.status(404).json({ message: "Pending participant not found!" });
        }

        // Check if approving would exceed the maximum number of participants
        const currentParticipantCount = await Résztvevő.count({
            where: {
                eseményId: eseményId,
                státusz: 'elfogadva'
            }
        });

        if (currentParticipantCount >= esemény.maximumLetszam) {
            return res.status(400).json({ message: "Cannot approve participant: maximum number of participants reached!" });
        }

        // Update the participant status to approved
        await participant.update({ státusz: 'elfogadva' });

        // Get user details to return
        const user = await User.findByPk(participantId, {
            attributes: ['id', 'username', 'firstName', 'lastName', 'email', 'profilePicture', 'birthDate']
        });

        // Calculate age if birthDate is available
        let age = null;
        if (user.birthDate) {
            const birthDate = new Date(user.birthDate);
            const today = new Date();
            age = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
        }

        // Prepare user name from available fields
        const name = user.username ||
            `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
            'Felhasználó';

        res.status(200).json({
            message: "Participant approved successfully!",
            participant: {
                id: user.id,
                name: name,
                email: user.email,
                image: user.profilePicture || '',
                age: age,
                role: 'játékos',
                status: 'elfogadva',
                joinDate: participant.csatlakozásDátuma
            }
        });
    } catch (error) {
        console.error("Error approving participant:", error);
        res.status(500).json({ message: "Error approving participant", error: error.message });
    }
};

// Reject a participant's request
const rejectParticipant = async (req, res) => {
    try {
        const { eseményId, userId: participantId } = req.body;
        const organizerId = req.user.userId;

        // Check if the event exists
        const esemény = await Esemény.findByPk(eseményId);
        if (!esemény) {
            return res.status(404).json({ message: "Event not found!" });
        }

        // Check if the user is an organizer for this event
        const isOrganizer = await Résztvevő.findOne({
            where: {
                eseményId: eseményId,
                userId: organizerId,
                szerep: 'szervező'
            }
        });

        if (!isOrganizer) {
            return res.status(403).json({ message: "Only organizers can reject participants!" });
        }

        // Check if the participant exists and is pending
        const participant = await Résztvevő.findOne({
            where: {
                eseményId: eseményId,
                userId: participantId,
                státusz: 'függőben'
            }
        });

        if (!participant) {
            return res.status(404).json({ message: "Pending participant not found!" });
        }

        // Update the participant status to rejected
        await participant.update({ státusz: 'elutasítva' });

        res.status(200).json({
            message: "Participant rejected successfully!",
            participantId: participantId
        });
    } catch (error) {
        console.error("Error rejecting participant:", error);
        res.status(500).json({ message: "Error rejecting participant", error: error.message });
    }
};


// Meghívás küldése egy felhasználónak
// Meghívás küldése egy felhasználónak - módosított verzió, hogy bárki meghívhasson
// Meghívás küldése egy felhasználónak - javított verzió
// Update the inviteUserToEvent function to properly handle different statuses
const inviteUserToEvent = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Authentication token is required!" });
        }

        const decoded = jwt.verify(token, "secretkey");
        const inviterId = decoded.userId;

        const { eseményId, invitedUserId } = req.body;

        // Ellenőrizzük, hogy létezik-e az esemény
        const esemény = await Esemény.findByPk(eseményId);
        if (!esemény) {
            return res.status(404).json({ message: "Event not found!" });
        }

        // Ellenőrizzük, hogy a meghívó felhasználó résztvevője-e az eseménynek
        const isParticipant = await Résztvevő.findOne({
            where: {
                eseményId: eseményId,
                userId: inviterId,
                státusz: 'elfogadva' // Csak elfogadott résztvevők hívhatnak meg másokat
            }
        });

        if (!isParticipant) {
            return res.status(403).json({ message: "Only participants can invite users!" });
        }

        // Ellenőrizzük, hogy a meghívott felhasználó létezik-e
        const invitedUser = await User.findByPk(invitedUserId);
        if (!invitedUser) {
            return res.status(404).json({ message: "Invited user not found!" });
        }

        // Ellenőrizzük, hogy a felhasználó már résztvevő-e vagy már meghívták-e
        const existingParticipant = await Résztvevő.findOne({
            where: {
                eseményId: eseményId,
                userId: invitedUserId
            }
        });

        if (existingParticipant) {
            // Különböző státuszok kezelése
            if (existingParticipant.státusz === 'elfogadva') {
                return res.status(400).json({
                    message: "User is already a participant in this event!",
                    status: existingParticipant.státusz
                });
            } else if (existingParticipant.státusz === 'függőben' || existingParticipant.státusz === 'meghívott') {
                return res.status(400).json({
                    message: "User has already been invited to this event!",
                    status: existingParticipant.státusz
                });
            } else if (existingParticipant.státusz === 'elutasítva') {
                // Ha korábban elutasította, frissítsük a státuszt
                await existingParticipant.update({
                    státusz: 'függőben',
                    csatlakozásDátuma: new Date()
                });
                
                return res.status(200).json({
                    message: "Invitation resent to previously rejected user!",
                    invitation: {
                        eseményId: existingParticipant.eseményId,
                        userId: existingParticipant.userId,
                        status: 'függőben',
                        date: existingParticipant.csatlakozásDátuma
                    }
                });
            }
        }

        // Létrehozzuk a meghívást (résztvevő rekord 'függőben' státusszal)
        const invitation = await Résztvevő.create({
            eseményId: eseményId,
            userId: invitedUserId,
            szerep: 'játékos',
            státusz: 'függőben',
            csatlakozásDátuma: new Date()
        });

        res.status(201).json({
            message: "Invitation sent successfully!",
            invitation: {
                eseményId: invitation.eseményId,
                userId: invitation.userId,
                status: invitation.státusz,
                date: invitation.csatlakozásDátuma
            }
        });
    } catch (error) {
        console.error("Error sending invitation:", error);
        res.status(500).json({ message: "Error sending invitation", error: error.message });
    }
};

// Meghívások lekérése a bejelentkezett felhasználó számára
const getUserInvitations = async (req, res) => {
    try {
        const userId = req.user.userId;

        // Lekérjük a felhasználó meghívásait (meghívott státuszú résztvevői bejegyzések)
        const pendingInvitations = await Résztvevő.findAll({
            where: {
                userId: userId,
                státusz: 'meghívott'  // Changed from 'függőben' to 'meghívott'
            },
            include: [
                {
                    model: Esemény,
                    include: [
                        {
                            model: Helyszin,
                            attributes: ['Id', 'Nev', 'Telepules', 'Cim', 'Iranyitoszam', 'Fedett', 'Oltozo', 'Parkolas', 'Leiras', 'Berles']
                        },
                        {
                            model: Sportok,
                            attributes: ['Id', 'Nev', 'KepUrl']
                        }
                    ]
                }
            ]
        });

        if (pendingInvitations.length === 0) {
            return res.status(404).json({ message: "Nincsenek meghívásaid." });
        }

        // Átalakítjuk a meghívásokat a frontend által várt formátumra
        const events = pendingInvitations.map(invitation => {
            const event = invitation.Esemény;
            return {
                id: event.id,
                kezdoIdo: event.kezdoIdo,
                zaroIdo: event.zaroIdo,
                szint: event.szint,
                minimumEletkor: event.minimumEletkor,
                maximumEletkor: event.maximumEletkor,
                maximumLetszam: event.maximumLetszam,
                imageUrl: event.imageUrl,
                Helyszin: event.Helyszin,
                Sportok: event.Sportok,
                // Hozzáadjuk a résztvevői adatokat is
                resztvevoStatus: invitation.státusz,
                resztvevoSzerep: invitation.szerep
            };
        });

        res.status(200).json({ events });
    } catch (error) {
        console.error("Hiba a meghívások lekérésekor:", error);
        res.status(500).json({ message: "Szerver hiba", error: error.message });
    }
};


// Meghívás elfogadása
const acceptInvitation = async (req, res) => {
    try {
        const { eseményId } = req.body;
        const userId = req.user.userId;

        console.log("Accept invitation request body:", req.body);
        console.log("User ID from token:", userId);
        console.log("Event ID from request:", eseményId);

        if (!eseményId) {
            return res.status(400).json({ message: "Event ID is required!" });
        }

        // Ellenőrizzük, hogy az esemény létezik-e
        const esemény = await Esemény.findByPk(eseményId);
        if (!esemény) {
            console.log(`Event not found with ID: ${eseményId}`);
            return res.status(404).json({ message: "Event not found!" });
        }

        console.log("Event found:", esemény.dataValues);

        // Ellenőrizzük, hogy a felhasználónak van-e meghívása
        // Először próbáljuk meg a státuszt is figyelembe véve
        let invitation = await Résztvevő.findOne({
            where: {
                eseményId: eseményId,
                userId: userId,
                státusz: 'meghívott' // Changed from 'függőben' to 'meghívott'
            }
        });

        // Ha nem találtuk meg, próbáljuk meg státusz nélkül
        if (!invitation) {
            console.log("No invitation found, checking for any participation");
            invitation = await Résztvevő.findOne({
                where: {
                    eseményId: eseményId,
                    userId: userId
                }
            });

            if (invitation) {
                console.log("Found participation with status:", invitation.státusz);

                // Ha már elfogadott résztvevő, akkor küldjünk sikeres választ
                if (invitation.státusz === 'elfogadva') {
                    return res.status(200).json({
                        message: "You are already a participant of this event!",
                        alreadyAccepted: true
                    });
                }
            }
        }

        if (!invitation) {
            console.log("No invitation found for this user and event");

            // Ellenőrizzük, hogy van-e egyáltalán ilyen esemény és felhasználó
            const eventExists = await Esemény.findByPk(eseményId);
            const userExists = await User.findByPk(userId);

            console.log("Event exists:", !!eventExists);
            console.log("User exists:", !!userExists);

            // Ellenőrizzük, hogy van-e bármilyen résztvevő ehhez az eseményhez
            const anyParticipants = await Résztvevő.findAll({
                where: { eseményId: eseményId }
            });

            console.log("Any participants for this event:", anyParticipants.length);

            // Ha nincs meghívás, akkor hozzunk létre egy új résztvevőt függőben státusszal
            const newParticipant = await Résztvevő.create({
                eseményId,
                userId,
                szerep: 'játékos',
                státusz: 'függőben',
                csatlakozásDátuma: new Date()
            });

            console.log("Created new pending participant:", newParticipant.dataValues);

            return res.status(201).json({
                message: "Csatlakozási kérelem elküldve",
                participant: {
                    userId,
                    role: 'játékos',
                    status: 'függőben',
                    joinDate: newParticipant.csatlakozásDátuma
                }
            });
        }

        console.log("Invitation found:", invitation.dataValues);

        // Ellenőrizzük, hogy van-e még hely az eseményen
        const currentParticipantCount = await Résztvevő.count({
            where: {
                eseményId: eseményId,
                státusz: 'elfogadva'
            }
        });

        console.log("Current participant count:", currentParticipantCount);
        console.log("Maximum participants:", esemény.maximumLetszam);

        if (currentParticipantCount >= esemény.maximumLetszam) {
            return res.status(400).json({ message: "Event is already full!" });
        }

        // Ha a felhasználó meghívott státuszban van, akkor változtassuk függőben státuszra
        if (invitation.státusz === 'meghívott') {
            await invitation.update({ státusz: 'függőben' });
            console.log("Invitation status changed from 'meghívott' to 'függőben'");

            return res.status(200).json({
                message: "Csatlakozási kérelem elküldve",
                status: 'függőben'
            });
        }

        // Meghívás elfogadása - csak akkor állítjuk elfogadottra, ha a felhasználó a szervező
        // Egyébként függőben marad, amíg a szervező el nem fogadja
        const isOrganizer = await Résztvevő.findOne({
            where: {
                eseményId: eseményId,
                userId: userId,
                szerep: 'szervező'
            }
        });

        if (isOrganizer) {
            await invitation.update({ státusz: 'elfogadva' });
            console.log("Invitation accepted successfully (user is organizer)");

            return res.status(200).json({
                message: "Invitation accepted successfully!",
                status: 'elfogadva'
            });
        } else {
            // Ha a felhasználó nem szervező, akkor a státusz marad függőben
            console.log("Invitation remains pending (user is not organizer)");

            return res.status(200).json({
                message: "Csatlakozási kérelem elküldve",
                status: 'függőben'
            });
        }
    } catch (error) {
        console.error("Error accepting invitation:", error);
        res.status(500).json({ message: "Error accepting invitation", error: error.message });
    }
};



// Meghívás elutasítása
// Meghívás elutasítása
const rejectInvitation = async (req, res) => {
    try {
        const { eseményId } = req.body;
        const userId = req.user.userId;

        console.log("Reject invitation request body:", req.body);
        console.log("User ID from token:", userId);
        console.log("Event ID from request:", eseményId);

        if (!eseményId) {
            return res.status(400).json({ message: "Event ID is required!" });
        }

        // Ellenőrizzük, hogy az esemény létezik-e
        const esemény = await Esemény.findByPk(eseményId);
        if (!esemény) {
            console.log(`Event not found with ID: ${eseményId}`);
            return res.status(404).json({ message: "Event not found!" });
        }

        console.log("Event found:", esemény.dataValues);

        // Ellenőrizzük, hogy a felhasználónak van-e meghívása
        // Először próbáljuk meg a státuszt is figyelembe véve
        let invitation = await Résztvevő.findOne({
            where: {
                eseményId: eseményId,
                userId: userId
            }
        });

        if (!invitation) {
            console.log("No invitation found for this user and event");

            // Ellenőrizzük, hogy van-e egyáltalán ilyen esemény és felhasználó
            const eventExists = await Esemény.findByPk(eseményId);
            const userExists = await User.findByPk(userId);

            console.log("Event exists:", !!eventExists);
            console.log("User exists:", !!userExists);

            return res.status(404).json({ message: "Invitation not found!" });
        }

        console.log("Invitation found:", invitation.dataValues);

        // Töröljük a meghívást
        await invitation.destroy();
        console.log("Invitation rejected and removed successfully");

        res.status(200).json({
            message: "Invitation rejected successfully!"
        });
    } catch (error) {
        console.error("Error rejecting invitation:", error);
        res.status(500).json({ message: "Error rejecting invitation", error: error.message });
    }
};

// Tömeges meghívások küldése - javított verzió
// Update the inviteUsersToEvent function to properly handle different statuses
const inviteUsersToEvent = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Authentication token is required!" });
        }

        const decoded = jwt.verify(token, "secretkey");
        const inviterId = decoded.userId;

        // Get event ID and invited user IDs from request body
        const { eseményId, userIds, status } = req.body;

        console.log("Received invitation request:", { eseményId, userIds, status });

        if (!eseményId || !userIds || !Array.isArray(userIds) || userIds.length === 0) {
            return res.status(400).json({ message: "Event ID and at least one user ID are required!" });
        }

        // Check if the event exists
        const esemény = await Esemény.findByPk(eseményId);
        if (!esemény) {
            return res.status(404).json({ message: "Event not found!" });
        }

        // Check if the user is a participant for this event
        const isParticipant = await Résztvevő.findOne({
            where: {
                eseményId: eseményId,
                userId: inviterId,
                státusz: 'elfogadva' // Csak elfogadott résztvevők hívhatnak meg másokat
            }
        });

        if (!isParticipant) {
            return res.status(403).json({ message: "Only participants can invite users to events!" });
        }

        // Process each user invitation
        const results = [];
        for (const invitedUserId of userIds) {
            try {
                // Check if the invited user exists
                const invitedUser = await User.findByPk(invitedUserId);
                if (!invitedUser) {
                    results.push({ userId: invitedUserId, status: 'error', message: "User not found" });
                    continue;
                }

                // Check if the user is already a participant or has a pending invitation
                const existingParticipant = await Résztvevő.findOne({
                    where: {
                        eseményId: eseményId,
                        userId: invitedUserId
                    }
                });

                if (existingParticipant) {
                    if (existingParticipant.státusz === 'elfogadva') {
                        results.push({ 
                            userId: invitedUserId, 
                            status: 'error', 
                            message: "User is already a participant in this event" 
                        });
                    } else if (existingParticipant.státusz === 'függőben' || existingParticipant.státusz === 'meghívott') {
                        results.push({ 
                            userId: invitedUserId, 
                            status: 'error', 
                            message: "User has already been invited to this event" 
                        });
                    } else if (existingParticipant.státusz === 'elutasítva') {
                        // If the user previously rejected the invitation, update it to meghívott
                        await existingParticipant.update({
                            státusz: 'meghívott', // Changed from 'függőben' to 'meghívott'
                            csatlakozásDátuma: new Date()
                        });

                        results.push({ 
                            userId: invitedUserId, 
                            status: 'success', 
                            message: "Invitation resent to previously rejected user" 
                        });
                    }
                    continue;
                }

                // Create a new participant with meghívott status
                await Résztvevő.create({
                    eseményId: eseményId,
                    userId: invitedUserId,
                    szerep: 'játékos',
                    státusz: 'meghívott', // Changed from 'függőben' to 'meghívott'
                    csatlakozásDátuma: new Date()
                });

                results.push({ userId: invitedUserId, status: 'success', message: "Invitation sent" });
            } catch (error) {
                console.error(`Error inviting user ${invitedUserId}:`, error);
                results.push({ userId: invitedUserId, status: 'error', message: error.message });
            }
        }

        // Count successful invitations
        const successCount = results.filter(r => r.status === 'success').length;

        res.status(200).json({
            message: `${successCount} user(s) invited successfully!`,
            results: results
        });

    } catch (error) {
        console.error("Error inviting users to event:", error);
        res.status(500).json({ message: "Error inviting users to event", error: error.message });
    }
};



// New function to get all invitations for an event (including pending and invited)
const getAllEventInvitations = async (req, res) => {
    try {
        const { id: eseményId } = req.params;
        const userId = req.user.userId;

        // Check if the event exists
        const esemény = await Esemény.findByPk(eseményId);
        if (!esemény) {
            return res.status(404).json({ message: "Event not found!" });
        }

        // Check if the user is a participant for this event
        const isParticipant = await Résztvevő.findOne({
            where: {
                eseményId: eseményId,
                userId: userId,
                státusz: 'elfogadva'
            }
        });

        if (!isParticipant) {
            return res.status(403).json({ message: "Only participants can view invitations!" });
        }

        // Get all invitations for this event (any status except 'elutasítva')
        const invitations = await Résztvevő.findAll({
            where: {
                eseményId: eseményId,
                státusz: {
                    [Op.ne]: 'elutasítva' // Not equal to 'elutasítva' (rejected)
                }
            },
            include: [
                {
                    model: User,
                    attributes: ['id', 'username', 'firstName', 'lastName', 'email', 'profilePicture', 'birthDate']
                }
            ]
        });

        // Format the invitation data
        const formattedInvitations = invitations.map(invitation => {
            // Calculate age if birthDate is available
            let age = null;
            if (invitation.User.birthDate) {
                age = calculateAge(invitation.User.birthDate);
            }

            // Prepare user name from available fields
            const name = invitation.User.username ||
                `${invitation.User.firstName || ''} ${invitation.User.lastName || ''}`.trim() ||
                'Felhasználó';

            return {
                id: invitation.userId,
                name: name,
                email: invitation.User.email,
                image: invitation.User.profilePicture || '',
                bio: invitation.User.bio || '',
                age: age,
                role: invitation.szerep,
                status: invitation.státusz,
                joinDate: invitation.csatlakozásDátuma
            };
        });

        res.json({
            invitations: formattedInvitations,
            count: formattedInvitations.length
        });
    } catch (error) {
        console.error("Error fetching invitations:", error);
        res.status(500).json({ message: "Error fetching invitations", error: error.message });
    }
};

// Felhasználók keresése egy adott eseményhez, életkor szűréssel
const searchUsersForEvent = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Authentication token is required!" });
        }

        const decoded = jwt.verify(token, "secretkey");
        const currentUserId = decoded.userId;
        const { id: eseményId } = req.params;
        const { query, limit = 10, page = 1 } = req.query;

        // Ellenőrizzük, hogy az esemény létezik-e
        const esemény = await Esemény.findByPk(eseményId);
        if (!esemény) {
            return res.status(404).json({ message: "Event not found!" });
        }

        // Ellenőrizzük, hogy a felhasználó résztvevője-e az eseménynek
        const isParticipant = await Résztvevő.findOne({
            where: {
                eseményId: eseményId,
                userId: currentUserId,
                státusz: 'elfogadva'
            }
        });

        if (!isParticipant) {
            return res.status(403).json({ message: "Only participants can search for users to invite!" });
        }

        // Számítsuk ki az offset-et a lapozáshoz
        const offset = (page - 1) * limit;

        // Alap keresési feltételek
        let whereConditions = {
            id: { [Op.ne]: currentUserId } // Ne jelenítse meg a saját felhasználót
        };

        // Ha van keresési kifejezés, akkor szűrünk arra is
        if (query && query.length >= 2) {
            whereConditions = {
                ...whereConditions,
                [Op.or]: [
                    { username: { [Op.like]: `%${query}%` } },
                    { firstName: { [Op.like]: `%${query}%` } },
                    { lastName: { [Op.like]: `%${query}%` } },
                    { email: { [Op.like]: `%${query}%` } }
                ]
            };
        } else if (query) {
            return res.status(400).json({ message: "Search query must be at least 2 characters long" });
        }

        // Kizárjuk a már résztvevő és meghívott felhasználókat
        const participants = await Résztvevő.findAll({
            where: { eseményId: eseményId },
            attributes: ['userId']
        });
        
        const participantIds = participants.map(p => p.userId);
        const excludedUserIds = [...new Set([...participantIds, currentUserId])];
        
        whereConditions.id = { [Op.notIn]: excludedUserIds };

        // Felhasználók keresése
        const users = await User.findAll({
            where: whereConditions,
            attributes: ['id', 'username', 'firstName', 'lastName', 'email', 'profilePicture', 'birthDate'],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['username', 'ASC']]
        });

        // Életkor kiszámítása és szűrése az esemény korhatárai alapján
        const minAge = parseInt(esemény.minimumEletkor);
        const maxAge = parseInt(esemény.maximumEletkor);

        const filteredUsers = users.map(user => {
            let age = null;
            if (user.birthDate) {
                const birthDate = new Date(user.birthDate);
                const today = new Date();
                age = today.getFullYear() - birthDate.getFullYear();
                const m = today.getMonth() - birthDate.getMonth();
                if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                    age--;
                }
            }

            // Teljes név összeállítása
            const fullName = user.username || 
                `${user.firstName || ''} ${user.lastName || ''}`.trim() || 
                'Felhasználó';

            return {
                id: user.id,
                name: fullName,
                username: user.username,
                email: user.email,
                profilePicture: user.profilePicture,
                age: age,
                // Csak akkor adjuk vissza, ha az életkor megfelel a korhatároknak
                ageInRange: age !== null ? (age >= minAge && age <= maxAge) : false
            };
        }).filter(user => user.ageInRange);

        // Válasz küldése
        res.status(200).json({
            users: filteredUsers,
            total: filteredUsers.length,
            page: parseInt(page),
            totalPages: Math.ceil(filteredUsers.length / limit),
            limit: parseInt(limit),
            ageRange: {
                min: minAge,
                max: maxAge
            }
        });

    } catch (error) {
        console.error("Error searching users for event:", error);
        res.status(500).json({ message: "Error searching users for event", error: error.message });
    }
};

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
            status: participant ? participant.státusz : '',
            role: participant ? participant.szerep : ''
        });
    } catch (error) {
        console.error("Error checking participation:", error);
        res.status(500).json({ message: "Error checking participation status", error: error.message });
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
    getEsemenyekByTelepulesAndSportNev,
    joinEsemeny,
    getEsemenyMinimal,
    checkParticipation,
    getEventParticipants,
    getEsemenyekFilteredByUserAge,
    leaveEsemeny,
    getOrganizedEvents,
    getParticipatedEvents,
    getArchivedEvents,
    getAllEsemenyWithDetails,
    removeParticipant,
    getEventSearchData,
    getAllEsemenyekFilteredByUserAge,
    getEsemenyekByTelepules,
    getEsemenyekBySportNev,
    getEsemenyekByTelepulesAndAge,
    getEsemenyekBySportNevAndAge,
    getPendingParticipants,
    approveParticipant,
    rejectParticipant,
    // Új funkciók
    inviteUserToEvent,
    inviteUsersToEvent,
    getUserInvitations,
    acceptInvitation,
    rejectInvitation,
    getAllEventInvitations,
    searchUsersForEvent
};


