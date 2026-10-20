import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function StatCard({ title, value, badge, subtext, icon: Icon, color = 'cyan' }) {
  const [displayVal, setDisplayVal] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(value, 10);
    if (isNaN(end)) return;
    const duration = 1000;
    const increment = Math.ceil(end / (duration / 16));

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setDisplayVal(end);
        clearInterval(timer);
      } else {
        setDisplayVal(start);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value]);

  const colorStyles = {
    cyan: {
      border: 'border-cyan-500/30 hover:border-cyan-500/60',
      iconBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
      glow: 'hover:shadow-[0_0_20px_rgba(56,189,248,0.2)]',
      badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
    },
    rose: {
      border: 'border-rose-500/30 hover:border-rose-500/60',
      iconBg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      glow: 'hover:shadow-[0_0_20px_rgba(244,63,94,0.2)]',
      badge: 'bg-rose-500/10 text-rose-400 border-rose-500/30'
    },
    amber: {
      border: 'border-amber-500/30 hover:border-amber-500/60',
      iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      glow: 'hover:shadow-[0_0_20px_rgba(234,179,8,0.2)]',
      badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30'
    },
    blue: {
      border: 'border-blue-500/30 hover:border-blue-500/60',
      iconBg: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      glow: 'hover:shadow-[0_0_20px_rgba(59,130,246,0.2)]',
      badge: 'bg-blue-500/10 text-blue-400 border-blue-500/30'
    }
  }[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`glass-panel p-5 rounded-2xl border transition-all duration-300 ${colorStyles.border} ${colorStyles.glow}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className={`p-2.5 rounded-xl border ${colorStyles.iconBg}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-4 flex items-baseline justify-between">
        <span className="text-3xl font-extrabold text-slate-100 tracking-tight font-mono">
          {typeof value === 'number' || !isNaN(parseInt(value, 10)) ? displayVal : value}
        </span>

        {badge && (
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono border ${colorStyles.badge}`}>
            {badge}
          </span>
        )}
      </div>

      {subtext && (
        <p className="mt-2 text-xs text-slate-400 font-mono">
          {subtext}
        </p>
      )}
    </motion.div>
  );
}
