import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

const Impresszum = ({ isOpen, onClose }) => {
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
            Impresszum
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
            <h3 className="text-xl font-semibold text-white">Szolgáltató adatai</h3>
            <p>
              <strong>Cégnév:</strong> Sporthaver Kft.<br />
              <strong>Székhely:</strong> 1051 Budapest, Példa utca 123.<br />
              <strong>Cégjegyzékszám:</strong> 01-09-123456<br />
              <strong>Adószám:</strong> 12345678-2-42<br />
              <strong>Statisztikai számjel:</strong> 12345678-6201-113-01
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white">Elérhetőségek</h3>
            <p>
              <strong>E-mail:</strong> info@sporthaver.com<br />
              <strong>Telefon:</strong> +36 12 345 6789<br />
              <strong>Weboldal:</strong> www.sporthaver.com
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white">Tárhelyszolgáltató adatai</h3>
            <p>
              <strong>Cégnév:</strong> Példa Hosting Kft.<br />
              <strong>Székhely:</strong> 1234 Budapest, Szerver utca 56.<br />
              <strong>E-mail:</strong> info@peldahosting.hu<br />
              <strong>Telefon:</strong> +36 98 765 4321
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white">Felügyeleti szervek</h3>
            <p>
              <strong>Fogyasztóvédelmi hatóság:</strong><br />
              Budapest Főváros Kormányhivatala<br />
              Fogyasztóvédelmi Főosztály<br />
              1051 Budapest, Sas u. 19. III. em.<br />
              Telefon: +36 1 450 2598<br />
              E-mail: fogyved_kmf_budapest@bfkh.gov.hu
            </p>
            <p>
              <strong>Békéltető testület:</strong><br />
              Budapesti Békéltető Testület<br />
              1016 Budapest, Krisztina krt. 99. III. em. 310.<br />
              Budapesti Békéltető Testület<br />
              1016 Budapest, Krisztina krt. 99. III. em. 310.<br />
              Telefon: +36 1 488 2131<br />
              E-mail: bekelteto.testulet@bkik.hu
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white">Szerzői jogok</h3>
            <p>
              A Sporthaver weboldalon és mobilalkalmazásban megjelenő tartalmak (szövegek, képek, logók, grafikai elemek, szoftverek stb.) szerzői jogi védelem alatt állnak. Ezek felhasználása, másolása, terjesztése vagy módosítása kizárólag a Sporthaver Kft. előzetes írásbeli engedélyével lehetséges.
            </p>
          </div>

          <p className="text-sm text-gray-400 pt-4">
            Utolsó frissítés: {new Date().toLocaleDateString('hu-HU')}
          </p>
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

export default Impresszum;
