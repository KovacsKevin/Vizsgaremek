"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { EventModal } from "./event-modal" 
import { HelyszinModal } from "./helyszin-modal"

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
      const token = localStorage.getItem("token") || document.cookie.replace(/(?:(?:^|.*;\s*)token\s*=\s*([^;]*).*$)|^.*$/, "$1")
      
      if (!token) return
      
      const response = await fetch("http://localhost:8081/api/v1/helyszinek", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
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
      const token = localStorage.getItem("token") || document.cookie.replace(/(?:(?:^|.*;\s*)token\s*=\s*([^;]*).*$)|^.*$/, "$1")
      
      if (!token) {
        setIsAuthenticated(false)
        return
      }
      
      const response = await fetch("http://localhost:8081/api/v1/login", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
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
      description: "Töltsd ki az alábbi űrlapot az esemény létrehozásához" 
    })
    setIsEventModalOpen(true)
  }

  const openHelyszinModal = () => {
    setModalContent({ 
      title: "Helyszín létrehozása", 
      description: "Add meg a helyszín adatait" 
    })
    setIsHelyszinModalOpen(true)
  }

  const handleEventCreation = () => {
    // JWT token ellenőrzése
    const token = localStorage.getItem("token") || document.cookie.replace(/(?:(?:^|.*;\s*)token\s*=\s*([^;]*).*$)|^.*$/, "$1")
    
    if (token) {
      // Ha van token, ellenőrizzük az érvényességét a szerveren
      fetch("http://localhost:8081/api/v1/login", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      })
      .then(response => {
        if (response.ok) {
          return response.json()
        } else {
          // Ha a token érvénytelen, irányítsuk a felhasználót a bejelentkezési oldalra
          navigate("/login")
          throw new Error("Invalid token")
        }
      })
      .then(data => {
        if (data.isAuthenticated) {
          // Ha érvényes a token, nyissuk meg a modált
          openEventModal()
        } else {
          navigate("/login")
        }
      })
      .catch(error => {
        console.error("Authentication error:", error)
        navigate("/login")
      })
    } else {
      // Ha nincs token, irányítsuk a felhasználót a bejelentkezési oldalra
      navigate("/login")
    }
  }

  const handleHelyszinCreation = () => {
    // JWT token ellenőrzése
    const token = localStorage.getItem("token") || document.cookie.replace(/(?:(?:^|.*;\s*)token\s*=\s*([^;]*).*$)|^.*$/, "$1")
    
    if (token) {
      // Ha van token, ellenőrizzük az érvényességét a szerveren
      fetch("http://localhost:8081/api/v1/login", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      })
      .then(response => {
        if (response.ok) {
          return response.json()
        } else {
          // Ha a token érvénytelen, irányítsuk a felhasználót a bejelentkezési oldalra
          navigate("/login")
          throw new Error("Invalid token")
        }
      })
      .then(data => {
        if (data.isAuthenticated) {
          // Ha érvényes a token, nyissuk meg a modált
          openHelyszinModal()
        } else {
          navigate("/login")
        }
      })
      .catch(error => {
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
    setLocations(prevLocations => [...prevLocations, newLocation])
  }

  return (
    <section className="py-12 bg-slate-900">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-2 text-gray-100">Esemény létrehozása</h2>
        <p className="text-gray-400 mb-8">Hogy te dönts kivel, mikor, hol és mit játszol!</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* First Offer Card */}
          <div className="bg-slate-800 rounded-lg overflow-hidden shadow-lg">
            <div className="relative h-48 w-full bg-slate-700 flex items-center justify-center">
              {/* Fix Image component usage */}
              <div className="w-full h-full bg-slate-700 flex items-center justify-center text-gray-400">
                Image Placeholder
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-100 mb-2">Hozz létre saját eseményt!</h3>
              <p className="text-gray-400 mb-4">A gomb megnyomásával megadhatod az eseményed adatait</p>
              <button
                onClick={handleEventCreation}
                className="bg-zinc-700 hover:bg-zinc-600 text-gray-100 py-2 px-4 rounded transition duration-300"
              >
                Esemény létrehozása
              </button>
            </div>
          </div>

          {/* Second Offer Card - Updated for Location Creation */}
          <div className="bg-slate-800 rounded-lg overflow-hidden shadow-lg">
            <div className="relative h-48 w-full bg-slate-700 flex items-center justify-center">
              {/* Fix Image component usage */}
              <div className="w-full h-full bg-slate-700 flex items-center justify-center text-gray-400">
                Image Placeholder
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-100 mb-2">Hozz létre új helyszínt!</h3>
              <p className="text-gray-400 mb-4">Add meg a helyszín adatait, amit később eseményekhez használhatsz</p>
              <button
                onClick={handleHelyszinCreation}
                className="bg-zinc-700 hover:bg-zinc-600 text-gray-100 py-2 px-4 rounded transition duration-300"
              >
                Helyszín létrehozása
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