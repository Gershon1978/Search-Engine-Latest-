import React, { useState } from 'react';
import {
  CheckCircle2,
  Copy,
  Check,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Camera,
  Layers,
  Wrench,
  Tag,
  Cpu,
  Target,
  Sparkles,
} from 'lucide-react';
import { CertaintyMatrixRow, VisualDiagnosticTag } from '../types/bikeQuery';

interface CertaintyMatrixTableProps {
  matrixRows: CertaintyMatrixRow[];
  brokenPartId: string;
  activeVisualTag: VisualDiagnosticTag | null;
  onLockVariant: (partCategory: string, skuOrSpec: string, generationLabel?: string) => void;
  locallyLockedSkus: Record<string, string>;
}

export const CertaintyMatrixTable: React.FC<CertaintyMatrixTableProps> = ({
  matrixRows,
  brokenPartId,
  activeVisualTag,
  onLockVariant,
  locallyLockedSkus,
}) => {
  const [copiedSku, setCopiedSku] = useState<string | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSku(text);
    setTimeout(() => setCopiedSku(null), 2000);
  };

  // Reorder rows so the detected broken part is pinned as Row 1
  const sortedRows = [...matrixRows].sort((a, b) => {
    const aIsBroken = a.part_category === brokenPartId;
    const bIsBroken = b.part_category === brokenPartId;
    if (aIsBroken && !bIsBroken) return -1;
    if (!aIsBroken && bIsBroken) return 1;
    return 0;
  });

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden shadow-2xl flex flex-col font-mono text-xs">
      {/* Table Canvas Header */}
      <div className="px-4 py-3 bg-zinc-900/90 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <h2 className="font-sans font-bold text-sm text-zinc-100 tracking-tight">
            Part Certainty Matrix
          </h2>
          <span className="text-[10px] text-zinc-400 font-sans">
            Flows Left-to-Right: <strong>Confirmed Baseline</strong> → <strong>High-Probability Candidate</strong> → <strong>Legacy Variant</strong> → <strong>Speculative Risk</strong>
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px] font-sans">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-zinc-300">1. Confirmed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span className="text-zinc-300">2. Primary Candidate</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-zinc-300">3. Legacy Generation</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            <span className="text-zinc-300">4. Aftermarket Risk</span>
          </div>
        </div>
      </div>

      {/* Main Responsive Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1020px]">
          <thead>
            <tr className="bg-zinc-900/60 text-zinc-400 border-b border-zinc-800 text-[11px] font-sans uppercase tracking-wider">
              <th className="py-2.5 px-3.5 w-[14%] font-semibold">Part / System</th>
              <th className="py-2.5 px-3.5 w-[22%] font-semibold text-emerald-400 bg-emerald-950/20 border-l border-r border-emerald-900/30">
                1. Confirmed (100% Locked)
              </th>
              <th className="py-2.5 px-3.5 w-[18%] font-semibold text-cyan-300 bg-cyan-950/10">
                2. High-Probability Candidate
              </th>
              <th className="py-2.5 px-3.5 w-[18%] font-semibold text-amber-300 bg-amber-950/10 border-l border-zinc-800/60">
                3. Competing Legacy Variant
              </th>
              <th className="py-2.5 px-3.5 w-[14%] font-semibold text-rose-300/80 border-l border-zinc-800/60">
                4. Aftermarket Risk
              </th>
              <th className="py-2.5 px-3.5 w-[14%] font-semibold text-indigo-300 border-l border-zinc-800/60">
                Visual Diagnostic Cue
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/80">
            {sortedRows.map((row) => {
              const isTargetBroken = row.part_category === brokenPartId;

              // Check if SKU is locked via active visual tag or user manual click
              const tagLockedSku = activeVisualTag?.resolves_part_skus?.[row.part_category];
              const manualLockedSku = locallyLockedSkus[row.part_category];
              const dynamicLockedSku = manualLockedSku || tagLockedSku || row.confirmed_baseline.locked_sku;
              const isFullyLocked = !!dynamicLockedSku;

              return (
                <tr
                  key={row.part_category}
                  className={`transition-colors ${
                    isTargetBroken
                      ? 'bg-cyan-950/25 border-l-4 border-l-cyan-400 border-y border-y-cyan-500/40 ring-1 ring-cyan-500/30'
                      : 'hover:bg-zinc-900/40'
                  }`}
                >
                  {/* Column 1: Part / System (With Target Badge) */}
                  <td className="py-3 px-3.5 align-top">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 font-sans font-bold text-xs text-zinc-100">
                        {isTargetBroken && <Target className="w-3.5 h-3.5 text-cyan-400 animate-spin" />}
                        <span>{row.part_label}</span>
                      </div>

                      {isTargetBroken ? (
                        <div className="inline-flex items-center gap-1 text-[10px] font-sans font-bold px-2 py-0.5 rounded bg-cyan-500 text-zinc-950">
                          <span>🎯 TARGET BROKEN PART</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-zinc-500 uppercase">{row.part_category}</span>
                      )}
                    </div>
                  </td>

                  {/* Column 2: Confirmed (100% Locked) */}
                  <td className="py-3 px-3.5 align-top bg-emerald-950/15 border-l border-r border-emerald-900/30">
                    <div className="space-y-2">
                      {isFullyLocked ? (
                        <div className="p-2 rounded bg-emerald-950/50 border border-emerald-600/70 text-emerald-100 space-y-1.5">
                          <div className="flex items-center justify-between text-[11px] font-bold text-emerald-300">
                            <span className="flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span>LOCKED SKU:</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopy(dynamicLockedSku)}
                              className="px-1.5 py-0.5 rounded bg-emerald-900 hover:bg-emerald-800 text-emerald-200 text-[10px] flex items-center gap-1 transition"
                              title="Copy SKU for order"
                            >
                              {copiedSku === dynamicLockedSku ? (
                                <>
                                  <Check className="w-3 h-3 text-white" />
                                  <span>Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Copy SKU</span>
                                </>
                              )}
                            </button>
                          </div>
                          <div className="font-mono text-xs font-bold text-white break-words">
                            {dynamicLockedSku}
                          </div>
                          {activeVisualTag && tagLockedSku && (
                            <div className="text-[9px] text-emerald-300/80 font-sans">
                              Locked via clue: <em>"{activeVisualTag.label}"</em>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="p-2 rounded bg-zinc-900/80 border border-zinc-700/60 text-zinc-300 space-y-1">
                          <div className="flex items-center gap-1 text-[10px] text-zinc-400 uppercase font-semibold">
                            <span>Immutable Baseline:</span>
                          </div>
                          <div className="text-zinc-100 font-sans text-xs">
                            {row.confirmed_baseline.summary}
                          </div>
                          <div className="text-[10px] text-amber-400 font-sans flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-amber-400" />
                            <span>Select visual clue in Col 2/3 to lock exact SKU</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Column 3: High-Probability Candidate */}
                  <td className="py-3 px-3.5 align-top bg-cyan-950/10">
                    {row.high_probability_candidate ? (
                      <div className="space-y-1.5">
                        <div className="text-zinc-100 font-semibold text-xs leading-snug">
                          {row.high_probability_candidate.sku_or_spec}
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-cyan-300">
                          <span>Years: {row.high_probability_candidate.years_applicable}</span>
                          <span className="font-bold">{(row.high_probability_candidate.probability * 100).toFixed(0)}% prob</span>
                        </div>

                        {/* Confirmation Button to promote to Col 1 */}
                        <button
                          type="button"
                          onClick={() =>
                            onLockVariant(
                              row.part_category,
                              row.high_probability_candidate!.sku_or_spec,
                              row.high_probability_candidate!.years_applicable
                            )
                          }
                          className="w-full mt-1 px-2 py-1 rounded bg-cyan-950 hover:bg-cyan-900 text-cyan-200 border border-cyan-800 text-[10px] font-sans font-semibold flex items-center justify-center gap-1 transition"
                        >
                          <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                          <span>Confirm This Variant →</span>
                        </button>
                      </div>
                    ) : (
                      <span className="text-zinc-500 italic">No primary variant</span>
                    )}
                  </td>

                  {/* Column 4: Competing / Legacy Generation Variant */}
                  <td className="py-3 px-3.5 align-top bg-amber-950/10 border-l border-zinc-800/60">
                    {row.competing_legacy_candidates && row.competing_legacy_candidates.length > 0 ? (
                      <div className="space-y-2">
                        {row.competing_legacy_candidates.map((comp, cIdx) => (
                          <div key={cIdx} className="p-1.5 rounded bg-zinc-950/80 border border-amber-900/40 space-y-1">
                            <div className="text-amber-200 font-semibold text-xs">
                              {comp.sku_or_spec}
                            </div>
                            <div className="text-[10px] text-zinc-400">
                              Years: <span className="text-amber-300">{comp.years_applicable}</span>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                onLockVariant(row.part_category, comp.sku_or_spec, comp.years_applicable)
                              }
                              className="w-full px-1.5 py-0.5 rounded bg-amber-950 hover:bg-amber-900 text-amber-200 border border-amber-800/60 text-[9px] font-sans font-semibold flex items-center justify-center gap-1 transition"
                            >
                              <span>Confirm This Variant →</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-zinc-600 italic">No legacy variants (Standard unchanged)</span>
                    )}
                  </td>

                  {/* Column 5: Speculative / Aftermarket Swap Risk */}
                  <td className="py-3 px-3.5 align-top border-l border-zinc-800/60 text-[11px] text-zinc-300 font-sans leading-relaxed">
                    <div className="flex items-start gap-1">
                      <span className="text-rose-400 shrink-0 font-bold">⚠</span>
                      <span>{row.speculative_aftermarket_risk}</span>
                    </div>
                  </td>

                  {/* Column 6: Visual Diagnostic Cue */}
                  <td className="py-3 px-3.5 align-top border-l border-zinc-800/60 text-[11px] font-sans">
                    <div className="p-2 rounded bg-indigo-950/20 border border-indigo-900/40 text-indigo-200 leading-snug space-y-1">
                      <div className="flex items-center gap-1 text-[10px] text-indigo-400 font-bold uppercase">
                        <Camera className="w-3 h-3 text-indigo-400" />
                        <span>Andrey AI Video Check:</span>
                      </div>
                      <p className="text-zinc-300">{row.visual_diagnostic_cue}</p>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
