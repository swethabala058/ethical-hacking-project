import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Notification from './components/Notification';

import Dashboard from './pages/Dashboard';
import NewScan from './pages/NewScan';
import ScanProgressPage from './pages/ScanProgressPage';
import Results from './pages/Results';
import History from './pages/History';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';

export default function App() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState({ name: 'Security Admin', email: 'admin@security.local' });
  const [toasts, setToasts] = useState([
    { id: 1, type: 'success', title: 'SOC Engine Online', message: 'Backend connected on http://127.0.0.1:8000' }
  ]);

  const notifications = [
    { id: 1, type: 'warning', title: 'Critical Finding Discovered', message: 'SQL Injection detected on /login', time: '10m ago' },
    { id: 2, type: 'success', title: 'Scan #1024 Completed', message: 'Target 192.168.1.10 fully audited', time: '1h ago' }
  ];

  const addToast = (toast) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, ...toast }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <Router>
      <div className="min-h-screen flex bg-[#090d16] text-slate-100 font-sans antialiased">
        <Routes>
          {/* Public Auth Routes */}
          <Route 
            path="/login" 
            element={<Login onLoginSuccess={(token, u) => setUser(u)} addToast={addToast} />} 
          />
          <Route 
            path="/register" 
            element={<Register onLoginSuccess={(token, u) => setUser(u)} addToast={addToast} />} 
          />

          {/* Main SOC Dashboard Shell */}
          <Route
            path="/*"
            element={
              <div className="flex w-full min-h-screen overflow-x-hidden">
                <Sidebar
                  collapsed={collapsed}
                  setCollapsed={setCollapsed}
                  mobileOpen={mobileOpen}
                  setMobileOpen={setMobileOpen}
                  user={user}
                  onLogout={handleLogout}
                />

                <div className="flex-1 flex flex-col min-w-0">
                  <Navbar
                    onMobileMenuClick={() => setMobileOpen(true)}
                    notifications={notifications}
                    user={user}
                  />

                  <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/scan" element={<NewScan addToast={addToast} />} />
                      <Route path="/progress/:scanId" element={<ScanProgressPage addToast={addToast} />} />
                      <Route path="/results/:scanId" element={<Results />} />
                      <Route path="/results" element={<Results />} />
                      <Route path="/history" element={<History addToast={addToast} />} />
                      <Route path="/reports" element={<Reports />} />
                      <Route path="/settings" element={<Settings addToast={addToast} />} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </main>
                </div>
              </div>
            }
          />
        </Routes>

        {/* Global Toast Notifications */}
        <Notification toasts={toasts} onClose={removeToast} />
      </div>
    </Router>
  );
}
