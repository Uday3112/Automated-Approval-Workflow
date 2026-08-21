import React from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  HelpCircle, 
  ArrowUpRight, 
  FileEdit,
  ShieldAlert,
  Send
} from 'lucide-react';

export default function StatusBadge({ status, size = 'md' }) {
  const s = status || 'Submitted';

  const sizeClasses = size === 'sm' 
    ? 'px-2 py-0.5 text-xs' 
    : size === 'lg' 
    ? 'px-3.5 py-1.5 text-sm' 
    : 'px-2.5 py-1 text-xs font-medium';

  const getStatusConfig = () => {
    switch (s) {
      case 'Approved':
        return {
          icon: CheckCircle2,
          text: 'Approved',
          classes: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
        };
      case 'Rejected':
        return {
          icon: XCircle,
          text: 'Rejected',
          classes: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
        };
      case 'Pending Manager Approval':
        return {
          icon: Clock,
          text: 'Pending Manager',
          classes: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
        };
      case 'Pending Department Head Approval':
        return {
          icon: Clock,
          text: 'Pending Dept Head',
          classes: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800'
        };
      case 'Pending Finance Approval':
        return {
          icon: Clock,
          text: 'Pending Finance',
          classes: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800'
        };
      case 'Pending Admin Approval':
        return {
          icon: Clock,
          text: 'Pending Admin',
          classes: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800'
        };
      case 'More Information Required':
        return {
          icon: HelpCircle,
          text: 'Info Required',
          classes: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800'
        };
      case 'Escalated':
      case 'Delayed':
      case 'SLA Breached':
        return {
          icon: ShieldAlert,
          text: s === 'Escalated' ? 'Escalated' : s === 'Delayed' ? 'Delayed' : 'SLA Breached',
          classes: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800 animate-pulse'
        };
      case 'Draft':
        return {
          icon: FileEdit,
          text: 'Draft',
          classes: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
        };
      case 'Submitted':
      default:
        return {
          icon: Send,
          text: s,
          classes: 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${sizeClasses} ${config.classes} font-medium whitespace-nowrap shadow-xs`}>
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span>{config.text}</span>
    </span>
  );
}
