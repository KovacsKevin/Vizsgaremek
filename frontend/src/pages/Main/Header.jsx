// components/Header.jsx
import { Hotel, Plane, Car, Map } from "lucide-react"

const Header = ({ activeTab, setActiveTab }) => {
  return (
    <header className="backdrop-blur-md bg-slate-800/70 border-b border-slate-700/50 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="text-2xl font-bold">TravelEase.com</div>
          <div className="hidden md:flex items-center space-x-2">
            <div className="flex items-center">
            </div>
            <button className="px-4 py-2 border border-white/20 text-white hover:bg-white/10 rounded">
              Register
            </button>
            <button className="px-4 py-2 bg-white/10 backdrop-blur-md text-white hover:bg-white/20 border border-white/20 rounded">
              Sign in
            </button>
          </div>
          <button className="md:hidden text-white">
            <span className="sr-only">Open menu</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="container mx-auto px-4 pb-4">
        <div className="flex space-x-4 bg-white/5 backdrop-blur-sm border border-white/10 p-1 rounded-lg">
          {[
            { id: "stays", icon: Hotel, label: "Stays" },
            { id: "flights", icon: Plane, label: "Flights" },
            { id: "cars", icon: Car, label: "Car Rentals" },
            { id: "attractions", icon: Map, label: "Attractions" },
          ].map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              className={`flex items-center gap-2 px-4 py-2 rounded-md ${
                activeTab === id ? "bg-white/10 backdrop-blur-md" : "hover:bg-white/5"
              }`}
              onClick={() => setActiveTab(id)}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </header>
  )
}

export default Header