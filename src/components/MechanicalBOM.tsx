import React, { useState } from 'react';
import {
  Wrench,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Search,
  Camera,
  Layers,
  ArrowRight,
  Sparkles,
  HelpCircle,
  Tag,
  Cpu,
  Info,
} from 'lucide-react';
import {
  BikeQueryResponse,
  PhotoVerificationResult,
  FitmentEvaluation,
} from '../types/bikeQuery';
import { HI5_CATALOGUE_ITEMS, evaluateComponentFitment } from '../data/hi5Catalogue';

interface MechanicalBOMProps {
  data: BikeQueryResponse;
  onConflictResolved?: (updatedData: BikeQueryResponse) => void;
}

export const MechanicalBOM: React.FC<MechanicalBOMProps> = ({ data, onConflictResolved }) => {
  const identity = data.canonical_identity;
  const specs = data.mechanical_specifications;
  const standards = specs?.standards;
  const skus = specs?.critical_replacement_skus;
  const hangerAudit = specs?.derailleur_hanger_audit;
  const structured = specs?.structured_interfaces;
  const candidates = identity?.closest_model_candidates || [];

  // OCR / Dropout stamp disambiguation state
  const [stampInput, setStampInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<PhotoVerificationResult | null>(null);

  // Fitment tester state
  const [selectedSku, setSelectedSku] = useState<string>(HI5_CATALOGUE_ITEMS[0].sku);
  const selectedItem = HI5_CATALOGUE_ITEMS.find((i) => i.sku === selectedSku);
  const fitmentEval: FitmentEvaluation | null = selectedItem
    ? evaluateComponentFitment(specs, selectedItem)
    : null;

  const handleVerifyStamp = async (overrideText?: string) => {
    const textToTest = overrideText || stampInput;
    if (!textToTest) return;

    setIsVerifying(true);
    try {
      const res = await fetch('/api/verify-part-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bike_query: `${identity.standardized_brand} ${identity.standardized_model}`,
          stamped_text_or_notes: textToTest,
        }),
      });
      const result: PhotoVerificationResult = await res.json();
      setVerificationResult(result);

      if (result.is_resolved && result.matched_sku) {
        // Find catalogue item
        const resolvedItem = HI5_CATALOGUE_ITEMS.find((c) => c.sku === result.matched_sku);
        if (resolvedItem && onConflictResolved) {
          const updated: BikeQueryResponse = JSON.parse(JSON.stringify(data));
          if (updated.mechanical_specifications.derailleur_hanger_audit) {
            updated.mechanical_specifications.derailleur_hanger_audit.status = 'VERIFIED';
            updated.mechanical_specifications.derailleur_hanger_audit.sku = resolvedItem.name;
          }
          updated.mechanical_specifications.critical_replacement_skus.derailleur_hanger = resolvedItem.name;
          if (updated.mechanical_specifications.structured_interfaces) {
            updated.mechanical_specifications.structured_interfaces.hanger_standard =
              resolvedItem.structured_spec.standard;
          }
          if (updated.verification_audit) {
            updated.verification_audit.recommended_action = 'VERIFIED';
            updated.verification_audit.notes = result.mechanic_notes;
          }
          onConflictResolved(updated);
        }
      }
    } catch (e) {
      console.error('Failed to verify stamp:', e);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-4 font-mono text-xs">
      {/* 1. Truncated Query Expansion Banner */}
      {identity?.was_expanded_from_truncated && (
        <div className="p-3 rounded-lg bg-blue-950/40 border border-blue-800/60 text-blue-200 space-y-2">
          <div className="flex items-center gap-2 font-sans font-semibold text-xs text-blue-300">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span>Truncated Query Expanded</span>
          </div>
          <div className="text-[11px] leading-relaxed">
            Expanded from <code className="px-1.5 py-0.5 rounded bg-blue-900/60 text-amber-300">"{identity.submitted_raw_query}"</code> →{' '}
            <strong className="text-zinc-100">{identity.standardized_brand} {identity.standardized_model}</strong>
          </div>

          {/* Model Candidates with Visual Disambiguation Cues */}
          {candidates.length > 0 && (
            <div className="pt-2 border-t border-blue-900/40 space-y-1.5">
              <span className="text-[10px] text-blue-400/90 uppercase tracking-wider block">
                Visual Disambiguation Cues (OCR / Scratch-off Resolution):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {candidates.map((cand, idx) => (
                  <div key={idx} className="p-2 rounded bg-zinc-950/70 border border-blue-900/40 text-[11px]">
                    <div className="flex items-center justify-between text-zinc-200 font-semibold mb-0.5">
                      <span>{cand.model_name}</span>
                      <span className="text-[10px] text-blue-400">{(cand.match_probability * 100).toFixed(0)}% prob</span>
                    </div>
                    <div className="text-zinc-400 font-sans text-xs flex items-start gap-1">
                      <span className="text-amber-400">👁</span>
                      <span>{cand.distinguishing_visual_feature}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. Multi-Generation Conflict Alert Box (e.g. "GT Av") */}
      {hangerAudit?.status === 'CONFLICT' && (
        <div className="p-4 rounded-lg bg-red-950/30 border border-red-700/60 text-red-200 space-y-3">
          <div className="flex items-center gap-2 text-red-300 font-sans font-semibold text-sm">
            <ShieldAlert className="w-5 h-5 text-red-400 animate-pulse" />
            <span>Multi-Generation Dropout Conflict Detected</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-red-900/60 text-red-200 font-mono">
              REQUIRE_PHYSICAL_CHECK
            </span>
          </div>

          <p className="text-xs text-zinc-300 font-sans leading-relaxed">
            {hangerAudit.resolution_action_prompt}
          </p>

          {/* Competing Generational Candidates */}
          {hangerAudit.competing_candidates && hangerAudit.competing_candidates.length > 0 && (
            <div className="space-y-2 pt-1">
              <div className="text-[10px] text-red-400 uppercase tracking-wider font-semibold">
                Competing Generational Variants:
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {hangerAudit.competing_candidates.map((comp, idx) => (
                  <div key={idx} className="p-2.5 rounded bg-zinc-950 border border-red-900/50 flex flex-col gap-1">
                    <div className="flex items-center justify-between text-zinc-100 font-semibold text-xs">
                      <span>{comp.sku_or_name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-950 text-red-300 border border-red-800">
                        {comp.fits_years}
                      </span>
                    </div>
                    <p className="text-zinc-400 font-sans text-xs">{comp.description}</p>
                    {comp.mounting_notes && (
                      <div className="text-[10px] text-amber-400/90 font-mono mt-0.5">
                        🔩 {comp.mounting_notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Interactive Dropout Stamp / Photo OCR Disambiguation Bar */}
          <div className="pt-3 border-t border-red-900/60 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200 font-sans">
              <Camera className="w-4 h-4 text-amber-400" />
              <span>Resolve Conflict via Dropout Stamp / Part OCR:</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={stampInput}
                onChange={(e) => setStampInput(e.target.value)}
                placeholder="Enter casting stamp or fastener notes (e.g. 'ATIDH0233', '2-Screw', '1-Bolt', 'W524188')..."
                className="flex-1 px-3 py-2 bg-zinc-950 border border-zinc-700 rounded text-zinc-100 font-sans text-xs focus:outline-none focus:border-amber-500"
              />
              <button
                type="button"
                onClick={() => handleVerifyStamp()}
                disabled={isVerifying || !stampInput.trim()}
                className="px-4 py-2 rounded bg-amber-500 hover:bg-amber-400 disabled:bg-zinc-800 text-zinc-950 disabled:text-zinc-500 font-semibold font-sans text-xs transition"
              >
                {isVerifying ? 'Verifying...' : 'Disambiguate'}
              </button>
            </div>

            {/* Quick Simulation Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
              <span className="text-zinc-500 font-sans">Simulate mechanic findings:</span>
              <button
                type="button"
                onClick={() => {
                  setStampInput('ATIDH0233 (2 tiny M3 screws)');
                  handleVerifyStamp('ATIDH0233');
                }}
                className="px-2 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 text-emerald-300 border border-emerald-800/40 transition"
              >
                Simulate "ATIDH0233" (2-Screw Modern)
              </button>
              <button
                type="button"
                onClick={() => {
                  setStampInput('ATIDH0021 (1 large chainring bolt)');
                  handleVerifyStamp('ATIDH0021');
                }}
                className="px-2 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 text-amber-300 border border-amber-800/40 transition"
              >
                Simulate "ATIDH0021" (1-Bolt Vintage)
              </button>
              <button
                type="button"
                onClick={() => {
                  setStampInput('W524188 ABP');
                  handleVerifyStamp('W524188');
                }}
                className="px-2 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 text-blue-300 border border-blue-800/40 transition"
              >
                Simulate "W524188" Trek Stamp
              </button>
            </div>

            {/* Verification Result Feedback */}
            {verificationResult && (
              <div
                className={`p-3 rounded border text-xs ${
                  verificationResult.is_resolved
                    ? 'bg-emerald-950/40 border-emerald-800 text-emerald-200'
                    : 'bg-zinc-900 border-zinc-700 text-zinc-300'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold mb-1">
                  {verificationResult.is_resolved ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Conflict Successfully Resolved!</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      <span>Additional Inspection Required</span>
                    </>
                  )}
                </div>
                <div className="font-sans text-xs">{verificationResult.mechanic_notes}</div>
                <div className="mt-1 text-[11px] font-mono text-zinc-300">
                  Recommendation: {verificationResult.suggested_action}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. Mechanical Standards Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {/* Bottom Bracket */}
        <div className="p-3 rounded bg-zinc-950 border border-zinc-800 flex flex-col justify-between gap-1">
          <div className="text-[10px] text-zinc-500 uppercase flex items-center gap-1">
            <Wrench className="w-3 h-3 text-amber-400" />
            Bottom Bracket
          </div>
          <div className="font-semibold text-zinc-100 text-xs">
            {standards?.bottom_bracket || 'N/A'}
          </div>
          <div className="text-[10px] text-zinc-400">
            Interface: <span className="text-amber-400">{structured?.bb_shell_standard || 'N/A'}</span>
          </div>
        </div>

        {/* Derailleur Hanger */}
        <div className="p-3 rounded bg-zinc-950 border border-zinc-800 flex flex-col justify-between gap-1">
          <div className="text-[10px] text-zinc-500 uppercase flex items-center gap-1">
            <Tag className="w-3 h-3 text-emerald-400" />
            Derailleur Hanger
          </div>
          <div className="font-semibold text-zinc-100 text-xs truncate">
            {hangerAudit?.status === 'CONFLICT' ? (
              <span className="text-red-400 font-bold">CONFLICT: Physical Check</span>
            ) : (
              skus?.derailleur_hanger || 'Standard Hanger'
            )}
          </div>
          <div className="text-[10px] text-zinc-400">
            Hanger Code: <span className="text-emerald-400">{structured?.hanger_standard || 'N/A'}</span>
          </div>
        </div>

        {/* Axle Spacing */}
        <div className="p-3 rounded bg-zinc-950 border border-zinc-800 flex flex-col justify-between gap-1">
          <div className="text-[10px] text-zinc-500 uppercase flex items-center gap-1">
            <Layers className="w-3 h-3 text-blue-400" />
            Rear Axle Spacing
          </div>
          <div className="font-semibold text-zinc-100 text-xs">
            {standards?.rear_axle_spacing || 'N/A'}
          </div>
          <div className="text-[10px] text-zinc-400">
            Pitch: <span className="text-blue-400">{structured?.rear_axle_standard || 'N/A'}</span>
          </div>
        </div>

        {/* Freehub & Max Rotor */}
        <div className="p-3 rounded bg-zinc-950 border border-zinc-800 flex flex-col justify-between gap-1">
          <div className="text-[10px] text-zinc-500 uppercase flex items-center gap-1">
            <Cpu className="w-3 h-3 text-purple-400" />
            Freehub & Max Rotor
          </div>
          <div className="font-semibold text-zinc-100 text-xs">
            {structured?.freehub_standard || 'SHIMANO_HG'}
          </div>
          <div className="text-[10px] text-zinc-400">
            Max Rotor: <span className="text-purple-400">{structured?.max_rotor_mm || 180}mm</span>
          </div>
        </div>
      </div>

      {/* 4. Interactive Hi5 Component Fitment Tester */}
      <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-2">
          <div className="flex items-center gap-2 font-sans font-semibold text-xs text-zinc-200">
            <Wrench className="w-4 h-4 text-amber-400" />
            <span>Hi5 Deterministic Fitment Graph Tester</span>
          </div>
          <span className="text-[10px] text-zinc-500">
            Test any component SKU against this bike's mechanical interfaces
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="sm:col-span-1">
            <label className="text-[10px] text-zinc-400 uppercase tracking-wider block mb-1">
              Select Catalogue Component:
            </label>
            <select
              value={selectedSku}
              onChange={(e) => setSelectedSku(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded text-zinc-200 text-xs focus:outline-none focus:border-amber-500"
            >
              {HI5_CATALOGUE_ITEMS.map((item) => (
                <option key={item.sku} value={item.sku}>
                  [{item.category}] {item.name}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            {fitmentEval && selectedItem && (
              <div
                className={`p-2.5 rounded border text-xs flex flex-col gap-1.5 ${
                  fitmentEval.compatibility_level === 'EXACT_MATCH'
                    ? 'bg-emerald-950/30 border-emerald-800 text-emerald-200'
                    : fitmentEval.compatibility_level === 'REQUIRES_VERIFICATION'
                    ? 'bg-amber-950/30 border-amber-800 text-amber-200'
                    : 'bg-red-950/30 border-red-800 text-red-200'
                }`}
              >
                <div className="flex items-center justify-between font-bold">
                  <span>Status: {fitmentEval.compatibility_level}</span>
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-zinc-300">
                    £{selectedItem.price_gbp.toFixed(2)} GBP {selectedItem.orders_enabled ? '· In Stock' : '· Orders Paused (Conflict Check)'}
                  </span>
                </div>

                <div className="font-sans text-xs">{fitmentEval.notes}</div>

                {fitmentEval.secondary_dependencies.length > 0 && (
                  <div className="pt-1 border-t border-zinc-800/60 text-[11px] space-y-0.5 font-mono">
                    <span className="text-amber-400 font-semibold">Secondary Dependencies:</span>
                    {fitmentEval.secondary_dependencies.map((dep, dIdx) => (
                      <div key={dIdx} className="text-zinc-300 pl-2">
                        • {dep}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
