"use client"

import { useState, useEffect } from "react"
import {
  Calendar,
  Users,
  MapPin,
  Clock,
  Heart,
  Car,
  Home,
  DoorOpen,
  ChevronRight,
  Loader,
} from "lucide-react"
import EventModal from "./sport-event-details-modal"

// Placeholder Image component
const Image = ({ src, alt, className }) => (
  <img src={src || "/api/placeholder/300/200"} alt={alt} className={className} />
)

const SportMateFinder = () => {
  // Új függvény URL paraméterek olvasására
  const getQueryParams = () => {
    const params = new URLSearchParams(window.location.search)
    return {
      telepules: params.get("telepules"),
      sport: params.get("sport"),
    }
  }

  // Add this function to get the authentication token
  const getAuthToken = () => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; token=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  };

  const [favorites, setFavorites] = useState([])
  const [selectedSport, setSelectedSport] = useState(null)
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [expandedDescriptions, setExpandedDescriptions] = useState([])
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [userAge, setUserAge] = useState(null)

  // Inicializálás URL paraméterekből
  useEffect(() => {
    const { telepules, sport } = getQueryParams()

    // Update selected location and sport from query parameters if they exist
    if (telepules) {
      setSelectedLocation(decodeURIComponent(telepules))
    }

    if (sport) {
      setSelectedSport(decodeURIComponent(sport))
    }
  }, [])

  // Fetch events from API
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError(null);
      try {
        // Use query params or defaults
        const sportParam = selectedSport || "Kosárlabda"; // Default to Kosárlabda if no sport selected
        const locationParam = selectedLocation || "Budapest"; // Default to Budapest if no location selected

        // Get the authentication token
        const token = getAuthToken();

        // Determine which API endpoint to use based on whether we have a token
        let apiUrl;
        let headers = {};

        if (token) {
          // Use the age-filtered endpoint if we have a token
          apiUrl = `http://localhost:8081/api/v1/getEsemenyekByAge/${encodeURIComponent(locationParam)}/${encodeURIComponent(sportParam)}`;
          headers = {
            "Authorization": `Bearer ${token}`
          };
        } else {
          // Fall back to the regular endpoint if no token is available
          apiUrl = `http://localhost:8081/api/v1/getEsemenyek/${encodeURIComponent(locationParam)}/${encodeURIComponent(sportParam)}`;
        }

        const response = await fetch(apiUrl, { headers });
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();
        setEvents(data.events || []);

        // If we got user age information, we can display it
        if (data.userAge) {
          console.log(`Events filtered for user age: ${data.userAge}`);
        }
      } catch (err) {
        console.error("Failed to fetch events:", err);
        setError("Nem sikerült betölteni az eseményeket. Kérjük, próbálja újra később.");
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if we have both parameters or if we're using defaults
    if (selectedLocation || selectedSport) {
      fetchEvents()
    }
  }, [selectedSport, selectedLocation])

  const toggleFavorite = (id) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  const toggleDescription = (id) => {
    setExpandedDescriptions((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  const openEventModal = (event) => {
    setSelectedEvent(event)
    setShowModal(true)
  }

  const closeEventModal = () => {
    setShowModal(false)
    setSelectedEvent(null)
  }

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 to-zinc-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2 text-center">SportMate - Találj Sporttársakat</h1>

        {/* Display active filters */}
        {(selectedLocation || selectedSport) && (
          <div className="mb-6 text-center">
            <p className="text-white/70">
              Szűrés: {selectedLocation && `Település: ${selectedLocation}`}
              {selectedLocation && selectedSport && " | "}
              {selectedSport && `Sport: ${selectedSport}`}
            </p>
          </div>
        )}

        {/* Search Results */}
        <div className="w-full">
          {loading ? (
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-lg p-8 text-center">
              <Loader className="h-8 w-8 animate-spin mx-auto text-blue-400" />
              <p className="mt-4">Események betöltése...</p>
            </div>
          ) : error ? (
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-lg p-8 text-center">
              <p className="text-red-400 text-lg">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Újra próbálkozás
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {events.length === 0 ? (
                <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-lg p-8 text-center">
                  <p className="text-lg">Nincs a keresési feltételeknek megfelelő esemény.</p>
                  <p className="text-white/60 mt-2">
                    {selectedLocation && selectedSport
                      ? `Nem találtunk eseményeket "${selectedLocation}" településen "${selectedSport}" sportágban.`
                      : "Próbáld módosítani a szűrőket vagy hozz létre egy új eseményt."}
                  </p>
                </div>
              ) : (
                events.map((event) => (
                  <div
                    key={event.id}
                    className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-lg overflow-hidden hover:border-white/40 transition-all duration-300"
                  >
                    <div className="flex flex-col md:flex-row">
                      <div className="w-full md:w-72 relative">
                        <Image
                          src={event.imageUrl || "/placeholder.svg"}
                          alt={event.Sportok?.Nev || "Sport esemény"}
                          className="w-full h-48 md:h-full object-cover"
                        />
                        <div className="absolute top-0 left-0 bg-blue-600 text-white px-3 py-1 rounded-br-lg font-medium">
                          {event.Sportok?.Nev || selectedSport || "Sport"}
                        </div>
                        <button
                          onClick={() => toggleFavorite(event.id)}
                          className="absolute top-4 right-4 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors"
                        >
                          <Heart
                            className={`h-5 w-5 transition-colors ${
                              favorites.includes(event.id) ? "fill-red-500 text-red-500" : ""
                            }`}
                          />
                        </button>
                      </div>

                      <div className="flex-1 p-6">
                        <div className="flex flex-col md:flex-row justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-xl font-bold">{event.Helyszin?.Nev || "Helyszín"}</h3>
                              <span className="px-2 py-0.5 bg-white/10 text-white/80 rounded text-xs">
                                {event.szint || "Ismeretlen szint"}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 mt-1 text-white/60">
                              <MapPin className="h-4 w-4 flex-shrink-0" />
                              <span>
                                {event.Helyszin?.Telepules || selectedLocation || "Város"},{" "}
                                {event.Helyszin?.Cim || "Cím"}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 mt-1 text-white/60">
                              <Calendar className="h-4 w-4 flex-shrink-0" />
                              <span>{formatDate(event.kezdoIdo)}</span>
                            </div>

                            <div className="flex items-center gap-2 mt-1 text-white/60">
                              <Clock className="h-4 w-4 flex-shrink-0" />
                              <span>
                                {formatTime(event.kezdoIdo)} - {formatTime(event.zaroIdo)}
                              </span>
                            </div>
                          </div>

                          <div className="text-right mt-4 md:mt-0">
                            <div className="inline-flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full">
                              <Users className="h-4 w-4" />
                              <span>
                                {event.resztvevok || 0}/{event.maximumLetszam || 10} résztvevő
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2 mt-4">
                          {isFacilityAvailable(event, "fedett") && (
                            <span className="px-2 py-1 bg-white/10 rounded-full text-xs flex items-center gap-1">
                              <Home className="h-3 w-3" /> Fedett
                            </span>
                          )}
                          {isFacilityAvailable(event, "oltozo") && (
                            <span className="px-2 py-1 bg-white/10 rounded-full text-xs flex items-center gap-1">
                              <DoorOpen className="h-3 w-3" /> Öltöző
                            </span>
                          )}
                          {isFacilityAvailable(event, "parkolas") && (
                            <span className="px-2 py-1 bg-white/10 rounded-full text-xs flex items-center gap-1">
                              <Car className="h-3 w-3" /> Parkolás
                            </span>
                          )}
                        </div>

                        <div className="mt-4">
                          <div
                            className={`${
                              expandedDescriptions.includes(event.id) ? "" : "line-clamp-2"
                            } text-white/80`}
                          >
                            {event.leiras || "Nincs megadott leírás."}
                          </div>

                          <button
                            onClick={() => toggleDescription(event.id)}
                            className="mt-2 text-blue-400 hover:text-blue-300 transition-colors text-sm inline-flex items-center"
                          >
                            {expandedDescriptions.includes(event.id) ? "Kevesebb" : "Tovább"}
                            <ChevronRight
                              className={`h-4 w-4 transition-transform ${
                                expandedDescriptions.includes(event.id) ? "rotate-90" : ""
                              }`}
                            />
                          </button>
                        </div>

                        <div className="mt-6 flex justify-between items-center">
                          <div className="text-white/60 text-sm">Ár: {event.ar ? `${event.ar} Ft` : "Ingyenes"}</div>
                          <button
                            onClick={() => openEventModal(event)}
                            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                          >
                            Megtekintés
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

            {/* Event Modal */}
            {showModal && selectedEvent && <EventModal event={selectedEvent} onClose={closeEventModal} />}
    </div>
  )
}

export default SportMateFinder

