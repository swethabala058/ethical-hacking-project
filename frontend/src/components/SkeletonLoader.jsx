import React from 'react';

export default function SkeletonLoader({ type = 'card' }) {
  if (type === 'table') {
    return (
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-3 animate-pulse">
        <div className="h-8 bg-slate-800/60 rounded-xl w-full" />
        <div className="h-12 bg-slate-800/40 rounded-xl w-full" />
        <div className="h-12 bg-slate-800/40 rounded-xl w-full" />
        <div className="h-12 bg-slate-800/40 rounded-xl w-full" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex justify-between">
            <div className="h-4 bg-slate-800 rounded w-24" />
            <div className="h-8 w-8 bg-slate-800 rounded-xl" />
          </div>
          <div className="h-8 bg-slate-800 rounded w-16" />
          <div className="h-3 bg-slate-800/60 rounded w-32" />
        </div>
      ))}
    </div>
  );
}
