const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const Esemény = require("../models/esemenyModel");

// Create User
const createUser = async (req, res) => {
    try {
        const { email, password, username, phone, firstName, lastName, birthDate } = req.body;
        if (!email || !password || !username) {
            return res.status(400).json({ message: "Missing required fields!" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({ email, password: hashedPassword, username, phone, firstName, lastName, birthDate });
        res.status(201).json({ message: "User created successfully!", user: newUser });
    } catch (error) {
        res.status(500).json({ message: "Error creating user", error });
    }
};

// Authenticate User (Login)
const authenticateUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: "Missing credentials!" });

        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(401).json({ message: "Invalid email or password!" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: "Invalid email or password!" });

        const token = jwt.sign({ 
            userId: user.id, 
            email: user.email,
            name: user.username // Hozzáadva a felhasználónév a tokenhez
        }, "secretkey", { expiresIn: "1h" });
        
        res.json({ 
            message: "Login successful!", 
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

// Delete User
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await User.destroy({ where: { id } });

        if (!deleted) return res.status(404).json({ message: "User not found!" });

        res.json({ message: "User deleted successfully!" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting user", error });
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
            return res.status(400).json({ message: "Missing required fields for creating event!" });
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

// Felhasználói beállítások mentése - javított verzió
const saveUserSettings = async (req, res) => {
    try {
        const { id } = req.params;
        const { profileBackground, customBackground, profilePicture } = req.body;
        
        // Ellenőrizzük, hogy a token tulajdonosa módosítja-e a saját adatait
        if (req.user.userId != id) {
            return res.status(403).json({ message: "Unauthorized to modify these settings" });
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

module.exports = { 
    createUser, 
    authenticateUser, 
    getUser, 
    updateUser, 
    deleteUser, 
    createEsemeny,
    getUserSettings,
    saveUserSettings
};