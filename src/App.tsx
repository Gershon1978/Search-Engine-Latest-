/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { McpHeader } from './components/McpHeader';
import { DiagnosticBar } from './components/DiagnosticBar';
import { CertaintyMatrixTable } from './components/CertaintyMatrixTable';
import { MultiViewFrameRecognition } from './components/MultiViewFrameRecognition';
import { JsonViewer } from './components/JsonViewer';
import {
  BikeQueryResponse,
  VisualDiagnosticTag,
  CertaintyMatrixRow,
} from './types/bikeQuery';
import {
  ChevronDown,
  ChevronUp,
  FileCode,
  Terminal,
  Sparkles,
  Layers,
  Wrench,
  CheckCircle2,
  Video,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'matrix' | 'recognition'>('matrix');
  const [query, setQuery] = useState('GT Av');
  const [brokenPart, setBrokenPart] = useState('derailleur_hanger');
  const [data, setData] = useState<BikeQueryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Visual Diagnostic Tag State
  const [activeVisualTag, setActiveVisualTag] = useState<VisualDiagnosticTag | null>(null);
  const [locallyLockedSkus, setLocallyLockedSkus] = useState<Record<string, string>>({});

  // Collapsible Raw MCP Drawer state
  const [showJsonDrawer, setShowJsonDrawer] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);

  // Execute mechanical query
  const executeResearch = async (targetQuery: string) => {
    setIsLoading(true);
    setError(null);
    setActiveVisualTag(null);
    setLocallyLockedSkus({});

    try {
      const response = await fetch('/api/mechanical-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: targetQuery }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `Server responded with HTTP ${response.status}`);
      }

      const result: BikeQueryResponse = await response.json();
      setData(result);
    } catch (err: any) {
      console.error('Research query failed:', err);
      setError(err.message || 'Failed to research bike model.');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial research on mount
  useEffect(() => {
    executeResearch('GT Av');
  }, []);

  // When mechanic selects a visual tag
  const handleSelectVisualTag = (tag: VisualDiagnosticTag | null) => {
    setActiveVisualTag(tag);
    if (tag && tag.resolves_part_skus) {
      setLocallyLockedSkus((prev) => ({
        ...prev,
        ...tag.resolves_part_skus,
      }));
    } else {
      setLocallyLockedSkus({});
    }
  };

  // When mechanic types a custom visual note or casting stamp
  const handleCustomPhotoOrNote = async (note: string) => {
    if (!data) return;
    try {
      const res = await fetch('/api/verify-part-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bike_query: `${data.canonical_identity.standardized_brand} ${data.canonical_identity.standardized_model}`,
          stamped_text_or_notes: note,
        }),
      });
      const photoResult = await res.json();
      if (photoResult.is_resolved && photoResult.detected_stamp) {
        // Find matching tag or lock SKU directly
        const matchedTag = data.available_visual_tags?.find((t) =>
          photoResult.detected_stamp.toLowerCase().includes(t.tag_id) ||
          t.label.toLowerCase().includes(note.toLowerCase())
        );
        if (matchedTag) {
          handleSelectVisualTag(matchedTag);
        } else {
          setLocallyLockedSkus((prev) => ({
            ...prev,
            [brokenPart]: photoResult.suggested_action || photoResult.detected_stamp,
          }));
        }
      }
    } catch (e) {
      console.error('Failed to verify visual note:', e);
    }
  };

  // When mechanic manually clicks [Confirm This Variant] in Column 2 or Column 3
  const handleLockVariant = (partCategory: string, skuOrSpec: string, generationLabel?: string) => {
    setLocallyLockedSkus((prev) => ({
      ...prev,
      [partCategory]: skuOrSpec,
    }));
  };

  // When Multi-View Frame Recognition confirms a bike
  const handleApplyConfirmedBike = (bikeName: string) => {
    setQuery(bikeName);
    setActiveTab('matrix');
    executeResearch(bikeName);
  };

  const getCurlCommand = () => {
    const origin = window.location.origin;
    return `curl -X POST "${origin}/mcp" \\
  -H "Content-Type: application/json" \\
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "query_bike_specs",
      "arguments": { "bike_model": "${query.replace(/'/g, "\\'")}" }
    }
  }'`;
  };

  const handleCopyCurl = () => {
    navigator.clipboard.writeText(getCurlCommand());
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Header */}
      <McpHeader onCopyCurl={handleCopyCurl} copiedCurl={copiedCurl} />

      {/* Main Single-Screen Diagnostic Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-4">
        {/* Navigation Mode Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('matrix')}
              className={`px-3.5 py-2 rounded-md font-sans text-xs font-semibold flex items-center gap-2 transition ${
                activeTab === 'matrix'
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/40'
                  : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>2-Input Certainty Matrix</span>
              {data && (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300">
                  {data.canonical_identity.standardized_model}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('recognition')}
              className={`px-3.5 py-2 rounded-md font-sans text-xs font-semibold flex items-center gap-2 transition ${
                activeTab === 'recognition'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/40'
                  : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Multi-View Frame Recognition</span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                5-Stage Video AI
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-500">
            <span>Target Bike:</span>
            <span className="text-zinc-300 font-semibold px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800">
              {query}
            </span>
          </div>
        </div>

        {/* Error notification banner if any */}
        {error && (
          <div className="p-3 rounded-lg bg-red-950/40 border border-red-800/60 text-red-300 text-xs font-mono flex items-center justify-between">
            <span>Query Notice: {error}</span>
            <button
              onClick={() => executeResearch(query)}
              className="px-2 py-0.5 rounded bg-red-900 text-white text-[11px] underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Tab Content Display */}
        {activeTab === 'recognition' ? (
          <MultiViewFrameRecognition onApplyConfirmedBike={handleApplyConfirmedBike} />
        ) : (
          <>
            {/* 1. The 2-Input + Visual Clue Diagnostic Bar */}
            <DiagnosticBar
              query={query}
              setQuery={setQuery}
              onSearch={(target) => executeResearch(target || query)}
              isLoading={isLoading}
              brokenPart={brokenPart}
              setBrokenPart={setBrokenPart}
              canonicalIdentity={data?.canonical_identity}
              availableVisualTags={data?.available_visual_tags}
              activeVisualTag={activeVisualTag}
              onSelectVisualTag={handleSelectVisualTag}
              onCustomPhotoOrNote={handleCustomPhotoOrNote}
              onOpenMultiView={() => setActiveTab('recognition')}
            />

            {/* 2. Core UI: Part Certainty Matrix Table (Flows Left-to-Right from Confirmed to Speculative) */}
            {data?.certainty_matrix ? (
              <CertaintyMatrixTable
                matrixRows={data.certainty_matrix}
                brokenPartId={brokenPart}
                activeVisualTag={activeVisualTag}
                onLockVariant={handleLockVariant}
                locallyLockedSkus={locallyLockedSkus}
              />
            ) : isLoading ? (
              <div className="p-12 rounded-lg bg-zinc-900 border border-zinc-800 flex flex-col items-center justify-center gap-3 text-zinc-400 font-mono text-xs">
                <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                <span>Building Part Certainty Matrix & Extracting Visual Cues...</span>
              </div>
            ) : (
              <div className="p-8 text-center text-zinc-500 font-mono text-xs bg-zinc-900 border border-zinc-800 rounded-lg">
                No bike data loaded. Enter a bike name above to generate the Part Certainty Matrix.
              </div>
            )}
          </>
        )}

        {/* 3. Collapsible "Raw MCP JSON Payload" Drawer at Bottom for Andrey AI */}
        <div className="pt-2">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden shadow-md">
            <button
              type="button"
              onClick={() => setShowJsonDrawer(!showJsonDrawer)}
              className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-mono text-zinc-300 hover:text-zinc-100 hover:bg-zinc-850 transition"
            >
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-amber-400" />
                <span className="font-semibold">Raw MCP JSON Payload for "Andrey" AI</span>
                {data && (
                  <span className="text-[10px] text-zinc-500">
                    ({data.certainty_matrix?.length || 0} Matrix Rows · {data.canonical_identity.standardized_brand} {data.canonical_identity.standardized_model})
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                <span>{showJsonDrawer ? 'Hide JSON Drawer' : 'Expand JSON Drawer'}</span>
                {showJsonDrawer ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>

            {showJsonDrawer && (
              <div className="border-t border-zinc-800 p-3 bg-zinc-950">
                <JsonViewer data={data} isLoading={isLoading} />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-zinc-900 py-3 px-6 text-center text-xs font-mono text-zinc-600">
        Hi5.bike Andrey AI Diagnostic Canvas · Real-World Video & Visual Certainty Flow
      </footer>
    </div>
  );
}
