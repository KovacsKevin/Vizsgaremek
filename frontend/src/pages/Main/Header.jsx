import React, { useState, useEffect } from "react";
import { Hotel, Plane, Car, Map, LogOut } from "lucide-react";
import { Link, useNavigate } from 'react-router-dom';
import Cookies from "js-cookie";

const Header = ({ activeTab, setActiveTab }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Check if token exists
    const token = Cookies.get("token");
    
    if (token) {
      // Try to get user data from localStorage
      const userData = localStorage.getItem("user");
      
      if (userData) {
        try {
          const user = JSON.parse(userData);
          setUserName(user.name || user.email.split('@')[0]);
          setIsLoggedIn(true);
        } catch (error) {
          console.error("Error parsing user data:", error);
        }
      } else {
        // If no local data, verify token with backend
        verifyToken(token);
      }
    }
  }, []);

  // Function to verify token with backend
  const verifyToken = async (token) => {
    try {
      const response = await fetch("http://localhost:8081/api/v1/login", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setIsLoggedIn(true);
        
        // Extract username from JWT payload or response
        const displayName = data.user.name || data.user.email.split('@')[0];
        setUserName(displayName);
        
        // Save to localStorage for future use
        localStorage.setItem("user", JSON.stringify({
          email: data.user.email,
          name: displayName
        }));
      } else {
        // Token invalid, remove it
        Cookies.remove("token");
      }
    } catch (error) {
      console.error("Error verifying token:", error);
    }
  };

  const handleLogout = () => {
    Cookies.remove("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUserName("");
    navigate("/Homepage");
  };

  return (
    <header className="backdrop-blur-md bg-slate-800/70 border-b border-slate-700/50 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="text-2xl font-bold">Sporthaver</div>
          <div className="hidden md:flex items-center space-x-2">
            {isLoggedIn ? (
              <div className="flex items-center space-x-2">
                <span className="text-white">{userName}</span>
                <button 
                  onClick={handleLogout}
                  className="px-4 py-2 border border-white/20 text-white hover:bg-white/10 rounded flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Kilépés</span>
                </button>
              </div>
            ) : (
              <>
                <button className="px-4 py-2 border border-white/20 text-white hover:bg-white/10 rounded">
                  <Link to="/register">Regisztráció</Link>
                </button>
                <button className="px-4 py-2 bg-white/10 backdrop-blur-md text-white hover:bg-white/20 border border-white/20 rounded">
                  <Link to="/login">Bejelentkezés</Link>
                </button>
              </>
            )}
          </div>
          <button className="md:hidden text-white">
            <span className="sr-only">Open menu</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="container mx-auto px-4 pb-4">
        <div className="flex space-x-4 bg-white/5 backdrop-blur-sm border border-white/10 p-1 rounded-lg">
          {[
            { id: "stays", icon: Hotel, label: "Stays" },
            { id: "flights", icon: Plane, label: "Flights" },
            { id: "cars", icon: Car, label: "Car Rentals" },
            { id: "attractions", icon: Map, label: "Attractions" },
          ].map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              className={`flex items-center gap-2 px-4 py-2 rounded-md ${
                activeTab === id ? "bg-white/10 backdrop-blur-md" : "hover:bg-white/5"
              }`}
              onClick={() => setActiveTab(id)}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};

export default Header;