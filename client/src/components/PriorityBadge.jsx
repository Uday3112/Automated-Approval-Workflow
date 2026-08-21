import React from 'react';
import { Flame, AlertCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function PriorityBadge({ priority, showIcon = true, size = 'md' }) {
  const p = priority || 'Medium';

  const sizeClasses = size === 'sm'
    ? 'px-2 py-0.5 text-xs'
    : size === 'lg'
    ? 'px-3 py-1 text-sm'
    : 'px-2.5 py-0.5 text-xs font-semibold';

  const getPriorityConfig = () => {
    switch (p) {
      case 'Critical':
        return {
          icon: Flame,
          label: 'Critical',
          classes: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30 ring-1 ring-red-500/20'
        };
      case 'High':
        return {
          icon: AlertCircle,
          label: 'High',
          classes: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
        };
      case 'Medium':
        return {
          icon: ArrowUpRight,
          label: 'Medium',
          classes: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30'
        };
      case 'Low':
      default:
        return {
          icon: ArrowDownRight,
          label: 'Low',
          classes: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20'
        };
    }
  };

  const config = getPriorityConfig();
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 rounded-md border ${sizeClasses} ${config.classes}`}>
      {showIcon && <Icon className={`w-3.5 h-3.5 ${p === 'Critical' ? 'animate-bounce text-red-500' : ''}`} />}
      <span>{config.label}</span>
    </span>
  );
}
