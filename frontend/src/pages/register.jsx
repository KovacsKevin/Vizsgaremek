import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate

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
  const navigate = useNavigate(); // Initialize navigate function

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
      console.log(data); // 🔹 Console log a válasz megjelenítéséhez
  
      if (data.success) {
        setSuccess("Sikeres regisztráció!");
        navigate("/login"); // 🔹 Navigálás a login oldalra
      } else {
        setError(data.message || "Hiba történt a regisztráció során!");
      }
    } catch (err) {
      setError("Nem sikerült csatlakozni a szerverhez!");
      console.error(err); // 🔹 Console log a hibaüzenethez
    }
  };
  
  

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-4">Create an account</h1>
        {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
        {success && <div className="text-green-500 text-sm mb-2">{success}</div>}
        <form className="space-y-4" onSubmit={handleRegister}>
          <div>
            <label className="block text-sm font-medium text-gray-900">Felhasználónév</label>
            <input
              type="text"
              className="w-full p-2 border rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Felhasználónév"
              value={felhasznalonev}
              onChange={(e) => setFelhasznalonev(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">Email</label>
            <input
              type="email"
              className="w-full p-2 border rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">Jelszó</label>
            <input
              type="password"
              className="w-full p-2 border rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
              placeholder="••••••••"
              value={jelszo}
              onChange={(e) => setJelszo(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">Telefonszám</label>
            <input
              type="tel"
              className="w-full p-2 border rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
              placeholder="+36201234567"
              value={telefonszam}
              onChange={(e) => setTelefonszam(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">Családnév</label>
            <input
              type="text"
              className="w-full p-2 border rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Családnév"
              value={csaladnev}
              onChange={(e) => setCsaladnev(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">Keresztnév</label>
            <input
              type="text"
              className="w-full p-2 border rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Keresztnév"
              value={keresztnev}
              onChange={(e) => setKeresztnev(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">Születési dátum</label>
            <input
              type="date"
              className="w-full p-2 border rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
              value={szuletesiDatum}
              onChange={(e) => setSzuletesiDatum(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="w-full text-white bg-blue-600 hover:bg-blue-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center">
            Sign up
          </button>
          <p className="text-sm text-gray-500 text-center">
            Already have an account? <a href="/login" className="text-blue-500 hover:underline">Sign in</a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
