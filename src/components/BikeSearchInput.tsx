import React, { useState } from 'react';
import { Search, Globe, Zap, ArrowRight, CornerDownLeft } from 'lucide-react';

interface BikeSearchInputProps {
  query: string;
  setQuery: (q: string) => void;
  onSearch: (forcedQuery?: string) => void;
  isLoading: boolean;
  forceLiveWeb: boolean;
  setForceLiveWeb: (v: boolean) => void;
}

export const BikeSearchInput: React.FC<BikeSearchInputProps> = ({
  query,
  setQuery,
  onSearch,
  isLoading,
  forceLiveWeb,
  setForceLiveWeb,
}) => {
  const samplePrompts = [
    'Trek Fuel EX 8 2014',
    'Canyon Grail CF SL 8',
    'Specialized Stumpjumper Comp Alloy 2021',
    'Cannondale SuperSix EVO Hi-MOD 2020',
    'Santa Cruz Megatower C 2023',
    'Pinarello Dogma F12 Disk 2020',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSearch();
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 font-mono text-xs space-y-3">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
            <Search className="w-4 h-4 text-amber-400" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter bike model & year (e.g. Trek Fuel EX 8 2014, Canyon Grail CF SL 8)..."
            className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-700/80 rounded-md text-zinc-100 placeholder-zinc-500 font-sans text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
            disabled={isLoading}
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Live web query mode toggle */}
          <button
            type="button"
            onClick={() => setForceLiveWeb(!forceLiveWeb)}
            className={`px-3 py-2.5 rounded-md border flex items-center gap-1.5 transition font-sans text-xs ${
              forceLiveWeb
                ? 'bg-amber-950/40 border-amber-600/50 text-amber-300'
                : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
            title="When active, queries are dispatched live to Google Search Grounding & OEM tech manuals"
          >
            {forceLiveWeb ? (
              <>
                <Globe className="w-3.5 h-3.5 text-amber-400" />
                <span>Live Web Grounding</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 text-zinc-400" />
                <span>Fast Benchmark Cache</span>
              </>
            )}
          </button>

          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="px-5 py-2.5 rounded-md bg-amber-500 hover:bg-amber-400 disabled:bg-zinc-800 text-zinc-950 disabled:text-zinc-500 font-semibold font-sans text-xs transition flex items-center gap-2 shadow-sm"
          >
            {isLoading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                <span>Dispatching...</span>
              </>
            ) : (
              <>
                <span>Query Bike</span>
                <CornerDownLeft className="w-3 h-3 text-zinc-800" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Suggested Quick Inputs */}
      <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-zinc-400">
        <span className="text-zinc-500">Quick tests:</span>
        {samplePrompts.map((p, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              setQuery(p);
              onSearch(p);
            }}
            disabled={isLoading}
            className="px-2 py-0.5 rounded bg-zinc-950 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition text-[11px]"
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
};
