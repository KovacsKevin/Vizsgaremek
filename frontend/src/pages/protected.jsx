import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom"; // Redirect user if unauthorized

const Protected = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = Cookies.get("token");

    if (!token) {
      setError("Nincs jogosultságod az oldal megtekintéséhez!");
      setTimeout(() => navigate("/login"), 2000); // Redirect after 2 seconds
      return;
    }

    // Validate token with backend
    const fetchProtectedData = async () => {
      try {
        const response = await fetch("http://localhost:8081/api/v1/protected", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`, // Send token in Authorization header
          },
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Hiba történt az adatok lekérésekor!");
          setTimeout(() => navigate("/login"), 2000);
        } else {
          setUser(data.user); // Store user details from response
        }
      } catch (err) {
        setError("Hiba történt az adatok lekérésekor!");
        setTimeout(() => navigate("/login"), 2000);
      }
    };

    fetchProtectedData();
  }, [navigate]);

  if (error) return <div className="text-red-500 text-center mt-5">{error}</div>;
  if (!user) return <div className="text-center mt-5">Betöltés...</div>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow p-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Védett Oldal</h1>
        <p className="text-gray-600 mt-2">Üdvözöllek, <strong>{user.email}</strong>!</p>
      </div>
    </div>
  );
};

export default Protected;
