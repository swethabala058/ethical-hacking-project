import React from 'react';
import { CheckCircle2, Loader2, Circle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ScanProgress({ progress, status, target, scanners }) {
  const steps = [
    { label: 'Target validation', key: 'val' },
    { label: 'Network & Port scan (Nmap)', key: 'nmap' },
    { label: 'Web Server assessment (Nikto)', key: 'nikto' },
    { label: 'Vulnerability Analysis (OWASP ZAP)', key: 'zap' },
    { label: 'Code Static Analysis (Bandit)', key: 'bandit' },
    { label: 'Report generation', key: 'report' }
  ];

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">SECURITY SCAN IN PROGRESS</span>
          <h2 className="text-xl font-extrabold text-slate-100 mt-1 font-mono">{target}</h2>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono">
          <span className="text-slate-400">Scanners:</span>
          <span className="text-slate-200 font-bold">{scanners || 'Nmap, OWASP ZAP'}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div>
        <div className="flex justify-between items-center text-xs font-mono mb-2">
          <span className="text-slate-400">Overall Progress</span>
          <span className="text-cyan-400 font-bold">{progress}%</span>
        </div>

        <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
            className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 rounded-full shadow-[0_0_15px_rgba(56,189,248,0.5)]"
          />
        </div>
      </div>

      {/* Step checklist */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        {steps.map((step, idx) => {
          const stepPercent = ((idx + 1) / steps.length) * 100;
          const isCompleted = progress >= stepPercent;
          const isCurrent = progress < stepPercent && progress >= stepPercent - (100 / steps.length);

          return (
            <div
              key={step.key}
              className={`
                flex items-center gap-3 p-3 rounded-xl border text-xs font-mono transition-all
                ${isCompleted 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                  : isCurrent 
                  ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300 shadow-[0_0_15px_rgba(56,189,248,0.15)]' 
                  : 'bg-slate-950/40 border-slate-800/80 text-slate-500'
                }
              `}
            >
              {isCompleted ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              ) : isCurrent ? (
                <Loader2 className="w-4 h-4 text-cyan-400 animate-spin flex-shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-slate-600 flex-shrink-0" />
              )}
              <span className="truncate">{step.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
