"use client"

import { useState, useEffect } from "react"
import {
  X, MapPin, Calendar, Clock, Users, Home, DoorOpen, Car, User, CheckCircle, XCircle, Trash, Edit, Plus, Archive,
  Mail, Phone, AlertTriangle, Map
} from "lucide-react"
import { HelyszinModal } from "./Main/helyszin-modal"

const UserProfileModal = ({ userId, onClose }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = getCookie('token');
        if (!token) {
          setError("Nincs bejelentkezve");
          setLoading(false);
          return;
        }

        const response = await fetch(`http://localhost:8081/api/v1/getUser/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) {
          throw new Error("Nem sikerült lekérni a felhasználói adatokat");
        }

        const userData = await response.json();
        setUser(userData);
        setLoading(false);
      } catch (err) {
        console.error("Hiba a felhasználói adatok betöltésekor:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  const getUserInitials = () => {
    if (!user || !user.username) return "";
    return user.username
      .split(" ")
      .map((name) => name.charAt(0))
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60]">
        <div className="bg-gradient-to-br from-slate-800 to-zinc-900 rounded-lg max-w-md w-full p-6">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60]">
        <div className="bg-gradient-to-br from-slate-800 to-zinc-900 rounded-lg max-w-md w-full p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">Hiba</h2>
            <button onClick={onClose} className="text-white/70 hover:text-white">
              <X size={24} />
            </button>
          </div>
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60]">
      <div className="relative w-full max-w-md bg-gradient-to-br from-slate-800 to-zinc-900 rounded-lg shadow-xl p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex flex-col items-center text-center">
          <Image
            alt={user.username}
            className="w-24 h-24 rounded-full object-cover mb-4"
          />
          <h3 className="text-xl font-bold">{user.username}</h3>
          <p className="text-white/60 mb-4">
            {user.firstName && user.lastName && (
              <span className="text-white/80">{user.lastName} {user.firstName}</span>
            )}
          </p>

          {user.bio && (
  <div className="bg-white/5 p-4 rounded-lg">
    <h4 className="font-medium mb-2 flex items-center gap-2">
      <User className="h-4 w-4" /> Bemutatkozás
    </h4>
    <p className="text-sm text-white/80 whitespace-pre-wrap break-words overflow-y-auto max-h-40 custom-scrollbar pr-2">
      {user.bio}
    </p>
  </div>
)}

            <div className="bg-white/5 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Elérhetőség</h4>
              {user.email && (
                <div className="flex items-center gap-2 text-white/80 text-sm mb-2">
                  <Mail className="h-4 w-4 text-blue-400" />
                  <span>{user.email}</span>
                </div>
              )}
              {user.phone && (
                <div className="flex items-center gap-2 text-white/80 text-sm">
                  <Phone className="h-4 w-4 text-green-400" />
                  <span>{user.phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    
  );
};

const Image = ({ src, alt, className }) => {
  const [error, setError] = useState(false);

  const formatImageUrl = (url) => {
    if (!url || error) return "https://media.istockphoto.com/id/526947869/vector/man-silhouette-profile-picture.jpg?s=612x612&w=0&k=20&c=5I7Vgx_U6UPJe9U2sA2_8JFF4grkP7bNmDnsLXTYlSc=";

    if (url.startsWith('http://localhost:8081')) return url;

    if (url.startsWith('data:image/')) return url;

    return `http://localhost:8081${url.startsWith('/') ? url : `/${url}`}`;
  };

  return (
    <img
      src={formatImageUrl(src)}
      alt={alt || ''}
      className={className || ''}
      onError={(e) => {
        console.error(`Kép betöltési hiba: ${src && src.substring(0, 100)}...`);
        setError(true);
      }}
    />
  );
};

const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

const getCurrentUser = () => {
  try {
    const token = getCookie('token');
    if (!token) return null;

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

const LocationMapModal = ({ location, onClose }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const getMapUrl = () => {
    const encodedLocation = encodeURIComponent(location);
    return `https://maps.google.com/maps?q=${encodedLocation}&t=&z=13&ie=UTF8&iwloc=&output=embed`;
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setLoadError(true);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };
  
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70">
      <div
        className={`relative bg-gradient-to-br from-slate-800 to-zinc-900 rounded-lg shadow-xl p-6 transition-all duration-300 ${isFullscreen
          ? "w-[95vw] h-[95vh] m-0"
          : "w-full max-w-4xl h-[80vh]"
          }`}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
          title="Bezárás"
        >
          <X className="h-5 w-5" />
        </button>

        <button
          onClick={toggleFullscreen}
          className="absolute top-4 right-16 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
          title={isFullscreen ? "Kicsinyítés" : "Teljes képernyő"}
        >
          {isFullscreen ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 3v3a2 2 0 0 1-2 2H3"></path>
              <path d="M21 8h-3a2 2 0 0 1-2-2V3"></path>
              <path d="M3 16h3a2 2 0 0 1 2 2v3"></path>
              <path d="M16 21v-3a2 2 0 0 1 2-2h3"></path>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 3 21 3 21 9"></polyline>
              <polyline points="9 21 3 21 3 15"></polyline>
              <line x1="21" y1="3" x2="14" y2="10"></line>
              <line x1="3" y1="21" x2="10" y2="14"></line>
            </svg>
          )}
        </button>

        <h3 className="text-xl font-bold mb-4">Helyszín térképen</h3>
        <p className="text-white/60 mb-4">{location}</p>

        <div className="w-full h-[calc(100%-80px)] bg-slate-700/50 rounded-lg overflow-hidden relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-800/80">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          )}

          <iframe
            title="Location Map"
            width="100%"
            height="100%"
            frameBorder="0"
            style={{ border: 0 }}
            src={getMapUrl()}
            allowFullScreen
            onLoad={handleIframeLoad}
            onError={handleIframeError}
          ></iframe>

          {loadError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-800/90 p-6 text-center">
              <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
              <h4 className="text-lg font-semibold mb-2">Nem sikerült betölteni a térképet</h4>
              <p className="text-white/60 mb-4">A Google Maps betöltése sikertelen volt.</p>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors flex items-center gap-2"
              >
                <MapPin className="h-4 w-4" />
                Megnyitás Google Maps-ben
              </a>
            </div>
          )}
        </div>

        <div className="mt-3 text-center text-white/50 text-sm">
          <p>A térkép nagyításához és mozgatásához használd az egeret vagy az érintőképernyőt.</p>
          <p>A teljes képernyős nézethez kattints a <span className="text-white">□</span> ikonra.</p>
        </div>
      </div>
    </div>
  );
};

const EventModal = ({ event, onClose, onParticipantUpdate, isArchived, isInvitation = false, onAcceptInvitation, onRejectInvitation }) => {
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [selectedParticipant, setSelectedParticipant] = useState(null)
  const [participantDetails, setParticipantDetails] = useState(null)
  const [loadingParticipantDetails, setLoadingParticipantDetails] = useState(false)
  const [participantDetailsError, setParticipantDetailsError] = useState(null)
  const [isJoining, setIsJoining] = useState(false)
  const [joinError, setJoinError] = useState('')
  const [isParticipant, setIsParticipant] = useState(false)
  const [participants, setParticipants] = useState(event.resztvevok_lista || [])
  const [currentUser, setCurrentUser] = useState(null)
  const [isLeaving, setIsLeaving] = useState(false)
  const [leaveError, setLeaveError] = useState('')
  const [isRemovingParticipant, setIsRemovingParticipant] = useState(false)
  const [removeParticipantError, setRemoveParticipantError] = useState('')
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [currentEvent, setCurrentEvent] = useState(event)
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [pendingParticipants, setPendingParticipants] = useState([])
  const [userStatus, setUserStatus] = useState(null) // 'elfogadva', 'elutasítva', 'függőben', 'meghívott'
  const [isApproving, setIsApproving] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [approveRejectError, setApproveRejectError] = useState('')
  const [showUserProfile, setShowUserProfile] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState(null)
  const [showMapModal, setShowMapModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');


  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const openInviteModal = () => {
    setIsInviteModalOpen(true);
  };

  const closeInviteModal = () => {
    setIsInviteModalOpen(false);
    fetchParticipants(currentEvent.id);
  };

  const handleOpenMapModal = () => {
    setShowMapModal(true);
  };

  const handleCloseMapModal = () => {
    setShowMapModal(false);
  };

  const handleOpenInviteModal = () => {
    setShowInviteModal(true);
  };

  const handleCloseInviteModal = () => {
    setShowInviteModal(false);
  };

  const fetchParticipants = async (eventId) => {
    if (!eventId) return;

    try {
      console.log("Fetching participants for event:", eventId);
      const response = await fetch(`http://localhost:8081/api/v1/events/${eventId}/participants`);

      if (response.ok) {
        const data = await response.json();
        console.log("Participants data:", data);
        const newParticipants = data.participants || [];

        if (JSON.stringify(newParticipants) !== JSON.stringify(participants)) {
          setParticipants(newParticipants);

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

  const handleOpenUserProfile = (userId) => {
    setSelectedUserId(userId);
    setShowUserProfile(true);
  };

  const handleCloseUserProfile = () => {
    setShowUserProfile(false);
    setSelectedUserId(null);
  };

  const fetchPendingParticipants = async (eventId) => {
    if (!eventId) return;

    try {
      const token = getCookie('token');
      if (!token) return;

      const response = await fetch(`http://localhost:8081/api/v1/events/${eventId}/pending-participants`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json(); setPendingParticipants(data.pendingParticipants || []);
      }
    } catch (error) {
      console.error("Hiba a függőben lévő résztvevők lekérésekor:", error);
    }
  };

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

  useEffect(() => {
    const user = getCurrentUser();
    if (user && currentEvent.id && participants.some(p => p.id === user.userId && p.role === 'szervező')) {
      fetchPendingParticipants(currentEvent.id);
    }
  }, [participants, currentEvent.id]);

  const checkParticipation = async (eventId, user) => {
    if (!user || !eventId) return;

    try {
      const token = getCookie('token');

      if (!token) {
        return;
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
        setUserStatus(data.status || null);

        if (data.isParticipant && currentUser && !participants.some(p => p.id === currentUser.userId)) {
          fetchParticipants(eventId);
        }
      }
    } catch (error) {
      console.error("Hiba a résztvevői státusz ellenőrzésekor:", error);
      fetchParticipants(eventId);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("hu-HU", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "short",
    })
  }

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

  const handleJoinEvent = async () => {
    if (!currentEvent.id) {
      setJoinError("Esemény azonosító hiányzik");
      return;
    }

    if (participants.length >= currentEvent.maximumLetszam) {
      setJoinError("Az esemény betelt, nem lehet több résztvevő");
      return;
    }

    setIsJoining(true);
    setJoinError('');

    // When user sends a join request in handleJoinEvent function
    if (!isInvitation) {
      setIsParticipant(true);
      setUserStatus('függőben');

      if (onParticipantUpdate && currentUser) {
        onParticipantUpdate(currentEvent.id, true, {
          userId: currentUser.userId,
          role: 'játékos',
          status: 'függőben',
          updateParticipantCount: false
        });
      }

      // Add the event ID to pendingEvents in sessionStorage
      const pendingEvents = JSON.parse(sessionStorage.getItem('pendingEvents') || '[]');
      if (!pendingEvents.includes(currentEvent.id)) {
        pendingEvents.push(currentEvent.id);
        sessionStorage.setItem('pendingEvents', JSON.stringify(pendingEvents));
      }
    }

    try {
      const token = getCookie('token');

      if (!token) {
        throw new Error("Bejelentkezés szükséges a csatlakozáshoz");
      }

      console.log("Sending join request for event:", currentEvent.id);

      const endpoint = isInvitation ? "accept-invitation" : "join";

      const response = await fetch(`http://localhost:8081/api/v1/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          eseményId: currentEvent.id
        }),
      });

      let responseData = {};
      try {
        responseData = await response.json();
      } catch (e) {
        console.error("Failed to parse response JSON:", e);
      }

      if (!response.ok) {
        if (responseData.message && responseData.message.includes("already a participant")) {
          console.log("User is already a participant, updating UI accordingly");
          fetchParticipants(currentEvent.id);
          return;
        }

        console.error("Server error during join:", responseData.message);
        return;
      }

      console.log("Join successful:", responseData);

      fetchParticipants(currentEvent.id);

      if (isInvitation && typeof onAcceptInvitation === 'function') {
        onAcceptInvitation();
      }

    } catch (error) {
      console.error("Hiba a csatlakozás során:", error);

      if (currentEvent.id && currentUser) {
        setTimeout(() => {
          checkParticipation(currentEvent.id, currentUser);
          fetchParticipants(currentEvent.id);
        }, 1000);
      }
    } finally {
      setIsJoining(false);
    }
  };

  const handleCancelRequest = async () => {
    if (isCancelling) return;

    setIsCancelling(true);
    setCancelError(null);

    // Get the current event ID
    const eventId = currentEvent.id;

    console.log("Attempting to cancel event with ID:", eventId);

    if (!eventId) {
      console.error("No event ID found to cancel");
      setCancelError("Nem található esemény azonosító");
      setIsCancelling(false);
      return;
    }

    try {
      const token = getCookie('token');

      console.log("Sending cancel request to server...");
      const response = await fetch("http://localhost:8081/api/v1/cancel-pending-request", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          eseményId: eventId
        })
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Hiba történt a kérelem visszavonása közben');
      }

      // Remove this event ID from pendingEvents
      const pendingEvents = JSON.parse(sessionStorage.getItem('pendingEvents') || '[]');
      const updatedEvents = pendingEvents.filter(id => id !== eventId);
      sessionStorage.setItem('pendingEvents', JSON.stringify(updatedEvents));

      console.log("Request successful, refreshing the page...");
      window.location.reload();

    } catch (error) {
      console.error('Hiba a kérelem visszavonásakor:', error);
      setCancelError(error.message || 'Ismeretlen hiba történt');
    } finally {
      setIsCancelling(false);
    }
  };

  const isEventPending = (eventId) => {
    const pendingEvents = JSON.parse(sessionStorage.getItem('pendingEvents') || '[]');
    return pendingEvents.includes(eventId);
  };


  const handleAcceptInvitation = async () => {
    if (!currentEvent.id) {
      setJoinError("Esemény azonosító hiányzik");
      return;
    }

    setIsJoining(true);
    setJoinError('');

    try {
      const token = getCookie('token');

      if (!token) {
        throw new Error("Bejelentkezés szükséges a meghívás elfogadásához");
      }

      console.log("Accepting invitation for event:", currentEvent.id);

      const response = await fetch(`http://localhost:8081/api/v1/accept-invitation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          eseményId: currentEvent.id
        }),
      });

      let responseData = {};
      try {
        responseData = await response.json();
      } catch (e) {
        console.error("Failed to parse response JSON:", e);
      }

      if (!response.ok) {
        throw new Error(responseData.message || "Sikertelen meghívás elfogadás");
      }

      console.log("Invitation acceptance successful:", responseData);

      setIsParticipant(true);
      setUserStatus('elfogadva');

      fetchParticipants(currentEvent.id);

      if (onParticipantUpdate && currentUser) {
        onParticipantUpdate(currentEvent.id, true, {
          userId: currentUser.userId,
          role: 'játékos',
          status: 'elfogadva',
          updateParticipantCount: true
        });
      }

      if (typeof onAcceptInvitation === 'function') {
        onAcceptInvitation();
      }

    } catch (error) {
      console.error("Hiba a meghívás elfogadása során:", error);
      setJoinError(error.message || "Sikertelen meghívás elfogadás. Kérjük, próbáld újra később.");
    } finally {
      setIsJoining(false);
    }
  };

  const handleRejectInvitation = async () => {
    if (!currentEvent.id) {
      setJoinError("Esemény azonosító hiányzik");
      return;
    }

    setIsJoining(true);
    setJoinError('');

    try {
      const token = getCookie('token');

      if (!token) {
        throw new Error("Bejelentkezés szükséges a meghívás elutasításához");
      }

      console.log("Rejecting invitation for event:", currentEvent.id);

      const response = await fetch(`http://localhost:8081/api/v1/reject-invitation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          eseményId: currentEvent.id
        }),
      });

      let responseData = {};
      try {
        responseData = await response.json();
      } catch (e) {
        console.error("Failed to parse response JSON:", e);
      }

      if (!response.ok) {
        throw new Error(responseData.message || "Sikertelen meghívás elutasítás");
      }

      console.log("Invitation rejection successful:", responseData);

      // Update local state
      setIsParticipant(false);
      setUserStatus('elutasítva');

      // Notify parent components about the update
      if (onParticipantUpdate && currentUser) {
        onParticipantUpdate(currentEvent.id, false, {
          userId: currentUser.userId,
          status: 'elutasítva',
          updateParticipantCount: true
        });
      }

      // Közvetlenül hívjuk meg az onRejectInvitation függvényt
      if (typeof onRejectInvitation === 'function') {
        onRejectInvitation();
      }

      // Bezárjuk a modalt
      onClose();

      // Oldalfrissítés rövid késleltetéssel, hogy a modal bezárása látható legyen
      setTimeout(() => {
        window.location.reload();
      }, 300);

    } catch (error) {
      console.error("Hiba a meghívás elutasítása során:", error);
      setJoinError(error.message || "Sikertelen meghívás elutasítás. Kérjük, próbáld újra később.");
    } finally {
      setIsJoining(false);
    }
  };




  const handleLeaveEvent = async () => {
    if (!currentEvent.id) {
      setLeaveError("Esemény azonosító hiányzik");
      return;
    }

    setIsLeaving(true);
    setLeaveError('');

    try {
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

      setIsParticipant(false);
      setUserStatus(null);

      if (currentUser) {
        const updatedParticipants = participants.filter(p => p.id !== currentUser.userId);
        setParticipants(updatedParticipants);

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

  const handleRemoveParticipant = async (participantId) => {
    if (!currentEvent.id || !participantId) {
      setRemoveParticipantError("Hiányzó adatok");
      return;
    }

    setIsRemovingParticipant(true);
    setRemoveParticipantError('');

    try {
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

      const updatedParticipants = participants.filter(p => p.id !== participantId);
      setParticipants(updatedParticipants);

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

  const handleApproveParticipant = async (participantId) => {
    setIsApproving(true);
    setApproveRejectError('');

    try {
      const token = getCookie('token');
      if (!token) {
        throw new Error("Bejelentkezés szükséges a művelethez");
      }

      const response = await fetch(`http://localhost:8081/api/v1/approve-participant`, {
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

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Sikertelen jóváhagyás");
      }

      await fetchParticipants(currentEvent.id);

      await fetchPendingParticipants(currentEvent.id);

      if (onParticipantUpdate) {
        onParticipantUpdate(currentEvent.id, true, {
          userId: participantId,
          status: 'elfogadva'
        });
      }

    } catch (error) {
      console.error("Hiba a résztvevő jóváhagyása során:", error);
      setApproveRejectError(error.message || "Sikertelen jóváhagyás. Kérjük, próbáld újra később.");
    } finally {
      setIsApproving(false);
    }
  };

  const handleRejectParticipant = async (participantId) => {
    setIsRejecting(true);
    setApproveRejectError('');

    try {
      const token = getCookie('token');
      if (!token) {
        throw new Error("Bejelentkezés szükséges a művelethez");
      }

      const response = await fetch(`http://localhost:8081/api/v1/reject-participant`, {
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

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Sikertelen elutasítás");
      }

      await fetchPendingParticipants(currentEvent.id);

      if (onParticipantUpdate) {
        onParticipantUpdate(currentEvent.id, false, {
          userId: participantId,
          status: 'elutasítva'
        });
      }

    } catch (error) {
      console.error("Hiba a résztvevő elutasítása során:", error);
      setApproveRejectError(error.message || "Sikertelen elutasítás. Kérjük, próbáld újra később.");
    } finally {
      setIsRejecting(false);
    }
  };

  const handleEditEvent = () => {
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
  };

  const handleEventUpdate = (updatedEvent) => {
    console.log("Event updated, new data:", updatedEvent);
  
    // Update local state first
    setCurrentEvent({
      ...updatedEvent,
      resztvevok_lista: participants
    });
  
    // Close the modal
    closeEditModal();
  
    // Notify parent components if needed
    if (onParticipantUpdate) {
      onParticipantUpdate(updatedEvent.id, true, {
        userId: 'event-updated',
        eventData: {
          ...updatedEvent,
          resztvevok_lista: participants
        }
      });
    }
    
    // Immediately refresh the page
    window.location.reload();
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirmation(true);
  };

  const cancelDelete = () => {
    setShowDeleteConfirmation(false);
    setDeleteError('');
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    setDeleteError('');

    try {
      const token = getCookie('token');

      if (!token) {
        throw new Error("Bejelentkezés szükséges a törléshez");
      }

      console.log("Deleting event:", currentEvent.id);
      const response = await fetch(`http://localhost:8081/api/v1/deleteEsemeny/${currentEvent.id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const responseData = await response.json();
        throw new Error(responseData.message || "Sikertelen törlés");
      }

      console.log("Event deletion successful");

      if (onParticipantUpdate) {
        onParticipantUpdate(currentEvent.id, false, {
          userId: 'event-deleted',
          eventId: currentEvent.id
        });
      }

      onClose();

      setTimeout(() => {
        window.location.reload();
      }, 300);

    } catch (error) {
      console.error("Hiba az esemény törlése során:", error);
      setDeleteError(error.message || "Sikertelen törlés. Kérjük, próbáld újra később.");
    } finally {
      setIsDeleting(false);
    }
  };

  const isUserOrganizer = () => {
    return currentUser && participants.some(p => p.id === currentUser.userId && p.role === 'szervező');
  };

  const handleParticipantClick = async (participant) => {
    setSelectedParticipant(participant);
    setShowProfileModal(true);
    setLoadingParticipantDetails(true);
    setParticipantDetailsError(null);
    setParticipantDetails(null);

    try {
      const token = getCookie('token');
      if (!token) {
        throw new Error("Bejelentkezés szükséges a felhasználói adatok megtekintéséhez");
      }

      // Felhasználói adatok lekérése
      const response = await fetch(`http://localhost:8081/api/v1/getUser/${participant.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error("Nem sikerült lekérni a felhasználói adatokat");
      }

      const userData = await response.json();

      // Statisztikák lekérése
      const statsResponse = await fetch(`http://localhost:8081/api/v1/user-stats/${participant.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      let stats = { createdEvents: 0, participatedEvents: 0 };
      if (statsResponse.ok) {
        stats = await statsResponse.json();
      }

      // Felhasználói adatok és statisztikák kombinálása
      setParticipantDetails({
        ...userData,
        stats: {
          createdEvents: stats.createdEvents || 0,
          participatedEvents: stats.participatedEvents || 0
        }
      });
    } catch (error) {
      console.error("Hiba a felhasználói adatok betöltésekor:", error);
      setParticipantDetailsError(error.message);
    } finally {
      setLoadingParticipantDetails(false);
    }
  };

  const closeProfileModal = () => {
    setShowProfileModal(false);
    setSelectedParticipant(null);
    setParticipantDetails(null);
    setParticipantDetailsError(null);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="relative w-full max-w-6xl max-h-[90vh] overflow-auto custom-scrollbar bg-gradient-to-br from-slate-800 to-zinc-900 rounded-lg shadow-xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex flex-col md:flex-row">
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

              <div className="flex flex-col md:flex-row gap-6">
                {/* Bal oldali információk */}
                <div className="flex-1 space-y-3">
                  <h2 className="text-2xl font-bold mb-4 text-white">{currentEvent.Helyszin?.Nev || "Helyszín"}</h2>

                  {/* Ez a sor lesz egy vonalban a jobb oldali szint információval */}
                  <div className="flex items-center gap-2 text-white/80">
                    <MapPin className="h-5 w-5 flex-shrink-0 text-blue-400" />
                    <span>
                      {currentEvent.Helyszin?.Telepules || "Város"}, {currentEvent.Helyszin?.Cim || "Cím"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-white/80 mt-1">
                    <Map className="h-5 w-5 flex-shrink-0 text-blue-400" />
                    <button
                      onClick={handleOpenMapModal}
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      Megtekintés térképen
                    </button>
                  </div>

                  <div className="flex items-start gap-2 text-white/80">
                    <Clock className="h-5 w-5 flex-shrink-0 text-blue-400 mt-1" />
                    <div className="flex flex-col">
                      <span className="font-medium text-white/80">Kezdés:</span>
                      <span>{formatDateTime(currentEvent.kezdoIdo)}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 text-white/80">
                    <Clock className="h-5 w-5 flex-shrink-0 text-blue-400 mt-1" />
                    <div className="flex flex-col">
                      <span className="font-medium text-white/80">Befejezés:</span>
                      <span>{formatDateTime(currentEvent.zaroIdo)}</span>
                    </div>
                  </div>


                </div>

                {/* Jobb oldali információk */}
                <div className="w-full md:w-1/3 p-4 rounded-lg">
                  {/* Eltávolítottam a láthatatlan címsort és helyette marginnal igazítom */}
                  <div className="space-y-3 md:mt-10"> {/* Hozzáadott mt-10 a megfelelő igazításhoz */}
                    {/* Ez a sor lesz egy vonalban a bal oldali helyszín címmel */}
                    <div className="flex items-center gap-2 text-white/80">
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
                          <path d="M2 20h.01"></path>
                          <path d="M7 20v-4"></path>
                          <path d="M12 20v-8"></path>
                          <path d="M17 20v-6"></path>
                        </svg>
                      </div>
                      <span>Szint: {currentEvent.szint || "Ismeretlen szint"}</span>
                    </div>

                    <div className="flex items-center gap-2 text-white/80">
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                        <Home className="h-4 w-4 text-blue-400" />
                      </div>
                      <span>
                        Fedett
                        {currentEvent.Helyszin?.Fedett === true ? (
                          <CheckCircle className="h-4 w-4 text-green-500 inline ml-2" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500 inline ml-2" />
                        )}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-white/80">
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                        <DoorOpen className="h-4 w-4 text-blue-400" />
                      </div>
                      <span>
                        Öltöző
                        {currentEvent.Helyszin?.Oltozo === true ? (
                          <CheckCircle className="h-4 w-4 text-green-500 inline ml-2" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500 inline ml-2" />
                        )}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-white/80">
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                        <Car className="h-4 w-4 text-blue-400" />
                      </div>
                      <span>Parkolás: {currentEvent.Helyszin?.Parkolas || "Nincs adat"}</span>
                    </div>
                  </div>
                </div>
              </div>



              {currentEvent.Helyszin?.Leiras && (
  <div className="mt-6 p-4 bg-white/5 rounded-lg mb-6 w-full">
    <h4 className="text-sm font-medium text-gray-300 mb-2">Leírás:</h4>
    <div className="max-h-40 overflow-y-auto custom-scrollbar pr-2">
      <p className="text-sm text-white/80 whitespace-pre-wrap break-words">{currentEvent.Helyszin.Leiras}</p>
    </div>
  </div>
)}

<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
  <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2">
    {isInvitation ? (
      <div className="w-full flex flex-col sm:flex-row gap-2">
        <button
          onClick={handleAcceptInvitation}
          className={`flex-1 px-6 py-2 ${isJoining ? "bg-green-800 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"} text-white rounded-md transition-colors flex items-center justify-center gap-2`}
          disabled={isJoining}
        >
          {isJoining ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Elfogadás...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4" />
              Elfogadás
            </>
          )}
        </button>
        <button
          onClick={handleRejectInvitation}
          className={`flex-1 px-6 py-2 ${isJoining ? "bg-red-800 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"} text-white rounded-md transition-colors flex items-center justify-center gap-2`}
          disabled={isJoining}
        >
          <XCircle className="h-4 w-4" />
          Elutasítás
        </button>
      </div>
    ) : isArchived ? (
      <div className="w-full px-6 py-3 bg-amber-600/30 text-amber-300 rounded-md flex items-center justify-center">
        <Archive className="h-4 w-4 mr-2" />
        Ez az esemény már lejárt
      </div>
    ) : isParticipant ? (
      <>
        {userStatus === 'függőben' ? (
          <div className="w-full flex flex-col sm:flex-row gap-2">
            <button
              className="flex-1 px-6 py-2 bg-yellow-600 text-white rounded-md cursor-not-allowed"
              disabled
            >
              Kérelem elküldve
            </button>
            <button
              onClick={handleCancelRequest}
              className="flex-1 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors flex items-center justify-center gap-2"
            >
              <XCircle className="h-4 w-4" />
              Kérelem visszavonása
            </button>
          </div>
        ) : userStatus === 'elutasítva' ? (
          <button
            className="w-full sm:w-auto px-6 py-2 bg-red-600 text-white rounded-md cursor-not-allowed"
            disabled
          >
            Elutasítva
          </button>
        ) : userStatus === 'meghívott' ? (
          <div className="w-full flex flex-col sm:flex-row gap-2">
            <button
              onClick={handleAcceptInvitation}
              className={`flex-1 px-6 py-2 ${isJoining ? "bg-green-800 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"} text-white rounded-md transition-colors flex items-center justify-center gap-2`}
              disabled={isJoining}
            >
              {isJoining ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Elfogadás...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Elfogadás
                </>
              )}
            </button>
            <button
              onClick={handleRejectInvitation}
              className={`flex-1 px-6 py-2 ${isJoining ? "bg-red-800 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"} text-white rounded-md transition-colors flex items-center justify-center gap-2`}
              disabled={isJoining}
            >
              <XCircle className="h-4 w-4" />
              Elutasítás
            </button>
          </div>
        ) : (
          <button
            className="w-full sm:w-auto px-6 py-2 bg-green-600 text-white rounded-md cursor-not-allowed"
            disabled
          >
            Csatlakozva
          </button>
        )}

        {currentUser && participants.some(p => p.id === currentUser.userId) && userStatus === 'elfogadva' && (
          <button onClick={handleOpenInviteModal}
            className="w-full sm:w-auto mt-2 sm:mt-0 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <line x1="19" y1="8" x2="19" y2="14"></line>
              <line x1="22" y1="11" x2="16" y2="11"></line>
            </svg>
            Meghívás
          </button>
        )}

        {currentUser && participants.find(p => p.id === currentUser.userId)?.role === 'szervező' && (
          <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2 mt-2 sm:mt-0">
            <button
              onClick={handleEditEvent}
              className="w-full sm:w-auto px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors flex items-center justify-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Szerkesztés
            </button>
            <button
              onClick={handleDeleteClick}
              className="w-full sm:w-auto px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors flex items-center justify-center gap-2"
            >
              <Trash className="h-4 w-4" />
              Törlés
            </button>
          </div>
        )}

        {currentUser && participants.find(p => p.id === currentUser.userId)?.role === 'játékos' && userStatus === 'elfogadva' && (
          <button
            onClick={handleLeaveEvent}
            className={`w-full sm:w-auto mt-2 sm:mt-0 px-6 py-2 ${isLeaving ? "bg-red-800 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
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

            <div className="w-full md:w-2/5 p-6">
              <h3 className="text-xl font-bold mb-4 text-white">Résztvevők</h3>

              <div className="flex items-center gap-2 text-white/80 mb-4">
                <Users className="h-5 w-5 flex-shrink-0 text-blue-400" />
                <span>
                  {participants.length}/{currentEvent.maximumLetszam || 10} résztvevő
                  {participants.length >= currentEvent.maximumLetszam && (
                    <span className="ml-2 text-yellow-400 text-sm">(Betelt)</span>
                  )}
                </span>
              </div>

              {isUserOrganizer() && pendingParticipants.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold mb-3 border-b border-white/20 pb-2">
                    Jóváhagyásra váró résztvevők ({pendingParticipants.length})
                  </h4>
                  <div className="space-y-4 max-h-60 overflow-y-auto custom-scrollbar pr-2">
  {pendingParticipants.map((participant) => (
                      <div
                        key={participant.id}
                        className="flex items-center gap-4 p-3 rounded-lg bg-yellow-900/30 hover:bg-yellow-900/50 transition-colors"
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
                            </h4>
                            <p className="text-sm text-white/60">
                              <span className="text-yellow-300">Függőben</span>
                              {participant.age ? ` • ${participant.age} éves` : ""}
                              {participant.level ? ` • ${participant.level}` : ""}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApproveParticipant(participant.id)}
                            className={`p-2 rounded-full ${isApproving ? "bg-green-800/50 cursor-not-allowed" : "bg-green-600/20 hover:bg-green-600/40"
                              } text-green-400 transition-colors`}
                            disabled={isApproving}
                            title="Jóváhagyás"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleRejectParticipant(participant.id)}
                            className={`p-2 rounded-full ${isRejecting ? "bg-red-800/50 cursor-not-allowed" : "bg-red-600/20 hover:bg-red-600/40"
                              } text-red-400 transition-colors`}
                            disabled={isRejecting}
                            title="Elutasítás"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {approveRejectError && (
                      <p className="text-red-400 text-sm mt-2">{approveRejectError}</p>
                    )}
                  </div>
                </div>
              )}

              <div className="mb-6">
                <h4 className="text-lg font-semibold mb-3 border-b border-white/20 pb-2 text-white">Szervező</h4>
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

              <div>
                <h4 className="text-lg font-semibold mb-3 border-b border-white/20 pb-2 text-white">Játékosok</h4>
                <div className="space-y-4 max-h-60 overflow-y-auto custom-scrollbar pr-2">
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
                                {participant.age ? `${participant.age} éves  ` : ""}
                                {participant.level || ""}
                              </p>
                            </div>
                          </div>

                          {!isArchived && currentUser &&
                            participants.some(p => p.id === currentUser.userId && p.role === 'szervező') &&
                            participant.id !== currentUser.userId && (
                              <button
                                onClick={() => handleRemoveParticipant(participant.id)}
                                className={`p-2 rounded-full ${isRemovingParticipant ? "bg-red-800/50 cursor-not-allowed" : "bg-red-600/20 hover:bg-red-600/40"
                                  } text-red-400 transition-colors`}
                                disabled={isRemovingParticipant}
                                title="Résztvevő eltávolítása"
                              >
                                <Trash className="h-4 w-4" />
                              </button>
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

      {showProfileModal && selectedParticipant && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70">
          <div className="relative w-full max-w-md bg-gradient-to-br from-slate-800 to-zinc-900 rounded-lg shadow-xl p-6">
            <button
              onClick={closeProfileModal}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {loadingParticipantDetails ? (
  <div className="flex justify-center items-center py-10">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
) : participantDetailsError ? (
  <div className="text-center py-10">
    <p className="text-red-400">{participantDetailsError}</p>
  </div>
) : participantDetails ? (
  <div className="flex flex-col items-center text-center">
    <Image
      src={participantDetails?.image || selectedParticipant.image}
      alt={participantDetails?.name || selectedParticipant.name}
      className="w-24 h-24 rounded-full object-cover mb-4"
    />
    <h3 className="text-xl font-bold">{participantDetails?.name || selectedParticipant.name}</h3>
    <p className="text-white/60 mb-4">
      {selectedParticipant.role === 'szervező' && (
        <span className="text-blue-300 mr-1">Szervező</span>
      )}
      {(participantDetails?.age || selectedParticipant.age) ?
        `${participantDetails?.age || selectedParticipant.age} éves  ` : ""}
      {selectedParticipant.level || ""}
    </p>

    <div className="w-full space-y-4 mt-2">
      <div className="bg-white/5 p-4 rounded-lg text-left">
        <h4 className="font-medium mb-2 text-white">
          Bemutatkozás
        </h4>
        <div className="flex items-start gap-2 text-white/80 text-sm">
          <User className="h-4 w-4 text-blue-400 mt-1" />
          <p className="whitespace-pre-line break-words overflow-y-auto max-h-40 custom-scrollbar pr-2">
            {participantDetails.bio || "Ez a felhasználó még nem adott meg bemutatkozást."}
          </p>
        </div>
      </div>

      <div className="bg-white/5 p-4 rounded-lg text-left">
        <h4 className="font-medium mb-2 text-white">
          Elérhetőség
        </h4>
        {participantDetails.email && (
          <div className="flex items-center gap-2 text-white/80 text-sm mb-2">
            <Mail className="h-4 w-4 text-blue-400" />
            <span>{participantDetails.email}</span>
          </div>
        )}
        {participantDetails?.phone && (
          <div className="flex items-center gap-2 text-white/80 text-sm">
            <Phone className="h-4 w-4 text-green-400" />
            <span>{participantDetails.phone}</span>
          </div>
        )}
      </div>

      {/* Esemény statisztikák - a Profile.jsx-ből átvéve */}
      <div className="bg-white/5 p-4 rounded-lg text-left">
        <h4 className="font-medium mb-3 text-white">Esemény statisztikák</h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/20 rounded-xl p-3">
            <h5 className="text-blue-400 text-xs font-medium mb-1">Létrehozott események</h5>
            <p className="text-xl font-bold text-white">
              {participantDetails.stats?.createdEvents || 0}
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/20 rounded-xl p-3">
            <h5 className="text-purple-400 text-xs font-medium mb-1">Részvételek</h5>
            <p className="text-xl font-bold text-white">
              {participantDetails.stats?.participatedEvents || 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
) : (
  <div className="flex flex-col items-center text-center">
                <Image
                  src={selectedParticipant.image}
                  alt={selectedParticipant.name}
                  className="w-24 h-24 rounded-full object-cover mb-4"
                />
                <h3 className="text-xl font-bold">{selectedParticipant.name}</h3>
                <p className="text-white/60 mb-4">
                  {selectedParticipant.role === 'szervező' && (
                    <span className="text-blue-300 mr-1">Szervező</span>
                  )}
                  {selectedParticipant.age ? `${selectedParticipant.age} éves  ` : ""}
                  {selectedParticipant.level || ""}
                </p>

                <div className="w-full space-y-4 mt-2">
                  <div className="bg-white/5 p-4 rounded-lg text-left">
                    <h4 className="font-medium mb-2 text-white">
                      Bemutatkozás
                    </h4>
                    <div className="flex items-start gap-2 text-white/80 text-sm">
                      <User className="h-4 w-4 text-blue-400 mt-1" />
                      <p className="whitespace-pre-line">
                        {selectedParticipant.bio || "Ez a felhasználó még nem adott meg bemutatkozást."}
                      </p>
                    </div>
                  </div>

                  <div className="bg-white/5 p-4 rounded-lg text-left">
                    <h4 className="font-medium mb-2 text-white">
                      Elérhetőség
                    </h4>
                    {selectedParticipant.email && (
                      <div className="flex items-center gap-2 text-white/80 text-sm mb-2">
                        <Mail className="h-4 w-4 text-blue-400" />
                        <span>{selectedParticipant.email}</span>
                      </div>
                    )}
                  </div>

                  {/* Esemény statisztikák alapértelmezett értékekkel */}
                  <div className="bg-white/5 p-4 rounded-lg text-left">
                    <h4 className="font-medium mb-3 text-white">Esemény statisztikák</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/20 rounded-xl p-3">
                        <h5 className="text-blue-400 text-xs font-medium mb-1">Létrehozott események</h5>
                        <p className="text-xl font-bold text-white">0</p>
                      </div>
                      <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/20 rounded-xl p-3">
                        <h5 className="text-purple-400 text-xs font-medium mb-1">Részvételek</h5>
                        <p className="text-xl font-bold text-white">0</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}


      {isEditModalOpen && (
        <EventEditModal
          isOpen={isEditModalOpen}
          onClose={closeEditModal}
          event={currentEvent}
          onSuccess={handleEventUpdate}
        />
      )}

      {showDeleteConfirmation && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80">
          <div className="relative w-full max-w-md bg-gradient-to-br from-slate-800 to-zinc-900 rounded-lg shadow-xl p-6">
            <div className="flex flex-col items-center text-center">
              <div className="bg-red-500/20 p-3 rounded-full mb-4">
                <Trash className="h-8 w-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">Esemény törlése</h3>
              <p className="text-white/70 mb-6">
                Biztosan törölni szeretnéd ezt az eseményt? Ez a művelet nem visszavonható, és minden résztvevő eltávolításra kerül.
              </p>

              {deleteError && (
                <div className="bg-red-500/20 border border-red-500/30 text-red-300 p-4 rounded-lg mb-4 w-full text-left">
                  {deleteError}
                </div>
              )}

              <div className="flex gap-3 w-full">
                <button
                  onClick={cancelDelete}
                  className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-md transition-colors"
                  disabled={isDeleting}
                >
                  Mégsem
                </button>
                <button
                  onClick={confirmDelete}
                  className={`flex-1 py-2 ${isDeleting ? "bg-red-800" : "bg-red-600 hover:bg-red-700"} text-white rounded-md transition-colors flex items-center justify-center`}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Törlés...
                    </>
                  ) : (
                    "Törlés"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showUserProfile && selectedUserId && (
        <UserProfileModal userId={selectedUserId} onClose={handleCloseUserProfile} />
      )}

{showMapModal && (
  <LocationMapModal
    location={`${currentEvent.Helyszin?.Telepules || ""}, ${currentEvent.Helyszin?.Cim || ""}`}
    onClose={handleCloseMapModal}
  />
)}




{showInviteModal && (
  <InviteUsersModal
    isOpen={showInviteModal}
    onClose={handleCloseInviteModal}
    eventId={currentEvent.id}
  />
)}
 {/* Add the style tag here */}
 <style jsx>{`
      /* Custom scrollbar styling */
      .custom-scrollbar::-webkit-scrollbar {
        width: 8px;
      }
      
      .custom-scrollbar::-webkit-scrollbar-track {
        background: rgba(30, 41, 59, 0.5);
        border-radius: 4px;
      }
      
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: rgba(99, 102, 241, 0.5);
        border-radius: 4px;
      }
      
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: rgba(99, 102, 241, 0.7);
      }
    `}</style>
  </>
);



};



const EventEditModal = ({ isOpen, onClose, event, onSuccess }) => {
  const safeEvent = event || {};

  // Add this function here
  const formatImageUrl = (url) => {
    if (!url) return "";

    // If it's already a complete URL, return it
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:image/')) {
      return url;
    }

    // If it's a relative path, prepend the API base URL
    return `http://localhost:8081${url.startsWith('/') ? url : `/${url}`}`;
  };

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
    helyszinNev: safeEvent.Helyszin?.Nev || "",
    helyszinCim: safeEvent.Helyszin?.Cim || "",
    helyszinTelepules: safeEvent.Helyszin?.Telepules || "",
    helyszinIranyitoszam: safeEvent.Helyszin?.Iranyitoszam || "",
    helyszinFedett: Boolean(safeEvent.Helyszin?.Fedett) || false,
    helyszinOltozo: Boolean(safeEvent.Helyszin?.Oltozo) || false,
    helyszinParkolas: safeEvent.Helyszin?.Parkolas || "nincs",
    helyszinBerles: Boolean(safeEvent.Helyszin?.Berles) || false,
    helyszinLeiras: safeEvent.Helyszin?.Leiras || "",
  });





  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(formatImageUrl(safeEvent.imageUrl) || "");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [locations, setLocations] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [sports, setSports] = useState([]);
  const [loadingSports, setLoadingSports] = useState(false);
  const [editingLocation, setEditingLocation] = useState(false);

  const parkolasOptions = [
    { value: "ingyenes", label: "Ingyenes" },
    { value: "fizetős", label: "Fizetős" },
    { value: "nincs", label: "Nincs" }
  ];

  useEffect(() => {
    if (isOpen) {
      fetchLocations(); fetchSports();
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
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      console.log("Image preview set to:", previewUrl);
    }
  };


  const startLocationEditing = () => {
    setEditingLocation(true);
  };

  const cancelLocationEditing = () => {
    setEditingLocation(false);
  };

  const saveLocation = async () => {
    try {
      const token = getCookie('token');

      if (!token) {
        setErrorMessage("Authentication token is missing. Please login again.");
        return null;
      }

      const iranyitoszam = parseInt(formData.helyszinIranyitoszam);
      if (isNaN(iranyitoszam) || iranyitoszam < 1000 || iranyitoszam > 9999) {
        setErrorMessage("Az irányítószám 1000 és 9999 közötti szám kell legyen.");
        return null;
      }

      const locationData = {
        Nev: formData.helyszinNev,
        Cim: formData.helyszinCim,
        Telepules: formData.helyszinTelepules,
        Iranyitoszam: iranyitoszam,
        Fedett: formData.helyszinFedett === true,
        Oltozo: formData.helyszinOltozo === true,
        Parkolas: formData.helyszinParkolas || "nincs",
        Berles: formData.helyszinBerles === true,
        Leiras: formData.helyszinLeiras || ""
      };

      console.log("Sending location update with data:", locationData);

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

      await fetchLocations();

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

      let finalHelyszinId = formData.helyszinId;
      if (editingLocation) {
        const savedLocationId = await saveLocation();
        if (!savedLocationId) {
          throw new Error("Failed to save location");
        }
        finalHelyszinId = savedLocationId;
      }

      const formDataToSend = new FormData();
      formDataToSend.append("helyszinId", finalHelyszinId);
      formDataToSend.append("sportId", formData.sportId);
      formDataToSend.append("kezdoIdo", formData.kezdoIdo);
      formDataToSend.append("zaroIdo", formData.zaroIdo);
      formDataToSend.append("szint", formData.szint);
      formDataToSend.append("minimumEletkor", formData.minimumEletkor);
      formDataToSend.append("maximumEletkor", formData.maximumEletkor);
      formDataToSend.append("maximumLetszam", formData.maximumLetszam);
      formDataToSend.append("leiras", formData.leiras);
      formDataToSend.append("autoApprove", formData.autoApprove);

      if (imageFile) {
        formDataToSend.append("imageFile", imageFile);
      }

      formDataToSend.append("id", safeEvent.id);

      console.log("Sending event update with data:", Object.fromEntries(formDataToSend));

      const response = await fetch(`http://localhost:8081/api/v1/updateEsemeny/${safeEvent.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update event");
      }

      console.log("Event updated successfully:", data);
      setSuccess(true);

      if (onSuccess) {
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
          autoApprove: formData.autoApprove,
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
          imageUrl: data.esemeny?.imageUrl || safeEvent.imageUrl
        };

        if (formData.sportId !== safeEvent.sportId) {
          const newSport = sports.find(sport => sport.Id.toString() === formData.sportId.toString());
          if (newSport) {
            updatedEvent.Sportok = newSport;
          }
        }

        console.log("Updating event with:", updatedEvent);
        onSuccess(updatedEvent);
      }

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
              <div className="grid gap-6 mb-6 md:grid-cols-2">
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

                <div>
                  <label htmlFor="szint" className="block mb-2 text-sm font-medium text-gray-300">
                    Szint
                  </label>
                  <select id="szint"
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



                <div className="md:col-span-2">
                  <label htmlFor="imageFile" className="block mb-2 text-sm font-medium text-gray-300">
                    Kép cseréje (opcionális)
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
                            src={imagePreview}
                            alt="Preview"
                            className="max-h-full max-w-full object-contain rounded-lg"
                            onError={(e) => {
                              console.error("Error loading image:", imagePreview);
                              e.target.src = "/placeholder.svg";
                            }}
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

                <div className="md:col-span-2">
                  <label htmlFor="helyszinLeiras" className="block mb-2 text-sm font-medium text-gray-300">
                    Leírás
                  </label>
                  <textarea
                    id="helyszinLeiras"
                    rows="4"
                    className="bg-slate-800/80 border border-slate-600/50 text-gray-100 text-sm rounded-xl focus:ring-purple-500 focus:border-purple-500 block w-full p-3 transition-all duration-300 hover:border-purple-500/50"
                    placeholder="Leírás..."
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
      </div >
    </div >
  );
};


const InviteUsersModal = ({ isOpen, onClose, eventId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [currentParticipants, setCurrentParticipants] = useState([]);
  const [pendingInvitations, setPendingInvitations] = useState([]);
  const [eventDetails, setEventDetails] = useState(null);
  const [ageRange, setAgeRange] = useState({ min: 0, max: 100 });
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadEventDetails();
      loadCurrentParticipants();
      loadPendingInvitations();
    }
  }, [isOpen, eventId]);

  const loadEventDetails = async () => {
    try {
      const token = getCookie('token');
      if (!token) return;

      const response = await fetch(`http://localhost:8081/api/v1/events/${eventId}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setEventDetails(data.event || {});
        setAgeRange({
          min: data.event?.minimumEletkor || 0,
          max: data.event?.maximumEletkor || 100
        });
        console.log("Event details loaded:", data.event);
      } else {
        console.error("Error loading event details");
      }
    } catch (error) {
      console.error("Error loading event details:", error);
    }
  };

  const loadCurrentParticipants = async () => {
    try {
      const response = await fetch(`http://localhost:8081/api/v1/events/${eventId}/participants`);

      if (response.ok) {
        const data = await response.json();
        setCurrentParticipants(data.participants || []);
        console.log("Current participants loaded:", data.participants);
      } else {
        console.error("Error loading current participants");
      }
    } catch (error) {
      console.error("Error loading current participants:", error);
    }
  };

  const loadPendingInvitations = async () => {
    try {
      const token = getCookie('token');
      if (!token) return;

      const response = await fetch(`http://localhost:8081/api/v1/events/${eventId}/all-invitations`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPendingInvitations(data.invitations || []);
        console.log("All invitations loaded:", data.invitations);
      } else {
        console.error("Error loading invitations");
      }
    } catch (error) {
      console.error("Error loading invitations:", error);
    }
  };

  const searchUsers = async () => {
    if (!searchTerm || searchTerm.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setErrorMessage('');

    try {
      const token = getCookie('token');
      if (!token) {
        throw new Error("Bejelentkezés szükséges a felhasználók kereséséhez");
      }

      const response = await fetch(`http://localhost:8081/api/v1/events/${eventId}/search-users?query=${encodeURIComponent(searchTerm)}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Hiba a felhasználók keresése során");
      }

      const data = await response.json();
      setSearchResults(data.users || []);

      if (data.ageRange) {
        setAgeRange(data.ageRange);
      }

      console.log("Search results:", data.users);
    } catch (error) {
      console.error("Hiba a felhasználók keresése során:", error);
      setErrorMessage(error.message || "Hiba a felhasználók keresése során");
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const loadUsersForEvent = async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const token = getCookie('token');
      if (!token) {
        throw new Error("Bejelentkezés szükséges a felhasználók betöltéséhez");
      }

      const response = await fetch(`http://localhost:8081/api/v1/events/${eventId}/search-users`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Hiba a felhasználók betöltése során");
      }

      const data = await response.json();
      setSearchResults(data.users || []);

      if (data.ageRange) {
        setAgeRange(data.ageRange);
      }

      console.log("Available users:", data.users);
    } catch (error) {
      console.error("Hiba a felhasználók betöltése során:", error);
      setErrorMessage(error.message || "Hiba a felhasználók betöltése során");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (searchTerm && searchTerm.length >= 2) {
      const delayDebounceFn = setTimeout(() => {
        searchUsers();
      }, 500);
      return () => clearTimeout(delayDebounceFn);
    } else if (searchTerm === '') {
      loadUsersForEvent();
    }
  }, [searchTerm, eventId]);

  const toggleUserSelection = (user) => {
    setSelectedUsers(prev => {
      const isSelected = prev.some(u => u.id === user.id);
      if (isSelected) {
        return prev.filter(u => u.id !== user.id);
      } else {
        return [...prev, user];
      }
    });
  };

  const sendInvitations = async () => {
    if (selectedUsers.length === 0) {
      setErrorMessage("Válassz ki legalább egy felhasználót a meghíváshoz");
      return;
    }

    setIsSending(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const token = getCookie('token');
      if (!token) {
        throw new Error("Bejelentkezés szükséges a meghívók küldéséhez");
      }

      const userIds = selectedUsers.map(user => user.id);

      console.log("Sending invitations for event:", eventId, "to users:", userIds);

      const response = await fetch(`http://localhost:8081/api/v1/invite-users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          eseményId: eventId,
          userIds: userIds,
          status: 'meghívott'
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Hiba a meghívók küldése során");
      }

      setSuccessMessage(`Sikeresen elküldtél ${selectedUsers.length} meghívót!`);
      setSelectedUsers([]);

      await loadPendingInvitations();

      if (searchTerm && searchTerm.length >= 2) {
        searchUsers();
      } else {
        loadUsersForEvent();
      }

      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (error) {
      console.error("Hiba a meghívók küldése során:", error);
      setErrorMessage(error.message || "Hiba a meghívók küldése során");
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    if (isOpen && eventId) {
      loadUsersForEvent();
    }
  }, [isOpen, eventId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-[70]">
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 0px;
          background: transparent;
        }
        
        .custom-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg max-w-md w-full shadow-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Felhasználók meghívása</h2>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {successMessage && (
          <div className="bg-green-500/20 border border-green-500/30 text-green-300 p-4 rounded-lg mb-4">
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="bg-red-500/20 border border-red-500/30 text-red-300 p-4 rounded-lg mb-4">
            {errorMessage}
          </div>
        )}

        <div className="mb-4 bg-blue-500/20 border border-blue-500/30 text-blue-300 p-3 rounded-lg text-sm">
          <p>Csak {ageRange.min}-{ageRange.max} év közötti felhasználók jelennek meg.</p>
        </div>

        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              className="bg-slate-700/50 border border-slate-600/50 text-white rounded-lg w-full p-3 pr-12 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Keresés felhasználónév alapján..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-white/60">
              {isSearching ? (
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              )}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : searchResults.length > 0 ? (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">

            </h3>
            <div className="max-h-60 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {searchResults.map(user => (
                <div
                  key={user.id}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${selectedUsers.some(u => u.id === user.id)
                    ? "bg-blue-600/30 border border-blue-500/50"
                    : "bg-slate-700/50 border border-slate-600/50 hover:bg-slate-700"
                    }`}
                  onClick={() => toggleUserSelection(user)}
                >
                  <div className="flex-shrink-0">
                    {user.profilePicture ? (
                      <Image
                        alt={user.name || user.username}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center">
                        <span className="text-lg font-medium text-white">{(user.name || user.username || "").charAt(0).toUpperCase()}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-medium">{user.name || user.username}</h4>
                    {user.age !== null && (
                      <p className="text-xs text-white/60">{user.age} éves</p>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    {selectedUsers.some(u => u.id === user.id) ? (
                      <CheckCircle className="h-6 w-6 text-blue-400" />
                    ) : (
                      <Plus className="h-6 w-6 text-white/60" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-white/60">
            {searchTerm ? "Nincs találat a keresési feltételeknek megfelelően" : "Nincs meghívható felhasználó a korhatáron belül"}
          </div>
        )}

        {selectedUsers.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Kiválasztott felhasználók ({selectedUsers.length})</h3>
            <div className="flex flex-wrap gap-2">
              {selectedUsers.map(user => (
                <div
                  key={user.id}
                  className="bg-blue-600/30 border border-blue-500/50 rounded-full px-3 py-1 flex items-center gap-2"
                >
                  <span>{user.name || user.username}</span>
                  {user.age !== null && <span className="text-xs text-white/60">({user.age})</span>}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleUserSelection(user);
                    }}
                    className="text-white/70 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            Mégse
          </button>
          <button
            onClick={sendInvitations}
            disabled={selectedUsers.length === 0 || isSending}
            className={`px-6 py-2 rounded-lg transition-colors flex items-center gap-2 ${selectedUsers.length === 0 || isSending
              ? "bg-blue-600/50 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
              }`}
          >
            {isSending ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Küldés...</span>
              </>
            ) : (
              <>
                <Mail className="h-4 w-4" />
                <span>Meghívók küldése</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};


const SportEventDetailsModal = ({
  event,
  onClose,
  onParticipantUpdate,
  isArchived = false,
  isInvitation = false,
  isPending = false,
  onAcceptInvitation,
  onRejectInvitation,
  onCancelPendingRequest

}) => {
  return (
    <EventModal
      event={event}
      onClose={onClose}
      onParticipantUpdate={onParticipantUpdate}
      isArchived={isArchived}
      isInvitation={isInvitation}
      onAcceptInvitation={onAcceptInvitation}
      onRejectInvitation={onRejectInvitation}
    />
  );
};



export default SportEventDetailsModal;