import { useState, useEffect } from "react";

const TestImages = () => {
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
        
        
        const sortedEvents = [...data.events].sort((a, b) => b.esemenyId - a.esemenyId);
        setEvents(sortedEvents);
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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Esemény Képek Teszt Oldal</h1>
      
      {loading ? (
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
          <p className="mt-2">Események betöltése...</p>
        </div>
      ) : error ? (
        <div className="text-center py-10 text-red-500">
          <p>Hiba történt: {error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map(event => (
            <div key={event.esemenyId} className="border rounded-lg overflow-hidden shadow-md">
              <div className="p-4 bg-gray-100">
                <h2 className="text-xl font-semibold mb-2">Esemény #{event.esemenyId}</h2>
                <p className="text-sm text-gray-600 mb-1">Helyszín: {event.helyszinNev}</p>
                <p className="text-sm text-gray-600 mb-1">Sport: {event.sportNev}</p>
                <p className="text-sm text-gray-600 mb-3">
                  Kezdés: {new Date(event.kezdoIdo).toLocaleDateString('hu-HU')}
                </p>
                
                <div className="mb-2">
                  <p className="text-sm font-medium">Image URL:</p>
                  <code className="text-xs bg-gray-200 p-1 rounded block overflow-x-auto">
                    {event.imageUrl || 'Nincs kép URL'}
                  </code>
                </div>
              </div>
              
              <div className="h-64 bg-gray-200">
                {event.imageUrl ? (
                  <img
                    src={`http://localhost:8081${event.imageUrl.startsWith('/') ? event.imageUrl : `/${event.imageUrl}`}`}
                    alt={`Esemény #${event.esemenyId}`}
                    className="object-contain w-full h-full"
                    onError={(e) => {
                      console.error(`Kép betöltési hiba: ${event.imageUrl}`);
                      e.target.src = `/placeholder.svg?height=300&width=400&text=Betöltési%20Hiba`;
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    Nincs feltöltött kép
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TestImages;
