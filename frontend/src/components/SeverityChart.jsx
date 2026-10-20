import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function SeverityChart({ data, onSelectSeverity, selectedSeverity }) {
  const COLORS = {
    Critical: '#f43f5e',
    High: '#f97316',
    Medium: '#eab308',
    Low: '#3b82f6',
    Informational: '#64748b'
  };

  const chartData = [
    { name: 'Critical', value: data?.critical_issues ?? 0 },
    { name: 'High', value: data?.high_issues ?? 0 },
    { name: 'Medium', value: data?.medium_issues ?? 0 },
    { name: 'Low', value: data?.low_issues ?? 0 },
  ];

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Severity Distribution</h3>
          <p className="text-xs text-slate-400">Click section to filter findings</p>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-mono text-cyan-400">
          {chartData.reduce((acc, curr) => acc + curr.value, 0)} Total
        </span>
      </div>

      <div className="h-52 w-full my-2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={4}
              dataKey="value"
              cursor="pointer"
              onClick={(entry) => onSelectSeverity && onSelectSeverity(entry.name === selectedSeverity ? null : entry.name)}
            >
              {chartData.map((entry) => (
                <Cell 
                  key={`cell-${entry.name}`} 
                  fill={COLORS[entry.name]} 
                  stroke={selectedSeverity === entry.name ? '#00f0ff' : 'transparent'}
                  strokeWidth={2}
                  className="transition-all duration-300 hover:opacity-80"
                />
              ))}
            </Pie>
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
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-800/80">
        {chartData.map((item) => (
          <button
            key={item.name}
            onClick={() => onSelectSeverity && onSelectSeverity(item.name === selectedSeverity ? null : item.name)}
            className={`
              flex items-center justify-between p-2 rounded-xl text-xs font-mono transition-all
              ${selectedSeverity === item.name 
                ? 'bg-slate-800 border border-cyan-500/40 text-cyan-400' 
                : 'bg-slate-900/40 hover:bg-slate-800/60 border border-slate-800/50 text-slate-300'
              }
            `}
          >
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[item.name] }} />
              <span>{item.name}</span>
            </div>
            <span className="font-bold text-slate-100">{item.value}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
