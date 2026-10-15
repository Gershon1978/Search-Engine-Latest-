import React from 'react';
import { Search, Globe, Zap, AlertTriangle, ArrowRight, CornerDownLeft, Sparkles } from 'lucide-react';

interface TargetSelectorProps {
  query: string;
  setQuery: (q: string) => void;
  onSearch: (forcedQuery?: string) => void;
  isLoading: boolean;
  forceLiveWeb: boolean;
  setForceLiveWeb: (v: boolean) => void;
}

export const TargetSelector: React.FC<TargetSelectorProps> = ({
  query,
  setQuery,
  onSearch,
  isLoading,
  forceLiveWeb,
  setForceLiveWeb,
}) => {
  const quickTestChips = [
    {
      label: 'GT Av',
      subtitle: 'Truncated Multi-Gen Conflict Demo',
      query: 'GT Av',
      highlight: true,
    },
    {
      label: 'Spz Levo 2021',
      subtitle: 'Shorthand Benchmark Match',
      query: 'Spz Levo 2021',
    },
    {
      label: 'Specialized Turbo Levo 2023',
      subtitle: 'Strict Year Guard (No Bleed)',
      query: 'Specialized Turbo Levo 2023',
    },
    {
      label: 'Trek Fuel EX 8 2014',
      subtitle: 'BB95 & ABP Convert',
      query: 'Trek Fuel EX 8 2014',
    },
    {
      label: 'Canyon Grail CF SL 8',
      subtitle: 'Hover Bar Cockpit',
      query: 'Canyon Grail CF SL 8',
    },
    {
      label: 'C\'dale Super6 2020',
      subtitle: 'PF30a Asymmetric BB',
      query: "C'dale Super6 2020",
    },
    {
      label: 'SC Bronson',
      subtitle: 'VPP Shock Tunnel',
      query: 'SC Bronson',
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSearch(query);
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
            placeholder="Enter bike model or truncated shorthand (e.g. 'GT Av', 'Spz Levo 2021', 'Trek Dom SL5')..."
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
            title="When active, queries dispatch live Google Search Grounding to OEM manuals"
          >
            {forceLiveWeb ? (
              <>
                <Globe className="w-3.5 h-3.5 text-amber-400" />
                <span>Live Grounding</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 text-zinc-400" />
                <span>Benchmark Engine</span>
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
                <span>Researching...</span>
              </>
            ) : (
              <>
                <span>Research Bike</span>
                <CornerDownLeft className="w-3 h-3 text-zinc-800" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Truncated & Benchmark Quick Test Chips */}
      <div className="flex flex-wrap items-center gap-1.5 text-[11px] pt-1">
        <span className="text-zinc-500 font-sans font-medium mr-1 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-400" />
          Test Targets:
        </span>
        {quickTestChips.map((chip, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              setQuery(chip.query);
              onSearch(chip.query);
            }}
            disabled={isLoading}
            className={`px-2.5 py-1 rounded border transition text-[11px] flex items-center gap-1 ${
              chip.highlight
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 font-semibold hover:bg-amber-500/20'
                : 'bg-zinc-950 hover:bg-zinc-800 text-zinc-300 border-zinc-800'
            }`}
            title={chip.subtitle}
          >
            <span>{chip.label}</span>
            {chip.highlight && <span className="text-[9px] px-1 rounded bg-amber-500 text-zinc-950 font-bold">CONFLICT DEMO</span>}
          </button>
        ))}
      </div>
    </div>
  );
};
