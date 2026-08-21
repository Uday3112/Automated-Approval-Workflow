import React from 'react';
import { X, FileText, Download, CheckCircle2, ShieldCheck } from 'lucide-react';
import { formatDate } from '../utils/formatters';

export default function DocumentViewerModal({ isOpen, onClose, document }) {
  if (!isOpen || !document) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{document.name}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{document.size} • Uploaded {formatDate(document.uploadedAt)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => alert(`Simulated downloading: ${document.name}`)}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
              title="Download File"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Document Preview Body */}
        <div className="p-6 flex-1 overflow-y-auto bg-slate-100 dark:bg-slate-950 flex flex-col items-center justify-center min-h-[320px]">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center mb-4 border border-indigo-100 dark:border-indigo-900">
              <FileText className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">{document.name}</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Enterprise Authenticated PDF Document ({document.size})</p>
            
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300 flex items-center justify-center gap-2 mb-4">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Cryptographically signed & verified for audit compliance</span>
            </div>

            <button
              onClick={() => alert(`Simulated downloading ${document.name}`)}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download Attachment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
