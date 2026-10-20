import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Notification({ toasts, onClose }) {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success';
          const isWarning = toast.type === 'warning';
          const isError = toast.type === 'error';

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`
                pointer-events-auto p-4 rounded-2xl border backdrop-blur-xl shadow-2xl flex items-start gap-3
                ${isSuccess ? 'bg-slate-950/90 border-emerald-500/40 text-emerald-300' : ''}
                ${isWarning ? 'bg-slate-950/90 border-amber-500/40 text-amber-300' : ''}
                ${isError ? 'bg-slate-950/90 border-rose-500/40 text-rose-300' : ''}
                ${!isSuccess && !isWarning && !isError ? 'bg-slate-950/90 border-cyan-500/40 text-cyan-300' : ''}
              `}
            >
              {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />}
              {isWarning && <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />}
              {isError && <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />}
              {!isSuccess && !isWarning && !isError && <Info className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />}

              <div className="flex-1 text-xs">
                <p className="font-bold text-slate-100">{toast.title}</p>
                <p className="text-slate-300 mt-0.5">{toast.message}</p>
              </div>

              <button
                onClick={() => onClose(toast.id)}
                className="text-slate-500 hover:text-slate-300 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
