import React from 'react';
import { NavLink } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

function Card(props) {
  const isExternal = props.link.startsWith('http');

  const CardWrapper = ({ children }) => {
    if (isExternal) {
      return (
        <a href={props.link} target="_blank" rel="noopener noreferrer" className="block h-full">
          {children}
        </a>
      );
    }
    return (
      <NavLink to={props.link} className="block h-full">
        {children}
      </NavLink>
    );
  };

  return (
    <CardWrapper>
      <div className="group h-full bg-zinc-900/80 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col justify-between p-5 hover:-translate-y-1 shadow-lg hover:shadow-2xl">
        <div>
          {/* Card Image */}
          <div className="w-full h-44 rounded-xl overflow-hidden mb-4 bg-zinc-950 relative">
            <img 
              src={props.imgsrc} 
              alt={props.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
              loading="lazy"
            />
            {props.tag && (
              <span className="absolute top-3 right-3 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-zinc-950/80 border border-zinc-700 text-zinc-300 backdrop-blur-md">
                {props.tag}
              </span>
            )}
          </div>

          <h3 className="text-xl font-semibold text-white group-hover:text-zinc-100 tracking-tight">
            {props.title}
          </h3>

          <p className="text-zinc-400 text-xs leading-relaxed mt-2 line-clamp-3">
            {props.description}
          </p>
        </div>

        <div className="mt-5 pt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs font-semibold text-zinc-300 group-hover:text-white">
          <span>{props.actionLabel || 'Access Feature'}</span>
          <div className="w-7 h-7 rounded-lg bg-zinc-800 group-hover:bg-zinc-700 flex items-center justify-center transition-colors">
            <ArrowUpRight className="w-4 h-4 text-zinc-300 group-hover:text-white" />
          </div>
        </div>
      </div>
    </CardWrapper>
  );
}

export default Card;