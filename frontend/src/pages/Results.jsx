import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { CheckCircle2, ShieldAlert, FileText, Download, Filter } from 'lucide-react';
import VulnerabilityTable from '../components/VulnerabilityTable';
import VulnerabilityModal from '../components/VulnerabilityModal';
import SkeletonLoader from '../components/SkeletonLoader';
import { apiService } from '../services/api';
import { mockFindings } from '../services/mockData';

export default function Results() {
  const { scanId = 1024 } = useParams();
  const [searchParams] = useSearchParams();
  const initialSeverity = searchParams.get('severity');

  const [loading, setLoading] = useState(true);
  const [scanData, setScanData] = useState(null);
  const [findings, setFindings] = useState([]);
  const [selectedFinding, setSelectedFinding] = useState(null);
  const [selectedSeverity, setSelectedSeverity] = useState(initialSeverity);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await apiService.getScanResults(scanId);
        setScanData(res.scan);
        setFindings(res.findings || mockFindings);
      } catch (err) {
        setFindings(mockFindings);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [scanId]);

  const counts = {
    Critical: findings.filter(f => f.severity === 'Critical').length,
    High: findings.filter(f => f.severity === 'High').length,
    Medium: findings.filter(f => f.severity === 'Medium').length,
    Low: findings.filter(f => f.severity === 'Low').length,
  };

  return (
    <div className="space-y-6">
      {/* Complete Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold">
            <CheckCircle2 className="w-4 h-4" />
            <span>SCAN COMPLETED</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-100 font-mono mt-1">
            Target: {scanData?.target || '192.168.1.10'}
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Scan Duration: 02:34 | Active Scanners: Nmap, Nikto, OWASP ZAP, Bandit
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={apiService.getHtmlReportUrl(scanId)}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 hover:text-cyan-400 hover:border-cyan-500/40 text-xs font-mono font-bold transition-all"
          >
            <FileText className="w-4 h-4" /> View HTML Report
          </a>
          <a
            href={apiService.getPdfReportUrl(scanId)}
            download
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-400 text-slate-950 hover:bg-cyan-300 font-bold text-xs font-mono shadow-[0_0_15px_rgba(56,189,248,0.3)] transition-all"
          >
            <Download className="w-4 h-4" /> Download PDF
          </a>
        </div>
      </div>

      {/* Severity Counters Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Critical', count: counts.Critical, color: 'border-rose-500/40 text-rose-400 bg-rose-500/10' },
          { label: 'High', count: counts.High, color: 'border-orange-500/40 text-orange-400 bg-orange-500/10' },
          { label: 'Medium', count: counts.Medium, color: 'border-amber-500/40 text-amber-400 bg-amber-500/10' },
          { label: 'Low', count: counts.Low, color: 'border-blue-500/40 text-blue-400 bg-blue-500/10' }
        ].map((item) => (
          <button
            key={item.label}
            onClick={() => setSelectedSeverity(selectedSeverity === item.label ? null : item.label)}
            className={`glass-panel p-4 rounded-2xl border text-center transition-all ${item.color} ${selectedSeverity === item.label ? 'ring-2 ring-cyan-400 scale-[1.02]' : ''}`}
          >
            <span className="text-2xl font-extrabold font-mono block">{item.count}</span>
            <span className="text-xs uppercase tracking-wider font-bold">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Vulnerability Table */}
      {loading ? (
        <SkeletonLoader type="table" />
      ) : (
        <VulnerabilityTable
          findings={findings}
          onSelectFinding={setSelectedFinding}
          selectedSeverity={selectedSeverity}
        />
      )}

      {/* Details Side Panel Drawer */}
      <VulnerabilityModal
        finding={selectedFinding}
        onClose={() => setSelectedFinding(null)}
        onResolve={(id) => {
          setFindings(findings.map((f) => f.id === id ? { ...f, status: 'Resolved' } : f));
        }}
      />
    </div>
  );
}
