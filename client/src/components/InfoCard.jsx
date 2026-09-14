import React from 'react';
import { MapPin, Navigation, Clock, Calendar, ArrowRight } from 'lucide-react';

function InfoCard(props) {
  return (
    <div className="bg-zinc-900/80 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-6 shadow-xl transition-all duration-300 flex flex-col justify-between">
      <div>
        {/* Card Header Tag */}
        <div className="flex items-center justify-between mb-5">
          <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-zinc-950 border border-zinc-800 text-zinc-300 font-mono">
            Verified Route
          </span>
          <span className="text-xs text-zinc-500 font-mono flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-zinc-500" />
            {props.date}
          </span>
        </div>

        {/* Route Origin & Destination */}
        <div className="space-y-4 relative pl-7">
          {/* Vertical route line */}
          <div className="absolute left-2.5 top-3 bottom-3 w-0.5 bg-zinc-800" />

          {/* Origin */}
          <div className="relative">
            <div className="absolute -left-7 top-1 w-5 h-5 rounded-full bg-zinc-950 border border-emerald-500 flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-mono block">Departure</span>
              <p className="text-base font-medium text-white truncate max-w-[280px]">
                {props.source}
              </p>
            </div>
          </div>

          {/* Destination */}
          <div className="relative">
            <div className="absolute -left-7 top-1 w-5 h-5 rounded-full bg-zinc-950 border border-rose-500 flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-mono block">Destination</span>
              <p className="text-base font-medium text-white truncate max-w-[280px]">
                {props.destination}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="mt-6 pt-4 border-t border-zinc-800 grid grid-cols-2 gap-4 font-mono text-xs">
        <div className="bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-800/80">
          <span className="text-[10px] text-zinc-500 block uppercase">Distance</span>
          <span className="text-sm font-semibold text-zinc-100 flex items-center gap-1.5 mt-0.5">
            <Navigation className="w-3.5 h-3.5 text-zinc-400" />
            {props.distance}
          </span>
        </div>

        <div className="bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-800/80">
          <span className="text-[10px] text-zinc-500 block uppercase">Duration</span>
          <span className="text-sm font-semibold text-zinc-100 flex items-center gap-1.5 mt-0.5">
            <Clock className="w-3.5 h-3.5 text-zinc-400" />
            {props.duration}
          </span>
        </div>
      </div>
    </div>
  );
}

export default InfoCard;