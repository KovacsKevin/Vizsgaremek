"use client"

import { useState, useEffect } from "react"
import { X, MapPin, Calendar, Clock, Users, Home, DoorOpen, Car, User } from "lucide-react"

// Placeholder Image component
const Image = ({ src, alt, className }) => (
  <img src={src || "/api/placeholder/300/200"} alt={alt || ''} className={className || ''} />
)

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

    if (event.id) {
      console.log("Modal opened for event:", event.id);
      fetchParticipants(event.id);
      if (user) {
        checkParticipation(event.id, user);
      }
    }
  }, [event.id]);

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

  // Handle join event functionality
  const handleJoinEvent = async () => {
    if (!event.id) {
      setJoinError("Esemény azonosító hiányzik");
      return;
    }

    // Check if event is at capacity before making the API call
    if (participants.length >= event.maximumLetszam) {
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

      console.log("Sending join request for event:", event.id);
      const response = await fetch("http://localhost:8081/api/v1/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          eseményId: event.id
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
          fetchParticipants(event.id);
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
            onParticipantUpdate(event.id, true, newParticipant);
          }
        }
      } else {
        // If we don't have participant data in the response, refresh the list
        fetchParticipants(event.id);
      }

    } catch (error) {
      console.error("Hiba a csatlakozás során:", error);
      setJoinError(error.message || "Sikertelen csatlakozás. Kérjük, próbáld újra később.");

      // Even if there's an error, check if the user might have joined successfully
      if (event.id && currentUser) {
        setTimeout(() => {
          checkParticipation(event.id, currentUser);
          fetchParticipants(event.id);
        }, 1000); // Add a small delay to allow the server to process the join
      }
    } finally {
      setIsJoining(false);
    }
  };

  // Kilépés kezelése
  const handleLeaveEvent = async () => {
    if (!event.id) {
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

      console.log("Sending leave request for event:", event.id);
      const response = await fetch("http://localhost:8081/api/v1/leave", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          eseményId: event.id
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
          onParticipantUpdate(event.id, false, { userId: currentUser.userId });
        }
      }

    } catch (error) {
      console.error("Hiba a kilépés során:", error);
      setLeaveError(error.message || "Sikertelen kilépés. Kérjük, próbáld újra később.");
    } finally {
      setIsLeaving(false);
    }
  };

  // Add a function to handle participant click, including the current user
  const handleParticipantClick = (participant) => {
    // If the participant is the current user, show their profile too
    openProfileModal(participant);
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

                {/* Participant count display */}
                <div className="flex items-center gap-2 text-white/80">
                  <Users className="h-5 w-5 flex-shrink-0 text-blue-400" />
                  <span>
                    {participants.length}/{event.maximumLetszam || 10} résztvevő
                    {participants.length >= event.maximumLetszam && (
                      <span className="ml-2 text-yellow-400 text-sm">(Betelt)</span>
                    )}
                  </span>
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

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="text-white/80">
                    Ár: <span className="font-semibold">{event.ar ? `${event.ar} Ft` : "Ingyenes"}</span>
                  </div>
                  <div className="w-full sm:w-auto flex gap-2">
                    {isParticipant ? (
                      <>
                        <button
                          className="w-full sm:w-auto px-6 py-2 bg-green-600 text-white rounded-md cursor-not-allowed"
                          disabled
                        >
                          Csatlakozva
                        </button>
                        {/* Kilépés gomb csak akkor jelenik meg, ha a felhasználó szerepe "játékos" */}
                        {currentUser && participants.find(p => p.id === currentUser.userId)?.role === 'játékos' && (
                          <button
                            onClick={handleLeaveEvent}
                            className={`w-full sm:w-auto px-6 py-2 ${
                              isLeaving ? "bg-red-800 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
                            } text-white rounded-md transition-colors flex items-center justify-center`}
                            disabled={isLeaving}
                          >
                            {isLeaving ? "Kilépés..." : "Kilépés"}
                          </button>
                        )}
                      </>
                    ) : participants.length >= event.maximumLetszam ? (
                      <button
                        className="w-full sm:w-auto px-6 py-2 bg-gray-600 text-white rounded-md cursor-not-allowed"
                        disabled
                      >
                        Betelt
                      </button>
                    ) : (
                      <button
                        className={`w-full sm:w-auto px-6 py-2 ${
                          isJoining ? "bg-blue-800 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
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
                  {participants.length}/{event.maximumLetszam || 10} résztvevő
                  {participants.length >= event.maximumLetszam && (
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
                          onClick={() => handleParticipantClick(participant)}
                          className="flex items-center gap-4 p-3 rounded-lg bg-blue-900/30 hover:bg-blue-900/50 transition-colors cursor-pointer"
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
                      ))
                  )}
                </div>
              </div>

              {/* Játékosok szekció */}
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
                          onClick={() => handleParticipantClick(participant)}
                          className="flex items-center gap-4 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
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
                              {participant.level || ""}
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
        </div>
      )}
    </>
  );
}

export default EventModal;

