import React, { useState, useEffect, useRef } from 'react';
import { Terminal as TerminalIcon, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';

export default function TerminalLogs({ logs }) {
  const [collapsed, setCollapsed] = useState(false);
  const [copied, setCopied] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!collapsed && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, collapsed]);

  const handleCopy = () => {
    navigator.clipboard.writeText(logs);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const logLines = logs ? logs.split('\n') : [];

  return (
    <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden font-mono text-xs shadow-2xl">
      {/* Terminal Header */}
      <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
          </div>
          <div className="flex items-center gap-2 text-slate-400 pl-2 border-l border-slate-800">
            <TerminalIcon className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-slate-200">LIVE SCANNER TERMINAL</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400 transition-colors text-[11px]"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy Logs'}
          </button>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
          >
            {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Terminal Output */}
      {!collapsed && (
        <div className="bg-[#050811] p-4 max-h-72 overflow-y-auto space-y-1.5 font-mono text-slate-300 text-[11px] leading-relaxed">
          {logLines.length === 0 ? (
            <div className="text-slate-500 italic">Waiting for scanner stdout stream...</div>
          ) : (
            logLines.map((line, idx) => {
              const isError = line.includes('✖') || line.includes('Error') || line.includes('CRITICAL');
              const isSuccess = line.includes('✓') || line.includes('Completed');
              const isWarning = line.includes('⚠') || line.includes('HIGH');

              return (
                <div key={idx} className="flex gap-2">
                  <span className="text-slate-600 select-none">{String(idx + 1).padStart(2, '0')}</span>
                  <span className={`
                    ${isError ? 'text-rose-400 font-bold' : ''}
                    ${isSuccess ? 'text-emerald-400 font-bold' : ''}
                    ${isWarning ? 'text-amber-400' : ''}
                    ${!isError && !isSuccess && !isWarning ? 'text-slate-300' : ''}
                  `}>
                    {line}
                  </span>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
}
