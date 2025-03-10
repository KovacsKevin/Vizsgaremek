// components/PopularDestinations.jsx

const PopularDestinations = ({ Image, Link }) => {
    const destinations = [
      { name: "New York", properties: "1,234 properties" },
      { name: "Paris", properties: "987 properties" },
      { name: "London", properties: "1,543 properties" },
      { name: "Tokyo", properties: "856 properties" },
      { name: "Rome", properties: "765 properties" },
      { name: "Barcelona", properties: "678 properties" },
      { name: "Sydney", properties: "543 properties" },
      { name: "Dubai", properties: "876 properties" },
    ]
  
    return (
      <section className="py-12 bg-gradient-to-br from-slate-800/50 to-zinc-900/50 backdrop-blur-md">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8">Legfrisebb sportesemények</h2>
  
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {destinations.map((destination, index) => (
              <DestinationCard 
                key={index}
                Image={Image}
                Link={Link}
                name={destination.name}
                properties={destination.properties}
              />
            ))}
          </div>
        </div>
      </section>
    )
  }
  
  const DestinationCard = ({ Image, Link, name, properties }) => {
    return (
      <Link
        href="#"
        className="group block backdrop-blur-xl bg-white/10 border border-white/20 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all hover:bg-white/15"
      >
        <div className="relative h-48">
          <Image
            src={`/placeholder.svg?height=200&width=300&text=${name}`}
            alt={name}
            width={300}
            height={200}
            className="object-cover w-full h-full"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent"></div>
        </div>
        <div className="p-4">
          <h3 className="font-bold text-lg group-hover:text-white transition-colors">{name}</h3>
          <p className="text-white/70 text-sm">{properties}</p>
        </div>
      </Link>
    )
  }
  
  export default PopularDestinations