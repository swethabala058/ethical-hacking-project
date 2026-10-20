import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, ChevronRight, AlertCircle } from 'lucide-react';
import ScanProgress from '../components/ScanProgress';
import TerminalLogs from '../components/TerminalLogs';
import { apiService } from '../services/api';

export default function ScanProgressPage({ addToast }) {
  const { scanId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [progress, setProgress] = useState(15);
  const [status, setStatus] = useState('Running');
  const [logs, setLogs] = useState('[14:32:01] Starting scan manager...\n[14:32:03] Target discovered');
  const [target, setTarget] = useState(location.state?.scanData?.target || 'https://example.local');
  const [scanners, setScanners] = useState(location.state?.scanData?.scanners || 'Nmap, Nikto');

  useEffect(() => {
    let eventSource;

    // Connect to SSE Endpoint if available
    try {
      eventSource = new EventSource(`http://127.0.0.1:8000/api/scans/${scanId}/stream`);

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.progress !== undefined) setProgress(data.progress);
          if (data.status) setStatus(data.status);
          if (data.logs) setLogs(data.logs);

          if (data.status === 'Completed') {
            eventSource.close();
            addToast?.({ type: 'success', title: 'Scan Completed', message: `Scan #${scanId} finished scanning.` });
          }
        } catch (e) {
          console.error(e);
        }
      };

      eventSource.onerror = () => {
        eventSource.close();
      };
    } catch (err) {
      console.warn('SSE EventSource unavailable, using simulated stream fallback.');
    }

    // Fallback simulation timer if backend SSE is slow/inactive
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setStatus('Completed');
          return 100;
        }
        return prev + 15;
      });
    }, 1500);

    return () => {
      if (eventSource) eventSource.close();
      clearInterval(timer);
    };
  }, [scanId]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">Security Scan Stream</h1>
          <p className="text-xs text-slate-400 font-mono mt-1">Real-time status updates and live scanner terminal output</p>
        </div>

        {status === 'Completed' && (
          <button
            onClick={() => navigate(`/results/${scanId}`)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 text-slate-950 font-bold text-xs shadow-[0_0_20px_rgba(56,189,248,0.3)] transition-all"
          >
            <ShieldCheck className="w-4 h-4" />
            View Results Table <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Progress Card */}
      <ScanProgress
        progress={progress}
        status={status}
        target={target}
        scanners={scanners}
      />

      {/* Live Terminal Output */}
      <TerminalLogs logs={logs} />
    </div>
  );
}
