import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  XCircle, 
  AlertTriangle, 
  HelpCircle, 
  User, 
  ShieldCheck, 
  Building2, 
  Wallet, 
  Crown,
  ChevronRight
} from 'lucide-react';
import { formatDate, getRoleLabel } from '../utils/formatters';

export default function ApprovalTimeline({ steps = [], currentStepIndex = 0, status, isEscalated, isDelayed }) {
  const getRoleIcon = (role) => {
    switch (role?.toLowerCase()) {
      case 'manager':
        return User;
      case 'department_head':
        return Building2;
      case 'finance':
        return Wallet;
      case 'admin':
        return Crown;
      default:
        return ShieldCheck;
    }
  };

  return (
    <div className="w-full">
      {/* Horizontal Desktop View */}
      <div className="hidden md:flex items-center justify-between relative py-6 px-4">
        {/* Connector Line behind steps */}
        <div className="absolute top-1/2 left-10 right-10 -translate-y-6 h-0.5 bg-slate-200 dark:bg-slate-800 -z-0" />

        {steps.map((step, idx) => {
          const StepIcon = getRoleIcon(step.role);
          const isDone = step.status === 'Approved';
          const isCurrent = idx === currentStepIndex && status !== 'Approved' && status !== 'Rejected';
          const isRejected = step.status === 'Rejected' || (status === 'Rejected' && idx === currentStepIndex);
          const isStepEscalated = step.status === 'Escalated' || (isCurrent && (isEscalated || isDelayed));
          const isInfoNeeded = step.status === 'More Information Required';
          const isPending = idx > currentStepIndex && status !== 'Approved';

          let circleBg = 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-400';
          let ringEffect = '';

          if (isDone) {
            circleBg = 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/20';
          } else if (isRejected) {
            circleBg = 'bg-rose-500 border-rose-500 text-white shadow-md shadow-rose-500/20';
          } else if (isStepEscalated) {
            circleBg = 'bg-red-600 border-red-600 text-white shadow-md shadow-red-500/30';
            ringEffect = 'ring-4 ring-red-400/30 animate-pulse';
          } else if (isInfoNeeded) {
            circleBg = 'bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-500/20';
            ringEffect = 'ring-4 ring-orange-400/20';
          } else if (isCurrent) {
            circleBg = 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/30';
            ringEffect = 'ring-4 ring-indigo-400/30 animate-pulse-subtle';
          }

          return (
            <div key={idx} className="relative z-10 flex flex-col items-center group flex-1 max-w-[200px] text-center">
              {/* Step Node Icon */}
              <div className={`w-12 h-12 rounded-2xl border-2 flex items-center justify-center transition-all duration-300 ${circleBg} ${ringEffect}`}>
                {isDone ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : isRejected ? (
                  <XCircle className="w-6 h-6" />
                ) : isStepEscalated ? (
                  <AlertTriangle className="w-6 h-6" />
                ) : isInfoNeeded ? (
                  <HelpCircle className="w-6 h-6" />
                ) : (
                  <StepIcon className="w-5 h-5" />
                )}
              </div>

              {/* Step Title & Details */}
              <div className="mt-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Tier {step.stepOrder} • {getRoleLabel(step.role)}
                </span>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 line-clamp-1">
                  {step.title}
                </p>

                {/* Status Indicator text */}
                <div className="mt-1">
                  {isDone ? (
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                      ✓ Approved by {step.actorName || 'Approver'}
                    </span>
                  ) : isRejected ? (
                    <span className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                      ✗ Rejected
                    </span>
                  ) : isStepEscalated ? (
                    <span className="text-xs text-red-600 dark:text-red-400 font-bold animate-pulse">
                      🚨 Escalated
                    </span>
                  ) : isInfoNeeded ? (
                    <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                      ❓ Info Requested
                    </span>
                  ) : isCurrent ? (
                    <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                      ● Active Review
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      Pending previous
                    </span>
                  )}
                </div>

                {step.actedAt && (
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                    {formatDate(step.actedAt)}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Vertical Mobile & Detailed View */}
      <div className="md:hidden space-y-4">
        {steps.map((step, idx) => {
          const StepIcon = getRoleIcon(step.role);
          const isDone = step.status === 'Approved';
          const isCurrent = idx === currentStepIndex && status !== 'Approved' && status !== 'Rejected';
          const isRejected = step.status === 'Rejected';
          const isStepEscalated = step.status === 'Escalated' || (isCurrent && isEscalated);

          return (
            <div key={idx} className="flex gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className={`w-9 h-9 shrink-0 rounded-xl flex items-center justify-center text-white ${
                isDone ? 'bg-emerald-500' : isRejected ? 'bg-rose-500' : isStepEscalated ? 'bg-red-600' : isCurrent ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}>
                {isDone ? <CheckCircle2 className="w-5 h-5" /> : <StepIcon className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase">Tier {step.stepOrder}</span>
                  <span className="text-xs font-medium text-slate-500">{getRoleLabel(step.role)}</span>
                </div>
                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{step.title}</h4>
                {step.comment && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 italic bg-slate-50 dark:bg-slate-800 p-2 rounded-lg border border-slate-100 dark:border-slate-700">
                    "{step.comment}"
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
