import React, { useState } from 'react';
import {
  Search,
  Wrench,
  Camera,
  CheckCircle2,
  X,
  Sparkles,
  Tag,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { VisualDiagnosticTag, CanonicalIdentity } from '../types/bikeQuery';

export interface BrokenPartOption {
  id: string;
  label: string;
  iconName: string;
}

export const BROKEN_PART_OPTIONS: BrokenPartOption[] = [
  { id: 'derailleur_hanger', label: 'Derailleur Hanger', iconName: 'Tag' },
  { id: 'bottom_bracket', label: 'Bottom Bracket', iconName: 'Wrench' },
  { id: 'rear_derailleur', label: 'Rear Derailleur', iconName: 'Cpu' },
  { id: 'rear_axle', label: 'Rear Axle / Dropout', iconName: 'Layers' },
  { id: 'headset', label: 'Headset', iconName: 'Layers' },
  { id: 'brake_rotors', label: 'Brake Rotors & Pads', iconName: 'Shield' },
  { id: 'cassette', label: 'Cassette & Chain', iconName: 'Disc' },
];

interface DiagnosticBarProps {
  query: string;
  setQuery: (q: string) => void;
  onSearch: (forcedQuery?: string) => void;
  isLoading: boolean;
  brokenPart: string;
  setBrokenPart: (part: string) => void;
  canonicalIdentity?: CanonicalIdentity;
  availableVisualTags?: VisualDiagnosticTag[];
  activeVisualTag: VisualDiagnosticTag | null;
  onSelectVisualTag: (tag: VisualDiagnosticTag | null) => void;
  onCustomPhotoOrNote: (note: string) => void;
  onOpenMultiView?: () => void;
}

export const DiagnosticBar: React.FC<DiagnosticBarProps> = ({
  query,
  setQuery,
  onSearch,
  isLoading,
  brokenPart,
  setBrokenPart,
  canonicalIdentity,
  availableVisualTags = [],
  activeVisualTag,
  onSelectVisualTag,
  onCustomPhotoOrNote,
  onOpenMultiView,
}) => {
  const [photoNote, setPhotoNote] = useState('');
  const [showPhotoInput, setShowPhotoInput] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSearch(query);
    }
  };

  const handleCustomNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (photoNote.trim()) {
      onCustomPhotoOrNote(photoNote.trim());
      setPhotoNote('');
      setShowPhotoInput(false);
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 font-mono text-xs space-y-3.5 shadow-lg">
      {/* 2-Input Diagnostic Control Grid */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
        {/* Input 1: Bike Name (Full, Truncated, or Scratched Decal) */}
        <div className="md:col-span-7 space-y-1.5">
          <label className="text-[11px] font-sans font-semibold text-zinc-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px] font-bold">1</span>
              <span>Bike Model / Frame Decal:</span>
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">
              Accepts truncated & OCR inputs (e.g. "GT Av", "Spz Levo", "SC Bronson")
            </span>
          </label>

          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter bike name (e.g. 'GT Av', 'Spz Levo', 'Trek Domane', 'SC Bronson')..."
              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-700 rounded-md text-zinc-100 placeholder-zinc-500 font-sans text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
              disabled={isLoading}
            />
            {isLoading && (
              <div className="absolute right-3 top-3">
                <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          {/* Resolved Canonical Name Badge */}
          {canonicalIdentity && (
            <div className="flex items-center gap-2 pt-0.5 text-[11px]">
              <span className="text-zinc-500">Identified as:</span>
              <span className="font-sans font-semibold text-zinc-200 flex items-center gap-1.5 px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>{canonicalIdentity.standardized_brand} {canonicalIdentity.standardized_model}</span>
                <span className="text-zinc-500 font-normal">({canonicalIdentity.category})</span>
              </span>
            </div>
          )}
        </div>

        {/* Input 2: Detected Broken Part (Pinned as Row 1) */}
        <div className="md:col-span-3 space-y-1.5">
          <label className="text-[11px] font-sans font-semibold text-zinc-300 flex items-center gap-1.5">
            <span className="w-4 h-4 rounded bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-[10px] font-bold">2</span>
            <span>Detected Broken Part (Pins Row 1):</span>
          </label>

          <select
            value={brokenPart}
            onChange={(e) => setBrokenPart(e.target.value)}
            className="w-full px-3 py-2.5 bg-zinc-950 border border-cyan-700/80 rounded-md text-cyan-200 font-sans text-sm font-semibold focus:outline-none focus:border-cyan-400 transition"
          >
            {BROKEN_PART_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id} className="bg-zinc-900 text-zinc-200">
                🎯 {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Action Button */}
        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="w-full py-2.5 px-4 rounded-md bg-amber-500 hover:bg-amber-400 disabled:bg-zinc-800 text-zinc-950 disabled:text-zinc-500 font-sans font-bold text-xs transition flex items-center justify-center gap-2 shadow-sm"
          >
            {isLoading ? 'Diagnosing...' : 'Diagnose Bike'}
          </button>
        </div>
      </form>

      {/* Visual Diagnostic Clues Filter Bar */}
      <div className="pt-2 border-t border-zinc-800 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-[11px] font-sans font-semibold text-zinc-300">
            <Camera className="w-3.5 h-3.5 text-indigo-400" />
            <span>Visual Clues from Video / Photo (Locks Generation & Promotes SKU to Column 1):</span>
          </div>

          <div className="flex items-center gap-2">
            {onOpenMultiView && (
              <button
                type="button"
                onClick={onOpenMultiView}
                className="text-[10px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 px-2.5 py-0.5 rounded bg-emerald-950/40 border border-emerald-700/50 transition font-sans font-semibold"
              >
                <span>🎥 Multi-View Video AI Scanner</span>
              </button>
            )}

            {activeVisualTag && (
              <button
                type="button"
                onClick={() => onSelectVisualTag(null)}
                className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-1 px-2 py-0.5 rounded bg-amber-950/40 border border-amber-800/40 transition"
              >
                <X className="w-3 h-3" />
                <span>Reset Clues</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowPhotoInput(!showPhotoInput)}
              className="text-[10px] text-zinc-400 hover:text-zinc-200 px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 transition"
            >
              {showPhotoInput ? 'Close Note' : '+ Photo Note'}
            </button>
          </div>
        </div>

        {/* Dynamic Visual Clue Tags */}
        <div className="flex flex-wrap items-center gap-1.5">
          {availableVisualTags.map((tag) => {
            const isSelected = activeVisualTag?.tag_id === tag.tag_id;
            return (
              <button
                key={tag.tag_id}
                type="button"
                onClick={() => onSelectVisualTag(isSelected ? null : tag)}
                className={`px-2.5 py-1 rounded text-[11px] font-sans transition flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-emerald-950 text-emerald-200 border-emerald-500 font-semibold ring-1 ring-emerald-500'
                    : 'bg-zinc-950 text-zinc-300 hover:text-zinc-100 border-zinc-800 hover:border-zinc-700'
                }`}
                title={`Locks generation to ${tag.locks_generation}`}
              >
                {isSelected ? (
                  <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                ) : (
                  <span className="text-indigo-400/80">👁</span>
                )}
                <span>[{tag.label}]</span>
              </button>
            );
          })}
        </div>

        {/* Custom Visual / Stamping Input */}
        {showPhotoInput && (
          <form onSubmit={handleCustomNoteSubmit} className="flex gap-2 pt-1">
            <input
              type="text"
              value={photoNote}
              onChange={(e) => setPhotoNote(e.target.value)}
              placeholder="e.g. '2 tiny M3 screws on dropout', 'ATIDH0233', '1 large bolt', '26 inch wheels'..."
              className="flex-1 px-3 py-1.5 bg-zinc-950 border border-indigo-700/80 rounded text-zinc-100 font-sans text-xs focus:outline-none focus:border-indigo-400"
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-sans text-xs font-semibold"
            >
              Apply Clue
            </button>
          </form>
        )}

        {/* Active Lock Status Feedback */}
        {activeVisualTag && (
          <div className="p-2 rounded bg-emerald-950/30 border border-emerald-800/60 text-emerald-300 text-[11px] flex items-center justify-between font-sans">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                <strong>Locked Generation:</strong> {activeVisualTag.locks_generation} via <em>"{activeVisualTag.label}"</em>. Matching SKUs promoted to Column 1!
              </span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400/80 uppercase">
              100% Locked
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
