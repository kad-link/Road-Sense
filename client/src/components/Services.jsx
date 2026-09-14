import React from 'react';
import Card from './Card';

function Services() {
  const services = [
    {
      imgsrc: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=800&auto=format&fit=crop",
      title: "Active Safety Monitor",
      tag: "Computer Vision",
      description: "Neural eye-tracking and micro-sleep detection via webcam. Immediate audible and visual alerts when driver fatigue thresholds are exceeded.",
      link: "/safety",
      actionLabel: "Launch Monitor"
    },
    {
      imgsrc: "https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=800&auto=format&fit=crop",
      title: "Interactive Navigation",
      tag: "Google Maps",
      description: "Turn-by-turn routing with automatic journey logging. Calculate travel distance, trip durations, and transit options with live location tracking.",
      link: "/nav-maps",
      actionLabel: "Open Maps"
    },
    {
      imgsrc: "https://images.unsplash.com/photo-1508974239320-0a029497e820?q=80&w=800&auto=format&fit=crop",
      title: "Trip Telematics & Logs",
      tag: "Telematics",
      description: "All historical searches and completed routes archived in one place. Instant access to past driving performance and route statistics.",
      link: "/trips",
      actionLabel: "View Trips"
    },
    {
      imgsrc: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=800&auto=format&fit=crop",
      title: "Digital Glovebox",
      tag: "Cloud Vault",
      description: "Secure, encrypted cloud storage for your vehicle RC, Insurance, PUC certificate, and maintenance records. Accessible anywhere on the go.",
      link: "/docs",
      actionLabel: "Access Glovebox"
    },
    {
      imgsrc: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=800&auto=format&fit=crop",
      title: "E-Challan Verification",
      tag: "Regulatory",
      description: "Direct portal access to query pending traffic challans and citations for your registered vehicles without government portal friction.",
      link: "https://echallan.parivahan.gov.in/index/accused-challan",
      actionLabel: "Check Challans"
    },
    {
      imgsrc: "https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?q=80&w=800&auto=format&fit=crop",
      title: "Driver Command Dashboard",
      tag: "Analytics",
      description: "Executive vehicle health, safety score trends, and document expiration alerts consolidated into a single driver command center.",
      link: "/dashboard",
      actionLabel: "View Dashboard"
    }
  ];

  return (
    <section className="min-h-screen w-full bg-zinc-950 py-24 px-4 sm:px-6 lg:px-8 border-t border-zinc-900" id="services">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono uppercase tracking-widest text-zinc-400 font-bold block mb-2">
            Integrated Mobility Platform
          </span>
          <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-white">
            Engineered For Driver Safety
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base mt-3">
            Modular telematics and vehicle organization tools designed to eliminate distraction, fatigue, and document friction.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <Card 
              key={index}
              imgsrc={service.imgsrc}
              title={service.title}
              tag={service.tag}
              description={service.description}
              link={service.link}
              actionLabel={service.actionLabel}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Services;