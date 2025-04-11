const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const Esemény = require("../models/esemenyModel");
const Résztvevő = require("../models/resztvevoModel");
const { Op } = require("sequelize");


const createUser = async (req, res) => {
    try {
        const { email, password, username, phone, firstName, lastName, birthDate } = req.body;

        if (!email || !password || !username) {
            return res.status(400).json({ message: "Hiányoznak a kötelező mezők!" });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                message: "Érvénytelen email formátum!"
            });
        }

        if (password.length < 10 || password.length > 25) {
            return res.status(400).json({
                message: "A jelszó 10-25 karakter hosszú lehet!"
            });
        }

        const hasLowerCase = /[a-z]/.test(password);
        const hasUpperCase = /[A-Z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

        if (!hasLowerCase || !hasUpperCase || !hasNumber || !hasSpecialChar) {
            return res.status(400).json({
                message: "A jelszónak tartalmaznia kell kisbetűt, nagybetűt, számot és speciális karaktert!"
            });
        }

        if (username.length < 4 || username.length > 16) {
            return res.status(400).json({
                message: "A felhasználónév 4-16 karakter hosszú lehet!"
            });
        }

        if (!/^[a-zA-Z0-9]+$/.test(username)) {
            return res.status(400).json({
                message: "A felhasználónév csak betűket és számokat tartalmazhat!"
            });
        }

        if (phone) {
            const phoneRegex = /^(\+36|06)[ -]?(1|20|30|31|50|70)[ -]?(\d{3}[ -]?\d{4}|\d{2}[ -]?\d{2}[ -]?\d{3})$/;
            if (!phoneRegex.test(phone)) {
                return res.status(400).json({
                    message: "Érvénytelen magyar telefonszám formátum! Példák: +36201234567, 06-30-123-4567"
                });
            }
        }

        if (firstName) {
            if (firstName.length < 2 || firstName.length > 15) {
                return res.status(400).json({
                    message: "A keresztnév 2-15 karakter hosszú lehet!"
                });
            }

            if (!/^[a-zA-ZáéíóöőúüűÁÉÍÓÖŐÚÜŰ]+$/.test(firstName)) {
                return res.status(400).json({
                    message: "A keresztnév csak betűket tartalmazhat!"
                });
            }
        }

        if (lastName) {
            if (lastName.length < 2 || lastName.length > 15) {
                return res.status(400).json({
                    message: "A családnév 2-15 karakter hosszú lehet!"
                });
            }

            if (!/^[a-zA-ZáéíóöőúüűÁÉÍÓÖŐÚÜŰ]+$/.test(lastName)) {
                return res.status(400).json({
                    message: "A családnév csak betűket tartalmazhat!"
                });
            }
        }

        if (birthDate) {
            const birthDateObj = new Date(birthDate);
            const today = new Date();

            let age = today.getFullYear() - birthDateObj.getFullYear();
            const m = today.getMonth() - birthDateObj.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDateObj.getDate())) {
                age--;
            }

            if (age < 6) {
                return res.status(400).json({
                    message: "A felhasználónak legalább 6 évesnek kell lennie!"
                });
            }
            if (age > 100) {
                return res.status(400).json({
                    message: "A felhasználó nem lehet 100 évnél idősebb!"
                });
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const defaultProfilePicture = "https://media.istockphoto.com/id/526947869/vector/man-silhouette-profile-picture.jpg?s=612x612&w=0&k=20&c=5I7Vgx_U6UPJe9U2sA2_8JFF4grkP7bNmDnsLXTYlSc=";

        const newUser = await User.create({
            email,
            password: hashedPassword,
            username,
            phone,
            firstName,
            lastName,
            birthDate,
            profilePicture: defaultProfilePicture 
        });

        res.status(201).json({ message: "Felhasználó sikeresen létrehozva!", user: newUser });
    } catch (error) {
        if (error.name === 'SequelizeValidationError') {
            const validationErrors = error.errors.map(err => err.message);
            return res.status(400).json({
                message: "Érvényesítési hiba",
                errors: validationErrors
            });
        }

        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({
                message: "A megadott felhasználónév vagy email cím már foglalt!"
            });
        }

        res.status(500).json({ message: "Hiba történt a felhasználó létrehozásakor", error: error.message });
    }
};


const authenticateUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: "Hiányzó adatok!" });

        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(401).json({ message: "Érvénytelen e-mail cím vagy jelszó!" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: "Érvénytelen e-mail cím vagy jelszó!" });

        const token = jwt.sign({
            userId: user.id,
            email: user.email,
            name: user.username 
        }, "secretkey", { expiresIn: "1h" });

        res.json({
            message: "Sikeres bejelentkezés!",
            token,
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Error during authentication", error });
    }
};

const getUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id, {
            attributes: {
                exclude: ["password"],
                include: ["profileBackground", "customBackground", "profilePicture"]
            }
        });

        if (!user) return res.status(404).json({ message: "User not found!" });

        res.json(user);
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ message: "Error fetching user", error });
    }
};

const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        if (updates.password) {
            updates.password = await bcrypt.hash(updates.password, 10);
        }

        const [updated] = await User.update(updates, { where: { id } });
        if (!updated) return res.status(404).json({ message: "User not found!" });

        res.json({ message: "User updated successfully!" });
    } catch (error) {
        res.status(500).json({ message: "Error updating user", error });
    }
};

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;


        if (req.user.userId != id) {
            return res.status(403).json({ message: "Nincs jogosultságod más felhasználó törlésére!" });
        }

        const Esemény = require("../models/esemenyModel");
        const Résztvevő = require("../models/resztvevoModel");
        const Helyszin = require("../models/helyszinModel");

        const userEvents = await Esemény.findAll({ where: { userId: id } });

        const userEventIds = userEvents.map(event => event.id);

        if (userEventIds.length > 0) {
            await Résztvevő.destroy({
                where: {
                    eseményId: userEventIds
                }
            });
        }

        if (userEvents.length > 0) {
            await Esemény.destroy({ where: { userId: id } });
        }

        await Résztvevő.destroy({ where: { userId: id } });

        const userLocations = await Helyszin.findAll({ where: { userId: id } });

        if (userLocations.length > 0) {
            const locationIds = userLocations.map(location => location.Id);

            const eventsUsingLocations = await Esemény.findAll({
                where: {
                    helyszinId: locationIds,
                    userId: { [Op.ne]: id }
                }
            });

            if (eventsUsingLocations.length > 0) {
                await Helyszin.update(
                    { userId: null },
                    { where: { userId: id } }
                );
            } else {
                await Helyszin.destroy({ where: { userId: id } });
            }
        }

        const deleted = await User.destroy({ where: { id } });

        if (!deleted) return res.status(404).json({ message: "User not found!" });

        res.json({
            message: "User and related data deleted successfully!",
            deletedEvents: userEvents.length,
            deletedLocations: userLocations.length
        });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ message: "Error deleting user", error: error.message });
    }
};

const createEsemeny = async (req, res) => {
    try {

        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Authentication token is required!" });
        }

        const decoded = jwt.verify(token, "secretkey"); 
        const userId = decoded.userId;

        const { helyszinId, sportId, kezdoIdo, zaroIdo, szint, minimumEletkor, maximumEletkor, maximumLetszam } = req.body;

        if (!helyszinId || !sportId || !kezdoIdo || !zaroIdo || !szint || !minimumEletkor || !maximumEletkor || !maximumLetszam) {
            return res.status(400).json({ message: "Hiányoznak a kötelező mezők az esemény létrehozásához!" });
        }

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
        });

        res.status(201).json({ message: "Event created successfully!", esemeny: newEsemény });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error creating event", error });
    }
};

const getUserSettings = async (req, res) => {
    try {
        const { id } = req.params;

        if (req.user.userId != id) {
            return res.status(403).json({ message: "Unauthorized to access these settings" });
        }

        const user = await User.findByPk(id, {
            attributes: ['id', 'profileBackground', 'customBackground', 'profilePicture']
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(user);
    } catch (error) {
        console.error("Error fetching user settings:", error);
        res.status(500).json({ message: "Error fetching user settings", error: error.message });
    }
};

const saveUserSettings = async (req, res) => {
    try {
        const { id } = req.params;
        const { profileBackground, customBackground, profilePicture } = req.body;

        if (req.user.userId != id) {
            return res.status(403).json({ message: "Unauthorized to modify these settings" });
        }

        if (profilePicture && profilePicture.length > 1000000) {
            return res.status(400).json({
                message: "A profilkép túl nagy méretű. Kérjük, használjon kisebb képet (max 1MB)."
            });
        }

        if (customBackground && customBackground.length > 1000000) { 
            return res.status(400).json({
                message: "A háttérkép túl nagy méretű. Kérjük, használjon kisebb képet (max 1MB)."
            });
        }
        const user = await User.findByPk(id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const updates = {};
        if (profileBackground !== undefined) updates.profileBackground = profileBackground;
        if (customBackground !== undefined) updates.customBackground = customBackground;
        if (profilePicture !== undefined) updates.profilePicture = profilePicture;

        await User.update(updates, { where: { id } });

        const updatedUser = await User.findByPk(id, {
            attributes: ['id', 'profileBackground', 'customBackground', 'profilePicture']
        });

        res.json({
            message: "User settings updated successfully",
            settings: updatedUser
        });
    } catch (error) {
        console.error("Error saving user settings:", error);
        res.status(500).json({ message: "Error saving user settings", error: error.message });
    }
};

const getUserStats = async (req, res) => {
    try {
        const userId = req.params.userId;

        const createdEvents = await Esemény.count({
            where: { userId: userId }
        });

        const participatedEvents = await Résztvevő.count({
            where: {
                userId: userId,
                szerep: 'játékos',
                státusz: 'elfogadva'
            }
        });

        res.status(200).json({
            createdEvents,
            participatedEvents
        });
    } catch (error) {
        console.error('Hiba a felhasználói statisztikák lekérésekor:', error);
        res.status(500).json({ message: 'Szerver hiba történt a statisztikák lekérésekor' });
    }
};

const listAllUsers = async (req, res) => {
    try {
        const currentUserId = req.user.userId;

        const users = await User.findAll({
            where: {
                id: { [Op.ne]: currentUserId } 
            },
            attributes: ['id', 'username', 'profilePicture']
        });

        const formattedUsers = users.map(user => ({
            id: user.id,
            username: user.username,
            profilePicture: user.profilePicture 
        }));

        res.status(200).json({ users: formattedUsers });
    } catch (error) {
        console.error("Error listing users:", error);
        res.status(500).json({ message: "Error listing users", error: error.message });
    }
};

const searchUsers = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Authentication token is required!" });
        }

        const decoded = jwt.verify(token, "secretkey");
        const currentUserId = decoded.userId;

        const { query, limit = 10, page = 1, excludeEvent, minAge, maxAge } = req.query;

        if (!query || query.length < 2) {
            return res.status(400).json({ message: "A keresésnek legalább 2 karakter hosszúnak kell lennie!" });
        }

        const offset = (page - 1) * limit;

        const whereConditions = {
            [Op.or]: [
                { username: { [Op.like]: `%${query}%` } },
                { firstName: { [Op.like]: `%${query}%` } },
                { lastName: { [Op.like]: `%${query}%` } },
                { email: { [Op.like]: `%${query}%` } }
            ],
            id: { [Op.ne]: currentUserId }
        };

        let excludedUserIds = [currentUserId]; 

        if (excludeEvent) {
            const participants = await Résztvevő.findAll({
                where: { eseményId: excludeEvent },
                attributes: ['userId']
            });

            const participantIds = participants.map(p => p.userId);
            excludedUserIds = [...excludedUserIds, ...participantIds];

            whereConditions.id = { [Op.notIn]: excludedUserIds };
        }

        const users = await User.findAndCountAll({
            where: whereConditions,
            attributes: ['id', 'username', 'firstName', 'lastName', 'email', 'profilePicture', 'birthDate'],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['username', 'ASC']]
        });

        const usersWithAge = users.rows.map(user => {
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
                age: age
            };
        });

        let filteredUsers = usersWithAge;
        if (minAge !== undefined && maxAge !== undefined) {
            filteredUsers = usersWithAge.filter(user => {
                if (user.age === null) return false; 
                return user.age >= parseInt(minAge) && user.age <= parseInt(maxAge);
            });
        }

        res.status(200).json({
            users: filteredUsers,
            total: filteredUsers.length,
            page: parseInt(page),
            totalPages: Math.ceil(filteredUsers.length / limit),
            limit: parseInt(limit)
        });

    } catch (error) {
        console.error("Error searching users:", error);
        res.status(500).json({ message: "Error searching users", error: error.message });
    }
};

module.exports = {
    createUser,
    authenticateUser,
    getUser,
    updateUser,
    deleteUser,
    createEsemeny,
    getUserSettings,
    saveUserSettings,
    getUserStats,
    listAllUsers,
    searchUsers  // Add the new function to exports
};