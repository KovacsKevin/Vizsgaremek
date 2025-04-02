"use client"

import { useState, useEffect } from "react"
import {
  Calendar,
  Users,
  MapPin,
  Clock,
  Car,
  Home,
  DoorOpen,
  Loader,
} from "lucide-react"
import EventModal from "./sport-event-details-modal"
import Header from "./Main/Header" // Import the Header component

// Módosított Image komponens a TestImages.jsx alapján
const Image = ({ src, alt, className }) => (
  <img
    src={src ? `http://localhost:8081${src.startsWith('/') ? src : `/${src}`}` : "/placeholder.svg"}
    alt={alt}
    className={className}
    onError={(e) => {
      console.error(`Kép betöltési hiba: ${src}`);
      e.target.src = `/placeholder.svg?height=300&width=400&text=Betöltési%20Hiba`;
    }}
  />
)

const SportMateFinder = () => {
  // Add state for activeTab to pass to Header
  const [activeTab, setActiveTab] = useState("home")

  // Új függvény URL paraméterek olvasására
  const getQueryParams = () => {
    const params = new URLSearchParams(window.location.search)
    return {
      telepules: params.get("telepules"),
      sport: params.get("sport"),
      allEvents: params.get("allEvents") === "true"
    }
  }

  // Add this function to get the authentication token
  const getAuthToken = () => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; token=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  };

  // Helper to get current user from token
  const getCurrentUser = () => {
    try {
      const token = getAuthToken();
      if (!token) return null;

      // Parse the JWT token to get user information
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error("Error parsing user token:", error);
      return null;
    }
  };

  const [selectedSport, setSelectedSport] = useState(null)
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [userAge, setUserAge] = useState(null)
  // Módosított állapot a felhasználó által csatlakozott események követésére
  // Most már a szerepet is tároljuk (szervező vagy résztvevő)
  const [joinedEvents, setJoinedEvents] = useState([]) // {id: number, role: string}
  const [currentUser, setCurrentUser] = useState(null)
  const [isAllEvents, setIsAllEvents] = useState(false)

  // Inicializálás URL paraméterekből és felhasználó beállítása
  useEffect(() => {
    const { telepules, sport, allEvents } = getQueryParams()

    // Update selected location and sport from query parameters if they exist
    if (telepules) {
      setSelectedLocation(decodeURIComponent(telepules))
    }

    if (sport) {
      setSelectedSport(decodeURIComponent(sport))
    }

    // Set if we're showing all events
    setIsAllEvents(allEvents)

    // Set current user
    const user = getCurrentUser();
    setCurrentUser(user);
  }, [])

  // Módosított függvény a felhasználó csatlakozási állapotának és szerepének ellenőrzésére
  const checkParticipationForEvents = async (events) => {
    const token = getAuthToken();
    if (!token || !events.length) return;

    const user = getCurrentUser();
    if (!user) return;

    // Minden eseményhez külön-külön ellenőrizzük a csatlakozási állapotot és szerepet
    const joinedEventDetails = [];

    await Promise.all(events.map(async (event) => {
      try {
        const response = await fetch(`http://localhost:8081/api/v1/events/${event.id}/check-participation`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.isParticipant) {
            // Ellenőrizzük, hogy a felhasználó szervező-e
            const isOrganizer = event.szervezoId === user.id ||
              (event.szervezo && event.szervezo.id === user.id);

            joinedEventDetails.push({
              id: event.id,
              role: isOrganizer ? "szervező" : "résztvevő"
            });
          }
        }
      } catch (error) {
        console.error(`Hiba az esemény (${event.id}) csatlakozási állapotának ellenőrzésekor:`, error);
      }
    }));

    setJoinedEvents(joinedEventDetails);
  };

  // Fetch events from API
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError(null);
      try {
        // Get the authentication token
        const token = getAuthToken();

        // Check if we want all events by age
        const { allEvents } = getQueryParams();

        let apiUrl;
        let headers = {};

        if (token) {
          headers = {
            "Authorization": `Bearer ${token}`
          };
        }

        if (allEvents) {
          // Use the endpoint that returns all events filtered by age
          if (!token) {
            setError("A funkció használatához be kell jelentkezni!");
            setLoading(false);
            return;
          }
          apiUrl = `http://localhost:8081/api/v1/all-events-by-age`;
        } else {
          // Csak akkor folytassuk, ha mindkét paraméter meg van adva
          if (!selectedSport || !selectedLocation) {
            setError("A kereséshez meg kell adni a sportot és a települést!");
            setLoading(false);
            return;
          }

          // Használjuk a megadott végpontot, alapértelmezett értékek nélkül
          if (token) {
            apiUrl = `http://localhost:8081/api/v1/getEsemenyekByAge/${encodeURIComponent(selectedLocation)}/${encodeURIComponent(selectedSport)}`;
          } else {
            apiUrl = `http://localhost:8081/api/v1/getEsemenyek/${encodeURIComponent(selectedLocation)}/${encodeURIComponent(selectedSport)}`;
          }
        }

        console.log("Fetching events from:", apiUrl);

        const response = await fetch(apiUrl, { headers });
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();
        const fetchedEvents = data.events || [];

        // Now fetch participant data for each event
        const eventsWithParticipants = await Promise.all(
          fetchedEvents.map(async (event) => {
            try {
              const participantsResponse = await fetch(`http://localhost:8081/api/v1/events/${event.id}/participants`);
              if (participantsResponse.ok) {
                const participantsData = await participantsResponse.json();
                return {
                  ...event,
                  resztvevok_lista: participantsData.participants || []
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

        // Ha van token, ellenőrizzük a felhasználó csatlakozási állapotát és szerepét
        if (token && eventsWithParticipants.length > 0) {
          await checkParticipationForEvents(eventsWithParticipants);
        }

        // If we got user age information, we can display it
        if (data.userAge) {
          setUserAge(data.userAge);
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

    // Ellenőrizzük, hogy van-e allEvents paraméter az URL-ben
    const params = new URLSearchParams(window.location.search);
    const allEvents = params.get("allEvents") === "true";

    // Ha allEvents=true, akkor csak akkor futtatjuk a fetchEvents-t, ha változik az allEvents értéke
    // Egyébként akkor futtatjuk, ha változik a selectedSport vagy selectedLocation
    fetchEvents();
  }, [selectedSport, selectedLocation, window.location.search]);

  // Módosított függvény a résztvevők frissítésére
  const handleParticipantUpdate = (eventId, isJoined, participant) => {
    // Update the events array with the new participant count
    setEvents(prevEvents =>
      prevEvents.map(event => {
        if (event.id === eventId) {
          // If we received a full participants list, use it directly
          // This replaces the current list instead of adding to it
          if (participant.fullParticipantsList) {
            return {
              ...event,
              resztvevok_lista: participant.fullParticipantsList
            };
          }

          // Otherwise handle individual participant updates
          const currentParticipants = event.resztvevok_lista || [];

          // If the user joined, add them to the list if not already there
          if (isJoined && participant.userId !== 'count-update' &&
            !currentParticipants.some(p => p.id === participant.userId)) {
            return {
              ...event,
              resztvevok_lista: [...currentParticipants, participant]
            };
          }

          // If the user left, remove them from the list
          if (!isJoined) {
            return {
              ...event,
              resztvevok_lista: currentParticipants.filter(p => p.id !== participant.userId)
            };
          }
        }
        return event;
      })
    );

    // Ha a felhasználó csatlakozott, frissítsük a csatlakozott események listáját
    if (isJoined) {
      const user = getCurrentUser();
      const isOrganizer = participant.isOrganizer ||
        (user && events.find(e => e.id === eventId)?.szervezoId === user.id);

      // Ellenőrizzük, hogy már szerepel-e az esemény a listában
      if (!joinedEvents.some(event => event.id === eventId)) {
        setJoinedEvents(prev => [...prev, {
          id: eventId,
          role: isOrganizer ? "szervező" : "résztvevő"
        }]);
      }
    } else if (!isJoined) {
      setJoinedEvents(prev => prev.filter(event => event.id !== eventId));
    }
  };

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

  // Segédfüggvény annak ellenőrzésére, hogy a felhasználó csatlakozott-e az eseményhez és milyen szerepben
  const getUserEventRole = (eventId) => {
    const eventInfo = joinedEvents.find(event => event.id === eventId);
    return eventInfo ? eventInfo.role : null;
  }

  return (
    <>
      {/* Add the Header component at the top */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="min-h-screen bg-gradient-to-br from-slate-800 to-zinc-900 text-white">
        <div className="container mx-auto px-4 py-8">
          {/* Cím hozzáadása, ha az allEvents=true */}
          {isAllEvents && (
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-white">
                Minden esemény a korodnak megfelelően
              </h1>
              {userAge && (
                <p className="text-white/60">
                  Életkorod: {userAge} év
                </p>
              )}
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
                      Próbáld módosítani a szűrőket vagy hozz létre egy új eseményt.
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
                            src={event.imageUrl}
                            alt={event.Sportok?.Nev || "Sport esemény"}
                            className="w-full h-48 md:h-full object-cover"
                          />
                          {/* Megtartom a sportág feliratot az eredeti helyén */}
                          <div className="absolute top-0 left-0 bg-blue-600 text-white px-3 py-1 rounded-br-lg font-medium">
                            {event.Sportok?.Nev || selectedSport || "Sport"}
                          </div>
                        </div>

                        <div className="flex-1 p-6">
                          <div className="flex flex-col md:flex-row justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-xl font-bold">{event.Helyszin?.Nev || "Helyszín"}</h3>
                                {/* Eltávolítottam a szint feliratot innen */}
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

                              {/* Sport szint áthelyezve ide a kezdő és záróidő alá */}
                              <div className="flex items-center gap-2 mt-1 text-white/60">
                                <span className="px-2 py-0.5 bg-white/10 text-white/80 rounded text-xs">
                                  {event.szint || "Ismeretlen szint"}
                                </span>
                              </div>
                            </div>

                            <div className="text-right mt-4 md:mt-0">
                              <div className="inline-flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full">
                                <Users className="h-4 w-4" />
                                <span>
                                  {(event.resztvevok_lista || []).length}/{event.maximumLetszam || 10} résztvevő
                                </span>
                              </div>
                              {/* Betelt felirat hozzáadása, ha elérte a maximum létszámot */}
                              {(event.resztvevok_lista || []).length >= (event.maximumLetszam || 10) && (
                                <div className="mt-1 text-red-500 text-sm font-medium">
                                  Betelt
                                </div>
                              )}
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
                            {/* Csak akkor jelenítjük meg a leírást, ha van */}
                            {event.leiras && <div className="text-white/80">{event.leiras}</div>}
                          </div>

                          <div className="mt-6 flex justify-end items-center">
                            {/* Módosított gomb: Szervezőként, Résztvevőként vagy Megtekintés */}
                            {getUserEventRole(event.id) ? (
                              <button
                                onClick={() => openEventModal(event)}
                                className={`px-4 py-1.5 ${getUserEventRole(event.id) === "szervező"
                                    ? "bg-purple-600 hover:bg-purple-700"
                                    : "bg-green-600 hover:bg-green-700"
                                  } text-white rounded-md transition-colors`}
                              >
                                {getUserEventRole(event.id) === "szervező"
                                  ? "Szervezőként csatlakozva"
                                  : "Résztvevőként csatlakozva"}
                              </button>
                            ) : (
                              <button
                                onClick={() => openEventModal(event)}
                                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                              >
                                Megtekintés
                              </button>
                            )}
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
      </div>

      {/* Event Modal */}
      {showModal && selectedEvent && (
        <EventModal
          event={selectedEvent}
          onClose={closeEventModal}
          onParticipantUpdate={handleParticipantUpdate}
          userRole={getUserEventRole(selectedEvent.id)}
        />
      )}
    </>
  )
}

export default SportMateFinder
