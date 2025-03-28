"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Header from './Header'
import { Calendar, MapPin, Users, Clock, Plus, Loader } from "lucide-react"
import Cookies from "js-cookie"

const MyEvents = () => {
  const [activeTab, setActiveTab] = useState("myevents")
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchOrganizedEvents = async () => {
      try {
        const token = Cookies.get("token")
        if (!token) {
          navigate("/login")
          return
        }

        setLoading(true)
        const response = await fetch("http://localhost:8081/api/v1/organized-events", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        if (!response.ok) {
          if (response.status === 404) {
            // Nincs esemény, de ez nem hiba
            setEvents([])
            return
          }
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        setEvents(data.events)
      } catch (err) {
        console.error("Hiba a szervezett események lekérésekor:", err)
        setError("Nem sikerült betölteni az eseményeket. Kérjük, próbáld újra később.")
      } finally {
        setLoading(false)
      }
    }

    fetchOrganizedEvents()
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
          
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader className="w-10 h-10 text-purple-500 animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-10 text-red-400">
              <p>{error}</p>
            </div>
          ) : events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-20 h-20 bg-slate-700/50 rounded-full flex items-center justify-center mb-4">
                <Calendar className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Még nincsenek szervezett eseményeid</h3>
              <p className="text-slate-400 max-w-md mb-6">
                Hozz létre új eseményt, hogy itt megjelenjen.
              </p>
              <button 
                onClick={() => navigate("/create-event")}
                className="px-5 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 rounded-lg transition-all duration-300 shadow-lg hover:shadow-purple-500/20"
              >
                Új esemény létrehozása
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
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
                      <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-full">Szervező</span>
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
