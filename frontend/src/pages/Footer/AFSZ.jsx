import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

const AFSZ = ({ isOpen, onClose }) => {
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
            Általános Felhasználási Szerződési Feltételek
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
            <h3 className="text-xl font-semibold text-white">1. Általános rendelkezések</h3>
            <p>
              Jelen Általános Felhasználási Szerződési Feltételek (továbbiakban: ÁFSZ) szabályozza a Sporthaver (továbbiakban: Szolgáltató) által üzemeltetett sporthaver.com weboldal és mobilalkalmazás (továbbiakban: Platform) használatának feltételeit.
            </p>
            <p>
              A Platform használatával Ön (továbbiakban: Felhasználó) elfogadja jelen ÁFSZ-ben foglalt feltételeket. Amennyiben nem ért egyet a feltételekkel, kérjük, ne használja a Platformot.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white">2. Regisztráció és felhasználói fiók</h3>
            <p>
              A Platform teljes körű használatához regisztráció szükséges. A regisztráció során megadott adatoknak valósnak és pontosnak kell lenniük. A Felhasználó felelős a fiókjához tartozó jelszó biztonságos kezeléséért.
            </p>
            <p>
              A Szolgáltató jogosult törölni vagy felfüggeszteni a Felhasználó fiókját, amennyiben a Felhasználó megsérti jelen ÁFSZ-t vagy a vonatkozó jogszabályokat.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white">3. Sportesemények létrehozása és részvétel</h3>
            <p>
              A Felhasználók sportesemények létrehozására és az azokon való részvételre jogosultak. Az esemény létrehozója felelős az esemény adatainak pontosságáért és az esemény lebonyolításáért.
            </p>
            <p>
              A Szolgáltató nem vállal felelősséget az események tényleges megvalósulásáért, minőségéért vagy az esetleges sérülésekért, károkért.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white">4. Felelősség korlátozása</h3>
            <p>
              A Platform "ahogy van" és "ahogy elérhető" alapon kerül biztosításra. A Szolgáltató nem garantálja, hogy a Platform mindig elérhető, hibamentes vagy biztonságos lesz.
            </p>
            <p>
              A Szolgáltató nem vállal felelősséget a Felhasználók által közzétett tartalmakért, valamint a Felhasználók közötti interakciókból eredő károkért vagy sérelmekért.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white">5. Szellemi tulajdon</h3>
            <p>
              A Platform és annak minden eleme a Szolgáltató szellemi tulajdonát képezi. A Felhasználók nem jogosultak a Platform tartalmának másolására, terjesztésére vagy módosítására a Szolgáltató előzetes írásbeli engedélye nélkül.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white">6. Módosítások</h3>
            <p>
              A Szolgáltató jogosult jelen ÁFSZ egyoldalú módosítására. A módosításokról a Szolgáltató a Platformon keresztül értesíti a Felhasználókat. A módosítások a közzétételt követően lépnek hatályba.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white">7. Alkalmazandó jog</h3>
            <p>
              Jelen ÁFSZ-re a magyar jog rendelkezései az irányadóak. Az esetleges jogviták rendezésére a magyar bíróságok rendelkeznek joghatósággal.
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

export default AFSZ;
