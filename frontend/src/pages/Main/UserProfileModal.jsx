import { useState, useEffect } from "react";
import { X, User, Mail, Phone } from "lucide-react";
import { Image, getCookie } from "../sport-event-details-modal";

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

  export default UserProfileModal;