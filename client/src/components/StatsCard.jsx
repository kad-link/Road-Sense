import React from 'react';

function StatsCard({ title, info, subtitle, icon: Icon }) {
  return (
    <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between transition-all hover:border-zinc-700">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">
          {title}
        </span>
        {Icon && (
          <div className="w-8 h-8 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-400">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div>
        <div className="text-3xl sm:text-4xl font-semibold font-mono tracking-tight text-white">
          {info}
        </div>
        {subtitle && (
          <p className="text-xs text-zinc-500 mt-1">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

export default StatsCard;