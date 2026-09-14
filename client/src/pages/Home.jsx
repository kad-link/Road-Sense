import React from 'react';
import Navbar from '../components/Navbar';
import MainPage from '../components/Main-page';
import Services from '../components/Services';
import bgVideo from "../assets/car-drive.mp4";

function Home() {
  return (
    <div className="bg-zinc-950 min-h-screen text-zinc-100">
      <div className="relative w-full min-h-screen overflow-hidden flex flex-col justify-between">
        {/* Background Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={bgVideo} type="video/mp4" />
        </video>

        {/* Sophisticated Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/90 via-zinc-950/70 to-zinc-950" />

        {/* Foreground Content */}
        <div className="relative z-10 flex flex-col min-h-screen">
          <Navbar />
          <MainPage />
        </div>
      </div>

      <Services />
    </div>
  );
}

export default Home;