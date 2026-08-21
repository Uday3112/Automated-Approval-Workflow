import React, { useState, useEffect } from 'react';
import { Timer, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function SLACountdown({ deadline, status, isCompleted = false, isDelayed = false }) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0, isExpired: false, text: '' });

  useEffect(() => {
    if (isCompleted || status === 'Approved' || status === 'Rejected') {
      return;
    }

    function calculateTime() {
      if (!deadline) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, isExpired: false, text: 'No SLA' });
        return;
      }

      const target = new Date(deadline).getTime();
      const now = new Date().getTime();
      const diff = target - now;

      if (diff <= 0 || isDelayed) {
        const overtime = Math.abs(diff);
        const overHours = Math.floor(overtime / (1000 * 60 * 60));
        const overMins = Math.floor((overtime % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft({
          hours: overHours,
          minutes: overMins,
          seconds: 0,
          isExpired: true,
          text: `Breached (+${overHours}h ${overMins}m)`
        });
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({
        hours,
        minutes,
        seconds,
        isExpired: false,
        text: hours > 0 ? `${hours}h ${minutes}m left` : `${minutes}m ${seconds}s left`
      });
    }

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [deadline, isCompleted, status, isDelayed]);

  if (isCompleted || status === 'Approved' || status === 'Rejected') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span>SLA Met</span>
      </span>
    );
  }

  if (timeLeft.isExpired || isDelayed) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-800 animate-pulse">
        <AlertTriangle className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
        <span>{timeLeft.text || 'SLA Breached'}</span>
      </span>
    );
  }

  // Warning when less than 4 hours left
  const isUrgent = timeLeft.hours < 4;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${
      isUrgent 
        ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800' 
        : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
    }`}>
      <Timer className={`w-3.5 h-3.5 ${isUrgent ? 'text-amber-500 animate-spin-slow' : 'text-slate-400'}`} />
      <span>{timeLeft.text}</span>
    </span>
  );
}
