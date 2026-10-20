import React from 'react';
import { Check, Shield, Globe, Terminal, Code2 } from 'lucide-react';

export default function ScanCard({ scanner, selected, onToggle }) {
  const icons = {
    Nmap: Shield,
    Nikto: Globe,
    'OWASP ZAP': Terminal,
    Bandit: Code2,
  };

  const Icon = icons[scanner.id] || Shield;

  return (
    <div
      onClick={onToggle}
      className={`
        relative p-5 rounded-2xl border cursor-pointer transition-all duration-300 select-none
        ${selected 
          ? 'bg-cyan-500/10 border-cyan-500/50 shadow-[0_0_20px_rgba(56,189,248,0.2)] transform -translate-y-1' 
          : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/80'
        }
      `}
    >
      <div className="flex items-start justify-between">
        <div className={`p-3 rounded-xl ${selected ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'bg-slate-800/80 text-slate-400'}`}>
          <Icon className="w-6 h-6" />
        </div>

        <div className={`
          w-6 h-6 rounded-lg flex items-center justify-center border transition-colors
          ${selected 
            ? 'bg-cyan-400 border-cyan-400 text-slate-950' 
            : 'border-slate-700 bg-slate-950 text-transparent'
          }
        `}>
          <Check className="w-4 h-4 stroke-[3]" />
        </div>
      </div>

      <div className="mt-4">
        <h4 className="font-bold text-slate-100 text-sm tracking-wide">{scanner.name}</h4>
        <span className="inline-block mt-0.5 text-xs text-cyan-400 font-mono">{scanner.type}</span>
        <p className="mt-2 text-xs text-slate-400 leading-relaxed">{scanner.description}</p>
      </div>
    </div>
  );
}
