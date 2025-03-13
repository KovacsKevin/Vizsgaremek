"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-lg max-w-[600px] w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-100">{modalContent.title}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-100">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            <p className="text-gray-400 mb-6">{modalContent.description}</p>
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="grid gap-6 mb-6 md:grid-cols-2">
                <div>
                  <label htmlFor="event_name" className="block mb-2 text-sm font-medium text-gray-300">
                    Event name
                  </label>
                  <input
                    type="text"
                    id="event_name"
                    className="bg-slate-700 border border-slate-600 text-gray-100 text-sm rounded-lg focus:ring-zinc-500 focus:border-zinc-500 block w-full p-2.5"
                    placeholder="Game Night"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="event_date" className="block mb-2 text-sm font-medium text-gray-300">
                    Event date
                  </label>
                  <input
                    type="date"
                    id="event_date"
                    className="bg-slate-700 border border-slate-600 text-gray-100 text-sm rounded-lg focus:ring-zinc-500 focus:border-zinc-500 block w-full p-2.5"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="event_time" className="block mb-2 text-sm font-medium text-gray-300">
                    Event time
                  </label>
                  <input
                    type="time"
                    id="event_time"
                    className="bg-slate-700 border border-slate-600 text-gray-100 text-sm rounded-lg focus:ring-zinc-500 focus:border-zinc-500 block w-full p-2.5"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="location" className="block mb-2 text-sm font-medium text-gray-300">
                    Location
                  </label>
                  <input
                    type="text"
                    id="location"
                    className="bg-slate-700 border border-slate-600 text-gray-100 text-sm rounded-lg focus:ring-zinc-500 focus:border-zinc-500 block w-full p-2.5"
                    placeholder="City Park"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="max_participants" className="block mb-2 text-sm font-medium text-gray-300">
                    Max participants
                  </label>
                  <input
                    type="number"
                    id="max_participants"
                    className="bg-slate-700 border border-slate-600 text-gray-100 text-sm rounded-lg focus:ring-zinc-500 focus:border-zinc-500 block w-full p-2.5"
                    placeholder="10"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="game_type" className="block mb-2 text-sm font-medium text-gray-300">
                    Game type
                  </label>
                  <input
                    type="text"
                    id="game_type"
                    className="bg-slate-700 border border-slate-600 text-gray-100 text-sm rounded-lg focus:ring-zinc-500 focus:border-zinc-500 block w-full p-2.5"
                    placeholder="Board game, Video game, etc."
                    required
                  />
                </div>
              </div>
              <div className="mb-6">
                <label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-300">
                  Event description
                </label>
                <textarea
                  id="description"
                  rows={4}
                  className="bg-slate-700 border border-slate-600 text-gray-100 text-sm rounded-lg focus:ring-zinc-500 focus:border-zinc-500 block w-full p-2.5"
                  placeholder="Describe your event..."
                  required
                ></textarea>
              </div>
              <div className="flex items-start mb-6">
                <div className="flex items-center h-5">
                  <input
                    id="terms"
                    type="checkbox"
                    value=""
                    className="w-4 h-4 border border-gray-600 rounded bg-gray-700 focus:ring-3 focus:ring-zinc-600"
                    required
                  />
                </div>
                <label htmlFor="terms" className="ms-2 text-sm font-medium text-gray-300">
                  I agree with the{" "}
                  <a href="#" className="text-zinc-500 hover:underline">
                    terms and conditions
                  </a>
                  .
                </label>
              </div>
              <button
                type="submit"
                className="text-gray-100 bg-zinc-700 hover:bg-zinc-600 focus:ring-4 focus:outline-none focus:ring-zinc-600 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center transition duration-300"
              >
                Create Event
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}

export default OffersSection