"use client"

import { Calendar, Users, MapPin, Star } from "lucide-react"

const PopularDestinations = ({ Image, Link }) => {
  const destinations = [
    {
      name: "Kosárlabda Bajnokság",
      properties: "Budapest, 2023.08.15",
      rating: 4.8,
      participants: 24,
      sport: "Kosárlabda",
    },
    {
      name: "Futball Kupa",
      properties: "Debrecen, 2023.08.18",
      rating: 4.6,
      participants: 32,
      sport: "Futball",
    },
    {
      name: "Tenisz Verseny",
      properties: "Szeged, 2023.08.20",
      rating: 4.9,
      participants: 16,
      sport: "Tenisz",
    },
    {
      name: "Úszóverseny",
      properties: "Győr, 2023.08.22",
      rating: 4.7,
      participants: 28,
      sport: "Úszás",
    },
    {
      name: "Röplabda Torna",
      properties: "Pécs, 2023.08.25",
      rating: 4.5,
      participants: 18,
      sport: "Röplabda",
    },
    {
      name: "Kerékpár Túra",
      properties: "Balaton, 2023.08.27",
      rating: 4.9,
      participants: 45,
      sport: "Kerékpározás",
    },
    {
      name: "Futóverseny",
      properties: "Miskolc, 2023.08.29",
      rating: 4.6,
      participants: 120,
      sport: "Futás",
    },
    {
      name: "Jóga a Szabadban",
      properties: "Eger, 2023.08.30",
      rating: 4.8,
      participants: 30,
      sport: "Jóga",
    },
  ]
  return (
    <section id="popular-destinations" className="py-16 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-slate-950 z-0"></div>
      <div className="absolute inset-0 opacity-30 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(147,51,234,0.15),transparent_40%)]"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_80%,rgba(79,70,229,0.15),transparent_40%)]"></div>
      </div>

      {/* Animated particles */}
      <div className="absolute inset-0 overflow-hidden z-0">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white/10"
            style={{
              width: `${Math.random() * 4 + 1}px`,
              height: `${Math.random() * 4 + 1}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `float ${Math.random() * 10 + 10}s linear infinite`,
              opacity: Math.random() * 0.5 + 0.3,
            }}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes float {
          0% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-20px) translateX(10px); }
          100% { transform: translateY(0) translateX(0); }
        }
      `}</style>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h2 id="latest-events" className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400 mb-2">
              Legfrisebb sportesemények
            </h2>
            <p className="text-gray-400 max-w-2xl">
              Fedezd fel a környékeden zajló legfrissebb sporteseményeket és csatlakozz a közösséghez
            </p>
          </div>
  
          {/* ... */}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {destinations.map((destination, index) => (
            <DestinationCard
              key={index}
              Image={Image}
              Link={Link}
              name={destination.name}
              properties={destination.properties}
              rating={destination.rating}
              participants={destination.participants}
              sport={destination.sport}
              index={index}
            />
          ))}
        </div>

        <div className="mt-10 text-center md:hidden">
          <Link
            href="/all-events"
            className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium rounded-xl transition-all duration-300 shadow-lg shadow-purple-700/20 hover:shadow-purple-700/40 group"
          >
            <span>Összes esemény</span>
            <svg
              className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}

const DestinationCard = ({ Image, Link, name, properties, rating, participants, sport, index }) => {
  // Calculate a delay for staggered animation
  const delay = index * 0.1

  return (
    <Link
      href="#"
      className="group block rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-500"
      style={{
        animation: `card-appear 0.6s ease-out ${delay}s both`,
        transform: "translateY(20px)",
        opacity: 0,
      }}
    >
      <style jsx>{`
        @keyframes card-appear {
          0% {
            transform: translateY(20px);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>

      <div className="relative h-48 overflow-hidden">
        <Image
          src={`/placeholder.svg?height=200&width=300&text=${sport}`}
          alt={name}
          width={300}
          height={200}
          className="object-cover w-full h-full transform group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/70 to-transparent"></div>

        {/* Sport badge */}
        <div className="absolute top-3 left-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-medium px-2.5 py-1 rounded-full shadow-lg">
          {sport}
        </div>

        {/* Rating badge */}
        <div className="absolute top-3 right-3 bg-white/10 backdrop-blur-md text-white text-xs font-medium px-2.5 py-1 rounded-full flex items-center">
          <Star className="w-3 h-3 text-yellow-400 mr-1" fill="currentColor" />
          {rating}
        </div>
      </div>

      <div className="p-4 bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 group-hover:border-purple-500/30 transition-colors duration-300">
        <h3 className="font-bold text-lg text-white mb-2 group-hover:text-purple-300 transition-colors duration-300">
          {name}
        </h3>

        <div className="flex items-center text-gray-400 text-sm mb-3">
          <MapPin className="w-4 h-4 mr-1 text-purple-400" />
          <span>{properties}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center text-gray-400 text-sm">
            <Users className="w-4 h-4 mr-1 text-purple-400" />
            <span>{participants} résztvevő</span>
          </div>

          <div className="flex items-center text-gray-400 text-sm">
            <Calendar className="w-4 h-4 mr-1 text-purple-400" />
            <span>Részletek</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default PopularDestinations

