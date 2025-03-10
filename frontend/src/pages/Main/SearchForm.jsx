// components/SearchForm.jsx
import { Search, Users } from "lucide-react"

const SearchForm = () => {
  return (
    <section className="py-6">
      <div className="container mx-auto px-4">
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-lg shadow-lg p-6 -mt-20 relative z-20">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2 space-y-2">
              <label htmlFor="destination" className="font-medium text-white/90">
                Válassz települést!
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-4 w-4" />
                <input
                  id="destination"
                  placeholder="Település neve"
                  className="w-full pl-10 py-2 bg-white/5 border border-white/10 rounded-md text-white placeholder:text-white/40 focus:border-white/30 focus:ring-white/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="sport" className="font-medium text-white/90">Válassz egy sportot!</label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-4 w-4" />
                <select
                  id="sport"
                  className="w-full pl-10 py-2 bg-white/5 border border-white/10 rounded-md text-white appearance-none focus:border-white/30 focus:ring-white/20"
                >
                  <option value="" disabled selected className="bg-gray-800">Sportok</option>
                  <option value="football" className="bg-gray-800">Foci</option>
                  <option value="basketball" className="bg-gray-800">Kosár</option>
                  <option value="tennis" className="bg-gray-800">Tenisz</option>
                  <option value="swimming" className="bg-gray-800">Úszás</option>
                  <option value="cycling" className="bg-gray-800">Összes</option>
                </select>
              </div>
            </div>

            <div className="flex items-end">
              <button className="w-full py-2 bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/30 rounded-md">
                Keresés
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default SearchForm