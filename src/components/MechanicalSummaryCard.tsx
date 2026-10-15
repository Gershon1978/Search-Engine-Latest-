import React from 'react';
import { Wrench, Layers, Tag, AlertTriangle, ShieldCheck, Cpu } from 'lucide-react';
import { BikeQueryResponse } from '../types/bike';

interface MechanicalSummaryCardProps {
  data: BikeQueryResponse;
}

export const MechanicalSummaryCard: React.FC<MechanicalSummaryCardProps> = ({ data }) => {
  const specs = data.mechanical_specifications;
  const standards = specs?.standards;
  const skus = specs?.critical_replacement_skus;
  const variants = data.model_year_variants || [];
  const proprietary = specs?.proprietary_hardware || [];

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 space-y-4 text-xs font-mono">
      {/* Title / Identity Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-zinc-100 font-sans font-semibold text-base">
              {data.canonical_identity?.standardized_brand}{' '}
              {data.canonical_identity?.standardized_model}
            </span>
            {data.target?.model_year && (
              <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono text-[11px]">
                {data.target.model_year}
              </span>
            )}
          </div>
          <p className="text-zinc-400 font-sans text-xs">
            {data.canonical_identity?.category} · Frame: {specs?.frame_material || 'N/A'} · Wheels: {specs?.wheel_size || 'N/A'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded bg-amber-950/40 border border-amber-800/40 text-amber-300 text-[11px] font-sans">
            Trim: {data.target?.trim || 'Standard'}
          </span>
        </div>
      </div>

      {/* Critical Standards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Bottom Bracket */}
        <div className="bg-zinc-950 p-3 rounded border border-zinc-800/80 flex flex-col gap-1">
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider flex items-center gap-1">
            <Wrench className="w-3 h-3 text-amber-400" />
            Bottom Bracket Standard
          </div>
          <div className="text-zinc-100 font-semibold text-xs leading-snug">
            {standards?.bottom_bracket || 'N/A'}
          </div>
          {skus?.bottom_bracket_replacement && (
            <div className="text-[10px] text-zinc-400 mt-0.5">
              Ref: <span className="text-zinc-300">{skus.bottom_bracket_replacement}</span>
            </div>
          )}
        </div>

        {/* Derailleur Hanger SKU */}
        <div className="bg-zinc-950 p-3 rounded border border-zinc-800/80 flex flex-col gap-1">
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider flex items-center gap-1">
            <Tag className="w-3 h-3 text-emerald-400" />
            Derailleur Hanger SKU
          </div>
          <div className="text-zinc-100 font-semibold text-xs leading-snug">
            {skus?.derailleur_hanger || 'N/A'}
          </div>
          <div className="text-[10px] text-zinc-400 mt-0.5">
            Axle: <span className="text-zinc-300">{standards?.rear_axle_spacing || 'N/A'}</span>
          </div>
        </div>

        {/* Headset & Seatpost */}
        <div className="bg-zinc-950 p-3 rounded border border-zinc-800/80 flex flex-col gap-1">
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider flex items-center gap-1">
            <Layers className="w-3 h-3 text-blue-400" />
            Headset & Seatpost
          </div>
          <div className="text-zinc-200 text-xs">
            Headset: <span className="text-zinc-100 font-medium">{standards?.headset || 'N/A'}</span>
          </div>
          <div className="text-zinc-200 text-xs">
            Post: <span className="text-zinc-100 font-medium">{standards?.seatpost_diameter || 'N/A'}</span>
          </div>
        </div>

        {/* Drivetrain & Brakes */}
        <div className="bg-zinc-950 p-3 rounded border border-zinc-800/80 flex flex-col gap-1">
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider flex items-center gap-1">
            <Cpu className="w-3 h-3 text-purple-400" />
            Drivetrain & Brakes
          </div>
          <div className="text-zinc-200 text-[11px] truncate">
            Rear Der: {specs?.drivetrain?.rear_derailleur || 'N/A'}
          </div>
          <div className="text-zinc-200 text-[11px] truncate">
            Brakes: {specs?.brakes?.caliper_lever_model || 'N/A'}
          </div>
        </div>
      </div>

      {/* Proprietary Hardware Section */}
      {proprietary.length > 0 && (
        <div className="bg-zinc-950/60 p-3 rounded border border-zinc-800/70">
          <div className="text-[10px] text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5 font-sans font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            Proprietary Hardware & Specialized Systems
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {proprietary.map((item, idx) => (
              <div key={idx} className="p-2 rounded bg-zinc-900 border border-zinc-800 text-[11px]">
                <div className="flex items-center justify-between font-semibold text-zinc-200 mb-0.5">
                  <span>{item.component_name}</span>
                  {item.part_number_or_sku && (
                    <span className="text-[10px] text-amber-400/90 font-mono">
                      {item.part_number_or_sku}
                    </span>
                  )}
                </div>
                <p className="text-zinc-400 font-sans text-xs">{item.technical_notes}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Model Year Generation Evolution */}
      {variants.length > 0 && (
        <div className="bg-zinc-950/80 p-3 rounded border border-zinc-800/70">
          <div className="text-[10px] text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5 font-sans font-semibold">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            Generation Evolution & Mechanic Warnings
          </div>
          <div className="space-y-2">
            {variants.map((v, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded bg-zinc-900/90 border border-zinc-800 flex flex-col gap-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-zinc-200">{v.generation_name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">
                    {v.year_range[0]} – {v.year_range[1]}
                  </span>
                </div>

                {/* Varying parts tags */}
                {v.varying_parts && (
                  <div className="flex flex-wrap gap-1.5 text-[10px]">
                    {Object.entries(v.varying_parts).map(([part, spec], pIdx) => (
                      <span
                        key={pIdx}
                        className="px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-300"
                      >
                        <span className="text-zinc-500 uppercase">{part}:</span> {spec}
                      </span>
                    ))}
                  </div>
                )}

                {v.mechanic_warning && (
                  <p className="text-amber-300/90 font-sans text-xs bg-amber-950/20 px-2 py-1 rounded border border-amber-900/30">
                    ⚠ {v.mechanic_warning}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
