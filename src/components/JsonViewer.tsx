import React, { useState } from 'react';
import { Copy, Check, Download, Code2, Sparkles, AlertCircle } from 'lucide-react';
import { BikeQueryResponse } from '../types/bike';

interface JsonViewerProps {
  data: BikeQueryResponse | null;
  isLoading?: boolean;
}

export const JsonViewer: React.FC<JsonViewerProps> = ({ data, isLoading }) => {
  const [copied, setCopied] = useState(false);

  if (isLoading) {
    return (
      <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-8 flex flex-col items-center justify-center min-h-[360px] text-zinc-400 font-mono text-xs gap-3">
        <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <div className="text-zinc-300">Executing web grounding & synthesizing JSON schema...</div>
        <p className="text-[11px] text-zinc-500 max-w-sm text-center">
          Searching OEM service manuals, Wheels Mfg catalog, and technical bulletins for bottom bracket & hanger specs.
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-lg p-8 flex flex-col items-center justify-center min-h-[300px] text-zinc-500 font-mono text-xs text-center gap-2">
        <Code2 className="w-8 h-8 text-zinc-600 mb-1" />
        <p className="font-semibold text-zinc-400">Structured JSON Output Ready for Downstream AI</p>
        <p className="text-zinc-500 text-[11px] max-w-md">
          Execute a search above or click one of the 10 benchmark models to generate the authoritative JSON payload.
        </p>
      </div>
    );
  }

  const jsonString = JSON.stringify(data, null, 2);
  const lineCount = jsonString.split('\n').length;
  const byteSize = new Blob([jsonString]).size;

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const filename = `${data.target.manufacturer || 'bike'}_${data.target.model || 'model'}_specs.json`
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '_');
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden flex flex-col">
      {/* Action Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-zinc-900 border-b border-zinc-800 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="text-amber-400 font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            MCP Output Payload
          </span>
          <span className="text-zinc-500">|</span>
          <span className="text-zinc-400 text-[11px]">{lineCount} lines</span>
          <span className="text-zinc-600">·</span>
          <span className="text-zinc-400 text-[11px]">{(byteSize / 1024).toFixed(1)} KB</span>
          {data.confidence_score !== undefined && (
            <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/50 text-emerald-300 text-[11px] font-sans">
              {(data.confidence_score * 100).toFixed(0)}% confidence
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition text-[11px]"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy JSON</span>
              </>
            )}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition text-[11px]"
          >
            <Download className="w-3 h-3" />
            <span>Download</span>
          </button>
        </div>
      </div>

      {/* Code Area */}
      <div className="p-4 overflow-x-auto max-h-[600px] scrollbar-thin scrollbar-thumb-zinc-700">
        <pre className="text-xs font-mono text-zinc-300 leading-relaxed select-all whitespace-pre">
          {jsonString}
        </pre>
      </div>
    </div>
  );
};
