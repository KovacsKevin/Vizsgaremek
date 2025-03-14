"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { EventModal } from "./event-modal" // Import the new modal component

export function OffersSection() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalContent, setModalContent] = useState({ title: "", description: "" })
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const navigate = useNavigate()

  // Check authentication status when component mounts
  useEffect(() => {
    checkAuthStatus()
  }, [])

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

  const openModal = (title, description) => {
    setModalContent({ title, description })
    setIsModalOpen(true)
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
          openModal("Esemény létrehozása", "Töltsd ki az alábbi űrlapot az esemény létrehozásához")
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

  const handlePlanEvent = () => {
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
          openModal("Esemény tervezése", "Töltsd ki az alábbi űrlapot az esemény tervezéséhez")
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

          {/* Second Offer Card */}
          <div className="bg-slate-800 rounded-lg overflow-hidden shadow-lg">
            <div className="relative h-48 w-full bg-slate-700 flex items-center justify-center">
              {/* Fix Image component usage */}
              <div className="w-full h-full bg-slate-700 flex items-center justify-center text-gray-400">
                Image Placeholder
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-100 mb-2">Tervezz egy új eseményt!</h3>
              <p className="text-gray-400 mb-4">Események, amiket könnyedén szervezhetsz és élvezhetsz</p>
              <button
                onClick={handlePlanEvent}
                className="bg-zinc-700 hover:bg-zinc-600 text-gray-100 py-2 px-4 rounded transition duration-300"
              >
                Tervezz most!
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Use the new EventModal component instead of inline modal */}
      <EventModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        modalContent={modalContent} 
      />
    </section>
  )
}

export default OffersSection