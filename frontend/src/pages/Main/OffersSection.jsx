// components/OffersSection.jsx

const OffersSection = ({ Image }) => {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">Special Offers</h2>
          <p className="text-white/70 mb-8">Promotions, deals, and special offers for you</p>
  
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <OfferCard
              Image={Image}
              imageSrc="/placeholder.svg?height=300&width=300"
              imageAlt="Couple enjoying vacation"
              title="Save on worldwide travel"
              description="Start planning your year and save at least 15% with early 2025 deals"
              buttonText="Find 15% or more savings"
            />
  
            <OfferCard
              Image={Image}
              imageSrc="/placeholder.svg?height=300&width=300"
              imageAlt="Luxury resort"
              title="Escape for a weekend"
              description="Book your perfect weekend getaway with special rates on selected properties"
              buttonText="Discover weekend deals"
            />
          </div>
        </div>
      </section>
    )
  }
  
  const OfferCard = ({ Image, imageSrc, imageAlt, title, description, buttonText }) => {
    return (
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-lg shadow-lg overflow-hidden">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-2/5">
            <Image
              src={imageSrc}
              alt={imageAlt}
              width={300}
              height={300}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-6 md:w-3/5">
            <h3 className="text-xl font-bold mb-2">{title}</h3>
            <p className="text-white/70 mb-4">
              {description}
            </p>
            <button className="px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 rounded-md">
              {buttonText}
            </button>
          </div>
        </div>
      </div>
    )
  }
  
  export default OffersSection