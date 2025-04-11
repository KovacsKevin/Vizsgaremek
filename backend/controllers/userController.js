const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const Esemény = require("../models/esemenyModel");
const Résztvevő = require("../models/resztvevoModel");
const { Op } = require("sequelize");


// Csak a createUser függvényt módosítom, a többi marad változatlan

// Create User
const createUser = async (req, res) => {
    try {
        const { email, password, username, phone, firstName, lastName, birthDate } = req.body;

        // Ellenőrizzük a kötelező mezőket
        if (!email || !password || !username) {
            return res.status(400).json({ message: "Hiányoznak a kötelező mezők!" });
        }

        // Email validáció
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                message: "Érvénytelen email formátum!"
            });
        }

        // Jelszó validáció
        if (password.length < 10 || password.length > 25) {
            return res.status(400).json({
                message: "A jelszó 10-25 karakter hosszú lehet!"
            });
        }

        // Jelszó komplexitás ellenőrzése
        const hasLowerCase = /[a-z]/.test(password);
        const hasUpperCase = /[A-Z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

        if (!hasLowerCase || !hasUpperCase || !hasNumber || !hasSpecialChar) {
            return res.status(400).json({
                message: "A jelszónak tartalmaznia kell kisbetűt, nagybetűt, számot és speciális karaktert!"
            });
        }

        // Felhasználónév validáció
        if (username.length < 4 || username.length > 16) {
            return res.status(400).json({
                message: "A felhasználónév 4-16 karakter hosszú lehet!"
            });
        }

        // Csak betűk és számok ellenőrzése regex-szel
        if (!/^[a-zA-Z0-9]+$/.test(username)) {
            return res.status(400).json({
                message: "A felhasználónév csak betűket és számokat tartalmazhat!"
            });
        }

        // Telefonszám validáció (ha meg van adva)
        if (phone) {
            const phoneRegex = /^(\+36|06)[ -]?(1|20|30|31|50|70)[ -]?(\d{3}[ -]?\d{4}|\d{2}[ -]?\d{2}[ -]?\d{3})$/;
            if (!phoneRegex.test(phone)) {
                return res.status(400).json({
                    message: "Érvénytelen magyar telefonszám formátum! Példák: +36201234567, 06-30-123-4567"
                });
            }
        }

        // Keresztnév validáció (ha meg van adva)
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

        // Családnév validáció (ha meg van adva)
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

        // Születési dátum validáció
        if (birthDate) {
            const birthDateObj = new Date(birthDate);
            const today = new Date();

            // Életkor kiszámítása
            let age = today.getFullYear() - birthDateObj.getFullYear();
            const m = today.getMonth() - birthDateObj.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDateObj.getDate())) {
                age--;
            }

            // Ellenőrzés: 6-100 év közötti életkor
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

        // Default profile picture URL
        const defaultProfilePicture = "https://media.istockphoto.com/id/526947869/vector/man-silhouette-profile-picture.jpg?s=612x612&w=0&k=20&c=5I7Vgx_U6UPJe9U2sA2_8JFF4grkP7bNmDnsLXTYlSc=";

        // Creating new user with profile picture
        const newUser = await User.create({
            email,
            password: hashedPassword,
            username,
            phone,
            firstName,
            lastName,
            birthDate,
            profilePicture: defaultProfilePicture // Add default profile picture here
        });

        res.status(201).json({ message: "Felhasználó sikeresen létrehozva!", user: newUser });
    } catch (error) {
        // Sequelize validációs hibák kezelése
        if (error.name === 'SequelizeValidationError') {
            const validationErrors = error.errors.map(err => err.message);
            return res.status(400).json({
                message: "Érvényesítési hiba",
                errors: validationErrors
            });
        }

        // Egyedi mezők megsértése (pl. már létező felhasználónév vagy email)
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({
                message: "A megadott felhasználónév vagy email cím már foglalt!"
            });
        }

        res.status(500).json({ message: "Hiba történt a felhasználó létrehozásakor", error: error.message });
    }
};






// Authenticate User (Login)
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
            name: user.username // Hozzáadva a felhasználónév a tokenhez
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

// Get User by ID - módosított verzió
const getUser = async (req, res) => {
    try {
        const { id } = req.params;
        // Explicit módon kérjük le a képmezőket is
        const user = await User.findByPk(id, {
            attributes: {
                exclude: ["password"],
                include: ["profileBackground", "customBackground", "profilePicture"]
            }
        });

        if (!user) return res.status(404).json({ message: "User not found!" });

        console.log(`Felhasználó adatok lekérve: userId=${id}`, {
            hasProfilePicture: !!user.profilePicture,
            hasCustomBackground: !!user.customBackground,
            profileBackground: user.profileBackground
        });

        res.json(user);
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ message: "Error fetching user", error });
    }
};

// Update User
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

// Csak a deleteUser függvényt frissítjük, a többi marad változatlan

// Delete User - updated version with complete cleanup
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Verify that the token owner is deleting their own account
        if (req.user.userId != id) {
            return res.status(403).json({ message: "Nincs jogosultságod más felhasználó törlésére!" });
        }

        // Import all required models
        const Esemény = require("../models/esemenyModel");
        const Résztvevő = require("../models/resztvevoModel");
        const Helyszin = require("../models/helyszinModel");

        // First, get all events where the user is the organizer
        const userEvents = await Esemény.findAll({ where: { userId: id } });

        // Get all event IDs created by the user
        const userEventIds = userEvents.map(event => event.id);

        // First, delete all participants from events created by the user
        if (userEventIds.length > 0) {
            console.log(`Deleting participants from ${userEventIds.length} events created by user ${id}`);
            await Résztvevő.destroy({
                where: {
                    eseményId: userEventIds
                }
            });
        }

        // Then delete all events created by the user
        if (userEvents.length > 0) {
            console.log(`Deleting ${userEvents.length} events created by user ${id}`);
            await Esemény.destroy({ where: { userId: id } });
        }

        // Remove user from all events they're participating in
        await Résztvevő.destroy({ where: { userId: id } });

        // Get all locations created by the user
        const userLocations = await Helyszin.findAll({ where: { userId: id } });

        // Check if any of these locations are used in events by other users
        if (userLocations.length > 0) {
            const locationIds = userLocations.map(location => location.Id);

            // Find events that use these locations but weren't created by this user
            const eventsUsingLocations = await Esemény.findAll({
                where: {
                    helyszinId: locationIds,
                    userId: { [Op.ne]: id } // Not equal to this user's ID
                }
            });

            if (eventsUsingLocations.length > 0) {
                // There are events by other users using this user's locations
                // We need to handle this case - for now, we'll set the location's userId to null
                // rather than deleting the locations
                await Helyszin.update(
                    { userId: null },
                    { where: { userId: id } }
                );
            } else {
                // No other users are using these locations, so we can delete them
                await Helyszin.destroy({ where: { userId: id } });
            }
        }

        // Finally, delete the user
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





// Create Esemény (Event)
const createEsemeny = async (req, res) => {
    try {
        // Get the token from the Authorization header
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Authentication token is required!" });
        }

        // Verify the token and decode it
        const decoded = jwt.verify(token, "secretkey"); // The same secret key used during login
        const userId = decoded.userId;

        // Extract event details from the request body
        const { helyszinId, sportId, kezdoIdo, zaroIdo, szint, minimumEletkor, maximumEletkor, maximumLetszam } = req.body;

        if (!helyszinId || !sportId || !kezdoIdo || !zaroIdo || !szint || !minimumEletkor || !maximumEletkor || !maximumLetszam) {
            return res.status(400).json({ message: "Hiányoznak a kötelező mezők az esemény létrehozásához!" });
        }

        // Create a new event (Esemény) and associate it with the userId from the token
        const newEsemény = await Esemény.create({
            helyszinId,
            sportId,
            kezdoIdo,
            zaroIdo,
            szint,
            minimumEletkor,
            maximumEletkor,
            maximumLetszam,
            userId,  // The userId extracted from the token
        });

        res.status(201).json({ message: "Event created successfully!", esemeny: newEsemény });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error creating event", error });
    }
};

// Új függvények a felhasználói beállítások kezeléséhez

// Felhasználói beállítások lekérése - javított verzió
const getUserSettings = async (req, res) => {
    try {
        const { id } = req.params;

        // Ellenőrizzük, hogy a token tulajdonosa kéri-e a saját adatait
        if (req.user.userId != id) {
            return res.status(403).json({ message: "Unauthorized to access these settings" });
        }

        console.log(`Felhasználói beállítások lekérése: userId=${id}`);

        // Explicit módon lekérjük a szükséges mezőket
        const user = await User.findByPk(id, {
            attributes: ['id', 'profileBackground', 'customBackground', 'profilePicture']
        });

        if (!user) {
            console.log(`Felhasználó nem található: userId=${id}`);
            return res.status(404).json({ message: "User not found" });
        }

        console.log(`Felhasználói beállítások sikeresen lekérve: userId=${id}`, {
            profileBackground: user.profileBackground,
            hasCustomBackground: !!user.customBackground,
            hasProfilePicture: !!user.profilePicture
        });

        // Közvetlenül adjuk vissza a user objektumot
        res.json(user);
    } catch (error) {
        console.error("Error fetching user settings:", error);
        res.status(500).json({ message: "Error fetching user settings", error: error.message });
    }
};

// Profilkép mentése előtt méret ellenőrzés
const saveUserSettings = async (req, res) => {
    try {
        const { id } = req.params;
        const { profileBackground, customBackground, profilePicture } = req.body;

        // Ellenőrizzük, hogy a token tulajdonosa módosítja-e a saját adatait
        if (req.user.userId != id) {
            return res.status(403).json({ message: "Unauthorized to modify these settings" });
        }

        // Base64 képek méretének ellenőrzése
        if (profilePicture && profilePicture.length > 1000000) { // ~1MB limit
            return res.status(400).json({
                message: "A profilkép túl nagy méretű. Kérjük, használjon kisebb képet (max 1MB)."
            });
        }

        if (customBackground && customBackground.length > 1000000) { // ~1MB limit
            return res.status(400).json({
                message: "A háttérkép túl nagy méretű. Kérjük, használjon kisebb képet (max 1MB)."
            });
        }

        console.log(`Felhasználói beállítások mentése: userId=${id}`, {
            profileBackground: profileBackground ? "provided" : "not provided",
            hasCustomBackground: !!customBackground,
            hasProfilePicture: !!profilePicture
        });

        const user = await User.findByPk(id);

        if (!user) {
            console.log(`Felhasználó nem található: userId=${id}`);
            return res.status(404).json({ message: "User not found" });
        }

        // Csak a megadott mezőket frissítjük
        const updates = {};
        if (profileBackground !== undefined) updates.profileBackground = profileBackground;
        if (customBackground !== undefined) updates.customBackground = customBackground;
        if (profilePicture !== undefined) updates.profilePicture = profilePicture;

        console.log(`Felhasználói beállítások frissítése: userId=${id}`, {
            updatedFields: Object.keys(updates)
        });

        // Frissítjük a felhasználót
        await User.update(updates, { where: { id } });

        // Frissített felhasználó lekérése
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

// Felhasználói statisztikák lekérése
const getUserStats = async (req, res) => {
    try {
        const userId = req.params.userId;

        // Létrehozott események számának lekérése
        const createdEvents = await Esemény.count({
            where: { userId: userId }
        });

        // Részvételek számának lekérése (csak azok, ahol nem ő a szervező)
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

// List all users except the requesting user
const listAllUsers = async (req, res) => {
    try {
        // Get the current user ID from the token
        const currentUserId = req.user.userId;

        // Find all users except the current user
        const users = await User.findAll({
            where: {
                id: { [Op.ne]: currentUserId } // Exclude the current user
            },
            attributes: ['id', 'username', 'profilePicture']
        });

        // Format the results to include the actual profilePicture data
        const formattedUsers = users.map(user => ({
            id: user.id,
            username: user.username,
            profilePicture: user.profilePicture // Include the actual profile picture data
        }));

        console.log(`Felhasználók listázása: ${formattedUsers.length} felhasználó, lekérdező: userId=${currentUserId}`);

        res.status(200).json({ users: formattedUsers });
    } catch (error) {
        console.error("Error listing users:", error);
        res.status(500).json({ message: "Error listing users", error: error.message });
    }
};

// Felhasználók keresése meghíváshoz
// Felhasználók keresése meghíváshoz - javított verzió életkor számítással
const searchUsers = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Authentication token is required!" });
        }

        const decoded = jwt.verify(token, "secretkey");
        const currentUserId = decoded.userId;

        // Keresési paraméterek
        const { query, limit = 10, page = 1, excludeEvent, minAge, maxAge } = req.query;

        if (!query || query.length < 2) {
            return res.status(400).json({ message: "A keresésnek legalább 2 karakter hosszúnak kell lennie!" });
        }

        // Számítsuk ki az offset-et a lapozáshoz
        const offset = (page - 1) * limit;

        // Alap keresési feltételek
        const whereConditions = {
            [Op.or]: [
                { username: { [Op.like]: `%${query}%` } },
                { firstName: { [Op.like]: `%${query}%` } },
                { lastName: { [Op.like]: `%${query}%` } },
                { email: { [Op.like]: `%${query}%` } }
            ],
            // Ne jelenítse meg a saját felhasználót
            id: { [Op.ne]: currentUserId }
        };

        // Ha van esemény ID, akkor kizárjuk azokat a felhasználókat, akik már résztvevők
        let excludedUserIds = [currentUserId]; // Mindig kizárjuk a saját felhasználót

        if (excludeEvent) {
            // Lekérjük az esemény összes résztvevőjét
            const participants = await Résztvevő.findAll({
                where: { eseményId: excludeEvent },
                attributes: ['userId']
            });

            // Hozzáadjuk a résztvevők ID-it a kizárt felhasználókhoz
            const participantIds = participants.map(p => p.userId);
            excludedUserIds = [...excludedUserIds, ...participantIds];

            // Frissítjük a where feltételt
            whereConditions.id = { [Op.notIn]: excludedUserIds };
        }

        // Felhasználók keresése
        const users = await User.findAndCountAll({
            where: whereConditions,
            attributes: ['id', 'username', 'firstName', 'lastName', 'email', 'profilePicture', 'birthDate'],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['username', 'ASC']]
        });

        // Életkor kiszámítása minden felhasználóhoz
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

            // Teljes név összeállítása
            const fullName = user.username ||
                `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
                'Felhasználó';

            return {
                id: user.id,
                name: fullName,
                username: user.username, // Hozzáadva a username mező
                email: user.email,
                profilePicture: user.profilePicture, // Átnevezve image-ről profilePicture-re
                age: age
            };
        });

        // Életkor szűrés, ha meg van adva
        let filteredUsers = usersWithAge;
        if (minAge !== undefined && maxAge !== undefined) {
            filteredUsers = usersWithAge.filter(user => {
                if (user.age === null) return false; // Ha nincs életkor, kihagyjuk
                return user.age >= parseInt(minAge) && user.age <= parseInt(maxAge);
            });
        }

        // Válasz küldése
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


// Add this function to the exports
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