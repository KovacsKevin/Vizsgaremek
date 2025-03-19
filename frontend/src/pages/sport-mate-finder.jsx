"use client"

import { useState } from "react"
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
} from "lucide-react"

// Placeholder Image component
const Image = ({ src, alt, className }) => (
  <img src={src || "/placeholder.svg?height=200&width=300"} alt={alt} className={className} />
)

const SportMateFinder = () => {
  const [ageRange, setAgeRange] = useState([15, 50])
  const [favorites, setFavorites] = useState([])
  const [selectedSport, setSelectedSport] = useState(null)
  const [skillLevel, setSkillLevel] = useState(null)
  const [showFilters, setShowFilters] = useState(false)
  const [expandedDescriptions, setExpandedDescriptions] = useState([])
  const [facilityFilters, setFacilityFilters] = useState({
    fedett: false,
    oltozo: false,
    parkolas: false,
  })

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

  // Sample data expanded with more events and facility information
  const events = [
    {
      id: 1,
      helyszinId: 1,
      userId: 1,
      sportId: 2,
      kezdoIdo: "2025-03-07T09:19:00.000Z",
      zaroIdo: "2025-03-07T11:19:00.000Z",
      szint: "kezdő",
      minimumEletkor: 15,
      maximumEletkor: 30,
      imageUrl: "/placeholder.svg?height=200&width=300",
      createdAt: "2025-03-19T09:19:25.000Z",
      updatedAt: "2025-03-19T09:19:25.000Z",
      resztvevok: 3,
      maxResztvevok: 10,
      Helyszin: {
        id: 1,
        Nev: "Sportközpont",
        Telepules: "Budapest",
        Cim: "Váci út 45.",
      },
      Sportok: {
        Id: 2,
        Nev: "Kosárlabda",
      },
      Letesitmeny: {
        fedett: true,
        oltozo: true,
        parkolas: true,
      },
      Leiras:
        "Modern sportközpont 3 kosárlabdapályával. A pályák kiváló minőségűek, professzionális világítással. Kezdőknek is ideális, barátságos közösség. Minden szükséges felszerelés biztosított.",
    },
    {
      id: 2,
      helyszinId: 2,
      userId: 2,
      sportId: 1,
      kezdoIdo: "2025-03-08T14:00:00.000Z",
      zaroIdo: "2025-03-08T16:00:00.000Z",
      szint: "haladó",
      minimumEletkor: 18,
      maximumEletkor: 40,
      imageUrl: "/placeholder.svg?height=200&width=300",
      createdAt: "2025-03-19T10:30:25.000Z",
      updatedAt: "2025-03-19T10:30:25.000Z",
      resztvevok: 8,
      maxResztvevok: 22,
      Helyszin: {
        id: 2,
        Nev: "Népliget",
        Telepules: "Budapest",
        Cim: "Népliget",
      },
      Sportok: {
        Id: 1,
        Nev: "Foci",
      },
      Letesitmeny: {
        fedett: false,
        oltozo: true,
        parkolas: true,
      },
      Leiras:
        "Szabadtéri focipálya a Népligetben. Műfüves pálya, jó állapotban. Öltözők és zuhanyzók rendelkezésre állnak. Parkolási lehetőség a közelben. Haladó szintű játékosokat várunk egy intenzív mérkőzésre.",
    },
    {
      id: 3,
      helyszinId: 3,
      userId: 3,
      sportId: 3,
      kezdoIdo: "2025-03-10T18:30:00.000Z",
      zaroIdo: "2025-03-10T20:00:00.000Z",
      szint: "középhaladó",
      minimumEletkor: 16,
      maximumEletkor: 35,
      imageUrl: "/placeholder.svg?height=200&width=300",
      createdAt: "2025-03-19T11:45:25.000Z",
      updatedAt: "2025-03-19T11:45:25.000Z",
      resztvevok: 5,
      maxResztvevok: 8,
      Helyszin: {
        id: 3,
        Nev: "Teniszklub",
        Telepules: "Budapest",
        Cim: "Margitsziget",
      },
      Sportok: {
        Id: 3,
        Nev: "Tenisz",
      },
      Letesitmeny: {
        fedett: true,
        oltozo: true,
        parkolas: false,
      },
      Leiras:
        "Fedett teniszpályák a Margitszigeten. Kiváló minőségű pályák, professzionális környezet. Öltözők és zuhanyzók rendelkezésre állnak. Parkolás korlátozott, tömegközlekedéssel könnyen megközelíthető. Ütőt biztosítunk, ha szükséges.",
    },
  ]

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
    const date = new Date(dateString)
    return date.toLocaleTimeString("hu-HU", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Filter events based on facility filters
  const filteredEvents = events.filter((event) => {
    if (facilityFilters.fedett && !event.Letesitmeny.fedett) return false
    if (facilityFilters.oltozo && !event.Letesitmeny.oltozo) return false
    if (facilityFilters.parkolas && !event.Letesitmeny.parkolas) return false
    return true
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 to-zinc-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">SportMate - Találj Sporttársakat</h1>

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
                        onClick={() => setSelectedSport(selectedSport === sport.nev ? null : sport.nev)}
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
                <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors flex items-center justify-center gap-2">
                  <span>Új esemény létrehozása</span>
                </button>
              </div>
            </div>
          </div>

          {/* Search Results */}
          <div className="flex-1">
            <div className="space-y-6">
              {filteredEvents.length === 0 ? (
                <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-lg p-8 text-center">
                  <p className="text-lg">Nincs a keresési feltételeknek megfelelő esemény.</p>
                  <p className="text-white/60 mt-2">Próbáld módosítani a szűrőket vagy hozz létre egy új eseményt.</p>
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
                          src={event.imageUrl || "/placeholder.svg"}
                          alt={event.Sportok.Nev}
                          className="w-full h-48 md:h-full object-cover"
                        />
                        <div className="absolute top-0 left-0 bg-blue-600 text-white px-3 py-1 rounded-br-lg font-medium">
                          {event.Sportok.Nev}
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
                              <h3 className="text-xl font-bold">{event.Helyszin.Nev}</h3>
                              <span className="px-2 py-0.5 bg-white/10 text-white/80 rounded text-xs">
                                {event.szint}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 mt-1 text-white/60">
                              <MapPin className="h-4 w-4 flex-shrink-0" />
                              <span>
                                {event.Helyszin.Telepules}, {event.Helyszin.Cim}
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
                                {event.resztvevok}/{event.maxResztvevok} résztvevő
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Facility Icons */}
                        <div className="mt-4 flex flex-wrap gap-3">
                          <div
                            className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs ${
                              event.Letesitmeny.fedett
                                ? "bg-green-500/20 text-green-300"
                                : "bg-red-500/20 text-red-300"
                            }`}
                          >
                            <Home className="h-3 w-3" />
                            <span>{event.Letesitmeny.fedett ? "Fedett" : "Szabadtéri"}</span>
                          </div>

                          <div
                            className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs ${
                              event.Letesitmeny.oltozo
                                ? "bg-green-500/20 text-green-300"
                                : "bg-red-500/20 text-red-300"
                            }`}
                          >
                            <DoorOpen className="h-3 w-3" />
                            <span>{event.Letesitmeny.oltozo ? "Öltöző" : "Nincs öltöző"}</span>
                          </div>

                          <div
                            className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs ${
                              event.Letesitmeny.parkolas
                                ? "bg-green-500/20 text-green-300"
                                : "bg-red-500/20 text-red-300"
                            }`}
                          >
                            <Car className="h-3 w-3" />
                            <span>{event.Letesitmeny.parkolas ? "Parkolás" : "Nincs parkolás"}</span>
                          </div>
                        </div>

                        <div className="mt-3">
                          <div className="flex items-center gap-2">
                            <span className="text-white/60">Korosztály:</span>
                            <span>
                              {event.minimumEletkor} - {event.maximumEletkor} év
                            </span>
                          </div>
                        </div>

                        {/* Description */}
                        <div className="mt-3">
                          <button
                            onClick={() => toggleDescription(event.id)}
                            className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors text-sm"
                          >
                            <Info className="h-4 w-4" />
                            <span>Leírás</span>
                            <ChevronRight
                              className={`h-4 w-4 transition-transform ${
                                expandedDescriptions.includes(event.id) ? "rotate-90" : ""
                              }`}
                            />
                          </button>

                          {expandedDescriptions.includes(event.id) && (
                            <div className="mt-2 text-sm text-white/80 bg-white/5 p-3 rounded-md">{event.Leiras}</div>
                          )}
                        </div>

                        <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                          <div className="flex items-center gap-2">
                            <div className="flex -space-x-2">
                              {[...Array(Math.min(3, event.resztvevok))].map((_, i) => (
                                <div
                                  key={i}
                                  className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 border-2 border-slate-800 flex items-center justify-center text-xs font-bold"
                                >
                                  {String.fromCharCode(65 + i)}
                                </div>
                              ))}
                            </div>
                            {event.resztvevok > 3 && (
                              <span className="text-white/60 text-sm">+{event.resztvevok - 3} további</span>
                            )}
                          </div>

                          <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors w-full sm:w-auto">
                            Csatlakozás
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SportMateFinder