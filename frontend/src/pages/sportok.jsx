import React, { useEffect, useState } from "react";
import { Button } from "flowbite-react";

const SportList = () => {
  const [sports, setSports] = useState([]);
  const [openIndex, setOpenIndex] = useState(null); // Track the currently open panel index

  useEffect(() => {
    // API hívás a sportok lekérésére
    const fetchSports = async () => {
      try {
        const response = await fetch("http://localhost:8081/api/v1/allSportok");
        const data = await response.json();
        setSports(data.sportok);  // Feltételezzük, hogy a válaszban a sportok és azok képeik szerepelnek
      } catch (error) {
        console.error("Hiba a sportok betöltésekor:", error);
      }
    };

    fetchSports();
  }, []);

  const handleAccordionClick = (index) => {
    // Toggle open/close of the clicked panel
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-8">Famous Sports</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {sports.slice(0, 20).map((sport, index) => (
          <div
            className="bg-white p-4 rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300"
            key={sport.id}
          >
            {/* Kép megjelenítése */}
            {sport.KepUrl ? (
              <img
                src={sport.KepUrl}
                alt={sport.Nev}
                className="w-full h-40 object-cover rounded-lg mb-4"
              />
            ) : (
              <div className="w-full h-40 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                <span className="text-gray-500">No image available</span>
              </div>
            )}

            <h3 className="text-xl font-semibold mb-4">{sport.Nev}</h3>

            {/* Sign Up Button */}
            <Button color="blue" className="w-full mb-4">
              Sign Up
            </Button>

            {/* Accordion for Description */}
            <div>
              <Button
                className="w-full mb-4"
                onClick={() => handleAccordionClick(index)} // Handle click to toggle description
              >
                {openIndex === index ? "Hide Description" : "Show Description"}
              </Button>

              {/* Show description only if this panel is open */}
              {openIndex === index && (
                <div className="p-4 bg-gray-100 rounded-lg mb-4">
                  <p>{sport.Leiras}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SportList;
