import React from 'react';
import { FileText, Download, Eye, ShieldAlert, Award } from 'lucide-react';
import { mockReports } from '../services/mockData';
import { apiService } from '../services/api';

export default function Reports() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">Security Audit Reports</h1>
        <p className="text-xs text-slate-400 font-mono mt-1">Generated executive vulnerability summaries and PDF reports</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockReports.map((report) => (
          <div key={report.id} className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-cyan-400 font-bold">REPORT #{report.id}</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${report.risk === 'HIGH' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'}`}>
                  RISK: {report.risk}
                </span>
              </div>

              <h3 className="font-extrabold text-slate-100 text-lg font-mono mt-3">{report.target}</h3>

              <div className="mt-4 space-y-1.5 text-xs font-mono text-slate-400">
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span>Total Findings:</span>
                  <span className="text-rose-400 font-bold">{report.findings}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span>Scanners Used:</span>
                  <span className="text-slate-200">{report.scanners}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Generated Date:</span>
                  <span className="text-slate-300">{report.date}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-4 border-t border-slate-800">
              <a
                href={apiService.getHtmlReportUrl(report.id)}
                target="_blank"
                rel="noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-xs font-mono font-bold text-slate-300 hover:text-cyan-400 transition-all"
              >
                <Eye className="w-4 h-4" /> View
              </a>
              <a
                href={apiService.getPdfReportUrl(report.id)}
                download
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-xs font-mono font-bold text-slate-950 shadow-[0_0_15px_rgba(56,189,248,0.3)] transition-all"
              >
                <Download className="w-4 h-4" /> PDF
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
