import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function ScanActivityChart({ data7d, data30d, data90d }) {
  const [timeframe, setTimeframe] = useState('7d');

  const activeData = {
    '7d': data7d || [
      { day: "Mon", scans: 0 },
      { day: "Tue", scans: 0 },
      { day: "Wed", scans: 0 },
      { day: "Thu", scans: 0 },
      { day: "Fri", scans: 0 },
      { day: "Sat", scans: 0 },
      { day: "Sun", scans: 0 }
    ],
    '30d': data30d || Array.from({ length: 15 }, (_, i) => ({ day: `D${i*2+1}`, scans: 0 })),
    '90d': data90d || Array.from({ length: 12 }, (_, i) => ({ day: `Wk ${i+1}`, scans: 0 }))
  }[timeframe];

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Scan Activity Frequency</h3>
          <p className="text-xs text-slate-400">Total automated security scans executed</p>
        </div>

        {/* Timeframe selector */}
        <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-xl">
          {['7d', '30d', '90d'].map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`
                px-2.5 py-1 rounded-lg text-xs font-mono transition-all
                ${timeframe === tf 
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-bold' 
                  : 'text-slate-400 hover:text-slate-200'
                }
              `}
            >
              {tf === '7d' ? '7 Days' : tf === '30d' ? '30 Days' : '90 Days'}
            </button>
          ))}
        </div>
      </div>

      <div className="h-56 w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={activeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis dataKey="day" stroke="#64748b" fontSize={11} fontFamily="monospace" tickLine={false} />
            <YAxis stroke="#64748b" fontSize={11} fontFamily="monospace" tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#334155',
                borderRadius: '12px',
                color: '#f8fafc',
                fontSize: '12px',
                fontFamily: 'monospace'
              }}
            />
            <Bar dataKey="scans" fill="#38bdf8" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
