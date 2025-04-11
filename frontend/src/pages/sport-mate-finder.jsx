"use client"

import { useState, useEffect } from "react"
import { Calendar, Users, MapPin, Clock, Car, Loader, Search } from "lucide-react"
import { useNavigate } from "react-router-dom"
import EventModal from "./sport-event-details-modal"
import Header from "./Main/Header" 


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
  
  const [activeTab, setActiveTab] = useState("home")

  
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

 
  const getAuthToken = () => {
    const value = `; ${document.cookie}`
    const parts = value.split(`; token=`)
    if (parts.length === 2) return parts.pop().split(";").shift()
    return null
  }

  
  const getCurrentUser = () => {
    try {
      const token = getAuthToken()
      if (!token) return null

      
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

 
  const [searchLocation, setSearchLocation] = useState("")
  const [searchSport, setSearchSport] = useState("")

  
  const [sports, setSports] = useState([])
  const [locations, setLocations] = useState([])
  const [loadingSports, setLoadingSports] = useState(false)
  const [loadingLocations, setLoadingLocations] = useState(false)

  
  const [locationFilter, setLocationFilter] = useState("")
  const [sportFilter, setSportFilter] = useState("")
  const [filteredLocations, setFilteredLocations] = useState([])
  const [filteredSports, setFilteredSports] = useState([])

 
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
  
  const [joinedEvents, setJoinedEvents] = useState([]) 
  const [currentUser, setCurrentUser] = useState(null)
  const [isAllEvents, setIsAllEvents] = useState(false)
  const [isAgeFilter, setIsAgeFilter] = useState(false)
  const [isLocationOnly, setIsLocationOnly] = useState(false)
  const [isSportOnly, setIsSportOnly] = useState(false)


  const [pendingRequests, setPendingRequests] = useState(0)

 
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

  
  const getCookie = (name) => {
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) return parts.pop().split(";").shift()
    return null
  }

  
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

    
    fetchPendingRequestsCount()
    const interval = setInterval(fetchPendingRequestsCount, 300000)

    return () => clearInterval(interval)
  }, [])

  
  const handleLocationFocus = () => {
    setLocationInputFocused(true)
  }

  const handleLocationBlur = () => {
    
    setTimeout(() => {
      setLocationInputFocused(false)
    }, 200)
  }

  const handleSportFocus = () => {
    setSportInputFocused(true)
  }

  const handleSportBlur = () => {
    
    setTimeout(() => {
      setSportInputFocused(false)
    }, 200)
  }

  
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

  
  useEffect(() => {
    const { telepules, sport, allEvents, ageFilter, locationOnly, sportOnly } = getQueryParams()

   
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

    
    setIsAllEvents(allEvents)
    setIsAgeFilter(ageFilter)
    setIsLocationOnly(locationOnly)
    setIsSportOnly(sportOnly)

    
    const user = getCurrentUser()
    setCurrentUser(user)
  }, [])

  
  const handleLocationFilterChange = (e) => {
    const value = e.target.value
    setLocationFilter(value)
    setSearchLocation(value)

    
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

  
  const handleSearch = (e) => {
    e.preventDefault()

    
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

    
    navigate(`/sportmate?telepules=${encodeURIComponent(searchLocation)}&sport=${encodeURIComponent(searchSport)}`)
    setSelectedLocation(searchLocation)
    setSelectedSport(searchSport)
    setIsAllEvents(false)
    setIsAgeFilter(false)
    setIsLocationOnly(false)
    setIsSportOnly(false)
  }

  
  const checkParticipationForEvents = async (events) => {
    const token = getAuthToken()
    if (!token || !events.length) return

    const user = getCurrentUser()
    if (!user) return

    
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
              
              joinedEventDetails.push({
                id: event.id,
                role: data.role, 
                status: data.status, 
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

  
  
useEffect(() => {
  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      
      const token = getAuthToken();

      
      const { allEvents, ageFilter, locationOnly, sportOnly } = getQueryParams();

      let apiUrl;
      let headers = {};

      if (token) {
        headers = {
          Authorization: `Bearer ${token}`,
        };
      }

      
      if (allEvents) {
        
        if (!token) {
          apiUrl = `http://localhost:8081/api/v1/getAllEsemeny`;
        } else {
          apiUrl = `http://localhost:8081/api/v1/all-events-by-age-or-organizer`;  // Modified endpoint
        }
      } else if (locationOnly && selectedLocation) {
        
        if (!token) {
          apiUrl = `http://localhost:8081/api/v1/getEsemenyekByTelepules/${encodeURIComponent(selectedLocation)}`;
        } else {
          apiUrl = `http://localhost:8081/api/v1/getEsemenyekByTelepulesAndAgeOrOrganizer/${encodeURIComponent(selectedLocation)}`;  // Modified endpoint
        }
      } else if (sportOnly && selectedSport) {
        
        if (!token) {
          apiUrl = `http://localhost:8081/api/v1/getEsemenyekBySportNev/${encodeURIComponent(selectedSport)}`;
        } else {
          apiUrl = `http://localhost:8081/api/v1/getEsemenyekBySportNevAndAgeOrOrganizer/${encodeURIComponent(selectedSport)}`;  // Modified endpoint
        }
      } else if (ageFilter) {
        
        if (!token) {
          setError("A funkció használatához be kell jelentkezni!");
          setLoading(false);
          return;
        }
        apiUrl = `http://localhost:8081/api/v1/all-events-by-age-or-organizer`;  // Modified endpoint
      } else {
        
        if (selectedSport && selectedLocation) {
          if (token) {
            apiUrl = `http://localhost:8081/api/v1/getEsemenyekByAgeOrOrganizer/${encodeURIComponent(selectedLocation)}/${encodeURIComponent(selectedSport)}`;  // Modified endpoint
          } else {
            apiUrl = `http://localhost:8081/api/v1/getEsemenyek/${encodeURIComponent(selectedLocation)}/${encodeURIComponent(selectedSport)}`;
          }
        } else {
          
          setError("A kereséshez meg kell adni a sportot és/vagy a települést!");
          setLoading(false);
          return;
        }
      }

     

      const response = await fetch(apiUrl, { headers });
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      let fetchedEvents = data.events || [];

      
      const currentTime = new Date();
      fetchedEvents = fetchedEvents.filter((event) => new Date(event.zaroIdo) > currentTime);

      
      const eventsWithParticipants = await Promise.all(
        fetchedEvents.map(async (event) => {
          try {
            const participantsResponse = await fetch(`http://localhost:8081/api/v1/events/${event.id}/participants`);
            if (participantsResponse.ok) {
              const participantsData = await participantsResponse.json();
              return {
                ...event,
                resztvevok_lista: participantsData.participants || [],
              };
            }
            return event;
          } catch (err) {
            console.error(`Failed to fetch participants for event ${event.id}:`, err);
            return event;
          }
        })
      );

      setEvents(eventsWithParticipants);

      
      if (token && eventsWithParticipants.length > 0) {
        await checkParticipationForEvents(eventsWithParticipants);
      }

      
      if (data.userAge) {
        setUserAge(data.userAge);
      }
    } catch (err) {
      console.error("Failed to fetch events:", err);
      setError("Nincs a keresésednek(vagy korodnak) megfelelő esemény. Kérjük, próbálja újra később.");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  fetchEvents();
}, [selectedSport, selectedLocation, window.location.search]);



  const handleParticipantUpdate = (eventId, isJoined, participant) => {
    
    const shouldUpdateParticipantCount =
      participant.updateParticipantCount === true ||
      participant.fullParticipantsList ||
      participant.status === "elfogadva"

    if (shouldUpdateParticipantCount) {
      
      setEvents((prevEvents) =>
        prevEvents.map((event) => {
          if (event.id === eventId) {
            
            if (participant.fullParticipantsList) {
              return {
                ...event,
                resztvevok_lista: participant.fullParticipantsList,
              }
            }

            
            const currentParticipants = event.resztvevok_lista || []

            
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

    
    if (isJoined) {
      
      if (!joinedEvents.some((event) => event.id === eventId)) {
        
        setJoinedEvents((prev) => [
          ...prev,
          {
            id: eventId,
            role: participant.role || "játékos", 
            status: participant.status || "függőben", 
          },
        ])
      } else {
        
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

  
  const openEventModal = (event, isInvitation = false) => {
    
    const token = getAuthToken()
    if (!token) {
     
      navigate('/login', {
        state: {
          from: window.location.pathname + window.location.search,
          message: "A sportesemény részleteinek megtekintéséhez be kell jelentkezni."
        }
      })
      return
    }

    
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

  
  const getUserEventRole = (eventId) => {
    const eventInfo = joinedEvents.find((event) => event.id === eventId)
    return eventInfo ? eventInfo.role : null
  }

  
  const getUserEventStatus = (eventId) => {
    const eventInfo = joinedEvents.find((event) => event.id === eventId)
    return eventInfo ? eventInfo.status : null
  }

  
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
      
      <Header activeTab={activeTab} setActiveTab={setActiveTab} pendingRequests={pendingRequests} />

      <div className="min-h-screen bg-gradient-to-br from-[#1a1f36] to-[#121528] text-white">
        <div className="container mx-auto px-4 py-8">
          
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-[#a855f7] to-[#6366f1]">
              Sporteseményeink
            </h1>
            <p className="text-[#a1a1aa] max-w-2xl mx-auto">Tekints meg a keresésed alapján szűrt a sporteseményeket</p>
          </div>

          
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

          
          {locationInputFocused && filteredLocations.length > 0 && (
  <div
    className="absolute z-50 bg-[#1e2642] border border-white/10 rounded-lg shadow-xl max-h-60 overflow-auto w-full md:w-auto"
    style={{
      top: document.getElementById("location")?.getBoundingClientRect().bottom + window.scrollY + 5 + "px",
      left: document.getElementById("location")?.getBoundingClientRect().left + window.scrollX + "px",
      width: document.getElementById("location")?.offsetWidth + "px",
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
)}

          
          {sportInputFocused && filteredSports.length > 0 && (
  <div
    className="absolute z-50 bg-[#1e2642] border border-white/10 rounded-lg shadow-xl max-h-60 overflow-auto w-full md:w-auto"
    style={{
      top: document.getElementById("sport")?.getBoundingClientRect().bottom + window.scrollY + 5 + "px",
      left: document.getElementById("sport")?.getBoundingClientRect().left + window.scrollX + "px",
      width: document.getElementById("sport")?.offsetWidth + "px",
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
)}

         
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
                            
                            {(event.resztvevok_lista || []).length >= (event.maximumLetszam || 10) && (
                              <div className="mt-1 text-red-500 text-sm font-medium">Betelt</div>
                            )}
                          </div>
                        </div>

                        
                        {isFacilityAvailable(event, "parkolas") && (
                          <div className="mb-4">
                            <span className="px-3 py-1 bg-white/5 rounded-full text-sm flex items-center gap-1 inline-block">
                              <Car className="h-4 w-4" /> Parkolási lehetőség
                            </span>
                          </div>
                        )}

                        {event.leiras && <div className="text-white/70 text-sm line-clamp-2 mb-4">{event.leiras}</div>}

                        <div className="flex justify-end">
                          
                          {getUserEventRole(event.id) ? (
                            <button
                              onClick={() => {
                                
                                if (getUserEventStatus(event.id) === "meghívott") {
                                  openEventModal(event, true) 
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

     
      {showModal && selectedEvent && (
        <EventModal
          event={selectedEvent}
          onClose={closeEventModal}
          onParticipantUpdate={handleParticipantUpdate}
          userRole={getUserEventRole(selectedEvent.id)}
          userStatus={getUserEventStatus(selectedEvent.id)}
          isInvitation={selectedEvent.isInvitation} 
        />
      )}
    </>
  )
}

export default SportMateFinder
