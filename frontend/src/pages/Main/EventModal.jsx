import { useState, useEffect } from "react";
import {
  X, MapPin, Calendar, Clock, Users, Home, DoorOpen, Car, User, CheckCircle, XCircle, Trash, Edit, Plus, Archive,
  Mail, Phone, AlertTriangle, Map
} from "lucide-react";
import { Image, getCookie, getCurrentUser } from "../sport-event-details-modal";
import UserProfileModal from "./UserProfileModal";
import LocationMapModal from "./LocationMapModal";
import InviteUsersModal from "./InviteUsersModal";
import EventEditModal from "./EventEditModal";
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
    const [userStatus, setUserStatus] = useState(null) 
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
        
        const response = await fetch(`http://localhost:8081/api/v1/events/${eventId}/participants`);
  
        if (response.ok) {
          const data = await response.json();
          
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
            
            fetchParticipants(currentEvent.id);
            return;
          }
  
          console.error("Server error during join:", responseData.message);
          return;
        }
  
       
  
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
  
      
      const eventId = currentEvent.id;
  
      
  
      if (!eventId) {
        console.error("No event ID found to cancel");
        setCancelError("Nem található esemény azonosító");
        setIsCancelling(false);
        return;
      }
  
      try {
        const token = getCookie('token');
  
        
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
  
        
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Hiba történt a kérelem visszavonása közben');
        }
  
        
        const pendingEvents = JSON.parse(sessionStorage.getItem('pendingEvents') || '[]');
        const updatedEvents = pendingEvents.filter(id => id !== eventId);
        sessionStorage.setItem('pendingEvents', JSON.stringify(updatedEvents));
  
        
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
  
        
  
       
        setIsParticipant(false);
        setUserStatus('elutasítva');
  
        
        if (onParticipantUpdate && currentUser) {
          onParticipantUpdate(currentEvent.id, false, {
            userId: currentUser.userId,
            status: 'elutasítva',
            updateParticipantCount: true
          });
        }
  
        
        if (typeof onRejectInvitation === 'function') {
          onRejectInvitation();
        }
  
       
        onClose();
  
        
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
      
  
      
      setCurrentEvent({
        ...updatedEvent,
        resztvevok_lista: participants
      });
  
      
      closeEditModal();
  
      
      if (onParticipantUpdate) {
        onParticipantUpdate(updatedEvent.id, true, {
          userId: 'event-updated',
          eventData: {
            ...updatedEvent,
            resztvevok_lista: participants
          }
        });
      }
  
      
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
  
        
        const response = await fetch(`http://localhost:8081/api/v1/getUser/${participant.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
  
        if (!response.ok) {
          throw new Error("Nem sikerült lekérni a felhasználói adatokat");
        }
  
        const userData = await response.json();
  
        
        const statsResponse = await fetch(`http://localhost:8081/api/v1/user-stats/${participant.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
  
        let stats = { createdEvents: 0, participatedEvents: 0 };
        if (statsResponse.ok) {
          stats = await statsResponse.json();
        }
  
        
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
          <div className="relative w-full max-w-6xl max-h-[90vh] bg-gradient-to-br from-slate-800 to-zinc-900 rounded-lg shadow-xl flex flex-col">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
            >
              <X className="h-5 w-5" />
            </button>
            
            
            <div className="flex-1 overflow-auto custom-scrollbar">
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
                    
                    <div className="flex-1 space-y-3">
                      <h2 className="text-2xl font-bold mb-4 text-white">{currentEvent.Helyszin?.Nev || "Helyszín"}</h2>
    
                      
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
    
                   
                    <div className="w-full md:w-1/3 p-4 rounded-lg">
                      
                      <div className="space-y-3 md:mt-10"> 
                        
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
                      <h4 className="text-lg font-semibold mb-3 border-b border-white/20 pb-2 text-white">
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
                                <h4 className="font-medium text-white">
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
                                  <h4 className="font-medium text-white">
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
                                  <h4 className="font-medium text-white">
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
            
            
            <div className="sticky bottom-0 w-full bg-gradient-to-r from-slate-900 to-zinc-900 border-t border-white/10 p-4 shadow-lg">
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
                      {userStatus === "függőben" ? (
                        <div className="w-full flex flex-col sm:flex-row gap-3">
                          <button
                            className="flex-1 px-4 py-2.5 bg-amber-600 text-white rounded-md cursor-not-allowed text-center font-medium"
                            disabled
                          >
                            Kérelem elküldve
                          </button>
                          <button
                            onClick={handleCancelRequest}
                            className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors text-center font-medium whitespace-nowrap"
                          >
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
export default EventModal;


