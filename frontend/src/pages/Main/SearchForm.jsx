"use client"

import { useState, useEffect, useRef } from "react"
import { Search, Users } from "lucide-react"

const SearchForm = () => {
 
  const [locations, setLocations] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [filteredLocations, setFilteredLocations] = useState([])
  const locationInputRef = useRef(null)

  
  const [sports, setSports] = useState([])
  const [sportSearchTerm, setSportSearchTerm] = useState("")
  const [showSportSuggestions, setShowSportSuggestions] = useState(false)
  const [filteredSports, setFilteredSports] = useState([])
  const sportInputRef = useRef(null)

 
  const searchButtonRef = useRef(null)

  
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch("http://localhost:8081/api/v1/allHelyszin")
        const data = await response.json()

        
        const uniqueSettlements = [...new Set(data.helyszinek.map((location) => location.Telepules))]

        setLocations(uniqueSettlements)
      } catch (error) {
        console.error("Error fetching locations:", error)
      }
    }

    fetchLocations()
  }, [])

 
  useEffect(() => {
    const fetchSports = async () => {
      try {
        const response = await fetch("http://localhost:8081/api/v1/allSportok")
        const data = await response.json()

        
        if (data && Array.isArray(data.sportok)) {
          
          const sportNames = data.sportok.map((sport) => sport.Nev)
          setSports(sportNames)
        }
      } catch (error) {
        console.error("Error fetching sports:", error)
      }
    }

    fetchSports()
  }, [])

  
  useEffect(() => {
    const locationInput = document.getElementById("destination")
    const sportInput = document.getElementById("sport")

    if (locationInput && sportInput) {
      
      const locationObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === "attributes" && mutation.attributeName === "value") {
            setSearchTerm(locationInput.value)
          }
        })
      })

      const sportObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === "attributes" && mutation.attributeName === "value") {
            setSportSearchTerm(sportInput.value)
          }
        })
      })

      
      const handleLocationInput = (e) => {
        setSearchTerm(e.target.value)
      }

      const handleSportInput = (e) => {
        setSportSearchTerm(e.target.value)
      }

      locationInput.addEventListener("input", handleLocationInput)
      sportInput.addEventListener("input", handleSportInput)

      
      const config = { attributes: true, attributeFilter: ["value"] }
      locationObserver.observe(locationInput, config)
      sportObserver.observe(sportInput, config)

      
      const checkAndSearch = () => {
        if (locationInput.value && sportInput.value) {
          
          if (locationInput.value !== searchTerm || sportInput.value !== sportSearchTerm) {
            
            setSearchTerm(locationInput.value)
            setSportSearchTerm(sportInput.value)

           
            setTimeout(() => {
             
              if (searchButtonRef.current && locationInput.value && sportInput.value) {
                searchButtonRef.current.click()
              }
            }, 300)
          }
        }
      }

      
      setTimeout(checkAndSearch, 500)

      return () => {
        
        locationInput.removeEventListener("input", handleLocationInput)
        sportInput.removeEventListener("input", handleSportInput)
        locationObserver.disconnect()
        sportObserver.disconnect()
      }
    }
  }, [])

  
  const handleLocationInputChange = (e) => {
    const value = e.target.value
    setSearchTerm(value)

    if (value.trim() === "") {
      setShowSuggestions(false)
      return
    }

    
    const filtered = locations.filter((location) => location.toLowerCase().includes(value.toLowerCase()))

    setFilteredLocations(filtered)
    setShowSuggestions(true)
  }

  
  const handleSportInputChange = (e) => {
    const value = e.target.value
    setSportSearchTerm(value)

    if (value.trim() === "") {
      setShowSportSuggestions(false)
      return
    }

    
    const filtered = sports.filter((sport) => sport.toLowerCase().includes(value.toLowerCase()))

    setFilteredSports(filtered)
    setShowSportSuggestions(true)
  }

  
  const handleLocationSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion)
    setShowSuggestions(false)
  }

  
  const handleSportSuggestionClick = (suggestion) => {
    setSportSearchTerm(suggestion)
    setShowSportSuggestions(false)
  }

  
  const handleSearchClick = () => {
    
    const searchButton = document.querySelector("#search button")
    if (searchButton) {
      searchButton.classList.add("opacity-75")
      searchButton.innerHTML =
        '<span class="inline-block animate-spin mr-2 h-4 w-4 border-t-2 border-white rounded-full"></span>Keresés...'
    }

    
    if (!searchTerm && !sportSearchTerm) {
      window.location.href = `/sportmate?allEvents=true`
      return
    }

    
    if (searchTerm && !sportSearchTerm) {
      window.location.href = `/sportmate?telepules=${encodeURIComponent(searchTerm)}&locationOnly=true`
      return
    }

    
    if (!searchTerm && sportSearchTerm) {
      window.location.href = `/sportmate?sport=${encodeURIComponent(sportSearchTerm)}&sportOnly=true`
      return
    }

    
    window.location.href = `/sportmate?telepules=${encodeURIComponent(searchTerm)}&sport=${encodeURIComponent(sportSearchTerm)}`
  }

  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (locationInputRef.current && !locationInputRef.current.contains(event.target)) {
        setShowSuggestions(false)
      }
      if (sportInputRef.current && !sportInputRef.current.contains(event.target)) {
        setShowSportSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <section className="py-6 bg-[#0e1526]" id="search">
      <div className="container mx-auto px-4">
        <div className="backdrop-blur-xl bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-lg shadow-2xl p-6 -mt-20 relative z-20">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            
            <div className="md:col-span-5">
              <label htmlFor="destination" className="font-medium text-white/90 mb-2 block">
                Válassz települést!
              </label>
              <div className="relative" ref={locationInputRef}>
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300">
                  <Search className="h-5 w-5" />
                </div>
                <input
                  id="destination"
                  placeholder="Település neve vagy hagyd üresen"
                  className="w-full pl-10 py-3 bg-white rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400/60 transition-all duration-300"
                  value={searchTerm}
                  onChange={handleLocationInputChange}
                  onFocus={() => searchTerm && setShowSuggestions(true)}
                />

                
                {showSuggestions && filteredLocations.length > 0 && (
                  <ul className="absolute w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto z-30">
                    {filteredLocations.map((location, index) => (
                      <li
                        key={index}
                        className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-slate-700 border-b border-slate-100 last:border-0"
                        onClick={() => handleLocationSuggestionClick(location)}
                      >
                        {location}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

           
            <div className="md:col-span-4">
              <label htmlFor="sport" className="font-medium text-white/90 mb-2 block">
                Válassz egy sportot!
              </label>
              <div className="relative" ref={sportInputRef}>
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300">
                  <Users className="h-5 w-5" />
                </div>
                <input
                  id="sport"
                  placeholder="Sport neve vagy hagyd üresen"
                  className="w-full pl-10 py-3 bg-white rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400/60 transition-all duration-300"
                  value={sportSearchTerm}
                  onChange={handleSportInputChange}
                  onFocus={() => sportSearchTerm && setShowSportSuggestions(true)}
                />

                
                {showSportSuggestions && filteredSports.length > 0 && (
                  <ul className="absolute w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto z-30">
                    {filteredSports.map((sport, index) => (
                      <li
                        key={index}
                        className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-slate-700 border-b border-slate-100 last:border-0"
                        onClick={() => handleSportSuggestionClick(sport)}
                      >
                        {sport}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

           
            <div className="md:col-span-3 flex items-end">
              <button
                ref={searchButtonRef}
                onClick={handleSearchClick}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium rounded-lg transition-all duration-300 shadow-lg shadow-purple-700/20 hover:shadow-purple-700/40"
              >
                Keresés
              </button>
            </div>
          </div>
          <div className="mt-2 text-xs text-white/60">
            Kereshetsz csak település vagy csak sport alapján is. Ha mindkét mezőt üresen hagyod, az összes eseményt
            láthatod.
          </div>
        </div>
      </div>
    </section>
  )
}

export default SearchForm
