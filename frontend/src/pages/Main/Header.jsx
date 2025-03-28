"use client"

import { useState, useEffect, useRef } from "react"
import {
  Hotel,
  Plane,
  Car,
  Map,
  LogOut,
  User,
  ChevronRight,
  Bell,
  Calendar,
  Heart,
  ImageIcon,
  Upload,
  Menu,
  X
} from "lucide-react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import Cookies from "js-cookie"

const Header = ({ activeTab, setActiveTab }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [userId, setUserId] = useState(null)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [notificationCount, setNotificationCount] = useState(3)
  const [selectedBackground, setSelectedBackground] = useState("gradient1")
  const [customBackground, setCustomBackground] = useState(null)
  const fileInputRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()

  // Mobilnézet kezeléséhez
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Add these new state variables after the existing state declarations
  const [profilePicture, setProfilePicture] = useState(null)
  const profilePicInputRef = useRef(null)

  // Background options
  const backgrounds = {
    gradient1: {
      style: "bg-gradient-to-r from-blue-600/30 to-purple-600/30",
      pattern: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%239C92AC' fillOpacity='0.1' fillRule='evenodd'/%3E%3C/svg%3E")`,
      overlay: "bg-gradient-to-br from-blue-600/40 via-purple-600/40 to-pink-600/40 opacity-70",
    },
    gradient2: {
      style: "bg-gradient-to-r from-emerald-600/30 to-teal-600/30",
      pattern: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='0.1'%3E%3Cpath d='M50 50c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10zM10 10c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10S0 25.523 0 20s4.477-10 10-10zm10 8c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zm40 40c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z' /%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      overlay: "bg-gradient-to-br from-emerald-600/40 via-teal-600/40 to-cyan-600/40 opacity-70",
    },
    gradient3: {
      style: "bg-gradient-to-r from-orange-600/30 to-amber-600/30",
      pattern: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      overlay: "bg-gradient-to-br from-orange-600/40 via-amber-600/40 to-yellow-600/40 opacity-70",
    },
    dark: {
      style: "bg-slate-900",
      pattern: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fillOpacity='0.05' fillRule='evenodd'%3E%3Cpath d='M0 38.59l2.83-2.83 1.41 1.41L1.41 40H0v-1.41zM0 1.4l2.83 2.83 1.41-1.41L1.41 0H0v1.41zM38.59 40l-2.83-2.83 1.41-1.41L40 38.59V40h-1.41zM40 1.41l-2.83 2.83-1.41-1.41L38.59 0H40v1.41zM20 18.6l2.83-2.83 1.41 1.41L21.41 20l2.83 2.83-1.41 1.41L20 21.41l-2.83 2.83-1.41-1.41L18.59 20l-2.83-2.83 1.41-1.41L20 18.59z'/%3E%3C/g%3E%3C/svg%3E")`,
      overlay: "bg-gradient-to-br from-slate-900/40 via-slate-800/40 to-slate-700/40 opacity-70",
    },
    custom: {
      style: "bg-cover bg-center",
      pattern: "",
      overlay: "bg-gradient-to-br from-slate-900/40 via-slate-800/40 to-slate-700/40 opacity-50",
    },
  }

  // Navigációs elemek módosítása
  const navigationItems = [
    { id: "home", icon: Hotel, label: "Főoldal", path: "/homepage" },
    { id: "create", icon: Plane, label: "Esemény létrehozása", path: "/homepage#create-event" }, // Módosítva hash-el
    { id: "latest", icon: Car, label: "Legfrissebb sportesemények", path: "/latest-events" },
    { id: "contact", icon: Map, label: "Elérhetőségek", path: "/contact" },
    { id: "myevents", icon: Calendar, label: "Eseményeim", path: "/my-events" },
  ];


  // Inicializálás a komponens betöltésekor - javított verzió
  useEffect(() => {
    // Token ellenőrzése
    const token = Cookies.get("token")
    if (token) {
      console.log("Token megtalálva, ellenőrzés...")
      // Verify token with backend
      verifyToken(token)
    } else {
      console.log("Nincs token, kijelentkezett állapot")
      // Alapértelmezett beállítások visszaállítása
      setIsLoggedIn(false)
      setUserName("")
      setUserEmail("")
      setUserId(null)
      setSelectedBackground("gradient1")
      setCustomBackground(null)
      setProfilePicture(null)
    }
  }, []) // Csak egyszer fusson le a komponens betöltésekor

  // Egyszerűsített verifyToken függvény
  const verifyToken = async (token) => {
    try {
      // Először ellenőrizzük a tokent
      const authResponse = await fetch("http://localhost:8081/api/v1/login", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (authResponse.ok) {
        const authData = await authResponse.json();
        setIsLoggedIn(true);
        setUserName(authData.user.name || authData.user.username);
        setUserEmail(authData.user.email);
        setUserId(authData.user.userId);

        // Most közvetlenül lekérjük a felhasználó adatait (beleértve a képeket)
        await loadUserSettings(authData.user.userId);
      } else {
        Cookies.remove("token");
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error("Hiba:", error);
      Cookies.remove("token");
      setIsLoggedIn(false);
    }
  }

  // Egyszerűsített loadUserSettings függvény
  const loadUserSettings = async (userId) => {
    try {
      const token = Cookies.get("token");

      // Közvetlen API hívás a felhasználói beállítások lekéréséhez
      const response = await fetch(`http://localhost:8081/api/v1/getUser/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const userData = await response.json();
        console.log("Felhasználói adatok betöltve:", userData);

        // Közvetlenül a felhasználói objektumból olvassuk ki az adatokat
        if (userData.profileBackground) {
          setSelectedBackground(userData.profileBackground);
        }

        if (userData.customBackground) {
          setCustomBackground(userData.customBackground);
          if (userData.profileBackground === "custom") {
            setSelectedBackground("custom");
          }
        }

        if (userData.profilePicture) {
          setProfilePicture(userData.profilePicture);
        }
      } else {
        console.error("Hiba a felhasználói adatok lekérésekor");
      }
    } catch (error) {
      console.error("Hiba:", error);
    }
  }

  // Beállítások mentése
  const saveUserSettings = async (settings) => {
    try {
      const token = Cookies.get("token")
      if (!token || !userId) {
        console.error("Nincs token vagy userId a beállítások mentéséhez")
        return
      }

      console.log("Beállítások mentése:", {
        profileBackground: settings.profileBackground,
        hasCustomBackground: !!settings.customBackground,
        hasProfilePicture: !!settings.profilePicture
      })

      // Adatbázisba mentjük a felhasználó beállításait
      const response = await fetch(`http://localhost:8081/api/v1/users/${userId}/settings`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(settings)
      })

      if (response.ok) {
        const data = await response.json()
        console.log("Beállítások sikeresen mentve:", data)
      } else {
        console.error("Nem sikerült menteni a beállításokat az adatbázisba", await response.text())
      }
    } catch (error) {
      console.error("Hiba a beállítások mentésekor:", error)
    }
  }

  const handleLogout = () => {
    Cookies.remove("token")
    setIsLoggedIn(false)
    setUserName("")
    setUserEmail("")
    setUserId(null)
    setIsProfileOpen(false)
    // Alapértelmezett beállítások visszaállítása
    setSelectedBackground("gradient1")
    setCustomBackground(null)
    setProfilePicture(null)
    navigate("/Homepage")
  }

  const toggleProfileDropdown = () => {
    setIsProfileOpen(!isProfileOpen)
    if (isMobileMenuOpen) setIsMobileMenuOpen(false)
  }

  // Mobilmenü kezelése
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
    if (isProfileOpen) setIsProfileOpen(false)
  }

  // Function to get user initials for avatar
  const getUserInitials = () => {
    if (!userName) return ""
    return userName
      .split(" ")
      .map((name) => name.charAt(0))
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const dropdown = document.getElementById("userDropdown")
      const avatar = document.getElementById("avatarButton")
      const mobileMenu = document.getElementById("mobileMenu")
      const hamburgerButton = document.getElementById("hamburgerButton")

      if (dropdown && !dropdown.contains(event.target) && avatar && !avatar.contains(event.target)) {
        setIsProfileOpen(false)
      }

      if (mobileMenu && !mobileMenu.contains(event.target) && hamburgerButton && !hamburgerButton.contains(event.target)) {
        setIsMobileMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Animation for profile dropdown
  useEffect(() => {
    const dropdown = document.getElementById("userDropdown")
    if (dropdown) {
      if (isProfileOpen) {
        dropdown.style.opacity = "0"
        dropdown.style.transform = "translateY(10px) scale(0.95)"
        setTimeout(() => {
          dropdown.style.opacity = "1"
          dropdown.style.transform = "translateY(0) scale(1)"
        }, 50)
      }
    }
  }, [isProfileOpen])

  // Add image compression before upload
  const compressImage = (imageDataUrl, maxWidth = 800) => {
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

  // Handle file upload for custom background
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageDataUrl = e.target.result;

        // Compress the image before setting and saving
        const compressedImage = await compressImage(imageDataUrl);

        setCustomBackground(compressedImage);
        setSelectedBackground("custom");

        // Mentés adatbázisba
        saveUserSettings({
          customBackground: compressedImage,
          profileBackground: "custom",
        });
      };
      reader.readAsDataURL(file);
    }
  }

  // Trigger file input click
  const handleCustomBackgroundClick = () => {
    fileInputRef.current.click()
  }

  // Handle file upload for profile picture
  const handleProfilePicUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageDataUrl = e.target.result;

        // Compress the image before setting and saving
        const compressedImage = await compressImage(imageDataUrl, 400); // Smaller for profile pics

        setProfilePicture(compressedImage);

        // Mentés adatbázisba
        saveUserSettings({
          profilePicture: compressedImage,
        });
      };
      reader.readAsDataURL(file);
    }
  }

  // Trigger profile picture file input click
  const handleProfilePicClick = () => {
    profilePicInputRef.current.click()
  }

  // Módosított handleBackgroundSelect függvény
  const handleBackgroundSelect = async (bg) => {
    // Először frissítjük a helyi állapotot
    setSelectedBackground(bg);

    // Majd mentjük az adatbázisba
    try {
      const token = Cookies.get("token");
      const response = await fetch(`http://localhost:8081/api/v1/updateUser/${userId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          profileBackground: bg
        })
      });

      if (response.ok) {
        console.log("Háttér beállítás sikeresen mentve");
      } else {
        console.error("Hiba a háttér beállítás mentésekor");
      }
    } catch (error) {
      console.error("Hiba:", error);
    }
  }

  // Navigáció kezelése - kiegészítve jobb görgetési viselkedéssel
  const handleNavigation = (id, path) => {
    setActiveTab(id);

    // Ellenőrizzük, hogy van-e hash a path-ban
    if (path.includes('#')) {
      const [url, hash] = path.split('#');

      // Ha már a megfelelő oldalon vagyunk, csak görgessünk
      if (location.pathname === url || (url === '/homepage' && location.pathname === '/')) {
        const element = document.getElementById(hash);
        if (element) {
          // Használjunk offset-et, hogy a teljes szekció látható legyen
          const headerHeight = 120; // Fejléc magassága

          // Ha az "Esemény létrehozása" szekcióhoz görgetünk, akkor speciális kezelés
          if (hash === 'create-event') {
            // Megkeressük az event-section elemet
            const section = document.getElementById('event-section');
            if (section) {
              // Kiszámoljuk a pozíciót úgy, hogy a szekció teteje legyen látható,
              // de a "Legfrisebb sportesemények" ne látszódjon
              const sectionPosition = section.getBoundingClientRect().top;
              const offsetPosition = sectionPosition + window.pageYOffset - headerHeight;

              window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
              });
            }
          } else {
            // Egyéb elemekhez normál görgetés
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerHeight;

            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });
          }
        } else if (hash === 'create-event') {
          // Ha a create-event nem található, próbáljuk meg a szekciót
          const section = document.getElementById('event-section');
          if (section) {
            const headerHeight = 120; // Fejléc magassága
            const sectionPosition = section.getBoundingClientRect().top;
            const offsetPosition = sectionPosition + window.pageYOffset - headerHeight;

            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });
          }
        }
      } else {
        // Különben navigáljunk az oldalra, majd a betöltés után görgessünk
        navigate(url);
        setTimeout(() => {
          const element = document.getElementById(hash);
          if (element) {
            // Ha az "Esemény létrehozása" szekcióhoz görgetünk, akkor speciális kezelés
            if (hash === 'create-event') {
              // Megkeressük az event-section elemet
              const section = document.getElementById('event-section');
              if (section) {
                const headerHeight = 120; // Fejléc magassága
                const sectionPosition = section.getBoundingClientRect().top;
                const offsetPosition = sectionPosition + window.pageYOffset - headerHeight;

                window.scrollTo({
                  top: offsetPosition,
                  behavior: 'smooth'
                });
              }
            } else {
              // Egyéb elemekhez normál görgetés
              const headerHeight = 120; // Fejléc magassága
              const elementPosition = element.getBoundingClientRect().top;
              const offsetPosition = elementPosition + window.pageYOffset - headerHeight;

              window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
              });
            }
          } else if (hash === 'create-event') {
            // Ha a create-event nem található, próbáljuk meg a szekciót
            const section = document.getElementById('event-section');
            if (section) {
              const headerHeight = 120; // Fejléc magassága
              const sectionPosition = section.getBoundingClientRect().top;
              const offsetPosition = sectionPosition + window.pageYOffset - headerHeight;

              window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
              });
            }
          }
        }, 300); // Késleltetés, hogy biztosan betöltődjön az oldal
      }
    } else {
      // Ha nincs hash, egyszerűen navigáljunk
      navigate(path);
      window.scrollTo(0, 0);
    }

    setIsMobileMenuOpen(false);
  }




  return (
    <header className="backdrop-blur-md bg-gradient-to-r from-slate-900/90 to-slate-800/90 border-b border-slate-700/50 sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
            Sporthaver
          </div>

          {/* Jobb oldali elemek */}
          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              <div className="flex items-center space-x-4">
                {/* Notification Bell */}
                <div className="relative hidden md:block">
                  <button className="relative p-2 rounded-full bg-slate-700/50 hover:bg-slate-600/50 transition-all duration-300 text-slate-300 hover:text-white">
                    <Bell className="h-5 w-5" />
                    {notificationCount > 0 && (
                      <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-gradient-to-r from-pink-500 to-purple-600 rounded-full transform -translate-y-1/3 translate-x-1/3">
                        {notificationCount}
                      </span>
                    )}
                  </button>
                </div>

                {/* User Profile */}
                <div className="relative">
                  <button
                    id="avatarButton"
                    onClick={toggleProfileDropdown}
                    className="relative inline-flex items-center justify-center w-10 h-10 overflow-hidden rounded-xl cursor-pointer bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 ring-2 ring-white/10 hover:ring-white/30 transition-all duration-300 shadow-lg hover:shadow-purple-500/20 group"
                    style={{
                      backgroundSize: isProfileOpen ? "100% 100%" : "200% 200%",
                      animation: isProfileOpen ? "none" : "gradient-shift 3s ease infinite",
                    }}
                  >
                    <style jsx>{`
                            @keyframes gradient-shift {
                              0% { background-position: 0% 50%; }
                              50% { background-position: 100% 50%; }
                              100% { background-position: 0% 50%; }
                            }
                            @keyframes pulse {
                              0% { box-shadow: 0 0 0 0 rgba(147, 51, 234, 0.7); }
                              70% { box-shadow: 0 0 0 10px rgba(147, 51, 234, 0); }
                              100% { box-shadow: 0 0 0 0 rgba(147, 51, 234, 0); }
                            }
                          `}</style>
                    {/* Avatar megjelenítése */}
                    <span className="font-bold text-white text-sm group-hover:scale-110 transition-transform duration-300">
                      {profilePicture ? (
                        <img
                          src={profilePicture || "/placeholder.svg"}
                          alt={userName}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        getUserInitials()
                      )}
                    </span>
                    {isProfileOpen && (
                      <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-800 animate-pulse"></span>
                    )}
                  </button>

                  {isProfileOpen && (
                    <div
                      id="userDropdown"
                      className="z-10 absolute right-0 mt-3 rounded-2xl shadow-2xl w-80 overflow-hidden border border-slate-700/50 transition-all duration-300"
                      style={{
                        background: "linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)",
                        backdropFilter: "blur(10px)",
                        boxShadow:
                          "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1) inset, 0 1px 0 0 rgba(255, 255, 255, 0.1) inset",
                      }}
                    >
                      {/* Profile Header */}
                      <div className="relative">
                        {/* Background Pattern */}
                        <div
                          className={`h-40 ${selectedBackground === "custom"
                            ? backgrounds.custom.style
                            : backgrounds[selectedBackground].style
                            } relative overflow-hidden`}
                          style={{
                            backgroundImage:
                              selectedBackground === "custom"
                                ? `url(${customBackground})`
                                : backgrounds[selectedBackground].pattern,
                            backgroundSize: selectedBackground === "custom" ? "cover" : "30px 30px",
                          }}
                        >
                          {/* Overlay with animated gradient */}
                          <div
                            className={`absolute inset-0 ${selectedBackground === "custom"
                              ? backgrounds.custom.overlay
                              : backgrounds[selectedBackground].overlay
                              }`}
                          ></div>

                          {/* Animated particles */}
                          <div className="absolute inset-0 overflow-hidden">
                            {[...Array(20)].map((_, i) => (
                              <div
                                key={i}
                                className="absolute rounded-full bg-white/30"
                                style={{
                                  width: `${Math.random() * 4 + 1}px`,
                                  height: `${Math.random() * 4 + 1}px`,
                                  top: `${Math.random() * 100}%`,
                                  left: `${Math.random() * 100}%`,
                                  animation: `float ${Math.random() * 10 + 10}s linear infinite`,
                                  opacity: Math.random() * 0.5 + 0.3,
                                }}
                              />
                            ))}
                          </div>

                          <style jsx>{`
                                  @keyframes float {
                                    0% { transform: translateY(0) translateX(0); }
                                    50% { transform: translateY(-20px) translateX(10px); }
                                    100% { transform: translateY(0) translateX(0); }
                                  }
                                `}</style>

                          {/* Centered Username and Profile Picture */}
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <div
                              className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-1 shadow-lg shadow-purple-500/20 ring-4 ring-slate-900/50 mb-3 relative group cursor-pointer"
                              style={{ animation: "gradient-shift 3s ease infinite" }}
                              onClick={handleProfilePicClick}
                            >
                              <div className="w-full h-full rounded-xl bg-slate-800 flex items-center justify-center overflow-hidden">
                                {profilePicture ? (
                                  <img
                                    src={profilePicture || "/placeholder.svg"}
                                    alt={userName}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span className="font-bold text-white text-3xl">{getUserInitials()}</span>
                                )}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                                  <Upload className="h-6 w-6 text-white" />
                                </div>
                              </div>
                            </div>
                            <div className="font-bold text-white text-2xl text-center px-4 py-1 bg-black/30 rounded-full backdrop-blur-sm">
                              {userName}
                            </div>
                            <input
                              type="file"
                              ref={profilePicInputRef}
                              onChange={handleProfilePicUpload}
                              accept="image/*"
                              className="hidden"
                            />
                          </div>
                        </div>

                        {/* Background Selector */}
                        <div className="px-4 py-2 bg-slate-800/50 flex items-center justify-between">
                          <div className="text-xs text-slate-400 font-medium">Háttér</div>
                          <div className="flex space-x-2">
                            {Object.keys(backgrounds)
                              .filter((bg) => bg !== "custom")
                              .map((bg) => (
                                <button
                                  key={bg}
                                  onClick={() => handleBackgroundSelect(bg)}
                                  className={`w-6 h-6 rounded-full flex items-center justify-center ${selectedBackground === bg ? "ring-2 ring-white" : ""
                                    }`}
                                  style={{
                                    background: bg.includes("gradient")
                                      ? `linear-gradient(to right, ${bg === "gradient1" ? "#3b82f6, #9333ea" : bg === "gradient2" ? "#059669, #0d9488" : "#ea580c, #d97706"})`
                                      : "#0f172a",
                                  }}
                                >
                                  {selectedBackground === bg && <div className="w-2 h-2 rounded-full bg-white"></div>}
                                </button>
                              ))}
                            <button
                              onClick={handleCustomBackgroundClick}
                              className={`w-6 h-6 rounded-full flex items-center justify-center ${selectedBackground === "custom"
                                ? "ring-2 ring-white bg-slate-600"
                                : "bg-slate-700 hover:bg-slate-600"
                                } text-slate-300 transition-colors`}
                              title="Egyéni háttér"
                            >
                              <ImageIcon className="w-3 h-3" />
                              {selectedBackground === "custom" && (
                                <div className="absolute w-2 h-2 rounded-full bg-white"></div>
                              )}
                            </button>
                            <input
                              type="file"
                              ref={fileInputRef}
                              onChange={handleFileUpload}
                              accept="image/*"
                              className="hidden"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2 px-3">
                        <div className="text-xs uppercase text-slate-400 font-semibold px-3 py-2 mb-1">Fiókom</div>
                        <ul className="space-y-1">
                          <li>
                            <a
                              href="/profile"
                              className="flex items-center justify-between px-3 py-3 rounded-lg text-slate-200 hover:bg-slate-700/50 hover:text-white transition-colors group"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-600/20 flex items-center justify-center text-purple-400 group-hover:text-purple-300 transition-colors">
                                  <User className="h-5 w-5" />
                                </div>
                                <span className="font-medium">Profil</span>
                              </div>
                              <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-slate-300 transition-colors opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all" />
                            </a>
                          </li>
                          <li>
                            <a
                              href="/bookings"
                              className="flex items-center justify-between px-3 py-3 rounded-lg text-slate-200 hover:bg-slate-700/50 hover:text-white transition-colors group"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500/10 to-green-600/20 flex items-center justify-center text-green-400 group-hover:text-green-300 transition-colors">
                                  <Calendar className="h-5 w-5" />
                                </div> <span className="font-medium">Foglalásaim</span>
                              </div>
                              <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-slate-300 transition-colors opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all" />
                            </a>
                          </li>
                          <li>
                            <a
                              href="/favorites"
                              className="flex items-center justify-between px-3 py-3 rounded-lg text-slate-200 hover:bg-slate-700/50 hover:text-white transition-colors group"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500/10 to-pink-600/20 flex items-center justify-center text-pink-400 group-hover:text-pink-300 transition-colors">
                                  <Heart className="h-5 w-5" />
                                </div>
                                <span className="font-medium">Kedvencek</span>
                              </div>
                              <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-slate-300 transition-colors opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all" />
                            </a>
                          </li>
                        </ul>
                      </div>

                      {/* Logout */}
                      <div className="p-3 border-t border-slate-700/50 mt-2">
                        <a
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            handleLogout()
                          }}
                          className="flex items-center justify-between px-3 py-3 rounded-lg text-slate-200 hover:bg-red-500/10 hover:text-white transition-colors group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500/10 to-red-600/20 flex items-center justify-center text-red-400 group-hover:text-red-300 transition-colors">
                              <LogOut className="h-5 w-5" />
                            </div>
                            <span className="font-medium">Kilépés</span>
                          </div>
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {/* Hamburger Menu Button - csak mobilon */}
                <button
                  id="hamburgerButton"
                  className="text-white p-2 rounded-lg hover:bg-white/10 md:hidden"
                  onClick={toggleMobileMenu}
                >
                  {isMobileMenuOpen ? (
                    <X className="h-6 w-6" />
                  ) : (
                    <Menu className="h-6 w-6" />
                  )}
                </button>
              </div>
            ) : (
              <>
                {/* Bejelentkezés/Regisztráció gombok - Mobilon elrejtve */}
                <div className="hidden md:flex items-center space-x-4">
                  <button className="px-5 py-2 border border-white/20 text-white hover:bg-white/10 rounded-lg transition-all duration-300">
                    <Link to="/register">Regisztráció</Link>
                  </button>
                  <button className="px-5 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 rounded-lg transition-all duration-300 shadow-lg hover:shadow-purple-500/20">
                    <Link to="/login">Bejelentkezés</Link>
                  </button>
                </div>

                {/* Hamburger Menu Button - csak mobilon */}
                <button
                  id="hamburgerButton"
                  className="text-white p-2 rounded-lg hover:bg-white/10 md:hidden"
                  onClick={toggleMobileMenu}
                >
                  {isMobileMenuOpen ? (
                    <X className="h-6 w-6" />
                  ) : (
                    <Menu className="h-6 w-6" />
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobilmenü - Hamburger menü tartalma */}
      {isMobileMenuOpen && (
        <div
          id="mobileMenu"
          className="md:hidden bg-slate-800/95 backdrop-blur-md border-b border-slate-700/50 animate-fadeIn"
        >
          <div className="px-4 py-3 space-y-3">
            {/* Navigációs elemek a mobilmenüben */}
            <div className="space-y-1">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.id, item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${location.pathname === item.path || activeTab === item.id
                    ? "bg-gradient-to-r from-blue-500/20 to-purple-600/20 text-white"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                    } transition-all duration-300`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            {/* Bejelentkezés/Regisztráció gombok a mobilmenüben, ha nincs bejelentkezve */}
            {!isLoggedIn && (
              <div className="flex flex-col space-y-2 pt-3 border-t border-slate-700/50">
                <Link
                  to="/login"
                  className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-center rounded-lg"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Bejelentkezés
                </Link>
                <Link
                  to="/register"
                  className="w-full px-4 py-2 border border-white/20 text-white text-center rounded-lg"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Regisztráció
                </Link>
              </div>
            )}

            {/* Értesítések mobilnézetben, ha be van jelentkezve */}
            {isLoggedIn && (
              <div className="pt-3 border-t border-slate-700/50">
                <button className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-slate-300 hover:bg-white/5 hover:text-white">
                  <div className="flex items-center gap-3">
                    <Bell className="h-5 w-5" />
                    <span>Értesítések</span>
                  </div>
                  {notificationCount > 0 && (
                    <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-gradient-to-r from-pink-500 to-purple-600 rounded-full">
                      {notificationCount}
                    </span>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Asztali navigáció - csak nagyobb képernyőkön */}
      <div className="hidden md:block container mx-auto px-4 pb-4">
        <div className="flex space-x-2 bg-white/5 backdrop-blur-sm border border-white/10 p-1 rounded-lg">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              className={`flex items-center gap-2 px-4 py-2 rounded-md ${location.pathname === item.path || activeTab === item.id
                ? "bg-gradient-to-r from-blue-500/20 to-purple-600/20 text-white"
                : "hover:bg-white/5 text-slate-300 hover:text-white"
                } transition-all duration-300`}
              onClick={() => handleNavigation(item.id, item.path)}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(147, 51, 234, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(147, 51, 234, 0); }
          100% { box-shadow: 0 0 0 0 rgba(147, 51, 234, 0); }
        }
        @keyframes float {
          0% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-20px) translateX(10px); }
          100% { transform: translateY(0) translateX(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }
      `}</style>
    </header>
  )
}

export default Header


