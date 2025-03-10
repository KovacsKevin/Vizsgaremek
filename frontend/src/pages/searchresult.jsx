"use client"

import { useState } from "react"
import { Search, Star, Heart, MapPin, Info } from "lucide-react"

// Placeholder Image component
const Image = ({ src, alt, className }) => <img src={src || "/placeholder.svg"} alt={alt} className={className} />

const SearchResults = () => {
  const [priceRange, setPriceRange] = useState([20000, 300000])

  const hotels = [
    {
      id: 1,
      name: "Bo18 Hotel Superior",
      rating: 3,
      image: "/placeholder.svg?height=200&width=300",
      location: "VIII. kerület, Budapest",
      distance: "A városközpontban",
      metro: "A metró közelében",
      roomType: "Háromágyas standard szoba",
      guests: "1 éjszaka, 2 felnőtt és 1 gyerek",
      score: 9.2,
      reviews: "5,009 értékelés",
      price: 41300,
    },
    {
      id: 2,
      name: "Zoe apartman",
      rating: 4,
      image: "/placeholder.svg?height=200&width=300",
      location: "VIII. kerület, Budapest",
      distance: "A városközpontban",
      metro: "A metró közelében",
      roomType: "Két hálószobás apartman",
      guests: "1 éjszaka, 2 felnőtt és 1 gyerek",
      score: 9.4,
      reviews: "173 értékelés",
      location_score: 9.7,
      price: 29375,
      tags: ["Korai 2025-ös ajánlat"],
      details: ["1 nappali • 2 fürdőszoba", "1 konyha • 60 m²", "2 ágy (2 nagy franciaágy, 1 kanapéágy)"],
    },
    {
      id: 3,
      name: "Goszdu Court Budapest",
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
    <div className="min-h-screen bg-gradient-to-br from-slate-800 to-zinc-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-6">
          {/* Search Filters Sidebar */}
          <div className="w-80 flex-shrink-0">
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-lg p-6 sticky top-4">
              <h2 className="text-xl font-bold text-white mb-4">Keresés</h2>

              {/* Search Input */}
              <div className="space-y-4 mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Budapest"
                    className="w-full pl-10 py-2 bg-white/5 border border-white/10 rounded-md text-white placeholder:text-white/40 focus:border-white/30 focus:ring-white/20"
                  />
                </div>

                {/* Date Inputs */}
                <div>
                  <input
                    type="text"
                    value="2025. március 19. (Sze)"
                    className="w-full py-2 bg-white/5 border border-white/10 rounded-md text-white placeholder:text-white/40 focus:border-white/30 focus:ring-white/20 px-3 mb-2"
                  />
                  <input
                    type="text"
                    value="2025. március 20. (Cs)"
                    className="w-full py-2 bg-white/5 border border-white/10 rounded-md text-white placeholder:text-white/40 focus:border-white/30 focus:ring-white/20 px-3"
                  />
                </div>

                {/* Guests Input */}
                <input
                  type="text"
                  value="2 felnőtt · 1 gyermek · 1 szoba"
                  className="w-full py-2 bg-white/5 border border-white/10 rounded-md text-white placeholder:text-white/40 focus:border-white/30 focus:ring-white/20 px-3"
                />
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h3 className="text-white font-semibold mb-2">Szűrés:</h3>
                <p className="text-white/80 text-sm mb-2">Szállása szűrt költségkeret (egy éj)</p>
                <div className="relative pt-2">
                  <input
                    type="range"
                    min="20000"
                    max="300000"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], e.target.value])}
                    className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="text-white/60 text-sm mt-2">
                    HUF {priceRange[0]} - HUF {priceRange[1]}
                  </div>
                </div>
              </div>

              {/* Popular Filters */}
              <div>
                <h3 className="text-white font-semibold mb-3">Népszerű szűrők</h3>
                <div className="space-y-2">
                  {[
                    { label: "Wellnessközpont", count: 50 },
                    { label: "Nagyon jó ár", count: 46 },
                    { label: "Reggeli az árban", count: 36 },
                    { label: "Utcai medence", count: 34 },
                  ].map((filter) => (
                    <label key={filter.label} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        className="rounded border-white/30 bg-white/5 text-blue-500 focus:ring-white/20"
                      />
                      <span className="text-white/80">{filter.label}</span>
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
                  className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-lg overflow-hidden"
                >
                  <div className="flex">
                    <div className="w-72 relative">
                      <Image
                        src={hotel.image || "/placeholder.svg"}
                        alt={hotel.name}
                        className="w-full h-full object-cover"
                      />
                      <button className="absolute top-4 right-4 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white">
                        <Heart className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="flex-1 p-6">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            {hotel.name}
                            {Array(hotel.rating)
                              .fill()
                              .map((_, i) => (
                                <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                              ))}
                          </h3>
                          <div className="flex items-center gap-2 mt-1 text-white/60">
                            <MapPin className="h-4 w-4" />
                            <a href="#" className="text-blue-400 hover:underline">
                              {hotel.location}
                            </a>
                            <button className="text-blue-400 hover:underline">Lásd a térképen</button>
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-white/60">
                            <Info className="h-4 w-4" />
                            <span>{hotel.distance}</span>
                            <span>•</span>
                            <span>{hotel.metro}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="flex items-center gap-2 justify-end">
                            <div className="text-right">
                              <div className="text-white font-medium">
                                {hotel.score >= 9 ? "Nagyszerű" : "Nagyon jó"}
                              </div>
                              <div className="text-white/60 text-sm">{hotel.reviews}</div>
                            </div>
                            <div className="bg-blue-600 text-white px-2 py-1 rounded text-lg font-bold">
                              {hotel.score}
                            </div>
                          </div>
                          {hotel.location_score && (
                            <div className="text-white/60 text-sm mt-1">Elhelyezkedés {hotel.location_score}</div>
                          )}
                        </div>
                      </div>

                      <div className="mt-4">
                        <h4 className="font-semibold text-white">{hotel.roomType}</h4>
                        {hotel.details && (
                          <div className="mt-2 space-y-1">
                            {hotel.details.map((detail, index) => (
                              <div key={index} className="text-white/60 text-sm">
                                {detail}
                              </div>
                            ))}
                          </div>
                        )}
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

                      <div className="mt-4 flex justify-between items-end">
                        <div className="text-white/60">{hotel.guests}</div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-white">HUF {hotel.price.toLocaleString()}</div>
                          <div className="text-white/60 text-sm">Tartalmazza az adókat és díjakat</div>
                          <button className="mt-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                            Lásd a kínálatot
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

