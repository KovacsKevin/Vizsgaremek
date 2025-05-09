"use client"

import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Header from './Header'
import { Calendar, MapPin, Users, Clock, Plus, Loader, Archive, Mail, Filter } from "lucide-react"
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
  const [archivedEvents, setArchivedEvents] = useState([]) 
  const [invitations, setInvitations] = useState([]) 
  const [pendingEvents, setPendingEvents] = useState([]) 
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeFilter, setActiveFilter] = useState("all") 
  const [refreshData, setRefreshData] = useState(0)
  const [showFilterMenu, setShowFilterMenu] = useState(false) 

  
  const [isEventModalOpen, setIsEventModalOpen] = useState(false)
  const [isHelyszinModalOpen, setIsHelyszinModalOpen] = useState(false)
  const [isSportModalOpen, setIsSportModalOpen] = useState(false)

  
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [isSportEventDetailsModalOpen, setIsSportEventDetailsModalOpen] = useState(false)
  const [isInvitationView, setIsInvitationView] = useState(false)
  const [isPendingView, setIsPendingView] = useState(false) 

 
  const eventModalContent = {
    title: "Új esemény létrehozása",
    description: "Tölts ki minden mezőt az esemény létrehozásához"
  }

  
  const helyszinModalContent = {
    title: "Új helyszín létrehozása",
    description: "Tölts ki minden mezőt a helyszín létrehozásához"
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

  
  const formatShortDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("hu-HU", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
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
          fetch("http://localhost:8081/api/v1/pending-events", { 
            headers: { Authorization: `Bearer ${token}` }

          })
        ]);

       

        
        if (organizedResponse.status === 'fulfilled') {
          if (organizedResponse.value.ok) {
            const data = await organizedResponse.value.json();
            
            setOrganizedEvents(data.events || []);
          } else if (organizedResponse.value.status === 404) {
            
          
            setOrganizedEvents([]);
          } else {
            console.error("Hiba a szervezett események lekérésekor:", organizedResponse.value.status);
            const errorText = await organizedResponse.value.text();
            console.error("Error response:", errorText);
          }
        } else {
          console.error("Organized events request failed:", organizedResponse.reason);
        }

       
        if (participatedResponse.status === 'fulfilled') {
          if (participatedResponse.value.ok) {
            const data = await participatedResponse.value.json();
            
            setParticipatedEvents(data.events || []);
          } else if (participatedResponse.value.status === 404) {
           
          
            setParticipatedEvents([]);
          } else {
            console.error("Hiba a résztvevőként szereplő események lekérésekor:", participatedResponse.value.status);
            const errorText = await participatedResponse.value.text();
            console.error("Error response:", errorText);
          }
        } else {
          console.error("Participated events request failed:", participatedResponse.reason);
        }

       
        if (archivedResponse.status === 'fulfilled') {
          if (archivedResponse.value.ok) {
            const data = await archivedResponse.value.json();
            
            setArchivedEvents(data.events || []);
          } else if (archivedResponse.value.status === 404) {
            
            
            setArchivedEvents([]);
          } else {
            console.error("Hiba az archivált események lekérésekor:", archivedResponse.value.status);
            const errorText = await archivedResponse.value.text();
            console.error("Error response:", errorText);
          }
        } else {
          console.error("Archived events request failed:", archivedResponse.reason);
        }

        
        if (invitationsResponse.status === 'fulfilled') {
          if (invitationsResponse.value.ok) {
            const data = await invitationsResponse.value.json();
            
            setInvitations(data.events || []); 
          } else if (invitationsResponse.value.status === 404) {
           
            
            setInvitations([]);
          } else {
            console.error("Hiba a meghívások lekérésekor:", invitationsResponse.value.status);
            const errorText = await invitationsResponse.value.text();
            console.error("Error response:", errorText);
          }
        } else {
          console.error("Invitations request failed:", invitationsResponse.reason);
        }

       
        if (pendingResponse.status === 'fulfilled') {
          if (pendingResponse.value.ok) {
            const data = await pendingResponse.value.json();
            const pendingEventId = data.events?.[0]?.id;
            
            setPendingEvents(data.events || []);
            sessionStorage.setItem('pendingEventId', pendingEventId);
          } else if (pendingResponse.value.status === 404) {
           
           
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

  
  const filteredEvents = () => {
    if (activeFilter === "organized") return organizedEvents;
    if (activeFilter === "participated") return participatedEvents;
    if (activeFilter === "archived") return archivedEvents;
    if (activeFilter === "invitations") return invitations;
    if (activeFilter === "pending") return pendingEvents; 
   
    return [...organizedEvents, ...participatedEvents];
  }


  const getEventRole = (eventId) => {
 
    if (organizedEvents.some(event => event.id === eventId)) return "szervező";

   
    const archivedEvent = archivedEvents.find(event => event.id === eventId);
    if (archivedEvent && archivedEvent.Résztvevős && archivedEvent.Résztvevős.length > 0) {
      return archivedEvent.Résztvevős[0].szerep;
    }

    return "játékos";
  }


  const getSportName = (event) => {
    
    if (activeFilter === "invitations" || activeFilter === "pending") {
      return event.Sportok?.Nev || "Esemény";
    }
   
    return event.Sportok?.Nev || event.Sport?.Nev || "Esemény";
  }

  
  const getSportImage = (event) => {
   
    if (activeFilter === "invitations" || activeFilter === "pending") {
      if (event.imageUrl) {
        return `http://localhost:8081${event.imageUrl.startsWith('/') ? event.imageUrl : `/${event.imageUrl}`}`;
      }
      return event.Sportok?.KepUrl || "/placeholder.svg";
    }

    
    if (event.imageUrl) {
      return `http://localhost:8081${event.imageUrl.startsWith('/') ? event.imageUrl : `/${event.imageUrl}`}`;
    }
    return event.Sport?.KepUrl || event.Sportok?.KepUrl || "/placeholder.svg";
  }

  
  const getLocationName = (event) => {
    
    if (activeFilter === "invitations" || activeFilter === "pending") {
      return event.Helyszin?.Telepules || "Ismeretlen helyszín";
    }
    
    return event.Helyszin?.Telepules || "Ismeretlen helyszín";
  }

  
  const getEventStartTime = (event) => {
    
    if (activeFilter === "invitations" || activeFilter === "pending") {
      return event.kezdoIdo || new Date().toISOString();
    }
    
    return event.kezdoIdo;
  }

  
  const getEventEndTime = (event) => {
    
    if (activeFilter === "invitations" || activeFilter === "pending") {
      return event.zaroIdo || new Date().toISOString();
    }
    
    return event.zaroIdo;
  }

  
  const getParticipantsCount = (event) => {
   
    if (activeFilter === "invitations" || activeFilter === "pending") {
      
      if (event.resztvevoCount !== undefined) return event.resztvevoCount;
      if (event.résztvevőkSzáma !== undefined) return event.résztvevőkSzáma;
      if (event.resztvevok_lista?.length !== undefined) return event.resztvevok_lista.length;
      if (event.Résztvevős?.length !== undefined) return event.Résztvevős.length;
      return 0; 
    }
    
    if (event.résztvevőkSzáma !== undefined) return event.résztvevőkSzáma;
    if (event.resztvevoCount !== undefined) return event.resztvevoCount;
    return event.resztvevok_lista?.length || 0;
  }

  
  const getMaxParticipants = (event) => {
    
    if (activeFilter === "invitations" || activeFilter === "pending") {
      return event.maximumLetszam || 10; 
    }
   
    return event.maximumLetszam;
  }

  
  const getEventId = (event) => {
    

        
        if (activeFilter === "invitations" || activeFilter === "pending") {
          if (event.eseményId !== undefined) return event.eseményId;
          if (event.esemenyId !== undefined) return event.esemenyId;
          if (event.id !== undefined) return event.id;
        }
    
        
        return event.id;
      }
    
      
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
        
        setIsEventModalOpen(true);
      }
    
      const closeSportModal = () => {
        setIsSportModalOpen(false);
        
        setIsEventModalOpen(true);
      }
    
      
      const openSportEventDetailsModal = (event) => {
        setSelectedEvent(event);
        setIsInvitationView(activeFilter === "invitations");
        setIsPendingView(activeFilter === "pending"); 
        setIsSportEventDetailsModalOpen(true);
      }
    
      const closeSportEventDetailsModal = () => {
        setIsSportEventDetailsModalOpen(false);
        setSelectedEvent(null);
        setIsInvitationView(false);
        setIsPendingView(false); 
      }
    

      const handleParticipantUpdate = (eventId, isJoining, participant) => {
        
    
        
        if (participant.userId === 'event-updated' && participant.eventData) {
         
    
          
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
    
        
        if (participant.userId === 'count-update' && participant.fullParticipantsList) {
          
    
          const updatedCount = participant.fullParticipantsList.length;
    
          
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
    
        
        if (participant.userId && participant.userId !== 'event-updated' && participant.userId !== 'count-update') {
         
    
          
          const updateParticipantCount = (events) => {
            return events.map(event => {
              if (event.id === eventId) {
                
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
    
          
          if (!isJoining && activeFilter === "participated") {
            setRefreshData(prev => prev + 1);
          }
    
          return;
        }
    
        
        
        setRefreshData(prev => prev + 1);
      };
    
      
      const handleHelyszinSuccess = (newLocation) => {
        closeHelyszinModal();
      }
    
      
      const handleAcceptInvitation = async (eventId) => {
        try {
          const token = Cookies.get("token");
          if (!token) {
            navigate("/login");
            return;
          }
    
         
    
          
          if (!eventId) {
            console.error("Invalid event ID:", eventId);
            toast.error("Érvénytelen esemény azonosító");
            return;
          }
    
          const requestBody = { eseményId: eventId };
          
    
          const response = await fetch("http://localhost:8081/api/v1/accept-invitation", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(requestBody)
          });
    
          const responseText = await response.text();
         
    
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
    
            
            setInvitations(prev => prev.filter(inv => getEventId(inv) !== eventId));
    
            
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
    
      
      const handleCancelPendingRequest = async (eventId) => {
        try {
          const token = Cookies.get("token");
          if (!token) {
            navigate("/login");
            return;
          }
    
          
    
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
    
            
            setPendingEvents(prev => prev.filter(event => getEventId(event) !== eventId));
    
           
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
    
      
      const setFilterAndCloseMenu = (filter) => {
        setActiveFilter(filter);
        setShowFilterMenu(false);
      }
    
      return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-800 to-zinc-900 text-white">
          <Header activeTab={activeTab} setActiveTab={setActiveTab} />
    
          <main className="flex-1 container mx-auto px-4 py-8">
            <div className="bg-slate-800/50 backdrop-blur-md rounded-xl p-4 sm:p-6 shadow-xl border border-slate-700/50">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
                  Eseményeim
                </h1>
                {activeFilter !== "archived" && activeFilter !== "invitations" && activeFilter !== "pending" && (
                  <button
                    onClick={openEventModal}
                    className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 rounded-lg transition-all duration-300 shadow-lg hover:shadow-purple-500/20 text-sm sm:text-base"
                  >
                    <Plus size={16} />
                    <span className="hidden sm:inline">Új esemény</span>
                    <span className="sm:hidden">Új</span>
                  </button>
                )}
              </div>
    
             
          <div className="sm:hidden mb-4">
            <button
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className="flex items-center gap-2 px-3 py-2 bg-slate-700/50 rounded-lg text-white w-full"
            >
              <Filter size={16} />
              <span>Szűrés:</span>
              <span className="ml-auto text-xs bg-slate-600 px-2 py-1 rounded-full">
                {activeFilter === "all" && "Összes"}
                {activeFilter === "organized" && "Szervezőként"}
                {activeFilter === "participated" && "Résztvevőként"}
                {activeFilter === "pending" && "Függőben"}
                {activeFilter === "invitations" && "Meghívások"}
                {activeFilter === "archived" && "Archívum"}
              </span>
            </button>
          </div>
    
                
          {showFilterMenu && (
            <div className="sm:hidden mb-4 relative z-10">
              <div className="absolute top-0 left-0 right-0 bg-slate-700 rounded-lg shadow-lg p-2 space-y-1 border border-slate-600">
                <button
                  onClick={() => setFilterAndCloseMenu("all")}
                  className={`px-4 py-2 rounded-md text-left transition-all w-full ${activeFilter === "all" ? "bg-gradient-to-r from-blue-500/20 to-purple-600/20 text-white" : "text-slate-300 hover:bg-white/5"}`}
                >
                  Összes
                </button>
                <button
                  onClick={() => setFilterAndCloseMenu("organized")}
                  className={`px-4 py-2 rounded-md text-left transition-all w-full ${activeFilter === "organized" ? "bg-gradient-to-r from-green-500/20 to-emerald-600/20 text-white" : "text-slate-300 hover:bg-white/5"}`}
                >
                  Szervezőként
                </button>
                <button
                  onClick={() => setFilterAndCloseMenu("participated")}
                  className={`px-4 py-2 rounded-md text-left transition-all w-full ${activeFilter === "participated" ? "bg-gradient-to-r from-blue-500/20 to-cyan-600/20 text-white" : "text-slate-300 hover:bg-white/5"}`}
                >
                  Résztvevőként
                </button>
                <button
                  onClick={() => setFilterAndCloseMenu("pending")}
                  className={`px-4 py-2 rounded-md text-left transition-all w-full ${activeFilter === "pending" ? "bg-gradient-to-r from-yellow-500/20 to-orange-600/20 text-white" : "text-slate-300 hover:bg-white/5"}`}
                >
                  Függőben
                </button>
                <button
                  onClick={() => setFilterAndCloseMenu("invitations")}
                  className={`px-4 py-2 rounded-md text-left transition-all w-full ${activeFilter === "invitations" ? "bg-gradient-to-r from-purple-500/20 to-pink-600/20 text-white" : "text-slate-300 hover:bg-white/5"}`}
                >
                  <Mail size={16} className="inline mr-1" />
                  Meghívásaim
                </button>
                <button
                  onClick={() => setFilterAndCloseMenu("archived")}
                  className={`px-4 py-2 rounded-md text-left transition-all w-full ${activeFilter === "archived" ? "bg-gradient-to-r from-amber-500/20 to-orange-600/20 text-white" : "text-slate-300 hover:bg-white/5"}`}
                >
                  <Archive size={16} className="inline mr-1" />
                  Archívum
                </button>
              </div>
            </div>
          )}
                     
                                
          <div className="hidden sm:grid sm:grid-cols-3 md:grid-cols-6 gap-2 mb-6">
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-4 py-2 rounded-md transition-all text-center ${activeFilter === "all"
                ? "bg-gradient-to-r from-blue-500/20 to-purple-600/20 text-white"
                : "bg-slate-700/30 text-slate-300 hover:bg-white/5"
                }`}
            >
              Összes
            </button>
            <button
              onClick={() => setActiveFilter("organized")}
              className={`px-4 py-2 rounded-md transition-all text-center ${activeFilter === "organized"
                ? "bg-gradient-to-r from-green-500/20 to-emerald-600/20 text-white"
                : "bg-slate-700/30 text-slate-300 hover:bg-white/5"
                }`}
            >
              Szervezőként
            </button>
            <button
              onClick={() => setActiveFilter("participated")}
              className={`px-4 py-2 rounded-md transition-all text-center ${activeFilter === "participated"
                ? "bg-gradient-to-r from-blue-500/20 to-cyan-600/20 text-white"
                : "bg-slate-700/30 text-slate-300 hover:bg-white/5"
                }`}
            >
              Résztvevőként
            </button>
            <button
              onClick={() => setActiveFilter("pending")}
              className={`px-4 py-2 rounded-md transition-all text-center ${activeFilter === "pending"
                ? "bg-gradient-to-r from-yellow-500/20 to-orange-600/20 text-white"
                : "bg-slate-700/30 text-slate-300 hover:bg-white/5"
                }`}
            >
              Függőben
            </button>
            <button
              onClick={() => setActiveFilter("invitations")}
              className={`px-4 py-2 rounded-md transition-all text-center ${activeFilter === "invitations"
                ? "bg-gradient-to-r from-purple-500/20 to-pink-600/20 text-white"
                : "bg-slate-700/30 text-slate-300 hover:bg-white/5"
                }`}
            >
              <Mail size={16} className="inline mr-1" />
              Meghívásaim
            </button>
            <button
              onClick={() => setActiveFilter("archived")}
              className={`px-4 py-2 rounded-md transition-all text-center ${activeFilter === "archived"
                ? "bg-gradient-to-r from-amber-500/20 to-orange-600/20 text-white"
                : "bg-slate-700/30 text-slate-300 hover:bg-white/5"
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
                                 <div className="flex flex-col items-center justify-center py-10 sm:py-16 text-center">
                                   <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-700/50 rounded-full flex items-center justify-center mb-4">
                                     {activeFilter === "archived" ? (
                                       <Archive className="w-8 h-8 sm:w-10 sm:h-10 text-slate-400" />
                                     ) : activeFilter === "invitations" ? (
                                       <Mail className="w-8 h-8 sm:w-10 sm:h-10 text-slate-400" />
                                     ) : activeFilter === "pending" ? (
                                       <Clock className="w-8 h-8 sm:w-10 sm:h-10 text-slate-400" />
                                     ) : (
                                       <Calendar className="w-8 h-8 sm:w-10 sm:h-10 text-slate-400" />
                                     )}
                                   </div>
                                   <h3 className="text-lg sm:text-xl font-semibold mb-2">
                                     {getEmptyStateMessage()}
                                   </h3>
                                   <p className="text-slate-400 max-w-md mb-6 text-sm sm:text-base px-4">
                                     {getEmptyStateDescription()}
                                   </p>
                                   <button
                                     onClick={handleActionButtonClick}
                                     className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 rounded-lg transition-all duration-300 shadow-lg hover:shadow-purple-500/20 text-sm sm:text-base"
                                   >
                                     {getActionButtonText()}
                                   </button>
                                 </div>
                               ) : (
                                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
                                       <div className="h-32 sm:h-40 bg-slate-600 overflow-hidden">
                                         <img
                                           src={getSportImage(event)}
                                           alt={getSportName(event)}
                                           className="w-full h-full object-fill"
                                           onError={(e) => {
                                             console.error(`Kép betöltési hiba: ${activeFilter === "invitations" || activeFilter === "pending" ? event.imageUrl : event.imageUrl}`);
                                             e.target.src = `/placeholder.svg?height=300&width=400&text=Betöltési%20Hiba`;
                                           }}
                                         />
                                       </div>
                     
                                       <div className="p-3 sm:p-4">
                                         <h3 className="text-lg sm:text-xl font-semibold mb-2 truncate">{getSportName(event)}</h3>
                                         <div className="space-y-1 sm:space-y-2 mb-3 sm:mb-4">
                                           <div className="flex items-center text-xs sm:text-sm text-slate-300">
                                             <MapPin size={14} className="mr-1 sm:mr-2 text-slate-400" />
                                             <span className="truncate">{getLocationName(event)}</span>
                                           </div>
                                           
                                           
                                           <div className="sm:hidden flex items-start text-xs text-slate-300">
                                             <Clock size={14} className="mr-1 mt-1 text-slate-400 flex-shrink-0" />
                                             <div className="flex flex-col">
                                               <span>{formatShortDateTime(getEventStartTime(event))}</span>
                                               <span>- {formatShortDateTime(getEventEndTime(event))}</span>
                                             </div>
                                           </div>
                                           
                                           
                                           <div className="hidden sm:flex items-start text-sm text-slate-300">
                                             <Clock size={16} className="mr-2 mt-1 text-slate-400 flex-shrink-0" />
                                             <div className="flex flex-col">
                                               <span className="font-medium text-white/80">Kezdés:</span>
                                               <span>{formatDateTime(getEventStartTime(event))}</span>
                                             </div>
                                           </div>
                                           <div className="hidden sm:flex items-start text-sm text-slate-300">
                                             <Clock size={16} className="mr-2 mt-1 text-slate-400 flex-shrink-0" />
                                             <div className="flex flex-col">
                                               <span className="font-medium text-white/80">Befejezés:</span>
                                               <span>{formatDateTime(getEventEndTime(event))}</span>
                                             </div>
                                           </div>
                                           
                                           <div className="flex items-center text-xs sm:text-sm text-slate-300">
                                             <Users size={14} className="mr-1 sm:mr-2 text-slate-400" />
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
                                             className="px-2 sm:px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-md text-xs sm:text-sm transition-colors"
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
                     
                                 
      <HelyszinModal
        isOpen={isHelyszinModalOpen}
        onClose={closeHelyszinModal}
        modalContent={helyszinModalContent}
        onSuccess={handleHelyszinSuccess}
      />

      
      {isSportEventDetailsModalOpen && selectedEvent && (
        <SportEventDetailsModal
          event={selectedEvent}
          onClose={closeSportEventDetailsModal}
          onParticipantUpdate={handleParticipantUpdate}
          isArchived={activeFilter === "archived"} 
          isInvitation={isInvitationView} 
          isPending={isPendingView} 
          onAcceptInvitation={() => handleAcceptInvitation(getEventId(selectedEvent))}
          onRejectInvitation={() => handleRejectInvitation(getEventId(selectedEvent))}
          onCancelPendingRequest={() => handleCancelPendingRequest(getEventId(selectedEvent))} 
        />
      )}

      
    </div>
  );
};

export default MyEvents;

                     
