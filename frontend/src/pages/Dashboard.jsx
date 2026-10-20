import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, AlertCircle, ShieldAlert, Cpu, Play, RefreshCw, ChevronRight } from 'lucide-react';
import StatCard from '../components/StatCard';
import SeverityChart from '../components/SeverityChart';
import ScanActivityChart from '../components/ScanActivityChart';
import SkeletonLoader from '../components/SkeletonLoader';
import { apiService } from '../services/api';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [selectedSeverity, setSelectedSeverity] = useState(null);
  const navigate = useNavigate();

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await apiService.getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
            <span>SOC Overview Dashboard</span>
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping inline-block" />
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Real-time vulnerability assessment & security operations center
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/40 transition-all"
            title="Refresh Dashboard"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => navigate('/scan')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-bold text-xs shadow-[0_0_20px_rgba(56,189,248,0.3)] transition-all"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            Start Security Scan
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      {loading ? (
        <SkeletonLoader type="card" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Scans"
            value={stats?.total_scans ?? 0}
            badge={`${stats?.total_scans ?? 0} runs`}
            subtext="Automated scanning runs"
            icon={Shield}
            color="cyan"
          />
          <StatCard
            title="Vulnerabilities"
            value={stats?.total_findings ?? 0}
            badge={`${stats?.critical_issues ?? 0} Critical`}
            subtext="Total findings across targets"
            icon={ShieldAlert}
            color="amber"
          />
          <StatCard
            title="Critical Issues"
            value={stats?.critical_issues ?? 0}
            badge={(stats?.critical_issues ?? 0) > 0 ? "Needs Attention" : "All Clear"}
            subtext="Requires immediate patch"
            icon={AlertCircle}
            color="rose"
          />
          <StatCard
            title="Open Ports"
            value={stats?.open_ports ?? 0}
            badge="Across Targets"
            subtext="Network attack surface"
            icon={Cpu}
            color="blue"
          />
        </div>
      )}

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 min-h-[320px]">
          <ScanActivityChart
            data7d={stats?.scan_activity_7d}
          />
        </div>
        <div className="lg:col-span-1 min-h-[320px]">
          <SeverityChart
            data={stats}
            selectedSeverity={selectedSeverity}
            onSelectSeverity={(sev) => {
              setSelectedSeverity(sev);
              if (sev) navigate(`/results/1024?severity=${sev}`);
            }}
          />
        </div>
      </div>

      {/* Recent Scans Table Preview */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Recent Scan Activity</h3>
            <p className="text-xs text-slate-400">Latest target audit results</p>
          </div>
          <button
            onClick={() => navigate('/history')}
            className="flex items-center gap-1 text-xs font-mono text-cyan-400 hover:text-cyan-300"
          >
            View All Scans <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950/80 text-slate-400 uppercase border-b border-slate-800 text-[11px]">
              <tr>
                <th className="py-3 px-4">Scan ID</th>
                <th className="py-3 px-4">Target System</th>
                <th className="py-3 px-4">Active Scanners</th>
                <th className="py-3 px-4">Findings</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {(stats?.recent_scans || []).map((s) => (
                <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-cyan-400">#{s.id}</td>
                  <td className="py-3.5 px-4 text-slate-100">{s.target}</td>
                  <td className="py-3.5 px-4 text-slate-400">{s.scanners}</td>
                  <td className="py-3.5 px-4 font-bold text-rose-400">{s.total_findings}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                      {s.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => navigate(`/results/${s.id}`)}
                      className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-400 text-[11px] transition-all"
                    >
                      View Results
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
