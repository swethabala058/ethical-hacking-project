import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Shield, Globe, Terminal, Code2, AlertTriangle } from 'lucide-react';
import ScanCard from '../components/ScanCard';
import ConfirmationModal from '../components/ConfirmationModal';
import { apiService } from '../services/api';

export default function NewScan({ addToast }) {
  const [target, setTarget] = useState('https://example.local');
  const [selectedScanners, setSelectedScanners] = useState(['Nmap', 'Nikto']);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const scannerOptions = [
    { id: 'Nmap', name: 'NMAP', type: 'Network & Port Scan', description: 'Discovers open TCP/UDP ports, running network services, operating systems, and version fingerprints.' },
    { id: 'Nikto', name: 'NIKTO', type: 'Web Server Scan', description: 'Audits web servers for misconfigurations, dangerous CGI files, missing security headers, and outdated software.' },
    { id: 'OWASP ZAP', name: 'OWASP ZAP', type: 'Web Security DAST', description: 'Performs passive and active vulnerability assessment on web apps (XSS, SQL Injection, CSRF).' },
    { id: 'Bandit', name: 'BANDIT', type: 'Python Code Scan', description: 'Static AST code analyzer identifying security vulnerabilities in Python source code files.' }
  ];

  const handleToggleScanner = (id) => {
    if (selectedScanners.includes(id)) {
      if (selectedScanners.length === 1) {
        addToast?.({ type: 'warning', title: 'Scanner Required', message: 'Select at least one security scanner.' });
        return;
      }
      setSelectedScanners(selectedScanners.filter((s) => s !== id));
    } else {
      setSelectedScanners([...selectedScanners, id]);
    }
  };

  const handleLaunchClick = (e) => {
    e.preventDefault();
    if (!target.trim()) {
      addToast?.({ type: 'error', title: 'Target Missing', message: 'Please enter a target URL, IP address, or project path.' });
      return;
    }
    setIsModalOpen(true);
  };

  const handleConfirmScan = async () => {
    setIsModalOpen(false);
    setLoading(true);

    try {
      const res = await apiService.createScan(target, selectedScanners, true);
      addToast?.({ type: 'success', title: 'Scan Started', message: `Security scan #${res.id} launched successfully.` });
      navigate(`/progress/${res.id}`, { state: { scanData: res } });
    } catch (err) {
      addToast?.({ type: 'error', title: 'Scan Launch Failed', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">Configure New Security Scan</h1>
        <p className="text-xs text-slate-400 font-mono mt-1">Select targets and automated security scanners for vulnerability analysis</p>
      </div>

      <form onSubmit={handleLaunchClick} className="space-y-6">
        {/* Target Input Card */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
          <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider">
            Target URL / IP Address / Local Directory Path
          </label>
          <div className="relative">
            <input
              type="text"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="e.g. https://example.local, 192.168.1.10, or C:/projects/app"
              className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-500 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500/40 shadow-inner transition-all"
            />
          </div>
          <p className="text-[11px] text-slate-400 font-mono">
            Supported formats: Domain URL, IPv4/IPv6, CIDR Network, or Local Source Directory (for Bandit).
          </p>
        </div>

        {/* Scanner Selection Cards Grid */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Select Security Scanners</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scannerOptions.map((s) => (
              <ScanCard
                key={s.id}
                scanner={s}
                selected={selectedScanners.includes(s.id)}
                onToggle={() => handleToggleScanner(s.id)}
              />
            ))}
          </div>
        </div>

        {/* Checkbox Summary */}
        <div className="glass-panel p-4 rounded-xl border border-slate-800 flex flex-wrap gap-6 items-center text-xs font-mono">
          <span className="text-slate-400 font-bold">Active Selection:</span>
          {scannerOptions.map((s) => (
            <label key={s.id} className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-cyan-400">
              <input
                type="checkbox"
                checked={selectedScanners.includes(s.id)}
                onChange={() => handleToggleScanner(s.id)}
                className="w-4 h-4 rounded accent-cyan-500 bg-slate-900 border-slate-700"
              />
              <span>{s.id}</span>
            </label>
          ))}
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 hover:from-cyan-300 hover:to-indigo-500 text-slate-950 font-extrabold text-sm tracking-wider uppercase shadow-[0_0_25px_rgba(56,189,248,0.35)] transition-all flex items-center justify-center gap-3"
          >
            <Play className="w-5 h-5 fill-slate-950" />
            {loading ? 'INITIALIZING SCAN...' : 'START SECURITY SCAN'}
          </button>
        </div>
      </form>

      {/* Confirmation Modal Dialog */}
      <ConfirmationModal
        isOpen={isModalOpen}
        target={target}
        scanners={selectedScanners}
        onConfirm={handleConfirmScan}
        onCancel={() => setIsModalOpen(false)}
      />
    </div>
  );
}
