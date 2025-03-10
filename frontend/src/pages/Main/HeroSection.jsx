// components/HeroSection.jsx

const HeroSection = ({ Image }) => {
    return (
      <section className="relative">
        <div className="absolute inset-0 z-0">
          <Image
            src='/src/pages/Main/images/6.png'
            alt="kep"
            width={1600}
            height={600}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-900/80 to-slate-800/60 backdrop-blur-[2px]"></div>
        </div>
        <div className="relative z-10 container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Találd meg a kedvenc sportodat!</h1>
            <p className="text-xl mb-6 text-white/80">
              Találj barátokra és sportolj bátran!
            </p>
          </div>
        </div>
      </section>
    )
  }
  
  export default HeroSection