import { useState } from "react";
import { X, AlertTriangle, MapPin } from "lucide-react";


const LocationMapModal = ({ location, onClose }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const getMapUrl = () => {
    const encodedLocation = encodeURIComponent(location);
    return `https://maps.google.com/maps?q=${encodedLocation}&t=&z=13&ie=UTF8&iwloc=&output=embed`;
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setLoadError(true);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70">
      <div
        className={`relative bg-gradient-to-br from-slate-800 to-zinc-900 rounded-lg shadow-xl p-6 transition-all duration-300 ${isFullscreen
          ? "w-[95vw] h-[95vh] m-0"
          : "w-full max-w-4xl h-[80vh]"
          }`}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
          title="Bezárás"
        >
          <X className="h-5 w-5" />
        </button>

        <button
          onClick={toggleFullscreen}
          className="absolute top-4 right-16 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
          title={isFullscreen ? "Kicsinyítés" : "Teljes képernyő"}
        >
          {isFullscreen ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 3v3a2 2 0 0 1-2 2H3"></path>
              <path d="M21 8h-3a2 2 0 0 1-2-2V3"></path>
              <path d="M3 16h3a2 2 0 0 1 2 2v3"></path>
              <path d="M16 21v-3a2 2 0 0 1 2-2h3"></path>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 3 21 3 21 9"></polyline>
              <polyline points="9 21 3 21 3 15"></polyline>
              <line x1="21" y1="3" x2="14" y2="10"></line>
              <line x1="3" y1="21" x2="10" y2="14"></line>
            </svg>
          )}
        </button>

        <h3 className="text-xl font-bold mb-4">Helyszín térképen</h3>
        <p className="text-white/60 mb-4">{location}</p>

        <div className="w-full h-[calc(100%-80px)] bg-slate-700/50 rounded-lg overflow-hidden relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-800/80">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          )}

          <iframe
            title="Location Map"
            width="100%"
            height="100%"
            frameBorder="0"
            style={{ border: 0 }}
            src={getMapUrl()}
            allowFullScreen
            onLoad={handleIframeLoad}
            onError={handleIframeError}
          ></iframe>

          {loadError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-800/90 p-6 text-center">
              <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
              <h4 className="text-lg font-semibold mb-2">Nem sikerült betölteni a térképet</h4>
              <p className="text-white/60 mb-4">A Google Maps betöltése sikertelen volt.</p>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors flex items-center gap-2"
              >
                <MapPin className="h-4 w-4" />
                Megnyitás Google Maps-ben
              </a>
            </div>
          )}
        </div>

        <div className="mt-3 text-center text-white/50 text-sm">
          <p>A térkép nagyításához és mozgatásához használd az egeret vagy az érintőképernyőt.</p>
          <p>A teljes képernyős nézethez kattints a <span className="text-white">□</span> ikonra.</p>
        </div>
      </div>
    </div>
  );
};
export default LocationMapModal;