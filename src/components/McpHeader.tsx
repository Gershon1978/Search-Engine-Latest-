import React from 'react';
import { Terminal, Cpu, Search, CheckCircle2, Copy } from 'lucide-react';

interface McpHeaderProps {
  onCopyCurl: () => void;
  copiedCurl: boolean;
}

export const McpHeader: React.FC<McpHeaderProps> = ({ onCopyCurl, copiedCurl }) => {
  return (
    <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur sticky top-0 z-30 px-4 py-3 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold text-zinc-100 tracking-tight">
                Hi5.bike Query Engine
              </h1>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                v2.0 MCP
              </span>
              <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-800/40">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Tool Active
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Lightweight Model Context Protocol web tool & 10-bike benchmark testbench for downstream AI synthesis
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <button
            onClick={onCopyCurl}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 border border-zinc-700 transition"
            title="Copy cURL command for this MCP endpoint"
          >
            {copiedCurl ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">cURL Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy cURL</span>
              </>
            )}
          </button>
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-zinc-900 text-zinc-400 border border-zinc-800">
            <Terminal className="w-3.5 h-3.5 text-zinc-500" />
            <span>POST /api/mcp/query-bike</span>
          </div>
        </div>
      </div>
    </header>
  );
};
