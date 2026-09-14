import React from 'react';
import { FileText, ExternalLink, Trash2 } from 'lucide-react';

export default function DocCard(props) {
  const handleViewFile = () => {
    if (props.fileURL) {
      window.open(props.fileURL, '_blank');
    }
  };

  return (
    <div className="bg-zinc-900/90 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-5 shadow-xl transition-all duration-300 flex flex-col justify-between group">
      <div>
        {/* Card Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-300 group-hover:text-white transition-colors">
            <FileText className="w-5 h-5 text-zinc-400 group-hover:text-zinc-200" />
          </div>
          <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-medium text-zinc-400 bg-zinc-950 border border-zinc-800">
            {props.date}
          </span>
        </div>

        {/* File Name & Description */}
        <div>
          <h3 className="text-base font-semibold text-white tracking-tight break-words line-clamp-1 group-hover:text-zinc-100" title={props.name}>
            {props.name}
          </h3>
          <p className="text-xs text-zinc-400 mt-1.5 line-clamp-2 leading-relaxed">
            {props.description}
          </p>
        </div>
      </div>

      {/* Footer Info & Actions */}
      <div className="mt-5 pt-3.5 border-t border-zinc-800/80 flex items-center justify-between">
        <span className="text-[11px] font-mono text-zinc-500">
          {props.size}
        </span>

        <div className="flex items-center gap-2">
          {props.onDelete && (
            <button
              onClick={() => props.onDelete(props.id, props.name)}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-950/40 border border-transparent hover:border-rose-900/60 transition-colors cursor-pointer"
              title="Delete document"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={handleViewFile}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Open document"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View</span>
          </button>
        </div>
      </div>
    </div>
  );
}