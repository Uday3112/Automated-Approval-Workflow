import React from 'react';
import { useNotifications } from '../context/NotificationContext';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';

export default function ToastContainer() {
  const { toasts, removeToast } = useNotifications();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';
        const isWarning = toast.type === 'warning';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-xl transition-all duration-300 backdrop-blur-md ${
              isSuccess
                ? 'bg-emerald-900/90 text-white border-emerald-700'
                : isError
                ? 'bg-rose-900/90 text-white border-rose-700'
                : isWarning
                ? 'bg-amber-900/90 text-white border-amber-700'
                : 'bg-slate-900/90 text-white border-slate-700'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-300" />}
              {isError && <XCircle className="w-5 h-5 text-rose-300" />}
              {isWarning && <AlertTriangle className="w-5 h-5 text-amber-300" />}
              {!isSuccess && !isError && !isWarning && <Info className="w-5 h-5 text-blue-300" />}
            </div>
            <div className="flex-1 min-w-0">
              {toast.title && <h5 className="text-sm font-bold text-white mb-0.5">{toast.title}</h5>}
              <p className="text-xs text-slate-100/90 leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
