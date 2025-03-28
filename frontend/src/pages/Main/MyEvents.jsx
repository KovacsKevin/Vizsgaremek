"use client"

import { useState } from "react"
import Header from './Header'

const MyEvents = () => {
  const [activeTab, setActiveTab] = useState("myevents")

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-800 to-zinc-900 text-white">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* Az oldal többi része törölve lett */}
    </div>
  )
}

export default MyEvents