"use client"

import { useState } from "react"
import { Search, Car, Plane, Map, Hotel, Calendar, Users } from "lucide-react"
import Header from './Header'
import HeroSection from './HeroSection'
import SearchForm from './SearchForm'
import OffersSection from './OffersSection'
import PopularDestinations from './PopularDestination'
import Footer from './Footer'


const Image = ({ src, alt, width, height, className }) => (
  <img src={src || "/placeholder.svg"} alt={alt} width={width} height={height} className={className} />
)


const Link = ({ href, children, className }) => (
  <a href={href} className={className}>
    {children}
  </a>
)

const HomePage = () => {
  const [activeTab, setActiveTab] = useState("stays")

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-800 to-zinc-900 text-white">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <HeroSection Image={Image} />
      <SearchForm />
      <OffersSection Image={Image} />
      <PopularDestinations Image={Image} Link={Link} />
      <Footer Link={Link} Image={Image} />
    </div>
  )
}

export default HomePage