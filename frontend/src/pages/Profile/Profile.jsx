import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { User, Mail, Phone, Calendar, Edit, Save, Trash2, AlertTriangle, X, Upload, FileText, RefreshCw } from "lucide-react";
import Header from "../Main/Header"; // Import the Header component

// Import the ImageWithFallback component from Header.jsx
const ImageWithFallback = ({ src, alt, className, defaultSrc }) => {
    const [error, setError] = useState(false);

    const formatImageUrl = (url) => {
        if (!url || error) return defaultSrc;
        // If src is already a full URL (starting with http://localhost:8081), don't modify it
        if (url.startsWith('http://localhost:8081')) return url;
        // If it's a Base64 encoded image, return it directly
        if (url.startsWith('data:image/')) return url;
        // If it's an external URL (https://), return it directly
        if (url.startsWith('https://')) return url;
        // Otherwise, add the server URL
        return `http://localhost:8081${url.startsWith('/') ? url : `/${url}`}`;
    };

    return (
        <img
            src={formatImageUrl(src)}
            alt={alt || ''}
            className={className || ''}
            onError={(e) => {
                console.error(`Kép betöltési hiba: ${src && src.substring(0, 100)}...`);
                setError(true);
                e.target.src = defaultSrc;
            }}
        />
    );
};

const Profile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [activeTab, setActiveTab] = useState("profile"); // Add state for active tab
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        firstName: "",
        lastName: "",
        phone: "",
        birthDate: "",
        bio: "", // Új mező a bemutatkozáshoz
    });

    // Default profile picture URL - this is used as default
    const [defaultProfilePicture, setDefaultProfilePicture] = useState("https://media.istockphoto.com/id/526947869/vector/man-silhouette-profile-picture.jpg?s=612x612&w=0&k=20&c=5I7Vgx_U6UPJe9U2sA2_8JFF4grkP7bNmDnsLXTYlSc=");

    // Custom profile picture - if null, we use the default
    const [profilePicture, setProfilePicture] = useState(null);
    const profilePicInputRef = useRef(null);

    // Statisztikák
    const [stats, setStats] = useState({
        createdEvents: 0,
        participatedEvents: 0
    });

    // Helper function to get profile picture source
    const getProfilePicSrc = () => {
        if (profilePicture) {
            return profilePicture;
        }
        return defaultProfilePicture;
    };

    // Fetch default images from server
    const fetchDefaultImages = async () => {
        try {
            // Set fallback values
            setDefaultProfilePicture("https://media.istockphoto.com/id/526947869/vector/man-silhouette-profile-picture.jpg?s=612x612&w=0&k=20&c=5I7Vgx_U6UPJe9U2sA2_8JFF4grkP7bNmDnsLXTYlSc=");

            // Try to load default images from server
            const response = await fetch("http://localhost:8081/api/v1/defaults");
            if (response.ok) {
                const data = await response.json();
                if (data.defaultProfilePicture) {
                    setDefaultProfilePicture(data.defaultProfilePicture);
                }
            } else {
                console.log("Alapértelmezett képek betöltése sikertelen, fallback értékek használata");
            }
        } catch (error) {
            console.error("Hiba az alapértelmezett képek betöltésekor:", error);
            // Set fallback values
            setDefaultProfilePicture("https://media.istockphoto.com/id/526947869/vector/man-silhouette-profile-picture.jpg?s=612x612&w=0&k=20&c=5I7Vgx_U6UPJe9U2sA2_8JFF4grkP7bNmDnsLXTYlSc=");
        }
    };

    // Felhasználói adatok betöltése
    useEffect(() => {
        // First load default images
        fetchDefaultImages();

        const fetchUserData = async () => {
            try {
                const token = Cookies.get("token");
                if (!token) {
                    navigate("/login");
                    return;
                }

                // Token ellenőrzése
                const authResponse = await fetch("http://localhost:8081/api/v1/login", {
                    method: "GET",
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (!authResponse.ok) {
                    throw new Error("Érvénytelen token");
                }

                const authData = await authResponse.json();
                const userId = authData.user.userId;

                // Felhasználói adatok lekérése
                const userResponse = await fetch(`http://localhost:8081/api/v1/getUser/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (!userResponse.ok) {
                    throw new Error("Nem sikerült lekérni a felhasználói adatokat");
                }

                const userData = await userResponse.json();
                setUser(userData);

                // Form adatok inicializálása
                setFormData({
                    username: userData.username || "",
                    email: userData.email || "",
                    firstName: userData.firstName || "",
                    lastName: userData.lastName || "",
                    phone: userData.phone || "",
                    birthDate: userData.birthDate ? new Date(userData.birthDate).toISOString().split('T')[0] : "",
                    bio: userData.bio || "", // Bemutatkozás inicializálása
                });

                if (userData.profilePicture) {
                    setProfilePicture(userData.profilePicture);
                }

                // Statisztikák lekérése
                fetchUserStats(userId, token);

                setLoading(false);
            } catch (err) {
                console.error("Hiba a felhasználói adatok betöltésekor:", err);
                setError(err.message);
                setLoading(false);
            }
        };

        fetchUserData();
    }, [navigate]);

    // Felhasználói statisztikák lekérése
    const fetchUserStats = async (userId, token) => {
        try {
            const statsResponse = await fetch(`http://localhost:8081/api/v1/user-stats/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (statsResponse.ok) {
                const statsData = await statsResponse.json();
                setStats({
                    createdEvents: statsData.createdEvents || 0,
                    participatedEvents: statsData.participatedEvents || 0
                });
            }
        } catch (err) {
            console.error("Hiba a statisztikák lekérésekor:", err);
        }
    };

    // Űrlap mezők változásának kezelése
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    // Add image compression before upload - same as in Header.jsx
    const compressImage = (imageDataUrl, maxWidth = 400) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = imageDataUrl;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Calculate new dimensions
                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Get compressed image data (adjust quality as needed)
                resolve(canvas.toDataURL('image/jpeg', 0.7));
            };
        });
    };

    // Handle file upload for profile picture - updated to match Header.jsx logic and refresh page
    const handleProfilePicUpload = async (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const imageDataUrl = e.target.result;

                    // Compress the image before setting and saving
                    const compressedImage = await compressImage(imageDataUrl, 400); // Smaller for profile pics

                    // Update local state
                    setProfilePicture(compressedImage);

                    // Save to database immediately
                    const token = Cookies.get("token");
                    if (!token || !user) return;

                    const success = await saveUserSettings({
                        profilePicture: compressedImage
                    });

                    if (success) {
                        console.log("Profilkép sikeresen frissítve");

                        // Refresh the page to show the updated profile picture everywhere
                        window.location.reload();
                    } else {
                        throw new Error("Nem sikerült menteni a profilképet");
                    }
                } catch (error) {
                    console.error("Hiba a profilkép feltöltésekor:", error);
                    alert("Hiba történt a profilkép feltöltésekor. Kérjük, próbáld újra.");
                }
            };
            reader.readAsDataURL(file);
        }
    };


    // Save user settings - helper function for all settings updates
    const saveUserSettings = async (settings) => {
        try {
            const token = Cookies.get("token");
            if (!token || !user) {
                console.error("Nincs token vagy user ID a beállítások mentéséhez");
                return false;
            }

            console.log("Beállítások mentése:", settings);

            // Save settings to database
            const response = await fetch(`http://localhost:8081/api/v1/updateUser/${user.id}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(settings)
            });

            if (response.ok) {
                console.log("Beállítások sikeresen mentve");
                return true;
            } else {
                console.error("Nem sikerült menteni a beállításokat az adatbázisba", await response.text());
                return false;
            }
        } catch (error) {
            console.error("Hiba a beállítások mentésekor:", error);
            return false;
        }
    };

    // Trigger profile picture file input click
    const handleProfilePicClick = () => {
        profilePicInputRef.current.click();
    };

    // Reset profile picture to default - updated to match Header.jsx logic and refresh page
    const resetProfilePicture = async (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation(); // Prevent click from reaching parent
        }

        // Update local state
        setProfilePicture(null);

        // Save to database
        try {
            const success = await saveUserSettings({
                profilePicture: null
            });

            if (success) {
                console.log("Profilkép sikeresen visszaállítva az alapértelmezettre");

                // Refresh the page to show the updated profile picture everywhere
                window.location.reload();
            } else {
                throw new Error("Nem sikerült visszaállítani a profilképet");
            }
        } catch (error) {
            console.error("Hiba:", error);
            alert("Hiba történt a profilkép visszaállításakor. Kérjük, próbáld újra.");
        }
    };


    // Felhasználói adatok mentése
    const handleSaveProfile = async () => {
        try {
            const token = Cookies.get("token");
            if (!token || !user) return;

            // Adatok előkészítése
            const updatedData = {
                ...formData,
                profilePicture: profilePicture
            };

            // API hívás a felhasználói adatok frissítéséhez
            const response = await fetch(`http://localhost:8081/api/v1/updateUser/${user.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(updatedData)
            });

            if (!response.ok) {
                throw new Error("Nem sikerült frissíteni a felhasználói adatokat");
            }

            // Sikeres mentés után frissítjük a user állapotot
            setUser({
                ...user,
                ...updatedData
            });

            setIsEditing(false);

            // Sikeres mentés üzenet megjelenítése
            alert("A profil adatok sikeresen frissítve!");

            // Felhasználó kijelentkeztetése
            Cookies.remove("token");
            localStorage.removeItem("user");

            // Átirányítás a bejelentkezési oldalra késleltetéssel
            setTimeout(() => {
                navigate("/login");
            }, 1000);

        } catch (err) {
            console.error("Hiba a profil mentésekor:", err);
            alert("Hiba történt a profil mentésekor: " + err.message);
        }
    };

    // Profil törlése
    const handleDeleteProfile = async () => {
        try {
            const token = Cookies.get("token");
            if (!token || !user) return;

            // Set loading state
            setIsDeleting(true);

            // API hívás a felhasználó törléséhez
            const response = await fetch(`http://localhost:8081/api/v1/deleteUser/${user.id}`, {
                method: "DELETE", headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Nem sikerült törölni a felhasználót");
            }

            // Sikeres törlés után kijelentkeztetjük a felhasználót
            Cookies.remove("token");
            localStorage.removeItem("user");

            // Show success message with details
            let successMessage = "A felhasználói fiók sikeresen törölve!";
            if (data.deletedEvents > 0) {
                successMessage += ` ${data.deletedEvents} létrehozott esemény is törlésre került.`;
            }

            alert(successMessage);
            navigate("/homepage");
        } catch (err) {
            console.error("Hiba a profil törlésekor:", err);
            alert("Hiba történt a profil törlésekor: " + err.message);
        } finally {
            setIsDeleting(false);
        }
    };

    // Felhasználói inicálék megjelenítése
    const getUserInitials = () => {
        if (!user || !user.username) return "";
        return user.username
            .split(" ")
            .map((name) => name.charAt(0))
            .join("")
            .toUpperCase()
            .substring(0, 2);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="bg-red-500/10 text-red-400 p-4 rounded-lg max-w-md">
                    <h2 className="text-xl font-bold mb-2">Hiba történt</h2>
                    <p>{error}</p>
                    <button
                        onClick={() => navigate("/login")}
                        className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg"
                    >
                        Vissza a bejelentkezéshez
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Include the Header component at the top */}
            <Header activeTab={activeTab} setActiveTab={setActiveTab} />

            <div className="min-h-screen bg-slate-900 py-12 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-slate-800 rounded-2xl overflow-hidden shadow-xl border border-slate-700/50">
                        {/* Profil fejléc */}
                        <div className="bg-gradient-to-r from-blue-600/30 to-purple-600/30 p-8 relative">
                            <div className="flex flex-col md:flex-row items-center gap-6">
                                {/* Profilkép - Updated to use ImageWithFallback */}
                                <div
                                    className="w-32 h-32 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-1 shadow-lg shadow-purple-500/20 ring-4 ring-slate-900/50 relative group cursor-pointer"
                                    onClick={handleProfilePicClick}
                                >
                                    <div className="w-full h-full rounded-xl bg-slate-800 flex items-center justify-center overflow-hidden">
                                        <ImageWithFallback
                                            src={getProfilePicSrc()}
                                            alt={user?.username}
                                            className="w-full h-full object-cover"
                                            defaultSrc={defaultProfilePicture}
                                        />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                                            <Upload className="h-8 w-8 text-white" />
                                        </div>
                                    </div>

                                    {/* Reset button - only appears if custom profile picture is set */}
                                    {profilePicture && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation(); // Prevent click from reaching parent
                                                resetProfilePicture(e);
                                            }}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                                            title="Alapértelmezett profilkép visszaállítása"
                                        >
                                            <RefreshCw className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    ref={profilePicInputRef}
                                    onChange={handleProfilePicUpload}
                                    accept="image/*"
                                    className="hidden"
                                />

                                {/* Felhasználói adatok */}
                                <div className="flex-1">
                                    <h1 className="text-3xl font-bold text-white mb-2">
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                name="username"
                                                value={formData.username}
                                                onChange={handleInputChange}
                                                className="bg-slate-700 text-white px-3 py-2 rounded-lg w-full"
                                            />
                                        ) : (
                                            user?.username
                                        )}
                                    </h1>
                                    <p className="text-slate-300 mb-4">
                                        {isEditing ? (
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                className="bg-slate-700 text-white px-3 py-2 rounded-lg w-full"
                                            />
                                        ) : (
                                            user?.email
                                        )}
                                    </p>

                                    {/* Szerkesztés/Mentés gombok */}
                                    <div className="flex gap-3">
                                        {isEditing ? (
                                            <button
                                                onClick={handleSaveProfile}
                                                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                                            >
                                                <Save className="h-4 w-4" />
                                                Mentés
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => setIsEditing(true)}
                                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                            >
                                                <Edit className="h-4 w-4" />
                                                Szerkesztés
                                            </button>
                                        )}

                                        {isEditing && (
                                            <button
                                                onClick={() => setIsEditing(false)}
                                                className="flex items-center gap-2 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
                                            >
                                                <X className="h-4 w-4" />
                                                Mégse
                                            </button>
                                        )}

                                        <button
                                            onClick={() => setShowDeleteConfirm(true)}
                                            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors ml-auto"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            Profil törlése
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Profil részletek */}
                        <div className="p-8">
                            {/* Bemutatkozás szekció */}
                            <div className="mb-8">
    <h2 className="text-xl font-bold text-white mb-4 border-b border-slate-700 pb-2">Bemutatkozás</h2>

    {isEditing ? (
        <textarea
            name="bio"
            value={formData.bio}
            onChange={handleInputChange}
            className="w-full h-32 bg-slate-700 text-white px-4 py-3 rounded-lg resize-none"
            placeholder="Írj magadról néhány mondatot..."
        />
    ) : (
        <div className="bg-slate-700/50 rounded-lg p-4 max-h-60 overflow-y-auto custom-scrollbar">
            {user?.bio ? (
                <p className="text-slate-300 whitespace-pre-wrap break-words">{user.bio}</p>
            ) : (
                <p className="text-slate-500 italic">Nincs bemutatkozás megadva</p>
            )}
        </div>
    )}
</div>

                            <h2 className="text-xl font-bold text-white mb-6 border-b border-slate-700 pb-2">Személyes adatok</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Vezetéknév */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">Vezetéknév</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleInputChange}
                                            className="bg-slate-700 text-white px-4 py-3 rounded-lg w-full"
                                        />
                                    ) : (
                                        <div className="flex items-center gap-3 bg-slate-700/50 px-4 py-3 rounded-lg">
                                            <User className="h-5 w-5 text-slate-400" />
                                            <span className="text-white">{user?.lastName || "Nincs megadva"}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Keresztnév */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">Keresztnév</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleInputChange}
                                            className="bg-slate-700 text-white px-4 py-3 rounded-lg w-full"
                                        />
                                    ) : (
                                        <div className="flex items-center gap-3 bg-slate-700/50 px-4 py-3 rounded-lg">
                                            <User className="h-5 w-5 text-slate-400" />
                                            <span className="text-white">{user?.firstName || "Nincs megadva"}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">Email cím</label>
                                    {isEditing ? (
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className="bg-slate-700 text-white px-4 py-3 rounded-lg w-full"
                                        />
                                    ) : (
                                        <div className="flex items-center gap-3 bg-slate-700/50 px-4 py-3 rounded-lg">
                                            <Mail className="h-5 w-5 text-slate-400" />
                                            <span className="text-white">{user?.email}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Telefonszám */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">Telefonszám</label>
                                    {isEditing ? (
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            className="bg-slate-700 text-white px-4 py-3 rounded-lg w-full"
                                        />
                                    ) : (
                                        <div className="flex items-center gap-3 bg-slate-700/50 px-4 py-3 rounded-lg">
                                            <Phone className="h-5 w-5 text-slate-400" />
                                            <span className="text-white">{user?.phone || "Nincs megadva"}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Születési dátum */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">Születési dátum</label>
                                    {isEditing ? (
                                        <input
                                            type="date"
                                            name="birthDate"
                                            value={formData.birthDate}
                                            onChange={handleInputChange}
                                            className="bg-slate-700 text-white px-4 py-3 rounded-lg w-full"
                                        />
                                    ) : (
                                        <div className="flex items-center gap-3 bg-slate-700/50 px-4 py-3 rounded-lg">
                                            <Calendar className="h-5 w-5 text-slate-400" />
                                            <span className="text-white">
                                                {user?.birthDate
                                                    ? new Date(user.birthDate).toLocaleDateString('hu-HU', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })
                                                    : "Nincs megadva"}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Felhasználónév */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">Felhasználónév</label>
                                    {isEditing ? (
                                        <input
                                            type="text" name="username"
                                            value={formData.username}
                                            onChange={handleInputChange}
                                            className="bg-slate-700 text-white px-4 py-3 rounded-lg w-full"
                                        />
                                    ) : (
                                        <div className="flex items-center gap-3 bg-slate-700/50 px-4 py-3 rounded-lg">
                                            <User className="h-5 w-5 text-slate-400" />
                                            <span className="text-white">{user?.username}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Események statisztikák */}
                            <div className="mt-10">
                                <h2 className="text-xl font-bold text-white mb-6 border-b border-slate-700 pb-2">Esemény statisztikák</h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/20 rounded-xl p-6">
                                        <h3 className="text-blue-400 font-medium mb-2">Létrehozott események</h3>
                                        <p className="text-3xl font-bold text-white">{stats.createdEvents}</p>
                                    </div>

                                    <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/20 rounded-xl p-6">
                                        <h3 className="text-purple-400 font-medium mb-2">Részvételek</h3>
                                        <p className="text-3xl font-bold text-white">{stats.participatedEvents}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Profil törlés megerősítő modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 rounded-2xl max-w-md w-full p-6 border border-red-500/30 animate-fadeIn">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                                <AlertTriangle className="h-6 w-6 text-red-500" />
                            </div>
                            <h2 className="text-xl font-bold text-white">Profil törlése</h2>
                        </div>

                        <p className="text-slate-300 mb-4">
                            Biztosan törölni szeretnéd a profilodat? Ez a művelet nem visszavonható, és minden adatod véglegesen törlődik.
                        </p>

                        <div className="bg-red-500/10 p-4 rounded-lg mb-6">
                            <h3 className="text-red-300 font-medium mb-2">A törlés következményei:</h3>
                            <ul className="text-slate-300 list-disc pl-5 space-y-1">
                                <li>Minden személyes adatod törlődik</li>
                                <li>Az általad létrehozott események törlődnek</li>
                                <li>Minden eseményből, amelyhez csatlakoztál, kilépsz</li>
                            </ul>
                        </div>

                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                                disabled={isDeleting}
                            >
                                Mégsem
                            </button>
                            <button
                                onClick={handleDeleteProfile}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center"
                                disabled={isDeleting}
                            >
                                {isDeleting ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Törlés folyamatban...
                                    </>
                                ) : (
                                    "Törlés megerősítése"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

<style jsx>{`
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    .animate-fadeIn {
        animation: fadeIn 0.2s ease-out forwards;
    }
    
    /* Custom scrollbar styling */
    .custom-scrollbar::-webkit-scrollbar {
        width: 8px;
    }
    
    .custom-scrollbar::-webkit-scrollbar-track {
        background: rgba(30, 41, 59, 0.5);
        border-radius: 4px;
    }
    
    .custom-scrollbar::-webkit-scrollbar-thumb {
        background: rgba(99, 102, 241, 0.5);
        border-radius: 4px;
    }
    
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: rgba(99, 102, 241, 0.7);
    }
`}</style>
</>
    );
};

export default Profile;


