import React, { useState } from 'react';
import { Save, Server, Clock, Bell, Moon, Sun, Shield } from 'lucide-react';

export default function Settings({ addToast }) {
  const [backendUrl, setBackendUrl] = useState('http://127.0.0.1:8000');
  const [timeout, setTimeoutVal] = useState('300');
  const [theme, setTheme] = useState('dark');
  const [notifications, setNotifications] = useState(true);

  const handleSave = (e) => {
    e.preventDefault();
    addToast?.({ type: 'success', title: 'Settings Saved', message: 'SOC Scanner preferences updated.' });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">Scanner Settings</h1>
        <p className="text-xs text-slate-400 font-mono mt-1">Configure backend API connection, timeout rules, and visual theme</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Backend Config */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-3 text-cyan-400 pb-3 border-b border-slate-800">
            <Server className="w-5 h-5" />
            <h3 className="font-bold text-sm text-slate-100 uppercase tracking-wider">Backend API Connection</h3>
          </div>

          <div className="space-y-2 font-mono text-xs">
            <label className="block text-slate-400 font-bold">Backend Service Base URL</label>
            <input
              type="text"
              value={backendUrl}
              onChange={(e) => setBackendUrl(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="space-y-2 font-mono text-xs">
            <label className="block text-slate-400 font-bold">Default Scanner Timeout (Seconds)</label>
            <input
              type="number"
              value={timeout}
              onChange={(e) => setTimeoutVal(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Preferences */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-3 text-cyan-400 pb-3 border-b border-slate-800">
            <Bell className="w-5 h-5" />
            <h3 className="font-bold text-sm text-slate-100 uppercase tracking-wider">Notification Preferences</h3>
          </div>

          <div className="flex items-center justify-between font-mono text-xs py-2">
            <div>
              <span className="font-bold text-slate-200 block">Toast Notifications</span>
              <span className="text-slate-500 text-[11px]">Display alerts on scan updates</span>
            </div>
            <input
              type="checkbox"
              checked={notifications}
              onChange={(e) => setNotifications(e.target.checked)}
              className="w-5 h-5 rounded accent-cyan-500 bg-slate-900 border-slate-700"
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-extrabold text-xs tracking-wider uppercase shadow-[0_0_20px_rgba(56,189,248,0.3)] transition-all flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" /> Save Configuration
        </button>
      </form>
    </div>
  );
}
