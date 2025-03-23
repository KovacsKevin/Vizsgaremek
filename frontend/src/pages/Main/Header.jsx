"use client"

import { useState, useEffect } from "react"
import {
  Hotel,
  Plane,
  Car,
  Map,
  LogOut,
  Settings,
  User,
  LayoutDashboard,
  ChevronRight,
  Bell,
  Calendar,
  CreditCard,
  Heart,
} from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import Cookies from "js-cookie"

const Header = ({ activeTab, setActiveTab }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState("asd")
  const [userEmail, setUserEmail] = useState("asd@asd")
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [notificationCount, setNotificationCount] = useState(3)
  const navigate = useNavigate()

  useEffect(() => {
    // Check if token exists
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
                    <span className="font-bold text-white text-sm group-hover:scale-110 transition-transform duration-300">
                      {getUserInitials()}
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
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 h-32 overflow-hidden">
                          <div
                            className="absolute inset-0"
                            style={{
                              backgroundImage:
                                "url(\"data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%239C92AC' fillOpacity='0.1' fillRule='evenodd'/%3E%3C/svg%3E\")",
                              backgroundSize: "30px 30px",
                            }}
                          ></div>
                        </div>

                        {/* User Info */}
                        <div className="relative pt-20 px-6 pb-6">
                          <div className="absolute -top-10 left-6">
                            <div
                              className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-1 shadow-lg shadow-purple-500/20"
                              style={{ animation: "gradient-shift 3s ease infinite" }}
                            >
                              <div className="w-full h-full rounded-xl bg-slate-800 flex items-center justify-center">
                                <span className="font-bold text-white text-2xl">{getUserInitials()}</span>
                              </div>
                            </div>
                          </div>

                          <div className="ml-24">
                            <div className="font-bold text-white text-xl">{userName}</div>
                            <div className="text-slate-300 text-sm truncate">{userEmail}</div>
                            <div className="mt-2">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                                Premium Felhasználó
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Quick Stats */}
                      <div className="grid grid-cols-3 gap-1 px-3 py-3 bg-slate-800/50">
                        <div className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-slate-700/50 transition-colors cursor-pointer">
                          <div className="text-purple-400 font-semibold">12</div>
                          <div className="text-xs text-slate-400">Foglalás</div>
                        </div>
                        <div className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-slate-700/50 transition-colors cursor-pointer">
                          <div className="text-blue-400 font-semibold">3250</div>
                          <div className="text-xs text-slate-400">Pontok</div>
                        </div>
                        <div className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-slate-700/50 transition-colors cursor-pointer">
                          <div className="text-pink-400 font-semibold">5</div>
                          <div className="text-xs text-slate-400">Kedvencek</div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2 px-3">
                        <div className="text-xs uppercase text-slate-500 font-semibold px-3 py-2">Fiókom</div>
                        <ul className="space-y-1">
                          <li>
                            <a
                              href="/dashboard"
                              className="flex items-center justify-between px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-700/50 hover:text-white transition-colors group"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-600/20 flex items-center justify-center text-blue-400 group-hover:text-blue-300 transition-colors">
                                  <LayoutDashboard className="h-5 w-5" />
                                </div>
                                <span>Irányítópult</span>
                              </div>
                              <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-slate-300 transition-colors opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all" />
                            </a>
                          </li>
                          <li>
                            <a
                              href="/profile"
                              className="flex items-center justify-between px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-700/50 hover:text-white transition-colors group"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-600/20 flex items-center justify-center text-purple-400 group-hover:text-purple-300 transition-colors">
                                  <User className="h-5 w-5" />
                                </div>
                                <span>Profil</span>
                              </div>
                              <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-slate-300 transition-colors opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all" />
                            </a>
                          </li>
                          <li>
                            <a
                              href="/bookings"
                              className="flex items-center justify-between px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-700/50 hover:text-white transition-colors group"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-green-500/10 to-green-600/20 flex items-center justify-center text-green-400 group-hover:text-green-300 transition-colors">
                                  <Calendar className="h-5 w-5" />
                                </div>
                                <span>Foglalásaim</span>
                              </div>
                              <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-slate-300 transition-colors opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all" />
                            </a>
                          </li>
                          <li>
                            <a
                              href="/favorites"
                              className="flex items-center justify-between px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-700/50 hover:text-white transition-colors group"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-pink-500/10 to-pink-600/20 flex items-center justify-center text-pink-400 group-hover:text-pink-300 transition-colors">
                                  <Heart className="h-5 w-5" />
                                </div>
                                <span>Kedvencek</span>
                              </div>
                              <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-slate-300 transition-colors opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all" />
                            </a>
                          </li>
                          <li>
                            <a
                              href="/payment"
                              className="flex items-center justify-between px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-700/50 hover:text-white transition-colors group"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-yellow-500/10 to-yellow-600/20 flex items-center justify-center text-yellow-400 group-hover:text-yellow-300 transition-colors">
                                  <CreditCard className="h-5 w-5" />
                                </div>
                                <span>Fizetési módok</span>
                              </div>
                              <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-slate-300 transition-colors opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all" />
                            </a>
                          </li>
                          <li>
                            <a
                              href="/settings"
                              className="flex items-center justify-between px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-700/50 hover:text-white transition-colors group"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-slate-500/10 to-slate-600/20 flex items-center justify-center text-slate-400 group-hover:text-slate-300 transition-colors">
                                  <Settings className="h-5 w-5" />
                                </div>
                                <span>Beállítások</span>
                              </div>
                              <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-slate-300 transition-colors opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all" />
                            </a>
                          </li>
                        </ul>
                      </div>

                      {/* Logout */}
                      <div className="p-3 border-t border-slate-700/50">
                        <a
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            handleLogout()
                          }}
                          className="flex items-center justify-between px-3 py-2 rounded-lg text-slate-200 hover:bg-red-500/10 hover:text-white transition-colors group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-red-500/10 to-red-600/20 flex items-center justify-center text-red-400 group-hover:text-red-300 transition-colors">
                              <LogOut className="h-5 w-5" />
                            </div>
                            <span>Kilépés</span>
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

