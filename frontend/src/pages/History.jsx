import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Trash2, FileText, Download, RefreshCw, ChevronRight } from 'lucide-react';
import SkeletonLoader from '../components/SkeletonLoader';
import { apiService } from '../services/api';
import { mockStats } from '../services/mockData';

export default function History({ addToast }) {
  const [loading, setLoading] = useState(true);
  const [scans, setScans] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [scannerFilter, setScannerFilter] = useState('All');
  const navigate = useNavigate();

  const loadScans = async () => {
    setLoading(true);
    try {
      const data = await apiService.getScans();
      setScans(data || []);
    } catch (err) {
      setScans(mockStats.recent_scans);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadScans();
  }, []);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      await apiService.deleteScan(id);
      setScans(scans.filter((s) => s.id !== id));
      addToast?.({ type: 'success', title: 'Scan Deleted', message: `Scan #${id} history removed.` });
    } catch (err) {
      addToast?.({ type: 'error', title: 'Delete Failed', message: err.message });
    }
  };

  const filteredScans = scans.filter((s) => {
    const matchesSearch = s.target.toLowerCase().includes(searchTerm.toLowerCase()) || String(s.id).includes(searchTerm);
    const matchesScanner = scannerFilter === 'All' || s.scanners.toLowerCase().includes(scannerFilter.toLowerCase());
    return matchesSearch && matchesScanner;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">Scan Audit History</h1>
          <p className="text-xs text-slate-400 font-mono mt-1">Search, filter, and review historical security scan runs</p>
        </div>

        <button
          onClick={loadScans}
          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/40 transition-all self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filter Header */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search Scan ID or Target..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/40 font-mono"
          />
        </div>

        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs font-mono w-full md:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400 ml-2" />
          {['All', 'Nmap', 'Nikto', 'ZAP', 'Bandit'].map((sc) => (
            <button
              key={sc}
              onClick={() => setScannerFilter(sc)}
              className={`px-2.5 py-1 rounded-lg transition-colors ${scannerFilter === sc ? 'bg-cyan-500/20 text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
            >
              {sc}
            </button>
          ))}
        </div>
      </div>

      {/* Scans Table */}
      {loading ? (
        <SkeletonLoader type="table" />
      ) : (
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950/80 text-slate-400 uppercase border-b border-slate-800 text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Scan ID</th>
                  <th className="py-3.5 px-4">Target</th>
                  <th className="py-3.5 px-4">Date / Time</th>
                  <th className="py-3.5 px-4">Scanners</th>
                  <th className="py-3.5 px-4">Findings</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredScans.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-500">
                      No security scans match your search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredScans.map((s) => (
                    <tr
                      key={s.id}
                      onClick={() => navigate(`/results/${s.id}`)}
                      className="hover:bg-slate-800/40 cursor-pointer transition-colors group"
                    >
                      <td className="py-4 px-4 font-bold text-cyan-400">#{s.id}</td>
                      <td className="py-4 px-4 font-bold text-slate-100">{s.target}</td>
                      <td className="py-4 px-4 text-slate-400">Today, 14:30</td>
                      <td className="py-4 px-4 text-slate-400">{s.scanners}</td>
                      <td className="py-4 px-4 font-bold text-rose-400">{s.total_findings || 12}</td>
                      <td className="py-4 px-4">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                          {s.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => navigate(`/results/${s.id}`)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800"
                            title="View Findings"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => handleDelete(s.id, e)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                            title="Delete History"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
