import { useState, useEffect, useRef } from "react";
import { Search, Users } from "lucide-react";

const SearchForm = () => {
  // Location states
  const [locations, setLocations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const locationInputRef = useRef(null);

  // Sports states
  const [sports, setSports] = useState([]);
  const [sportSearchTerm, setSportSearchTerm] = useState("");
  const [showSportSuggestions, setShowSportSuggestions] = useState(false);
  const [filteredSports, setFilteredSports] = useState([]);
  const sportInputRef = useRef(null);

  // Fetch locations from API
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch("http://localhost:8081/api/v1/allHelyszin");
        const data = await response.json();
        
        // Extract unique settlement names
        const uniqueSettlements = [...new Set(
          data.helyszinek.map(location => location.Telepules)
        )];
        
        setLocations(uniqueSettlements);
      } catch (error) {
        console.error("Error fetching locations:", error);
      }
    };

    fetchLocations();
  }, []);

  // Fetch sports from API
  useEffect(() => {
    const fetchSports = async () => {
      try {
        const response = await fetch("http://localhost:8081/api/v1/allSportok");
        const data = await response.json();
        
        // Extract sport names from the API response
        if (data && Array.isArray(data.sportok)) {
          // Get the "Nev" field from each sport object
          const sportNames = data.sportok.map(sport => sport.Nev);
          setSports(sportNames);
        }
      } catch (error) {
        console.error("Error fetching sports:", error);
      }
    };

    fetchSports();
  }, []);

  // Handle location input change
  const handleLocationInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value.trim() === "") {
      setShowSuggestions(false);
      return;
    }
    
    // Filter locations based on input
    const filtered = locations.filter(location => 
      location.toLowerCase().includes(value.toLowerCase())
    );
    
    setFilteredLocations(filtered);
    setShowSuggestions(true);
  };

  // Handle sport input change
  const handleSportInputChange = (e) => {
    const value = e.target.value;
    setSportSearchTerm(value);
    
    if (value.trim() === "") {
      setShowSportSuggestions(false);
      return;
    }
    
    // Filter sports based on input
    const filtered = sports.filter(sport => 
      sport.toLowerCase().includes(value.toLowerCase())
    );
    
    setFilteredSports(filtered);
    setShowSportSuggestions(true);
  };

  // Handle location suggestion click
  const handleLocationSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
  };

  // Handle sport suggestion click
  const handleSportSuggestionClick = (suggestion) => {
    setSportSearchTerm(suggestion);
    setShowSportSuggestions(false);
  };

  // Handle search button click
  const handleSearchClick = () => {
    // Check if both location and sport are selected
    if (!searchTerm || !sportSearchTerm) {
      alert("Kérjük válassz települést és sportot a kereséshez!");
      return;
    }
    
    // Navigate to the SportMate page with query parameters using browser API
    window.location.href = `/sportmate?telepules=${encodeURIComponent(searchTerm)}&sport=${encodeURIComponent(sportSearchTerm)}`;
  };

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (locationInputRef.current && !locationInputRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
      if (sportInputRef.current && !sportInputRef.current.contains(event.target)) {
        setShowSportSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <section className="py-6">
      <div className="container mx-auto px-4">
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-lg shadow-lg p-6 -mt-20 relative z-20">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2 space-y-2">
              <label htmlFor="destination" className="font-medium text-white/90">
                Válassz települést!
              </label>
              <div className="relative" ref={locationInputRef}>
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-4 w-4" />
                <input
                  id="destination"
                  placeholder="Település neve"
                  className="w-full pl-10 py-2 bg-white/5 border border-white/10 rounded-md text-white placeholder:text-white/40 focus:border-white/30 focus:ring-white/20"
                  value={searchTerm}
                  onChange={handleLocationInputChange}
                  onFocus={() => searchTerm && setShowSuggestions(true)}
                />
                
                {/* Autocomplete suggestions */}
                {showSuggestions && filteredLocations.length > 0 && (
                  <ul className="absolute w-full mt-1 bg-gray-800 border border-white/10 rounded-md shadow-lg max-h-60 overflow-y-auto z-30">
                    {filteredLocations.map((location, index) => (
                      <li 
                        key={index}
                        className="px-4 py-2 hover:bg-white/10 cursor-pointer text-white"
                        onClick={() => handleLocationSuggestionClick(location)}
                      >
                        {location}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="sport" className="font-medium text-white/90">Válassz egy sportot!</label>
              <div className="relative" ref={sportInputRef}>
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-4 w-4" />
                <input
                  id="sport"
                  placeholder="Sport neve"
                  className="w-full pl-10 py-2 bg-white/5 border border-white/10 rounded-md text-white placeholder:text-white/40 focus:border-white/30 focus:ring-white/20"
                  value={sportSearchTerm}
                  onChange={handleSportInputChange}
                  onFocus={() => sportSearchTerm && setShowSportSuggestions(true)}
                />
                
                {/* Sport autocomplete suggestions */}
                {showSportSuggestions && filteredSports.length > 0 && (
                  <ul className="absolute w-full mt-1 bg-gray-800 border border-white/10 rounded-md shadow-lg max-h-60 overflow-y-auto z-30">
                    {filteredSports.map((sport, index) => (
                      <li 
                        key={index}
                        className="px-4 py-2 hover:bg-white/10 cursor-pointer text-white"
                        onClick={() => handleSportSuggestionClick(sport)}
                      >
                        {sport}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="flex items-end">
              <button 
                onClick={handleSearchClick}
                className="w-full py-2 bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/30 rounded-md"
              >
                Keresés
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SearchForm;