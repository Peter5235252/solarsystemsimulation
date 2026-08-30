import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Globe, ArrowUpRight } from 'lucide-react';

export interface SearchSource {
  title: string;
  url: string;
  snippet: string;
  sourceIndex: number;
  domain: string;
}

interface CitationPillProps {
  sourceIndex: number;
  source: SearchSource;
  onSelect?: () => void;
}

export const CitationPill: React.FC<CitationPillProps> = ({ sourceIndex, source, onSelect }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <span className="relative inline-block mx-0.5 align-baseline">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          if (source.url) {
            window.open(source.url, '_blank', 'noopener,noreferrer');
          }
          if (onSelect) onSelect();
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="inline-flex items-center justify-center px-1.5 py-0.2 text-[11px] font-mono font-bold rounded bg-cyan-950/90 hover:bg-cyan-900 border border-cyan-500/50 hover:border-cyan-400 text-cyan-300 hover:text-white transition-all shadow-sm active:scale-95 cursor-pointer"
        title={`[${sourceIndex}] ${source.title}`}
      >
        [{sourceIndex}]
      </button>

      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 2, scale: 0.96 }}
            transition={{ duration: 0.12 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 bg-slate-900/95 dual-kawase-glass border border-cyan-500/40 rounded-xl p-3 shadow-2xl shadow-black/90 text-left z-50 pointer-events-none"
          >
            <div className="flex items-center justify-between gap-1.5 mb-1.5 text-[10px] font-mono text-cyan-400 font-semibold">
              <span className="flex items-center gap-1.5 truncate">
                <Globe className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="truncate">Source [{sourceIndex}] • {source.domain || 'Verified Web'}</span>
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            </div>
            <div className="text-xs font-semibold text-slate-100 line-clamp-2 leading-snug mb-1">
              {source.title}
            </div>
            {source.snippet && (
              <p className="text-[11px] text-slate-300 font-light line-clamp-3 leading-relaxed mb-1.5">
                "{source.snippet}"
              </p>
            )}
            <div className="text-[9px] font-mono text-cyan-300/80 truncate border-t border-white/10 pt-1">
              {source.url}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
};

export function formatCitationsInText(text: string, sources?: SearchSource[]): string {
  if (!sources || sources.length === 0 || !text) return text;

  // Replace comma-separated brackets [1, 2] -> [1][2]
  let processed = text.replace(/\[(\d+(?:\s*,\s*\d+)+)\]/g, (_, group) => {
    return group.split(/\s*,\s*/).map((n: string) => `[${n}]`).join('');
  });

  // Replace [N] with [[N]](#source-N) if valid
  processed = processed.replace(/\[(\d+)\]/g, (match, numStr) => {
    const num = parseInt(numStr, 10);
    if (num >= 1 && num <= sources.length) {
      return `[[${num}]](#source-${num})`;
    }
    return match;
  });

  return processed;
}
