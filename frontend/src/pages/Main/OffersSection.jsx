"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { EventModal } from "./event-modal"
import { HelyszinModal } from "./helyszin-modal"
import { Calendar, ArrowRight } from "lucide-react"

export function OffersSection() {
  const [isEventModalOpen, setIsEventModalOpen] = useState(false)
  const [isHelyszinModalOpen, setIsHelyszinModalOpen] = useState(false)
  const [modalContent, setModalContent] = useState({ title: "", description: "" })
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [locations, setLocations] = useState([])
  const navigate = useNavigate()

  // Check authentication status when component mounts
  useEffect(() => {
    checkAuthStatus()
    fetchLocations()
  }, [])

  // Function to fetch locations
  const fetchLocations = async () => {
    try {
      const token =
        localStorage.getItem("token") || document.cookie.replace(/(?:(?:^|.*;\s*)token\s*=\s*([^;]*).*$)|^.*$/, "$1")

      if (!token) return

      const response = await fetch("http://localhost:8081/api/v1/helyszinek", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setLocations(data)
      }
    } catch (error) {
      console.error("Error fetching locations:", error)
    }
  }

  // Function to check if user is authenticated
  const checkAuthStatus = async () => {
    try {
      const token =
        localStorage.getItem("token") || document.cookie.replace(/(?:(?:^|.*;\s*)token\s*=\s*([^;]*).*$)|^.*$/, "$1")

      if (!token) {
        setIsAuthenticated(false)
        return
      }

      const response = await fetch("http://localhost:8081/api/v1/login", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setIsAuthenticated(data.isAuthenticated)
      } else {
        setIsAuthenticated(false)
      }
    } catch (error) {
      console.error("Error checking authentication status:", error)
      setIsAuthenticated(false)
    }
  }

  const openEventModal = () => {
    setModalContent({
      title: "Esemény létrehozása",
      description: "Töltsd ki az alábbi űrlapot az esemény létrehozásához",
    })
    setIsEventModalOpen(true)
  }

  const openHelyszinModal = () => {
    setModalContent({
      title: "Helyszín létrehozása",
      description: "Add meg a helyszín adatait",
    })
    setIsHelyszinModalOpen(true)
  }

  const handleEventCreation = () => {
    // JWT token ellenőrzése
    const token =
      localStorage.getItem("token") || document.cookie.replace(/(?:(?:^|.*;\s*)token\s*=\s*([^;]*).*$)|^.*$/, "$1")

    if (token) {
      // Ha van token, ellenőrizzük az érvényességét a szerveren
      fetch("http://localhost:8081/api/v1/login", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => {
          if (response.ok) {
            return response.json()
          } else {
            // Ha a token érvénytelen, irányítsuk a felhasználót a bejelentkezési oldalra
            navigate("/login")
            throw new Error("Invalid token")
          }
        })
        .then((data) => {
          if (data.isAuthenticated) {
            // Ha érvényes a token, nyissuk meg a modált
            openEventModal()
          } else {
            navigate("/login")
          }
        })
        .catch((error) => {
          console.error("Authentication error:", error)
          navigate("/login")
        })
    } else {
      // Ha nincs token, irányítsuk a felhasználót a bejelentkezési oldalra
      navigate("/login")
    }
  }

  // Handle successful location creation
  const handleLocationSuccess = (newLocation) => {
    // Add the new location to the locations state
    setLocations((prevLocations) => [...prevLocations, newLocation])
  }

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a] to-slate-800 z-0"></div>
      <div className="absolute inset-0 opacity-30 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(147,51,234,0.2),transparent_40%)]"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_80%,rgba(79,70,229,0.2),transparent_40%)]"></div>
      </div>

      {/* Animated particles */}
      <div className="absolute inset-0 overflow-hidden z-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white/10"
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

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400">
            Esemény létrehozása
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">Hogy te dönts kivel, mikor, hol és mit játszol!</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-1 gap-8 max-w-4xl mx-auto">
          {/* Event Creation Card */}
          <div className="group relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl overflow-hidden shadow-xl border border-slate-700/50 hover:border-purple-500/30 transition-all duration-500 hover:shadow-purple-500/10">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <div className="relative h-64 w-full overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-indigo-600/20 group-hover:opacity-70 transition-opacity duration-500 z-10"></div>
              <div className="w-full h-full bg-slate-700 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517649763962-0c623066013b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80')] bg-cover bg-center opacity-40 group-hover:scale-110 transition-transform duration-700"></div>
                <Calendar className="w-20 h-20 text-white/50 z-10 group-hover:scale-110 transition-transform duration-500" />
              </div>
            </div>

            <div className="p-8 relative">
              <div className="absolute top-0 right-0 -mt-12 mr-8 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full p-3 shadow-lg shadow-purple-700/30 transform group-hover:scale-110 transition-transform duration-500">
                <Calendar className="h-6 w-6 text-white" />
              </div>

              <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-purple-300 transition-colors duration-300">
                Hozz létre saját eseményt!
              </h3>

              <p className="text-gray-400 mb-6 group-hover:text-gray-300 transition-colors duration-300">
                Szervezz sportesemények, találj játékostársakat, és élvezd a közös sportolás élményét. Csak néhány
                kattintás, és már kezdődhet is a játék!
              </p>

              <button
                onClick={handleEventCreation}
                className="flex items-center justify-between w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-3 px-6 rounded-xl transition duration-300 shadow-lg shadow-purple-700/20 hover:shadow-purple-700/40 group"
              >
                <span className="font-medium">Esemény létrehozása</span>
                <ArrowRight className="h-5 w-5 transform group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Event Modal for creating events */}
      <EventModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        modalContent={modalContent}
        locations={locations}
        openHelyszinModal={openHelyszinModal}
        openSportModal={() => {}} // Placeholder for sport modal
      />

      {/* Location Modal for creating locations */}
      <HelyszinModal
        isOpen={isHelyszinModalOpen}
        onClose={() => setIsHelyszinModalOpen(false)}
        modalContent={modalContent}
        onSuccess={handleLocationSuccess}
      />
    </section>
  )
}

export default OffersSection

