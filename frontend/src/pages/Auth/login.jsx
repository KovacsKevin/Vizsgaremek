import React, { useState } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
        const response = await fetch("http://localhost:8081/api/v1/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email: email, password: password }),
        });

        const data = await response.json();

        if (response.ok) {
            Cookies.set("token", data.token, { expires: 1 });
            setSuccess("Sikeres bejelentkezés!");

           
            setTimeout(() => navigate("/Homepage"), 1000);
        } else {
            setError(data.message || "Hiba történt a bejelentkezés során!");
        }
    } catch (err) {
        setError("Hiba történt a bejelentkezés során!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f1729] text-white p-4">
      <div className="w-full max-w-xl bg-[#1a2238] rounded-lg shadow-lg p-10">
        <h1 className="text-3xl font-bold text-center mb-3">Bejelentkezés a fiókodba</h1>
        <p className="text-center text-white/70 mb-8 text-lg">Jelentkezz be a Sporthaver fiókodba</p>
        
        {error && (
          <div className="mb-6 bg-red-500/20 border border-red-500/30 text-white p-4 rounded-md text-base">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-6 bg-green-500/20 border border-green-500/30 text-white p-4 rounded-md text-base">
            {success}
          </div>
        )}
        
        <form className="space-y-6" onSubmit={handleLogin}>
          <div className="space-y-3">
            <label className="block text-white/90 font-medium text-lg">E-mail címed</label>
            <div className="relative">
              <input
                type="email"
                className="w-full py-3 px-4 bg-[#1a2238] border border-[#2a3352] rounded-md text-white text-lg placeholder:text-white/40 focus:border-white/30 focus:ring-white/20"
                placeholder="nev@ceg.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="space-y-3">
            <label className="block text-white/90 font-medium text-lg">Jelszó</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full py-3 px-4 bg-[#1a2238] border border-[#2a3352] rounded-md text-white text-lg placeholder:text-white/40 focus:border-white/30 focus:ring-white/20"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button 
                type="button"
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/70 hover:text-white/90 text-xl"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          
          <button 
            type="submit" 
            className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors font-medium text-lg mt-4"
          >
            Bejelentkezés
          </button>
          
          <p className="text-base text-white/70 text-center mt-4">
            Még nincs fiókod? <a href="/register" className="text-purple-400 hover:text-purple-300 transition-colors">Regisztrálj</a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
