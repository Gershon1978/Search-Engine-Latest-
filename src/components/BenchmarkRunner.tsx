import React from 'react';
import { Play, CheckCircle, Clock, Zap, AlertCircle } from 'lucide-react';
import { BENCHMARK_BIKES } from '../data/benchmarks';
import { BenchmarkBike } from '../types/bike';

interface BenchmarkRunnerProps {
  selectedBikeId?: string;
  onSelectBike: (bike: BenchmarkBike, mode: 'live' | 'instant') => void;
  isRunningBatch: boolean;
  batchProgress: { current: number; total: number; activeId?: string } | null;
  onRunBatchSuite: () => void;
}

export const BenchmarkRunner: React.FC<BenchmarkRunnerProps> = ({
  selectedBikeId,
  onSelectBike,
  isRunningBatch,
  batchProgress,
  onRunBatchSuite,
}) => {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 font-mono text-xs">
      {/* Header and batch runner trigger */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-3 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-zinc-100 font-sans">
              10-Bike Benchmark Testbench
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800/40">
              10 Standard Test Targets
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 mt-0.5 font-sans">
            Curated tricky standards: BB95, PF30a, BBRight, Italian 70mm, OverDrive 2, Hover Bar, and IsoStrut
          </p>
        </div>

        <button
          onClick={onRunBatchSuite}
          disabled={isRunningBatch}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-amber-500 hover:bg-amber-400 disabled:bg-zinc-800 text-zinc-950 disabled:text-zinc-500 font-semibold text-xs font-sans transition shadow-sm"
        >
          {isRunningBatch ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
              <span>
                Running Suite ({batchProgress?.current}/{batchProgress?.total})...
              </span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Run All 10 Benchmark Suite</span>
            </>
          )}
        </button>
      </div>

      {/* 10 Benchmark Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2.5">
        {BENCHMARK_BIKES.map((bike, idx) => {
          const isSelected = selectedBikeId === bike.id;
          const isCurrentBatch = batchProgress?.activeId === bike.id;

          return (
            <div
              key={bike.id}
              className={`p-2.5 rounded-md border transition flex flex-col justify-between gap-2 ${
                isCurrentBatch
                  ? 'bg-amber-950/30 border-amber-500 ring-1 ring-amber-500'
                  : isSelected
                  ? 'bg-zinc-800/90 border-zinc-600 ring-1 ring-zinc-500'
                  : 'bg-zinc-950/80 border-zinc-800/90 hover:border-zinc-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-[10px] text-zinc-500">#{idx + 1}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 truncate max-w-[100px]">
                    {bike.category.split('/')[0]}
                  </span>
                </div>
                <div className="font-sans font-semibold text-zinc-200 text-xs leading-snug line-clamp-1" title={bike.name}>
                  {bike.name}
                </div>
                <div className="text-[10px] text-amber-400/90 font-mono mt-1 truncate" title={bike.expected_bb}>
                  BB: {bike.expected_bb.split('(')[0]}
                </div>
                <div className="text-[10px] text-zinc-400 font-sans mt-0.5 line-clamp-2" title={bike.focal_test}>
                  {bike.focal_test}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-1 pt-1.5 border-t border-zinc-800/60">
                <button
                  onClick={() => onSelectBike(bike, 'instant')}
                  disabled={isRunningBatch}
                  className="px-1.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/60 text-[10px] flex items-center justify-center gap-1 transition"
                  title="Load instant verified benchmark result"
                >
                  <Zap className="w-2.5 h-2.5 text-amber-400" />
                  <span>Instant</span>
                </button>
                <button
                  onClick={() => onSelectBike(bike, 'live')}
                  disabled={isRunningBatch}
                  className="px-1.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-amber-300 border border-amber-800/40 text-[10px] flex items-center justify-center gap-1 transition"
                  title="Dispatch live web queries to OEM technical manuals"
                >
                  <Play className="w-2.5 h-2.5 fill-current" />
                  <span>Live Web</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
