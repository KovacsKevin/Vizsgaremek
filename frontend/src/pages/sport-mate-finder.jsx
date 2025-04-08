"use client"

import { useState, useEffect } from "react"
import { Calendar, Users, MapPin, Clock, Car, Loader, Search } from "lucide-react"
import { useNavigate } from "react-router-dom"
import EventModal from "./sport-event-details-modal"
import Header from "./Main/Header" // Import the Header component

// Módosított Image komponens a TestImages.jsx alapján
const Image = ({ src, alt, className }) => (
  <img
    src={src ? `http://localhost:8081${src.startsWith("/") ? src : `/${src}`}` : "/placeholder.svg"}
    alt={alt}
    className={className}
    onError={(e) => {
      console.error(`Kép betöltési hiba: ${src}`)
      e.target.src = `/placeholder.svg?height=300&width=400&text=Betöltési%20Hiba`
    }}
  />
)

const SportMateFinder = () => {
  const navigate = useNavigate()
  // Add state for activeTab to pass to Header
  const [activeTab, setActiveTab] = useState("home")

  // Új függvény URL paraméterek olvasására
  const getQueryParams = () => {
    const params = new URLSearchParams(window.location.search)
    return {
      telepules: params.get("telepules"),
      sport: params.get("sport"),
      allEvents: params.get("allEvents") === "true",
      ageFilter: params.get("ageFilter") === "true",
      locationOnly: params.get("locationOnly") === "true",
      sportOnly: params.get("sportOnly") === "true",
    }
  }

  // Add this function to get the authentication token
  const getAuthToken = () => {
    const value = `; ${document.cookie}`
    const parts = value.split(`; token=`)
    if (parts.length === 2) return parts.pop().split(";").shift()
    return null
  }

  // Helper to get current user from token
  const getCurrentUser = () => {
    try {
      const token = getAuthToken()
      if (!token) return null

      // Parse the JWT token to get user information
      const base64Url = token.split(".")[1]
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)
          })
          .join(""),
      )

      return JSON.parse(jsonPayload)
    } catch (error) {
      console.error("Error parsing user token:", error)
      return null
    }
  }

  // Keresősáv állapotai
  const [searchLocation, setSearchLocation] = useState("")
  const [searchSport, setSearchSport] = useState("")

  // Sportok és helyszínek állapotai
  const [sports, setSports] = useState([])
  const [locations, setLocations] = useState([])
  const [loadingSports, setLoadingSports] = useState(false)
  const [loadingLocations, setLoadingLocations] = useState(false)

  // Szűrés állapotai
  const [locationFilter, setLocationFilter] = useState("")
  const [sportFilter, setSportFilter] = useState("")
  const [filteredLocations, setFilteredLocations] = useState([])
  const [filteredSports, setFilteredSports] = useState([])

  // Fókusz állapotok
  const [locationInputFocused, setLocationInputFocused] = useState(false)
  const [sportInputFocused, setSportInputFocused] = useState(false)

  const [selectedSport, setSelectedSport] = useState(null)
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [userAge, setUserAge] = useState(null)
  // Módosított állapot a felhasználó által csatlakozott események követésére
  // Most már a szerepet és státuszt is tároljuk (szervező vagy résztvevő, elfogadva/függőben/elutasítva)
  const [joinedEvents, setJoinedEvents] = useState([]) // {id: number, role: string, status: string}
  const [currentUser, setCurrentUser] = useState(null)
  const [isAllEvents, setIsAllEvents] = useState(false)
  const [isAgeFilter, setIsAgeFilter] = useState(false)
  const [isLocationOnly, setIsLocationOnly] = useState(false)
  const [isSportOnly, setIsSportOnly] = useState(false)

  // Add this to the Header component
  const [pendingRequests, setPendingRequests] = useState(0)

  // Format full date and time
  const formatDateTime = (dateString) => {
    try {
      const date = new Date(dateString)
      return (
        date.toLocaleDateString("hu-HU", {
          year: "numeric",
          month: "long",
          day: "numeric",
          weekday: "long",
        }) +
        " " +
        date.toLocaleTimeString("hu-HU", {
          hour: "2-digit",
          minute: "2-digit",
        })
      )
    } catch (error) {
      return "N/A"
    }
  }

  // Helper function to get a cookie
  const getCookie = (name) => {
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) return parts.pop().split(";").shift()
    return null
  }

  // Add this useEffect to fetch pending requests count
  useEffect(() => {
    const fetchPendingRequestsCount = async () => {
      try {
        const token = getCookie("token")
        if (!token) return

        const response = await fetch("http://localhost:8081/api/v1/pending-requests-count", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setPendingRequests(data.pendingCount)
        }
      } catch (error) {
        console.error("Error fetching pending requests:", error)
      }
    }

    // Fetch on load and every 5 minutes
    fetchPendingRequestsCount()
    const interval = setInterval(fetchPendingRequestsCount, 300000)

    return () => clearInterval(interval)
  }, [])

  // Fókusz kezelő függvények
  const handleLocationFocus = () => {
    setLocationInputFocused(true)
  }

  const handleLocationBlur = () => {
    // Késleltetett fókusz elvesztés, hogy a kattintás működjön a listaelemeken
    setTimeout(() => {
      setLocationInputFocused(false)
    }, 200)
  }

  const handleSportFocus = () => {
    setSportInputFocused(true)
  }

  const handleSportBlur = () => {
    // Késleltetett fókusz elvesztés, hogy a kattintás működjön a listaelemeken
    setTimeout(() => {
      setSportInputFocused(false)
    }, 200)
  }

  // Sportok betöltése az adatbázisból
  useEffect(() => {
    const fetchSports = async () => {
      setLoadingSports(true)
      try {
        const response = await fetch("http://localhost:8081/api/v1/allSportok", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.message || "Failed to fetch sports")
        }

        const data = await response.json()
        setSports(data.sportok || [])
        setFilteredSports(data.sportok || [])
      } catch (error) {
        console.error("Error fetching sports:", error)
      } finally {
        setLoadingSports(false)
      }
    }

    fetchSports()
  }, [])

  // Helyszínek betöltése az adatbázisból
  useEffect(() => {
    const fetchLocations = async () => {
      setLoadingLocations(true)
      try {
        const response = await fetch("http://localhost:8081/api/v1/allHelyszin", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.message || "Failed to fetch locations")
        }

        const data = await response.json()
        // Egyedi települések kinyerése
        const uniqueLocations = [...new Set(data.helyszinek.map((h) => h.Telepules))]
        setLocations(uniqueLocations)
        setFilteredLocations(uniqueLocations)
      } catch (error) {
        console.error("Error fetching locations:", error)
      } finally {
        setLoadingLocations(false)
      }
    }

    fetchLocations()
  }, [])

  // Inicializálás URL paraméterekből és felhasználó beállítása
  useEffect(() => {
    const { telepules, sport, allEvents, ageFilter, locationOnly, sportOnly } = getQueryParams()

    // Update selected location and sport from query parameters if they exist
    if (telepules) {
      setSelectedLocation(decodeURIComponent(telepules))
      setSearchLocation(decodeURIComponent(telepules))
      setLocationFilter(decodeURIComponent(telepules))
    }

    if (sport) {
      setSelectedSport(decodeURIComponent(sport))
      setSearchSport(decodeURIComponent(sport))
      setSportFilter(decodeURIComponent(sport))
    }

    // Set if we're showing all events
    setIsAllEvents(allEvents)
    setIsAgeFilter(ageFilter)
    setIsLocationOnly(locationOnly)
    setIsSportOnly(sportOnly)

    // Set current user
    const user = getCurrentUser()
    setCurrentUser(user)
  }, [])

  // Új függvények a szűréshez
  const handleLocationFilterChange = (e) => {
    const value = e.target.value
    setLocationFilter(value)
    setSearchLocation(value)

    // Szűrjük a településeket a beírt szöveg alapján
    if (value) {
      const filtered = locations.filter((location) => location.toLowerCase().includes(value.toLowerCase()))
      setFilteredLocations(filtered)
    } else {
      setFilteredLocations(locations)
    }
  }

  const handleSportFilterChange = (e) => {
    const value = e.target.value
    setSportFilter(value)
    setSearchSport(value)

    // Szűrjük a sportokat a beírt szöveg alapján
    if (value) {
      const filtered = sports.filter((sport) => sport.Nev.toLowerCase().includes(value.toLowerCase()))
      setFilteredSports(filtered)
    } else {
      setFilteredSports(sports)
    }
  }

  const handleLocationSelect = (location) => {
    setSearchLocation(location)
    setLocationFilter(location)
    setLocationInputFocused(false)
  }

  const handleSportSelect = (sportName) => {
    setSearchSport(sportName)
    setSportFilter(sportName)
    setSportInputFocused(false)
  }

  // Keresés kezelése - módosított verzió a rugalmas kereséshez
  const handleSearch = (e) => {
    e.preventDefault()

    // Check if both fields are empty - show all events
    if (!searchLocation && !searchSport) {
      navigate(`/sportmate?allEvents=true`)
      setSelectedLocation("")
      setSelectedSport("")
      setIsAllEvents(true)
      setIsAgeFilter(false)
      setIsLocationOnly(false)
      setIsSportOnly(false)
      return
    }

    // If only location is provided
    if (searchLocation && !searchSport) {
      navigate(`/sportmate?telepules=${encodeURIComponent(searchLocation)}&locationOnly=true`)
      setSelectedLocation(searchLocation)
      setSelectedSport("")
      setIsAllEvents(false)
      setIsAgeFilter(false)
      setIsLocationOnly(true)
      setIsSportOnly(false)
      return
    }

    // If only sport is provided
    if (!searchLocation && searchSport) {
      navigate(`/sportmate?sport=${encodeURIComponent(searchSport)}&sportOnly=true`)
      setSelectedLocation("")
      setSelectedSport(searchSport)
      setIsAllEvents(false)
      setIsAgeFilter(false)
      setIsLocationOnly(false)
      setIsSportOnly(true)
      return
    }

    // If both are provided - original behavior
    navigate(`/sportmate?telepules=${encodeURIComponent(searchLocation)}&sport=${encodeURIComponent(searchSport)}`)
    setSelectedLocation(searchLocation)
    setSelectedSport(searchSport)
    setIsAllEvents(false)
    setIsAgeFilter(false)
    setIsLocationOnly(false)
    setIsSportOnly(false)
  }

  // Módosított függvény a felhasználó csatlakozási állapotának és szerepének ellenőrzésére
  const checkParticipationForEvents = async (events) => {
    const token = getAuthToken()
    if (!token || !events.length) return

    const user = getCurrentUser()
    if (!user) return

    // Minden eseményhez külön-külön ellenőrizzük a csatlakozási állapotot és szerepet
    const joinedEventDetails = []

    await Promise.all(
      events.map(async (event) => {
        try {
          const response = await fetch(`http://localhost:8081/api/v1/events/${event.id}/check-participation`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })

          if (response.ok) {
            const data = await response.json()
            if (data.isParticipant) {
              // Itt a szervertől kapott szerepet és státuszt használjuk
              joinedEventDetails.push({
                id: event.id,
                role: data.role, // A szervertől kapott szerep
                status: data.status, // A szervertől kapott státusz (elfogadva, elutasítva, függőben)
              })
            }
          }
        } catch (error) {
          console.error(`Hiba az esemény (${event.id}) csatlakozási állapotának ellenőrzésekor:`, error)
        }
      }),
    )

    setJoinedEvents(joinedEventDetails)
  }

  // Fetch events from API - módosított verzió a rugalmas kereséshez
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true)
      setError(null)
      try {
        // Get the authentication token
        const token = getAuthToken()

        // Check query parameters
        const { allEvents, ageFilter, locationOnly, sportOnly } = getQueryParams()

        let apiUrl
        let headers = {}

        if (token) {
          headers = {
            Authorization: `Bearer ${token}`,
          }
        }

        // Determine which API endpoint to use based on search parameters
        if (allEvents) {
          // Use the endpoint that returns all events
          if (!token) {
            apiUrl = `http://localhost:8081/api/v1/getAllEsemeny`
          } else {
            apiUrl = `http://localhost:8081/api/v1/all-events-by-age`
          }
        } else if (locationOnly && selectedLocation) {
          // Search by location only
          if (!token) {
            apiUrl = `http://localhost:8081/api/v1/getEsemenyekByTelepules/${encodeURIComponent(selectedLocation)}`
          } else {
            apiUrl = `http://localhost:8081/api/v1/getEsemenyekByTelepulesAndAge/${encodeURIComponent(selectedLocation)}`
          }
        } else if (sportOnly && selectedSport) {
          // Search by sport only
          if (!token) {
            apiUrl = `http://localhost:8081/api/v1/getEsemenyekBySportNev/${encodeURIComponent(selectedSport)}`
          } else {
            apiUrl = `http://localhost:8081/api/v1/getEsemenyekBySportNevAndAge/${encodeURIComponent(selectedSport)}`
          }
        } else if (ageFilter) {
          // Use the endpoint that returns all events filtered by age
          if (!token) {
            setError("A funkció használatához be kell jelentkezni!")
            setLoading(false)
            return
          }
          apiUrl = `http://localhost:8081/api/v1/events-by-age`
        } else {
          // Both location and sport are specified
          if (selectedSport && selectedLocation) {
            if (token) {
              apiUrl = `http://localhost:8081/api/v1/getEsemenyekByAge/${encodeURIComponent(selectedLocation)}/${encodeURIComponent(selectedSport)}`
            } else {
              apiUrl = `http://localhost:8081/api/v1/getEsemenyek/${encodeURIComponent(selectedLocation)}/${encodeURIComponent(selectedSport)}`
            }
          } else {
            // If we don't have enough parameters, show an error
            setError("A kereséshez meg kell adni a sportot és/vagy a települést!")
            setLoading(false)
            return
          }
        }

        console.log("Fetching events from:", apiUrl)

        const response = await fetch(apiUrl, { headers })
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`)
        }

        const data = await response.json()
        let fetchedEvents = data.events || []

        // Filter out events with expired closing times
        const currentTime = new Date()
        fetchedEvents = fetchedEvents.filter((event) => new Date(event.zaroIdo) > currentTime)

        // Now fetch participant data for each event
        const eventsWithParticipants = await Promise.all(
          fetchedEvents.map(async (event) => {
            try {
              const participantsResponse = await fetch(`http://localhost:8081/api/v1/events/${event.id}/participants`)
              if (participantsResponse.ok) {
                const participantsData = await participantsResponse.json()
                return {
                  ...event,
                  resztvevok_lista: participantsData.participants || [],
                }
              }
              return event
            } catch (err) {
              console.error(`Failed to fetch participants for event ${event.id}:`, err)
              return event
            }
          }),
        )

        setEvents(eventsWithParticipants)

        // Ha van token, ellenőrizzük a felhasználó csatlakozási állapotát és szerepét
        if (token && eventsWithParticipants.length > 0) {
          await checkParticipationForEvents(eventsWithParticipants)
        }

        // If we got user age information, we can display it
        if (data.userAge) {
          setUserAge(data.userAge)
        }
      } catch (err) {
        console.error("Failed to fetch events:", err)
        setError("Nem sikerült betölteni az eseményeket. Kérjük, próbálja újra később.")
        setEvents([])
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [selectedSport, selectedLocation, window.location.search])

  // Módosított függvény a résztvevők frissítésére
  const handleParticipantUpdate = (eventId, isJoined, participant) => {
    // Csak akkor frissítsük a résztvevők számát, ha:
    // 1. Explicit módon kérjük (updateParticipantCount flag)
    // 2. Teljes résztvevő lista frissítés történik (fullParticipantsList)
    // 3. A felhasználó státusza "elfogadva"
    const shouldUpdateParticipantCount =
      participant.updateParticipantCount === true ||
      participant.fullParticipantsList ||
      participant.status === "elfogadva"

    if (shouldUpdateParticipantCount) {
      // Update the events array with the new participant count
      setEvents((prevEvents) =>
        prevEvents.map((event) => {
          if (event.id === eventId) {
            // If we received a full participants list, use it directly
            if (participant.fullParticipantsList) {
              return {
                ...event,
                resztvevok_lista: participant.fullParticipantsList,
              }
            }

            // Otherwise handle individual participant updates
            const currentParticipants = event.resztvevok_lista || []

            // If the user joined, add them to the list if not already there
            if (
              isJoined &&
              participant.userId !== "count-update" &&
              !currentParticipants.some((p) => p.id === participant.userId)
            ) {
              return {
                ...event,
                resztvevok_lista: [...currentParticipants, participant],
              }
            }

            // If the user left, remove them from the list
            if (!isJoined) {
              return {
                ...event,
                resztvevok_lista: currentParticipants.filter((p) => p.id !== participant.userId),
              }
            }
          }
          return event
        }),
      )
    }

    // Ha a felhasználó csatlakozott, frissítsük a csatlakozott események listáját
    if (isJoined) {
      // Ellenőrizzük, hogy már szerepel-e az esemény a listában
      if (!joinedEvents.some((event) => event.id === eventId)) {
        // Itt a participant objektumból vesszük a szerepet és státuszt
        setJoinedEvents((prev) => [
          ...prev,
          {
            id: eventId,
            role: participant.role || "játékos", // Használjuk a szervertől kapott szerepet
            status: participant.status || "függőben", // Használjuk a szervertől kapott státuszt
          },
        ])
      } else {
        // Ha már szerepel, akkor frissítsük a státuszát
        setJoinedEvents((prev) =>
          prev.map((event) =>
            event.id === eventId ? { ...event, status: participant.status || event.status } : event,
          ),
        )
      }
    } else if (!isJoined) {
      setJoinedEvents((prev) => prev.filter((event) => event.id !== eventId))
    }
  }

  // Modify the openEventModal function to check for authentication first
  const openEventModal = (event, isInvitation = false) => {
    // Check if user is authenticated
    const token = getAuthToken()
    if (!token) {
      // Redirect to login page if not authenticated
      navigate('/login', {
        state: {
          from: window.location.pathname + window.location.search,
          message: "A sportesemény részleteinek megtekintéséhez be kell jelentkezni."
        }
      })
      return
    }

    // If authenticated, proceed as normal
    setSelectedEvent({
      ...event,
      isInvitation: isInvitation,
    })
    setShowModal(true)
  }


  const closeEventModal = () => {
    setShowModal(false)
    setSelectedEvent(null)
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

  // Segédfüggvény annak ellenőrzésére, hogy a felhasználó csatlakozott-e az eseményhez és milyen szerepben
  const getUserEventRole = (eventId) => {
    const eventInfo = joinedEvents.find((event) => event.id === eventId)
    return eventInfo ? eventInfo.role : null
  }

  // Segédfüggvény a felhasználó eseményben való részvételi státuszának lekérdezésére
  const getUserEventStatus = (eventId) => {
    const eventInfo = joinedEvents.find((event) => event.id === eventId)
    return eventInfo ? eventInfo.status : null
  }

  // Helper function to get skill level badge color
  const getSkillLevelColor = (level) => {
    if (!level) return "bg-gray-600"

    const levelLower = level.toLowerCase()
    if (levelLower.includes("kezdő")) return "from-green-500 to-green-600"
    if (levelLower.includes("haladó")) return "from-yellow-500 to-yellow-600"
    if (levelLower.includes("profi")) return "from-red-500 to-red-600"
    return "from-blue-500 to-blue-600"
  }

  return (
    <>
      {/* Add the Header component at the top */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} pendingRequests={pendingRequests} />

      <div className="min-h-screen bg-gradient-to-br from-[#1a1f36] to-[#121528] text-white">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-[#a855f7] to-[#6366f1]">
              Sporteseményeink
            </h1>
            <p className="text-[#a1a1aa] max-w-2xl mx-auto">Tekints meg a keresésed alapján szűrt a sporteseményeket</p>
          </div>

          {/* Keresősáv hozzáadása */}
          <div className="mb-8">
            <form
              onSubmit={handleSearch}
              className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-6 shadow-lg"
            >
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <label htmlFor="location" className="block text-sm font-medium text-white/80 mb-2">
                    Település
                  </label>
                  <input
                    id="location"
                    type="text"
                    value={locationFilter}
                    onChange={handleLocationFilterChange}
                    onFocus={handleLocationFocus}
                    onBlur={handleLocationBlur}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#a855f7] focus:border-transparent transition-all duration-200"
                    placeholder="Kezdj el gépelni vagy hagyd üresen..."
                    autoComplete="off"
                  />
                </div>
                <div className="flex-1 relative">
                  <label htmlFor="sport" className="block text-sm font-medium text-white/80 mb-2">
                    Sport
                  </label>
                  <input
                    id="sport"
                    type="text"
                    value={sportFilter}
                    onChange={handleSportFilterChange}
                    onFocus={handleSportFocus}
                    onBlur={handleSportBlur}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#a855f7] focus:border-transparent transition-all duration-200"
                    placeholder="Kezdj el gépelni vagy hagyd üresen..."
                    autoComplete="off"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-[#a855f7] to-[#6366f1] hover:from-[#9333ea] hover:to-[#4f46e5] text-white font-medium rounded-lg transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-[#a855f7]/20"
                  >
                    <Search className="w-5 h-5 mr-2" />
                    Keresés
                  </button>
                </div>
              </div>
              <div className="mt-2 text-xs text-white/60">
                Kereshetsz csak település vagy csak sport alapján is. Ha mindkét mezőt üresen hagyod, az összes eseményt
                láthatod.
              </div>
            </form>
          </div>

          {/* Település legördülő lista overlay */}
          {locationInputFocused && filteredLocations.length > 0 && (
            <div
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
              onClick={() => setLocationInputFocused(false)}
            >
              <div
                className="absolute top-[calc(var(--input-top)+var(--input-height))] left-[var(--input-left)] w-[var(--input-width)] bg-[#1e2642] border border-white/10 rounded-lg shadow-xl max-h-60 overflow-auto"
                onClick={(e) => e.stopPropagation()}
                style={{
                  "--input-top": document.getElementById("location")?.getBoundingClientRect().top + "px",
                  "--input-left": document.getElementById("location")?.getBoundingClientRect().left + "px",
                  "--input-width": document.getElementById("location")?.offsetWidth + "px",
                  "--input-height": document.getElementById("location")?.offsetHeight + "px",
                }}
              >
                {filteredLocations.map((location) => (
                  <div
                    key={location}
                    className="px-4 py-2 hover:bg-white/10 cursor-pointer border-b border-white/5 last:border-0 transition-colors duration-150"
                    onClick={() => handleLocationSelect(location)}
                  >
                    {location}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sport legördülő lista overlay */}
          {sportInputFocused && filteredSports.length > 0 && (
            <div
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
              onClick={() => setSportInputFocused(false)}
            >
              <div
                className="absolute top-[calc(var(--input-top)+var(--input-height))] left-[var(--input-left)] w-[var(--input-width)] bg-[#1e2642] border border-white/10 rounded-lg shadow-xl max-h-60 overflow-auto"
                onClick={(e) => e.stopPropagation()}
                style={{
                  "--input-top": document.getElementById("sport")?.getBoundingClientRect().top + "px",
                  "--input-left": document.getElementById("sport")?.getBoundingClientRect().left + "px",
                  "--input-width": document.getElementById("sport")?.offsetWidth + "px",
                  "--input-height": document.getElementById("sport")?.offsetHeight + "px",
                }}
              >
                {filteredSports.map((sport) => (
                  <div
                    key={sport.Id}
                    className="px-4 py-2 hover:bg-white/10 cursor-pointer border-b border-white/5 last:border-0 transition-colors duration-150"
                    onClick={() => handleSportSelect(sport.Nev)}
                  >
                    {sport.Nev}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search Results */}
          <div className="w-full">
            {loading ? (
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-8 text-center">
                <Loader className="h-8 w-8 animate-spin mx-auto text-[#a855f7]" />
                <p className="mt-4">Események betöltése...</p>
              </div>
            ) : error ? (
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-8 text-center">
                <p className="text-red-400 text-lg">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 px-4 py-2 bg-gradient-to-r from-[#a855f7] to-[#6366f1] text-white rounded-lg hover:from-[#9333ea] hover:to-[#4f46e5] transition-colors"
                >
                  Újra próbálkozás
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {events.length === 0 ? (
                  <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-8 text-center col-span-1 md:col-span-2">
                    <p className="text-lg">Nincs a keresési feltételeknek megfelelő esemény.</p>
                    <p className="text-white/60 mt-2">Próbáld módosítani a szűrőket vagy hozz létre egy új eseményt.</p>
                  </div>
                ) : (
                  events.map((event) => (
                    <div
                      key={event.id}
                      className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-all duration-300 hover:shadow-lg hover:shadow-[#a855f7]/10 group"
                    >
                      <div className="relative h-60 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#121528]/90 z-10"></div>
                        <Image
                          src={event.imageUrl || "/placeholder.svg"}
                          alt={event.Sportok?.Nev || "Sport esemény"}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute top-0 left-0 bg-gradient-to-r from-[#a855f7] to-[#6366f1] text-white px-3 py-1 rounded-br-lg font-medium z-20">
                          {event.Sportok?.Nev || selectedSport || "Sport"}
                        </div>

                        {/* Skill level badge - now more prominent */}
                        <div className="absolute top-0 right-0 z-20">
                          <div
                            className={`bg-gradient-to-r ${getSkillLevelColor(event.szint)} px-3 py-1 rounded-bl-lg font-medium text-white`}
                          >
                            {event.szint || "Ismeretlen szint"}
                          </div>
                        </div>

                        <div className="absolute bottom-4 left-4 right-4 z-20">
                          <h3 className="text-xl font-bold text-white">{event.Helyszin?.Nev || "Helyszín"}</h3>
                          <div className="flex items-center gap-2 text-white/80">
                            <MapPin className="h-4 w-4 flex-shrink-0" />
                            <span>
                              {event.Helyszin?.Telepules || selectedLocation || "Város"}, {event.Helyszin?.Cim || "Cím"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="p-5">
                        <div className="flex justify-between items-start mb-4">
                          <div className="space-y-2">
                            <div className="flex items-start gap-2 text-white/80 mt-6">
                              <Calendar className="h-5 w-5 flex-shrink-0 mt-1" />
                              <div>
                                <div className="text-sm text-white/60">Kezdés</div>
                                <div className="text-xl font-medium">{formatDateTime(event.kezdoIdo)}</div>
                              </div>
                            </div>

                            <div className="flex items-start gap-2 text-white/80 mt-20">
                              <Clock className="h-5 w-5 flex-shrink-0 mt-6" />
                              <div className="mt-6">
                                <div className="text-sm text-white/60">Befejezés</div>
                                <div className="text-xl font-medium">{formatDateTime(event.zaroIdo)}</div>
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="inline-flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full">
                              <Users className="h-4 w-4" />
                              <span>
                                {(event.resztvevok_lista || []).length}/{event.maximumLetszam || 10} résztvevő
                              </span>
                            </div>
                            {/* Betelt felirat hozzáadása, ha elérte a maximum létszámot */}
                            {(event.resztvevok_lista || []).length >= (event.maximumLetszam || 10) && (
                              <div className="mt-1 text-red-500 text-sm font-medium">Betelt</div>
                            )}
                          </div>
                        </div>

                        {/* Only show parking facility */}
                        {isFacilityAvailable(event, "parkolas") && (
                          <div className="mb-4">
                            <span className="px-3 py-1 bg-white/5 rounded-full text-sm flex items-center gap-1 inline-block">
                              <Car className="h-4 w-4" /> Parkolási lehetőség
                            </span>
                          </div>
                        )}

                        {event.leiras && <div className="text-white/70 text-sm line-clamp-2 mb-4">{event.leiras}</div>}

                        <div className="flex justify-end">
                          {/* Módosított gomb: státusz alapján különböző megjelenítés */}
                          {getUserEventRole(event.id) ? (
                            <button
                              onClick={() => {
                                // If this is an invitation, open the modal with invitation mode
                                if (getUserEventStatus(event.id) === "meghívott") {
                                  openEventModal(event, true) // Pass true to indicate invitation mode
                                } else {
                                  openEventModal(event)
                                }
                              }}
                              className={`px-4 py-2 rounded-lg transition-colors ${getUserEventRole(event.id) === "szervező"
                                  ? "bg-gradient-to-r from-[#a855f7] to-[#6366f1] hover:from-[#9333ea] hover:to-[#4f46e5]"
                                  : getUserEventStatus(event.id) === "elfogadva"
                                    ? "bg-green-600 hover:bg-green-700"
                                    : getUserEventStatus(event.id) === "függőben"
                                      ? "bg-yellow-600 hover:bg-yellow-700"
                                      : getUserEventStatus(event.id) === "meghívott"
                                        ? "bg-blue-600 hover:bg-blue-700"
                                        : "bg-red-600 hover:bg-red-700"
                                } text-white`}
                            >
                              {getUserEventRole(event.id) === "szervező"
                                ? "Szervező vagyok"
                                : getUserEventStatus(event.id) === "elfogadva"
                                  ? "Csatlakozva résztvevőként"
                                  : getUserEventStatus(event.id) === "függőben"
                                    ? "Jóváhagyásra vár"
                                    : getUserEventStatus(event.id) === "meghívott"
                                      ? "Meghívást kaptál"
                                      : "Elutasítva"}
                            </button>
                          ) : (
                            <button
                              onClick={() => openEventModal(event)}
                              className="px-4 py-2 bg-gradient-to-r from-[#a855f7] to-[#6366f1] hover:from-[#9333ea] hover:to-[#4f46e5] text-white rounded-lg transition-all duration-300 transform group-hover:scale-105"
                            >
                              Megtekintés
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Event Modal */}
      {showModal && selectedEvent && (
        <EventModal
          event={selectedEvent}
          onClose={closeEventModal}
          onParticipantUpdate={handleParticipantUpdate}
          userRole={getUserEventRole(selectedEvent.id)}
          userStatus={getUserEventStatus(selectedEvent.id)}
          isInvitation={selectedEvent.isInvitation} // Pass the invitation flag
        />
      )}
    </>
  )
}

export default SportMateFinder
