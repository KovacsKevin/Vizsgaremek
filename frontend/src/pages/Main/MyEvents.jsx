"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Header from './Header'
import { Calendar, MapPin, Users, Clock, Plus, Loader, Filter } from "lucide-react"
import Cookies from "js-cookie"

const MyEvents = () => {
  const [activeTab, setActiveTab] = useState("myevents")
  const [organizedEvents, setOrganizedEvents] = useState([])
  const [participatedEvents, setParticipatedEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeFilter, setActiveFilter] = useState("all") // "all", "organized", "participated"
  const navigate = useNavigate()

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = Cookies.get("token")
        if (!token) {
          navigate("/login")
          return
        }

        setLoading(true)
        
        // Párhuzamosan lekérjük mindkét típusú eseményt
        const [organizedResponse, participatedResponse] = await Promise.allSettled([
          fetch("http://localhost:8081/api/v1/organized-events", {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch("http://localhost:8081/api/v1/participated-events", {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        // Szervezett események feldolgozása
        if (organizedResponse.status === 'fulfilled') {
          if (organizedResponse.value.ok) {
            const data = await organizedResponse.value.json();
            setOrganizedEvents(data.events);
          } else if (organizedResponse.value.status !== 404) {
            console.error("Hiba a szervezett események lekérésekor");
          }
        }

        // Résztvevőként szereplő események feldolgozása
        if (participatedResponse.status === 'fulfilled') {
          if (participatedResponse.value.ok) {
            const data = await participatedResponse.value.json();
            setParticipatedEvents(data.events);
          } else if (participatedResponse.value.status !== 404) {
            console.error("Hiba a résztvevőként szereplő események lekérésekor");
          }
        }

      } catch (err) {
        console.error("Hiba az események lekérésekor:", err)
        setError("Nem sikerült betölteni az eseményeket. Kérjük, próbáld újra később.")
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [navigate])

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('hu-HU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Szűrt események a kiválasztott filter alapján
  const filteredEvents = () => {
    if (activeFilter === "organized") return organizedEvents;
    if (activeFilter === "participated") return participatedEvents;
    // "all" esetén mindkét típusú eseményt megjelenítjük
    return [...organizedEvents, ...participatedEvents];
  }

  // Esemény típusának meghatározása (szervező vagy játékos)
  const getEventRole = (eventId) => {
    return organizedEvents.some(event => event.id === eventId) ? "szervező" : "játékos";
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-800 to-zinc-900 text-white">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="bg-slate-800/50 backdrop-blur-md rounded-xl p-6 shadow-xl border border-slate-700/50">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
              Eseményeim
            </h1>
            <button 
              onClick={() => navigate("/create-event")}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 rounded-lg transition-all duration-300 shadow-lg hover:shadow-purple-500/20"
            >
              <Plus size={18} />
              <span>Új esemény</span>
            </button>
          </div>
          
          {/* Szűrők */}
          <div className="flex mb-6 space-x-2 bg-slate-700/30 p-1 rounded-lg w-fit">
            <button 
              onClick={() => setActiveFilter("all")}
              className={`px-4 py-2 rounded-md transition-all ${
                activeFilter === "all" 
                  ? "bg-gradient-to-r from-blue-500/20 to-purple-600/20 text-white" 
                  : "text-slate-300 hover:bg-white/5"
              }`}
            >
              Összes
            </button>
            <button 
              onClick={() => setActiveFilter("organized")}
              className={`px-4 py-2 rounded-md transition-all ${
                activeFilter === "organized" 
                  ? "bg-gradient-to-r from-green-500/20 to-emerald-600/20 text-white" 
                  : "text-slate-300 hover:bg-white/5"
              }`}
            >
              Szervezőként
            </button>
            <button 
              onClick={() => setActiveFilter("participated")}
              className={`px-4 py-2 rounded-md transition-all ${
                activeFilter === "participated" 
                  ? "bg-gradient-to-r from-blue-500/20 to-cyan-600/20 text-white" 
                  : "text-slate-300 hover:bg-white/5"
              }`}
            >
              Résztvevőként
            </button>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader className="w-10 h-10 text-purple-500 animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-10 text-red-400">
              <p>{error}</p>
            </div>
          ) : filteredEvents().length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-20 h-20 bg-slate-700/50 rounded-full flex items-center justify-center mb-4">
                <Calendar className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {activeFilter === "organized" 
                  ? "Még nincsenek szervezett eseményeid" 
                  : activeFilter === "participated" 
                    ? "Még nem veszel részt eseményeken" 
                    : "Még nincsenek eseményeid"}
              </h3>
              <p className="text-slate-400 max-w-md mb-6">
                {activeFilter === "organized" 
                  ? "Hozz létre új eseményt, hogy itt megjelenjen." 
                  : activeFilter === "participated" 
                    ? "Csatlakozz eseményekhez, hogy itt megjelenjenek." 
                    : "Hozz létre vagy csatlakozz eseményekhez, hogy itt megjelenjenek."}
              </p>
              <button 
                onClick={() => navigate("/create-event")}
                className="px-5 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 rounded-lg transition-all duration-300 shadow-lg hover:shadow-purple-500/20"
              >
                {activeFilter === "participated" ? "Események böngészése" : "Új esemény létrehozása"}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents().map((event) => (
                <div 
                  key={event.id} 
                  className="bg-slate-700/50 rounded-lg overflow-hidden border border-slate-600/50 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10"
                >
                  <div className="h-40 bg-slate-600 overflow-hidden">
                    <img 
                      src={event.imageUrl || event.Sport?.KepUrl || "/placeholder.svg"} 
                      alt={event.Sport?.Nev || "Esemény kép"} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-xl font-semibold mb-2 truncate">{event.Sport?.Nev || "Esemény"}</h3>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-slate-300">
                        <MapPin size={16} className="mr-2 text-slate-400" />
                        <span>{event.Helyszin?.Nev || "Ismeretlen helyszín"}, {event.Helyszin?.Telepules || ""}</span>
                      </div>
                      <div className="flex items-center text-sm text-slate-300">
                        <Clock size={16} className="mr-2 text-slate-400" />
                        <span>{formatDate(event.kezdoIdo)}</span>
                      </div>
                      <div className="flex items-center text-sm text-slate-300">
                        <Users size={16} className="mr-2 text-slate-400" />
                        <span>Max. {event.maximumLetszam} fő</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        getEventRole(event.id) === "szervező" 
                          ? "bg-green-500/20 text-green-400" 
                          : "bg-blue-500/20 text-blue-400"
                      }`}>
                        {getEventRole(event.id) === "szervező" ? "Szervező" : "Résztvevő"}
                      </span>
                      <button 
                        onClick={() => navigate(`/event/${event.id}`)}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-md text-sm transition-colors"
                      >
                        Részletek
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default MyEvents
