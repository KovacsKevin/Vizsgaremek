import React, { useState } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

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
            
            
            localStorage.setItem("user", JSON.stringify({
                email: email,
                
                ...(data.user && { name: data.user.name }),
                ...(data.userName && { name: data.userName })
            }));
            
            setSuccess("Sikeres bejelentkezés!");

            setTimeout(() => navigate("/"), 1000);
        } else {
            setError(data.message || "Hiba történt a bejelentkezés során!");
        }
    } catch (err) {
        setError("Hiba történt a bejelentkezés során!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-800 to-zinc-900 text-white p-4">
      <div className="w-full max-w-md backdrop-blur-xl bg-white/10 border border-white/20 rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Bejelentkezés a fiókodba</h1>
        
        {error && (
          <div className="mb-4 backdrop-blur-md bg-red-500/20 border border-red-500/30 text-white p-3 rounded-md text-sm">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 backdrop-blur-md bg-green-500/20 border border-green-500/30 text-white p-3 rounded-md text-sm">
            {success}
          </div>
        )}
        
        <form className="space-y-5" onSubmit={handleLogin}>
          <div className="space-y-2">
            <label className="block text-white/90 font-medium">E-mail címed</label>
            <div className="relative">
              <input
                type="email"
                className="w-full py-2 px-3 bg-white/5 border border-white/10 rounded-md text-white placeholder:text-white/40 focus:border-white/30 focus:ring-white/20"
                placeholder="nev@ceg.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block text-white/90 font-medium">Jelszó</label>
            <div className="relative">
              <input
                type="password"
                className="w-full py-2 px-3 bg-white/5 border border-white/10 rounded-md text-white placeholder:text-white/40 focus:border-white/30 focus:ring-white/20"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          
          <button 
            type="submit" 
            className="w-full py-3 bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/30 rounded-md transition-colors font-medium"
          >
            Bejelentkezés
          </button>
          
          <p className="text-sm text-white/70 text-center">
            Még nincs fiókod? <a href="/register" className="text-white hover:text-white/90 transition-colors">Regisztrálj</a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;