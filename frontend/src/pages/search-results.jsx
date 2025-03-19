"use client"

import { useState } from "react"
import { Search, Star, Heart, MapPin, Info, Calendar, Users } from "lucide-react"
import { cn } from "@/lib/utils"

// Placeholder Image component
const Image = ({ src, alt, className }) => <img src={src || "/placeholder.svg"} alt={alt} className={className} />

const SearchResults = () => {
  const [priceRange, setPriceRange] = useState([20000, 300000])
  const [favorites, setFavorites] = useState<number[]>([])

  const toggleFavorite = (id: number) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  const hotels = [
    {
      id: 1,
      name: "Csokonai",
      image: "/placeholder.svg?height=200&width=300",
      location: "Keszthely",
      distance: "A városközpontban",
      metro: "A metró közelében",
      roomType: "Foci",
      score: 9.2,
      reviews: "5,009 értékelés",
      price: 41300,
      guests: "1 éjszaka, 2 felnőtt és 1 gyerek",
      features: ["Ingyenes lemondás", "Fizetés a helyszínen"],
    },
    {
      id: 2,
      name: "Élménystrand",
      rating: 4,
      image: "/placeholder.svg?height=200&width=300",
      location: "Gyenesdiás",
      distance: "A városközpontban",
      metro: "A metró közelében",
      roomType: "Kosárlabda",
      score: 8.7,
      reviews: "3,245 értékelés",
      price: 38500,
      guests: "1 éjszaka, 2 felnőtt és 1 gyerek",
      features: ["Reggeli az árban", "Ingyenes WiFi"],
    },
    {
      id: 3,
      name: "Káptalanfa",
      rating: 3,
      image: "/placeholder.svg?height=200&width=300",
      location: "VIII. kerület, Budapest",
      distance: "A városközpontban",
      metro: "A metró közelében",
      roomType: "Deluxe stúdióapartman",
      guests: "1 éjszaka, 2 felnőtt és 1 gyerek",
      score: 8.4,
      reviews: "1,548 értékelés",
      location_score: 9.4,
      price: 40415,
      features: ["Nincs szükség előrefizetésre", "Mondja le díjmentesen"],
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 to-zinc-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Szálláshelyek keresése</h1>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Search Filters Sidebar */}
          <div className="w-full lg:w-80 flex-shrink-0">
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-lg p-6 sticky top-4">
              <h2 className="text-xl font-bold mb-4">Keresés</h2>

              {/* Search Input */}
              <div className="space-y-4 mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Budapest"
                    className="w-full pl-10 py-2 bg-white/5 border border-white/10 rounded-md text-white placeholder:text-white/40 focus:border-white/30 focus:ring-white/20 focus:outline-none"
                  />
                </div>

                {/* Date Inputs */}
                <div className="space-y-2">
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-4 w-4" />
                    <input
                      type="text"
                      value="2025. március 19. (Sze)"
                      className="w-full pl-10 py-2 bg-white/5 border border-white/10 rounded-md text-white placeholder:text-white/40 focus:border-white/30 focus:ring-white/20 focus:outline-none"
                    />
                  </div>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-4 w-4" />
                    <input
                      type="text"
                      value="2025. március 20. (Cs)"
                      className="w-full pl-10 py-2 bg-white/5 border border-white/10 rounded-md text-white placeholder:text-white/40 focus:border-white/30 focus:ring-white/20 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Guests Input */}
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-4 w-4" />
                  <input
                    type="text"
                    value="2 felnőtt · 1 gyermek · 1 szoba"
                    className="w-full pl-10 py-2 bg-white/5 border border-white/10 rounded-md text-white placeholder:text-white/40 focus:border-white/30 focus:ring-white/20 focus:outline-none"
                  />
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Szűrés:</h3>
                <p className="text-white/80 text-sm mb-2">Szállása szűrt költségkeret (egy éj)</p>
                <div className="relative pt-2">
                  <input
                    type="range"
                    min="20000"
                    max="300000"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], Number.parseInt(e.target.value)])}
                    className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                  <div className="text-white/60 text-sm mt-2 flex justify-between">
                    <span>HUF {priceRange[0].toLocaleString()}</span>
                    <span>HUF {priceRange[1].toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Popular Filters */}
              <div>
                <h3 className="font-semibold mb-3">Népszerű szűrők</h3>
                <div className="space-y-2">
                  {[
                    { label: "Wellnessközpont", count: 50 },
                    { label: "Nagyon jó ár", count: 46 },
                    { label: "Reggeli az árban", count: 36 },
                    { label: "Utcai medence", count: 34 },
                  ].map((filter) => (
                    <label key={filter.label} className="flex items-center space-x-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        className="rounded border-white/30 bg-white/5 text-blue-500 focus:ring-white/20"
                      />
                      <span className="text-white/80 group-hover:text-white transition-colors">{filter.label}</span>
                      <span className="text-white/60 text-sm">({filter.count})</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Search Results */}
          <div className="flex-1">
            <div className="space-y-6">
              {hotels.map((hotel) => (
                <div
                  key={hotel.id}
                  className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-lg overflow-hidden hover:border-white/40 transition-all duration-300"
                >
                  <div className="flex flex-col md:flex-row">
                    <div className="w-full md:w-72 relative">
                      <Image
                        src={hotel.image || "/placeholder.svg"}
                        alt={hotel.name}
                        className="w-full h-48 md:h-full object-cover"
                      />
                      <button
                        onClick={() => toggleFavorite(hotel.id)}
                        className="absolute top-4 right-4 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors"
                      >
                        <Heart
                          className={cn(
                            "h-5 w-5 transition-colors",
                            favorites.includes(hotel.id) ? "fill-red-500 text-red-500" : "",
                          )}
                        />
                      </button>
                    </div>

                    <div className="flex-1 p-6">
                      <div className="flex flex-col md:flex-row justify-between">
                        <div>
                          <h3 className="text-xl font-bold flex items-center gap-2">
                            {hotel.name}
                            {hotel.rating && (
                              <div className="flex">
                                {[...Array(hotel.rating)].map((_, i) => (
                                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                ))}
                              </div>
                            )}
                          </h3>
                          <div className="flex items-center gap-2 mt-1 text-white/60">
                            <MapPin className="h-4 w-4 flex-shrink-0" />
                            <a href="#" className="text-blue-400 hover:underline">
                              {hotel.location}
                            </a>
                            <button className="text-blue-400 hover:underline">Lásd a térképen</button>
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-white/60">
                            <Info className="h-4 w-4 flex-shrink-0" />
                            <span>{hotel.distance}</span>
                            <span>•</span>
                            <span>{hotel.metro}</span>
                          </div>
                        </div>

                        {hotel.score && (
                          <div className="text-right mt-4 md:mt-0">
                            <div className="flex items-center gap-2 justify-end">
                              <div className="flex flex-col items-end">
                                <span className="text-sm text-white/60">{hotel.reviews}</span>
                                {hotel.location_score && (
                                  <span className="text-sm text-white/60">Elhelyezkedés: {hotel.location_score}</span>
                                )}
                              </div>
                              <div className="bg-blue-600 text-white font-bold rounded-lg w-10 h-10 flex items-center justify-center">
                                {hotel.score}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="mt-4">
                        <h4 className="font-semibold">{hotel.roomType}</h4>
                        {hotel.features && (
                          <div className="mt-2 space-y-1">
                            {hotel.features.map((feature, index) => (
                              <div key={index} className="text-green-400 text-sm flex items-center gap-1">
                                <span className="text-lg">✓</span> {feature}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="mt-4 flex flex-col md:flex-row justify-between items-end">
                        <div className="text-white/60">{hotel.guests}</div>
                        <div className="text-right mt-4 md:mt-0">
                          {hotel.price && (
                            <div className="mb-2">
                              <span className="text-sm text-white/60">1 éjszaka ára:</span>
                              <div className="text-xl font-bold">HUF {hotel.price.toLocaleString()}</div>
                            </div>
                          )}
                          <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors w-full md:w-auto">
                            Tovább
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SearchResults

