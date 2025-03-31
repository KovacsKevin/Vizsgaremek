"use client"

import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Header from './Header'
import { Calendar, MapPin, Users, Clock, Plus, Loader, Filter } from "lucide-react"
import Cookies from "js-cookie"
import EventModal from './event-modal'
import SportEventDetailsModal from '../sport-event-details-modal'
import { HelyszinModal } from './helyszin-modal'

const MyEvents = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("myevents")
  const [organizedEvents, setOrganizedEvents] = useState([])
  const [participatedEvents, setParticipatedEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeFilter, setActiveFilter] = useState("organized") // "all", "organized", "participated"
  const [refreshData, setRefreshData] = useState(0)

  // Modal states
  const [isEventModalOpen, setIsEventModalOpen] = useState(false)
  const [isHelyszinModalOpen, setIsHelyszinModalOpen] = useState(false)
  const [isSportModalOpen, setIsSportModalOpen] = useState(false)

  // Új állapot a SportEventDetailsModal-hoz
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [isSportEventDetailsModalOpen, setIsSportEventDetailsModalOpen] = useState(false)

  // Modal content
  const eventModalContent = {
    title: "Új esemény létrehozása",
    description: "Tölts ki minden mezőt az esemény létrehozásához"
  }

  // Helyszín modal content
  const helyszinModalContent = {
    title: "Új helyszín létrehozása",
    description: "Tölts ki minden mezőt a helyszín létrehozásához"
  }

  // Format date to Hungarian format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("hu-HU", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "short",
    });
  };

  // Format time from date
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("hu-HU", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = Cookies.get("token")
        if (!token) {
          navigate("/login")
          return
        }

        setLoading(true)
        setError(null)

        // Párhuzamosan lekérjük mindkét típusú eseményt
        const [organizedResponse, participatedResponse] = await Promise.allSettled([
          fetch("http://localhost:8081/api/v1/organized-events", {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch("http://localhost:8081/api/v1/participated-events", {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        console.log("Organized response status:", organizedResponse.status);
        console.log("Participated response status:", participatedResponse.status);

        // Szervezett események feldolgozása
        if (organizedResponse.status === 'fulfilled') {
          if (organizedResponse.value.ok) {
            const data = await organizedResponse.value.json();
            console.log("Organized events data:", data);
            setOrganizedEvents(data.events || []);
          } else if (organizedResponse.value.status === 404) {
            // 404 is expected if user has no organized events
            console.log("No organized events found");
            setOrganizedEvents([]);
          } else {
            console.error("Hiba a szervezett események lekérésekor:", organizedResponse.value.status);
            const errorText = await organizedResponse.value.text();
            console.error("Error response:", errorText);
          }
        } else {
          console.error("Organized events request failed:", organizedResponse.reason);
        }

        // Résztvevőként szereplő események feldolgozása
        if (participatedResponse.status === 'fulfilled') {
          if (participatedResponse.value.ok) {
            const data = await participatedResponse.value.json();
            console.log("Participated events data:", data);
            setParticipatedEvents(data.events || []);
          } else if (participatedResponse.value.status === 404) {
            // 404 is expected if user has no participated events
            console.log("No participated events found");
            setParticipatedEvents([]);
          } else {
            console.error("Hiba a résztvevőként szereplő események lekérésekor:", participatedResponse.value.status);
            const errorText = await participatedResponse.value.text();
            console.error("Error response:", errorText);
          }
        } else {
          console.error("Participated events request failed:", participatedResponse.reason);
        }

      } catch (err) {
        console.error("Hiba az események lekérésekor:", err)
        setError("Nem sikerült betölteni az eseményeket. Kérjük, próbáld újra később.")
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [navigate, refreshData])

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

  // Modal kezelő függvények
  const openEventModal = () => {
    setIsEventModalOpen(true);
  }

  const closeEventModal = () => {
    setIsEventModalOpen(false);
  }

  const openHelyszinModal = () => {
    setIsHelyszinModalOpen(true);
  }

  const closeHelyszinModal = () => {
    setIsHelyszinModalOpen(false);
    // Újra megnyitjuk az esemény modalt
    setIsEventModalOpen(true);
  }

  const closeSportModal = () => {
    setIsSportModalOpen(false);
    // Újra megnyitjuk az esemény modalt
    setIsEventModalOpen(true);
  }

  // Új függvények a SportEventDetailsModal kezeléséhez
  const openSportEventDetailsModal = (event) => {
    setSelectedEvent(event);
    setIsSportEventDetailsModalOpen(true);
  }

  const closeSportEventDetailsModal = () => {
    setIsSportEventDetailsModalOpen(false);
    setSelectedEvent(null);
  }

  // Résztvevők frissítésének kezelése
  const handleParticipantUpdate = (eventId, isJoining, participant) => {
    console.log(`Participant update for event ${eventId}:`, participant);

    // Ha ez egy esemény frissítés értesítés
    if (participant.userId === 'event-updated' && participant.eventData) {
      console.log("Event was updated, updating local state with:", participant.eventData);

      // Frissítsük a helyi állapotot az új esemény adatokkal
      setOrganizedEvents(prev =>
        prev.map(event =>
          event.id === eventId ? { ...event, ...participant.eventData } : event
        )
      );

      setParticipatedEvents(prev =>
        prev.map(event =>
          event.id === eventId ? { ...event, ...participant.eventData } : event
        )
      );

      return;
    }

    // Ha ez egy résztvevők számának frissítése
    if (participant.userId === 'count-update' && participant.fullParticipantsList) {
      console.log("Participants count updated:", participant.fullParticipantsList.length);

      const updatedCount = participant.fullParticipantsList.length;

      // Frissítsük mindkét listát, mert nem tudjuk melyikben van az esemény
      setOrganizedEvents(prev =>
        prev.map(event =>
          event.id === eventId ? { ...event, resztvevoCount: updatedCount } : event
        )
      );

      setParticipatedEvents(prev =>
        prev.map(event =>
          event.id === eventId ? { ...event, resztvevoCount: updatedCount } : event
        )
      );

      return;
    }

    // Ha egy felhasználó csatlakozott vagy kilépett
    if (participant.userId && participant.userId !== 'event-updated' && participant.userId !== 'count-update') {
      console.log(`User ${participant.userId} ${isJoining ? 'joined' : 'left'} event ${eventId}`);

      // Frissítsük a résztvevők számát mindkét listában
      const updateParticipantCount = (events) => {
        return events.map(event => {
          if (event.id === eventId) {
            // Ha van resztvevoCount, frissítsük, egyébként számoljuk ki a resztvevok_lista alapján
            const currentCount = event.resztvevoCount !== undefined
              ? event.resztvevoCount
              : (event.resztvevok_lista?.length || 0);

            return {
              ...event,
              resztvevoCount: isJoining ? currentCount + 1 : currentCount - 1
            };
          }
          return event;
        });
      };

      setOrganizedEvents(prev => updateParticipantCount(prev));
      setParticipatedEvents(prev => updateParticipantCount(prev));

      // Ha a felhasználó kilépett egy eseményből, és ez a "participated" tab, 
      // akkor frissítsük a teljes listát
      if (!isJoining && activeFilter === "participated") {
        setRefreshData(prev => prev + 1);
      }

      return;
    }

    // Ha nem tudjuk pontosan kezelni a változást, akkor frissítsünk mindent
    console.log("Unknown participant update, refreshing all data");
    setRefreshData(prev => prev + 1);
  };

  // Sikeres helyszín létrehozás kezelése
  const handleHelyszinSuccess = (newLocation) => {
    closeHelyszinModal();
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
              onClick={openEventModal}
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
              className={`px-4 py-2 rounded-md transition-all ${activeFilter === "all"
                ? "bg-gradient-to-r from-blue-500/20 to-purple-600/20 text-white"
                : "text-slate-300 hover:bg-white/5"
                }`}
            >
              Összes
            </button>
            <button
              onClick={() => setActiveFilter("organized")}
              className={`px-4 py-2 rounded-md transition-all ${activeFilter === "organized"
                ? "bg-gradient-to-r from-green-500/20 to-emerald-600/20 text-white"
                : "text-slate-300 hover:bg-white/5"
                }`}
            >
              Szervezőként
            </button>
            <button
              onClick={() => setActiveFilter("participated")}
              className={`px-4 py-2 rounded-md transition-all ${activeFilter === "participated"
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
              <button
                className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white text-sm"
                onClick={() => setRefreshData(prev => prev + 1)}
              >
                Újrapróbálkozás
              </button>
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
                  : activeFilter === "participated" ? "Csatlakozz eseményekhez, hogy itt megjelenjenek."
                    : "Hozz létre vagy csatlakozz eseményekhez, hogy itt megjelenjenek."}
              </p>
              <button
                onClick={activeFilter === "participated" ? () => navigate("/events") : openEventModal}
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
                      src={event.imageUrl || event.Sport?.KepUrl || event.Sportok?.KepUrl || "/placeholder.svg"}
                      alt={event.Sportok?.Nev || event.Sport?.Nev || "Esemény kép"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-xl font-semibold mb-2 truncate">{event.Sportok?.Nev || event.Sport?.Nev || "Esemény"}</h3>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-slate-300">
                        <MapPin size={16} className="mr-2 text-slate-400" />
                        <span>{event.Helyszin?.Telepules || "Ismeretlen helyszín"}</span>
                      </div>
                      <div className="flex items-center text-sm text-slate-300">
                        <Calendar size={16} className="mr-2 text-slate-400" />
                        <span>{formatDate(event.kezdoIdo)}</span>
                      </div>
                      <div className="flex items-center text-sm text-slate-300">
                        <Clock size={16} className="mr-2 text-slate-400" />
                        <span>{formatTime(event.kezdoIdo)} - {formatTime(event.zaroIdo)}</span>
                      </div>
                      <div className="flex items-center text-sm text-slate-300">
                        <Users size={16} className="mr-2 text-slate-400" />
                        <span>
                          {event.résztvevőkSzáma !== undefined ? event.résztvevőkSzáma :
                            (event.resztvevok_lista?.length || 0)}/{event.maximumLetszam} fő
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={`text-xs px-2 py-1 rounded-full ${getEventRole(event.id) === "szervező"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-blue-500/20 text-blue-400"
                        }`}>
                        {getEventRole(event.id) === "szervező" ? "Szervező" : "Résztvevő"}
                      </span>
                      <button
                        onClick={() => openSportEventDetailsModal(event)}
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

      {/* Modals */}
      <EventModal
        isOpen={isEventModalOpen}
        onClose={closeEventModal}
        modalContent={eventModalContent}
        openHelyszinModal={() => {
          setIsEventModalOpen(false);
          setIsHelyszinModalOpen(true);
        }}
        openSportModal={() => {
          setIsEventModalOpen(false);
          setIsSportModalOpen(true);
        }}
      />

      {/* HelyszinModal */}
      <HelyszinModal
        isOpen={isHelyszinModalOpen}
        onClose={closeHelyszinModal}
        modalContent={helyszinModalContent}
        onSuccess={handleHelyszinSuccess}
      />

      {/* SportEventDetailsModal */}
      {isSportEventDetailsModalOpen && selectedEvent && (
        <SportEventDetailsModal
          event={selectedEvent}
          onClose={closeSportEventDetailsModal}
          onParticipantUpdate={handleParticipantUpdate}
        />
      )}

      {/* Itt kellene implementálni a SportModal komponenst is, ha szükséges */}
      {/* <SportModal
      isOpen={isSportModalOpen}
      onClose={closeSportModal}
      modalContent={{
        title: "Új sport létrehozása",
        description: "Tölts ki minden mezőt a sport létrehozásához"
      }}
      onSuccess={() => {
        closeSportModal();
      }}
    /> */}
    </div>
  )
}

export default MyEvents

