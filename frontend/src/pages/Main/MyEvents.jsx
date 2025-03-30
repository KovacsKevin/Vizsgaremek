import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { Calendar, Clock, MapPin, Users, Plus, Loader2 } from "lucide-react";
import EventModal from "../sport-event-details-modal";

const MyEvents = () => {
  const navigate = useNavigate();
  const [organizedEvents, setOrganizedEvents] = useState([]);
  const [participatedEvents, setParticipatedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("organized");
  const [isSportEventDetailsModalOpen, setIsSportEventDetailsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  // Add a new state to track when to refresh data
  const [refreshData, setRefreshData] = useState(0);

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

  // Fetch events when component mounts or refreshData changes
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = Cookies.get("token");
        if (!token) {
          navigate("/login");
          return;
        }

        setLoading(true);
        setError(null);

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
        console.error("Hiba az események lekérésekor:", err);
        setError("Nem sikerült betölteni az eseményeket. Kérjük, próbáld újra később.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [navigate, refreshData]); // Add refreshData to the dependency array

  const openSportEventDetailsModal = (event) => {
    setSelectedEvent(event);
    setIsSportEventDetailsModalOpen(true);
  };

  const closeSportEventDetailsModal = () => {
    setIsSportEventDetailsModalOpen(false);
    setSelectedEvent(null);
    // Nem töltjük újra az adatokat automatikusan, csak ha szükséges
    // A handleParticipantUpdate már kezeli a frissítéseket
  };

  // Handle participant updates (joining/leaving events)
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
      if (!isJoining && activeTab === "participated") {
        setRefreshData(prev => prev + 1);
      }

      return;
    }

    // Ha nem tudjuk pontosan kezelni a változást, akkor frissítsünk mindent
    console.log("Unknown participant update, refreshing all data");
    setRefreshData(prev => prev + 1);
  };

  // Render event card
  const renderEventCard = (event) => {
    return (
      <div
        key={event.id}
        className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:translate-y-[-5px] cursor-pointer border border-slate-700/50"
        onClick={() => openSportEventDetailsModal(event)}
      >
        <div className="relative h-48 overflow-hidden">
          <img
            src={event.imageUrl || event.Sportok?.KepUrl || "/placeholder.svg"}
            alt={event.Sportok?.Nev || "Sport esemény"}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-0 left-0 bg-blue-600 text-white px-3 py-1 rounded-br-lg font-medium">
            {event.Sportok?.Nev || "Sport"}
          </div>
        </div>

        <div className="p-5">
          <h3 className="text-xl font-bold mb-2 text-white">{event.Helyszin?.Nev || "Helyszín"}</h3>

          <div className="space-y-2 text-gray-300">
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-blue-400" />
              <span className="text-sm">
                {event.Helyszin?.Telepules || "Város"}, {event.Helyszin?.Cim || "Cím"}
              </span>
            </div>

            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-blue-400" />
              <span className="text-sm">{formatDate(event.kezdoIdo)}</span>
            </div>

            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2 text-blue-400" />
              <span className="text-sm">
                {formatTime(event.kezdoIdo)} - {formatTime(event.zaroIdo)}
              </span>
            </div>

            <div className="flex items-center">
              <Users className="h-4 w-4 mr-2 text-blue-400" />
              <span className="text-sm">
                {event.resztvevoCount !== undefined ? event.resztvevoCount : (event.resztvevok_lista?.length || 0)}/{event.maximumLetszam || 10} résztvevő
              </span>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs">
              {event.szint || "Ismeretlen szint"}
            </span>
            <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs">
              {event.minimumEletkor}-{event.maximumEletkor} év
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Eseményeim</h1>
        <button
          onClick={() => navigate("/create-event")}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg transition-colors shadow-lg"
        >
          <Plus className="h-5 w-5" />
          Új esemény
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-700 mb-6">
        <button
          className={`py-2 px-4 font-medium text-sm ${activeTab === "organized"
              ? "text-blue-400 border-b-2 border-blue-400"
              : "text-gray-400 hover:text-gray-300"
            }`}
          onClick={() => setActiveTab("organized")}
        >
          Szervezett események
        </button>
        <button
          className={`py-2 px-4 font-medium text-sm ${activeTab === "participated"
              ? "text-blue-400 border-b-2 border-blue-400"
              : "text-gray-400 hover:text-gray-300"
            }`}
          onClick={() => setActiveTab("participated")}
        >
          Résztvevőként
        </button>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
          <span className="ml-3 text-xl text-gray-300">Események betöltése...</span>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-300 p-4 rounded-lg mb-6">
          <p>{error}</p>
          <button
            className="mt-2 text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm"
            onClick={() => setRefreshData(prev => prev + 1)}
          >
            Újrapróbálkozás
          </button>
        </div>
      )}

      {/* No events state */}
      {!loading && !error && activeTab === "organized" && organizedEvents.length === 0 && (
        <div className="text-center py-20">
          <h3 className="text-xl font-semibold text-gray-300 mb-4">Még nem szerveztél eseményt</h3>
          <p className="text-gray-400 mb-6">Hozz létre egy új eseményt a "Új esemény" gombra kattintva!</p>
          <button
            onClick={() => navigate("/create-event")}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg transition-colors shadow-lg"
          >
            Esemény létrehozása
          </button>
        </div>
      )}

      {!loading && !error && activeTab === "participated" && participatedEvents.length === 0 && (
        <div className="text-center py-20">
          <h3 className="text-xl font-semibold text-gray-300 mb-4">Még nem csatlakoztál eseményhez</h3>
          <p className="text-gray-400 mb-6">Fedezd fel a közelben lévő eseményeket és csatlakozz hozzájuk!</p>
          <button
            onClick={() => navigate("/events")}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg transition-colors shadow-lg"
          >
            Események felfedezése
          </button>
        </div>
      )}

      {/* Event grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeTab === "organized" &&
            organizedEvents.map((event) => renderEventCard(event))}
          {activeTab === "participated" &&
            participatedEvents.map((event) => renderEventCard(event))}
        </div>
      )}

      {/* Event details modal */}
      {isSportEventDetailsModalOpen && selectedEvent && (
        <EventModal
          event={selectedEvent}
          onClose={closeSportEventDetailsModal}
          onParticipantUpdate={handleParticipantUpdate}
        />
      )}
    </div>
  );
};

export default MyEvents;
