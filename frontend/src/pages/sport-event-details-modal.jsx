"use client"

import { useState, useEffect } from "react"
import { X, MapPin, Calendar, Clock, Users, Home, DoorOpen, Car, User, CheckCircle, XCircle, Trash, Edit, Plus } from "lucide-react"
import { HelyszinModal } from "./Main/helyszin-modal"

// Placeholder Image component - módosítva a TestImages.jsx logikája alapján
const Image = ({ src, alt, className }) => {
  const formatImageUrl = (url) => {
    if (!url) return "/placeholder.svg";

    // Ha a src már teljes URL (http://localhost:8081 kezdetű), akkor nem módosítjuk
    if (url.startsWith('http://localhost:8081')) return url;

    // Egyébként hozzáadjuk a szerver URL-t
    return `http://localhost:8081${url.startsWith('/') ? url : `/${url}`}`;
  };

  return (
    <img
      src={formatImageUrl(src)}
      alt={alt || ''}
      className={className || ''}
      onError={(e) => {
        console.error(`Kép betöltési hiba: ${src}`);
        e.target.src = "/placeholder.svg?height=300&width=400&text=Betöltési%20Hiba";
      }}
    />
  );
};

// Helper function to get cookie by name
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

// Helper to get current user from token
const getCurrentUser = () => {
  try {
    const token = getCookie('token');
    if (!token) return null;

    // Parse the JWT token to get user information
    // Note: In production, you should use a proper JWT library
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

const EventModal = ({ event, onClose, onParticipantUpdate }) => {
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [selectedParticipant, setSelectedParticipant] = useState(null)
  const [isJoining, setIsJoining] = useState(false)
  const [joinError, setJoinError] = useState('')
  const [isParticipant, setIsParticipant] = useState(false)
  const [participants, setParticipants] = useState(event.resztvevok_lista || [])
  const [currentUser, setCurrentUser] = useState(null)
  // Új állapot a kilépés folyamatának követésére
  const [isLeaving, setIsLeaving] = useState(false)
  const [leaveError, setLeaveError] = useState('')
  // Új állapot a résztvevő eltávolításának követésére
  const [isRemovingParticipant, setIsRemovingParticipant] = useState(false)
  const [removeParticipantError, setRemoveParticipantError] = useState('')
  // Új állapot a szerkesztő modal kezeléséhez
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  // Aktuális esemény adatok tárolása
  const [currentEvent, setCurrentEvent] = useState(event)

  // Function to fetch the latest participants
  const fetchParticipants = async (eventId) => {
    if (!eventId) return;

    try {
      console.log("Fetching participants for event:", eventId);
      const response = await fetch(`http://localhost:8081/api/v1/events/${eventId}/participants`);

      if (response.ok) {
        const data = await response.json();
        console.log("Participants data:", data);
        const newParticipants = data.participants || [];

        // Only update if the count has actually changed
        if (JSON.stringify(newParticipants) !== JSON.stringify(participants)) {
          setParticipants(newParticipants);

          // Only update the parent component if the callback exists
          // and only when the participant count actually changes
          if (onParticipantUpdate) {
            onParticipantUpdate(eventId, true, {
              userId: 'count-update',
              fullParticipantsList: newParticipants
            });
          }
        }
      } else {
        console.error("Error fetching participants, status:", response.status);
      }
    } catch (error) {
      console.error("Error fetching participants:", error);
    }
  };

  // Add this to useEffect to fetch participants when the modal opens
  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);

    if (currentEvent.id) {
      console.log("Modal opened for event:", currentEvent.id);
      fetchParticipants(currentEvent.id);
      if (user) {
        checkParticipation(currentEvent.id, user);
      }
    }
  }, [currentEvent.id]);

  // Check if the current user is already a participant
  const checkParticipation = async (eventId, user) => {
    if (!user || !eventId) return;

    try {
      // Get authentication token from cookie
      const token = getCookie('token');

      if (!token) {
        return; // User is not logged in
      }

      const response = await fetch(`http://localhost:8081/api/v1/events/${eventId}/check-participation`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Participation check result:", data);
        setIsParticipant(data.isParticipant || false);

        // If the user is a participant, make sure they're in the participants list
        if (data.isParticipant && currentUser && !participants.some(p => p.id === currentUser.userId)) {
          // Refresh the participants list
          fetchParticipants(eventId);
        }
      }
    } catch (error) {
      console.error("Hiba a résztvevői státusz ellenőrzésekor:", error);
      // Even if there's an error, try to fetch participants to ensure UI is up to date
      fetchParticipants(eventId);
    }
  };

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

  const openProfileModal = (participant) => {
    setSelectedParticipant(participant)
    setShowProfileModal(true)
  }

  const closeProfileModal = () => {
    setShowProfileModal(false)
    setSelectedParticipant(null)
  }

  // Handle join event functionality
  const handleJoinEvent = async () => {
    if (!currentEvent.id) {
      setJoinError("Esemény azonosító hiányzik");
      return;
    }

    // Check if event is at capacity before making the API call
    if (participants.length >= currentEvent.maximumLetszam) {
      setJoinError("Az esemény betelt, nem lehet több résztvevő");
      return;
    }

    setIsJoining(true);
    setJoinError('');

    try {
      // Get authentication token from cookie
      const token = getCookie('token');

      if (!token) {
        throw new Error("Bejelentkezés szükséges a csatlakozáshoz");
      }

      console.log("Sending join request for event:", currentEvent.id);
      const response = await fetch("http://localhost:8081/api/v1/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          eseményId: currentEvent.id
        }),
      });

      // Try to parse the response JSON
      let responseData = {};
      try {
        responseData = await response.json();
      } catch (e) {
        console.error("Failed to parse response JSON:", e);
      }

      if (!response.ok) {
        // If the error is that the user is already a participant, treat it as success
        if (responseData.message && responseData.message.includes("already a participant")) {
          console.log("User is already a participant, updating UI accordingly");
          setIsParticipant(true);
          // Refresh participants list
          fetchParticipants(currentEvent.id);
          return;
        }

        throw new Error(responseData.message || "Sikertelen csatlakozás");
      }

      console.log("Join successful:", responseData);

      // Update participation status
      setIsParticipant(true);

      // Add the new participant to the list if we have the data
      if (responseData.participant) {
        const newParticipant = {
          id: responseData.participant.userId,
          name: responseData.participant.name,
          image: responseData.participant.image || "/api/placeholder/100/100",
          role: responseData.participant.role,
          joinDate: responseData.participant.joinDate
        };

        // Only add if not already in the list
        if (!participants.some(p => p.id === newParticipant.id)) {
          setParticipants(prev => [newParticipant, ...prev]);

          // Call parent update function if provided
          if (onParticipantUpdate) {
            onParticipantUpdate(currentEvent.id, true, newParticipant);
          }
        }
      } else {
        // If we don't have participant data in the response, refresh the list
        fetchParticipants(currentEvent.id);
      }

    } catch (error) {
      console.error("Hiba a csatlakozás során:", error);
      setJoinError(error.message || "Sikertelen csatlakozás. Kérjük, próbáld újra később.");

      // Even if there's an error, check if the user might have joined successfully
      if (currentEvent.id && currentUser) {
        setTimeout(() => {
          checkParticipation(currentEvent.id, currentUser);
          fetchParticipants(currentEvent.id);
        }, 1000); // Add a small delay to allow the server to process the join
      }
    } finally {
      setIsJoining(false);
    }
  };

  // Kilépés kezelése
  const handleLeaveEvent = async () => {
    if (!currentEvent.id) {
      setLeaveError("Esemény azonosító hiányzik");
      return;
    }

    setIsLeaving(true);
    setLeaveError('');

    try {
      // Get authentication token from cookie
      const token = getCookie('token');

      if (!token) {
        throw new Error("Bejelentkezés szükséges a kilépéshez");
      }

      console.log("Sending leave request for event:", currentEvent.id);
      const response = await fetch("http://localhost:8081/api/v1/leave", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          eseményId: currentEvent.id
        }),
      });

      // Try to parse the response JSON
      let responseData = {};
      try {
        responseData = await response.json();
      } catch (e) {
        console.error("Failed to parse response JSON:", e);
      }

      if (!response.ok) {
        throw new Error(responseData.message || "Sikertelen kilépés");
      }

      console.log("Leave successful:", responseData);

      // Update participation status
      setIsParticipant(false);

      // Remove the user from the participants list
      if (currentUser) {
        const updatedParticipants = participants.filter(p => p.id !== currentUser.userId);
        setParticipants(updatedParticipants);

        // Call parent update function if provided
        if (onParticipantUpdate) {
          onParticipantUpdate(currentEvent.id, false, { userId: currentUser.userId });
        }
      }

    } catch (error) {
      console.error("Hiba a kilépés során:", error);
      setLeaveError(error.message || "Sikertelen kilépés. Kérjük, próbáld újra később.");
    } finally {
      setIsLeaving(false);
    }
  };

  // Új függvény a résztvevő eltávolításához (szervező által)
  const handleRemoveParticipant = async (participantId) => {
    if (!currentEvent.id || !participantId) {
      setRemoveParticipantError("Hiányzó adatok");
      return;
    }

    setIsRemovingParticipant(true);
    setRemoveParticipantError('');

    try {
      // Get authentication token from cookie
      const token = getCookie('token');

      if (!token) {
        throw new Error("Bejelentkezés szükséges a művelethez");
      }

      console.log(`Removing participant ${participantId} from event ${currentEvent.id}`);
      const response = await fetch("http://localhost:8081/api/v1/remove-participant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          eseményId: currentEvent.id,
          userId: participantId
        }),
      });

      // Try to parse the response JSON
      let responseData = {};
      try {
        responseData = await response.json();
      } catch (e) {
        console.error("Failed to parse response JSON:", e);
      }

      if (!response.ok) {
        throw new Error(responseData.message || "Sikertelen eltávolítás");
      }

      console.log("Participant removal successful:", responseData);

      // Frissítjük a résztvevők listáját
      const updatedParticipants = participants.filter(p => p.id !== participantId);
      setParticipants(updatedParticipants);

      // Call parent update function if provided
      if (onParticipantUpdate) {
        onParticipantUpdate(currentEvent.id, false, { userId: participantId });
      }

    } catch (error) {
      console.error("Hiba a résztvevő eltávolítása során:", error);
      setRemoveParticipantError(error.message || "Sikertelen eltávolítás. Kérjük, próbáld újra később.");
    } finally {
      setIsRemovingParticipant(false);
    }
  };

  // Módosított esemény szerkesztés kezelése
  const handleEditEvent = () => {
    setIsEditModalOpen(true);
  };

  // Szerkesztő modal bezárása
  const closeEditModal = () => {
    setIsEditModalOpen(false);
  };

  // Add a function to handle participant click, including the current user
  const handleParticipantClick = (participant) => {
    // If the participant is the current user, show their profile too
    openProfileModal(participant);
  };

  // Esemény frissítése sikeres szerkesztés után
  const handleEventUpdate = (updatedEvent) => {
    console.log("Event updated, new data:", updatedEvent);

    // Frissítsük a komponens állapotát az új esemény adatokkal
    setCurrentEvent({
      ...updatedEvent,
      // Biztosítsuk, hogy a resztvevok_lista megmaradjon
      resztvevok_lista: participants
    });

    // Bezárjuk a szerkesztő modalt
    closeEditModal();

    // Értesítjük a szülő komponenst a frissítésről, ha van callback
    if (onParticipantUpdate) {
      onParticipantUpdate(updatedEvent.id, true, {
        userId: 'event-updated',
        eventData: {
          ...updatedEvent,
          resztvevok_lista: participants
        }
      });
    }
  };

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
                  src={currentEvent.imageUrl || "/placeholder.svg"}
                  alt={currentEvent.Sportok?.Nev || "Sport esemény"}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-0 left-0 bg-blue-600 text-white px-3 py-1 rounded-br-lg font-medium">
                  {currentEvent.Sportok?.Nev || "Sport"}
                </div>
              </div>

              <h2 className="text-2xl font-bold mb-4">{currentEvent.Helyszin?.Nev || "Helyszín"}</h2>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-white/80">
                  <MapPin className="h-5 w-5 flex-shrink-0 text-blue-400" />
                  <span>
                    {currentEvent.Helyszin?.Telepules || "Város"}, {currentEvent.Helyszin?.Cim || "Cím"}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-white/80">
                  <Calendar className="h-5 w-5 flex-shrink-0 text-blue-400" />
                  <span>{formatDate(currentEvent.kezdoIdo)}</span>
                </div>

                <div className="flex items-center gap-2 text-white/80">
                  <Clock className="h-5 w-5 flex-shrink-0 text-blue-400" />
                  <span>
                    {formatTime(currentEvent.kezdoIdo)} - {formatTime(currentEvent.zaroIdo)}
                  </span>
                </div>

                {/* Participant count display */}
                <div className="flex items-center gap-2 text-white/80">
                  <Users className="h-5 w-5 flex-shrink-0 text-blue-400" />
                  <span>
                    {participants.length}/{currentEvent.maximumLetszam || 10} résztvevő
                    {participants.length >= currentEvent.maximumLetszam && (
                      <span className="ml-2 text-yellow-400 text-sm">(Betelt)</span>
                    )}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="px-3 py-1 bg-white/10 rounded-full text-sm">{currentEvent.szint || "Ismeretlen szint"}</span>

                  {/* Fedett facility */}
                  <span className="px-3 py-1 bg-white/10 rounded-full text-sm flex items-center gap-1">
                    <Home className="h-4 w-4" /> Fedett
                    {currentEvent.Helyszin?.Fedett === true ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                  </span>

                  {/* Öltöző facility */}
                  <span className="px-3 py-1 bg-white/10 rounded-full text-sm flex items-center gap-1">
                    <DoorOpen className="h-4 w-4" /> Öltöző
                    {currentEvent.Helyszin?.Oltozo === true ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                  </span>

                  {/* Parkolás facility - módosítva, hogy a felhasználó által megadott értéket jelenítse meg */}
                  <span className="px-3 py-1 bg-white/10 rounded-full text-sm flex items-center gap-1">
                    <Car className="h-4 w-4" /> Parkolás: {currentEvent.Helyszin?.Parkolas || "Nincs adat"}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="w-full sm:w-auto flex gap-2">
                    {isParticipant ? (
                      <>
                        <button
                          className="w-full sm:w-auto px-6 py-2 bg-green-600 text-white rounded-md cursor-not-allowed"
                          disabled
                        >
                          Csatlakozva
                        </button>
                        {/* Szerkesztés gomb csak akkor jelenik meg, ha a felhasználó szerepe "szervező" */}
                        {currentUser && participants.find(p => p.id === currentUser.userId)?.role === 'szervező' && (
                          <button
                            onClick={handleEditEvent}
                            className="w-full sm:w-auto px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors flex items-center justify-center gap-2"
                          >
                            <Edit className="h-4 w-4" />
                            Szerkesztés
                          </button>
                        )}
                        {/* Kilépés gomb csak akkor jelenik meg, ha a felhasználó szerepe "játékos" */}
                        {currentUser && participants.find(p => p.id === currentUser.userId)?.role === 'játékos' && (
                          <button
                            onClick={handleLeaveEvent}
                            className={`w-full sm:w-auto px-6 py-2 ${isLeaving ? "bg-red-800 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
                              } text-white rounded-md transition-colors flex items-center justify-center`}
                            disabled={isLeaving}
                          >
                            {isLeaving ? "Kilépés..." : "Kilépés"}
                          </button>
                        )}
                      </>
                    ) : participants.length >= currentEvent.maximumLetszam ? (
                      <button
                        className="w-full sm:w-auto px-6 py-2 bg-gray-600 text-white rounded-md cursor-not-allowed"
                        disabled
                      >
                        Betelt
                      </button>
                    ) : (
                      <button
                        className={`w-full sm:w-auto px-6 py-2 ${isJoining ? "bg-blue-800 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                          } text-white rounded-md transition-colors flex items-center justify-center`}
                        onClick={handleJoinEvent}
                        disabled={isJoining}
                      >
                        {isJoining ? "Csatlakozás..." : "Csatlakozás"}
                      </button>
                    )}

                    {joinError && (
                      <p className="text-red-400 text-sm mt-2">{joinError}</p>
                    )}
                    {leaveError && (
                      <p className="text-red-400 text-sm mt-2">{leaveError}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Participants (Right Side) */}
            <div className="w-full md:w-2/5 p-6">
              <h3 className="text-xl font-bold mb-4">Résztvevők</h3>

              <div className="flex items-center gap-2 text-white/80 mb-4">
                <Users className="h-5 w-5 flex-shrink-0 text-blue-400" />
                <span>
                  {participants.length}/{currentEvent.maximumLetszam || 10} résztvevő
                  {participants.length >= currentEvent.maximumLetszam && (
                    <span className="ml-2 text-yellow-400 text-sm">(Betelt)</span>
                  )}
                </span>
              </div>

              {/* Szervező szekció */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold mb-3 border-b border-white/20 pb-2">Szervező</h4>
                <div className="space-y-4">
                  {participants.filter(p => p.role === 'szervező').length === 0 ? (
                    <p className="text-white/60">Nincs megjelenítendő szervező.</p>
                  ) : (
                    participants
                      .filter(p => p.role === 'szervező')
                      .map((participant) => (
                        <div
                          key={participant.id}
                          className="flex items-center gap-4 p-3 rounded-lg bg-blue-900/30 hover:bg-blue-900/50 transition-colors"
                        >
                          <div
                            className="flex-grow flex items-center gap-4 cursor-pointer"
                            onClick={() => handleParticipantClick(participant)}
                          >
                            <Image
                              src={participant.image || "/placeholder.svg"}
                              alt={participant.name}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                            <div>
                              <h4 className="font-medium">
                                {participant.name}
                                {currentUser && participant.id === currentUser.userId && (
                                  <span className="ml-2 text-blue-400 text-sm">(Te)</span>
                                )}
                              </h4>
                              <p className="text-sm text-white/60">
                                <span className="text-blue-300">Szervező</span>
                                {participant.age ? ` • ${participant.age} éves` : ""}
                                {participant.level ? ` • ${participant.level}` : ""}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>

              {/* Játékosok szekció - módosítva a kuka ikonnal */}
              <div>
                <h4 className="text-lg font-semibold mb-3 border-b border-white/20 pb-2">Játékosok</h4>
                <div className="space-y-4">
                  {participants.filter(p => p.role !== 'szervező').length === 0 ? (
                    <p className="text-white/60">Még nincsenek játékosok.</p>
                  ) : (
                    participants
                      .filter(p => p.role !== 'szervező')
                      .map((participant) => (
                        <div
                          key={participant.id}
                          className="flex items-center gap-4 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                        >
                          <div
                            className="flex-grow flex items-center gap-4 cursor-pointer"
                            onClick={() => handleParticipantClick(participant)}
                          >
                            <Image
                              src={participant.image || "/placeholder.svg"}
                              alt={participant.name}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                            <div>
                              <h4 className="font-medium">
                                {participant.name}
                                {currentUser && participant.id === currentUser.userId && (
                                  <span className="ml-2 text-blue-400 text-sm">(Te)</span>
                                )}
                              </h4>
                              <p className="text-sm text-white/60">
                                {participant.age ? `${participant.age} éves • ` : ""}
                                {participant.level || ""}                              </p>
                            </div>
                          </div>

                          {/* Kuka ikon - csak a szervező látja és csak más játékosoknál */}
                          {currentUser &&
                            participants.some(p => p.id === currentUser.userId && p.role === 'szervező') &&
                            participant.id !== currentUser.userId && (
                              <button
                                onClick={() => handleRemoveParticipant(participant.id)}
                                className={`p-2 rounded-full ${isRemovingParticipant ? "bg-red-800/50 cursor-not-allowed" : "bg-red-600/20 hover:bg-red-600/40"
                                  } text-red-400 transition-colors`}
                                disabled={isRemovingParticipant}
                                title="Résztvevő eltávolítása"
                              >
                                <Trash className="h-4 w-4" />                              </button>
                            )}
                        </div>
                      ))
                  )}

                  {removeParticipantError && (
                    <p className="text-red-400 text-sm mt-2">{removeParticipantError}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Modal */}
      {showProfileModal && selectedParticipant && (
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
              {selectedParticipant.role === 'szervező' && (
                <span className="text-blue-300 mr-1">Szervező</span>
              )}
              {selectedParticipant.age ? `${selectedParticipant.age} éves • ` : ""}
              {selectedParticipant.level || ""}
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
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <EventEditModal
          isOpen={isEditModalOpen}
          onClose={closeEditModal}
          event={currentEvent}
          onSuccess={handleEventUpdate}
        />
      )}
    </>
  );
};

// Új komponens az esemény szerkesztéséhez
const EventEditModal = ({ isOpen, onClose, event, onSuccess }) => {
  // Biztonságos esemény objektum létrehozása, hogy elkerüljük az undefined hibákat
  const safeEvent = event || {};

  const [formData, setFormData] = useState({
    helyszinId: safeEvent.helyszinId || safeEvent.Helyszin?.Id || "",
    sportId: safeEvent.sportId || safeEvent.Sportok?.Id || "",
    kezdoIdo: safeEvent.kezdoIdo ? new Date(safeEvent.kezdoIdo).toISOString().slice(0, 16) : "",
    zaroIdo: safeEvent.zaroIdo ? new Date(safeEvent.zaroIdo).toISOString().slice(0, 16) : "",
    szint: safeEvent.szint || "",
    minimumEletkor: safeEvent.minimumEletkor || "",
    maximumEletkor: safeEvent.maximumEletkor || "",
    maximumLetszam: safeEvent.maximumLetszam || "",
    leiras: safeEvent.leiras || "",
    // Helyszín adatok
    helyszinNev: safeEvent.Helyszin?.Nev || "",
    helyszinCim: safeEvent.Helyszin?.Cim || "",
    helyszinTelepules: safeEvent.Helyszin?.Telepules || "",
    helyszinIranyitoszam: safeEvent.Helyszin?.Iranyitoszam || "",
    helyszinFedett: Boolean(safeEvent.Helyszin?.Fedett) || false,
    helyszinOltozo: Boolean(safeEvent.Helyszin?.Oltozo) || false,
    helyszinParkolas: safeEvent.Helyszin?.Parkolas || "nincs",
    helyszinBerles: Boolean(safeEvent.Helyszin?.Berles) || false,
    helyszinLeiras: safeEvent.Helyszin?.Leiras || ""
  });


  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(safeEvent.imageUrl || "");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [locations, setLocations] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [sports, setSports] = useState([]);
  const [loadingSports, setLoadingSports] = useState(false);
  const [editingLocation, setEditingLocation] = useState(false);

  // Parkolás opciók
  const parkolasOptions = [
    { value: "ingyenes", label: "Ingyenes" },
    { value: "fizetős", label: "Fizetős" },
    { value: "nincs", label: "Nincs" }
  ];

  // Fetch locations and sports when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchLocations();
      fetchSports();
    }
  }, [isOpen]);

  const fetchLocations = async () => {
    setLoadingLocations(true);
    setErrorMessage("");

    try {
      const token = getCookie('token');

      if (!token) {
        setErrorMessage("Authentication token is missing. Please login again.");
        setLoadingLocations(false);
        return;
      }

      const response = await fetch("http://localhost:8081/api/v1/getOwnHelyszin", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to fetch locations");
      }

      const data = await response.json();
      setLocations(data.locations || []);
    } catch (error) {
      setErrorMessage(error.message || "An error occurred while fetching locations");
    } finally {
      setLoadingLocations(false);
    }
  };

  const fetchSports = async () => {
    setLoadingSports(true);
    setErrorMessage("");

    try {
      const token = getCookie('token');

      if (!token) {
        setErrorMessage("Authentication token is missing. Please login again.");
        setLoadingSports(false);
        return;
      }

      const response = await fetch("http://localhost:8081/api/v1/allSportok", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to fetch sports");
      }

      const data = await response.json();
      setSports(data.sportok || []);
    } catch (error) {
      setErrorMessage(error.message || "An error occurred while fetching sports");
    } finally {
      setLoadingSports(false);
    }
  };

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;

    // Checkbox esetén a checked értéket használjuk, egyébként a value-t
    const newValue = type === 'checkbox' ? checked : value;

    console.log(`Field ${id} changed to:`, type === 'checkbox' ? checked : value);

    setFormData((prevState) => ({
      ...prevState,
      [id]: newValue,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      // Create URL for preview
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  // Helyszín szerkesztés mód bekapcsolása
  const startLocationEditing = () => {
    setEditingLocation(true);
  };

  // Helyszín szerkesztés mód kikapcsolása
  const cancelLocationEditing = () => {
    setEditingLocation(false);
  };

  // Helyszín mentése (meglévő helyszín frissítése)
  const saveLocation = async () => {
    try {
      const token = getCookie('token');

      if (!token) {
        setErrorMessage("Authentication token is missing. Please login again.");
        return null;
      }

      // Ellenőrizzük az irányítószám formátumát és konvertáljuk számmá
      const iranyitoszam = parseInt(formData.helyszinIranyitoszam);
      if (isNaN(iranyitoszam) || iranyitoszam < 1000 || iranyitoszam > 9999) {
        setErrorMessage("Az irányítószám 1000 és 9999 közötti szám kell legyen.");
        return null;
      }

      // Helyszín adatok összeállítása - explicit konverzióval a boolean értékekre
      const locationData = {
        Nev: formData.helyszinNev,
        Cim: formData.helyszinCim,
        Telepules: formData.helyszinTelepules,
        Iranyitoszam: iranyitoszam,
        Fedett: formData.helyszinFedett === true, // Explicit boolean conversion
        Oltozo: formData.helyszinOltozo === true, // Explicit boolean conversion
        Parkolas: formData.helyszinParkolas || "nincs",
        Berles: formData.helyszinBerles === true, // Explicit boolean conversion
        Leiras: formData.helyszinLeiras || ""
      };

      console.log("Sending location update with data:", locationData);

      // Ellenőrizzük, hogy a Parkolas érték megfelelő-e
      if (!["ingyenes", "fizetős", "nincs"].includes(locationData.Parkolas)) {
        locationData.Parkolas = "nincs";
      }

      console.log("Updating location with data:", locationData);

      const response = await fetch(`http://localhost:8081/api/v1/updateHelyszin/${formData.helyszinId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(locationData),
      });

      if (!response.ok) {
        const responseData = await response.json();
        throw new Error(responseData.message || "Failed to save location");
      }

      const responseData = await response.json();
      console.log("Location updated successfully:", responseData);

      // Frissítsük a helyszínek listáját
      await fetchLocations();

      // Frissítsük a formData-t a válaszban kapott adatokkal, ha van
      if (responseData.updatedLocation) {
        setFormData(prev => ({
          ...prev,
          helyszinNev: responseData.updatedLocation.Nev,
          helyszinCim: responseData.updatedLocation.Cim,
          helyszinTelepules: responseData.updatedLocation.Telepules,
          helyszinIranyitoszam: responseData.updatedLocation.Iranyitoszam,
          helyszinFedett: responseData.updatedLocation.Fedett,
          helyszinOltozo: responseData.updatedLocation.Oltozo,
          helyszinParkolas: responseData.updatedLocation.Parkolas,
          helyszinBerles: responseData.updatedLocation.Berles,
          helyszinLeiras: responseData.updatedLocation.Leiras || ""
        }));
      }

      // Kikapcsoljuk a szerkesztés módot
      setEditingLocation(false);

      return formData.helyszinId;
    } catch (error) {
      console.error("Error saving location:", error);
      setErrorMessage(error.message || "An error occurred while saving the location");
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage("");
    setSuccess(false);

    try {
      const token = getCookie('token');

      if (!token) {
        setErrorMessage("Authentication token is missing. Please login again.");
        setSubmitting(false);
        return;
      }

      // Ha helyszín szerkesztés módban vagyunk, először mentsük el a helyszínt
      let finalHelyszinId = formData.helyszinId;
      if (editingLocation) {
        const savedLocationId = await saveLocation();
        if (!savedLocationId) {
          throw new Error("Failed to save location");
        }
        finalHelyszinId = savedLocationId;
      }      // Create a FormData object to send the form data and image file
      const formDataToSend = new FormData();

      // Add event fields to the FormData
      formDataToSend.append("helyszinId", finalHelyszinId);
      formDataToSend.append("sportId", formData.sportId);
      formDataToSend.append("kezdoIdo", formData.kezdoIdo);
      formDataToSend.append("zaroIdo", formData.zaroIdo);
      formDataToSend.append("szint", formData.szint);
      formDataToSend.append("minimumEletkor", formData.minimumEletkor);
      formDataToSend.append("maximumEletkor", formData.maximumEletkor);
      formDataToSend.append("maximumLetszam", formData.maximumLetszam);
      formDataToSend.append("leiras", formData.leiras);

      // Add the image file if it exists
      if (imageFile) {
        formDataToSend.append("imageFile", imageFile);
      }

      // Add the event ID for update
      formDataToSend.append("id", safeEvent.id);

      console.log("Sending event update with data:", Object.fromEntries(formDataToSend));

      const response = await fetch(`http://localhost:8081/api/v1/updateEsemeny/${safeEvent.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          // Don't set Content-Type header when using FormData
        },
        body: formDataToSend,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update event");
      }

      console.log("Event updated successfully:", data);
      setSuccess(true);

      // Call onSuccess callback with updated event data
      if (onSuccess) {
        // Merge the updated data with the original event data
        const updatedEvent = {
          ...safeEvent,
          id: safeEvent.id,
          helyszinId: finalHelyszinId,
          sportId: formData.sportId,
          kezdoIdo: formData.kezdoIdo,
          zaroIdo: formData.zaroIdo,
          szint: formData.szint,
          minimumEletkor: formData.minimumEletkor,
          maximumEletkor: formData.maximumEletkor,
          maximumLetszam: formData.maximumLetszam,
          leiras: formData.leiras,
          // Update nested objects if needed
          Helyszin: {
            Id: finalHelyszinId,
            Nev: formData.helyszinNev,
            Cim: formData.helyszinCim,
            Telepules: formData.helyszinTelepules,
            Iranyitoszam: parseInt(formData.helyszinIranyitoszam),
            Fedett: Boolean(formData.helyszinFedett),
            Oltozo: Boolean(formData.helyszinOltozo),
            Parkolas: formData.helyszinParkolas,
            Berles: Boolean(formData.helyszinBerles),
            Leiras: formData.helyszinLeiras || ""
          },
          imageUrl: data.esemeny?.imageUrl || safeEvent.imageUrl // Use new image URL if provided
        };

        // If the sport changed, we should update that object too
        if (formData.sportId !== safeEvent.sportId) {
          const newSport = sports.find(sport => sport.Id.toString() === formData.sportId.toString());
          if (newSport) {
            updatedEvent.Sportok = newSport;
          }
        }

        console.log("Updating event with:", updatedEvent);
        onSuccess(updatedEvent);
      }

      // Close modal after 2 seconds on success
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      setErrorMessage(error.message || "An error occurred while updating the event");
    } finally {
      setSubmitting(false);
    }
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-[70] transition-all duration-300">
      <div
        className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl max-w-[800px] w-full max-h-[90vh] overflow-y-auto shadow-[0_0_50px_rgba(0,0,0,0.3)] border border-slate-700/50"
        style={{
          animation: "modal-appear 0.3s ease-out forwards",
          transform: "scale(0.95)",
          opacity: 0,
        }}
      >
        <style jsx>{`
                @keyframes modal-appear {
                  0% {
                    transform: scale(0.95);
                    opacity: 0;
                  }
                  100% {
                    transform: scale(1);
                    opacity: 1;
                  }
                }
                @keyframes pulse-glow {
                  0% {
                    box-shadow: 0 0 5px 0px rgba(147, 51, 234, 0.5);
                  }
                  50% {
                    box-shadow: 0 0 15px 5px rgba(147, 51, 234, 0.5);
                  }
                  100% {
                    box-shadow: 0 0 5px 0px rgba(147, 51, 234, 0.5);
                  }
                }
              `}</style>

        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
                Esemény szerkesztése
              </h2>
              <p className="text-gray-400 mt-1">Módosítsd az esemény adatait</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white bg-slate-700/50 hover:bg-slate-600/50 rounded-full p-2 transition-all duration-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Success message */}
          {success && (
            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 text-green-300 p-4 rounded-xl mb-6 flex items-center">
              <div className="mr-3 flex-shrink-0 bg-green-500/20 rounded-full p-2">
                <svg
                  className="w-5 h-5 text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <p>Az esemény sikeresen frissítve!</p>
            </div>
          )}

          {/* Error message */}
          {errorMessage && (
            <div className="bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/30 text-red-300 p-4 rounded-xl mb-6 flex items-center">
              <div className="mr-3 flex-shrink-0 bg-red-500/20 rounded-full p-2">
                <svg
                  className="w-5 h-5 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
              </div>
              <p>{errorMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Tabs for Event and Location editing */}
            <div className="mb-6">
              <div className="flex border-b border-slate-700">
                <button
                  type="button"
                  onClick={() => setEditingLocation(false)}
                  className={`py-2 px-4 font-medium text-sm ${!editingLocation
                    ? "text-purple-400 border-b-2 border-purple-400"
                    : "text-gray-400 hover:text-gray-300"
                    }`}
                >
                  Esemény adatok
                </button>
                <button
                  type="button"
                  onClick={startLocationEditing}
                  className={`py-2 px-4 font-medium text-sm ${editingLocation
                    ? "text-purple-400 border-b-2 border-purple-400"
                    : "text-gray-400 hover:text-gray-300"
                    }`}
                >
                  Helyszín adatok
                </button>
              </div>
            </div>

            {!editingLocation ? (
              // Esemény adatok szerkesztése
              <div className="grid gap-6 mb-6 md:grid-cols-2">
                {/* Sport selector */}
                <div>
                  <label htmlFor="sportId" className="block mb-2 text-sm font-medium text-gray-300">
                    Sport
                  </label>
                  <select
                    id="sportId"
                    className="bg-slate-800/80 border border-slate-600/50 text-gray-100 text-sm rounded-xl focus:ring-purple-500 focus:border-purple-500 block w-full p-3 transition-all duration-300 hover:border-purple-500/50"
                    value={formData.sportId}
                    onChange={handleChange}
                    required
                    disabled={loadingSports}
                  >
                    <option value="">Válassz sportot</option>
                    {sports.map((sport) => (
                      <option key={sport.Id} value={sport.Id}>
                        {sport.Nev}
                      </option>
                    ))}
                  </select>
                  {loadingSports && (
                    <p className="text-purple-400 text-xs mt-2 flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-3 w-3 text-purple-400"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Sportok betöltése...
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="kezdoIdo" className="block mb-2 text-sm font-medium text-gray-300">
                    Kezdő időpont
                  </label>
                  <input
                    type="datetime-local"
                    id="kezdoIdo"
                    className="bg-slate-800/80 border border-slate-600/50 text-gray-100 text-sm rounded-xl focus:ring-purple-500 focus:border-purple-500 block w-full p-3 transition-all duration-300 hover:border-purple-500/50"
                    value={formData.kezdoIdo}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="zaroIdo" className="block mb-2 text-sm font-medium text-gray-300">
                    Záró időpont
                  </label>
                  <input
                    type="datetime-local"
                    id="zaroIdo"
                    className="bg-slate-800/80 border border-slate-600/50 text-gray-100 text-sm rounded-xl focus:ring-purple-500 focus:border-purple-500 block w-full p-3 transition-all duration-300 hover:border-purple-500/50"
                    value={formData.zaroIdo}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="maximumLetszam" className="block mb-2 text-sm font-medium text-gray-300">
                    Létszám
                  </label>
                  <input
                    type="number"
                    id="maximumLetszam"
                    className="bg-slate-800/80 border border-slate-600/50 text-gray-100 text-sm rounded-xl focus:ring-purple-500 focus:border-purple-500 block w-full p-3 transition-all duration-300 hover:border-purple-500/50"
                    placeholder="Pl. 5"
                    min="1"
                    max="100"
                    value={formData.maximumLetszam}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="szint" className="block mb-2 text-sm font-medium text-gray-300">
                    Szint
                  </label>
                  <select
                    id="szint"
                    className="bg-slate-800/80 border border-slate-600/50 text-gray-100 text-sm rounded-xl focus:ring-purple-500 focus:border-purple-500 block w-full p-3 transition-all duration-300 hover:border-purple-500/50"
                    value={formData.szint}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Válassz szintet</option>
                    <option value="kezdő">Kezdő</option>
                    <option value="haladó">Haladó</option>
                    <option value="profi">Profi</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="minimumEletkor" className="block mb-2 text-sm font-medium text-gray-300">
                    Minimum életkor
                  </label>
                  <input
                    type="number"
                    id="minimumEletkor"
                    className="bg-slate-800/80 border border-slate-600/50 text-gray-100 text-sm rounded-xl focus:ring-purple-500 focus:border-purple-500 block w-full p-3 transition-all duration-300 hover:border-purple-500/50"
                    placeholder="Pl. 16"
                    min="1"
                    max="100"
                    value={formData.minimumEletkor}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="maximumEletkor" className="block mb-2 text-sm font-medium text-gray-300">
                    Maximum életkor
                  </label>
                  <input
                    type="number"
                    id="maximumEletkor"
                    className="bg-slate-800/80 border border-slate-600/50 text-gray-100 text-sm rounded-xl focus:ring-purple-500 focus:border-purple-500 block w-full p-3 transition-all duration-300 hover:border-purple-500/50"
                    placeholder="Pl. 99"
                    min="1"
                    max="100"
                    value={formData.maximumEletkor}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Image Upload */}
                <div className="md:col-span-2">
                  <label htmlFor="imageFile" className="block mb-2 text-sm font-medium text-gray-300">
                    Kép feltöltése (opcionális)
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      id="imageFile"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                    <label
                      htmlFor="imageFile"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-600/50 hover:border-purple-500/50 rounded-xl cursor-pointer bg-slate-800/50 hover:bg-slate-700/50 transition-all duration-300"
                    >
                      {imagePreview ? (
                        <div className="w-full h-full flex items-center justify-center">
                          <img
                            src={imagePreview || "/placeholder.svg"}
                            alt="Preview"
                            className="h-full object-contain rounded-lg"
                          />
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <svg
                            className="w-8 h-8 mb-3 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            ></path>
                          </svg>
                          <p className="mb-2 text-sm text-gray-400">
                            <span className="font-semibold">Kattints a feltöltéshez</span> vagy húzd ide a fájlt
                          </p>
                          <p className="text-xs text-gray-500">
                            SVG, PNG, JPG vagy GIF (MAX. 2MB)
                          </p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              </div>
            ) : (
              // Helyszín adatok szerkesztése
              <div className="grid gap-6 mb-6 md:grid-cols-2">
                <div>
                  <label htmlFor="helyszinNev" className="block mb-2 text-sm font-medium text-gray-300">
                    Helyszín neve
                  </label>
                  <input
                    type="text"
                    id="helyszinNev"
                    className="bg-slate-800/80 border border-slate-600/50 text-gray-100 text-sm rounded-xl focus:ring-purple-500 focus:border-purple-500 block w-full p-3 transition-all duration-300 hover:border-purple-500/50"
                    placeholder="Pl. Városi Sportpálya"
                    value={formData.helyszinNev}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="helyszinTelepules" className="block mb-2 text-sm font-medium text-gray-300">
                    Település
                  </label>
                  <input
                    type="text"
                    id="helyszinTelepules"
                    className="bg-slate-800/80 border border-slate-600/50 text-gray-100 text-sm rounded-xl focus:ring-purple-500 focus:border-purple-500 block w-full p-3 transition-all duration-300 hover:border-purple-500/50"
                    placeholder="Pl. Budapest"
                    value={formData.helyszinTelepules}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="helyszinCim" className="block mb-2 text-sm font-medium text-gray-300">
                    Cím
                  </label>
                  <input
                    type="text"
                    id="helyszinCim"
                    className="bg-slate-800/80 border border-slate-600/50 text-gray-100 text-sm rounded-xl focus:ring-purple-500 focus:border-purple-500 block w-full p-3 transition-all duration-300 hover:border-purple-500/50"
                    placeholder="Pl. Példa utca 123."
                    value={formData.helyszinCim}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="helyszinIranyitoszam" className="block mb-2 text-sm font-medium text-gray-300">
                    Irányítószám
                  </label>
                  <input
                    type="text"
                    id="helyszinIranyitoszam"
                    className="bg-slate-800/80 border border-slate-600/50 text-gray-100 text-sm rounded-xl focus:ring-purple-500 focus:border-purple-500 block w-full p-3 transition-all duration-300 hover:border-purple-500/50"
                    placeholder="Pl. 1234"
                    value={formData.helyszinIranyitoszam}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="helyszinParkolas" className="block mb-2 text-sm font-medium text-gray-300">
                    Parkolás
                  </label>
                  <select
                    id="helyszinParkolas"
                    className="bg-slate-800/80 border border-slate-600/50 text-gray-100 text-sm rounded-xl focus:ring-purple-500 focus:border-purple-500 block w-full p-3 transition-all duration-300 hover:border-purple-500/50"
                    value={formData.helyszinParkolas}
                    onChange={handleChange}
                    required
                  >
                    {parkolasOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="helyszinFedett"
                      className="w-4 h-4 text-purple-600 bg-slate-800 border-slate-600 rounded focus:ring-purple-500"
                      checked={formData.helyszinFedett}
                      onChange={handleChange}
                    />
                    <label htmlFor="helyszinFedett" className="ml-2 text-sm font-medium text-gray-300">
                      Fedett
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="helyszinOltozo"
                      className="w-4 h-4 text-purple-600 bg-slate-800 border-slate-600 rounded focus:ring-purple-500"
                      checked={formData.helyszinOltozo}
                      onChange={handleChange}
                    />
                    <label htmlFor="helyszinOltozo" className="ml-2 text-sm font-medium text-gray-300">
                      Öltöző
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="helyszinBerles"
                      className="w-4 h-4 text-purple-600 bg-slate-800 border-slate-600 rounded focus:ring-purple-500"
                      checked={formData.helyszinBerles}
                      onChange={handleChange}
                    />
                    <label htmlFor="helyszinBerles" className="ml-2 text-sm font-medium text-gray-300">
                      Bérlés
                    </label>
                  </div>
                </div>

                {/* Helyszín leírás mező */}
                <div className="md:col-span-2">
                  <label htmlFor="helyszinLeiras" className="block mb-2 text-sm font-medium text-gray-300">
                    Helyszín leírása
                  </label>
                  <textarea
                    id="helyszinLeiras"
                    rows="4"
                    className="bg-slate-800/80 border border-slate-600/50 text-gray-100 text-sm rounded-xl focus:ring-purple-500 focus:border-purple-500 block w-full p-3 transition-all duration-300 hover:border-purple-500/50"
                    placeholder="Részletes leírás a helyszínről..."
                    value={formData.helyszinLeiras}
                    onChange={handleChange}
                  ></textarea>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 mt-6">
              {editingLocation ? (
                <>
                  <button
                    type="button"
                    onClick={cancelLocationEditing}
                    className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors"
                  >
                    Vissza
                  </button>
                  <button
                    type="button"
                    onClick={saveLocation}
                    className="text-white font-medium rounded-xl text-sm px-6 py-3.5 text-center transition duration-300 shadow-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-purple-700/20 hover:shadow-purple-700/40"
                  >
                    Helyszín mentése
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors"
                  >
                    Mégsem
                  </button>
                  <button
                    type="submit"
                    className={`text-white font-medium rounded-xl text-sm px-6 py-3.5 text-center transition duration-300 shadow-lg ${submitting
                      ? "bg-purple-700/50 cursor-not-allowed"
                      : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-purple-700/20 hover:shadow-purple-700/40"
                      }`}
                    disabled={submitting}
                    style={{
                      animation: submitting ? "none" : "pulse-glow 2s infinite",
                    }}
                  >
                    {submitting ? (
                      <div className="flex items-center justify-center">
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Mentés...
                      </div>
                    ) : (
                      "Mentés"
                    )}
                  </button>
                </>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EventModal;



