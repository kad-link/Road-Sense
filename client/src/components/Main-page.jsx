import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from "../context/AuthContext"; 
import { Shield, ArrowRight, Eye, MapPin, FileText } from 'lucide-react';

function MainPage() {
  const { user } = useAuth();
  
  return (
    <div className="w-full min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col items-center max-w-4xl mx-auto text-center">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900/80 border border-zinc-700/80 text-zinc-300 text-xs font-medium tracking-wide mb-6 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Intelligent Driver Attention & Telematics System</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-light tracking-tighter text-white leading-none">
          THE SMARTER WAY <br className="hidden sm:block" />
          <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 via-zinc-300 to-zinc-500">
            TO STAY SAFE ON ROAD
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-zinc-400 text-base sm:text-lg lg:text-xl font-normal mt-6 max-w-2xl leading-relaxed">
          Monitor driver fatigue in real time, record detailed route telematics, and access your digital vehicle glovebox anywhere — engineered for safe, stress-free journeys.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-3.5 mt-8 w-full sm:w-auto">
          <NavLink to="/safety" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto px-7 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider bg-zinc-100 hover:bg-white text-zinc-950 transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer hover:scale-105">
              <span>Launch Safety Console</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </NavLink>

          <a href="#services" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white transition-all cursor-pointer">
              Explore Capabilities
            </button>
          </a>
        </div>

        {/* Telematics Feature Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mt-12 sm:mt-16 w-full max-w-2xl text-left font-mono">
          <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 backdrop-blur-md">
            <Eye className="w-4 h-4 text-zinc-400 mb-1.5" />
            <div className="text-xs font-bold text-zinc-200">Vision Tracking</div>
            <div className="text-[10px] text-zinc-500">Sub-second eye closure detection</div>
          </div>

          <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 backdrop-blur-md">
            <MapPin className="w-4 h-4 text-zinc-400 mb-1.5" />
            <div className="text-xs font-bold text-zinc-200">Trip Telematics</div>
            <div className="text-[10px] text-zinc-500">Automated route & duration logs</div>
          </div>

          <div className="col-span-2 sm:col-span-1 p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 backdrop-blur-md">
            <FileText className="w-4 h-4 text-zinc-400 mb-1.5" />
            <div className="text-xs font-bold text-zinc-200">Digital Glovebox</div>
            <div className="text-[10px] text-zinc-500">Secure vehicle paper vault</div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default MainPage;