"use client"

import React, { useState } from "react";
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";


import Rolunk from "../Footer/Rolunk";
import AFSZ from "../Footer/AFSZ";
import AdatvedelmiTajekoztato from "../Footer/AdatvedelmiTajekoztato";
import Impresszum from "../Footer/Impresszum";

const Footer = () => {
  const navigate = useNavigate();
  
  
  const [isRolunkOpen, setIsRolunkOpen] = useState(false);
  const [isAFSZOpen, setIsAFSZOpen] = useState(false);
  const [isAdatvedelemOpen, setIsAdatvedelemOpen] = useState(false);
  const [isImpresszumOpen, setIsImpresszumOpen] = useState(false);

  return (
    <footer id="contact-section" className="relative overflow-hidden">
      
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-slate-950 z-0"></div>
      <div className="absolute inset-0 opacity-30 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(147,51,234,0.15),transparent_40%)]"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_80%,rgba(79,70,229,0.15),transparent_40%)]"></div>
      </div>

      
      <div className="absolute inset-0 overflow-hidden z-0">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white/10"
            style={{
              width: `${Math.random() * 4 + 1}px`,
              height: `${Math.random() * 4 + 1}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `float ${Math.random() * 10 + 10}s linear infinite`,
              opacity: Math.random() * 0.5 + 0.3,
            }}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes float {
          0% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-20px) translateX(10px); }
          100% { transform: translateY(0) translateX(0); }
        }
      `}</style>

      
      <div className="absolute top-0 left-0 right-0 h-16 overflow-hidden z-10">
        <svg
          className="absolute bottom-0 w-full h-20 fill-slate-900 transform translate-y-1/2"
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

      <div className="container mx-auto px-4 pt-24 pb-12 relative z-20">
        
        <div className="max-w-4xl mx-auto mb-16">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 border border-slate-700/50 shadow-xl relative overflow-hidden">
            
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full filter blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/10 rounded-full filter blur-3xl translate-y-1/2 -translate-x-1/2"></div>

            <div className="relative text-center mb-6">
              <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400 mb-2">
                Elérhetőségek
              </h3>
              <p className="text-gray-300 max-w-2xl mx-auto">
                Kérdésed van? Vedd fel velünk a kapcsolatot az alábbi elérhetőségeken.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          <div>
            <h3 className="text-lg font-bold mb-4 text-white relative inline-block">
              Rólunk
              <span className="absolute -bottom-1 left-0 w-12 h-0.5 bg-gradient-to-r from-purple-500 to-indigo-500"></span>
            </h3>
            <ul className="space-y-3">
              <li>
                <button
                  onClick={() => setIsRolunkOpen(true)}
                  className="text-gray-300 hover:text-purple-300 transition-colors duration-300 flex items-center group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500/50 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  Rólunk
                </button>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4 text-white relative inline-block">
              ÁFSZ
              <span className="absolute -bottom-1 left-0 w-12 h-0.5 bg-gradient-to-r from-purple-500 to-indigo-500"></span>
            </h3>
            <ul className="space-y-3">
              <li>
                <button
                  onClick={() => setIsAFSZOpen(true)}
                  className="text-gray-300 hover:text-purple-300 transition-colors duration-300 flex items-center group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500/50 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  Általános Felhasználási Feltételek
                </button>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4 text-white relative inline-block">
              Adatvédelem
              <span className="absolute -bottom-1 left-0 w-12 h-0.5 bg-gradient-to-r from-purple-500 to-indigo-500"></span>
            </h3>
            <ul className="space-y-3">
              <li>
                <button
                  onClick={() => setIsAdatvedelemOpen(true)}
                  className="text-gray-300 hover:text-purple-300 transition-colors duration-300 flex items-center group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500/50 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  Adatvédelmi tájékoztató
                </button>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4 text-white relative inline-block">
              Impresszum
              <span className="absolute -bottom-1 left-0 w-12 h-0.5 bg-gradient-to-r from-purple-500 to-indigo-500"></span>
            </h3>
            <ul className="space-y-3">
              <li>
                <button
                  onClick={() => setIsImpresszumOpen(true)}
                  className="text-gray-300 hover:text-purple-300 transition-colors duration-300 flex items-center group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500/50 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  Impresszum
                </button>
              </li>
            </ul>
          </div>
        </div>

        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8 border-t border-slate-700/50 mb-8">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center mr-3">
              <Mail className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Email</p>
              <a href="mailto:info@sporthaver.com" className="text-white hover:text-purple-300 transition-colors">
                info@sporthaver.com
              </a>
            </div>
          </div>

          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center mr-3">
              <Phone className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Telefon</p>
              <a href="tel:+36123456789" className="text-white hover:text-purple-300 transition-colors">
                +36 12 345 6789
              </a>
            </div>
          </div>

          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center mr-3">
              <MapPin className="h-5 w-5 text-purple-400" />
            </div>
            <div>
            <p className="text-white">1051 Budapest, Példa utca 123.</p>
            </div>
          </div>
        </div>

        
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-slate-700/50">
          <div
            className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600 cursor-pointer"
            onClick={() => {
              navigate('/homepage');
              
              setTimeout(() => {
                window.scrollTo({
                  top: 0,
                  behavior: 'smooth'
                });
              }, 100);
            }}
          >
            Sporthaver
          </div>

          
          <div className="flex space-x-4 mb-6 md:mb-0">
            <a
              href="#"
              className="w-10 h-10 rounded-full bg-slate-800 hover:bg-purple-500/20 flex items-center justify-center transition-colors duration-300"
            >
              <Facebook className="h-5 w-5 text-gray-300 hover:text-white transition-colors" />
            </a>
            <a
              href="#"
              className="w-10 h-10 rounded-full bg-slate-800 hover:bg-purple-500/20 flex items-center justify-center transition-colors duration-300"
            >
              <Twitter className="h-5 w-5 text-gray-300 hover:text-white transition-colors" />
            </a>
            <a
              href="#"
              className="w-10 h-10 rounded-full bg-slate-800 hover:bg-purple-500/20 flex items-center justify-center transition-colors duration-300"
            >
              <Instagram className="h-5 w-5 text-gray-300 hover:text-white transition-colors" />
            </a>
            <a
              href="#"
              className="w-10 h-10 rounded-full bg-slate-800 hover:bg-purple-500/20 flex items-center justify-center transition-colors duration-300"
            >
              <Youtube className="h-5 w-5 text-gray-300 hover:text-white transition-colors" />
            </a>
          </div>

          <p className="text-gray-400 text-sm">&copy; {new Date().getFullYear()} Sporthaver. Minden jog fenntartva.</p>
        </div>
      </div>

      
      <Rolunk isOpen={isRolunkOpen} onClose={() => setIsRolunkOpen(false)} />
      <AFSZ isOpen={isAFSZOpen} onClose={() => setIsAFSZOpen(false)} />
      <AdatvedelmiTajekoztato isOpen={isAdatvedelemOpen} onClose={() => setIsAdatvedelemOpen(false)} />
      <Impresszum isOpen={isImpresszumOpen} onClose={() => setIsImpresszumOpen(false)} />
    </footer>
  )
}

export default Footer

