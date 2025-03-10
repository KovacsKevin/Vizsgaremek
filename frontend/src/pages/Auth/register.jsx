import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [felhasznalonev, setFelhasznalonev] = useState("");
  const [email, setEmail] = useState("");
  const [jelszo, setJelszo] = useState("");
  const [telefonszam, setTelefonszam] = useState("");
  const [csaladnev, setCsaladnev] = useState("");
  const [keresztnev, setKeresztnev] = useState("");
  const [szuletesiDatum, setSzuletesiDatum] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
  
    try {
      const response = await fetch("http://localhost:8081/api/v1/addUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Felhasznalonev: felhasznalonev,
          Email: email,
          Jelszo: jelszo,
          Telefonszam: telefonszam,
          Csaladnev: csaladnev,
          Keresztnev: keresztnev,
          Szuletesi_datum: szuletesiDatum,
        }),
      });
  
      const data = await response.json();
      console.log(data);
  
      if (data.success) {
        setSuccess("Sikeres regisztráció!");
        navigate("/login");
      } else {
        setError(data.message || "Hiba történt a regisztráció során!");
      }
    } catch (err) {
      setError("Nem sikerült csatlakozni a szerverhez!");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-800 to-zinc-900 text-white p-4">
      <div className="w-full max-w-md backdrop-blur-xl bg-white/10 border border-white/20 rounded-lg shadow-lg p-6 my-8">
        <h1 className="text-2xl font-bold text-center mb-6">Create an account</h1>
        
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
        
        <form className="space-y-4" onSubmit={handleRegister}>
          <div className="space-y-2">
            <label className="block text-white/90 font-medium">Felhasználónév</label>
            <input
              type="text"
              className="w-full py-2 px-3 bg-white/5 border border-white/10 rounded-md text-white placeholder:text-white/40 focus:border-white/30 focus:ring-white/20"
              placeholder="Felhasználónév"
              value={felhasznalonev}
              onChange={(e) => setFelhasznalonev(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-white/90 font-medium">Email</label>
            <input
              type="email"
              className="w-full py-2 px-3 bg-white/5 border border-white/10 rounded-md text-white placeholder:text-white/40 focus:border-white/30 focus:ring-white/20"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-white/90 font-medium">Jelszó</label>
            <input
              type="password"
              className="w-full py-2 px-3 bg-white/5 border border-white/10 rounded-md text-white placeholder:text-white/40 focus:border-white/30 focus:ring-white/20"
              placeholder="••••••••"
              value={jelszo}
              onChange={(e) => setJelszo(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-white/90 font-medium">Telefonszám</label>
            <input
              type="tel"
              className="w-full py-2 px-3 bg-white/5 border border-white/10 rounded-md text-white placeholder:text-white/40 focus:border-white/30 focus:ring-white/20"
              placeholder="+36201234567"
              value={telefonszam}
              onChange={(e) => setTelefonszam(e.target.value)}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-white/90 font-medium">Családnév</label>
              <input
                type="text"
                className="w-full py-2 px-3 bg-white/5 border border-white/10 rounded-md text-white placeholder:text-white/40 focus:border-white/30 focus:ring-white/20"
                placeholder="Családnév"
                value={csaladnev}
                onChange={(e) => setCsaladnev(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-white/90 font-medium">Keresztnév</label>
              <input
                type="text"
                className="w-full py-2 px-3 bg-white/5 border border-white/10 rounded-md text-white placeholder:text-white/40 focus:border-white/30 focus:ring-white/20"
                placeholder="Keresztnév"
                value={keresztnev}
                onChange={(e) => setKeresztnev(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block text-white/90 font-medium">Születési dátum</label>
            <input
              type="date"
              className="w-full py-2 px-3 bg-white/5 border border-white/10 rounded-md text-white placeholder:text-white/40 focus:border-white/30 focus:ring-white/20"
              value={szuletesiDatum}
              onChange={(e) => setSzuletesiDatum(e.target.value)}
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="w-full py-3 mt-2 bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/30 rounded-md transition-colors font-medium"
          >
            Sign up
          </button>
          
          <p className="text-sm text-white/70 text-center">
            Already have an account? <a href="/login" className="text-white hover:text-white/90 transition-colors">Sign in</a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;