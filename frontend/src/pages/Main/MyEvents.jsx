"use client"

import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Header from './Header'
import { Calendar, MapPin, Users, Clock, Plus, Loader, Archive, Mail } from "lucide-react"
import Cookies from "js-cookie"
import EventModal from './event-modal'
import SportEventDetailsModal from '../sport-event-details-modal'
import { HelyszinModal } from './helyszin-modal'
import { toast } from "react-hot-toast"

const MyEvents = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("myevents")
  const [organizedEvents, setOrganizedEvents] = useState([])
  const [participatedEvents, setParticipatedEvents] = useState([])
  const [archivedEvents, setArchivedEvents] = useState([]) // State for archived events
  const [invitations, setInvitations] = useState([]) // State for invitations
  const [pendingEvents, setPendingEvents] = useState([]) // State for pending events
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeFilter, setActiveFilter] = useState("all") // Default filter is "all"
  const [refreshData, setRefreshData] = useState(0)

  // Modal states
  const [isEventModalOpen, setIsEventModalOpen] = useState(false)
  const [isHelyszinModalOpen, setIsHelyszinModalOpen] = useState(false)
  const [isSportModalOpen, setIsSportModalOpen] = useState(false)

  // State for SportEventDetailsModal
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [isSportEventDetailsModalOpen, setIsSportEventDetailsModalOpen] = useState(false)
  const [isInvitationView, setIsInvitationView] = useState(false) // New state to track if viewing an invitation
  const [isPendingView, setIsPendingView] = useState(false) // New state to track if viewing a pending event

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

  // Format full date and time
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("hu-HU", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    }) + ' ' + date.toLocaleTimeString("hu-HU", {
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

        // Fetch all types of events in parallel, including invitations and pending events
        const [organizedResponse, participatedResponse, archivedResponse, invitationsResponse, pendingResponse] = await Promise.allSettled([
          fetch("http://localhost:8081/api/v1/organized-events", {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch("http://localhost:8081/api/v1/participated-events", {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch("http://localhost:8081/api/v1/archived-events", {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch("http://localhost:8081/api/v1/invitations", {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch("http://localhost:8081/api/v1/pending-events", { // Új végpont a függőben lévő eseményekhez
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        console.log("Organized response status:", organizedResponse.status);
        console.log("Participated response status:", participatedResponse.status);
        console.log("Archived response status:", archivedResponse.status);
        console.log("Invitations response status:", invitationsResponse.status);
        console.log("Pending response status:", pendingResponse.status);

        // Process organized events
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

        // Process participated events
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

        // Process archived events
        if (archivedResponse.status === 'fulfilled') {
          if (archivedResponse.value.ok) {
            const data = await archivedResponse.value.json();
            console.log("Archived events data:", data);
            setArchivedEvents(data.events || []);
          } else if (archivedResponse.value.status === 404) {
            // 404 is expected if user has no archived events
            console.log("No archived events found");
            setArchivedEvents([]);
          } else {
            console.error("Hiba az archivált események lekérésekor:", archivedResponse.value.status);
            const errorText = await archivedResponse.value.text();
            console.error("Error response:", errorText);
          }
        } else {
          console.error("Archived events request failed:", archivedResponse.reason);
        }

        // Process invitations
        if (invitationsResponse.status === 'fulfilled') {
          if (invitationsResponse.value.ok) {
            const data = await invitationsResponse.value.json();
            console.log("Invitations data:", data);
            setInvitations(data.events || []); // Helyesen kezeli a data.events formátumot
          } else if (invitationsResponse.value.status === 404) {
            // 404 is expected if user has no invitations
            console.log("No invitations found");
            setInvitations([]);
          } else {
            console.error("Hiba a meghívások lekérésekor:", invitationsResponse.value.status);
            const errorText = await invitationsResponse.value.text();
            console.error("Error response:", errorText);
          }
        } else {
          console.error("Invitations request failed:", invitationsResponse.reason);
        }

        // Process pending events
        if (pendingResponse.status === 'fulfilled') {
          if (pendingResponse.value.ok) {
            const data = await pendingResponse.value.json();
            console.log("Pending events data:", data);
            setPendingEvents(data.events || []);
          } else if (pendingResponse.value.status === 404) {
            // 404 is expected if user has no pending events
            console.log("No pending events found");
            setPendingEvents([]);
          } else {
            console.error("Hiba a függőben lévő események lekérésekor:", pendingResponse.value.status);
            const errorText = await pendingResponse.value.text();
            console.error("Error response:", errorText);
          }
        } else {
          console.error("Pending events request failed:", pendingResponse.reason);
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

  // Filter events based on the selected filter
  const filteredEvents = () => {
    if (activeFilter === "organized") return organizedEvents;
    if (activeFilter === "participated") return participatedEvents;
    if (activeFilter === "archived") return archivedEvents;
    if (activeFilter === "invitations") return invitations;
    if (activeFilter === "pending") return pendingEvents; // Új szűrő a függőben lévő eseményekhez
    // "all" shows only active events (not archived)
    return [...organizedEvents, ...participatedEvents];
  }

  // Determine event role (organizer or player)
  const getEventRole = (eventId) => {
    // Check if the event is in organized events
    if (organizedEvents.some(event => event.id === eventId)) return "szervező";

    // Check role in archived events
    const archivedEvent = archivedEvents.find(event => event.id === eventId);
    if (archivedEvent && archivedEvent.Résztvevős && archivedEvent.Résztvevős.length > 0) {
      return archivedEvent.Résztvevős[0].szerep;
    }

    return "játékos";
  }

  // Helper function to get sport name
  const getSportName = (event) => {
    // For invitations or pending events, the structure is different
    if (activeFilter === "invitations" || activeFilter === "pending") {
      return event.Sportok?.Nev || "Esemény";
    }
    // For regular events
    return event.Sportok?.Nev || event.Sport?.Nev || "Esemény";
  }

  // Helper function to get sport image
  const getSportImage = (event) => {
    // For invitations or pending events, the structure is different
    if (activeFilter === "invitations" || activeFilter === "pending") {
      if (event.imageUrl) {
        return `http://localhost:8081${event.imageUrl.startsWith('/') ? event.imageUrl : `/${event.imageUrl}`}`;
      }
      return event.Sportok?.KepUrl || "/placeholder.svg";
    }

    // For regular events
    if (event.imageUrl) {
      return `http://localhost:8081${event.imageUrl.startsWith('/') ? event.imageUrl : `/${event.imageUrl}`}`;
    }
    return event.Sport?.KepUrl || event.Sportok?.KepUrl || "/placeholder.svg";
  }

  // Helper function to get location name
  const getLocationName = (event) => {
    // For invitations or pending events, the structure is different
    if (activeFilter === "invitations" || activeFilter === "pending") {
      return event.Helyszin?.Telepules || "Ismeretlen helyszín";
    }
    // For regular events
    return event.Helyszin?.Telepules || "Ismeretlen helyszín";
  }

  // Helper function to get event start time
  const getEventStartTime = (event) => {
    // For invitations or pending events, the structure is different
    if (activeFilter === "invitations" || activeFilter === "pending") {
      return event.kezdoIdo || new Date().toISOString();
    }
    // For regular events
    return event.kezdoIdo;
  }

  // Helper function to get event end time
  const getEventEndTime = (event) => {
    // For invitations or pending events, the structure is different
    if (activeFilter === "invitations" || activeFilter === "pending") {
      return event.zaroIdo || new Date().toISOString();
    }
    // For regular events
    return event.zaroIdo;
  }

  // Helper function to get participant count
  const getParticipantsCount = (event) => {
    // For invitations or pending events, we might not have this info
    if (activeFilter === "invitations" || activeFilter === "pending") {
      // Ellenőrizzük az összes lehetséges mezőt a résztvevők számához
      if (event.resztvevoCount !== undefined) return event.resztvevoCount;
      if (event.résztvevőkSzáma !== undefined) return event.résztvevőkSzáma;
      if (event.resztvevok_lista?.length !== undefined) return event.resztvevok_lista.length;
      if (event.Résztvevős?.length !== undefined) return event.Résztvevős.length;
      return 0; // Ha egyik sem található, akkor 0-t adunk vissza
    }
    // For regular events
    if (event.résztvevőkSzáma !== undefined) return event.résztvevőkSzáma;
    if (event.resztvevoCount !== undefined) return event.resztvevoCount;
    return event.resztvevok_lista?.length || 0;
  }

  // Helper function to get maximum participants
  const getMaxParticipants = (event) => {
    // For invitations or pending events, we might not have this info
    if (activeFilter === "invitations" || activeFilter === "pending") {
      return event.maximumLetszam || 10; // Default value if not available
    }
    // For regular events
    return event.maximumLetszam;
  }

  // Helper function to get event ID
  const getEventId = (event) => {
    console.log("Getting event ID for event:", event);

    // For invitations or pending events, check all possible properties
    if (activeFilter === "invitations" || activeFilter === "pending") {
      if (event.eseményId !== undefined) return event.eseményId;
      if (event.esemenyId !== undefined) return event.esemenyId;
      if (event.id !== undefined) return event.id;
    }

    // For regular events
    return event.id;
  }

  // Modal handler functions
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
    // Reopen event modal
    setIsEventModalOpen(true);
  }

  const closeSportModal = () => {
    setIsSportModalOpen(false);
    // Reopen event modal
    setIsEventModalOpen(true);
  }

  // Functions for SportEventDetailsModal
  const openSportEventDetailsModal = (event) => {
    setSelectedEvent(event);
    setIsInvitationView(activeFilter === "invitations");
    setIsPendingView(activeFilter === "pending"); // Beállítjuk, ha függőben lévő eseményt nézünk
    setIsSportEventDetailsModalOpen(true);
  }

  const closeSportEventDetailsModal = () => {
    setIsSportEventDetailsModalOpen(false);
    setSelectedEvent(null);
    setIsInvitationView(false);
    setIsPendingView(false); // Visszaállítjuk az alapértelmezett értéket
  }

  // Handle participant updates
  const handleParticipantUpdate = (eventId, isJoining, participant) => {
    console.log(`Participant update for event ${eventId}:`, participant);

    // If this is an event update notification
    if (participant.userId === 'event-updated' && participant.eventData) {
      console.log("Event was updated, updating local state with:", participant.eventData);

      // Update local state with new event data
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

    // If this is a participant count update
    if (participant.userId === 'count-update' && participant.fullParticipantsList) {
      console.log("Participants count updated:", participant.fullParticipantsList.length);

      const updatedCount = participant.fullParticipantsList.length;

      // Update both lists because we don't know which one contains the event
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

    // If a user joined or left
    if (participant.userId && participant.userId !== 'event-updated' && participant.userId !== 'count-update') {
      console.log(`User ${participant.userId} ${isJoining ? 'joined' : 'left'} event ${eventId}`);

      // Update participant count in both lists
      const updateParticipantCount = (events) => {
        return events.map(event => {
          if (event.id === eventId) {
            // If resztvevoCount exists, update it, otherwise calculate from resztvevok_lista
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

      // If user left an event and we're on the "participated" tab, refresh the list
      if (!isJoining && activeFilter === "participated") {
        setRefreshData(prev => prev + 1);
      }

      return;
    }

    // If we can't handle the change precisely, refresh everything
    console.log("Unknown participant update, refreshing all data");
    setRefreshData(prev => prev + 1);
  };

  // Handle successful location creation
  const handleHelyszinSuccess = (newLocation) => {
    closeHelyszinModal();
  }

  // Handle invitation acceptance
  const handleAcceptInvitation = async (eventId) => {
    try {
      const token = Cookies.get("token");
      if (!token) {
        navigate("/login");
        return;
      }

      console.log("Accepting invitation for event ID:", eventId);
      console.log("Selected event:", selectedEvent);

      // Ellenőrizzük, hogy az eventId megfelelő-e
      if (!eventId) {
        console.error("Invalid event ID:", eventId);
        toast.error("Érvénytelen esemény azonosító");
        return;
      }

      const requestBody = { eseményId: eventId };
      console.log("Request body:", requestBody);

      const response = await fetch("http://localhost:8081/api/v1/accept-invitation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      const responseText = await response.text();
      console.log("Response status:", response.status);
      console.log("Response text:", responseText);

      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        console.error("Failed to parse response as JSON:", e);
      }

      if (response.ok) {
        toast.success("Meghívás elfogadva!");
        // Remove from invitations and add to participated events
        setInvitations(prev => prev.filter(inv => getEventId(inv) !== eventId));
        // Refresh data to update participated events
        setRefreshData(prev => prev + 1);
        // Close the modal
        closeSportEventDetailsModal();
      } else {
        toast.error(responseData?.message || "Hiba történt a meghívás elfogadásakor");
        console.error("Error accepting invitation:", responseData);
      }
    } catch (error) {
      console.error("Error accepting invitation:", error);
      toast.error("Hiba történt a meghívás elfogadásakor");
    }
  };

  // Handle invitation rejection
  const handleRejectInvitation = async (eventId) => {
    try {
      const token = Cookies.get("token");
      if (!token) {
        navigate("/login");
        return;
      }

      console.log("Rejecting invitation for event ID:", eventId);

      const response = await fetch("http://localhost:8081/api/v1/reject-invitation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ eseményId: eventId })
      });

      if (response.ok) {
        toast.success("Meghívás elutasítva");

        // Remove from invitations list
        setInvitations(prev => prev.filter(inv => getEventId(inv) !== eventId));

        // Close the modal
        closeSportEventDetailsModal();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Hiba történt a meghívás elutasításakor");
      }
    } catch (error) {
      console.error("Error rejecting invitation:", error);
      toast.error("Hiba történt a meghívás elutasításakor");
    }
  };

  // Handle pending request cancellation
  const handleCancelPendingRequest = async (eventId) => {
    try {
      const token = Cookies.get("token");
      if (!token) {
        navigate("/login");
        return;
      }

      console.log("Canceling pending request for event ID:", eventId);

      const response = await fetch("http://localhost:8081/api/esemeny/cancel-pending-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ eseményId: eventId })
      });

      if (response.ok) {
        toast.success("Jelentkezés visszavonva");

        // Remove from pending events list
        setPendingEvents(prev => prev.filter(event => getEventId(event) !== eventId));

        // Close the modal
        closeSportEventDetailsModal();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Hiba történt a jelentkezés visszavonásakor");
      }
    } catch (error) {
      console.error("Error canceling pending request:", error);
      toast.error("Hiba történt a jelentkezés visszavonásakor");
    }
  };

  // Get appropriate empty state message based on active filter
  const getEmptyStateMessage = () => {
    switch (activeFilter) {
      case "organized":
        return "Még nincsenek szervezett eseményeid";
      case "participated":
        return "Még nem veszel részt eseményeken";
      case "archived":
        return "Nincsenek archivált eseményeid az elmúlt 31 napból";
      case "invitations":
        return "Nincsenek meghívásaid";
      case "pending":
        return "Nincsenek függőben lévő jelentkezéseid";
      default:
        return "Még nincsenek eseményeid";
    }
  }

  // Get appropriate empty state description based on active filter
  const getEmptyStateDescription = () => {
    switch (activeFilter) {
      case "organized":
        return "Hozz létre új eseményt, hogy itt megjelenjen.";
      case "participated":
        return "Csatlakozz eseményekhez, hogy itt megjelenjenek.";
      case "archived":
        return "Az elmúlt 31 napban lezárult események itt jelennek meg.";
      case "invitations":
        return "Itt jelennek meg azok az események, amelyekre meghívást kaptál.";
      case "pending":
        return "Itt jelennek meg azok az események, amelyekre jelentkeztél, de még nem fogadták el.";
      default:
        return "Hozz létre vagy csatlakozz eseményekhez, hogy itt megjelenjenek.";
    }
  }

  // Get appropriate action button text based on active filter
  const getActionButtonText = () => {
    switch (activeFilter) {
      case "organized":
      case "all":
        return "Új esemény létrehozása";
      case "participated":
      case "pending":
        return "Események böngészése";
      case "archived":
        return "Aktív események megtekintése";
      case "invitations":
        return "Események böngészése";
      default:
        return "Új esemény létrehozása";
    }
  }

  // Handle action button click based on active filter
  const handleActionButtonClick = () => {
    switch (activeFilter) {
      case "organized":
      case "all":
        openEventModal();
        break;
      case "participated":
      case "invitations":
      case "pending":
        navigate("/events");
        break;
      case "archived":
        setActiveFilter("all");
        break;
      default:
        openEventModal();
    }
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
            {activeFilter !== "archived" && activeFilter !== "invitations" && activeFilter !== "pending" && (
              <button
                onClick={openEventModal}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 rounded-lg transition-all duration-300 shadow-lg hover:shadow-purple-500/20"
              >
                <Plus size={18} />
                <span>Új esemény</span>
              </button>
            )}
          </div>

          {/* Szűrők */}
          <div className="flex mb-6 space-x-2 bg-slate-700/30 p-1 rounded-lg w-fit overflow-x-auto">
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
            <button
              onClick={() => setActiveFilter("pending")}
              className={`px-4 py-2 rounded-md transition-all ${activeFilter === "pending"
                ? "bg-gradient-to-r from-yellow-500/20 to-orange-600/20 text-white"
                : "text-slate-300 hover:bg-white/5"
                }`}
            >
              Függőben
            </button>
            <button
              onClick={() => setActiveFilter("invitations")}
              className={`px-4 py-2 rounded-md transition-all ${activeFilter === "invitations"
                ? "bg-gradient-to-r from-purple-500/20 to-pink-600/20 text-white"
                : "text-slate-300 hover:bg-white/5"
                }`}
            >
              <Mail size={16} className="inline mr-1" />
              Meghívásaim
            </button>
            <button
              onClick={() => setActiveFilter("archived")}
              className={`px-4 py-2 rounded-md transition-all ${activeFilter === "archived"
                ? "bg-gradient-to-r from-amber-500/20 to-orange-600/20 text-white"
                : "text-slate-300 hover:bg-white/5"
                }`}
            >
              <Archive size={16} className="inline mr-1" />
              Archívum
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
                {activeFilter === "archived" ? (
                  <Archive className="w-10 h-10 text-slate-400" />
                ) : activeFilter === "invitations" ? (
                  <Mail className="w-10 h-10 text-slate-400" />
                ) : activeFilter === "pending" ? (
                  <Clock className="w-10 h-10 text-slate-400" />
                ) : (
                  <Calendar className="w-10 h-10 text-slate-400" />
                )}
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {getEmptyStateMessage()}
              </h3>
              <p className="text-slate-400 max-w-md mb-6">
                {getEmptyStateDescription()}
              </p>
              <button
                onClick={handleActionButtonClick}
                className="px-5 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 rounded-lg transition-all duration-300 shadow-lg hover:shadow-purple-500/20"
              >
                {getActionButtonText()}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents().map((event) => (
                <div
                  key={getEventId(event)}
                  className={`bg-slate-700/50 rounded-lg overflow-hidden border border-slate-600/50 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 ${activeFilter === "archived" || activeFilter === "invitations" || activeFilter === "pending" ? "relative" : ""}`}
                >
                  {activeFilter === "archived" && (
                    <div className="absolute top-2 right-2 z-10 bg-amber-600/80 text-white text-xs px-2 py-1 rounded-md">
                      Archivált
                    </div>
                  )}
                  {activeFilter === "invitations" && (
                    <div className="absolute top-2 right-2 z-10 bg-purple-600/80 text-white text-xs px-2 py-1 rounded-md">
                      Meghívás
                    </div>
                  )}
                  {activeFilter === "pending" && (
                    <div className="absolute top-2 right-2 z-10 bg-yellow-600/80 text-white text-xs px-2 py-1 rounded-md">
                      Függőben
                    </div>
                  )}
                  <div className="h-40 bg-slate-600 overflow-hidden">
                    <img
                      src={getSportImage(event)}
                      alt={getSportName(event)}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error(`Kép betöltési hiba: ${activeFilter === "invitations" || activeFilter === "pending" ? event.imageUrl : event.imageUrl}`);
                        e.target.src = `/placeholder.svg?height=300&width=400&text=Betöltési%20Hiba`;
                      }}
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-xl font-semibold mb-2 truncate">{getSportName(event)}</h3>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-slate-300">
                        <MapPin size={16} className="mr-2 text-slate-400" />
                        <span>{getLocationName(event)}</span>
                      </div>
                      <div className="flex items-start text-sm text-slate-300">
                        <Clock size={16} className="mr-2 mt-1 text-slate-400 flex-shrink-0" />
                        <div className="flex flex-col">
                          <span className="font-medium text-white/80">Kezdés:</span>
                          <span>{formatDateTime(getEventStartTime(event))}</span>
                        </div>
                      </div>
                      <div className="flex items-start text-sm text-slate-300">
                        <Clock size={16} className="mr-2 mt-1 text-slate-400 flex-shrink-0" />
                        <div className="flex flex-col">
                          <span className="font-medium text-white/80">Befejezés:</span>
                          <span>{formatDateTime(getEventEndTime(event))}</span>
                        </div>
                      </div>
                      <div className="flex items-center text-sm text-slate-300">
                        <Users size={16} className="mr-2 text-slate-400" />
                        <span>
                          {getParticipantsCount(event)}/{getMaxParticipants(event)} fő
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={`text-xs px-2 py-1 rounded-full ${activeFilter === "archived"
                          ? "bg-amber-500/20 text-amber-400"
                          : activeFilter === "invitations"
                            ? "bg-purple-500/20 text-purple-400"
                            : activeFilter === "pending"
                              ? "bg-yellow-500/20 text-yellow-400"
                              : getEventRole(getEventId(event)) === "szervező"
                                ? "bg-green-500/20 text-green-400"
                                : "bg-blue-500/20 text-blue-400"
                        }`}>
                        {activeFilter === "archived"
                          ? getEventRole(getEventId(event)) === "szervező" ? "Szervező (archív)" : "Résztvevő (archív)"
                          : activeFilter === "invitations"
                            ? "Meghívott"
                            : activeFilter === "pending"
                              ? "Függőben"
                              : getEventRole(getEventId(event)) === "szervező" ? "Szervező" : "Résztvevő"
                        }
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
          isArchived={activeFilter === "archived"} // Pass isArchived flag to disable editing for archived events
          isInvitation={isInvitationView} // Pass isInvitation flag to show special buttons
          isPending={isPendingView} // Pass isPending flag to show special buttons for pending events
          onAcceptInvitation={() => handleAcceptInvitation(getEventId(selectedEvent))}
          onRejectInvitation={() => handleRejectInvitation(getEventId(selectedEvent))}
          onCancelPendingRequest={() => handleCancelPendingRequest(getEventId(selectedEvent))} // Add handler for canceling pending requests
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


