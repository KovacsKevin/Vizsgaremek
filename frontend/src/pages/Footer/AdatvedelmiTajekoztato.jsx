import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

const AdatvedelmiTajekoztato = ({ isOpen, onClose }) => {
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
            Adatvédelmi Tájékoztató
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
            <h3 className="text-xl font-semibold text-white">1. Bevezetés</h3>
            <p>
              A Sporthaver elkötelezett a felhasználók személyes adatainak védelme iránt. Jelen Adatvédelmi Tájékoztató célja, hogy tájékoztassa a felhasználókat arról, hogyan gyűjtjük, használjuk, tároljuk és védjük személyes adataikat.
            </p>
            <p>
              Platformunk használatával Ön elfogadja az ebben a tájékoztatóban leírt adatkezelési gyakorlatokat.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white">2. Milyen adatokat gyűjtünk?</h3>
            <p>
              A következő típusú személyes adatokat gyűjthetjük és kezelhetjük:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Regisztrációs adatok: név, e-mail cím, jelszó (titkosított formában)</li>
              <li>Profil adatok: profilkép, sportolási preferenciák, bemutatkozás</li>
              <li>Helyadatok: tartózkodási hely (ha engedélyezi)</li>
              <li>Használati adatok: hogyan használja a platformot, milyen eseményeken vesz részt</li>
              <li>Eszközadatok: IP-cím, böngésző típusa, operációs rendszer</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white">3. Hogyan használjuk az adatokat?</h3>
            <p>
              Az összegyűjtött adatokat a következő célokra használjuk:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>A Platform működtetése és szolgáltatásaink nyújtása</li>
              <li>Felhasználói fiók létrehozása és kezelése</li>
              <li>Sportesemények ajánlása az Ön közelében</li>
              <li>Kommunikáció a felhasználókkal (értesítések, hírlevelek)</li>
              <li>A Platform fejlesztése és optimalizálása</li>
              <li>Visszaélések megelőzése és a biztonság fenntartása</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white">4. Adatok megosztása</h3>
            <p>
              Személyes adatait nem adjuk el vagy adjuk bérbe harmadik feleknek. Adatait a következő esetekben oszthatjuk meg:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Más felhasználókkal, ha Ön részt vesz egy sporteseményen (csak a szükséges mértékben)</li>
              <li>Szolgáltatóinkkal, akik segítenek a Platform működtetésében (adatfeldolgozók)</li>
              <li>Ha jogszabály kötelez minket, vagy jogi eljárás során szükséges</li>
              <li>Üzleti átalakulás esetén (pl. fúzió, felvásárlás)</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white">5. Adatbiztonság</h3>
            <p>
              Megfelelő technikai és szervezési intézkedéseket alkalmazunk a személyes adatok védelmére. Ezek közé tartoznak a titkosítás, tűzfalak, rendszeres biztonsági frissítések és a hozzáférés korlátozása.
            </p>
            <p>
              Fontos tudni, hogy az interneten keresztül történő adattovábbítás soha nem lehet 100%-osan biztonságos, ezért nem tudunk abszolút garanciát vállalni az adatok biztonságára.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white">6. Az Ön jogai</h3>
            <p>
              Az adatvédelmi jogszabályok értelmében Önnek jogában áll:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Hozzáférni a személyes adataihoz</li>
              <li>Helyesbíteni a pontatlan adatokat</li>
              <li>Kérni az adatok törlését (bizonyos feltételek mellett)</li>
              <li>Korlátozni az adatkezelést</li>
              <li>Adathordozhatósághoz való jog</li>
              <li>Tiltakozni az adatkezelés ellen</li>
            </ul>
            <p>
              Jogai gyakorlásához kérjük, vegye fel velünk a kapcsolatot az info@sporthaver.com e-mail címen.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white">7. Cookie-k</h3>
            <p>
              Weboldalunk cookie-kat használ a felhasználói élmény javítása érdekében. A cookie-k kis szöveges fájlok, amelyeket az Ön eszközén tárolunk. Beállíthatja böngészőjét a cookie-k elutasítására, de ez korlátozhatja a Platform funkcióinak használatát.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white">8. Változtatások a tájékoztatóban</h3>
            <p>
              Időről időre frissíthetjük ezt az Adatvédelmi Tájékoztatót. A frissítésekről a Platformon keresztül értesítjük a felhasználókat. Az Adatvédelmi Tájékoztató további használata a módosítások elfogadását jelenti.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white">9. Kapcsolat</h3>
            <p>
              Ha kérdése vagy aggálya van az adatvédelmi gyakorlatunkkal kapcsolatban, kérjük, vegye fel velünk a kapcsolatot az info@sporthaver.com e-mail címen.
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

export default AdatvedelmiTajekoztato;
