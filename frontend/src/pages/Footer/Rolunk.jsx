import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

const Rolunk = ({ isOpen, onClose }) => {
  const [animation, setAnimation] = useState("");

  useEffect(() => {
    if (isOpen) {
      setAnimation("animate-fadeIn");
      document.body.style.overflow = "hidden";
    } else {
      setAnimation("animate-fadeOut");
      const timer = setTimeout(() => {
        document.body.style.overflow = "auto";
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        className={`bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700/50 shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto hide-scrollbar ${animation}`}
        style={{ animationDuration: "300ms" }}
      >
        <div className="sticky top-0 bg-slate-800 p-4 border-b border-slate-700/50 flex justify-between items-center">
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400">
            Rólunk
          </h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-700/50 transition-colors"
          >
            <X className="h-6 w-6 text-gray-300" />
          </button>
        </div>
        
        <div className="p-6 text-gray-300 space-y-6">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white">Küldetésünk</h3>
            <p>
              A Sporthaver küldetése, hogy összekösse a sportolni vágyó embereket és közösségeket. Platformunk lehetővé teszi, hogy könnyedén találj sportpartnereket, csapatokat vagy sporteseményeket a közeledben.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white">Történetünk</h3>
            <p>
              A Sporthaver 2023-ban indult, amikor alapítóink felismerték, hogy milyen nehéz megfelelő sportpartnereket találni vagy csapatokat szervezni. Azóta küldetésünknek tekintjük, hogy lebontsuk a sportolás előtt álló akadályokat és segítsünk az embereknek aktív, egészséges életmódot folytatni.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white">Csapatunk</h3>
            <p>
              Lelkes sportolókból és technológiai szakemberekből álló csapatunk azon dolgozik, hogy a legjobb élményt nyújtsuk felhasználóinknak. Mindannyian szenvedélyesen hiszünk a sport közösségépítő erejében és abban, hogy a technológia segítségével közelebb hozhatjuk egymáshoz az embereket.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white">Értékeink</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>Közösség: Hisszük, hogy a sport összeköt és közösséget épít.</li>
              <li>Hozzáférhetőség: Célunk, hogy mindenki számára elérhetővé tegyük a sportolás örömét.</li>
              <li>Innováció: Folyamatosan fejlesztjük platformunkat a legjobb felhasználói élmény érdekében.</li>
              <li>Egészség: Támogatjuk az aktív, egészséges életmódot.</li>
            </ul>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeOut {
          from { opacity: 1; transform: translateY(0); }
          to { opacity: 0; transform: translateY(20px); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease forwards;
        }
        .animate-fadeOut {
          animation: fadeOut 0.3s ease forwards;
        }
        
        /* Scrollbar elrejtése különböző böngészőkben */
        .hide-scrollbar {
          -ms-overflow-style: none;  /* Internet Explorer és Edge */
          scrollbar-width: none;     /* Firefox */
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;             /* Chrome, Safari és Opera */
        }
      `}</style>
    </div>
  );
};

export default Rolunk;
