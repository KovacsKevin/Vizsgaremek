"use client"

import { Calendar, Users, MapPin } from "lucide-react" 
import { useEffect, useState } from "react"

const PopularDestinations = ({ Image, Link }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        
        const response = await fetch('http://localhost:8081/api/v1/events-with-details');
        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }
        const data = await response.json();

        
        const currentTime = new Date();
        const activeEvents = data.events.filter(event => new Date(event.zaroIdo) > currentTime);

        
        const sortedEvents = [...activeEvents].sort((a, b) => b.esemenyId - a.esemenyId);

       
        const latestEvents = sortedEvents.slice(0, 8);
        setEvents(latestEvents);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);


  return (
    <section id="popular-destinations" className="py-16 relative overflow-hidden">
      
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-slate-950 z-0"></div>
      <div className="absolute inset-0 opacity-30 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(147,51,234,0.15),transparent_40%)]"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_80%,rgba(79,70,229,0.15),transparent_40%)]"></div>
      </div>

      
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
              Fedezd fel legfrissebb sporteseményeinket és csatlakozz a közösséghez
            </p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
            <p className="text-gray-400 mt-2">Események betöltése...</p>
          </div>
        ) : error ? (
          <div className="text-center py-10">
            <p className="text-red-400">Hiba történt: {error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {events.map((event, index) => (
              <DestinationCard
                key={event.esemenyId}
                Image={Image}
                Link={Link}
                name={event.helyszinNev}
                properties={`${event.telepules}, ${new Date(event.kezdoIdo).toLocaleDateString('hu-HU')}`}
                participants={event.resztvevoCount}
                maxParticipants={event.maximumLetszam}
                sport={event.sportNev}
                index={index}
                eventId={event.esemenyId}
                imageUrl={event.imageUrl}
                telepules={event.telepules}
                sportNev={event.sportNev}
              />
            ))}
          </div>
        )}

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

const DestinationCard = ({ Image, Link, name, properties, participants, maxParticipants, sport, index, eventId, imageUrl, telepules, sportNev }) => {
  
  const delay = index * 0.1;

  
  const placeholderUrl = `/placeholder.svg?height=200&width=300&text=${encodeURIComponent(sport)}`;

  
  const getFullImageUrl = (url) => {
    if (!url) return placeholderUrl;
    return `http://localhost:8081${url.startsWith('/') ? url : `/${url}`}`;
  };

  
  const handleCardClick = async (e) => {
    e.preventDefault(); 

    try {
     
      const response = await fetch(`http://localhost:8081/api/v1/event-search-data/${eventId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch event data');
      }

      const eventData = await response.json();

      
      const searchSection = document.getElementById('search');
      if (searchSection) {
        
        const windowHeight = window.innerHeight;
        const searchHeight = searchSection.offsetHeight;
        const offsetPosition = searchSection.getBoundingClientRect().top + window.pageYOffset;

        
        const scrollPosition = offsetPosition - (windowHeight / 2) + (searchHeight / 2);

        
        window.scrollTo({
          top: scrollPosition,
          behavior: 'smooth'
        });

        
        setTimeout(() => {
          
          const locationInput = document.getElementById('destination');
          if (locationInput) {
            locationInput.value = eventData.telepules || telepules;

            
            const event = new Event('input', { bubbles: true });
            locationInput.dispatchEvent(event);
          }

          
          const sportInput = document.getElementById('sport');
          if (sportInput) {
            sportInput.value = eventData.sportNev || sportNev;

            
            const event = new Event('input', { bubbles: true });
            sportInput.dispatchEvent(event);
          }

          
          setTimeout(() => {
            const searchButton = document.querySelector('#search button');
            if (searchButton) {
              
              searchButton.classList.add('ring-2', 'ring-purple-500');

              
              searchButton.style.cursor = 'pointer';

              
              setTimeout(() => {
                searchButton.classList.remove('ring-2', 'ring-purple-500');
              }, 1000);

              
              searchButton.click();
            }
          }, 300);
        }, 800);
      }
    } catch (error) {
      console.error('Error fetching event data:', error);

      
      const searchSection = document.getElementById('search');
      if (searchSection) {
        searchSection.scrollIntoView({ behavior: 'smooth' });

        setTimeout(() => {
          
          const locationInput = document.getElementById('destination');
          if (locationInput) {
            locationInput.value = telepules;
            const event = new Event('input', { bubbles: true });
            locationInput.dispatchEvent(event);
          }

          
          const sportInput = document.getElementById('sport');
          if (sportInput) {
            sportInput.value = sportNev;
            const event = new Event('input', { bubbles: true });
            sportInput.dispatchEvent(event);
          }

          
          setTimeout(() => {
            const searchButton = document.querySelector('#search button');
            if (searchButton) {
              searchButton.click();
            }
          }, 300);
        }, 800);
      }
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="group block rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-500 cursor-pointer"
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
          src={getFullImageUrl(imageUrl)}
          alt={name}
          width={300}
          height={200}
          className="object-cover w-full h-full transform group-hover:scale-110 transition-transform duration-700"
          onError={(e) => {
            
            console.error(`Kép betöltési hiba: ${imageUrl}`, e);
            e.target.src = placeholderUrl;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/70 to-transparent"></div>

        
        <div className="absolute top-3 left-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-medium px-2.5 py-1 rounded-full shadow-lg">
          {sport}
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
            <span>
              {participants}/{maxParticipants} résztvevő
            </span>
          </div>

          <div className="flex items-center text-gray-400 text-sm">
            <Calendar className="w-4 h-4 mr-1 text-purple-400" />
            <span>Részletek</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PopularDestinations

