"use client"

import { useState } from "react"
import { X, MapPin, Calendar, Clock, Users, Home, DoorOpen, Car, User } from "lucide-react"

// Placeholder Image component
const Image = ({ src, alt, className }) => (
  <img src={src || "/api/placeholder/300/200"} alt={alt} className={className} />
)

const EventModal = ({ event, onClose }) => {
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [selectedParticipant, setSelectedParticipant] = useState(null)

  // Format date to Hungarian format
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("hu-HU", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "short",
    })
  }

  // Format time from date
  const formatTime = (dateString) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleTimeString("hu-HU", {
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch (error) {
      return "N/A"
    }
  }

  // Check if facility is available
  const isFacilityAvailable = (event, facility) => {
    if (!event.Helyszin) return false

    switch (facility) {
      case "fedett":
        return event.Helyszin.Fedett === true
      case "oltozo":
        return event.Helyszin.Oltozo === true
      case "parkolas":
        return event.Helyszin.Parkolas === "y" || event.Helyszin.Parkolas === true
      default:
        return false
    }
  }

  const openProfileModal = (participant) => {
    setSelectedParticipant(participant)
    setShowProfileModal(true)
  }

  const closeProfileModal = () => {
    setShowProfileModal(false)
    setSelectedParticipant(null)
  }

  // Mock participants data (replace with actual data in production)
  const participants = event.resztvevok_lista || [
    { id: 1, name: "Kovács Péter", image: "/api/placeholder/100/100", age: 28, level: "haladó" },
    { id: 2, name: "Nagy Anna", image: "/api/placeholder/100/100", age: 24, level: "középhaladó" },
    { id: 3, name: "Szabó Gábor", image: "/api/placeholder/100/100", age: 32, level: "profi" },
    { id: 4, name: "Tóth Eszter", image: "/api/placeholder/100/100", age: 26, level: "kezdő" },
  ]

  return (
    <>
      {/* Main Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
        <div className="relative w-full max-w-6xl max-h-[90vh] overflow-auto bg-gradient-to-br from-slate-800 to-zinc-900 rounded-lg shadow-xl">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex flex-col md:flex-row">
            {/* Event Details (Left Side) */}
            <div className="w-full md:w-3/5 p-6 border-b md:border-b-0 md:border-r border-white/20">
              <div className="relative h-64 mb-6 rounded-lg overflow-hidden">
                <Image
                  src={event.imageUrl || "/placeholder.svg"}
                  alt={event.Sportok?.Nev || "Sport esemény"}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-0 left-0 bg-blue-600 text-white px-3 py-1 rounded-br-lg font-medium">
                  {event.Sportok?.Nev || "Sport"}
                </div>
              </div>

              <h2 className="text-2xl font-bold mb-4">{event.Helyszin?.Nev || "Helyszín"}</h2>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-white/80">
                  <MapPin className="h-5 w-5 flex-shrink-0 text-blue-400" />
                  <span>
                    {event.Helyszin?.Telepules || "Város"}, {event.Helyszin?.Cim || "Cím"}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-white/80">
                  <Calendar className="h-5 w-5 flex-shrink-0 text-blue-400" />
                  <span>{formatDate(event.kezdoIdo)}</span>
                </div>

                <div className="flex items-center gap-2 text-white/80">
                  <Clock className="h-5 w-5 flex-shrink-0 text-blue-400" />
                  <span>
                    {formatTime(event.kezdoIdo)} - {formatTime(event.zaroIdo)}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-white/80">
                  <Users className="h-5 w-5 flex-shrink-0 text-blue-400" />
                  <span>
                    {participants.length}/{event.maxResztvevok || 10} résztvevő
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                <span className="px-3 py-1 bg-white/10 rounded-full text-sm">{event.szint || "Ismeretlen szint"}</span>
                {isFacilityAvailable(event, "fedett") && (
                  <span className="px-3 py-1 bg-white/10 rounded-full text-sm flex items-center gap-1">
                    <Home className="h-4 w-4" /> Fedett
                  </span>
                )}
                {isFacilityAvailable(event, "oltozo") && (
                  <span className="px-3 py-1 bg-white/10 rounded-full text-sm flex items-center gap-1">
                    <DoorOpen className="h-4 w-4" /> Öltöző
                  </span>
                )}
                {isFacilityAvailable(event, "parkolas") && (
                  <span className="px-3 py-1 bg-white/10 rounded-full text-sm flex items-center gap-1">
                    <Car className="h-4 w-4" /> Parkolás
                  </span>
                )}
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Leírás</h3>
                <p className="text-white/80 whitespace-pre-line">{event.leiras || "Nincs megadott leírás."}</p>
              </div>

              <div className="flex justify-between items-center">
                <div className="text-white/80">
                  Ár: <span className="font-semibold">{event.ar ? `${event.ar} Ft` : "Ingyenes"}</span>
                </div>
                <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors">
                  Csatlakozás
                </button>
              </div>
            </div>

            {/* Participants (Right Side) */}
            <div className="w-full md:w-2/5 p-6">
              <h3 className="text-xl font-bold mb-4">Résztvevők</h3>

              <div className="space-y-4">
                {participants.length === 0 ? (
                  <p className="text-white/60">Még nincsenek résztvevők.</p>
                ) : (
                  participants.map((participant) => (
                    <div
                      key={participant.id}
                      onClick={() => openProfileModal(participant)}
                      className="flex items-center gap-4 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      <Image
                        src={participant.image || "/placeholder.svg"}
                        alt={participant.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <h4 className="font-medium">{participant.name}</h4>
                        <p className="text-sm text-white/60">
                          {participant.age} éves • {participant.level}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Modal */}
      {showProfileModal && selectedParticipant && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70">
          <div className="relative w-full max-w-md bg-gradient-to-br from-slate-800 to-zinc-900 rounded-lg shadow-xl p-6">
            <button
              onClick={closeProfileModal}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex flex-col items-center text-center">
              <Image
                src={selectedParticipant.image || "/placeholder.svg"}
                alt={selectedParticipant.name}
                className="w-24 h-24 rounded-full object-cover mb-4"
              />
              <h3 className="text-xl font-bold">{selectedParticipant.name}</h3>
              <p className="text-white/60 mb-4">
                {selectedParticipant.age} éves • {selectedParticipant.level}
              </p>

              <div className="w-full space-y-4 mt-2">
                <div className="bg-white/5 p-4 rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <User className="h-4 w-4" /> Profil
                  </h4>
                  <p className="text-sm text-white/80">
                    {selectedParticipant.bio || "Ez a felhasználó még nem adott meg bemutatkozást."}
                  </p>
                </div>

                <div className="bg-white/5 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Kedvenc sportok</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedParticipant.sports?.map((sport, index) => (
                      <span key={index} className="px-3 py-1 bg-white/10 rounded-full text-sm">
                        {sport}
                      </span>
                    )) || <span className="text-sm text-white/60">Nincs megadva kedvenc sport.</span>}
                  </div>
                </div>

                <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors">
                  Kapcsolatfelvétel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default EventModal

