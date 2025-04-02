"use client"

import { useNavigate } from "react-router-dom";

const HeroSection = ({ Image }) => {
  const navigate = useNavigate();

  // Esemény létrehozása gombra kattintás kezelése
  const handleCreateEventClick = (e) => {
    e.preventDefault();

    // Megkeressük az event-section elemet
    const section = document.getElementById('event-section');
    if (section) {
      // Fejléc magassága
      const headerHeight = 120;

      // Kiszámoljuk a pozíciót
      const sectionPosition = section.getBoundingClientRect().top;
      const offsetPosition = sectionPosition + window.pageYOffset - headerHeight;

      // Görgetés
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    } else {
      // Ha nem találjuk az elemet, próbáljuk a create-event ID-t
      const element = document.getElementById('create-event');
      if (element) {
        const headerHeight = 120;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerHeight;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }
  };

  // Események böngészése gombra kattintás kezelése - minden esemény, csak kor szerinti szűrés
  const handleBrowseEventsClick = (e) => {
    e.preventDefault();

    // Átirányítás a sportmate oldalra, ahol az események a felhasználó korának megfelelően lesznek szűrve
    // Az "all-events" paraméter jelzi, hogy minden eseményt szeretnénk lekérni
    navigate('/sportmate?allEvents=true');
  };

  return (
    <section className="relative h-[70vh] min-h-[500px] overflow-hidden">
      {/* Background image with parallax effect */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 transform scale-110 transition-transform duration-10000 animate-slow-zoom">
          <Image
            src="/src/pages/Main/images/6.png"
            alt="Sportolók"
            width={1920}
            height={1080}
            className="w-full h-full object-cover filter blur-[1px] opacity-90"
          />
        </div>

        {/* Overlay with gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 to-slate-900/60"></div>

        {/* Background elements */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(147,51,234,0.2),transparent_40%)]"></div>
          <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_80%,rgba(79,70,229,0.2),transparent_40%)]"></div>
        </div>

        {/* Animated particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white/20"
              style={{
                width: `${Math.random() * 6 + 1}px`,
                height: `${Math.random() * 6 + 1}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animation: `float-hero ${Math.random() * 15 + 10}s linear infinite`,
                opacity: Math.random() * 0.7 + 0.3,
              }}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes float-hero {
          0% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-30px) translateX(20px); }
          100% { transform: translateY(0) translateX(0); }
        }
        @keyframes text-shimmer {
          0% { background-position: -100% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes slow-zoom {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slow-zoom {
          animation: slow-zoom 30s infinite alternate ease-in-out;
        }
        .animate-fadeInUp {
          animation: fadeInUp 1s ease-out forwards;
        }
      `}</style>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-center">
        <div className="max-w-3xl animate-fadeInUp" style={{ animationDelay: "0.2s" }}>
          <div className="inline-block px-4 py-1 rounded-full bg-gradient-to-r from-purple-600/20 to-indigo-600/20 backdrop-blur-md border border-purple-500/30 text-sm text-purple-300 font-medium mb-6">
            Sporthaver - Sportolj közösségben
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            <span
              className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-indigo-200 animate-text-shimmer"
              style={{
                backgroundSize: "200% auto",
                animation: "text-shimmer 4s linear infinite",
              }}
            >
              Találd meg a kedvenc
            </span>
            <br />
            <span className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400">
              sportodat!
            </span>
          </h1>

          <p className="text-xl md:text-2xl mb-8 text-gray-300 max-w-2xl">
            Találj barátokra és sportolj bátran! Fedezd fel a környékeden elérhető sportlehetőségeket és csatlakozz a
            közösséghez.
          </p>

          <div className="flex flex-wrap gap-4">
            <a
              href="#create-event"
              onClick={handleCreateEventClick}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium rounded-xl transition-all duration-300 shadow-lg shadow-purple-700/30 hover:shadow-purple-700/50 transform hover:-translate-y-1 flex items-center group"
            >
              <span>Esemény létrehozása</span>
              <svg
                className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
              </svg>
            </a>

            <a
              href="#"
              onClick={handleBrowseEventsClick}
              className="px-8 py-4 bg-white/10 backdrop-blur-md hover:bg-white/20 border border-white/20 hover:border-white/30 text-white font-medium rounded-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              Események böngészése
            </a>
          </div>
        </div>

        {/* Scroll indicator removed as requested */}
      </div>

      {/* Bottom wave decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-16 overflow-hidden z-10">
        <svg
          className="absolute bottom-0 w-full h-20 fill-slate-900 transform translate-y-1"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
            opacity=".25"
          ></path>
          <path
            d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
            opacity=".5"
          ></path>
          <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"></path>
        </svg>
      </div>
    </section>
  )
}

export default HeroSection
