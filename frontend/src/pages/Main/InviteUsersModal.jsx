import { useState, useEffect } from "react";
import { X, CheckCircle, Plus, Mail } from "lucide-react";
import { Image, getCookie } from "../sport-event-details-modal";





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
  export default InviteUsersModal;