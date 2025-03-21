// Módosítsuk a SportMate komponenst a router használatának kiküszöbölésére

import { useState, useEffect } from "react"
import {
  Search,
  Calendar,
  Users,
  MapPin,
  Clock,
  Filter,
  Heart,
  Car,
  Home,
  DoorOpen,
  Info,
  ChevronRight,
  Loader,
} from "lucide-react"

// Placeholder Image component
const Image = ({ src, alt, className }) => (
  <img src={src || "/api/placeholder/300/200"} alt={alt} className={className} />
)

const SportMateFinder = () => {
  // Új függvény URL paraméterek olvasására
  const getQueryParams = () => {
    const params = new URLSearchParams(window.location.search);
    return {
      telepules: params.get('telepules'),
      sport: params.get('sport')
    };
  };
  
  const [ageRange, setAgeRange] = useState([15, 50])
  const [favorites, setFavorites] = useState([])
  const [selectedSport, setSelectedSport] = useState(null)
  const [selectedLocation, setSelectedLocation] = useState("Budapest")
  const [skillLevel, setSkillLevel] = useState(null)
  const [showFilters, setShowFilters] = useState(false)
  const [expandedDescriptions, setExpandedDescriptions] = useState([])
  const [facilityFilters, setFacilityFilters] = useState({
    fedett: false,
    oltozo: false,
    parkolas: false,
  })
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Inicializálás URL paraméterekből
  useEffect(() => {
    const { telepules, sport } = getQueryParams();
    
    // Update selected location and sport from query parameters if they exist
    if (telepules) {
      setSelectedLocation(decodeURIComponent(telepules));
    }
    
    if (sport) {
      setSelectedSport(decodeURIComponent(sport));
    }
  }, []);

  // Fetch events from API
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError(null);
      try {
        // Use query params or defaults
        const sportParam = selectedSport || "Kosárlabda"; // Default to Kosárlabda if no sport selected
        const locationParam = selectedLocation || "Budapest"; // Default to Budapest if no location selected
        
        // Build the API URL using the filtered parameters
        const apiUrl = `http://localhost:8081/api/v1/getEsemenyek/${encodeURIComponent(locationParam)}/${encodeURIComponent(sportParam)}`;
        
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }
        
        const data = await response.json();
        setEvents(data.events || []);
      } catch (err) {
        console.error("Failed to fetch events:", err);
        setError("Nem sikerült betölteni az eseményeket. Kérjük, próbálja újra később.");
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if we have both parameters or if we're using defaults
    if (selectedLocation || selectedSport) {
      fetchEvents();
    }
  }, [selectedSport, selectedLocation]);

  // URL frissítése a filterek változásakor - browser API-t használva
  const updateURL = () => {
    const url = new URL(window.location);
    
    if (selectedLocation) {
      url.searchParams.set('telepules', selectedLocation);
    } else {
      url.searchParams.delete('telepules');
    }
    
    if (selectedSport) {
      url.searchParams.set('sport', selectedSport);
    } else {
      url.searchParams.delete('sport');
    }
    
    // Update URL without causing a full page reload
    window.history.pushState({}, '', url);
  };

  // Keresőgomb kezelése
  const handleSearch = () => {
    updateURL();
    setLoading(true);
    // Újra betöltjük az adatokat (az előző useEffect le fogja kezelni)
  };

  const toggleFavorite = (id) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  const toggleDescription = (id) => {
    setExpandedDescriptions((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  const toggleFacilityFilter = (key) => {
    setFacilityFilters((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const sportok = [
    { id: 1, nev: "Foci" },
    { id: 2, nev: "Kosárlabda" },
    { id: 3, nev: "Tenisz" },
    { id: 4, nev: "Röplabda" },
    { id: 5, nev: "Úszás" },
    { id: 6, nev: "Futás" },
  ]

  const szintek = ["kezdő", "középhaladó", "haladó", "profi"]

  // Format date to Hungarian format
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("hu-HU", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "short",
    })
  }

  // Format time from date
  const formatTime = (dateString) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleTimeString("hu-HU", {
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch (error) {
      return "N/A"
    }
  }

  // Check if facility is available
  const isFacilityAvailable = (event, facility) => {
    if (!event.Helyszin) return false
    
    switch (facility) {
      case "fedett":
        return event.Helyszin.Fedett === true
      case "oltozo":
        return event.Helyszin.Oltozo === true
      case "parkolas":
        return event.Helyszin.Parkolas === "y" || event.Helyszin.Parkolas === true
      default:
        return false
    }
  }

  // Filter events based on facility filters
  const filteredEvents = events.filter((event) => {
    if (facilityFilters.fedett && !isFacilityAvailable(event, "fedett")) return false
    if (facilityFilters.oltozo && !isFacilityAvailable(event, "oltozo")) return false
    if (facilityFilters.parkolas && !isFacilityAvailable(event, "parkolas")) return false
    return true
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 to-zinc-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2 text-center">SportMate - Találj Sporttársakat</h1>
        
        {/* Display active filters */}
        {(selectedLocation || selectedSport) && (
          <div className="mb-6 text-center">
            <p className="text-white/70">
              Szűrés: {selectedLocation && `Település: ${selectedLocation}`} 
              {selectedLocation && selectedSport && ' | '}
              {selectedSport && `Sport: ${selectedSport}`}
            </p>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Search Filters Sidebar */}
          <div className="w-full lg:w-80 flex-shrink-0">
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-lg p-6 sticky top-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Keresés</h2>
                <button
                  className="lg:hidden flex items-center gap-1 text-sm"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="h-4 w-4" />
                  {showFilters ? "Szűrők elrejtése" : "Szűrők mutatása"}
                </button>
              </div>

              <div className={`space-y-6 ${showFilters ? "block" : "hidden lg:block"}`}>
                {/* Location Input */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Budapest"
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full pl-10 py-2 bg-white/5 border border-white/10 rounded-md text-white placeholder:text-white/40 focus:border-white/30 focus:ring-white/20 focus:outline-none"
                  />
                </div>

                {/* Sport Selection */}
                <div>
                  <label className="block text-sm font-medium mb-2">Sportág</label>
                  <div className="grid grid-cols-2 gap-2">
                    {sportok.map((sport) => (
                      <button
                        key={sport.id}
                        onClick={() => setSelectedSport(sport.nev)}
                        className={`py-2 px-3 text-sm rounded-md transition-colors ${
                          selectedSport === sport.nev
                            ? "bg-blue-600 text-white"
                            : "bg-white/5 hover:bg-white/10 text-white/80"
                        }`}
                      >
                        {sport.nev}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Apply Filters Button */}
                <button 
                  onClick={handleSearch}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                >
                  Szűrők alkalmazása
                </button>

                {/* Rest of the filters remaining the same */}
                {/* Skill Level */}
                <div>
                  <label className="block text-sm font-medium mb-2">Szint</label>
                  <div className="grid grid-cols-2 gap-2">
                    {szintek.map((szint) => (
                      <button
                        key={szint}
                        onClick={() => setSkillLevel(skillLevel === szint ? null : szint)}
                        className={`py-2 px-3 text-sm rounded-md transition-colors ${
                          skillLevel === szint
                            ? "bg-blue-600 text-white"
                            : "bg-white/5 hover:bg-white/10 text-white/80"
                        }`}
                      >
                        {szint}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Facility Filters */}
                <div>
                  <label className="block text-sm font-medium mb-2">Létesítmény</label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={facilityFilters.fedett}
                        onChange={() => toggleFacilityFilter("fedett")}
                        className="rounded border-white/30 bg-white/5 text-blue-500 focus:ring-white/20"
                      />
                      <span className="text-white/80 group-hover:text-white transition-colors flex items-center gap-1">
                        <Home className="h-4 w-4" /> Fedett létesítmény
                      </span>
                    </label>

                    <label className="flex items-center space-x-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={facilityFilters.oltozo}
                        onChange={() => toggleFacilityFilter("oltozo")}
                        className="rounded border-white/30 bg-white/5 text-blue-500 focus:ring-white/20"
                      />
                      <span className="text-white/80 group-hover:text-white transition-colors flex items-center gap-1">
                        <DoorOpen className="h-4 w-4" /> Öltöző
                      </span>
                    </label>

                    <label className="flex items-center space-x-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={facilityFilters.parkolas}
                        onChange={() => toggleFacilityFilter("parkolas")}
                        className="rounded border-white/30 bg-white/5 text-blue-500 focus:ring-white/20"
                      />
                      <span className="text-white/80 group-hover:text-white transition-colors flex items-center gap-1">
                        <Car className="h-4 w-4" /> Parkolási lehetőség
                      </span>
                    </label>
                  </div>
                </div>

                {/* Date Range */}
                <div>
                  <label className="block text-sm font-medium mb-2">Időpont</label>
                  <div className="space-y-2">
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-4 w-4" />
                      <input
                        type="text"
                        placeholder="Kezdő dátum"
                        className="w-full pl-10 py-2 bg-white/5 border border-white/10 rounded-md text-white placeholder:text-white/40 focus:border-white/30 focus:ring-white/20 focus:outline-none"
                      />
                    </div>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-4 w-4" />
                      <input
                        type="text"
                        placeholder="Záró dátum"
                        className="w-full pl-10 py-2 bg-white/5 border border-white/10 rounded-md text-white placeholder:text-white/40 focus:border-white/30 focus:ring-white/20 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Age Range */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Életkor: {ageRange[0]} - {ageRange[1]} év
                  </label>
                  <div className="relative pt-2">
                    <input
                      type="range"
                      min="15"
                      max="70"
                      value={ageRange[1]}
                      onChange={(e) => setAgeRange([ageRange[0], Number.parseInt(e.target.value)])}
                      className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                    <div className="text-white/60 text-sm mt-2 flex justify-between">
                      <span>{ageRange[0]} év</span>
                      <span>{ageRange[1]} év</span>
                    </div>
                  </div>
                </div>

                {/* Create Event Button */}
                <button className="w-full py-2 bg-white/20 hover:bg-white/30 text-white rounded-md transition-colors flex items-center justify-center gap-2">
                  <span>Új esemény létrehozása</span>
                </button>
              </div>
            </div>
          </div>

          {/* Search Results */}
          <div className="flex-1">
            {loading ? (
              <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-lg p-8 text-center">
                <Loader className="h-8 w-8 animate-spin mx-auto text-blue-400" />
                <p className="mt-4">Események betöltése...</p>
              </div>
            ) : error ? (
              <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-lg p-8 text-center">
                <p className="text-red-400 text-lg">{error}</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Újra próbálkozás
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredEvents.length === 0 ? (
                  <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-lg p-8 text-center">
                    <p className="text-lg">Nincs a keresési feltételeknek megfelelő esemény.</p>
                    <p className="text-white/60 mt-2">
                      {selectedLocation && selectedSport ? 
                        `Nem találtunk eseményeket "${selectedLocation}" településen "${selectedSport}" sportágban.` : 
                        "Próbáld módosítani a szűrőket vagy hozz létre egy új eseményt."}
                    </p>
                  </div>
                ) : (
                  filteredEvents.map((event) => (
                    <div
                      key={event.id}
                      className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-lg overflow-hidden hover:border-white/40 transition-all duration-300"
                    >
                      <div className="flex flex-col md:flex-row">
                        <div className="w-full md:w-72 relative">
                          <Image
                            src={event.imageUrl}
                            alt={event.Sportok?.Nev || "Sport esemény"}
                            className="w-full h-48 md:h-full object-cover"
                          />
                          <div className="absolute top-0 left-0 bg-blue-600 text-white px-3 py-1 rounded-br-lg font-medium">
                            {event.Sportok?.Nev || selectedSport || "Sport"}
                          </div>
                          <button
                            onClick={() => toggleFavorite(event.id)}
                            className="absolute top-4 right-4 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors"
                          >
                            <Heart
                              className={`h-5 w-5 transition-colors ${
                                favorites.includes(event.id) ? "fill-red-500 text-red-500" : ""
                              }`}
                            />
                          </button>
                        </div>

                        <div className="flex-1 p-6">
                          <div className="flex flex-col md:flex-row justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-xl font-bold">{event.Helyszin?.Nev || "Helyszín"}</h3>
                                <span className="px-2 py-0.5 bg-white/10 text-white/80 rounded text-xs">
                                  {event.szint || "Ismeretlen szint"}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 mt-1 text-white/60">
                                <MapPin className="h-4 w-4 flex-shrink-0" />
                                <span>
                                  {event.Helyszin?.Telepules || selectedLocation || "Város"}, {event.Helyszin?.Cim || "Cím"}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 mt-1 text-white/60">
                                <Calendar className="h-4 w-4 flex-shrink-0" />
                                <span>{formatDate(event.kezdoIdo)}</span>
                              </div>

                              <div className="flex items-center gap-2 mt-1 text-white/60">
                                <Clock className="h-4 w-4 flex-shrink-0" />
                                <span>
                                  {formatTime(event.kezdoIdo)} - {formatTime(event.zaroIdo)}
                                </span>
                              </div>
                            </div>

                            <div className="text-right mt-4 md:mt-0">
                              <div className="inline-flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full">
                                <Users className="h-4 w-4" />
                                <span>
                                  {event.resztvevok || 0}/{event.maxResztvevok || 10} résztvevő
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2 mt-4">
                            {isFacilityAvailable(event, "fedett") && (
                              <span className="px-2 py-1 bg-white/10 rounded-full text-xs flex items-center gap-1">
                                <Home className="h-3 w-3" /> Fedett
                              </span>
                            )}
                            {isFacilityAvailable(event, "oltozo") && (
                              <span className="px-2 py-1 bg-white/10 rounded-full text-xs flex items-center gap-1">
                                <DoorOpen className="h-3 w-3" /> Öltöző
                              </span>
                            )}
                            {isFacilityAvailable(event, "parkolas") && (
                              <span className="px-2 py-1 bg-white/10 rounded-full text-xs flex items-center gap-1">
                                <Car className="h-3 w-3" /> Parkolás
                              </span>
                            )}
                          </div>

                          <div className="mt-4">
                            <div
                              className={`${
                                expandedDescriptions.includes(event.id)
                                  ? ""
                                  : "line-clamp-2"
                              } text-white/80`}
                            >
                              {event.leiras || "Nincs megadott leírás."}
                            </div>

                            <button
                              onClick={() => toggleDescription(event.id)}
                              className="mt-2 text-blue-400 hover:text-blue-300 transition-colors text-sm inline-flex items-center"
                            >
                              {expandedDescriptions.includes(event.id)
                                ? "Kevesebb"
                                : "Tovább"}
                              <ChevronRight
                                className={`h-4 w-4 transition-transform ${
                                  expandedDescriptions.includes(event.id)
                                    ? "rotate-90"
                                    : ""
                                }`}
                              />
                            </button>
                          </div>

                          <div className="mt-6 flex justify-between items-center">
                            <div className="text-white/60 text-sm">
                              Ár: {event.ar ? `${event.ar} Ft` : "Ingyenes"}
                            </div>
                            <button className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors">
                              Részletek
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SportMateFinder;