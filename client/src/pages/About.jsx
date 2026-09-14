import React from 'react';
import Navbar from '../components/Navbar';
import { Shield, Users, Target, Award, Eye, Navigation, FileCheck } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export default function About() {
  const pillars = [
    {
      icon: Eye,
      title: "Real-Time Fatigue Prevention",
      description: "Driver drowsiness accounts for nearly 20% of serious highway accidents. Our sub-second neural optical tracking detects micro-sleep episodes before they become catastrophic."
    },
    {
      icon: Navigation,
      title: "Automated Journey Telematics",
      description: "Continuous synchronization of trip distances, transit times, and road conditions to build an actionable driving safety profile over time."
    },
    {
      icon: FileCheck,
      title: "Frictionless Vehicle Compliance",
      description: "Eliminating roadside paper panic with a centralized, cloud-encrypted digital glovebox for vehicle registration, insurance, and emission certificates."
    }
  ];

  return (
    <div className="bg-zinc-950 min-h-screen text-zinc-100 pb-16">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        {/* Hero */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono uppercase tracking-widest text-zinc-400 font-bold block mb-2">
            Mission & Architecture
          </span>
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-white">
            Engineering Safer Roads for Everyone
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base mt-4 leading-relaxed">
            RoadSense is built on the philosophy that modern driver safety shouldn't require expensive vehicle hardware retrofits. Using computer vision and intelligent cloud telematics, we put life-saving awareness directly in your dashboard.
          </p>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {pillars.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-200 mb-5">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* IIIT-Lucknow Origin */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-8 sm:p-12 shadow-2xl mb-16 text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-300 mb-4">
            <Award className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
            Developed at IIIT Lucknow
          </h2>
          <p className="text-zinc-400 text-xs sm:text-sm mt-3 max-w-xl mx-auto leading-relaxed">
            RoadSense is an indigenous telematics initiative developed to tackle fatigue-induced road accidents through accessible computer vision algorithms and responsive web architecture.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <NavLink to="/safety">
              <button className="px-6 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider bg-zinc-100 hover:bg-white text-zinc-950 transition-all cursor-pointer">
                Try Safety Monitor
              </button>
            </NavLink>
            <NavLink to="/contact">
              <button className="px-6 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-all cursor-pointer">
                Contact the Team
              </button>
            </NavLink>
          </div>
        </div>
      </main>
    </div>
  );
}