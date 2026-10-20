import React from 'react';
import { AlertTriangle, ShieldCheck, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ConfirmationModal({ isOpen, target, scanners, onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="glass-panel w-full max-w-md p-6 rounded-2xl border border-slate-700 shadow-2xl relative"
        >
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 text-slate-500 hover:text-slate-300"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 text-amber-400 mb-4">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100">Authorization Required</h3>
              <span className="text-xs text-amber-400 font-mono">Explicit Consent Verification</span>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/80 p-3 rounded-xl border border-slate-800 font-mono">
            Only scan systems that you own or have explicit permission to test. Unauthorized security testing may violate local computer misuse regulations.
          </p>

          <div className="mt-4 space-y-2 text-xs font-mono">
            <div className="flex justify-between py-1 border-b border-slate-800 text-slate-400">
              <span>Target:</span>
              <span className="text-cyan-400 font-bold">{target}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800 text-slate-400">
              <span>Active Scanners:</span>
              <span className="text-slate-200">{scanners.join(', ')}</span>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 shadow-[0_0_15px_rgba(56,189,248,0.3)] transition-all"
            >
              <ShieldCheck className="w-4 h-4" />
              I Have Authorization
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
