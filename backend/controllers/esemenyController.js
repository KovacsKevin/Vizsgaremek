
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

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads/';
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
    limits: { fileSize: 5 * 1024 * 1024 }, 
    fileFilter: function (req, file, cb) {

        const filetypes = /jpeg|jpg|png|gif/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error("Only image files are allowed!"));
        }
    }
}).single('imageFile'); 

const createEsemeny = async (req, res) => {
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

            const { helyszinId, sportId, kezdoIdo, zaroIdo, szint, minimumEletkor, maximumEletkor, maximumLetszam } = req.body;

            if (!helyszinId || !sportId || !kezdoIdo || !zaroIdo || !szint || !minimumEletkor || !maximumEletkor || !maximumLetszam) {
                return res.status(400).json({ message: "Missing required fields for creating event!" });
            }

            if (parseInt(maximumLetszam) < 2) {
                return res.status(400).json({ message: "A létszámnak legalább 2 főnek kell lennie!" });
            }

            const now = new Date();
            const kezdoIdoDate = new Date(kezdoIdo);
            const zaroIdoDate = new Date(zaroIdo);

            if (kezdoIdoDate < now) {
                return res.status(400).json({ message: "A kezdő időpont nem lehet korábbi, mint a jelenlegi időpont!" });
            }

            if (zaroIdoDate <= kezdoIdoDate) {
                return res.status(400).json({ message: "A záró időpont nem lehet korábbi vagy egyenlő, mint a kezdő időpont!" });
            }

            let imageUrl = null;
            if (req.file) {
                imageUrl = `/uploads/${req.file.filename}`;
            }

            const result = await sequelize.transaction(async (t) => {
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
                    imageUrl 
                }, { transaction: t });

                const résztvevő = await Résztvevő.create({
                    eseményId: newEsemény.id,
                    userId: userId,
                    szerep: 'szervező',
                    státusz: 'elfogadva',
                    csatlakozásDátuma: new Date()
                }, { transaction: t });

                return { newEsemény, résztvevő };
            });

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

        if (esemeny.imageUrl) {
            const imagePath = path.join(__dirname, '..', esemeny.imageUrl);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await Résztvevő.destroy({
            where: {
                eseményId: id
            }
        });

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

            if (parseInt(maximumLetszam) < 2) {
                return res.status(400).json({ message: "A létszámnak legalább 2 főnek kell lennie!" });
            }

            const kezdoIdoDate = new Date(kezdoIdo);
            const zaroIdoDate = new Date(zaroIdo);

            const now = new Date();
            const currentKezdoIdo = new Date(esemeny.kezdoIdo);

            if (currentKezdoIdo > now && kezdoIdoDate < now) {
                return res.status(400).json({ message: "A kezdő időpont nem lehet korábbi, mint a jelenlegi időpont!" });
            }

            if (zaroIdoDate <= kezdoIdoDate) {
                return res.status(400).json({ message: "A záró időpont nem lehet korábbi vagy egyenlő, mint a kezdő időpont!" });
            }

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

            let imageUrl = esemeny.imageUrl;

            if (req.file) {
                if (esemeny.imageUrl) {
                    const oldImagePath = path.join(__dirname, '..', esemeny.imageUrl);
                    if (fs.existsSync(oldImagePath)) {
                        fs.unlinkSync(oldImagePath);
                    }
                }
                imageUrl = `/uploads/${req.file.filename}`;
            }

            if (req.body.clearImage === 'true' && !req.file) {
                if (esemeny.imageUrl) {
                    const imagePath = path.join(__dirname, '..', esemeny.imageUrl);
                    if (fs.existsSync(imagePath)) {
                        fs.unlinkSync(imagePath);
                    }
                }
                imageUrl = null;
            }

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

            const updatedEsemeny = await Esemény.findByPk(id, {
                include: [
                    { model: Helyszin, attributes: ['Id', 'Nev', 'Telepules', 'Cim', 'Iranyitoszam', 'Fedett', 'Oltozo', 'Parkolas', 'Berles', 'Leiras'] },
                    { model: Sportok, attributes: ['Id', 'Nev', 'KepUrl'] }
                ]
            });

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

const leaveEsemeny = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Authentication token is required!" });
        }

        const decoded = jwt.verify(token, "secretkey");
        const userId = decoded.userId;

        const { eseményId } = req.body;

        if (!eseményId) {
            return res.status(400).json({ message: "Event ID is required!" });
        }

        const esemény = await Esemény.findByPk(eseményId);
        if (!esemény) {
            return res.status(404).json({ message: "Event not found!" });
        }

        const participant = await Résztvevő.findOne({
            where: {
                eseményId: eseményId,
                userId: userId
            }
        });

        if (!participant) {
            return res.status(404).json({ message: "You are not a participant in this event!" });
        }

        if (participant.szerep !== 'játékos') {
            return res.status(403).json({ message: "Only players can leave an event. Organizers must delete the event instead." });
        }

        await participant.destroy();

        res.status(200).json({
            message: "You have successfully left the event!"
        });

    } catch (error) {
        console.error("Error leaving event:", error);
        res.status(500).json({ message: "Error leaving event", error: error.message });
    }
};

const getEsemenyById = async (req, res) => {
    try {
        const { id } = req.params;

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

const getAllEsemeny = async (req, res) => {
    try {
        const currentTime = new Date();

        const events = await Esemény.findAll({
            where: {
                zaroIdo: { [Op.gt]: currentTime } 
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

const getEsemenyByUserId = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Authentication token is required!" });
        }

        const decoded = jwt.verify(token, "secretkey");
        const userId = decoded.userId;

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

        if (!telepules || !sportNev) {
            return res.status(400).json({ message: "Both city (telepules) and sport name (sportNev) are required!" });
        }

        const events = await Esemény.findAll({
            where: {
                zaroIdo: { [Op.gt]: currentTime } 
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

        if (events.length === 0) {
            return res.status(404).json({ message: "No events found for the specified city and sport." });
        }

        res.json({ events });
    } catch (error) {
        console.error("❌ Error fetching events:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const getEsemenyekFilteredByUserAge = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Authentication token is required!" });
        }

        const decoded = jwt.verify(token, "secretkey");
        const userId = decoded.userId;
        const currentTime = new Date();

        const user = await User.findByPk(userId);
        if (!user || !user.birthDate) {
            return res.status(400).json({ message: "User birth date is not available!" });
        }

        const birthDate = new Date(user.birthDate);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        const { telepules, sportNev } = req.params;

        if (!telepules || !sportNev) {
            return res.status(400).json({ message: "Both city (telepules) and sport name (sportNev) are required!" });
        }

        const events = await Esemény.findAll({
            where: {
                minimumEletkor: { [Op.lte]: age },
                maximumEletkor: { [Op.gte]: age },
                zaroIdo: { [Op.gt]: currentTime } 
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

        if (events.length === 0) {
            return res.status(404).json({
                message: "No events found for the specified city, sport, and your age range.",
                userAge: age
            });
        }

        res.json({
            events,
            userAge: age
        });
    } catch (error) {
        console.error("❌ Error fetching age-filtered events:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const joinEsemeny = async (req, res) => {
    try {
        const { eseményId } = req.body;
        const userId = req.user.userId;

        

        const event = await Esemény.findByPk(eseményId);
        if (!event) {
            return res.status(404).json({ message: "Esemény nem található" });
        }

        const existingParticipant = await Résztvevő.findOne({
            where: { eseményId, userId }
        });

        if (existingParticipant) {
            return res.status(400).json({ message: "A felhasználó már résztvevője az eseménynek" });
        }

        const isOrganizer = await Résztvevő.findOne({
            where: {
                eseményId,
                userId,
                szerep: 'szervező'
            }
        });

        const newParticipant = await Résztvevő.create({
            eseményId,
            userId,
            szerep: 'játékos',
            státusz: isOrganizer ? 'elfogadva' : 'függőben',
            csatlakozásDátuma: new Date()
        });

        const user = await User.findByPk(userId, {
            attributes: ['id', 'name', 'email', 'image', 'age', 'level']
        });

        return res.status(201).json({
            message: isOrganizer ? "Sikeresen csatlakozott az eseményhez" : "Csatlakozási kérelem elküldve",
            participant: {
                userId: user.id,
                name: user.username,
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

        const esemeny = await Esemény.findByPk(id, {
            attributes: ['id']
        });

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

const getEventParticipants = async (req, res) => {
    try {
        const { id: eseményId } = req.params;

        const esemény = await Esemény.findByPk(eseményId);
        if (!esemény) {
            return res.status(404).json({ message: "Event not found!" });
        }

        const participants = await Résztvevő.findAll({
            where: {
                eseményId: eseményId,
                státusz: 'elfogadva' 
            },
            include: [
                {
                    model: User,
                    attributes: ['id', 'username', 'firstName', 'lastName', 'email', 'profilePicture', 'birthDate'] // Include relevant user details
                }
            ]
        });

        const formattedParticipants = participants.map(participant => {
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

const getOrganizedEvents = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Authentication token is required!" });
        }

        const decoded = jwt.verify(token, "secretkey");
        const userId = decoded.userId;
        const currentTime = new Date();

        const events = await Esemény.findAll({
            where: {
                zaroIdo: { [Op.gt]: currentTime } 
            },
            include: [
                {
                    model: Résztvevő,
                    where: {
                        userId: userId,
                        szerep: 'szervező'
                    },
                    attributes: [], 
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
                        'résztvevőkSzáma' 
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

const getParticipatedEvents = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Authentication token is required!" });
        }

        const decoded = jwt.verify(token, "secretkey");
        const userId = decoded.userId;
        const currentTime = new Date();

        const events = await Esemény.findAll({
            where: {
                zaroIdo: { [Op.gt]: currentTime } 
            },
            include: [
                {
                    model: Résztvevő,
                    where: {
                        userId: userId,
                        szerep: 'játékos',
                        státusz: 'elfogadva'
                    },
                    attributes: [], 
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
                        'résztvevőkSzáma' 
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

const getArchivedEvents = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Authentication token is required!" });
        }

        const decoded = jwt.verify(token, "secretkey");
        const userId = decoded.userId;

        const now = new Date();
        const thirtyOneDaysAgo = new Date();
        thirtyOneDaysAgo.setDate(thirtyOneDaysAgo.getDate() - 31);

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
                    attributes: ['szerep'], 
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
                        'résztvevőkSzáma' 
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

const getAllEsemenyWithDetails = async (req, res) => {
    try {
        const currentTime = new Date();

        const events = await Esemény.findAll({
            where: {
                zaroIdo: { [Op.gt]: currentTime } 
            },
            include: [
                {
                    model: Helyszin,
                    attributes: ['Nev', 'Telepules'] 
                },
                {
                    model: Sportok,
                    attributes: ['Nev', 'KepUrl']
                }
            ],
            attributes: ['id', 'kezdoIdo', 'zaroIdo', 'maximumLetszam', 'imageUrl'], 
            order: [['kezdoIdo', 'DESC']] 
        });

        if (events.length === 0) {
            return res.status(404).json({ message: "No events found." });
        }

        const eventIds = events.map(event => event.id);

        const participantCounts = await Résztvevő.findAll({
            attributes: [
                'eseményId',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            where: {
                eseményId: { [Op.in]: eventIds },
                státusz: 'elfogadva'
            },
            group: ['eseményId']
        });

        const countMap = {};
        participantCounts.forEach(item => {
            countMap[item.eseményId] = parseInt(item.getDataValue('count'));
        });

        const formattedEvents = events.map(event => ({
            esemenyId: event.id,
            kezdoIdo: event.kezdoIdo,
            zaroIdo: event.zaroIdo,
            helyszinNev: event.Helyszin.Nev,
            telepules: event.Helyszin.Telepules,
            sportNev: event.Sportok.Nev,
            sportKepUrl: event.Sportok.KepUrl,
            imageUrl: event.imageUrl, 
            resztvevoCount: countMap[event.id] || 0,
            maximumLetszam: event.maximumLetszam
        }));

        res.json({ events: formattedEvents });

    } catch (error) {
        console.error("Error fetching events with details:", error);
        res.status(500).json({ message: "Error fetching events", error: error.message });
    }
};

const removeParticipant = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Authentication token is required!" });
        }

        const decoded = jwt.verify(token, "secretkey");
        const userId = decoded.userId;

        const { eseményId, userId: participantId } = req.body;

        if (!eseményId || !participantId) {
            return res.status(400).json({ message: "Event ID and participant ID are required!" });
        }

        const esemény = await Esemény.findByPk(eseményId);
        if (!esemény) {
            return res.status(404).json({ message: "Event not found!" });
        }

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

        const participantToRemove = await Résztvevő.findOne({
            where: {
                eseményId: eseményId,
                userId: participantId
            }
        });

        if (!participantToRemove) {
            return res.status(404).json({ message: "Participant not found in this event!" });
        }

        if (participantToRemove.szerep === 'szervező') {
            return res.status(403).json({ message: "Organizers cannot be removed from the event!" });
        }

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

const getEventSearchData = async (req, res) => {
    try {
        const { id } = req.params;

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

const getAllEsemenyekFilteredByUserAge = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Authentication token is required!" });
        }

        const decoded = jwt.verify(token, "secretkey");
        const userId = decoded.userId;
        const currentTime = new Date();

        const user = await User.findByPk(userId);
        if (!user || !user.birthDate) {
            return res.status(400).json({ message: "User birth date is not available!" });
        }

        const birthDate = new Date(user.birthDate);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        const events = await Esemény.findAll({
            where: {
                minimumEletkor: { [Op.lte]: age },
                maximumEletkor: { [Op.gte]: age },
                zaroIdo: { [Op.gt]: currentTime } 
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

        if (events.length === 0) {
            return res.status(404).json({
                message: "No events found for your age range.",
                userAge: age
            });
        }

        res.json({
            events,
            userAge: age
        });
    } catch (error) {
        console.error("❌ Error fetching age-filtered events:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const getEsemenyekByTelepules = async (req, res) => {
    try {
        const { telepules } = req.params;
        const currentTime = new Date();

        if (!telepules) {
            return res.status(400).json({ message: "City (telepules) is required!" });
        }

        const events = await Esemény.findAll({
            where: {
                zaroIdo: { [Op.gt]: currentTime } 
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

        if (events.length === 0) {
            return res.status(404).json({ message: "No events found for the specified city." });
        }

        res.json({ events });
    } catch (error) {
        console.error("❌ Error fetching events by location:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const getEsemenyekBySportNev = async (req, res) => {
    try {
        const { sportNev } = req.params;
        const currentTime = new Date();

        if (!sportNev) {
            return res.status(400).json({ message: "Sport name (sportNev) is required!" });
        }

        const events = await Esemény.findAll({
            where: {
                zaroIdo: { [Op.gt]: currentTime } 
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

        if (events.length === 0) {
            return res.status(404).json({ message: "No events found for the specified sport." });
        }

        res.json({ events });
    } catch (error) {
        console.error("❌ Error fetching events by sport:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const getEsemenyekByTelepulesAndAge = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Authentication token is required!" });
        }

        const decoded = jwt.verify(token, "secretkey");
        const userId = decoded.userId;
        const currentTime = new Date();

        const user = await User.findByPk(userId);
        if (!user || !user.birthDate) {
            return res.status(400).json({ message: "User birth date is not available!" });
        }

        const birthDate = new Date(user.birthDate);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        const { telepules } = req.params;

        if (!telepules) {
            return res.status(400).json({ message: "City (telepules) is required!" });
        }

        const events = await Esemény.findAll({
            where: {
                minimumEletkor: { [Op.lte]: age },
                maximumEletkor: { [Op.gte]: age },
                zaroIdo: { [Op.gt]: currentTime } 
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

        if (events.length === 0) {
            return res.status(404).json({
                message: "No events found for the specified city and your age range.",
                userAge: age
            });
        }

        res.json({
            events,
            userAge: age
        });
    } catch (error) {
        console.error("❌ Error fetching age-filtered events by location:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const getEsemenyekBySportNevAndAge = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Authentication token is required!" });
        }

        const decoded = jwt.verify(token, "secretkey");
        const userId = decoded.userId;
        const currentTime = new Date();

        const user = await User.findByPk(userId);
        if (!user || !user.birthDate) {
            return res.status(400).json({ message: "User birth date is not available!" });
        }

        const birthDate = new Date(user.birthDate);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        const { sportNev } = req.params;

        if (!sportNev) {
            return res.status(400).json({ message: "Sport name (sportNev) is required!" });
        }

        const events = await Esemény.findAll({
            where: {
                minimumEletkor: { [Op.lte]: age },
                maximumEletkor: { [Op.gte]: age },
                zaroIdo: { [Op.gt]: currentTime } 
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

        if (events.length === 0) {
            return res.status(404).json({
                message: "No events found for the specified sport and your age range.",
                userAge: age
            });
        }

        res.json({
            events,
            userAge: age
        });
    } catch (error) {
        console.error("❌ Error fetching age-filtered events by sport:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const getPendingParticipants = async (req, res) => {
    try {
        const { id: eseményId } = req.params;
        const userId = req.user.userId;

        const esemény = await Esemény.findByPk(eseményId);
        if (!esemény) {
            return res.status(404).json({ message: "Event not found!" });
        }

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

        const pendingParticipants = await Résztvevő.findAll({
            where: {
                eseményId: eseményId,
                státusz: 'függőben' 
            },
            include: [
                {
                    model: User,
                    attributes: ['id', 'username', 'firstName', 'lastName', 'email', 'profilePicture', 'birthDate']
                }
            ]
        });

        const formattedParticipants = pendingParticipants.map(participant => {
            let age = null;
            if (participant.User.birthDate) {
                age = calculateAge(participant.User.birthDate);
            }

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


const approveParticipant = async (req, res) => {
    try {
        const { eseményId, userId: participantId } = req.body;
        const organizerId = req.user.userId;

        const esemény = await Esemény.findByPk(eseményId);
        if (!esemény) {
            return res.status(404).json({ message: "Event not found!" });
        }

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

        const currentParticipantCount = await Résztvevő.count({
            where: {
                eseményId: eseményId,
                státusz: 'elfogadva'
            }
        });

        if (currentParticipantCount >= esemény.maximumLetszam) {
            return res.status(400).json({ message: "Cannot approve participant: maximum number of participants reached!" });
        }

        await participant.update({ státusz: 'elfogadva' });

        const user = await User.findByPk(participantId, {
            attributes: ['id', 'username', 'firstName', 'lastName', 'email', 'profilePicture', 'birthDate']
        });

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

const rejectParticipant = async (req, res) => {
    try {
        const { eseményId, userId: participantId } = req.body;
        const organizerId = req.user.userId;

        const esemény = await Esemény.findByPk(eseményId);
        if (!esemény) {
            return res.status(404).json({ message: "Event not found!" });
        }

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

const inviteUserToEvent = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Authentication token is required!" });
        }

        const decoded = jwt.verify(token, "secretkey");
        const inviterId = decoded.userId;

        const { eseményId, invitedUserId } = req.body;

        const esemény = await Esemény.findByPk(eseményId);
        if (!esemény) {
            return res.status(404).json({ message: "Event not found!" });
        }

        const isParticipant = await Résztvevő.findOne({
            where: {
                eseményId: eseményId,
                userId: inviterId,
                státusz: 'elfogadva' 
            }
        });

        if (!isParticipant) {
            return res.status(403).json({ message: "Only participants can invite users!" });
        }

        const invitedUser = await User.findByPk(invitedUserId);
        if (!invitedUser) {
            return res.status(404).json({ message: "Invited user not found!" });
        }

        const existingParticipant = await Résztvevő.findOne({
            where: {
                eseményId: eseményId,
                userId: invitedUserId
            }
        });

        if (existingParticipant) {
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

const getUserInvitations = async (req, res) => {
    try {
        const userId = req.user.userId;

        const pendingInvitations = await Résztvevő.findAll({
            where: {
                userId: userId,
                státusz: 'meghívott' 
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

        const eventIds = pendingInvitations.map(invitation => invitation.Esemény.id);

        const participantCounts = await Résztvevő.findAll({
            attributes: [
                'eseményId',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            where: {
                eseményId: { [Op.in]: eventIds },
                státusz: 'elfogadva' 
            },
            group: ['eseményId']
        });

        const countMap = {};
        participantCounts.forEach(item => {
            countMap[item.eseményId] = parseInt(item.getDataValue('count'));
        });

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
                resztvevoStatus: invitation.státusz,
                resztvevoSzerep: invitation.szerep,
                resztvevoCount: countMap[event.id] || 0
            };
        });

        res.status(200).json({ events });
    } catch (error) {
        console.error("Hiba a meghívások lekérésekor:", error);
        res.status(500).json({ message: "Szerver hiba", error: error.message });
    }
};

const acceptInvitation = async (req, res) => {
    try {
        const { eseményId } = req.body;
        const userId = req.user.userId;

        

        if (!eseményId) {
            return res.status(400).json({ message: "Event ID is required!" });
        }

        const esemény = await Esemény.findByPk(eseményId);
        if (!esemény) {
            
            return res.status(404).json({ message: "Event not found!" });
        }

        

        let invitation = await Résztvevő.findOne({
            where: {
                eseményId: eseményId,
                userId: userId,
                státusz: 'meghívott' 
            }
        });

        if (!invitation) {
           
            invitation = await Résztvevő.findOne({
                where: {
                    eseményId: eseményId,
                    userId: userId
                }
            });

            if (invitation) {
                
                if (invitation.státusz === 'elfogadva') {
                    return res.status(200).json({
                        message: "You are already a participant of this event!",
                        alreadyAccepted: true
                    });
                }
            }
        }

        if (!invitation) {
            

            const eventExists = await Esemény.findByPk(eseményId);
            const userExists = await User.findByPk(userId);

            

            const anyParticipants = await Résztvevő.findAll({
                where: { eseményId: eseményId }
            });

            

            const newParticipant = await Résztvevő.create({
                eseményId,
                userId,
                szerep: 'játékos',
                státusz: 'függőben',
                csatlakozásDátuma: new Date()
            });

            
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

        

        const currentParticipantCount = await Résztvevő.count({
            where: {
                eseményId: eseményId,
                státusz: 'elfogadva'
            }
        });

        

        if (currentParticipantCount >= esemény.maximumLetszam) {
            return res.status(400).json({ message: "Event is already full!" });
        }

        if (invitation.státusz === 'meghívott') {
            await invitation.update({ státusz: 'függőben' });
            

            return res.status(200).json({
                message: "Csatlakozási kérelem elküldve",
                status: 'függőben'
            });
        }

        const isOrganizer = await Résztvevő.findOne({
            where: {
                eseményId: eseményId,
                userId: userId,
                szerep: 'szervező'
            }
        });

        if (isOrganizer) {
            await invitation.update({ státusz: 'elfogadva' });
            

            return res.status(200).json({
                message: "Invitation accepted successfully!",
                status: 'elfogadva'
            });
        } else {
            

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


const rejectInvitation = async (req, res) => {
    try {
        const { eseményId } = req.body;
        const userId = req.user.userId;

        

        if (!eseményId) {
            return res.status(400).json({ message: "Event ID is required!" });
        }

        const esemény = await Esemény.findByPk(eseményId);
        if (!esemény) {
            
            return res.status(404).json({ message: "Event not found!" });
        }

        

        let invitation = await Résztvevő.findOne({
            where: {
                eseményId: eseményId,
                userId: userId
            }
        });

        if (!invitation) {
           
            const eventExists = await Esemény.findByPk(eseményId);
            const userExists = await User.findByPk(userId);

           

            return res.status(404).json({ message: "Invitation not found!" });
        }

        

        await invitation.destroy();
        

        res.status(200).json({
            message: "Invitation rejected successfully!"
        });
    } catch (error) {
        console.error("Error rejecting invitation:", error);
        res.status(500).json({ message: "Error rejecting invitation", error: error.message });
    }
};

const inviteUsersToEvent = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Authentication token is required!" });
        }

        const decoded = jwt.verify(token, "secretkey");
        const inviterId = decoded.userId;

        const { eseményId, userIds, status } = req.body;

        

        if (!eseményId || !userIds || !Array.isArray(userIds) || userIds.length === 0) {
            return res.status(400).json({ message: "Event ID and at least one user ID are required!" });
        }

        const esemény = await Esemény.findByPk(eseményId);
        if (!esemény) {
            return res.status(404).json({ message: "Event not found!" });
        }

        const isParticipant = await Résztvevő.findOne({
            where: {
                eseményId: eseményId,
                userId: inviterId,
                státusz: 'elfogadva'
            }
        });

        if (!isParticipant) {
            return res.status(403).json({ message: "Only participants can invite users to events!" });
        }

        const results = [];
        for (const invitedUserId of userIds) {
            try {
                const invitedUser = await User.findByPk(invitedUserId);
                if (!invitedUser) {
                    results.push({ userId: invitedUserId, status: 'error', message: "User not found" });
                    continue;
                }

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
                        await existingParticipant.update({
                            státusz: 'meghívott', 
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


        const esemény = await Esemény.findByPk(eseményId);
        if (!esemény) {
            return res.status(404).json({ message: "Event not found!" });
        }

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

        const invitations = await Résztvevő.findAll({
            where: {
                eseményId: eseményId,
                státusz: {
                    [Op.ne]: 'elutasítva' 
                }
            },
            include: [
                {
                    model: User,
                    attributes: ['id', 'username', 'firstName', 'lastName', 'email', 'profilePicture', 'birthDate']
                }
            ]
        });

        const formattedInvitations = invitations.map(invitation => {
            let age = null;
            if (invitation.User.birthDate) {
                age = calculateAge(invitation.User.birthDate);
            }

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

        const esemény = await Esemény.findByPk(eseményId);
        if (!esemény) {
            return res.status(404).json({ message: "Event not found!" });
        }

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

        const offset = (page - 1) * limit;

        let whereConditions = {
            id: { [Op.ne]: currentUserId } 
        };

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

        const participants = await Résztvevő.findAll({
            where: { eseményId: eseményId },
            attributes: ['userId']
        });

        const participantIds = participants.map(p => p.userId);
        const excludedUserIds = [...new Set([...participantIds, currentUserId])];

        whereConditions.id = { [Op.notIn]: excludedUserIds };

        const users = await User.findAll({
            where: whereConditions,
            attributes: ['id', 'username', 'firstName', 'lastName', 'email', 'profilePicture', 'birthDate'],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['username', 'ASC']]
        });

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
                ageInRange: age !== null ? (age >= minAge && age <= maxAge) : false
            };
        }).filter(user => user.ageInRange);

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

        const esemény = await Esemény.findByPk(eseményId);
        if (!esemény) {
            return res.status(404).json({ message: "Event not found!" });
        }

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

const getPendingEvents = async (req, res) => {
    try {
        const userId = req.user.userId;

        const pendingEvents = await Résztvevő.findAll({
            where: {
                userId: userId,
                státusz: 'függőben'  
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

        if (pendingEvents.length === 0) {
            return res.status(404).json({ message: "Nincsenek függőben lévő eseményeid." });
        }

        const eventIds = pendingEvents.map(pending => pending.Esemény.id);
        const participantCounts = await Résztvevő.findAll({
            attributes: [
                'eseményId',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            where: {
                eseményId: { [Op.in]: eventIds },
                státusz: 'elfogadva' 
            },
            group: ['eseményId']
        });

        const countMap = {};
        participantCounts.forEach(item => {
            countMap[item.eseményId] = parseInt(item.getDataValue('count'));
        });
a
        const events = pendingEvents.map(pending => {
            const event = pending.Esemény;
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
                resztvevoStatus: pending.státusz,
                resztvevoSzerep: pending.szerep,
                resztvevoCount: countMap[event.id] || 0
            };
        });

        res.status(200).json({ events });
    } catch (error) {
        console.error("Hiba a függőben lévő események lekérésekor:", error);
        res.status(500).json({ message: "Szerver hiba", error: error.message });
    }
};

const cancelPendingRequest = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { eseményId } = req.body;

        if (!eseményId) {
            return res.status(400).json({ message: "Hiányzó esemény azonosító" });
        }

        const pendingRequest = await Résztvevő.findOne({
            where: {
                userId: userId,
                eseményId: eseményId,
                státusz: 'függőben'
            }
        });

        if (!pendingRequest) {
            return res.status(404).json({ message: "Nem található függőben lévő kérelem ehhez az eseményhez" });
        }

        await pendingRequest.destroy();

        res.status(200).json({ message: "Jelentkezés sikeresen visszavonva" });
    } catch (error) {
        console.error("Hiba a függőben lévő kérelem visszavonásakor:", error);
        res.status(500).json({ message: "Szerver hiba", error: error.message });
    }
};

const addPendingEventId = (eventId) => {
    const pendingEvents = JSON.parse(sessionStorage.getItem('pendingEvents') || '[]');

    if (!pendingEvents.includes(eventId)) {
      pendingEvents.push(eventId);
      sessionStorage.setItem('pendingEvents', JSON.stringify(pendingEvents));
    }
  };

  const removePendingEventId = (eventId) => {
    const pendingEvents = JSON.parse(sessionStorage.getItem('pendingEvents') || '[]');
    
    const updatedEvents = pendingEvents.filter(id => id !== eventId);
    sessionStorage.setItem('pendingEvents', JSON.stringify(updatedEvents));
  };
  
  const isEventPending = (eventId) => {
    const pendingEvents = JSON.parse(sessionStorage.getItem('pendingEvents') || '[]');
    return pendingEvents.includes(eventId);
  };

const getEsemenyekFilteredByUserAgeOrOrganizer = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Authentication token is required!" });
        }

        const decoded = jwt.verify(token, "secretkey");
        const userId = decoded.userId;
        const currentTime = new Date();

        const user = await User.findByPk(userId);
        if (!user || !user.birthDate) {
            return res.status(400).json({ message: "User birth date is not available!" });
        }

        const birthDate = new Date(user.birthDate);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        const organizerEvents = await Résztvevő.findAll({
            where: {
                userId: userId,
                szerep: 'szervező',
                státusz: 'elfogadva'
            },
            attributes: ['eseményId']
        });

        const organizerEventIds = organizerEvents.map(event => event.eseményId);

        const allEvents = await Esemény.findAll({
            where: {
                zaroIdo: { [Op.gt]: currentTime } 
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

        const filteredEvents = allEvents.filter(event => {
            if (organizerEventIds.includes(event.id)) {
                return true;
            }

            return age >= event.minimumEletkor && age <= event.maximumEletkor;
        });

        if (filteredEvents.length === 0) {
            return res.status(404).json({
                message: "No events found for your age range or where you are organizer.",
                userAge: age
            });
        }

        res.json({
            events: filteredEvents,
            userAge: age
        });
    } catch (error) {
        console.error("❌ Error fetching age-filtered events:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const getEsemenyekByTelepulesAndSportNevAndAgeOrOrganizer = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Authentication token is required!" });
        }

        const decoded = jwt.verify(token, "secretkey");
        const userId = decoded.userId;
        const currentTime = new Date();

        const user = await User.findByPk(userId);
        if (!user || !user.birthDate) {
            return res.status(400).json({ message: "User birth date is not available!" });
        }

        const birthDate = new Date(user.birthDate);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        const { telepules, sportNev } = req.params;

        if (!telepules || !sportNev) {
            return res.status(400).json({ message: "Both city (telepules) and sport name (sportNev) are required!" });
        }

        const organizerEvents = await Résztvevő.findAll({
            where: {
                userId: userId,
                szerep: 'szervező',
                státusz: 'elfogadva'
            },
            attributes: ['eseményId']
        });

        const organizerEventIds = organizerEvents.map(event => event.eseményId);

        const events = await Esemény.findAll({
            where: {
                zaroIdo: { [Op.gt]: currentTime } 
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

        const filteredEvents = events.filter(event => {
            if (organizerEventIds.includes(event.id)) {
                return true;
            }

            return age >= event.minimumEletkor && age <= event.maximumEletkor;
        });

        if (filteredEvents.length === 0) {
            return res.status(404).json({
                message: "No events found for the specified city, sport, and your age range or where you are organizer.",
                userAge: age
            });
        }

        res.json({
            events: filteredEvents,
            userAge: age
        });
    } catch (error) {
        console.error("❌ Error fetching age-filtered events:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const getEsemenyekByTelepulesAndAgeOrOrganizer = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Authentication token is required!" });
        }

        const decoded = jwt.verify(token, "secretkey");
        const userId = decoded.userId;
        const currentTime = new Date();

        const user = await User.findByPk(userId);
        if (!user || !user.birthDate) {
            return res.status(400).json({ message: "User birth date is not available!" });
        }

        const birthDate = new Date(user.birthDate);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        const { telepules } = req.params;

        if (!telepules) {
            return res.status(400).json({ message: "City (telepules) is required!" });
        }

        const organizerEvents = await Résztvevő.findAll({
            where: {
                userId: userId,
                szerep: 'szervező',
                státusz: 'elfogadva'
            },
            attributes: ['eseményId']
        });

        const organizerEventIds = organizerEvents.map(event => event.eseményId);

        const events = await Esemény.findAll({
            where: {
                zaroIdo: { [Op.gt]: currentTime } 
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

        const filteredEvents = events.filter(event => {
            if (organizerEventIds.includes(event.id)) {
                return true;
            }

            return age >= event.minimumEletkor && age <= event.maximumEletkor;
        });

        if (filteredEvents.length === 0) {
            return res.status(404).json({
                message: "No events found for the specified city and your age range or where you are organizer.",
                userAge: age
            });
        }

        res.json({
            events: filteredEvents,
            userAge: age
        });
    } catch (error) {
        console.error("❌ Error fetching age-filtered events by location:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const getEsemenyekBySportNevAndAgeOrOrganizer = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Authentication token is required!" });
        }

        const decoded = jwt.verify(token, "secretkey");
        const userId = decoded.userId;
        const currentTime = new Date();

        const user = await User.findByPk(userId);
        if (!user || !user.birthDate) {
            return res.status(400).json({ message: "User birth date is not available!" });
        }

        const birthDate = new Date(user.birthDate);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        const { sportNev } = req.params;

        if (!sportNev) {
            return res.status(400).json({ message: "Sport name (sportNev) is required!" });
        }

        const organizerEvents = await Résztvevő.findAll({
            where: {
                userId: userId,
                szerep: 'szervező',
                státusz: 'elfogadva'
            },
            attributes: ['eseményId']
        });

        const organizerEventIds = organizerEvents.map(event => event.eseményId);

        const events = await Esemény.findAll({
            where: {
                zaroIdo: { [Op.gt]: currentTime } 
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

        const filteredEvents = events.filter(event => {
            if (organizerEventIds.includes(event.id)) {
                return true;
            }
            
            return age >= event.minimumEletkor && age <= event.maximumEletkor;
        });

        if (filteredEvents.length === 0) {
            return res.status(404).json({
                message: "No events found for the specified sport and your age range or where you are organizer.",
                userAge: age
            });
        }

        res.json({
            events: filteredEvents,
            userAge: age
        });
    } catch (error) {
        console.error("❌ Error fetching age-filtered events by sport:", error);
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
    inviteUserToEvent,
    inviteUsersToEvent,
    getUserInvitations,
    acceptInvitation,
    rejectInvitation,
    getAllEventInvitations,
    searchUsersForEvent,
    getPendingEvents,
    cancelPendingRequest,
    addPendingEventId,
    removePendingEventId,
    isEventPending,
    getEsemenyekFilteredByUserAgeOrOrganizer,
    getEsemenyekByTelepulesAndSportNevAndAgeOrOrganizer,
    getEsemenyekByTelepulesAndAgeOrOrganizer,
    getEsemenyekBySportNevAndAgeOrOrganizer
};