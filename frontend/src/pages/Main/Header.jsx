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
} from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import Cookies from "js-cookie"

const Header = ({ activeTab, setActiveTab }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState("asd")
  const [userEmail, setUserEmail] = useState("asd@asd")
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [notificationCount, setNotificationCount] = useState(3)
  const [selectedBackground, setSelectedBackground] = useState("gradient1")
  const [customBackground, setCustomBackground] = useState(null)
  const fileInputRef = useRef(null)
  const navigate = useNavigate()

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

  // Inicializálás a komponens betöltésekor
  useEffect(() => {
    // Beállítások betöltése localStorage-ból
    loadUserSettings()

    // Token ellenőrzése
    const token = Cookies.get("token")
    if (token) {
      // Try to get user data from localStorage
      const userData = localStorage.getItem("user")

      if (userData) {
        try {
          const user = JSON.parse(userData)
          setUserName("asd") // Felülírva a kért értékkel
          setUserEmail("asd@asd") // Felülírva a kért értékkel
          setIsLoggedIn(true)
        } catch (error) {
          console.error("Error parsing user data:", error)
        }
      } else {
        // If no local data, verify token with backend
        verifyToken(token)
      }
    }
  }, [])

  // Felhasználói beállítások betöltése
  const loadUserSettings = () => {
    try {
      // Háttér beállítás betöltése
      const savedBackground = localStorage.getItem("profileBackground")
      if (savedBackground && backgrounds[savedBackground]) {
        setSelectedBackground(savedBackground)
      }

      // Egyéni háttérkép betöltése
      const savedCustomBackground = localStorage.getItem("customBackground")
      if (savedCustomBackground) {
        setCustomBackground(savedCustomBackground)
      }

      // Profilkép betöltése
      const savedProfilePicture = localStorage.getItem("profilePicture")
      if (savedProfilePicture) {
        setProfilePicture(savedProfilePicture)
      }
    } catch (error) {
      console.error("Hiba a beállítások betöltésekor:", error)
    }
  }

  // Beállítások mentése
  const saveUserSettings = (settings) => {
    try {
      Object.entries(settings).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          localStorage.setItem(key, value)
        }
      })
    } catch (error) {
      console.error("Hiba a beállítások mentésekor:", error)
    }
  }

  // Function to verify token with backend
  const verifyToken = async (token) => {
    try {
      const response = await fetch("http://localhost:8081/api/v1/login", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setIsLoggedIn(true)

        // Felülírva a kért értékekkel
        setUserName("asd")
        setUserEmail("asd@asd")

        // Save to localStorage for future use
        localStorage.setItem(
          "user",
          JSON.stringify({
            email: "asd@asd",
            name: "asd",
          }),
        )
      } else {
        // Token invalid, remove it
        Cookies.remove("token")
      }
    } catch (error) {
      console.error("Error verifying token:", error)
    }
  }

  const handleLogout = () => {
    Cookies.remove("token")
    localStorage.removeItem("user")
    setIsLoggedIn(false)
    setUserName("")
    setUserEmail("")
    setIsProfileOpen(false)
    navigate("/Homepage")
  }

  const toggleProfileDropdown = () => {
    setIsProfileOpen(!isProfileOpen)
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

      if (dropdown && !dropdown.contains(event.target) && avatar && !avatar.contains(event.target)) {
        setIsProfileOpen(false)
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

  // Handle file upload for custom background
  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageDataUrl = e.target.result
        setCustomBackground(imageDataUrl)
        setSelectedBackground("custom")

        // Mentés localStorage-ba
        saveUserSettings({
          customBackground: imageDataUrl,
          profileBackground: "custom",
        })
      }
      reader.readAsDataURL(file)
    }
  }

  // Trigger file input click
  const handleCustomBackgroundClick = () => {
    fileInputRef.current.click()
  }

  // Handle file upload for profile picture
  const handleProfilePicUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageDataUrl = e.target.result
        setProfilePicture(imageDataUrl)

        // Mentés localStorage-ba
        saveUserSettings({
          profilePicture: imageDataUrl,
        })
      }
      reader.readAsDataURL(file)
    }
  }

  // Trigger profile picture file input click
  const handleProfilePicClick = () => {
    profilePicInputRef.current.click()
  }

  // Handle background selection
  const handleBackgroundSelect = (bg) => {
    setSelectedBackground(bg)

    // Mentés localStorage-ba
    saveUserSettings({
      profileBackground: bg,
    })
  }

  return (
    <header className="backdrop-blur-md bg-gradient-to-r from-slate-900/90 to-slate-800/90 border-b border-slate-700/50 sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
            Sporthaver
          </div>
          <div className="hidden md:flex items-center space-x-4">
            {isLoggedIn ? (
              <div className="flex items-center space-x-4">
                {/* Notification Bell */}
                <div className="relative">
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
                          className={`h-40 ${
                            selectedBackground === "custom"
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
                            className={`absolute inset-0 ${
                              selectedBackground === "custom"
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
                                  className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                    selectedBackground === bg ? "ring-2 ring-white" : ""
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
                              className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                selectedBackground === "custom"
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
                                </div>
                                <span className="font-medium">Foglalásaim</span>
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
              </div>
            ) : (
              <>
                <button className="px-5 py-2 border border-white/20 text-white hover:bg-white/10 rounded-lg transition-all duration-300">
                  <Link to="/register">Regisztráció</Link>
                </button>
                <button className="px-5 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 rounded-lg transition-all duration-300 shadow-lg hover:shadow-purple-500/20">
                  <Link to="/login">Bejelentkezés</Link>
                </button>
              </>
            )}
          </div>
          <button className="md:hidden text-white">
            <span className="sr-only">Menü megnyitása</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="container mx-auto px-4 pb-4">
        <div className="flex space-x-4 bg-white/5 backdrop-blur-sm border border-white/10 p-1 rounded-lg">
          {[
            { id: "stays", icon: Hotel, label: "Szállások" },
            { id: "flights", icon: Plane, label: "Repülőjáratok" },
            { id: "cars", icon: Car, label: "Autóbérlés" },
            { id: "attractions", icon: Map, label: "Látnivalók" },
          ].map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              className={`flex items-center gap-2 px-4 py-2 rounded-md ${
                activeTab === id
                  ? "bg-gradient-to-r from-blue-500/20 to-purple-600/20 text-white"
                  : "hover:bg-white/5 text-slate-300 hover:text-white"
              } transition-all duration-300`}
              onClick={() => setActiveTab(id)}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </header>
  )
}

export default Header

