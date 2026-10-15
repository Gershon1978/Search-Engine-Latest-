import React, { useState, useEffect } from 'react';
import {
  Video,
  ShieldCheck,
  ShieldAlert,
  Layers,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Camera,
  Play,
  RotateCcw,
  Eye,
  Info,
  Check,
  Zap,
} from 'lucide-react';
import {
  FrameRecognitionReport,
  SampleWalkaroundPreset,
  FrameViewKey,
} from '../types/frameRecognition';

interface MultiViewFrameRecognitionProps {
  onApplyConfirmedBike: (bikeName: string) => void;
}

export const MultiViewFrameRecognition: React.FC<MultiViewFrameRecognitionProps> = ({
  onApplyConfirmedBike,
}) => {
  const [presets, setPresets] = useState<SampleWalkaroundPreset[]>([]);
  const [selectedPresetId, setSelectedPresetId] = useState<string>(
    'preset-gt-avalanche-walkaround'
  );
  const [customNotes, setCustomNotes] = useState<string>('');
  const [report, setReport] = useState<FrameRecognitionReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeViewTab, setActiveViewTab] = useState<FrameViewKey | 'all'>('all');
  const [selectedDisambiguationOption, setSelectedDisambiguationOption] = useState<string | null>(null);

  // Load sample presets on mount
  useEffect(() => {
    fetch('/api/frame-recognition/presets')
      .then((res) => res.json())
      .then((data) => {
        if (data.presets) {
          setPresets(data.presets);
        }
      })
      .catch((e) => console.error('Failed to load presets:', e));
  }, []);

  // Run pipeline when preset or search triggers
  const runRecognition = async (presetId?: string, notes?: string) => {
    setIsLoading(true);
    setError(null);
    setSelectedDisambiguationOption(null);

    try {
      const response = await fetch('/api/frame-recognition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preset_id: presetId || (notes ? undefined : selectedPresetId),
          notes_or_text: notes || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data: FrameRecognitionReport = await response.json();
      setReport(data);
    } catch (err: any) {
      console.error('Frame recognition failed:', err);
      setError(err.message || 'Frame recognition failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // Run default preset on mount
  useEffect(() => {
    runRecognition('preset-gt-avalanche-walkaround');
  }, []);

  const handleSelectPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    setCustomNotes('');
    runRecognition(presetId);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customNotes.trim()) {
      runRecognition(undefined, customNotes.trim());
    }
  };

  const stageA = report?.stage_a_manufacturer;
  const stageB = report?.stage_b_profile;
  const views = report?.stage_c_views_analyzed || [];
  const topCandidate = report?.stage_e_confirmed_bike;

  return (
    <div className="space-y-4 font-mono text-xs">
      {/* Top Banner / Walkaround Selector */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 shadow-lg space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Video className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-sans font-bold text-sm text-zinc-100">
                  Manufacturer-Gated Multi-View Frame Recognition
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800 text-[10px]">
                  5-Stage Visual Engine
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-sans mt-0.5">
                Staged frame recognition: Manufacturer Gate → Brand Profile → Multi-View Observation → Candidate Scoring → Certainty Matrix Handoff
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => runRecognition(selectedPresetId, customNotes || undefined)}
              disabled={isLoading}
              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded text-xs flex items-center gap-1.5 transition disabled:opacity-50"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Re-analyze</span>
            </button>
          </div>
        </div>

        {/* Preset Walkaround Chips */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-sans font-semibold text-zinc-300 flex items-center gap-1.5">
            <Camera className="w-3.5 h-3.5 text-emerald-400" />
            <span>Select Customer Video Walkaround Preset:</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {presets.map((preset) => {
              const isSelected = selectedPresetId === preset.id && !customNotes;
              const isNegative = preset.id === 'preset-component-only-rejection';
              return (
                <button
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset.id)}
                  className={`p-2.5 rounded-md text-left transition border flex flex-col justify-between ${
                    isSelected
                      ? 'bg-emerald-950/40 border-emerald-500/60 ring-1 ring-emerald-500/40'
                      : isNegative
                      ? 'bg-red-950/20 border-red-900/50 hover:bg-red-950/30'
                      : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <span className="font-sans font-medium text-zinc-200 text-[11px] line-clamp-1">
                      {preset.title.replace('Customer Video: ', '')}
                    </span>
                    {isNegative ? (
                      <span className="px-1.5 py-0.2 rounded bg-red-900/60 text-red-300 text-[9px]">
                        Trap Test
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 text-[9px]">
                        {preset.bike_category}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-zinc-500 font-sans line-clamp-1">
                    {preset.expected_model} ({preset.expected_generation})
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Text/Observation Search Bar */}
        <form onSubmit={handleCustomSubmit} className="flex gap-2 pt-1 border-t border-zinc-800/60">
          <div className="relative flex-1">
            <input
              type="text"
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              placeholder="Or test custom visual notes (e.g., 'GT triple triangle floating stays', 'Specialized Brose motor pre-UDH', 'Shimano Deore only')..."
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded text-zinc-100 placeholder-zinc-500 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !customNotes.trim()}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-sans font-semibold rounded text-xs transition disabled:opacity-50 flex items-center gap-1.5"
          >
            <span>Analyze Notes</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center space-y-3">
          <div className="inline-block p-3 rounded-full bg-emerald-500/10 text-emerald-400 animate-pulse">
            <Video className="w-6 h-6 animate-spin" />
          </div>
          <div className="space-y-1">
            <p className="font-sans font-semibold text-zinc-200 text-sm">
              Analyzing Customer Video Across 6 Canonical Views...
            </p>
            <p className="text-zinc-500 text-xs font-mono">
              Stage A: Gating manufacturer logos → Stage B: Evaluating profile rules → Stage C: Extracting frame characteristics
            </p>
          </div>
        </div>
      )}

      {/* Pipeline Results View */}
      {!isLoading && report && (
        <div className="space-y-4">
          {/* 5-Stage Visual Stepper Header */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {/* Stage A */}
            <div
              className={`p-2.5 rounded-lg border ${
                stageA?.status === 'CONFIRMED'
                  ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-300'
                  : stageA?.status === 'COMPONENT_ONLY_WARNING'
                  ? 'bg-red-950/40 border-red-500/50 text-red-300'
                  : 'bg-amber-950/30 border-amber-500/50 text-amber-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                  Stage A: Gate
                </span>
                {stageA?.status === 'CONFIRMED' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                )}
              </div>
              <div className="font-sans font-bold text-xs truncate">
                {stageA?.manufacturer || 'Unknown'}
              </div>
              <div className="text-[10px] opacity-80 mt-0.5">
                {stageA?.status === 'CONFIRMED'
                  ? `${Math.round((stageA.confidence || 0) * 100)}% Confidence`
                  : stageA?.status}
              </div>
            </div>

            {/* Stage B */}
            <div
              className={`p-2.5 rounded-lg border ${
                stageB
                  ? 'bg-blue-950/30 border-blue-500/50 text-blue-300'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-500'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                  Stage B: Profile
                </span>
                <Layers className="w-3.5 h-3.5" />
              </div>
              <div className="font-sans font-bold text-xs truncate">
                {stageB?.brand_name ? `${stageB.brand_name} Profile` : 'Gated / Inactive'}
              </div>
              <div className="text-[10px] opacity-80 mt-0.5">
                {stageB ? `${stageB.active_rules_count} Signature Rules` : 'Waiting on Gate'}
              </div>
            </div>

            {/* Stage C */}
            <div
              className={`p-2.5 rounded-lg border ${
                views.length > 0
                  ? 'bg-purple-950/30 border-purple-500/50 text-purple-300'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-500'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                  Stage C: Multi-View
                </span>
                <Eye className="w-3.5 h-3.5" />
              </div>
              <div className="font-sans font-bold text-xs">
                {views.length} Key Views
              </div>
              <div className="text-[10px] opacity-80 mt-0.5">
                {report.stage_c_structured_observations.visual_generation_markers.length} Feature Markers
              </div>
            </div>

            {/* Stage D */}
            <div
              className={`p-2.5 rounded-lg border ${
                report.stage_d_candidates.length > 0
                  ? 'bg-amber-950/30 border-amber-500/50 text-amber-300'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-500'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                  Stage D: Scoring
                </span>
                <Wrench className="w-3.5 h-3.5" />
              </div>
              <div className="font-sans font-bold text-xs">
                {report.stage_d_candidates.length} Candidates
              </div>
              <div className="text-[10px] opacity-80 mt-0.5">
                Top: {topCandidate ? `${topCandidate.confidence_score}%` : 'N/A'}
              </div>
            </div>

            {/* Stage E */}
            <div
              className={`p-2.5 rounded-lg border col-span-2 md:col-span-1 ${
                topCandidate
                  ? 'bg-emerald-900/40 border-emerald-400 text-emerald-200 ring-1 ring-emerald-400/50'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-500'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                  Stage E: Handoff
                </span>
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="font-sans font-bold text-xs truncate">
                {topCandidate ? topCandidate.model : 'Unconfirmed'}
              </div>
              <div className="text-[10px] opacity-80 mt-0.5">
                {topCandidate ? topCandidate.year_range : 'No Match'}
              </div>
            </div>
          </div>

          {/* STAGE A GUARD ALERT (If Component Only or Ambiguous) */}
          {stageA?.status === 'COMPONENT_ONLY_WARNING' && (
            <div className="bg-red-950/40 border border-red-800/80 rounded-lg p-4 space-y-2.5">
              <div className="flex items-start gap-2.5">
                <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h3 className="font-sans font-bold text-red-200 text-sm">
                    Stage A Gate Halted: Component Manufacturer Detected, NOT Frame Manufacturer!
                  </h3>
                  <p className="text-zinc-300 text-xs font-sans leading-relaxed">
                    {stageA.rejection_reason}
                  </p>
                </div>
              </div>

              <div className="bg-zinc-950/70 border border-red-900/40 rounded p-2.5 text-[11px] space-y-1">
                <div className="text-red-300 font-semibold flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5" />
                  <span>Targeted Mechanic Action Required:</span>
                </div>
                <p className="text-zinc-400 font-sans">
                  {stageA.requested_additional_view}
                </p>
              </div>
            </div>
          )}

          {/* WINNING STAGE E CONFIRMATION CARD & CERTAINTY MATRIX HANDOFF */}
          {topCandidate && (
            <div className="bg-gradient-to-r from-emerald-950/50 via-zinc-900 to-zinc-900 border-2 border-emerald-500/60 rounded-lg p-4 shadow-xl space-y-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-900 text-emerald-300 font-bold text-[10px] tracking-wide uppercase">
                      Confirmed Bicycle
                    </span>
                    <span className="text-zinc-400 text-xs font-mono">
                      {topCandidate.year_range} ({topCandidate.generation_name})
                    </span>
                  </div>
                  <h3 className="text-lg font-sans font-bold text-zinc-100 flex items-center gap-2">
                    <span>{topCandidate.make} {topCandidate.model}</span>
                    {topCandidate.trim_level && (
                      <span className="text-sm font-normal text-emerald-400">
                        • {topCandidate.trim_level}
                      </span>
                    )}
                  </h3>
                  <p className="text-zinc-400 font-sans text-xs">
                    {topCandidate.distinguishing_cue}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <button
                    onClick={() => onApplyConfirmedBike(report.query_engine_string)}
                    className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-sans font-bold rounded-md shadow-lg flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <Wrench className="w-4 h-4" />
                    <span>Apply to Part Certainty Matrix</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Exact Locked Standards Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-zinc-800">
                <div className="bg-zinc-950/80 border border-zinc-800 rounded p-2">
                  <span className="text-[10px] text-zinc-500 block uppercase">Derailleur Hanger</span>
                  <span className="font-semibold text-zinc-200 text-[11px] truncate block">
                    {topCandidate.confirmed_hanger_sku || 'N/A'}
                  </span>
                </div>
                <div className="bg-zinc-950/80 border border-zinc-800 rounded p-2">
                  <span className="text-[10px] text-zinc-500 block uppercase">Bottom Bracket Shell</span>
                  <span className="font-semibold text-zinc-200 text-[11px] truncate block">
                    {topCandidate.confirmed_bb_standard || 'N/A'}
                  </span>
                </div>
                <div className="bg-zinc-950/80 border border-zinc-800 rounded p-2">
                  <span className="text-[10px] text-zinc-500 block uppercase">Confidence Score</span>
                  <span className="font-semibold text-emerald-400 text-[11px] flex items-center gap-1.5">
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    {topCandidate.confidence_score}% Confirmed
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TARGETED DISAMBIGUATION QUESTION (If minor ambiguity exists) */}
          {report.stage_e_disambiguation && (
            <div className="bg-zinc-900 border border-amber-500/40 rounded-lg p-3.5 space-y-2.5">
              <div className="flex items-center gap-2 text-amber-400">
                <AlertTriangle className="w-4 h-4" />
                <h4 className="font-sans font-semibold text-xs text-zinc-200">
                  Targeted Disambiguation: {report.stage_e_disambiguation.prompt}
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {report.stage_e_disambiguation.options.map((opt) => {
                  const isSelected = selectedDisambiguationOption === opt.option_id;
                  return (
                    <button
                      key={opt.option_id}
                      onClick={() => {
                        setSelectedDisambiguationOption(opt.option_id);
                        onApplyConfirmedBike(
                          `${topCandidate?.make || ''} ${topCandidate?.model || ''} ${opt.resolves_to_trim_or_year}`
                        );
                      }}
                      className={`p-2 rounded text-left border transition text-xs ${
                        isSelected
                          ? 'bg-amber-950/60 border-amber-500 text-amber-200 font-semibold'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{opt.label}</span>
                        {isSelected && <Check className="w-3 h-3 text-amber-400" />}
                      </div>
                      <span className="text-[10px] text-zinc-500 block mt-0.5">
                        Resolves: {opt.resolves_to_trim_or_year}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 6 CANONICAL MULTI-ANGLE VIEWS BREAKDOWN (STAGE C) */}
          {views.length > 0 && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-purple-400" />
                  <h3 className="font-sans font-bold text-sm text-zinc-200">
                    Stage C: Multi-View Observation Grid (6 Canonical Perspectives)
                  </h3>
                </div>
                <span className="text-[10px] text-zinc-500 font-mono">
                  Walkaround video frame analysis
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {views.map((view, idx) => (
                  <div
                    key={view.view_key}
                    className="bg-zinc-950 border border-zinc-800/80 rounded-lg p-3 space-y-2 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="px-1.5 py-0.5 rounded bg-purple-950/70 border border-purple-800/60 text-purple-300 text-[10px] font-bold">
                          View {idx + 1}
                        </span>
                        <span className="text-[10px] text-zinc-500">
                          {Math.round(view.confidence * 100)}% quality
                        </span>
                      </div>
                      <h4 className="font-sans font-semibold text-xs text-zinc-200 mb-1">
                        {view.view_name}
                      </h4>
                      <p className="text-[11px] text-zinc-400 font-sans leading-relaxed mb-2">
                        {view.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-zinc-900 space-y-1">
                      <span className="text-[9px] text-zinc-500 uppercase tracking-wider block">
                        Detected Features:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {view.detected_features.map((feat, fIdx) => (
                          <span
                            key={fIdx}
                            className="px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800 text-[10px]"
                          >
                            {feat}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STAGE D: CANDIDATE RANKING TABLE */}
          {report.stage_d_candidates.length > 0 && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-400" />
                  <h3 className="font-sans font-bold text-sm text-zinc-200">
                    Stage D: Candidate Scoring & Generational Ranking
                  </h3>
                </div>
                <span className="text-[10px] text-zinc-500">
                  Ranked by feature alignment & generational rules
                </span>
              </div>

              <div className="space-y-2.5">
                {report.stage_d_candidates.map((cand, idx) => (
                  <div
                    key={cand.candidate_id}
                    className={`p-3 rounded-lg border transition ${
                      idx === 0
                        ? 'bg-zinc-950 border-emerald-500/50 ring-1 ring-emerald-500/30'
                        : 'bg-zinc-950/60 border-zinc-800'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            idx === 0
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                              : 'bg-zinc-800 text-zinc-400'
                          }`}
                        >
                          #{idx + 1}
                        </span>
                        <span className="font-sans font-bold text-xs text-zinc-200">
                          {cand.make} {cand.model}
                        </span>
                        <span className="text-[11px] text-zinc-500 font-mono">
                          ({cand.year_range})
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 text-[10px]">
                          {cand.generation_name}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                          <div className="w-20 bg-zinc-800 h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                cand.confidence_score >= 90
                                  ? 'bg-emerald-500'
                                  : cand.confidence_score >= 60
                                  ? 'bg-amber-500'
                                  : 'bg-red-500'
                              }`}
                              style={{ width: `${cand.confidence_score}%` }}
                            />
                          </div>
                          <span
                            className={`font-mono font-bold text-xs ${
                              cand.confidence_score >= 90
                                ? 'text-emerald-400'
                                : 'text-zinc-400'
                            }`}
                          >
                            {cand.confidence_score}%
                          </span>
                        </div>

                        <button
                          onClick={() =>
                            onApplyConfirmedBike(
                              `${cand.make} ${cand.model.replace(cand.make, '').trim()} ${cand.exact_year || cand.year_range.split('–')[0]}`
                            )
                          }
                          className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded text-[11px] font-sans flex items-center gap-1 transition"
                        >
                          <span>Select</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Matching & Conflicting Feature Pills */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] pt-2 border-t border-zinc-900">
                      <div>
                        <span className="text-emerald-400 font-semibold flex items-center gap-1 mb-1">
                          <Check className="w-3 h-3" />
                          <span>Matching Features ({cand.matching_features.length}):</span>
                        </span>
                        <ul className="list-disc list-inside text-zinc-400 space-y-0.5">
                          {cand.matching_features.map((m, mIdx) => (
                            <li key={mIdx} className="line-clamp-1">{m}</li>
                          ))}
                        </ul>
                      </div>

                      {cand.conflicting_features.length > 0 && (
                        <div>
                          <span className="text-red-400 font-semibold flex items-center gap-1 mb-1">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Conflicting / Ruled Out ({cand.conflicting_features.length}):</span>
                          </span>
                          <ul className="list-disc list-inside text-zinc-400 space-y-0.5">
                            {cand.conflicting_features.map((c, cIdx) => (
                              <li key={cIdx} className="line-clamp-1">{c}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
