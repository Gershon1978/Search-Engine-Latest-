import React from 'react';
import { Globe, Search, ExternalLink, ShieldCheck, Clock } from 'lucide-react';
import { WebSearchEvidence } from '../types/bike';

interface DispatchedQueriesLogProps {
  queries?: string[];
  evidence?: WebSearchEvidence[];
  rawSources?: Array<{ title: string; url: string }>;
  executionTimeMs?: number;
  isLoading?: boolean;
}

export const DispatchedQueriesLog: React.FC<DispatchedQueriesLogProps> = ({
  queries = [],
  evidence = [],
  rawSources = [],
  executionTimeMs,
  isLoading = false,
}) => {
  return (
    <div className="bg-zinc-900/90 border border-zinc-800 rounded-lg p-4 flex flex-col gap-3 font-mono text-xs">
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
        <div className="flex items-center gap-2 text-zinc-300 font-medium">
          <Globe className="w-4 h-4 text-amber-400" />
          <span>Live Web Queries & Retrieval Evidence</span>
          <span className="text-[10px] text-zinc-500 font-normal">
            ({queries.length || evidence.length} queries dispatched)
          </span>
        </div>
        {executionTimeMs !== undefined && (
          <div className="flex items-center gap-1 text-[11px] text-zinc-400">
            <Clock className="w-3 h-3 text-zinc-500" />
            <span>{(executionTimeMs / 1000).toFixed(2)}s roundtrip</span>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="py-6 flex flex-col items-center justify-center gap-2 text-zinc-400">
          <div className="w-5 h-5 border-2 border-amber-500/40 border-t-amber-400 rounded-full animate-spin" />
          <p className="text-xs">Dispatching live web search queries to OEM technical manuals...</p>
        </div>
      ) : queries.length === 0 && evidence.length === 0 && rawSources.length === 0 ? (
        <div className="py-6 text-center text-zinc-500">
          No web search queries dispatched yet. Run a query above or click one of the 10 benchmark models.
        </div>
      ) : (
        <div className="space-y-3">
          {/* List of search queries dispatched */}
          <div>
            <div className="text-[11px] text-zinc-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Search className="w-3 h-3 text-zinc-400" />
              <span>Targeted Search Queries</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(queries.length > 0 ? queries : evidence.map((e) => e.query_dispatched)).map((q, idx) => (
                <div
                  key={idx}
                  className="px-2.5 py-1 rounded bg-zinc-950 border border-zinc-800 text-zinc-300 flex items-center gap-1.5 text-[11px]"
                >
                  <span className="text-amber-400/80">›</span>
                  <span className="truncate max-w-md">{q}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Evidence extracted */}
          {evidence.length > 0 && (
            <div>
              <div className="text-[11px] text-zinc-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>Extracted Grounding Evidence</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {evidence.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded bg-zinc-950/60 border border-zinc-800/80 flex flex-col gap-1 text-[11px]"
                  >
                    <div className="flex items-center justify-between text-zinc-400">
                      <span className="text-zinc-500 truncate">{item.query_dispatched}</span>
                      <span className="text-amber-400/90 font-medium px-1.5 py-0.2 rounded bg-amber-950/30 border border-amber-800/40 text-[10px]">
                        {item.source_domain}
                      </span>
                    </div>
                    <div className="text-emerald-300 font-sans font-medium text-xs">
                      {item.verified_value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Raw OEM Sources & Links */}
          {rawSources.length > 0 && (
            <div className="pt-1 border-t border-zinc-800/60">
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">
                Authoritative Sources Grounded
              </div>
              <div className="flex flex-wrap gap-2">
                {rawSources.map((source, idx) => (
                  <a
                    key={idx}
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 underline decoration-blue-500/40 hover:decoration-blue-400"
                  >
                    <span>{source.title || new URL(source.url).hostname}</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
